<?php

namespace App\Http\Controllers;

use App\Models\News;
use App\Models\NewsRead;
use App\Models\UserAuth;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NewsController extends Controller
{
    public function unread(Request $request)
    {
        /** @var UserAuth $auth */
        $auth = Auth::guard('web')->user();
        $userId = optional($auth->user)->id;

        $query = News::query()
            ->whereNotExists(function ($q) use ($userId) {
                $q->selectRaw('1')
                    ->from('t_news_reads as r')
                    ->whereColumn('r.news_id', 't_news.id')
                    ->where('r.user_id', $userId);
            })
            ->orderByDesc('created_timestamp');

        $perPage = (int) $request->query('per_page', 10);
        $items = $query->paginate($perPage)->through(function (News $n) {
            return [
                'id' => $n->id,
                'type' => $n->type,
                'title' => $n->title,
                'created_timestamp' => $n->created_timestamp,
            ];
        });

        return response()->json($items);
    }

    public function markRead(Request $request)
    {
        $data = $request->validate([
            'news_id' => ['required', 'integer', 'exists:t_news,id'],
        ]);

        /** @var UserAuth $auth */
        $auth = Auth::guard('web')->user();
        $userId = optional($auth->user)->id;

        $read = NewsRead::firstOrCreate(
            [
                'news_id' => $data['news_id'],
                'user_id' => $userId,
            ],
            [
                'read_at' => Carbon::now(),
            ]
        );

        return response()->json([
            'news_id' => $read->news_id,
            'user_id' => $read->user_id,
            'read_at' => $read->read_at,
        ]);
    }
}

