<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PasswordResetToken extends Model
{
    use HasFactory;

    protected $table = 'password_reset_tokens';

    public $timestamps = false; // custom columns only

    protected $fillable = [
        'email', 'token', 'expires_at', 'used_at', 'created_at',
    ];
}

