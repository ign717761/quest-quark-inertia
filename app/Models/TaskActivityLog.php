<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $task_id
 * @property int $user_id
 * @property string $action
 * @property array|null $old_value
 * @property array|null $new_value
 * @property Task $task
 * @property User $user
 */
#[Fillable(['task_id', 'user_id', 'action', 'old_value', 'new_value'])]
class TaskActivityLog extends Model
{
    public const UPDATED_AT = null;

    protected function casts(): array
    {
        return [
            'old_value' => 'array',
            'new_value' => 'array',
        ];
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
