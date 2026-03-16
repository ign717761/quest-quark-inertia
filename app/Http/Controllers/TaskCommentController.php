<?php

namespace App\Http\Controllers;

use App\Http\Requests\TaskCommentStoreRequest;
use App\Http\Requests\TaskCommentUpdateRequest;
use App\Models\Task;
use App\Models\TaskComment;

class TaskCommentController extends Controller
{
    public function store(TaskCommentStoreRequest $request, Task $task)
    {
        $task->comments()->create([
            'author_id' => $request->user()->id,
            'body' => $request->validated()['body'],
        ]);

        return back()->with('success', 'Комментарий добавлен');
    }

    public function update(TaskCommentUpdateRequest $request, TaskComment $comment)
    {
        $comment->update([
            'body' => $request->validated()['body'],
        ]);

        return back()->with('success', 'Комментарий обновлен');
    }

    public function destroy(TaskComment $comment)
    {
        $user = request()->user();
        $board = $comment->task->column->board;
        $isAuthor = (int) $comment->author_id === (int) $user?->id;
        $isAdmin = $user?->can('delete', $board) ?? false;

        abort_unless($isAuthor || $isAdmin, 403);

        $comment->delete();

        return back()->with('success', 'Комментарий удален');
    }
}
