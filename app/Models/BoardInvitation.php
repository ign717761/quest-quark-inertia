<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $board_id
 * @property int $invited_by_user_id
 * @property string $email
 * @property string $role
 * @property string $token
 * @property \Illuminate\Support\Carbon|null $accepted_at
 * @property Board $board
 * @property User $invitedBy
 */
#[Fillable([
    'board_id',
    'invited_by_user_id',
    'email',
    'role',
    'token',
    'accepted_at',
])]
class BoardInvitation extends Model
{
    protected function casts(): array
    {
        return [
            'accepted_at' => 'datetime',
        ];
    }

    public function board(): BelongsTo
    {
        return $this->belongsTo(Board::class);
    }

    public function invitedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by_user_id');
    }
}
