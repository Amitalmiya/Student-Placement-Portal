<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentEducation extends Model
{
    public $timestamps = false;

    protected $table = 'student_education';

    protected $fillable = [
        'student_id', 'level', 'institution', 'board_or_university',
        'field_of_study', 'start_year', 'end_year', 'score', 'score_type',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
