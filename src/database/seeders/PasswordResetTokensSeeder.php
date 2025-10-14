<?php

namespace Database\Seeders;

use App\Models\PasswordResetToken;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class PasswordResetTokensSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $rows = [
            ['email' => 'alice@example.com', 'hours' => 24, 'used' => null],
            ['email' => 'bob@example.com',   'hours' =>  6, 'used' => $now->copy()->subHours(1)],
        ];

        foreach ($rows as $r) {
            PasswordResetToken::updateOrCreate(
                ['email' => $r['email']],
                [
                    'token' => Str::random(60),
                    'expires_at' => $now->copy()->addHours($r['hours']),
                    'used_at' => $r['used'],
                    'created_at' => $now,
                ]
            );
        }
    }
}
