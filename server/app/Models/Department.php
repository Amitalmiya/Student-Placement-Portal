<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    public $timestamps = false;

    protected $fillable = ['name', 'code'];

    public function students()
    {
        return $this->hasMany(Student::class);
    }

    public function jobs()
    {
        return $this->belongsToMany(JobListing::class, 'job_departments', 'department_id', 'job_id');
    }
}
