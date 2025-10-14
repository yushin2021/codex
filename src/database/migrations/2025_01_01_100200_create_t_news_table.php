<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('t_news', function (Blueprint $table) {
            $table->id();
            $table->integer('type')->default(0);
            $table->string('title');
            $table->text('content');
            $table->foreignId('created_id')->constrained('m_users');
            $table->timestamp('created_timestamp');
            $table->foreignId('updated_id')->nullable()->constrained('m_users');
            $table->timestamp('updated_timestamp')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_news');
    }
};

