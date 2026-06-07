<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class SecurityLogger
{
    /**
     * Log a security event to the security log file.
     *
     * @param string $event  The event type (e.g. LOGIN_FAILED, RATE_LIMIT_TRIGGERED)
     * @param array  $context Key-value pairs to include in the log line
     */
    public static function log(string $event, array $context = []): void
    {
        $parts = ["[SECURITY] {$event}"];

        foreach ($context as $key => $value) {
            $parts[] = "{$key}=" . (is_string($value) ? "\"{$value}\"" : $value);
        }

        $message = implode(' ', $parts);

        // Write to dedicated security log channel
        Log::channel('security')->warning($message);
    }

    // ─── Convenience helpers ──────────────────────────────────────────────────

    public static function loginFailed(string $email, string $ip, string $reason = 'invalid_credentials'): void
    {
        self::log('LOGIN_FAILED', [
            'email'  => $email,
            'ip'     => $ip,
            'reason' => $reason,
        ]);
    }

    public static function loginSuccess(string $email, string $ip): void
    {
        self::log('LOGIN_SUCCESS', [
            'email' => $email,
            'ip'    => $ip,
        ]);
    }

    public static function logout(int $userId, string $ip): void
    {
        self::log('LOGOUT', [
            'user_id' => $userId,
            'ip'      => $ip,
        ]);
    }

    public static function register(string $email, string $ip): void
    {
        self::log('REGISTER', [
            'email' => $email,
            'ip'    => $ip,
        ]);
    }

    public static function adminAccessDenied(int $userId, string $ip, string $endpoint): void
    {
        self::log('ADMIN_ACCESS_DENIED', [
            'user_id'  => $userId,
            'ip'       => $ip,
            'endpoint' => $endpoint,
        ]);
    }

    public static function rateLimitTriggered(string $ip, string $endpoint): void
    {
        self::log('RATE_LIMIT_TRIGGERED', [
            'ip'       => $ip,
            'endpoint' => $endpoint,
        ]);
    }

    public static function suspiciousInput(string $ip, string $payload): void
    {
        self::log('SUSPICIOUS_INPUT', [
            'ip'      => $ip,
            'payload' => $payload,
        ]);
    }

    public static function unauthorizedAccess(int $userId, string $ip, string $endpoint): void
    {
        self::log('UNAUTHORIZED_ACCESS', [
            'user_id'  => $userId,
            'ip'       => $ip,
            'endpoint' => $endpoint,
        ]);
    }

    public static function deviceAction(string $action, int $userId, string $deviceId, string $ip): void
    {
        self::log("DEVICE_{$action}", [
            'user_id'   => $userId,
            'device_id' => $deviceId,
            'ip'        => $ip,
        ]);
    }
}
