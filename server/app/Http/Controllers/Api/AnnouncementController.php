<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\AppNotification;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnnouncementController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $user = $request->user();
        $page = max(1, (int) $request->input('page', 1));
        $limit = min(100, max(1, (int) $request->input('limit', 10)));

        $query = Announcement::with('postedBy');

        if ($user->role !== 'admin') {
            $query->where(function ($q) use ($user) {
                $q->where('target_role', 'all')->orWhere('target_role', $user->role);
            });
        }

        $total = $query->count();
        $announcements = $query->orderByDesc('created_at')
            ->forPage($page, $limit)
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'title' => $a->title,
                'content' => $a->content,
                'posted_by' => $a->posted_by,
                'target_role' => $a->target_role,
                'created_at' => $a->created_at,
                'posted_by_email' => $a->postedBy->email ?? null,
            ]);

        return $this->ok([
            'announcements' => $announcements,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'total_pages' => (int) ceil($total / $limit),
            ],
        ], 'OK');
    }

    public function store(Request $request)
    {
        if (empty($request->title) || empty($request->content)) {
            return $this->fail('title and content are required.', 422);
        }

        $targetRole = in_array($request->target_role, ['all', 'student', 'recruiter'], true)
            ? $request->target_role : 'all';

        $announcement = DB::transaction(function () use ($request, $targetRole) {
            $announcement = Announcement::create([
                'title' => $request->title,
                'content' => $request->content,
                'posted_by' => $request->user()->id,
                'target_role' => $targetRole,
                'created_at' => now(),
            ]);

            $usersQuery = User::where('status', 'active');
            $usersQuery = $targetRole === 'all'
                ? $usersQuery->whereIn('role', ['student', 'recruiter'])
                : $usersQuery->where('role', $targetRole);

            $notifications = $usersQuery->pluck('id')->map(fn ($userId) => [
                'user_id' => $userId,
                'title' => 'New Announcement',
                'message' => $request->title,
                'link' => '/announcements',
                'is_read' => false,
                'created_at' => now(),
            ])->toArray();

            if (!empty($notifications)) {
                AppNotification::insert($notifications);
            }

            return $announcement;
        });

        return $this->ok(['id' => $announcement->id], 'Announcement posted.', 201);
    }

    public function destroy(int $id)
    {
        Announcement::where('id', $id)->delete();
        return $this->ok(null, 'Announcement deleted.');
    }
}
