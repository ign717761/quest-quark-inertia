<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $task_id
 * @property int $user_id
 * @property string $body
 * @property Task $task
 * @property User $user
 */
#[Fillable(['task_id', 'user_id', 'author_id', 'body'])]
class TaskComment extends Model
{
    use HasFactory;

    protected $appends = ['author_id'];

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function getAuthorIdAttribute(): ?int
    {
        return $this->user_id;
    }

    public function setAuthorIdAttribute(int $value): void
    {
        $this->attributes['user_id'] = $value;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function author(): BelongsTo
    {
        return $this->user();
    }
}
