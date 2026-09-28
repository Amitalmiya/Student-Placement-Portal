<?php

use App\Http\Middleware\EnsureRole;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Register the custom role-based access middleware as "role:..."
        $middleware->alias([
            'role' => EnsureRole::class,
        ]);

        // Note: Laravel already applies Illuminate\Http\Middleware\HandleCors
        // globally by default in fresh installs — it reads config/cors.php
        // (included in this project) automatically. No extra wiring needed.
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
