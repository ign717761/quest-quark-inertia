<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BoardRemoveUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        $board = $this->route('board');

        return $board !== null
            && $this->user() !== null
            && $board->users()
                ->where('user_id', $this->user()->id)
                ->where('role', 'owner')
                ->exists();
    }

    public function rules(): array
    {
        return [];
    }
}
