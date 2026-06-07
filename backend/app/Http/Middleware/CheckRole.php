<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\SecurityLogger;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Only allow users with the specified role(s) to pass through.
     * Usage in routes: ->middleware('role:admin')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->attributes->get('auth_user');

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (!in_array($user['role'] ?? 'user', $roles, true)) {
            SecurityLogger::adminAccessDenied(
                $user['id'] ?? 0,
                $request->ip(),
                $request->path()
            );

            return response()->json([
                'success' => false,
                'message' => 'Forbidden. Insufficient permissions.',
            ], 403);
        }

        return $next($request);
    }
}
