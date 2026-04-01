<?php

namespace App\Http\Controllers;

use App\Events\ColumnMoved;
use App\Events\TaskMoved;
use App\Http\Requests\ColumnMoveRequest;
use App\Http\Requests\TaskMoveRequest;
use App\Models\Column;
use App\Models\Task;
use App\Services\TaskMovementService;

class TaskMovementController extends Controller
{
    public function move(TaskMoveRequest $request, Task $task, TaskMovementService $taskMovementService)
    {
        $result = $taskMovementService->moveTask($task, $request->validated());

        broadcast(new TaskMoved(
            $result['task'],
            $result['fromColumnId'],
            $result['toColumnId'],
            $result['fromTaskIds'],
            $result['toTaskIds']
        ))->toOthers();

        return back();
    }

    public function moveColumn(
        ColumnMoveRequest $request,
        Column $column,
        TaskMovementService $taskMovementService
    ) {
        $result = $taskMovementService->moveColumn($column, $request->validated()['position']);

        broadcast(new ColumnMoved($result['boardId'], $result['columnIds']))->toOthers();

        return back();
    }
}
