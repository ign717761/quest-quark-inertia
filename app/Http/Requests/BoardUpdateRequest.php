<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BoardUpdateRequest extends FormRequest
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
            'description' => 'nullable|string',
            'visibility' => 'sometimes|in:private,workspace,public',
            'icon' => 'nullable|string|max:32',
            'color' => 'nullable|string|max:32',
        ];
    }
}
