<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * @property int $id
 * @property int $board_id
 * @property string $name
 * @property string $color
 * @property Board $board
 * @property Collection<int, Task> $tasks
 */
#[Fillable(['board_id', 'name', 'color'])]
class Tag extends Model
{
    public function board(): BelongsTo
    {
        return $this->belongsTo(Board::class);
    }

    public function tasks(): BelongsToMany
    {
        return $this->belongsToMany(Task::class, 'task_tags');
    }
}
