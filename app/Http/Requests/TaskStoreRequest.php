<?php

namespace App\Http\Requests;

use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;

class TaskStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        $column = $this->route('column');

        return $column !== null
            && $this->user() !== null
            && $this->user()->can('update', $column->board);
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'assignee_id' => 'nullable|exists:users,id',
            'priority' => 'sometimes|string|in:'.implode(',', Task::priorities()),
            'due_date' => 'nullable|date',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('assignee_id') && $this->input('assignee_id') === 'none') {
            $this->merge(['assignee_id' => null]);
        }
    }
}
