<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\SignupController;
use App\Http\Controllers\PasswordResetController;
use Illuminate\Support\Facades\Route;

// SPA 認証 API（Sanctum + session cookie）
Route::middleware('web')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Signup (token DB 運用)
    Route::post('/signup/request', [SignupController::class, 'request']);
    Route::get('/signup/verify', [SignupController::class, 'verify']);
    Route::post('/signup/complete', [SignupController::class, 'complete']);

    // Password reset (token DB 運用)
    Route::post('/password/forgot', [PasswordResetController::class, 'forgot']);
    Route::get('/password/verify', [PasswordResetController::class, 'verify']);
    Route::post('/password/reset', [PasswordResetController::class, 'reset']);
});

Route::middleware(['web', 'auth:sanctum'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);

    // Users CRUD (list/create/get/update)
    Route::get('/users', [UsersController::class, 'index']);
    Route::post('/users', [UsersController::class, 'store']);
    Route::get('/users/{id}', [UsersController::class, 'show']);
    Route::put('/users/{id}', [UsersController::class, 'update']);

    // News (unread list and mark as read)
    Route::get('/news/unread', [NewsController::class, 'unread']);
    Route::post('/news/read', [NewsController::class, 'markRead']);
});
