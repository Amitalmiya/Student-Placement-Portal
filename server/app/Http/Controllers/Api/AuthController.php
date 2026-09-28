<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Recruiter;
use App\Models\Student;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    use ApiResponse;

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|min:6',
            'role' => 'required|in:student,recruiter',
            'full_name' => 'required|string|max:150',
            'roll_number' => 'required_if:role,student|string|max:50',
            'company_name' => 'required_if:role,recruiter|string|max:150',
        ]);

        if ($validator->fails()) {
            return $this->fail('Validation failed.', 422, $validator->errors());
        }

        if (User::where('email', $request->email)->exists()) {
            return $this->fail('An account with this email already exists.', 409);
        }

        $userId = DB::transaction(function () use ($request) {
            $status = $request->role === 'recruiter' ? 'pending' : 'active';

            $user = User::create([
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'status' => $status,
            ]);

            if ($request->role === 'student') {
                Student::create([
                    'user_id' => $user->id,
                    'roll_number' => $request->roll_number,
                    'full_name' => $request->full_name,
                    'phone' => $request->phone,
                    'department_id' => $request->department_id,
                    'batch_year' => $request->batch_year,
                    'cgpa' => 0,
                    'backlogs' => 0,
                ]);
            } else {
                Recruiter::create([
                    'user_id' => $user->id,
                    'company_name' => $request->company_name,
                    'contact_person' => $request->full_name,
                    'phone' => $request->phone,
                ]);
            }

            return $user->id;
        });

        $message = $request->role === 'recruiter'
            ? 'Registration successful. Your account is pending admin verification.'
            : 'Registration successful. You can now log in.';

        return $this->ok(['user_id' => $userId], $message, 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return $this->fail('Validation failed.', 422, $validator->errors());
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return $this->fail('Invalid email or password.', 401);
        }

        if ($user->status === 'pending') {
            return $this->fail('Your recruiter account is awaiting admin verification.', 403);
        }
        if ($user->status === 'inactive') {
            return $this->fail('Your account has been deactivated. Contact the placement office.', 403);
        }

        $profile = ['name' => $user->email];

        if ($user->role === 'student') {
            $student = Student::where('user_id', $user->id)->first();
            if ($student) {
                $profile = ['id' => $student->id, 'name' => $student->full_name, 'photo' => $student->profile_photo];
            }
        } elseif ($user->role === 'recruiter') {
            $recruiter = Recruiter::where('user_id', $user->id)->first();
            if ($recruiter) {
                $profile = ['id' => $recruiter->id, 'name' => $recruiter->company_name, 'photo' => $recruiter->logo];
            }
        } else {
            $profile = ['name' => 'Administrator'];
        }

        // One active token per login; revoke previous tokens for a clean slate.
        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        $user->forceFill(['last_login' => now()])->save();

        return $this->ok([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'role' => $user->role,
                'profile' => $profile,
            ],
        ], 'Login successful.');
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return $this->ok(null, 'Logged out successfully.');
    }

    public function me(Request $request)
    {
        $user = $request->user();
        $profile = null;

        if ($user->role === 'student') {
            $profile = Student::with('department')->where('user_id', $user->id)->first();
        } elseif ($user->role === 'recruiter') {
            $profile = Recruiter::where('user_id', $user->id)->first();
        }

        return $this->ok([
            'user' => $user->only(['id', 'email', 'role', 'status', 'created_at']),
            'profile' => $profile,
        ], 'OK');
    }
}
