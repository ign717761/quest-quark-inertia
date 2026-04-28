<?php

declare(strict_types=1);

use App\Models\Board;
use App\Models\Column;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('viewer cannot create tasks', function () {
    [$board, $backlog, , $viewer] = createTaskWorkflowScenario();

    $this->actingAs($viewer)
        ->post(route('tasks.store', $backlog), [
            'title' => 'Новая задача',
            'description' => 'Описание',
        ])
        ->assertForbidden();

    expect(Task::query()->where('title', 'Новая задача')->exists())->toBeFalse();
});

test('editor can create and update tasks', function () {
    [$board, $backlog, $doing, , $editor] = createTaskWorkflowScenario();

    $this->actingAs($editor)
        ->post(route('tasks.store', $backlog), [
            'title' => 'Новая задача',
            'description' => 'Описание',
            'assignee_id' => null,
        ])
        ->assertRedirect();

    $task = Task::query()->where('title', 'Новая задача')->firstOrFail();

    $this->actingAs($editor)
        ->patch(route('tasks.update', $task), [
            'title' => 'Обновленная задача',
            'description' => 'Новое описание',
            'assignee_id' => $editor->id,
        ])
        ->assertRedirect();

    expect($task->fresh())
        ->title->toBe('Обновленная задача')
        ->description->toBe('Новое описание')
        ->assignee_id->toBe($editor->id);
});

test('viewer can claim task from backlog and it becomes assigned to them', function () {
    [$board, $backlog, $doing, $viewer] = createTaskWorkflowScenario();

    $task = Task::create([
        'column_id' => $backlog->id,
        'creator_id' => $board->user_id,
        'assignee_id' => null,
        'title' => 'Задача из бэклога',
        'description' => 'Описание',
        'position' => 0,
    ]);

    $this->actingAs($viewer)
        ->patch(route('tasks.move', $task), [
            'column_id' => $doing->id,
            'task_ids' => [$task->id],
        ])
        ->assertRedirect();

    expect($task->fresh())
        ->column_id->toBe($doing->id)
        ->assignee_id->toBe($viewer->id);
});

test('user can move only their assigned task after claiming', function () {
    [$board, , $doing, $viewer, $editor] = createTaskWorkflowScenario();

    $viewerTask = Task::create([
        'column_id' => $doing->id,
        'creator_id' => $board->user_id,
        'assignee_id' => $viewer->id,
        'title' => 'Моя задача',
        'description' => 'Описание',
        'position' => 0,
    ]);

    $editorTask = Task::create([
        'column_id' => $doing->id,
        'creator_id' => $board->user_id,
        'assignee_id' => $editor->id,
        'title' => 'Чужая задача',
        'description' => 'Описание',
        'position' => 1,
    ]);

    $this->actingAs($viewer)
        ->patch(route('tasks.move', $viewerTask), [
            'column_id' => $doing->id,
            'task_ids' => [$editorTask->id, $viewerTask->id],
        ])
        ->assertRedirect();

    $this->actingAs($viewer)
        ->patch(route('tasks.move', $editorTask), [
            'column_id' => $doing->id,
            'task_ids' => [$viewerTask->id, $editorTask->id],
        ])
        ->assertRedirect()
        ->assertSessionHas('error', 'У вас нет прав на это действие.');
});

function createTaskWorkflowScenario(): array
{
    $owner = createWorkflowUser('owner@example.com');
    $editor = createWorkflowUser('editor@example.com');
    $viewer = createWorkflowUser('viewer@example.com');

    $board = Board::create([
        'title' => 'Workflow board',
        'user_id' => $owner->id,
    ]);

    $board->users()->attach($owner->id, ['role' => 'admin']);
    $board->users()->attach($editor->id, ['role' => 'editor']);
    $board->users()->attach($viewer->id, ['role' => 'viewer']);

    $backlog = Column::create([
        'board_id' => $board->id,
        'title' => 'Любое название',
        'type' => Column::TYPE_BACKLOG,
        'position' => 0,
    ]);

    $doing = Column::create([
        'board_id' => $board->id,
        'title' => 'В работе',
        'type' => Column::TYPE_IN_PROGRESS,
        'position' => 1,
    ]);

    return [$board, $backlog, $doing, $viewer, $editor];
}

function createWorkflowUser(string $email): User
{
    return User::create([
        'name' => str($email)->before('@')->title()->toString(),
        'email' => $email,
        'password' => Hash::make('password'),
    ]);
}
