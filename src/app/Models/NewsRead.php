<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NewsRead extends Model
{
    use HasFactory;

    protected $table = 't_news_reads';

    public $timestamps = false;

    protected $fillable = [
        'news_id', 'user_id', 'read_at',
    ];

    public function news()
    {
        return $this->belongsTo(News::class, 'news_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

