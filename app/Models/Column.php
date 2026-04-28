<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $board_id
 * @property string $title
 * @property string $type
 * @property int $position
 * @property Board $board
 * @property Collection<int, Task> $tasks
 */
#[Fillable(['board_id', 'title', 'type', 'position'])]
class Column extends Model
{
    public const TYPE_BACKLOG = 'backlog';
    public const TYPE_IN_PROGRESS = 'in_progress';
    public const TYPE_DONE = 'done';

    public static function types(): array
    {
        return [
            self::TYPE_BACKLOG,
            self::TYPE_IN_PROGRESS,
            self::TYPE_DONE,
        ];
    }

    public function board(): BelongsTo
    {
        return $this->belongsTo(Board::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class)->orderBy('position');
    }

    #[Scope]
    protected function inBoard(Builder $query, int $boardId): void
    {
        $query->where('board_id', $boardId);
    }

    #[Scope]
    protected function ordered(Builder $query): void
    {
        $query->orderBy('position');
    }

    public function isBacklog(): bool
    {
        return $this->type === self::TYPE_BACKLOG;
    }
}
