<?php

declare(strict_types=1);

use App\Models\Board;
use App\Models\Column;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;

it('seeds repeatable manual testing data without duplicates', function () {
    $this->seed(DatabaseSeeder::class);
    $this->seed(DatabaseSeeder::class);

    expect(User::whereIn('email', [
        'admin@example.com',
        'editor@example.com',
        'viewer@example.com',
        'outsider@example.com',
    ])->count())->toBe(4);

    expect(Board::where('title', 'Запуск продукта')->count())->toBe(1)
        ->and(Board::where('title', 'Внутренние улучшения')->count())->toBe(1)
        ->and(Board::where('title', 'Личная админская доска')->count())->toBe(1);

    $launchBoard = Board::where('title', 'Запуск продукта')->firstOrFail();
    $privateBoard = Board::where('title', 'Личная админская доска')->firstOrFail();
    $outsider = User::where('email', 'outsider@example.com')->firstOrFail();

    expect($launchBoard->users()->count())->toBe(3)
        ->and($privateBoard->users()->count())->toBe(1)
        ->and($privateBoard->users()->whereKey($outsider->id)->exists())->toBeFalse()
        ->and(Column::where('board_id', $launchBoard->id)->count())->toBe(4)
        ->and(Task::whereHas('column', fn ($query) => $query->where('board_id', $launchBoard->id))->count())->toBe(6)
        ->and(TaskComment::count())->toBe(5);
});
