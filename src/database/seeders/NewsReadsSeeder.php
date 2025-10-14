<?php

namespace Database\Seeders;

use App\Models\News;
use App\Models\NewsRead;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class NewsReadsSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::take(3)->get();
        $newsList = News::all();
        $now = Carbon::now();

        foreach ($newsList as $idx => $news) {
            foreach ($users as $uIdx => $user) {
                // 適当に一部だけ既読にする
                if (($idx + $uIdx) % 2 === 0) {
                    NewsRead::firstOrCreate(
                        [
                            'news_id' => $news->id,
                            'user_id' => $user->id,
                        ],
                        [
                            'read_at' => $now->copy()->subDays($idx + $uIdx),
                        ]
                    );
                }
            }
        }
    }
}
