<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    protected $fillable = [
        'user_id', 'roll_number', 'full_name', 'phone', 'dob', 'gender',
        'department_id', 'batch_year', 'cgpa', 'backlogs', 'address',
        'profile_photo', 'linkedin_url', 'github_url', 'is_placed',
    ];

    protected function casts(): array
    {
        return [
            'dob' => 'date',
            'cgpa' => 'decimal:2',
            'is_placed' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function skills()
    {
        return $this->belongsToMany(Skill::class, 'student_skills', 'student_id', 'skill_id')
            ->withPivot('proficiency');
    }

    public function education()
    {
        return $this->hasMany(StudentEducation::class)->orderByDesc('end_year');
    }

    public function resumes()
    {
        return $this->hasMany(Resume::class)->orderByDesc('uploaded_at');
    }

    public function primaryResume()
    {
        return $this->hasOne(Resume::class)->where('is_primary', true);
    }

    public function applications()
    {
        return $this->hasMany(Application::class);
    }
}
