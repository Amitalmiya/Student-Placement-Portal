<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class StudentProfileController extends Controller
{
    use ApiResponse;

    private function studentFor(Request $request): ?Student
    {
        return Student::where('user_id', $request->user()->id)->first();
    }

    public function show(Request $request)
    {
        $student = $this->studentFor($request);
        if (!$student) {
            return $this->fail('Student profile not found.', 404);
        }

        $student->load(['department', 'skills', 'education', 'resumes']);

        $profile = $student->toArray();
        $profile['department_name'] = $student->department->name ?? null;
        $profile['email'] = $request->user()->email;
        $profile['skills'] = $student->skills->map(fn ($s) => [
            'id' => $s->id,
            'name' => $s->name,
            'proficiency' => $s->pivot->proficiency,
        ]);

        return $this->ok($profile, 'OK');
    }

    public function update(Request $request)
    {
        $student = $this->studentFor($request);
        if (!$student) {
            return $this->fail('Student profile not found.', 404);
        }

        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:150',
            'cgpa' => 'nullable|numeric|min:0|max:10',
            'backlogs' => 'nullable|integer|min:0',
            'gender' => 'nullable|in:male,female,other',
        ]);

        if ($validator->fails()) {
            return $this->fail('Validation failed.', 422, $validator->errors());
        }

        $student->update([
            'full_name' => $request->full_name,
            'phone' => $request->phone,
            'dob' => $request->dob,
            'gender' => $request->gender,
            'department_id' => $request->department_id,
            'batch_year' => $request->batch_year,
            'cgpa' => $request->cgpa ?? 0,
            'backlogs' => $request->backlogs ?? 0,
            'address' => $request->address,
            'linkedin_url' => $request->linkedin_url,
            'github_url' => $request->github_url,
        ]);

        return $this->ok(null, 'Profile updated successfully.');
    }
}
