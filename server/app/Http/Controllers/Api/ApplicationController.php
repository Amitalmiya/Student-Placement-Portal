<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\Application;
use App\Models\ApplicationStatusHistory;
use App\Models\JobListing;
use App\Models\Recruiter;
use App\Models\Student;
use App\Traits\ApiResponse;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ApplicationController extends Controller
{
    use ApiResponse;

    public function store(Request $request)
    {
        $student = Student::where('user_id', $request->user()->id)->first();
        if (!$student) {
            return $this->fail('Student profile not found.', 404);
        }

        $jobId = (int) $request->input('job_id');
        if (!$jobId) {
            return $this->fail('job_id is required.', 422);
        }

        $job = JobListing::with(['skills', 'departments'])->find($jobId);
        if (!$job) {
            return $this->fail('Job not found.', 404);
        }
        if ($job->status !== 'open') {
            return $this->fail('This job is not currently accepting applications.', 400);
        }
        if ($job->application_deadline && $job->application_deadline->lt(now()->startOfDay())) {
            return $this->fail('The application deadline for this job has passed.', 400);
        }

        // --- Server-side eligibility re-check — never trust the client ---
        $eligibleDeptIds = $job->departments->pluck('id')->toArray();
        $requiredSkillIds = $job->skills->pluck('id')->toArray();
        $mySkillIds = $student->skills()->pluck('skills.id')->toArray();

        $cgpaOk = (float) $student->cgpa >= (float) $job->min_cgpa;
        $backlogOk = (int) $student->backlogs <= (int) $job->max_backlogs;
        $deptOk = empty($eligibleDeptIds) || in_array($student->department_id, $eligibleDeptIds);
        $skillsOk = empty($requiredSkillIds) || count(array_intersect($requiredSkillIds, $mySkillIds)) > 0;

        if (!($cgpaOk && $backlogOk && $deptOk && $skillsOk)) {
            return $this->fail('You do not meet the eligibility criteria for this job.', 403);
        }

        $resume = $student->resumes()->where('is_primary', true)->first();
        if (!$resume) {
            return $this->fail('Please upload a resume before applying.', 400);
        }

        try {
            $applicationId = DB::transaction(function () use ($job, $student, $resume, $request) {
                $application = Application::create([
                    'job_id' => $job->id,
                    'student_id' => $student->id,
                    'resume_id' => $resume->id,
                    'cover_letter' => $request->cover_letter,
                    'status' => 'applied',
                    'applied_at' => now(),
                ]);

                ApplicationStatusHistory::create([
                    'application_id' => $application->id,
                    'status' => 'applied',
                    'changed_by' => $request->user()->id,
                    'remarks' => 'Application submitted',
                    'changed_at' => now(),
                ]);

                $recruiterUserId = $job->recruiter->user_id;
                AppNotification::create([
                    'user_id' => $recruiterUserId,
                    'title' => 'New Application Received',
                    'message' => "{$student->full_name} applied for {$job->title}.",
                    'link' => "/recruiter/jobs/{$job->id}/applicants",
                    'created_at' => now(),
                ]);

                return $application->id;
            });
        } catch (QueryException $e) {
            if ($e->getCode() === '23000') {
                return $this->fail('You have already applied for this job.', 409);
            }
            return $this->fail('Failed to submit application: ' . $e->getMessage(), 500);
        }

        return $this->ok(['application_id' => $applicationId], 'Application submitted successfully.', 201);
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $page = max(1, (int) $request->input('page', 1));
        $limit = min(100, max(1, (int) $request->input('limit', 10)));

        $query = Application::with(['job.recruiter', 'student', 'resume']);

        if ($user->role === 'student') {
            $student = Student::where('user_id', $user->id)->first();
            $query->where('student_id', $student->id ?? 0);
        } elseif ($user->role === 'recruiter') {
            $recruiter = Recruiter::where('user_id', $user->id)->first();
            $query->whereHas('job', fn ($j) => $j->where('recruiter_id', $recruiter->id ?? 0));
            if ($request->filled('job_id')) {
                $query->where('job_id', (int) $request->job_id);
            }
        } else {
            // admin
            if ($request->filled('job_id')) {
                $query->where('job_id', (int) $request->job_id);
            }
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $total = $query->count();
        $applications = $query->orderByDesc('applied_at')->forPage($page, $limit)->get();

        $shaped = $applications->map(function (Application $a) {
            return [
                'id' => $a->id,
                'job_id' => $a->job_id,
                'student_id' => $a->student_id,
                'resume_id' => $a->resume_id,
                'cover_letter' => $a->cover_letter,
                'status' => $a->status,
                'applied_at' => $a->applied_at,
                'updated_at' => $a->updated_at,
                'job_title' => $a->job->title ?? null,
                'recruiter_id' => $a->job->recruiter_id ?? null,
                'student_name' => $a->student->full_name ?? null,
                'roll_number' => $a->student->roll_number ?? null,
                'cgpa' => $a->student->cgpa ?? null,
                'department_id' => $a->student->department_id ?? null,
                'company_name' => $a->job->recruiter->company_name ?? null,
                'resume_path' => $a->resume->file_path ?? null,
                'resume_name' => $a->resume->file_name ?? null,
            ];
        });

        return $this->ok([
            'applications' => $shaped,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'total_pages' => (int) ceil($total / $limit),
            ],
        ], 'OK');
    }

    public function updateStatus(Request $request, int $id)
    {
        $validStatuses = ['applied', 'shortlisted', 'interview', 'selected', 'rejected'];
        $newStatus = $request->input('status');

        if (!in_array($newStatus, $validStatuses, true)) {
            return $this->fail('A valid status is required.', 422);
        }

        $application = Application::with(['job', 'student'])->find($id);
        if (!$application) {
            return $this->fail('Application not found.', 404);
        }

        $user = $request->user();
        if ($user->role === 'recruiter') {
            $recruiter = Recruiter::where('user_id', $user->id)->first();
            if (!$recruiter || $application->job->recruiter_id !== $recruiter->id) {
                return $this->fail('You do not have permission to update this application.', 403);
            }
        }

        DB::transaction(function () use ($application, $newStatus, $request, $user) {
            $application->update(['status' => $newStatus]);

            ApplicationStatusHistory::create([
                'application_id' => $application->id,
                'status' => $newStatus,
                'changed_by' => $user->id,
                'remarks' => $request->input('remarks'),
                'changed_at' => now(),
            ]);

            if ($newStatus === 'selected') {
                $application->student->update(['is_placed' => true]);
            }

            $statusLabels = [
                'applied' => 'Applied', 'shortlisted' => 'Shortlisted', 'interview' => 'Interview Scheduled',
                'selected' => 'Selected', 'rejected' => 'Rejected',
            ];

            AppNotification::create([
                'user_id' => $application->student->user_id,
                'title' => 'Application Status Updated',
                'message' => "Your application for \"{$application->job->title}\" is now: {$statusLabels[$newStatus]}.",
                'link' => '/student/applications',
                'created_at' => now(),
            ]);
        });

        return $this->ok(null, 'Application status updated successfully.');
    }

    public function history(Request $request, int $id)
    {
        $application = Application::with(['job', 'student'])->find($id);
        if (!$application) {
            return $this->fail('Application not found.', 404);
        }

        $user = $request->user();
        if ($user->role === 'student' && $application->student->user_id !== $user->id) {
            return $this->fail('Forbidden.', 403);
        }
        if ($user->role === 'recruiter') {
            $recruiter = Recruiter::where('user_id', $user->id)->first();
            if (!$recruiter || $application->job->recruiter_id !== $recruiter->id) {
                return $this->fail('Forbidden.', 403);
            }
        }

        $history = ApplicationStatusHistory::with('changedByUser')
            ->where('application_id', $id)
            ->orderBy('changed_at')
            ->get()
            ->map(fn ($h) => [
                'id' => $h->id,
                'application_id' => $h->application_id,
                'status' => $h->status,
                'changed_by' => $h->changed_by,
                'remarks' => $h->remarks,
                'changed_at' => $h->changed_at,
                'changed_by_email' => $h->changedByUser->email ?? null,
            ]);

        return $this->ok($history, 'OK');
    }
}
