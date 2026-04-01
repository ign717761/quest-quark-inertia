<?php

namespace App\Http\Controllers;

use App\Events\TaskCreated;
use App\Events\TaskDeleted;
use App\Events\TaskUpdated;
use App\Http\Requests\TaskStoreRequest;
use App\Http\Requests\TaskUpdateRequest;
use App\Models\Column;
use App\Models\Task;
use App\Services\TaskService;

class TaskController extends Controller
{
    /**
     * Создать новую задачу в колонке
     */
    public function store(TaskStoreRequest $request, Column $column, TaskService $taskService)
    {
        $result = $taskService->createTask($column, $request->user()->id, $request->validated());

        broadcast(new TaskCreated($result['task'], $result['taskIds']))->toOthers();

        return back()->with('success', 'Задача создана');
    }

    /**
     * Обновить задачу
     */
    public function update(TaskUpdateRequest $request, Task $task, TaskService $taskService)
    {
        $task = $taskService->updateTask($task, $request->validated());

        broadcast(new TaskUpdated($task))->toOthers();

        return back()->with('success', 'Задача обновлена');
    }

    /**
     * Удалить задачу
     */
    public function destroy(Task $task, TaskService $taskService)
    {
        /** @var Column $column */
        $column = $task->column;
        $this->authorize('update', $column->board);

        $result = $taskService->deleteTask($task);

        broadcast(new TaskDeleted(
            $result['taskId'],
            $result['columnId'],
            $result['boardId'],
            $result['taskIds']
        ))->toOthers();

        return back()->with('success', 'Задача удалена');
    }

    public function show() {}
}
