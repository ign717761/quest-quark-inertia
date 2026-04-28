<?php

use App\Models\Board;
use App\Models\Column;
use App\Models\Task;
use App\Models\User;

test('deleting a column moves its tasks into the first remaining column', function () {
    $user = User::factory()->create();
    $board = Board::create([
        'title' => 'Demo board',
        'user_id' => $user->id,
    ]);
    $board->users()->attach($user->id, ['role' => 'admin']);

    $columnToDelete = Column::create([
        'board_id' => $board->id,
        'title' => 'In Progress',
        'type' => Column::TYPE_IN_PROGRESS,
        'position' => 0,
    ]);
    $destinationColumn = Column::create([
        'board_id' => $board->id,
        'title' => 'Done',
        'type' => Column::TYPE_DONE,
        'position' => 1,
    ]);

    $firstTask = Task::create([
        'column_id' => $columnToDelete->id,
        'creator_id' => $user->id,
        'assignee_id' => null,
        'title' => 'Task 1',
        'description' => 'First task',
        'position' => 0,
    ]);
    $secondTask = Task::create([
        'column_id' => $columnToDelete->id,
        'creator_id' => $user->id,
        'assignee_id' => null,
        'title' => 'Task 2',
        'description' => 'Second task',
        'position' => 1,
    ]);

    $existingTask = Task::create([
        'column_id' => $destinationColumn->id,
        'creator_id' => $user->id,
        'assignee_id' => null,
        'title' => 'Existing task',
        'description' => 'Already there',
        'position' => 0,
    ]);

    $this->actingAs($user)
        ->delete(route('columns.destroy', $columnToDelete))
        ->assertRedirect();

    expect(Column::find($columnToDelete->id))->toBeNull();

    $destinationColumn->refresh();
    expect($destinationColumn->position)->toBe(0);

    $movedTasks = Task::where('column_id', $destinationColumn->id)
        ->orderBy('position')
        ->pluck('id')
        ->all();

    expect($movedTasks)->toBe([
        $existingTask->id,
        $firstTask->id,
        $secondTask->id,
    ]);
});

test('deleting the last column creates a backlog column and keeps its tasks', function () {
    $user = User::factory()->create();
    $board = Board::create([
        'title' => 'Solo board',
        'user_id' => $user->id,
    ]);
    $board->users()->attach($user->id, ['role' => 'admin']);

    $onlyColumn = Column::create([
        'board_id' => $board->id,
        'title' => 'Todo',
        'type' => Column::TYPE_IN_PROGRESS,
        'position' => 0,
    ]);

    $task = Task::create([
        'column_id' => $onlyColumn->id,
        'creator_id' => $user->id,
        'assignee_id' => null,
        'title' => 'Saved task',
        'description' => 'Should survive',
        'position' => 0,
    ]);

    $this->actingAs($user)
        ->delete(route('columns.destroy', $onlyColumn))
        ->assertRedirect();

    expect(Column::find($onlyColumn->id))->toBeNull();

    $replacementColumn = Column::query()
        ->where('board_id', $board->id)
        ->sole();

    expect($replacementColumn->title)->toBe('Бэклог');
    expect($replacementColumn->type)->toBe(Column::TYPE_BACKLOG);
    expect($replacementColumn->position)->toBe(0);

    $task->refresh();
    expect($task->column_id)->toBe($replacementColumn->id);
    expect($task->position)->toBe(0);
});
