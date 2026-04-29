<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

/**
 * @property int $id
 * @property int $board_id
 * @property int $user_id
 * @property string $role
 * @property Board $board
 * @property User $user
 */
#[Fillable(['board_id', 'user_id', 'role'])]
class BoardMember extends Pivot
{
    public const ROLE_OWNER = 'owner';
    public const ROLE_EDITOR = 'editor';
    public const ROLE_VIEWER = 'viewer';

    public static function roles(): array
    {
        return [
            self::ROLE_OWNER,
            self::ROLE_EDITOR,
            self::ROLE_VIEWER,
        ];
    }

    public function setRoleAttribute(string $value): void
    {
        $this->attributes['role'] = $value === 'admin' ? self::ROLE_OWNER : $value;
    }

    public function board(): BelongsTo
    {
        return $this->belongsTo(Board::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
