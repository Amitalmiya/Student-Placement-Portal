<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    public $timestamps = false;

    protected $fillable = ['name'];

    public function students()
    {
        return $this->belongsToMany(Student::class, 'student_skills', 'skill_id', 'student_id')
            ->withPivot('proficiency');
    }

    public function jobs()
    {
        return $this->belongsToMany(JobListing::class, 'job_skills', 'skill_id', 'job_id');
    }
}
