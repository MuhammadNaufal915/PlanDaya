<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\FirebaseService;

class AdminController extends Controller
{
    public function __construct(protected FirebaseService $firebase) {}

    // ─── GET /api/admin/dashboard ─────────────────────────────────────────────
    public function dashboard(Request $request)
    {
        $users         = $this->firebase->getDocuments('users');
        $devices       = $this->firebase->getDocuments('devices');
        $schedules     = $this->firebase->getDocuments('schedules');
        $loginAttempts = $this->firebase->getDocuments('login_attempts');
        $securityEvents= $this->firebase->getDocuments('security_events');

        $failedLogins = array_filter($loginAttempts, fn($a) => ($a['status'] ?? '') === 'failed');

        return response()->json([
            'success' => true,
            'data'    => [
                'totals' => [
                    'users'             => count($users),
                    'devices'           => count($devices),
                    'schedules'         => count($schedules),
                    'failed_logins'     => count($failedLogins),
                    'security_events'   => count($securityEvents),
                ],
                'recent_security_events' => array_slice(array_reverse($securityEvents), 0, 10),
                'recent_login_attempts'  => array_slice(array_reverse($loginAttempts), 0, 10),
                'generated_at'           => now()->toDateTimeString(),
            ],
        ]);
    }

    // ─── GET /api/admin/users ─────────────────────────────────────────────────
    public function users(Request $request)
    {
        $users = $this->firebase->getDocuments('users');

        // Strip password hashes from response
        $safeUsers = array_map(function ($u) {
            unset($u['password']);
            return $u;
        }, $users);

        return response()->json([
            'success' => true,
            'data'    => array_values($safeUsers),
        ]);
    }

    // ─── GET /api/admin/logs ──────────────────────────────────────────────────
    public function logs(Request $request)
    {
        $limit    = min((int) $request->query('limit', 50), 200);
        $all      = $this->firebase->getDocuments('activity_logs');
        $reversed = array_reverse($all);
        $paged    = array_slice($reversed, 0, $limit);

        return response()->json([
            'success' => true,
            'data'    => array_values($paged),
            'total'   => count($all),
        ]);
    }

    // ─── GET /api/admin/security-events ──────────────────────────────────────
    public function securityEvents(Request $request)
    {
        $limit    = min((int) $request->query('limit', 50), 200);
        $all      = $this->firebase->getDocuments('security_events');
        $reversed = array_reverse($all);
        $paged    = array_slice($reversed, 0, $limit);

        return response()->json([
            'success' => true,
            'data'    => array_values($paged),
            'total'   => count($all),
        ]);
    }
}
