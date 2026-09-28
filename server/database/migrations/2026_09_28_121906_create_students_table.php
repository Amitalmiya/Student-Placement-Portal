<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('roll_number', 50)->unique();
            $table->string('full_name', 150);
            $table->string('phone', 20)->nullable();
            $table->date('dob')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->unsignedSmallInteger('batch_year')->nullable();
            $table->decimal('cgpa', 4, 2)->default(0.00);
            $table->unsignedInteger('backlogs')->default(0);
            $table->string('address', 255)->nullable();
            $table->string('profile_photo')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('github_url')->nullable();
            $table->boolean('is_placed')->default(false);
            $table->timestamps();

            $table->index('department_id');
            $table->index('cgpa');
            $table->index('batch_year');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
