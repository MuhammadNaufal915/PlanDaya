<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\SecurityLogger;
use Symfony\Component\HttpFoundation\Response;

/**
 * Detect and log potentially malicious input patterns such as
 * XSS payloads, SQL injection attempts, or path traversal strings.
 */
class SanitizeInput
{
    private array $patterns = [
        '/<script[\s\S]*?>[\s\S]*?<\/script>/i',
        '/javascript\s*:/i',
        '/on\w+\s*=/i',
        '/union\s+select/i',
        '/drop\s+table/i',
        '/insert\s+into/i',
        '/delete\s+from/i',
        '/\.\.\//i',
        '/exec\s*\(/i',
        '/eval\s*\(/i',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $input = json_encode($request->all());

        foreach ($this->patterns as $pattern) {
            if (preg_match($pattern, $input)) {
                SecurityLogger::suspiciousInput($request->ip(), $input);

                return response()->json([
                    'success' => false,
                    'message' => 'Request contains potentially malicious content.',
                ], 422);
            }
        }

        return $next($request);
    }
}
