<?php

declare(strict_types=1);

use App\Models\Board;
use App\Models\Column;
use App\Models\Task;
use App\Models\User;

test('removing a board member unassigns their tasks in that board only', function () {
    $admin = User::factory()->create();
    $member = User::factory()->create();

    $board = Board::create([
        'title' => 'Основная доска',
        'user_id' => $admin->id,
    ]);
    $otherBoard = Board::create([
        'title' => 'Другая доска',
        'user_id' => $admin->id,
    ]);

    $board->users()->attach($admin->id, ['role' => 'admin']);
    $board->users()->attach($member->id, ['role' => 'editor']);
    $otherBoard->users()->attach($admin->id, ['role' => 'admin']);
    $otherBoard->users()->attach($member->id, ['role' => 'editor']);

    $boardColumn = Column::create([
        'board_id' => $board->id,
        'title' => 'В работе',
        'type' => Column::TYPE_IN_PROGRESS,
        'position' => 0,
    ]);
    $otherBoardColumn = Column::create([
        'board_id' => $otherBoard->id,
        'title' => 'В работе',
        'type' => Column::TYPE_IN_PROGRESS,
        'position' => 0,
    ]);

    $taskInRemovedBoard = Task::create([
        'column_id' => $boardColumn->id,
        'creator_id' => $admin->id,
        'assignee_id' => $member->id,
        'title' => 'Задача в основной доске',
        'description' => 'Описание',
        'position' => 0,
    ]);
    $taskInOtherBoard = Task::create([
        'column_id' => $otherBoardColumn->id,
        'creator_id' => $admin->id,
        'assignee_id' => $member->id,
        'title' => 'Задача в другой доске',
        'description' => 'Описание',
        'position' => 0,
    ]);

    $this->actingAs($admin)
        ->delete(route('boards.users.remove', ['board' => $board, 'user' => $member]))
        ->assertRedirect()
        ->assertSessionHas('success', 'Участник удален из доски.');

    expect($taskInRemovedBoard->fresh()?->assignee_id)->toBeNull()
        ->and($taskInOtherBoard->fresh()?->assignee_id)->toBe($member->id)
        ->and($board->users()->whereKey($member->id)->exists())->toBeFalse()
        ->and($otherBoard->users()->whereKey($member->id)->exists())->toBeTrue();
});
