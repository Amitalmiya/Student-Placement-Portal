<?php

namespace App\Traits;

trait ApiResponse
{
    protected function ok($data = null, string $message = 'OK', int $code = 200)
    {
        $payload = ['success' => true, 'message' => $message];
        if ($data !== null) {
            $payload['data'] = $data;
        }
        return response()->json($payload, $code);
    }

    protected function fail(string $message, int $code = 400, $errors = null)
    {
        $payload = ['success' => false, 'message' => $message];
        if ($errors !== null) {
            $payload['errors'] = $errors;
        }
        return response()->json($payload, $code);
    }
}
