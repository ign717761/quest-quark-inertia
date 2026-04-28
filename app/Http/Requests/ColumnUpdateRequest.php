<?php

namespace App\Http\Requests;

use App\Models\Column as ColumnModel;
use Illuminate\Foundation\Http\FormRequest;

class ColumnUpdateRequest extends FormRequest
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
            'type' => 'sometimes|string|in:'.implode(',', ColumnModel::types()),
        ];
    }
}
