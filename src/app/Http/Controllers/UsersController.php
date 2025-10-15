<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserStoreRequest;
use App\Http\Requests\UserUpdateRequest;
use App\Models\News;
use App\Models\User;
use App\Models\UserAuth;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;
use Spatie\QueryBuilder\QueryBuilder;

class UsersController extends Controller
{
    public function index(Request $request)
    {
        $query = QueryBuilder::for(User::query())
            ->allowedFilters([
                AllowedFilter::callback('q', function ($q, $value) {
                    $q->where(function ($sub) use ($value) {
                        $v = "%".str_replace(['%','_'], ['\\%','\\_'], $value)."%";
                        $sub->where('code', 'like', $v)
                            ->orWhere('name', 'like', $v)
                            ->orWhere('mail', 'like', $v);
                    });
                }),
                AllowedFilter::exact('enabled'),
            ])
            ->allowedSorts([
                AllowedSort::field('code'),
                AllowedSort::field('name'),
                AllowedSort::field('mail'),
                AllowedSort::field('created_at'),
            ])
            ->defaultSort('code');

        $perPage = (int) $request->query('per_page', 15);
        $users = $query->paginate($perPage)->appends($request->query());

        return response()->json($users);
    }

    public function store(UserStoreRequest $request)
    {
        /** @var UserAuth $auth */
        $auth = Auth::guard('web')->user();

        $data = $request->validated();
        $user = User::create([
            'code' => $data['code'],
            'name' => $data['name'],
            'mail' => $data['mail'],
            'enabled' => isset($data['enabled']) ? (int) $data['enabled'] : 0,
        ]);

        News::create([
            'type' => 0,
            'title' => 'ユーザー登録されました。',
            'content' => sprintf('ID:%d, code:%s, name:%s が登録されました。', $user->id, $user->code, $user->name),
            'created_id' => optional($auth->user)->id,
            'created_timestamp' => Carbon::now(),
            'updated_id' => null,
            'updated_timestamp' => null,
        ]);

        return response()->json($user, 201);
    }

    public function show(int $id)
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    public function update(UserUpdateRequest $request, int $id)
    {
        $user = User::findOrFail($id);
        $data = $request->validated();
        $user->update([
            'code' => $data['code'],
            'name' => $data['name'],
            'mail' => $data['mail'],
            'enabled' => isset($data['enabled']) ? (int) $data['enabled'] : $user->enabled,
        ]);

        return response()->json($user);
    }
}

