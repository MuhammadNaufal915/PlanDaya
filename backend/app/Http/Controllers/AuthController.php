<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Services\FirebaseService;
use App\Services\SecurityLogger;

class AuthController extends Controller
{
    public function __construct(protected FirebaseService $firebase) {}

    // ─── POST /api/auth/register ──────────────────────────────────────────────
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'min:2', 'max:100'],
            'email'    => ['required', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        // Check if email already exists in Firebase
        $existing = $this->firebase->getDocuments('users');
        foreach ($existing as $user) {
            if (isset($user['email']) && $user['email'] === $validated['email']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email already registered.',
                ], 422);
            }
        }

        $userData = [
            'name'       => $validated['name'],
            'email'      => $validated['email'],
            'password'   => Hash::make($validated['password']),
            'role'       => 'user',
            'is_active'  => true,
            'created_at' => now()->toDateTimeString(),
            'updated_at' => now()->toDateTimeString(),
        ];

        $user = $this->firebase->createDocument('users', $userData);

        // Log security event
        SecurityLogger::register($validated['email'], $request->ip());

        // Log activity
        $this->firebase->createDocument('activity_logs', [
            'user_id'    => $user['id'],
            'action'     => 'REGISTER',
            'ip'         => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now()->toDateTimeString(),
        ]);

        // Generate simple token (use Sanctum token pattern)
        $token = bin2hex(random_bytes(40));

        // Store token hash in Firebase
        $this->firebase->createDocument('user_tokens', [
            'user_id'    => $user['id'],
            'token_hash' => hash('sha256', $token),
            'created_at' => now()->toDateTimeString(),
            'expires_at' => now()->addDays(7)->toDateTimeString(),
        ]);

        unset($user['password']);

        return response()->json([
            'success' => true,
            'message' => 'Registration successful.',
            'data'    => [
                'user'  => $user,
                'token' => $token,
            ],
        ], 201);
    }

    // ─── POST /api/auth/login ─────────────────────────────────────────────────
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        // Find user by email
        $users = $this->firebase->getDocuments('users');
        $user  = null;
        foreach ($users as $u) {
            if (isset($u['email']) && $u['email'] === $validated['email']) {
                $user = $u;
                break;
            }
        }

        // Log failed login attempts
        if (!$user || !Hash::check($validated['password'], $user['password'] ?? '')) {
            SecurityLogger::loginFailed($validated['email'], $request->ip());

            // Record login attempt in Firebase
            $this->firebase->createDocument('login_attempts', [
                'email'      => $validated['email'],
                'ip'         => $request->ip(),
                'user_agent' => $request->userAgent(),
                'status'     => 'failed',
                'reason'     => !$user ? 'user_not_found' : 'invalid_credentials',
                'created_at' => now()->toDateTimeString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials.',
            ], 401);
        }

        if (!($user['is_active'] ?? true)) {
            SecurityLogger::loginFailed($validated['email'], $request->ip(), 'account_disabled');
            return response()->json([
                'success' => false,
                'message' => 'Account is disabled.',
            ], 403);
        }

        // Generate token
        $token = bin2hex(random_bytes(40));

        $this->firebase->createDocument('user_tokens', [
            'user_id'    => $user['id'],
            'token_hash' => hash('sha256', $token),
            'created_at' => now()->toDateTimeString(),
            'expires_at' => now()->addDays(7)->toDateTimeString(),
        ]);

        // Log success
        SecurityLogger::loginSuccess($validated['email'], $request->ip());

        $this->firebase->createDocument('login_attempts', [
            'email'      => $validated['email'],
            'ip'         => $request->ip(),
            'user_agent' => $request->userAgent(),
            'status'     => 'success',
            'created_at' => now()->toDateTimeString(),
        ]);

        $this->firebase->createDocument('activity_logs', [
            'user_id'    => $user['id'],
            'action'     => 'LOGIN',
            'ip'         => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now()->toDateTimeString(),
        ]);

        unset($user['password']);

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'data'    => [
                'user'  => $user,
                'token' => $token,
            ],
        ]);
    }

    // ─── POST /api/auth/logout ────────────────────────────────────────────────
    public function logout(Request $request)
    {
        $token = $request->bearerToken();

        if ($token) {
            $tokenHash = hash('sha256', $token);
            $tokens    = $this->firebase->getDocuments('user_tokens');

            foreach ($tokens as $t) {
                if (isset($t['token_hash']) && $t['token_hash'] === $tokenHash) {
                    $this->firebase->deleteDocument('user_tokens', $t['id']);
                    break;
                }
            }
        }

        $user = $request->attributes->get('auth_user');
        if ($user) {
            SecurityLogger::logout($user['id'] ?? 0, $request->ip());
            $this->firebase->createDocument('activity_logs', [
                'user_id'    => $user['id'],
                'action'     => 'LOGOUT',
                'ip'         => $request->ip(),
                'created_at' => now()->toDateTimeString(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    // ─── GET /api/auth/me ─────────────────────────────────────────────────────
    public function me(Request $request)
    {
        $user = $request->attributes->get('auth_user');

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        unset($user['password']);

        return response()->json([
            'success' => true,
            'data'    => $user,
        ]);
    }
}
