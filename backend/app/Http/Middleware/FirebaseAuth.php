<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\FirebaseService;
use Symfony\Component\HttpFoundation\Response;

/**
 * Firebase-backed token authentication middleware.
 * Validates Bearer tokens against the user_tokens collection in Firebase.
 */
class FirebaseAuth
{
    public function __construct(protected FirebaseService $firebase) {}

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. No token provided.',
            ], 401);
        }

        $tokenHash = hash('sha256', $token);
        $tokens    = $this->firebase->getDocuments('user_tokens');
        $tokenDoc  = null;

        foreach ($tokens as $t) {
            if (isset($t['token_hash']) && $t['token_hash'] === $tokenHash) {
                $tokenDoc = $t;
                break;
            }
        }

        if (!$tokenDoc) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Invalid token.',
            ], 401);
        }

        // Check expiry
        if (isset($tokenDoc['expires_at']) && now()->isAfter($tokenDoc['expires_at'])) {
            $this->firebase->deleteDocument('user_tokens', $tokenDoc['id']);
            return response()->json([
                'success' => false,
                'message' => 'Token expired. Please login again.',
            ], 401);
        }

        // Fetch the user
        $user = $this->firebase->getDocument('users', $tokenDoc['user_id']);

        if (!$user || !($user['is_active'] ?? true)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. User not found or disabled.',
            ], 401);
        }

        // Attach user to request
        $request->attributes->set('auth_user', $user);

        return $next($request);
    }
}
