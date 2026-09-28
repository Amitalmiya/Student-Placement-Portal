<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentEducation;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class StudentEducationController extends Controller
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

        return $this->ok($student->education, 'OK');
    }

    public function store(Request $request)
    {
        $student = $this->studentFor($request);
        if (!$student) {
            return $this->fail('Student profile not found.', 404);
        }

        $validator = Validator::make($request->all(), [
            'level' => 'required|in:10th,12th,diploma,undergraduate,postgraduate',
            'institution' => 'required|string|max:200',
        ]);

        if ($validator->fails()) {
            return $this->fail('Validation failed.', 422, $validator->errors());
        }

        $record = StudentEducation::create([
            'student_id' => $student->id,
            'level' => $request->level,
            'institution' => $request->institution,
            'board_or_university' => $request->board_or_university,
            'field_of_study' => $request->field_of_study,
            'start_year' => $request->start_year,
            'end_year' => $request->end_year,
            'score' => $request->score,
            'score_type' => $request->score_type ?? 'percentage',
        ]);

        return $this->ok(['id' => $record->id], 'Education record added.', 201);
    }

    public function destroy(Request $request, int $educationId)
    {
        $student = $this->studentFor($request);
        if (!$student) {
            return $this->fail('Student profile not found.', 404);
        }

        StudentEducation::where('id', $educationId)->where('student_id', $student->id)->delete();

        return $this->ok(null, 'Education record removed.');
    }
}
