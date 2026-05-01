<?php

namespace App\Http\Requests;

use App\Models\Board;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BoardInviteRequest extends FormRequest
{
    public function authorize(): bool
    {
        $board = $this->route('board');

        return $board !== null && $this->user() !== null && $this->user()->can('update', $board);
    }

    public function rules(): array
    {
        /** @var Board|null $board */
        $board = $this->route('board');

        return [
            'email' => [
                'required',
                'email',
                Rule::when(
                    $board !== null,
                    function () use ($board): \Closure {
                        return function (string $attribute, mixed $value, \Closure $fail) use ($board): void {
                            $alreadyMember = $board->users()
                                ->where('email', (string) $value)
                                ->exists();

                            if ($alreadyMember) {
                                $fail('Пользователь уже состоит в этой доске.');
                            }
                        };
                    },
                ),
            ],
        ];
    }
}
