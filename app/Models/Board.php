<?php

namespace App\Models;

use App\Policies\BoardPolicy;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property int $id
 * @property int $owner_id
 * @property string $title
 * @property string|null $description
 * @property string $visibility
 * @property string|null $icon
 * @property string|null $color
 * @property User $owner
 * @property BoardSetting|null $settings
 * @property Collection<int, Column> $columns
 * @property Collection<int, User> $users
 */
#[UsePolicy(BoardPolicy::class)]
#[Fillable(['owner_id', 'user_id', 'title', 'description', 'visibility', 'icon', 'color'])]
class Board extends Model
{
    public const VISIBILITY_PRIVATE = 'private';
    public const VISIBILITY_WORKSPACE = 'workspace';
    public const VISIBILITY_PUBLIC = 'public';

    protected $appends = ['user_id'];

    public static function visibilities(): array
    {
        return [
            self::VISIBILITY_PRIVATE,
            self::VISIBILITY_WORKSPACE,
            self::VISIBILITY_PUBLIC,
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function getUserIdAttribute(): ?int
    {
        return $this->owner_id;
    }

    public function setUserIdAttribute(int $value): void
    {
        $this->attributes['owner_id'] = $value;
    }

    public function settings(): HasOne
    {
        return $this->hasOne(BoardSetting::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(BoardMember::class);
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(BoardInvitation::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'board_members')
            ->using(BoardMember::class)
            ->withPivot('role')
            ->withTimestamps();
    }

    public function columns(): HasMany
    {
        return $this->hasMany(Column::class)->orderBy('position');
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function tags(): HasMany
    {
        return $this->hasMany(Tag::class);
    }
}
