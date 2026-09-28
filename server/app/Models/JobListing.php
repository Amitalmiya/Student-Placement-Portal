<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobListing extends Model
{
    // Table is "jobs_listings" (not "jobs") to avoid colliding with
    // Laravel's own queue jobs table.
    protected $table = 'jobs_listings';

    protected $fillable = [
        'recruiter_id', 'title', 'description', 'job_type', 'location',
        'salary_min', 'salary_max', 'min_cgpa', 'max_backlogs', 'openings',
        'application_deadline', 'status',
    ];

    protected function casts(): array
    {
        return [
            'application_deadline' => 'date',
            'min_cgpa' => 'decimal:2',
            'salary_min' => 'decimal:2',
            'salary_max' => 'decimal:2',
        ];
    }

    public function recruiter()
    {
        return $this->belongsTo(Recruiter::class, 'recruiter_id');
    }

    public function departments()
    {
        return $this->belongsToMany(Department::class, 'job_departments', 'job_id', 'department_id');
    }

    public function skills()
    {
        return $this->belongsToMany(Skill::class, 'job_skills', 'job_id', 'skill_id');
    }

    public function applications()
    {
        return $this->hasMany(Application::class, 'job_id');
    }
}
