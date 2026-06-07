<?php

namespace App\Http\Controllers;

use App\Services\FirebaseService;

class FirebaseTestController extends Controller
{
    protected $firebase;

    public function __construct(FirebaseService $firebase)
    {
        $this->firebase = $firebase;
    }

    public function test()
    {
        $data = $this->firebase->createDocument('test_connections', [
            'message' => 'Laravel connected to Firebase Realtime Database',
            'created_at' => now()->toDateTimeString(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Firebase connected successfully',
            'data' => $data,
        ]);
    }
}