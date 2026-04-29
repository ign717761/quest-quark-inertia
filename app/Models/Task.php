<?php

namespace App\Models;

use App\Models\Concerns\SortsByPosition;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $board_id
 * @property int $column_id
 * @property int $created_by
 * @property int|null $assignee_id
 * @property string $title
 * @property string|null $description
 * @property string $priority
 * @property int $position
 * @property string|null $due_date
 * @property string|null $completed_at
 * @property Board $board
 * @property Column $column
 * @property User $creator
 * @property User|null $assignee
 * @property Collection<int, TaskComment> $comments
 */
#[Fillable(['board_id', 'column_id', 'title', 'description', 'priority', 'created_by', 'creator_id', 'assignee_id', 'position', 'due_date', 'completed_at'])]
class Task extends Model
{
    use HasFactory, SortsByPosition;

    public const PRIORITY_LOW = 'low';
    public const PRIORITY_MEDIUM = 'medium';
    public const PRIORITY_HIGH = 'high';

    protected $appends = ['creator_id'];

    public static function priorities(): array
    {
        return [
            self::PRIORITY_LOW,
            self::PRIORITY_MEDIUM,
            self::PRIORITY_HIGH,
        ];
    }

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'completed_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Task $task) {
            if ($task->board_id === null && $task->column_id !== null) {
                $task->board_id = Column::query()
                    ->whereKey($task->column_id)
                    ->value('board_id');
            }
        });
    }

    public function buildSortQuery(): Builder
    {
        return static::query()->inColumn($this->column_id);
    }

    public function column(): BelongsTo
    {
        return $this->belongsTo(Column::class);
    }

    public function getCreatorIdAttribute(): ?int
    {
        return $this->created_by;
    }

    public function setCreatorIdAttribute(int $value): void
    {
        $this->attributes['created_by'] = $value;
    }

    public function board(): BelongsTo
    {
        return $this->belongsTo(Board::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(TaskComment::class)->latest();
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'task_tags');
    }

    public function checklistItems(): HasMany
    {
        return $this->hasMany(TaskChecklistItem::class)->orderBy('position');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(TaskAttachment::class);
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(TaskActivityLog::class)->latest();
    }

    #[Scope]
    protected function inColumn(Builder $query, int $columnId): void
    {
        $query->where('column_id', $columnId);
    }

    #[Scope]
    protected function ordered(Builder $query): void
    {
        $query->orderBy('position');
    }
}
