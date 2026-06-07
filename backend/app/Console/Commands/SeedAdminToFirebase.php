<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use App\Services\FirebaseService;

class SeedAdminToFirebase extends Command
{
    protected $signature = 'firebase:seed-admin';

    protected $description = 'Create default admin account in Firebase Realtime Database';

    public function handle(FirebaseService $firebase)
    {
        $admin = [
            'name' => 'Boerayot Admin',
            'email' => 'boerayotiniadmin@gmail.com',
            'password_hash' => Hash::make('Boerayotmaujadihacker118626!'),
            'role' => 'admin',
            'status' => 'active',
            'created_at' => now()->toDateTimeString(),
            'updated_at' => now()->toDateTimeString(),
        ];

        $firebase->createDocument('users', $admin);

        $this->info('Admin account successfully created in Firebase.');
        $this->info('Email: boerayotiniadmin@gmail.com');
        $this->info('Password: Boerayotmaujadihacker118626!');

        return Command::SUCCESS;
    }
}