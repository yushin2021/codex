<?php

namespace Database\Seeders;

use App\Models\SignupToken;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class SignupTokensSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $rows = [
            ['email' => 'alice@example.com', 'days' => 7, 'used' => null],
            ['email' => 'bob@example.com',   'days' => 3, 'used' => null],
            ['email' => 'carol@example.com', 'days' => 1, 'used' => $now->copy()->subHours(6)],
        ];

        foreach ($rows as $r) {
            SignupToken::updateOrCreate(
                ['email' => $r['email']],
                [
                    'token' => Str::random(40),
                    'expires_at' => $now->copy()->addDays($r['days']),
                    'used_at' => $r['used'],
                    'created_at' => $now,
                ]
            );
        }
    }
}
