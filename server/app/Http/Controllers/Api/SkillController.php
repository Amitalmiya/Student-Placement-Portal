<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Skill;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class SkillController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Skill::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')->limit(20);
        }

        return $this->ok($query->orderBy('name')->get(), 'OK');
    }
}
