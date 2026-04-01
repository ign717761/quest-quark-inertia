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
 * @property int $position
 * @property Board $board
 * @property Collection<int, Task> $tasks
 */
#[Fillable(['board_id', 'title', 'position'])]
class Column extends Model
{
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
}
