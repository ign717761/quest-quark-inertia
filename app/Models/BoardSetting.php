<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $board_id
 * @property bool $show_wip_limits
 * @property bool $show_task_count
 * @property bool $allow_member_invites
 * @property bool $allow_all_column_moves
 * @property int|null $default_task_column_id
 * @property Board $board
 * @property Column|null $defaultTaskColumn
 */
#[Fillable(['board_id', 'show_wip_limits', 'show_task_count', 'allow_member_invites', 'allow_all_column_moves', 'default_task_column_id'])]
class BoardSetting extends Model
{
    protected function casts(): array
    {
        return [
            'show_wip_limits' => 'boolean',
            'show_task_count' => 'boolean',
            'allow_member_invites' => 'boolean',
            'allow_all_column_moves' => 'boolean',
        ];
    }

    public function board(): BelongsTo
    {
        return $this->belongsTo(Board::class);
    }

    public function defaultTaskColumn(): BelongsTo
    {
        return $this->belongsTo(Column::class, 'default_task_column_id');
    }
}
