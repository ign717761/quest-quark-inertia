<?php

declare(strict_types=1);

use App\Models\Board;
use App\Models\Column;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('admin can move any task on the board', function () {
    $admin = createUser('admin@example.com');
    $assignee = createUser('assignee@example.com');

    $board = Board::create([
        'title' => 'Demo board',
        'icon' => 'layout-grid',
        'user_id' => $admin->id,
    ]);

    $board->users()->attach($admin->id, ['role' => 'admin']);
    $board->users()->attach($assignee->id, ['role' => 'viewer']);

    $fromColumn = Column::create([
        'board_id' => $board->id,
        'title' => 'Todo',
        'position' => 0,
    ]);
    $toColumn = Column::create([
        'board_id' => $board->id,
        'title' => 'Done',
        'position' => 1,
    ]);

    $task = Task::create([
        'column_id' => $fromColumn->id,
        'creator_id' => $admin->id,
        'assignee_id' => $assignee->id,
        'title' => 'Assigned task',
        'description' => 'Task description',
        'position' => 0,
    ]);

    $this->actingAs($admin)
        ->patch(route('tasks.move', $task), [
            'column_id' => $toColumn->id,
            'task_ids' => [$task->id],
        ])
        ->assertRedirect();

    expect($task->fresh()->column_id)->toBe($toColumn->id);
});

test('viewer can move a task assigned to them', function () {
    $owner = createUser('owner@example.com');
    $viewer = createUser('viewer@example.com');

    $board = Board::create([
        'title' => 'Demo board',
        'icon' => 'layout-grid',
        'user_id' => $owner->id,
    ]);

    $board->users()->attach($owner->id, ['role' => 'admin']);
    $board->users()->attach($viewer->id, ['role' => 'viewer']);

    $fromColumn = Column::create([
        'board_id' => $board->id,
        'title' => 'Todo',
        'position' => 0,
    ]);
    $toColumn = Column::create([
        'board_id' => $board->id,
        'title' => 'Doing',
        'position' => 1,
    ]);

    $task = Task::create([
        'column_id' => $fromColumn->id,
        'creator_id' => $owner->id,
        'assignee_id' => $viewer->id,
        'title' => 'My task',
        'description' => 'Task description',
        'position' => 0,
    ]);

    $this->actingAs($viewer)
        ->patch(route('tasks.move', $task), [
            'column_id' => $toColumn->id,
            'task_ids' => [$task->id],
        ])
        ->assertRedirect();

    expect($task->fresh()->column_id)->toBe($toColumn->id);
});

test('viewer cannot move a task assigned to another user', function () {
    $owner = createUser('owner@example.com');
    $viewer = createUser('viewer@example.com');
    $anotherUser = createUser('another@example.com');

    $board = Board::create([
        'title' => 'Demo board',
        'icon' => 'layout-grid',
        'user_id' => $owner->id,
    ]);

    $board->users()->attach($owner->id, ['role' => 'admin']);
    $board->users()->attach($viewer->id, ['role' => 'viewer']);
    $board->users()->attach($anotherUser->id, ['role' => 'viewer']);

    $fromColumn = Column::create([
        'board_id' => $board->id,
        'title' => 'Todo',
        'position' => 0,
    ]);
    $toColumn = Column::create([
        'board_id' => $board->id,
        'title' => 'Doing',
        'position' => 1,
    ]);

    $task = Task::create([
        'column_id' => $fromColumn->id,
        'creator_id' => $owner->id,
        'assignee_id' => $anotherUser->id,
        'title' => 'Someone else task',
        'description' => 'Task description',
        'position' => 0,
    ]);

    $this->actingAs($viewer)
        ->patch(route('tasks.move', $task), [
            'column_id' => $toColumn->id,
            'task_ids' => [$task->id],
        ])
        ->assertRedirect()
        ->assertSessionHas('error', 'У вас нет прав на это действие.');

    expect($task->fresh()->column_id)->toBe($fromColumn->id);
});

function createUser(string $email): User
{
    return User::create([
        'name' => str($email)->before('@')->title()->toString(),
        'email' => $email,
        'password' => Hash::make('password'),
    ]);
}
