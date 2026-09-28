<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recruiters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('company_name', 150);
            $table->string('company_website')->nullable();
            $table->text('company_description')->nullable();
            $table->string('industry', 100)->nullable();
            $table->string('contact_person', 150)->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('logo')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->timestamps();

            $table->index('is_verified');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recruiters');
    }
};
