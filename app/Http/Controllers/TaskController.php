<?php

namespace App\Http\Controllers;

use App\Http\Requests\TaskStoreRequest;
use App\Http\Requests\TaskUpdateRequest;
use App\Models\Column;
use App\Models\Task;
use Illuminate\Support\Facades\DB;

class TaskController extends Controller
{
    public function store(TaskStoreRequest $request, Column $column)
    {
        DB::transaction(function () use ($column, $request) {
            Task::where('column_id', $column->id)->increment('position');

            Task::create([
                'column_id' => $column->id,
                'creator_id' => $request->user()->id,
                'assignee_id' => $request->validated()['assignee_id'] ?? null,
                'title' => $request->validated()['title'],
                'description' => $request->validated()['description'] ?? '',
                'position' => 0,
            ]);
        });

        return back()->with('success', 'Задача создана');
    }

    public function update(TaskUpdateRequest $request, Task $task)
    {
        $task->update([
            'title' => $request->validated()['title'],
            'description' => $request->validated()['description'] ?? '',
            'assignee_id' => $request->validated()['assignee_id'] ?? null,
        ]);

        return back()->with('success', 'Задача обновлена');
    }

    public function destroy(Task $task)
    {
        /** @var Column $column */
        $column = $task->column;
        $this->authorize('update', $column->board);

        $columnId = $task->column_id;
        $oldPosition = $task->position;

        DB::transaction(function () use ($task, $columnId, $oldPosition) {
            $task->delete();

            Task::inColumn($columnId)
                ->where('position', '>', $oldPosition)
                ->decrement('position');
        });

        return back()->with('success', 'Задача удалена');
    }

    public function show() {}
}
