<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskTagController extends Controller
{
    public function store(Request $request, Task $task)
    {
        $this->authorize('update', $task->board);

        $validated = $request->validate([
            'tag_id' => 'required|exists:tags,id',
        ]);

        $tag = Tag::query()->findOrFail($validated['tag_id']);
        abort_unless((int) $tag->board_id === (int) $task->board_id, 422);

        $task->tags()->syncWithoutDetaching([$tag->id]);

        return back()->with('success', 'Тег добавлен к задаче');
    }

    public function destroy(Task $task, Tag $tag)
    {
        $this->authorize('update', $task->board);
        abort_unless((int) $tag->board_id === (int) $task->board_id, 422);

        $task->tags()->detach($tag->id);

        return back()->with('success', 'Тег удален из задачи');
    }
}
