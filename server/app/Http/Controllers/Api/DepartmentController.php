<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Database\QueryException;

class DepartmentController extends Controller
{
    use ApiResponse;

    public function index()
    {
        return $this->ok(Department::orderBy('name')->get(), 'OK');
    }

    public function store(Request $request)
    {
        if (empty($request->name) || empty($request->code)) {
            return $this->fail('name and code are required.', 422);
        }

        try {
            $dept = Department::create([
                'name' => $request->name,
                'code' => strtoupper($request->code),
            ]);
        } catch (QueryException $e) {
            return $this->fail('Department name or code already exists.', 409);
        }

        return $this->ok(['id' => $dept->id], 'Department created.', 201);
    }

    public function destroy(int $id)
    {
        Department::where('id', $id)->delete();
        return $this->ok(null, 'Department deleted.');
    }
}
