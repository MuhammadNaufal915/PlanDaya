<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\FirebaseService;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create a local Laravel test user if needed.
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Create or update the admin account in Firebase.
        $firebase = app(FirebaseService::class);
        $existing = null;

        foreach ($firebase->getDocuments('users') as $user) {
            if (isset($user['email']) && $user['email'] === 'boerayot@gmail.com') {
                $existing = $user;
                break;
            }
        }

        $adminData = [
            'name'       => 'boerayot',
            'email'      => 'boerayot@gmail.com',
            'password'   => Hash::make('Boerayotmaujadihacker118626!'),
            'role'       => 'admin',
            'is_active'  => true,
            'created_at' => now()->toDateTimeString(),
            'updated_at' => now()->toDateTimeString(),
        ];

        if ($existing && isset($existing['id'])) {
            $firebase->updateDocument('users', $existing['id'], $adminData);
        } else {
            $firebase->createDocument('users', $adminData);
        }
    }
}
