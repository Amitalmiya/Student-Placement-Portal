<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_education', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->enum('level', ['10th', '12th', 'diploma', 'undergraduate', 'postgraduate']);
            $table->string('institution', 200);
            $table->string('board_or_university', 200)->nullable();
            $table->string('field_of_study', 150)->nullable();
            $table->unsignedSmallInteger('start_year')->nullable();
            $table->unsignedSmallInteger('end_year')->nullable();
            $table->decimal('score', 5, 2)->nullable();
            $table->enum('score_type', ['percentage', 'cgpa'])->default('percentage');

            $table->index('student_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_education');
    }
};
