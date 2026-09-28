<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Resume;
use App\Models\Student;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ResumeController extends Controller
{
    use ApiResponse;

    private function studentFor(Request $request): ?Student
    {
        return Student::where('user_id', $request->user()->id)->first();
    }

    public function index(Request $request)
    {
        $student = $this->studentFor($request);
        if (!$student) {
            return $this->fail('Student profile not found.', 404);
        }

        return $this->ok($student->resumes, 'OK');
    }

    public function store(Request $request)
    {
        $student = $this->studentFor($request);
        if (!$student) {
            return $this->fail('Student profile not found.', 404);
        }

        $request->validate([
            'resume' => 'required|file|mimes:pdf,doc,docx|max:5120', // 5MB
        ]);

        $file = $request->file('resume');
        $safeName = 'resume_' . $student->id . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $file->getClientOriginalExtension();

        // Stored under storage/app/public/resumes — make sure `php artisan storage:link` has been run.
        $path = $file->storeAs('resumes', $safeName, 'public');

        $student->resumes()->update(['is_primary' => false]);

        $resume = Resume::create([
            'student_id' => $student->id,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => 'storage/' . $path,
            'file_size' => $file->getSize(),
            'is_primary' => true,
            'uploaded_at' => now(),
        ]);

        return $this->ok(['resume_id' => $resume->id, 'file_path' => $resume->file_path], 'Resume uploaded successfully.', 201);
    }

    public function destroy(Request $request, int $resumeId)
    {
        $student = $this->studentFor($request);
        if (!$student) {
            return $this->fail('Student profile not found.', 404);
        }

        $resume = Resume::where('id', $resumeId)->where('student_id', $student->id)->first();
        if (!$resume) {
            return $this->fail('Resume not found.', 404);
        }

        $relativePath = str_replace('storage/', '', $resume->file_path);
        Storage::disk('public')->delete($relativePath);
        $resume->delete();

        return $this->ok(null, 'Resume deleted.');
    }
}
