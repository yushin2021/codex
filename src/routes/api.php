<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\NewsController;
use Illuminate\Support\Facades\Route;

// SPA 認証 API（Sanctum + session cookie）
Route::middleware('web')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout']);
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
