<?php

namespace Database\Seeders;

use App\Models\Skill;
use Illuminate\Database\Seeder;

class SkillSeeder extends Seeder
{
    public function run(): void
    {
        $skills = [
            // Programming Languages
            'JavaScript', 'Python', 'Java', 'C', 'C++', 'C#', 'PHP', 'Go', 'Rust',
            'Kotlin', 'Swift', 'Ruby', 'TypeScript', 'SQL',
            // Frontend
            'React', 'Angular', 'Vue.js', 'Next.js', 'Redux', 'HTML/CSS',
            'Tailwind CSS', 'Bootstrap', 'jQuery',
            // Backend & Frameworks
            'Node.js', 'Express.js', 'Django', 'Flask', 'FastAPI', 'Spring Boot',
            'Laravel', 'Ruby on Rails', 'ASP.NET', 'REST APIs', 'GraphQL',
            // Databases
            'MySQL', 'PostgreSQL', 'MongoDB', 'SQLite', 'Redis', 'Firebase',
            // Cloud & DevOps
            'AWS', 'Azure', 'Google Cloud Platform', 'Docker', 'Kubernetes',
            'Jenkins', 'CI/CD', 'Linux', 'Bash Scripting', 'Nginx', 'Terraform', 'Ansible',
            // Data Science, ML & AI
            'Machine Learning', 'Deep Learning', 'Natural Language Processing',
            'Computer Vision', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy',
            'Data Analysis', 'Data Visualization', 'Tableau', 'Power BI', 'Excel',
            // Mobile
            'Android Development', 'iOS Development', 'Flutter', 'React Native',
            // Testing & QA
            'Unit Testing', 'Selenium', 'Jest', 'Postman',
            // Tools & Practices
            'Git', 'Agile/Scrum', 'Jira', 'System Design', 'Data Structures',
            'Object-Oriented Programming', 'Operating Systems', 'Computer Networks',
            // Security & Emerging Tech
            'Cybersecurity', 'Ethical Hacking', 'Blockchain', 'Solidity', 'Unity',
            // Soft Skills
            'Communication Skills', 'Problem Solving', 'Team Leadership', 'Time Management',
        ];

        foreach (array_unique($skills) as $name) {
            Skill::firstOrCreate(['name' => $name]);
        }
    }
}
