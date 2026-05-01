<?php

use App\Models\Board;
use App\Models\Column;
use App\Models\User;

test('board creation returns success flash message', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('boards.store'), ['title' => 'Новая доска'])
        ->assertRedirect()
        ->assertSessionHas('success', 'Доска создана.');

    $board = Board::query()->where('title', 'Новая доска')->first();

    expect($board)->not->toBeNull()
        ->and($board?->columns()->count())->toBe(1);

    $column = Column::query()->where('board_id', $board->id)->sole();

    expect($column->title)->toBe('Бэклог')
        ->and($column->type)->toBe(Column::TYPE_BACKLOG)
        ->and($column->position)->toBe(0);
});

test('board deletion returns success flash message', function () {
    $user = User::factory()->create();
    $board = Board::create([
        'title' => 'Удаляемая доска',
        'user_id' => $user->id,
    ]);

    $board->users()->attach($user->id, ['role' => 'admin']);

    $this->actingAs($user)
        ->delete(route('boards.destroy', $board))
        ->assertRedirect(route('dashboard'))
        ->assertSessionHas('success', 'Доска удалена.');

    expect(Board::find($board->id))->toBeNull();
});
