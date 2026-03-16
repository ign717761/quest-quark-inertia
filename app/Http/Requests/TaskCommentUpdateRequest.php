<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TaskCommentUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        $comment = $this->route('comment');
        $user = $this->user();

        if ($comment === null || $user === null) {
            return false;
        }

        $board = $comment->task->column->board;
        $isAuthor = (int) $comment->author_id === (int) $user->id;
        $isAdmin = $user->can('delete', $board);

        return $isAuthor || $isAdmin;
    }

    public function rules(): array
    {
        return [
            'body' => 'required|string|max:5000',
        ];
    }
}
