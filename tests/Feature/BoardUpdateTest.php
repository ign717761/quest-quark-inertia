<?php

use App\Models\Board;
use App\Models\User;

test('board update changes title and redirects back', function () {
    $user = User::factory()->create();
    $board = Board::create([
        'title' => 'Старая доска',
        'user_id' => $user->id,
    ]);

    $board->users()->attach($user->id, ['role' => 'admin']);

    $this->actingAs($user)
        ->from(route('boards.settings', $board))
        ->patch(route('boards.update', $board), ['title' => 'Новая доска'])
        ->assertRedirect(route('boards.settings', $board))
        ->assertSessionHas('success', 'Доска обновлена.');

    expect($board->fresh()->title)->toBe('Новая доска');
});
