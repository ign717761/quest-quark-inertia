<?php

use App\Models\Board;
use App\Models\Column;
use App\Models\User;

test('column creation returns success flash message', function () {
    $user = User::factory()->create();
    $board = Board::create([
        'title' => 'Demo board',
        'user_id' => $user->id,
    ]);

    $board->users()->attach($user->id, ['role' => 'admin']);

    $this->actingAs($user)
        ->post(route('columns.store', $board), [
            'title' => 'Новая колонка',
            'type' => Column::TYPE_BACKLOG,
        ])
        ->assertRedirect()
        ->assertSessionHas('success', 'Колонка создана.');
});

test('column update returns success flash message', function () {
    $user = User::factory()->create();
    $board = Board::create([
        'title' => 'Demo board',
        'user_id' => $user->id,
    ]);

    $board->users()->attach($user->id, ['role' => 'admin']);

    $column = Column::create([
        'board_id' => $board->id,
        'title' => 'Старая колонка',
        'type' => Column::TYPE_BACKLOG,
        'position' => 0,
    ]);

    $this->actingAs($user)
        ->patch(route('columns.update', $column), [
            'title' => 'Новая колонка',
            'type' => Column::TYPE_DONE,
        ])
        ->assertRedirect()
        ->assertSessionHas('success', 'Колонка обновлена.');

    expect($column->fresh()?->title)->toBe('Новая колонка')
        ->and($column->fresh()?->type)->toBe(Column::TYPE_DONE);
});
