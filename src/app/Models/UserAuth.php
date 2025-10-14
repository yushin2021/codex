<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class UserAuth extends Authenticatable
{
    use HasFactory;

    protected $table = 'm_auth';

    protected $fillable = [
        'user_id',
        'email',
        'password',
        'remember_token',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
