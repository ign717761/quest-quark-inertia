<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $board_id
 * @property string $email
 * @property string $role
 * @property string $token
 * @property string $status
 * @property int $invited_by
 * @property string $expires_at
 * @property Board $board
 * @property User $inviter
 */
#[Fillable(['board_id', 'email', 'role', 'token', 'status', 'invited_by', 'expires_at'])]
class BoardInvitation extends Model
{
    public const ROLE_EDITOR = 'editor';
    public const ROLE_VIEWER = 'viewer';

    public const STATUS_PENDING = 'pending';
    public const STATUS_ACCEPTED = 'accepted';
    public const STATUS_DECLINED = 'declined';
    public const STATUS_EXPIRED = 'expired';

    public static function roles(): array
    {
        return [
            self::ROLE_EDITOR,
            self::ROLE_VIEWER,
        ];
    }

    public static function statuses(): array
    {
        return [
            self::STATUS_PENDING,
            self::STATUS_ACCEPTED,
            self::STATUS_DECLINED,
            self::STATUS_EXPIRED,
        ];
    }

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
        ];
    }

    public function board(): BelongsTo
    {
        return $this->belongsTo(Board::class);
    }

    public function inviter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }
}
