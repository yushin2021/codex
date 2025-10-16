<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            MUsersAndAuthSeeder::class,
            DummyUsersSeeder::class,
            NewsSeeder::class,
            NewsReadsSeeder::class,
            SignupTokensSeeder::class,
            PasswordResetTokensSeeder::class,
        ]);
    }
}
