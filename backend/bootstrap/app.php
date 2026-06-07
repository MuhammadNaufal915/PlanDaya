<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\FirebaseAuth;
use App\Http\Middleware\CheckRole;
use App\Http\Middleware\SanitizeInput;
use App\Services\SecurityLogger;
use Illuminate\Http\Middleware\HandleCors;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // ── Named middleware aliases ──────────────────────────────────────────
        $middleware->alias([
            'firebase.auth' => FirebaseAuth::class,
            'role'          => CheckRole::class,
            'sanitize'      => SanitizeInput::class,
        ]);

        // ── CORS: allow the Vite dev server and production frontend ───────────
        $middleware->api(prepend: [
            HandleCors::class,
        ]);


    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Log 429 Too Many Requests as a security event
        $exceptions->render(function (\Illuminate\Http\Exceptions\ThrottleRequestsException $e, $request) {
            SecurityLogger::rateLimitTriggered(
                $request->ip(),
                $request->path()
            );
            return response()->json([
                'success' => false,
                'message' => 'Too many requests. Please slow down.',
            ], 429);
        });
    })->create();
