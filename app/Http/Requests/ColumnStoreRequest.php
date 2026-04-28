<?php

namespace App\Http\Requests;

use App\Models\Column;
use Illuminate\Foundation\Http\FormRequest;

class ColumnStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        $board = $this->route('board');

        return $board !== null && $this->user() !== null && $this->user()->can('update', $board);
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'type' => 'required|string|in:'.implode(',', Column::types()),
        ];
    }
}
