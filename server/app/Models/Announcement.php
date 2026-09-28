<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    public $timestamps = false;

    protected $fillable = ['title', 'content', 'posted_by', 'target_role', 'created_at'];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function postedBy()
    {
        return $this->belongsTo(User::class, 'posted_by');
    }
}
