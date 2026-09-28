<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->text('content');
            $table->foreignId('posted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('target_role', ['all', 'student', 'recruiter'])->default('all');
            $table->timestamp('created_at')->useCurrent();

            $table->index('target_role');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
