<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Named AppNotification (not Notification) to avoid clashing with
// Laravel's built-in notification classes, while still using the
// plain "notifications" table to match the existing frontend contract.
class AppNotification extends Model
{
    public $timestamps = false;

    protected $table = 'notifications';

    protected $fillable = ['user_id', 'title', 'message', 'link', 'is_read', 'created_at'];

    protected function casts(): array
    {
        return [
            'is_read' => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
