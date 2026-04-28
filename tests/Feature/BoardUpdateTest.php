<?php

use App\Models\Board;
use App\Models\User;

test('board rename updates the board and redirects back to the board page', function () {
    $user = User::factory()->create();
    $board = Board::create([
        'title' => 'Старая доска',
        'user_id' => $user->id,
    ]);

    $board->users()->attach($user->id, ['role' => 'admin']);

    $this->actingAs($user)
        ->patch(route('boards.update', $board), ['title' => 'Новая доска'])
        ->assertRedirect(route('boards.show', $board));

    expect($board->fresh()->title)->toBe('Новая доска');
});
