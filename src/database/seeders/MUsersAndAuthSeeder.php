<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserAuth;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class MUsersAndAuthSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            ['code' => 'U0001', 'name' => 'Alice', 'mail' => 'alice@example.com'],
            ['code' => 'U0002', 'name' => 'Bob',   'mail' => 'bob@example.com'],
            ['code' => 'U0003', 'name' => 'Carol', 'mail' => 'carol@example.com'],
        ];

        foreach ($users as $u) {
            $user = User::updateOrCreate(
                ['code' => $u['code']],
                [
                    'name' => $u['name'],
                    'mail' => $u['mail'],
                    'enabled' => 0,
                ]
            );

            UserAuth::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'email' => $u['mail'],
                    'password' => Hash::make('Password!1'),
                ]
            );
        }
    }
}
