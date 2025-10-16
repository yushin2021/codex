<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserAuth;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DummyUsersSeeder extends Seeder
{
    public function run(): void
    {
        // 30件のダミーユーザーを投入（idempotent）
        // code: U1001..U1030 / email: user1001@example.com .. user1030@example.com
        for ($i = 1; $i <= 30; $i++) {
            $num = 1000 + $i; // 1001..1030
            $code = 'U' . $num;
            $name = 'User ' . $num;
            $email = 'user' . $num . '@example.com';

            $user = User::updateOrCreate(
                ['code' => $code],
                [
                    'name' => $name,
                    'mail' => $email,
                    'enabled' => $i % 2, // 交互に 1/0
                ]
            );

            UserAuth::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'email' => $email,
                    'password' => Hash::make('Password!1'),
                ]
            );
        }
    }
}

