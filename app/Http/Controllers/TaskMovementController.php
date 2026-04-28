<?php

namespace App\Http\Controllers;

use App\Http\Requests\ColumnMoveRequest;
use App\Http\Requests\TaskMoveRequest;
use App\Models\Column;
use App\Models\Task;
use Illuminate\Support\Facades\DB;

class TaskMovementController extends Controller
{
    public function move(TaskMoveRequest $request, Task $task)
    {
        $toColumnId = (int) $request->validated()['column_id'];
        /** @var Column $sourceColumn */
        $sourceColumn = $task->column;
        $targetColumn = Column::query()->findOrFail($toColumnId);
        $attributes = [];

        if ($task->column_id !== $toColumnId) {
            $attributes['column_id'] = $toColumnId;
        }

        if ($task->assignee_id === null && $sourceColumn->isBacklog() && ! $targetColumn->isBacklog()) {
            $attributes['assignee_id'] = $request->user()->id;
        }

        if ($attributes !== []) {
            $task->update($attributes);
        }

        Task::setNewOrder($request->validated()['task_ids']);

        return back();
    }

    public function moveColumn(ColumnMoveRequest $request, Column $column)
    {
        $oldPosition = $column->position;
        $boardId = $column->board_id;
        $newPosition = $request->validated()['position'];

        DB::transaction(function () use ($column, $boardId, $oldPosition, $newPosition) {
            Column::where('board_id', $boardId)
                ->where('position', '>', $oldPosition)
                ->decrement('position');

            Column::where('board_id', $boardId)
                ->where('position', '>=', $newPosition)
                ->increment('position');

            $column->update([
                'position' => $newPosition,
            ]);
        });

        return back();
    }
}
