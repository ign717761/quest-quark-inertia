<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $task_id
 * @property int $user_id
 * @property string $filename
 * @property string $path
 * @property string|null $mime_type
 * @property int $size
 * @property Task $task
 * @property User $user
 */
#[Fillable(['task_id', 'user_id', 'filename', 'path', 'mime_type', 'size'])]
class TaskAttachment extends Model
{
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
