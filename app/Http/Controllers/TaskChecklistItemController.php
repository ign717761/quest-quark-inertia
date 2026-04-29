<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskChecklistItem;
use Illuminate\Http\Request;

class TaskChecklistItemController extends Controller
{
    public function store(Request $request, Task $task)
    {
        $this->authorize('update', $task->board);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $task->checklistItems()->create([
            'title' => $validated['title'],
            'is_completed' => false,
            'position' => ((int) $task->checklistItems()->max('position')) + 1,
        ]);

        return back()->with('success', 'Пункт чеклиста добавлен');
    }

    public function update(Request $request, TaskChecklistItem $checklistItem)
    {
        $this->authorize('update', $checklistItem->task->board);

        $checklistItem->update($request->validate([
            'title' => 'sometimes|string|max:255',
            'is_completed' => 'sometimes|boolean',
            'position' => 'sometimes|integer|min:0',
        ]));

        return back()->with('success', 'Пункт чеклиста обновлен');
    }

    public function destroy(TaskChecklistItem $checklistItem)
    {
        $this->authorize('update', $checklistItem->task->board);

        $checklistItem->delete();

        return back()->with('success', 'Пункт чеклиста удален');
    }
}
