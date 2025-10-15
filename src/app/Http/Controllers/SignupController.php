<?php

namespace App\Http\Controllers;

use App\Http\Requests\SignupCompleteRequest;
use App\Http\Requests\SignupRequestRequest;
use App\Models\SignupToken;
use App\Models\User;
use App\Models\UserAuth;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SignupController extends Controller
{
    public function request(SignupRequestRequest $req)
    {
        $email = $req->validated()['email'];
        $user = User::where('mail', $email)->first();
        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $token = Str::random(60);
        SignupToken::updateOrCreate(
            ['email' => $email],
            [
                'token' => $token,
                'expires_at' => Carbon::now()->addHours(24),
                'used_at' => null,
                'created_at' => Carbon::now(),
            ]
        );

        // メール送信は行わず、DB保存のみ。検証用に最低限のレスポンスを返す。
        return response()->json(['message' => 'Token issued'], 201);
    }

    public function verify(Request $request)
    {
        $token = (string) $request->query('token');
        $row = SignupToken::where('token', $token)
            ->whereNull('used_at')
            ->where('expires_at', '>=', Carbon::now())
            ->first();
        if (! $row) {
            return response()->json(['valid' => false], 422);
        }
        return response()->json(['valid' => true, 'email' => $row->email]);
    }

    public function complete(SignupCompleteRequest $req)
    {
        $data = $req->validated();
        $row = SignupToken::where('token', $data['token'])
            ->whereNull('used_at')
            ->where('expires_at', '>=', Carbon::now())
            ->first();
        if (! $row) {
            return response()->json(['message' => 'Invalid token'], 422);
        }

        $user = User::where('mail', $row->email)->first();
        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        UserAuth::updateOrCreate(
            ['user_id' => $user->id],
            [
                'email' => $row->email,
                'password' => Hash::make($data['password']),
            ]
        );

        $row->used_at = Carbon::now();
        $row->save();

        return response()->json(['message' => 'Signup completed']);
    }
}

