<?php

use App\Models\Board;
use App\Models\Column;
use App\Models\User;

test('moving a column returns success flash message', function () {
    $user = User::factory()->create();
    $board = Board::create([
        'title' => 'Demo board',
        'user_id' => $user->id,
    ]);
    $board->users()->attach($user->id, ['role' => 'admin']);

    $firstColumn = Column::create([
        'board_id' => $board->id,
        'title' => 'Backlog',
        'type' => Column::TYPE_BACKLOG,
        'position' => 0,
    ]);
    $secondColumn = Column::create([
        'board_id' => $board->id,
        'title' => 'Done',
        'type' => Column::TYPE_DONE,
        'position' => 1,
    ]);

    $this->actingAs($user)
        ->from(route('boards.settings.columns', $board))
        ->patch(route('columns.move', $secondColumn), ['position' => 0])
        ->assertRedirect(route('boards.settings.columns', $board))
        ->assertSessionHas('success', 'Порядок колонок обновлен.');

    expect($secondColumn->fresh()->position)->toBe(0)
        ->and($firstColumn->fresh()->position)->toBe(1);
});
