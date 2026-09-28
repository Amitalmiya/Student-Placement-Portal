<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Recruiter;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RecruiterProfileController extends Controller
{
    use ApiResponse;

    private function recruiterFor(Request $request): ?Recruiter
    {
        return Recruiter::where('user_id', $request->user()->id)->first();
    }

    public function show(Request $request)
    {
        $recruiter = $this->recruiterFor($request);
        if (!$recruiter) {
            return $this->fail('Recruiter profile not found.', 404);
        }

        $data = $recruiter->toArray();
        $data['email'] = $request->user()->email;

        return $this->ok($data, 'OK');
    }

    public function update(Request $request)
    {
        $recruiter = $this->recruiterFor($request);
        if (!$recruiter) {
            return $this->fail('Recruiter profile not found.', 404);
        }

        $validator = Validator::make($request->all(), [
            'company_name' => 'required|string|max:150',
        ]);

        if ($validator->fails()) {
            return $this->fail('Validation failed.', 422, $validator->errors());
        }

        $recruiter->update([
            'company_name' => $request->company_name,
            'company_website' => $request->company_website,
            'company_description' => $request->company_description,
            'industry' => $request->industry,
            'contact_person' => $request->contact_person,
            'phone' => $request->phone,
        ]);

        return $this->ok(null, 'Company profile updated successfully.');
    }
}
