<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string $password
 */
#[Fillable(['name', 'email', 'password'])]
class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function boards(): BelongsToMany
    {
        return $this->belongsToMany(Board::class, 'board_members')
            ->using(BoardMember::class)
            ->withPivot('role')
            ->withTimestamps();
    }

    public function ownedBoards(): HasMany
    {
        return $this->hasMany(Board::class, 'owner_id');
    }

    public function boardMemberships(): HasMany
    {
        return $this->hasMany(BoardMember::class);
    }

    public function sentBoardInvitations(): HasMany
    {
        return $this->hasMany(BoardInvitation::class, 'invited_by');
    }

    public function createdTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'created_by');
    }

    public function assignedTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'assignee_id');
    }

    public function taskComments(): HasMany
    {
        return $this->hasMany(TaskComment::class);
    }

    public function taskAttachments(): HasMany
    {
        return $this->hasMany(TaskAttachment::class);
    }

    public function taskActivityLogs(): HasMany
    {
        return $this->hasMany(TaskActivityLog::class);
    }
}
