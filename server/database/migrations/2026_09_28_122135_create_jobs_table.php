<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jobs_listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recruiter_id')->constrained('recruiters')->cascadeOnDelete();
            $table->string('title', 150);
            $table->text('description');
            $table->enum('job_type', ['full-time', 'internship', 'part-time', 'contract'])->default('full-time');
            $table->string('location', 150)->nullable();
            $table->decimal('salary_min', 12, 2)->nullable();
            $table->decimal('salary_max', 12, 2)->nullable();
            $table->decimal('min_cgpa', 4, 2)->default(0.00);
            $table->unsignedInteger('max_backlogs')->default(0);
            $table->unsignedInteger('openings')->default(1);
            $table->date('application_deadline')->nullable();
            $table->enum('status', ['draft', 'open', 'closed'])->default('open');
            $table->timestamps();

            $table->index('status');
            $table->index('application_deadline');
            $table->fullText(['title', 'description']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jobs_listings');
    }
};
