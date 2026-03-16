<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasFactory;

    protected $fillable = ['name', 'email', 'password'];

    public function casts()
    {
        return [
            'password' => 'hashed'
        ];
    }

    // Доски, в которых пользователь участвует
    public function boards(): BelongsToMany
    {
        return $this->belongsToMany(Board::class, 'board_users')
            ->withPivot('role')
            ->withTimestamps();
    }

    // Задачи, созданные пользователем
    public function createdTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'creator_id');
    }

    // Задачи, назначенные на пользователя
    public function assignedTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'assignee_id');
    }

    public function taskComments(): HasMany
    {
        return $this->hasMany(TaskComment::class, 'author_id');
    }
}
