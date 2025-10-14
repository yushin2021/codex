<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class News extends Model
{
    use HasFactory;

    protected $table = 't_news';

    public $timestamps = false; // uses custom timestamp columns

    protected $fillable = [
        'type', 'title', 'content',
        'created_id', 'created_timestamp',
        'updated_id', 'updated_timestamp',
    ];

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_id');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_id');
    }
}

