<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

// SPA 認証 API（Sanctum + session cookie）
Route::middleware('web')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::middleware(['web', 'auth:sanctum'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
});

