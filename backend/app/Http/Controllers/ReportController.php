<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\FirebaseService;

class ReportController extends Controller
{
    public function __construct(protected FirebaseService $firebase) {}

    // ─── GET /api/reports/daily ───────────────────────────────────────────────
    public function daily(Request $request)
    {
        $user    = $request->attributes->get('auth_user');
        $devices = $this->getUserDevices($user);
        $date    = $request->query('date', now()->toDateString());

        $report = $this->buildEnergyReport($devices, 'daily', $date);

        return response()->json(['success' => true, 'data' => $report]);
    }

    // ─── GET /api/reports/weekly ──────────────────────────────────────────────
    public function weekly(Request $request)
    {
        $user    = $request->attributes->get('auth_user');
        $devices = $this->getUserDevices($user);
        $week    = $request->query('week', now()->weekOfYear);

        $report = $this->buildEnergyReport($devices, 'weekly', (string) $week);

        return response()->json(['success' => true, 'data' => $report]);
    }

    // ─── GET /api/reports/monthly ─────────────────────────────────────────────
    public function monthly(Request $request)
    {
        $user    = $request->attributes->get('auth_user');
        $devices = $this->getUserDevices($user);
        $month   = $request->query('month', now()->format('Y-m'));

        $report = $this->buildEnergyReport($devices, 'monthly', $month);

        return response()->json(['success' => true, 'data' => $report]);
    }

    // ─── GET /api/reports/top-devices ────────────────────────────────────────
    public function topDevices(Request $request)
    {
        $user    = $request->attributes->get('auth_user');
        $devices = $this->getUserDevices($user);
        $limit   = min((int) $request->query('limit', 5), 20);

        // Sort by power_watt descending and return top N
        usort($devices, fn($a, $b) => ($b['power_watt'] ?? 0) <=> ($a['power_watt'] ?? 0));

        $top = array_slice($devices, 0, $limit);

        $topWithEstimate = array_map(function ($device) {
            $watt  = (float) ($device['power_watt'] ?? 0);
            return array_merge($device, [
                'daily_kwh'       => round($watt * 8 / 1000, 4),    // assume 8 h/day
                'monthly_kwh'     => round($watt * 8 * 30 / 1000, 4),
                'monthly_cost_idr'=> round($watt * 8 * 30 / 1000 * 1500), // Rp 1500/kWh
            ]);
        }, $top);

        return response()->json([
            'success' => true,
            'data'    => $topWithEstimate,
        ]);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function getUserDevices(array $user): array
    {
        $all = $this->firebase->getDocuments('devices');

        if (($user['role'] ?? 'user') === 'admin') {
            return $all;
        }

        return array_values(array_filter($all, fn($d) => ($d['user_id'] ?? '') === $user['id']));
    }

    private function buildEnergyReport(array $devices, string $period, string $label): array
    {
        $totalWatt   = array_sum(array_column($devices, 'power_watt'));
        $deviceCount = count($devices);

        // Simple energy estimate based on period
        $hours = match ($period) {
            'daily'   => 8,
            'weekly'  => 8 * 7,
            'monthly' => 8 * 30,
            default   => 8,
        };

        $kwh     = round($totalWatt * $hours / 1000, 4);
        $costIdr = round($kwh * 1500);

        return [
            'period'        => $period,
            'label'         => $label,
            'device_count'  => $deviceCount,
            'total_watt'    => $totalWatt,
            'total_kwh'     => $kwh,
            'estimated_cost'=> $costIdr,
            'currency'      => 'IDR',
            'generated_at'  => now()->toDateTimeString(),
            'devices'       => $devices,
        ];
    }
}
