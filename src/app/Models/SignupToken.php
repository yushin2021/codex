<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SignupToken extends Model
{
    use HasFactory;

    protected $table = 'signup_tokens';

    public $timestamps = false; // uses created_at only

    protected $fillable = [
        'email', 'token', 'expires_at', 'used_at', 'created_at',
    ];
}

