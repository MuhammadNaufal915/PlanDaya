<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\FirebaseService;
use App\Services\SecurityLogger;

class DeviceController extends Controller
{
    public function __construct(protected FirebaseService $firebase) {}

    // ─── GET /api/devices ─────────────────────────────────────────────────────
    public function index(Request $request)
    {
        $user    = $request->attributes->get('auth_user');
        $devices = $this->firebase->getDocuments('devices');

        // Regular users only see their own devices
        if (($user['role'] ?? 'user') !== 'admin') {
            $devices = array_values(array_filter($devices, fn($d) => ($d['user_id'] ?? '') === $user['id']));
        }

        return response()->json([
            'success' => true,
            'data'    => $devices,
        ]);
    }

    // ─── POST /api/devices ────────────────────────────────────────────────────
    public function store(Request $request)
    {
        $user = $request->attributes->get('auth_user');

        $validated = $request->validate([
            'name'        => ['required', 'string', 'min:2', 'max:100'],
            'category'    => ['required', 'string', 'max:50'],
            'power_watt'  => ['required', 'numeric', 'min:1', 'max:100000'],
            'location'    => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        $deviceData = array_merge($validated, [
            'user_id'    => $user['id'],
            'is_active'  => true,
            'created_at' => now()->toDateTimeString(),
            'updated_at' => now()->toDateTimeString(),
        ]);

        $device = $this->firebase->createDocument('devices', $deviceData);

        SecurityLogger::deviceAction('CREATED', $user['id'], $device['id'], $request->ip());

        $this->firebase->createDocument('activity_logs', [
            'user_id'    => $user['id'],
            'action'     => 'DEVICE_CREATED',
            'device_id'  => $device['id'],
            'ip'         => $request->ip(),
            'created_at' => now()->toDateTimeString(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Device created successfully.',
            'data'    => $device,
        ], 201);
    }

    // ─── GET /api/devices/{id} ────────────────────────────────────────────────
    public function show(Request $request, string $id)
    {
        $user   = $request->attributes->get('auth_user');
        $device = $this->firebase->getDocument('devices', $id);

        if (!$device) {
            return response()->json(['success' => false, 'message' => 'Device not found.'], 404);
        }

        // Authorization check
        if (($user['role'] ?? 'user') !== 'admin' && ($device['user_id'] ?? '') !== $user['id']) {
            SecurityLogger::unauthorizedAccess($user['id'], $request->ip(), $request->path());
            return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
        }

        return response()->json(['success' => true, 'data' => $device]);
    }

    // ─── PUT /api/devices/{id} ────────────────────────────────────────────────
    public function update(Request $request, string $id)
    {
        $user   = $request->attributes->get('auth_user');
        $device = $this->firebase->getDocument('devices', $id);

        if (!$device) {
            return response()->json(['success' => false, 'message' => 'Device not found.'], 404);
        }

        if (($user['role'] ?? 'user') !== 'admin' && ($device['user_id'] ?? '') !== $user['id']) {
            SecurityLogger::unauthorizedAccess($user['id'], $request->ip(), $request->path());
            return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'name'        => ['sometimes', 'string', 'min:2', 'max:100'],
            'category'    => ['sometimes', 'string', 'max:50'],
            'power_watt'  => ['sometimes', 'numeric', 'min:1', 'max:100000'],
            'location'    => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'is_active'   => ['sometimes', 'boolean'],
        ]);

        $validated['updated_at'] = now()->toDateTimeString();

        $updated = $this->firebase->updateDocument('devices', $id, $validated);

        SecurityLogger::deviceAction('UPDATED', $user['id'], $id, $request->ip());

        return response()->json([
            'success' => true,
            'message' => 'Device updated successfully.',
            'data'    => $updated,
        ]);
    }

    // ─── DELETE /api/devices/{id} ─────────────────────────────────────────────
    public function destroy(Request $request, string $id)
    {
        $user   = $request->attributes->get('auth_user');
        $device = $this->firebase->getDocument('devices', $id);

        if (!$device) {
            return response()->json(['success' => false, 'message' => 'Device not found.'], 404);
        }

        if (($user['role'] ?? 'user') !== 'admin' && ($device['user_id'] ?? '') !== $user['id']) {
            SecurityLogger::unauthorizedAccess($user['id'], $request->ip(), $request->path());
            return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
        }

        $this->firebase->deleteDocument('devices', $id);

        SecurityLogger::deviceAction('DELETED', $user['id'], $id, $request->ip());

        return response()->json([
            'success' => true,
            'message' => 'Device deleted successfully.',
        ]);
    }
}
