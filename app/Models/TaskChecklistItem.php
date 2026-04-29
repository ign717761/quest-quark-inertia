<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $task_id
 * @property string $title
 * @property bool $is_completed
 * @property int $position
 * @property Task $task
 */
#[Fillable(['task_id', 'title', 'is_completed', 'position'])]
class TaskChecklistItem extends Model
{
    protected function casts(): array
    {
        return [
            'is_completed' => 'boolean',
        ];
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }
}
