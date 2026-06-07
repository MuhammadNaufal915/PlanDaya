<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\FirebaseTestController;
use App\Http\Middleware\FirebaseAuth;
use App\Http\Middleware\CheckRole;
use App\Http\Middleware\SanitizeInput;
use App\Services\SecurityLogger;

/*
|--------------------------------------------------------------------------
| API Routes — PlanDaya
|--------------------------------------------------------------------------
*/

// ─── Firebase connection test ─────────────────────────────────────────────────
Route::get('/firebase-test', [FirebaseTestController::class, 'test']);

// ─── Public auth routes (with rate limiting + input sanitization) ─────────────
Route::middleware(['throttle:10,1', SanitizeInput::class])->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login',    [AuthController::class, 'login']);
});

// ─── Protected auth routes ────────────────────────────────────────────────────
Route::middleware([FirebaseAuth::class])->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    // ─── Devices ──────────────────────────────────────────────────────────────
    Route::middleware(SanitizeInput::class)->group(function () {
        Route::get('/devices',         [DeviceController::class, 'index']);
        Route::post('/devices',        [DeviceController::class, 'store']);
        Route::get('/devices/{id}',    [DeviceController::class, 'show']);
        Route::put('/devices/{id}',    [DeviceController::class, 'update']);
        Route::delete('/devices/{id}', [DeviceController::class, 'destroy']);

        // ─── Schedules ────────────────────────────────────────────────────────
        Route::get('/schedules',         [ScheduleController::class, 'index']);
        Route::post('/schedules',        [ScheduleController::class, 'store']);
        Route::get('/schedules/{id}',    [ScheduleController::class, 'show']);
        Route::put('/schedules/{id}',    [ScheduleController::class, 'update']);
        Route::delete('/schedules/{id}', [ScheduleController::class, 'destroy']);
    });

    // ─── Reports ──────────────────────────────────────────────────────────────
    Route::get('/reports/daily',      [ReportController::class, 'daily']);
    Route::get('/reports/weekly',     [ReportController::class, 'weekly']);
    Route::get('/reports/monthly',    [ReportController::class, 'monthly']);
    Route::get('/reports/top-devices',[ReportController::class, 'topDevices']);

    // ─── Admin (role:admin only) ───────────────────────────────────────────────
    Route::middleware([CheckRole::class . ':admin'])->prefix('admin')->group(function () {
        Route::get('/dashboard',       [AdminController::class, 'dashboard']);
        Route::get('/users',           [AdminController::class, 'users']);
        Route::get('/logs',            [AdminController::class, 'logs']);
        Route::get('/security-events', [AdminController::class, 'securityEvents']);
    });
});

// ─── Rate limit exceeded handler ──────────────────────────────────────────────
Route::fallback(function (Request $request) {
    return response()->json([
        'success' => false,
        'message' => 'Endpoint not found.',
    ], 404);
});