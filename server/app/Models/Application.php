<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    const UPDATED_AT = 'updated_at';
    const CREATED_AT = null; // we use applied_at instead

    protected $fillable = [
        'job_id', 'student_id', 'resume_id', 'cover_letter', 'status', 'applied_at',
    ];

    protected function casts(): array
    {
        return [
            'applied_at' => 'datetime',
        ];
    }

    public function job()
    {
        return $this->belongsTo(JobListing::class, 'job_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function resume()
    {
        return $this->belongsTo(Resume::class);
    }

    public function history()
    {
        return $this->hasMany(ApplicationStatusHistory::class)->orderBy('changed_at');
    }
}
