<?php

namespace Tests\Feature;

use App\Models\News;
use App\Models\User;
use App\Models\UserAuth;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NewsApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');

        // Seed base user/auth
        $user = User::create([
            'code' => 'U3000', 'name' => 'Viewer', 'mail' => 'viewer@example.com', 'enabled' => 1,
        ]);
        UserAuth::create([
            'user_id' => $user->id, 'email' => 'viewer@example.com', 'password' => bcrypt('Password!1'),
        ]);

        // Create some news
        $now = Carbon::now();
        for ($i = 0; $i < 3; $i++) {
            News::create([
                'type' => 0,
                'title' => 'Top News '.$i,
                'content' => 'Content '.$i,
                'created_id' => $user->id,
                'created_timestamp' => $now->copy()->subDays($i),
                'updated_id' => null,
                'updated_timestamp' => null,
            ]);
        }
    }

    public function test_unread_and_mark_read_flow(): void
    {
        $auth = UserAuth::where('email', 'viewer@example.com')->first();
        $this->actingAs($auth, 'web');

        // Initially all are unread
        $res = $this->getJson('/api/news/unread');
        $res->assertOk();
        $this->assertCount(3, $res->json('data'));

        $firstId = $res->json('data.0.id');

        // Mark first as read
        $read = $this->withHeader('X-CSRF-TOKEN', csrf_token())
            ->postJson('/api/news/read', ['news_id' => $firstId]);
        $read->assertOk()->assertJsonFragment(['news_id' => $firstId]);

        // Now unread should be 2
        $res2 = $this->getJson('/api/news/unread');
        $res2->assertOk();
        $this->assertCount(2, $res2->json('data'));
    }
}

