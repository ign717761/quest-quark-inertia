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
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $column_id
 * @property int $creator_id
 * @property int|null $assignee_id
 * @property string $title
 * @property string $description
 * @property int $position
 * @property Column $column
 * @property User $creator
 * @property User|null $assignee
 * @property Collection<int, TaskComment> $comments
 */
#[Fillable(['column_id', 'creator_id', 'assignee_id', 'title', 'description', 'position'])]
class Task extends Model
{
    use HasFactory, SortsByPosition;

    public function buildSortQuery(): Builder
    {
        return static::query()->inColumn($this->column_id);
    }

    public function column(): BelongsTo
    {
        return $this->belongsTo(Column::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(TaskComment::class)->latest();
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
