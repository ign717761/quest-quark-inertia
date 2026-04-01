<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Column;
use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class TaskMoveRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $task = $this->route('task');

        if (! $task instanceof Task || $user === null) {
            return false;
        }

        /** @var Column $sourceColumn */
        $sourceColumn = $task->column;
        $targetColumnId = (int) $this->input('column_id');
        $targetColumn = Column::query()->find($targetColumnId);

        if (! $targetColumn instanceof Column || $targetColumn->board_id !== $sourceColumn->board_id) {
            return false;
        }

        if ($user->can('update', $sourceColumn->board)) {
            return true;
        }

        return (int) $task->assignee_id === (int) $user->id;
    }

    public function rules(): array
    {
        return [
            'column_id' => 'required|exists:columns,id',
            'task_ids' => 'required|array',
            'task_ids.*' => 'integer|exists:tasks,id',
        ];
    }

    protected function failedAuthorization(): void
    {
        throw new HttpResponseException(
            back()->with('error', 'У вас нет прав на это действие.')
        );
    }
}
