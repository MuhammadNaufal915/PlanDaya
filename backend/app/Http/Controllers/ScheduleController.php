<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\FirebaseService;
use App\Services\SecurityLogger;

class ScheduleController extends Controller
{
    public function __construct(protected FirebaseService $firebase) {}

    // ─── GET /api/schedules ───────────────────────────────────────────────────
    public function index(Request $request)
    {
        $user      = $request->attributes->get('auth_user');
        $schedules = $this->firebase->getDocuments('schedules');

        if (($user['role'] ?? 'user') !== 'admin') {
            $schedules = array_values(array_filter($schedules, fn($s) => ($s['user_id'] ?? '') === $user['id']));
        }

        return response()->json(['success' => true, 'data' => $schedules]);
    }

    // ─── POST /api/schedules ──────────────────────────────────────────────────
    public function store(Request $request)
    {
        $user = $request->attributes->get('auth_user');

        $validated = $request->validate([
            'device_id'   => ['required', 'string'],
            'label'       => ['required', 'string', 'max:100'],
            'start_time'  => ['required', 'date_format:H:i'],
            'end_time'    => ['required', 'date_format:H:i', 'after:start_time'],
            'days'        => ['required', 'array', 'min:1'],
            'days.*'      => ['in:Mon,Tue,Wed,Thu,Fri,Sat,Sun'],
            'is_active'   => ['sometimes', 'boolean'],
        ]);

        // Verify device belongs to user
        $device = $this->firebase->getDocument('devices', $validated['device_id']);
        if (!$device || (($user['role'] ?? 'user') !== 'admin' && ($device['user_id'] ?? '') !== $user['id'])) {
            return response()->json(['success' => false, 'message' => 'Device not found or forbidden.'], 403);
        }

        $scheduleData = array_merge($validated, [
            'user_id'    => $user['id'],
            'is_active'  => $validated['is_active'] ?? true,
            'created_at' => now()->toDateTimeString(),
            'updated_at' => now()->toDateTimeString(),
        ]);

        $schedule = $this->firebase->createDocument('schedules', $scheduleData);

        $this->firebase->createDocument('activity_logs', [
            'user_id'     => $user['id'],
            'action'      => 'SCHEDULE_CREATED',
            'schedule_id' => $schedule['id'],
            'ip'          => $request->ip(),
            'created_at'  => now()->toDateTimeString(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Schedule created successfully.',
            'data'    => $schedule,
        ], 201);
    }

    // ─── GET /api/schedules/{id} ──────────────────────────────────────────────
    public function show(Request $request, string $id)
    {
        $user     = $request->attributes->get('auth_user');
        $schedule = $this->firebase->getDocument('schedules', $id);

        if (!$schedule) {
            return response()->json(['success' => false, 'message' => 'Schedule not found.'], 404);
        }

        if (($user['role'] ?? 'user') !== 'admin' && ($schedule['user_id'] ?? '') !== $user['id']) {
            SecurityLogger::unauthorizedAccess($user['id'], $request->ip(), $request->path());
            return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
        }

        return response()->json(['success' => true, 'data' => $schedule]);
    }

    // ─── PUT /api/schedules/{id} ──────────────────────────────────────────────
    public function update(Request $request, string $id)
    {
        $user     = $request->attributes->get('auth_user');
        $schedule = $this->firebase->getDocument('schedules', $id);

        if (!$schedule) {
            return response()->json(['success' => false, 'message' => 'Schedule not found.'], 404);
        }

        if (($user['role'] ?? 'user') !== 'admin' && ($schedule['user_id'] ?? '') !== $user['id']) {
            SecurityLogger::unauthorizedAccess($user['id'], $request->ip(), $request->path());
            return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'label'      => ['sometimes', 'string', 'max:100'],
            'start_time' => ['sometimes', 'date_format:H:i'],
            'end_time'   => ['sometimes', 'date_format:H:i'],
            'days'       => ['sometimes', 'array', 'min:1'],
            'days.*'     => ['in:Mon,Tue,Wed,Thu,Fri,Sat,Sun'],
            'is_active'  => ['sometimes', 'boolean'],
        ]);

        $validated['updated_at'] = now()->toDateTimeString();

        $updated = $this->firebase->updateDocument('schedules', $id, $validated);

        return response()->json([
            'success' => true,
            'message' => 'Schedule updated successfully.',
            'data'    => $updated,
        ]);
    }

    // ─── DELETE /api/schedules/{id} ───────────────────────────────────────────
    public function destroy(Request $request, string $id)
    {
        $user     = $request->attributes->get('auth_user');
        $schedule = $this->firebase->getDocument('schedules', $id);

        if (!$schedule) {
            return response()->json(['success' => false, 'message' => 'Schedule not found.'], 404);
        }

        if (($user['role'] ?? 'user') !== 'admin' && ($schedule['user_id'] ?? '') !== $user['id']) {
            SecurityLogger::unauthorizedAccess($user['id'], $request->ip(), $request->path());
            return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
        }

        $this->firebase->deleteDocument('schedules', $id);

        return response()->json([
            'success' => true,
            'message' => 'Schedule deleted successfully.',
        ]);
    }
}
