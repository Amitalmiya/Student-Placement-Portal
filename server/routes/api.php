<?php

use App\Http\Controllers\Api\Admin\AnalyticsController;
use App\Http\Controllers\Api\Admin\RecruiterManagementController;
use App\Http\Controllers\Api\Admin\StudentManagementController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\RecruiterProfileController;
use App\Http\Controllers\Api\ResumeController;
use App\Http\Controllers\Api\SkillController;
use App\Http\Controllers\Api\StudentEducationController;
use App\Http\Controllers\Api\StudentProfileController;
use App\Http\Controllers\Api\StudentSkillController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Smart Student Management & Placement Portal
|--------------------------------------------------------------------------
| All routes are prefixed with /api automatically by Laravel.
| Protected routes use Sanctum's "auth:sanctum" guard (Bearer token)
| plus the custom "role:..." middleware for role-based access control.
*/

// ---------- Public (no auth) ----------
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// ---------- Authenticated (any role) ----------
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::get('/departments', [DepartmentController::class, 'index']);
    Route::get('/skills', [SkillController::class, 'index']);

    Route::get('/jobs', [JobController::class, 'index']);
    Route::get('/jobs/{id}', [JobController::class, 'show']);

    Route::get('/announcements', [AnnouncementController::class, 'index']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markRead']);

    Route::get('/applications', [ApplicationController::class, 'index']);
    Route::get('/applications/{id}/history', [ApplicationController::class, 'history']);

    // ---------- Student only ----------
    Route::middleware('role:student')->group(function () {
        Route::get('/students/profile', [StudentProfileController::class, 'show']);
        Route::put('/students/profile', [StudentProfileController::class, 'update']);

        Route::post('/students/skills', [StudentSkillController::class, 'store']);
        Route::delete('/students/skills/{skillId}', [StudentSkillController::class, 'destroy']);

        Route::get('/students/education', [StudentEducationController::class, 'index']);
        Route::post('/students/education', [StudentEducationController::class, 'store']);
        Route::delete('/students/education/{educationId}', [StudentEducationController::class, 'destroy']);

        Route::get('/students/resumes', [ResumeController::class, 'index']);
        Route::post('/students/resumes', [ResumeController::class, 'store']);
        Route::delete('/students/resumes/{resumeId}', [ResumeController::class, 'destroy']);

        Route::get('/jobs/{id}/eligibility', [JobController::class, 'eligibility']);
        Route::post('/applications', [ApplicationController::class, 'store']);
    });

    // ---------- Recruiter only ----------
    Route::middleware('role:recruiter')->group(function () {
        Route::get('/recruiters/profile', [RecruiterProfileController::class, 'show']);
        Route::put('/recruiters/profile', [RecruiterProfileController::class, 'update']);

        Route::post('/jobs', [JobController::class, 'store']);
        Route::put('/jobs/{id}', [JobController::class, 'update']);
    });

    // ---------- Recruiter or Admin ----------
    Route::middleware('role:recruiter,admin')->group(function () {
        Route::delete('/jobs/{id}', [JobController::class, 'destroy']);
        Route::put('/applications/{id}/status', [ApplicationController::class, 'updateStatus']);
    });

    // ---------- Admin only ----------
    Route::middleware('role:admin')->group(function () {
        Route::post('/departments', [DepartmentController::class, 'store']);
        Route::delete('/departments/{id}', [DepartmentController::class, 'destroy']);

        Route::post('/announcements', [AnnouncementController::class, 'store']);
        Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy']);

        Route::get('/admin/students', [StudentManagementController::class, 'index']);
        Route::put('/admin/students/{userId}', [StudentManagementController::class, 'update']);
        Route::delete('/admin/students/{userId}', [StudentManagementController::class, 'destroy']);

        Route::get('/admin/recruiters', [RecruiterManagementController::class, 'index']);
        Route::put('/admin/recruiters/{userId}', [RecruiterManagementController::class, 'update']);
        Route::delete('/admin/recruiters/{userId}', [RecruiterManagementController::class, 'destroy']);

        Route::get('/admin/analytics', [AnalyticsController::class, 'index']);
    });
});
