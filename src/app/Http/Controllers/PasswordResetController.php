<?php

namespace App\Http\Controllers;

use App\Http\Requests\PasswordForgotRequest;
use App\Http\Requests\PasswordResetCompleteRequest;
use App\Models\PasswordResetToken;
use App\Models\User;
use App\Models\UserAuth;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    public function forgot(PasswordForgotRequest $req)
    {
        $email = $req->validated()['email'];
        $user = User::where('mail', $email)->first();
        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $token = Str::random(60);
        PasswordResetToken::updateOrCreate(
            ['email' => $email],
            [
                'token' => $token,
                'expires_at' => Carbon::now()->addHours(2),
                'used_at' => null,
                'created_at' => Carbon::now(),
            ]
        );

        return response()->json(['message' => 'Reset token issued']);
    }

    public function verify(Request $request)
    {
        $token = (string) $request->query('token');
        $row = PasswordResetToken::where('token', $token)
            ->whereNull('used_at')
            ->where('expires_at', '>=', Carbon::now())
            ->first();
        if (! $row) {
            return response()->json(['valid' => false], 422);
        }
        return response()->json(['valid' => true, 'email' => $row->email]);
    }

    public function reset(PasswordResetCompleteRequest $req)
    {
        $data = $req->validated();
        $row = PasswordResetToken::where('token', $data['token'])
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
        $auth = UserAuth::where('user_id', $user->id)->first();
        if (! $auth) {
            return response()->json(['message' => 'Auth not exists'], 404);
        }

        $auth->password = Hash::make($data['password']);
        $auth->save();

        $row->used_at = Carbon::now();
        $row->save();

        return response()->json(['message' => 'Password reset completed']);
    }
}

