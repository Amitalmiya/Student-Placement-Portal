<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $user = $request->user();

        $query = AppNotification::where('user_id', $user->id);
        if ($request->boolean('unread_only')) {
            $query->where('is_read', false);
        }

        $notifications = $query->orderByDesc('created_at')->limit(50)->get();
        $unreadCount = AppNotification::where('user_id', $user->id)->where('is_read', false)->count();

        return $this->ok([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ], 'OK');
    }

    public function markRead(Request $request, int $id)
    {
        AppNotification::where('id', $id)->where('user_id', $request->user()->id)->update(['is_read' => true]);
        return $this->ok(null, 'Notification marked as read.');
    }

    public function markAllRead(Request $request)
    {
        AppNotification::where('user_id', $request->user()->id)->update(['is_read' => true]);
        return $this->ok(null, 'All notifications marked as read.');
    }
}
