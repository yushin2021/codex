<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    use HasFactory;

    protected $table = 'm_users';

    protected $fillable = [
        'code',
        'name',
        'mail',
        'enabled',
    ];

    public function auth()
    {
        return $this->hasOne(UserAuth::class, 'user_id');
    }
}
