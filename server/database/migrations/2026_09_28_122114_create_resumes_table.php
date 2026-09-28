<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resumes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->string('file_name');
            $table->string('file_path');
            $table->unsignedInteger('file_size')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->timestamp('uploaded_at')->useCurrent();

            $table->index('student_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resumes');
    }
};
