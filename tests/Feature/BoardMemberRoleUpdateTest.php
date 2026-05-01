<?php

use App\Models\Board;
use App\Models\User;

test('updating board member role returns success flash message', function () {
    $admin = User::factory()->create();
    $member = User::factory()->create();

    $board = Board::create([
        'title' => 'Demo board',
        'user_id' => $admin->id,
    ]);

    $board->users()->attach($admin->id, ['role' => 'admin']);
    $board->users()->attach($member->id, ['role' => 'editor']);

    $this->actingAs($admin)
        ->patch(route('boards.users.update', ['board' => $board, 'user' => $member]), [
            'role' => 'viewer',
        ])
        ->assertRedirect()
        ->assertSessionHas('success', 'Роль участника обновлена.');

    expect($board->users()->whereKey($member->id)->first()?->pivot?->role)->toBe('viewer');
});
