<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\Department;
use App\Models\JobListing;
use App\Models\Recruiter;
use App\Models\Skill;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        // ---- Admin ----
        $admin = User::firstOrCreate(
            ['email' => 'admin@placement.edu'],
            ['password' => Hash::make('Admin@123'), 'role' => 'admin', 'status' => 'active']
        );

        // ---- Demo student ----
        $studentUser = User::firstOrCreate(
            ['email' => 'john.doe@student.placement.edu'],
            ['password' => Hash::make('Student@123'), 'role' => 'student', 'status' => 'active']
        );

        $cse = Department::where('code', 'CSE')->first();

        $student = Student::firstOrCreate(
            ['user_id' => $studentUser->id],
            [
                'roll_number' => 'CSE2022001',
                'full_name' => 'John Doe',
                'phone' => '9876543210',
                'department_id' => $cse?->id,
                'batch_year' => 2026,
                'cgpa' => 8.50,
                'backlogs' => 0,
            ]
        );

        $javascript = Skill::where('name', 'JavaScript')->first();
        $react = Skill::where('name', 'React')->first();
        $mysql = Skill::where('name', 'MySQL')->first();

        if ($javascript) {
            $student->skills()->syncWithoutDetaching([$javascript->id => ['proficiency' => 'advanced']]);
        }
        if ($react) {
            $student->skills()->syncWithoutDetaching([$react->id => ['proficiency' => 'advanced']]);
        }
        if ($mysql) {
            $student->skills()->syncWithoutDetaching([$mysql->id => ['proficiency' => 'intermediate']]);
        }

        // ---- Demo recruiter ----
        $recruiterUser = User::firstOrCreate(
            ['email' => 'hr@techcorp.com'],
            ['password' => Hash::make('Recruiter@123'), 'role' => 'recruiter', 'status' => 'active']
        );

        $recruiter = Recruiter::firstOrCreate(
            ['user_id' => $recruiterUser->id],
            [
                'company_name' => 'TechCorp Solutions',
                'company_website' => 'https://techcorp.example.com',
                'industry' => 'Information Technology',
                'contact_person' => 'Priya Sharma',
                'phone' => '9123456780',
                'is_verified' => true,
            ]
        );

        // ---- Demo job ----
        $it = Department::where('code', 'IT')->first();

        $job = JobListing::firstOrCreate(
            ['recruiter_id' => $recruiter->id, 'title' => 'Software Engineer Trainee'],
            [
                'description' => 'We are looking for enthusiastic freshers to join our engineering team and work on real-world full-stack products.',
                'job_type' => 'full-time',
                'location' => 'Bangalore',
                'salary_min' => 600000,
                'salary_max' => 900000,
                'min_cgpa' => 7.0,
                'max_backlogs' => 0,
                'openings' => 5,
                'application_deadline' => now()->addDays(30)->toDateString(),
                'status' => 'open',
            ]
        );

        $job->departments()->syncWithoutDetaching(array_filter([$cse?->id, $it?->id]));
        $job->skills()->syncWithoutDetaching(array_filter([$javascript?->id, $react?->id, $mysql?->id]));

        // ---- Demo announcement ----
        Announcement::firstOrCreate(
            ['title' => 'Welcome to the Placement Portal'],
            [
                'content' => 'The placement season 2026-27 has officially begun. Students are encouraged to complete their profiles and upload resumes.',
                'posted_by' => $admin->id,
                'target_role' => 'student',
                'created_at' => now(),
            ]
        );
    }
}
