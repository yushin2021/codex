<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('m_users', function (Blueprint $table) {
            $table->id(); // big integer
            $table->string('code', 10)->unique();
            $table->string('name', 100);
            $table->string('mail', 255)->unique();
            $table->tinyInteger('enabled')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('m_users');
    }
};

