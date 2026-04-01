<?php

namespace App\Policies;

use App\Models\Board;
use App\Models\User;

class BoardPolicy
{
    /**
     * Может ли пользователь просматривать доску.
     */
    public function view(User $user, Board $board): bool
    {
        return $board->users()->where('user_id', $user->id)->exists();
    }

    /**
     * Может ли пользователь редактировать задачи/колонки (editor или admin).
     */
    public function update(User $user, Board $board): bool
    {
        return $board->users()
            ->where('user_id', $user->id)
            ->whereIn('role', ['admin', 'editor'])
            ->exists();
    }

    /**
     * Может ли пользователь удалять доску или менять настройки (только admin).
     */
    public function delete(User $user, Board $board): bool
    {
        return $board->users()
            ->where('user_id', $user->id)
            ->where('role', 'admin')
            ->exists();
    }
}
