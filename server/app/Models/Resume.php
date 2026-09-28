<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Resume extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'student_id', 'file_name', 'file_path', 'file_size', 'is_primary', 'uploaded_at',
    ];

    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
            'uploaded_at' => 'datetime',
        ];
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
