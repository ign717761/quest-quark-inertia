<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $task_id
 * @property int $tag_id
 * @property Task $task
 * @property Tag $tag
 */
#[Fillable(['task_id', 'tag_id'])]
class TaskTag extends Model
{
    public $timestamps = false;

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function tag(): BelongsTo
    {
        return $this->belongsTo(Tag::class);
    }
}
