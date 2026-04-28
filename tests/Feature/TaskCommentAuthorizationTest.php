<?php

declare(strict_types=1);

use App\Models\Board;
use App\Models\Column;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('comment author can update their comment', function () {
    [$author, $board, $comment] = createCommentScenario();

    $this->actingAs($author)
        ->patch(route('comments.update', $comment), [
            'body' => 'Обновленный комментарий',
        ])
        ->assertRedirect();

    expect($comment->fresh()->body)->toBe('Обновленный комментарий');
});

test('board owner cannot update another users comment', function () {
    [, $board, $comment] = createCommentScenario();
    $owner = User::findOrFail($board->user_id);

    $this->actingAs($owner)
        ->patch(route('comments.update', $comment), [
            'body' => 'Недопустимое изменение',
        ])
        ->assertForbidden();

    expect($comment->fresh()->body)->toBe('Исходный комментарий');
});

test('board owner cannot delete another users comment', function () {
    [, $board, $comment] = createCommentScenario();
    $owner = User::findOrFail($board->user_id);

    $this->actingAs($owner)
        ->delete(route('comments.destroy', $comment))
        ->assertForbidden();

    expect(TaskComment::query()->whereKey($comment->id)->exists())->toBeTrue();
});

function createCommentScenario(): array
{
    $owner = createCommentUser('owner@example.com');
    $author = createCommentUser('author@example.com');

    $board = Board::create([
        'title' => 'Demo board',
        'user_id' => $owner->id,
    ]);

    $board->users()->attach($owner->id, ['role' => 'admin']);
    $board->users()->attach($author->id, ['role' => 'editor']);

    $column = Column::create([
        'board_id' => $board->id,
        'title' => 'Todo',
        'type' => Column::TYPE_IN_PROGRESS,
        'position' => 0,
    ]);

    $task = Task::create([
        'column_id' => $column->id,
        'creator_id' => $owner->id,
        'assignee_id' => $author->id,
        'title' => 'Task',
        'description' => 'Task description',
        'position' => 0,
    ]);

    $comment = TaskComment::create([
        'task_id' => $task->id,
        'author_id' => $author->id,
        'body' => 'Исходный комментарий',
    ]);

    return [$author, $board, $comment];
}

function createCommentUser(string $email): User
{
    return User::create([
        'name' => str($email)->before('@')->title()->toString(),
        'email' => $email,
        'password' => Hash::make('password'),
    ]);
}
