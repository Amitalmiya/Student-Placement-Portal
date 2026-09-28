<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['name' => 'Computer Science Engineering', 'code' => 'CSE'],
            ['name' => 'Information Technology', 'code' => 'IT'],
            ['name' => 'Electronics & Communication', 'code' => 'ECE'],
            ['name' => 'Mechanical Engineering', 'code' => 'MECH'],
            ['name' => 'Civil Engineering', 'code' => 'CIVIL'],
        ];

        foreach ($departments as $dept) {
            Department::firstOrCreate(['code' => $dept['code']], $dept);
        }
    }
}
