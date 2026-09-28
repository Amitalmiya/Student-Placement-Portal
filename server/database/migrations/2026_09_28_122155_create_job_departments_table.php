<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_departments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_id')->constrained('jobs_listings')->cascadeOnDelete();
            $table->foreignId('department_id')->constrained('departments')->cascadeOnDelete();

            $table->unique(['job_id', 'department_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_departments');
    }
};
