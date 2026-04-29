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
                'board_id' => $column->board_id,
                'column_id' => $column->id,
                'created_by' => $request->user()->id,
                'assignee_id' => $request->validated()['assignee_id'] ?? null,
                'title' => $request->validated()['title'],
                'description' => $request->validated()['description'] ?? '',
                'priority' => $request->validated()['priority'] ?? Task::PRIORITY_MEDIUM,
                'due_date' => $request->validated()['due_date'] ?? null,
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
            'priority' => $request->validated()['priority'] ?? $task->priority,
            'due_date' => $request->validated()['due_date'] ?? $task->due_date,
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
