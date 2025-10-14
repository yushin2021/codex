<?php

namespace Database\Seeders;

use App\Models\News;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class NewsSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::take(3)->get();
        if ($users->count() === 0) {
            return;
        }

        $now = Carbon::now();

        $items = [
            ['type' => 0, 'title' => 'Welcome', 'content' => 'ようこそ、システムへ。'],
            ['type' => 1, 'title' => 'Maintenance', 'content' => '今夜メンテナンスを実施します。'],
            ['type' => 2, 'title' => 'Feature', 'content' => '新機能をリリースしました。'],
        ];

        foreach ($items as $i => $item) {
            $creator = $users[$i % $users->count()];
            $updater = $users[($i + 1) % $users->count()];

            News::firstOrCreate(
                ['title' => $item['title']],
                [
                    'type' => $item['type'],
                    'content' => $item['content'],
                    'created_id' => $creator->id,
                    'created_timestamp' => $now->copy()->subDays(5 - $i),
                    'updated_id' => $updater->id,
                    'updated_timestamp' => $now->copy()->subDays(3 - $i),
                ]
            );
        }
    }
}
