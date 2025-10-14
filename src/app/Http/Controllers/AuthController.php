<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $credentials = $request->only(['email', 'password']);

        if (! Auth::guard('web')->attempt($credentials)) {
            return response()->json(['message' => 'Invalid credentials'], Response::HTTP_UNAUTHORIZED);
        }

        $request->session()->regenerate();

        /** @var \App\Models\UserAuth $auth */
        $auth = Auth::guard('web')->user();

        return response()->json([
            'auth' => [
                'id' => $auth->id,
                'email' => $auth->email,
            ],
            'user' => optional($auth->user)->only(['id', 'code', 'name', 'mail', 'enabled']),
        ]);
    }

    public function me(Request $request)
    {
        /** @var \App\Models\UserAuth|null $auth */
        $auth = Auth::guard('web')->user();
        if (! $auth) {
            return response()->json(['message' => 'Unauthenticated'], Response::HTTP_UNAUTHORIZED);
        }

        return response()->json([
            'auth' => [
                'id' => $auth->id,
                'email' => $auth->email,
            ],
            'user' => optional($auth->user)->only(['id', 'code', 'name', 'mail', 'enabled']),
        ]);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out']);
    }
}

