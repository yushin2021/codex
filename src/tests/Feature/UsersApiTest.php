<?php

namespace Tests\Feature;

use App\Models\News;
use App\Models\User;
use App\Models\UserAuth;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UsersApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Migrate all tables
        $this->artisan('migrate');

        // Seed base users/auth
        User::create(['code' => 'U1000', 'name' => 'Base', 'mail' => 'base@example.com', 'enabled' => 1]);
        $base = User::where('code', 'U1000')->first();
        UserAuth::create(['user_id' => $base->id, 'email' => 'base@example.com', 'password' => bcrypt('Password!1')]);
    }

    public function test_user_crud_flow(): void
    {
        $auth = UserAuth::where('email', 'base@example.com')->first();
        $this->actingAs($auth, 'web');

        // Create
        $create = $this->withHeader('X-CSRF-TOKEN', csrf_token())->postJson('/api/users', [
            'code' => 'U2000',
            'name' => 'Tester',
            'mail' => 'tester@example.com',
            'enabled' => 1,
        ]);
        $create->assertCreated();
        $userId = $create->json('id');

        // News created
        $this->assertDatabaseHas('t_news', [
            'title' => 'ユーザー登録されました。',
        ]);

        // Index with search
        $index = $this->getJson('/api/users?q=U2000');
        $index->assertOk();
        $this->assertTrue(collect($index->json('data'))->contains(fn($u) => $u['id'] === $userId));

        // Show
        $show = $this->getJson('/api/users/'.$userId);
        $show->assertOk()->assertJsonFragment(['code' => 'U2000']);

        // Update
        $update = $this->withHeader('X-CSRF-TOKEN', csrf_token())->putJson('/api/users/'.$userId, [
            'code' => 'U2000',
            'name' => 'Tester 2',
            'mail' => 'tester@example.com',
            'enabled' => 0,
        ]);
        $update->assertOk()->assertJsonFragment(['name' => 'Tester 2', 'enabled' => 0]);
    }
}

