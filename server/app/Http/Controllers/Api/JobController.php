<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\JobListing;
use App\Models\Recruiter;
use App\Models\Student;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class JobController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $user = $request->user();
        $page = max(1, (int) $request->input('page', 1));
        $limit = min(100, max(1, (int) $request->input('limit', 10)));

        $query = JobListing::with(['recruiter', 'skills', 'departments'])
            ->withCount('applications as applicant_count');

        if ($user->role === 'recruiter') {
            $recruiter = Recruiter::where('user_id', $user->id)->first();
            if (!$recruiter) {
                return $this->fail('Recruiter profile not found.', 404);
            }
            $query->where('recruiter_id', $recruiter->id);
        } else {
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            } elseif ($user->role === 'student') {
                $query->where('status', 'open');
            }
        }

        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $query->where(function ($q) use ($term) {
                $q->where('title', 'like', $term)
                    ->orWhere('description', 'like', $term)
                    ->orWhereHas('recruiter', fn ($r) => $r->where('company_name', 'like', $term));
            });
        }

        if ($request->filled('job_type')) {
            $query->where('job_type', $request->job_type);
        }

        if ($request->filled('location')) {
            $query->where('location', 'like', '%' . $request->location . '%');
        }

        if ($request->filled('department_id')) {
            $deptId = (int) $request->department_id;
            $query->whereHas('departments', fn ($d) => $d->where('departments.id', $deptId));
        }

        $total = $query->count();
        $jobs = $query->orderByDesc('created_at')
            ->forPage($page, $limit)
            ->get();

        // Student-specific eligibility overlay
        $student = null;
        $studentSkillIds = [];
        if ($user->role === 'student') {
            $student = Student::where('user_id', $user->id)->first();
            if ($student) {
                $studentSkillIds = $student->skills()->pluck('skills.id')->toArray();
            }
        }

        $jobsArray = $jobs->map(function (JobListing $job) use ($student, $studentSkillIds) {
            $data = $job->toArray();
            $data['company_name'] = $job->recruiter->company_name;
            $data['company_logo'] = $job->recruiter->logo;
            $data['required_skills'] = $job->skills->map(fn ($s) => ['id' => $s->id, 'name' => $s->name])->values();
            $data['eligible_departments'] = $job->departments->map(fn ($d) => ['id' => $d->id, 'name' => $d->name])->values();

            if ($student) {
                $deptIds = $job->departments->pluck('id')->toArray();
                $requiredSkillIds = $job->skills->pluck('id')->toArray();

                $cgpaOk = (float) $student->cgpa >= (float) $job->min_cgpa;
                $backlogOk = (int) $student->backlogs <= (int) $job->max_backlogs;
                $deptOk = empty($deptIds) || in_array($student->department_id, $deptIds);
                $skillsOk = empty($requiredSkillIds) || count(array_intersect($requiredSkillIds, $studentSkillIds)) > 0;

                $data['is_eligible'] = $cgpaOk && $backlogOk && $deptOk && $skillsOk;
                $data['eligibility_reasons'] = array_values(array_filter([
                    !$cgpaOk ? 'CGPA below requirement' : null,
                    !$backlogOk ? 'Too many active backlogs' : null,
                    !$deptOk ? 'Department not eligible' : null,
                    !$skillsOk ? 'None of the required skills found on your profile' : null,
                ]));

                $existingApp = Application::where('job_id', $job->id)->where('student_id', $student->id)->first();
                $data['application_status'] = $existingApp->status ?? null;
            }

            return $data;
        });

        return $this->ok([
            'jobs' => $jobsArray,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'total_pages' => (int) ceil($total / $limit),
            ],
        ], 'OK');
    }

    public function show(Request $request, int $id)
    {
        $job = JobListing::with(['recruiter', 'skills', 'departments'])->find($id);
        if (!$job) {
            return $this->fail('Job not found.', 404);
        }

        $data = $job->toArray();
        $data['company_name'] = $job->recruiter->company_name;
        $data['company_logo'] = $job->recruiter->logo;
        $data['company_website'] = $job->recruiter->company_website;
        $data['company_description'] = $job->recruiter->company_description;
        $data['required_skills'] = $job->skills->map(fn ($s) => ['id' => $s->id, 'name' => $s->name])->values();
        $data['eligible_departments'] = $job->departments->map(fn ($d) => ['id' => $d->id, 'name' => $d->name])->values();

        if ($request->user()->role === 'student') {
            $student = Student::where('user_id', $request->user()->id)->first();
            if ($student) {
                $existingApp = Application::where('job_id', $job->id)->where('student_id', $student->id)->first();
                $data['application_status'] = $existingApp->status ?? null;
            }
        }

        return $this->ok($data, 'OK');
    }

    public function store(Request $request)
    {
        $recruiter = Recruiter::where('user_id', $request->user()->id)->first();
        if (!$recruiter) {
            return $this->fail('Recruiter profile not found.', 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:150',
            'description' => 'required|string',
            'job_type' => 'required|in:full-time,internship,part-time,contract',
            'min_cgpa' => 'nullable|numeric|min:0|max:10',
            'department_ids' => 'nullable|array',
            'skill_ids' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return $this->fail('Validation failed.', 422, $validator->errors());
        }

        $job = JobListing::create([
            'recruiter_id' => $recruiter->id,
            'title' => $request->title,
            'description' => $request->description,
            'job_type' => $request->job_type,
            'location' => $request->location,
            'salary_min' => $request->salary_min,
            'salary_max' => $request->salary_max,
            'min_cgpa' => $request->min_cgpa ?? 0,
            'max_backlogs' => $request->max_backlogs ?? 0,
            'openings' => $request->openings ?? 1,
            'application_deadline' => $request->application_deadline,
            'status' => $request->status ?? 'open',
        ]);

        if (!empty($request->department_ids)) {
            $job->departments()->attach($request->department_ids);
        }
        if (!empty($request->skill_ids)) {
            $job->skills()->attach($request->skill_ids);
        }

        return $this->ok(['job_id' => $job->id], 'Job posted successfully.', 201);
    }

    public function update(Request $request, int $id)
    {
        $recruiter = Recruiter::where('user_id', $request->user()->id)->first();
        if (!$recruiter) {
            return $this->fail('Recruiter profile not found.', 404);
        }

        $job = JobListing::where('id', $id)->where('recruiter_id', $recruiter->id)->first();
        if (!$job) {
            return $this->fail('Job not found or you do not have permission to edit it.', 404);
        }

        $job->update([
            'title' => $request->title,
            'description' => $request->description,
            'job_type' => $request->job_type,
            'location' => $request->location,
            'salary_min' => $request->salary_min,
            'salary_max' => $request->salary_max,
            'min_cgpa' => $request->min_cgpa ?? 0,
            'max_backlogs' => $request->max_backlogs ?? 0,
            'openings' => $request->openings ?? 1,
            'application_deadline' => $request->application_deadline,
            'status' => $request->status ?? 'open',
        ]);

        if ($request->has('department_ids')) {
            $job->departments()->sync($request->department_ids ?? []);
        }
        if ($request->has('skill_ids')) {
            $job->skills()->sync($request->skill_ids ?? []);
        }

        return $this->ok(null, 'Job updated successfully.');
    }

    public function destroy(Request $request, int $id)
    {
        $user = $request->user();
        $job = JobListing::find($id);
        if (!$job) {
            return $this->fail('Job not found.', 404);
        }

        if ($user->role === 'recruiter') {
            $recruiter = Recruiter::where('user_id', $user->id)->first();
            if (!$recruiter || $job->recruiter_id !== $recruiter->id) {
                return $this->fail('Job not found or you do not have permission to delete it.', 404);
            }
        }

        $job->delete();

        return $this->ok(null, 'Job deleted successfully.');
    }

    public function eligibility(Request $request, int $id)
    {
        $student = Student::where('user_id', $request->user()->id)->first();
        if (!$student) {
            return $this->fail('Student profile not found.', 404);
        }

        $job = JobListing::with(['skills', 'departments'])->find($id);
        if (!$job) {
            return $this->fail('Job not found.', 404);
        }

        $eligibleDeptIds = $job->departments->pluck('id')->toArray();
        $requiredSkills = $job->skills->map(fn ($s) => ['id' => $s->id, 'name' => $s->name])->values();
        $requiredSkillIds = $job->skills->pluck('id')->toArray();
        $mySkillIds = $student->skills()->pluck('skills.id')->toArray();

        $checks = [
            'cgpa' => [
                'required' => (float) $job->min_cgpa,
                'actual' => (float) $student->cgpa,
                'passed' => (float) $student->cgpa >= (float) $job->min_cgpa,
            ],
            'backlogs' => [
                'max_allowed' => (int) $job->max_backlogs,
                'actual' => (int) $student->backlogs,
                'passed' => (int) $student->backlogs <= (int) $job->max_backlogs,
            ],
            'department' => [
                'eligible_departments' => $eligibleDeptIds,
                'your_department' => $student->department_id,
                'passed' => empty($eligibleDeptIds) || in_array($student->department_id, $eligibleDeptIds),
            ],
            'skills' => [
                'required_skills' => $requiredSkills,
                'matched_count' => count(array_intersect($requiredSkillIds, $mySkillIds)),
                'passed' => empty($requiredSkillIds) || count(array_intersect($requiredSkillIds, $mySkillIds)) > 0,
            ],
        ];

        $isEligible = $checks['cgpa']['passed'] && $checks['backlogs']['passed']
            && $checks['department']['passed'] && $checks['skills']['passed'];

        return $this->ok(['is_eligible' => $isEligible, 'checks' => $checks], 'OK');
    }
}
