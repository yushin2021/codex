<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('t_news_reads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('news_id')->constrained('t_news');
            $table->foreignId('user_id')->constrained('m_users');
            $table->timestamp('read_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_news_reads');
    }
};

