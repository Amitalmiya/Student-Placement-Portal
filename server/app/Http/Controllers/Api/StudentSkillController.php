<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Skill;
use App\Models\Student;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Database\QueryException;

class StudentSkillController extends Controller
{
    use ApiResponse;

    private function studentFor(Request $request): ?Student
    {
        return Student::where('user_id', $request->user()->id)->first();
    }

    public function store(Request $request)
    {
        $student = $this->studentFor($request);
        if (!$student) {
            return $this->fail('Student profile not found.', 404);
        }

        if (empty($request->skill_name)) {
            return $this->fail('skill_name is required.', 422);
        }

        $proficiency = in_array($request->proficiency, ['beginner', 'intermediate', 'advanced', 'expert'], true)
            ? $request->proficiency : 'intermediate';

        $skill = Skill::firstOrCreate(['name' => trim($request->skill_name)]);

        try {
            $student->skills()->attach($skill->id, ['proficiency' => $proficiency]);
        } catch (QueryException $e) {
            return $this->fail('This skill is already added to your profile.', 409);
        }

        return $this->ok(['skill_id' => $skill->id], 'Skill added.', 201);
    }

    public function destroy(Request $request, int $skillId)
    {
        $student = $this->studentFor($request);
        if (!$student) {
            return $this->fail('Student profile not found.', 404);
        }

        $student->skills()->detach($skillId);

        return $this->ok(null, 'Skill removed.');
    }
}
