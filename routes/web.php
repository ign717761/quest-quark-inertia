<?php

use App\Http\Controllers\BoardController;
use App\Http\Controllers\ColumnController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TaskCommentController;
use App\Http\Controllers\TaskMovementController;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Broadcast::routes(['middleware' => ['auth']]);

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [BoardController::class, 'index'])->name('dashboard');

    // --- Доски (Boards) ---
    Route::get('/boards/{board}', [BoardController::class, 'show'])->name('boards.show');
    Route::post('/boards', [BoardController::class, 'store'])->name('boards.store');
    Route::patch('/boards/{board}', [BoardController::class, 'update'])->name('boards.update');
    Route::delete('/boards/{board}', [BoardController::class, 'destroy'])->name('boards.destroy');
    Route::post('/boards/{board}/invite', [BoardController::class, 'invite'])->name('boards.invite');

    // --- Управление участниками ---
    Route::patch('/boards/{board}/users/{user}', [BoardController::class, 'updateUserRole'])->name('boards.users.update');
    Route::delete('/boards/{board}/users/{user}', [BoardController::class, 'removeUser'])->name('boards.users.remove');

    // --- Колонки (Columns) ---
    Route::post('/boards/{board}/columns', [ColumnController::class, 'store'])->name('columns.store');
    Route::delete('/columns/{column}', [ColumnController::class, 'destroy'])->name('columns.destroy');
    Route::patch('/columns/{column}', [ColumnController::class, 'update'])->name('columns.update');
    Route::patch('/columns/{column}/move', [TaskMovementController::class, 'moveColumn'])->name('columns.move');

    // --- Задачи (Tasks) ---
    Route::post('/columns/{column}/tasks', [TaskController::class, 'store'])->name('tasks.store');
    Route::patch('/tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');
    Route::patch('/tasks/{task}/move', [TaskMovementController::class, 'move'])->name('tasks.move');
    Route::post('/tasks/{task}/comments', [TaskCommentController::class, 'store'])->name('comments.store');
    Route::patch('/comments/{comment}', [TaskCommentController::class, 'update'])->name('comments.update');
    Route::delete('/comments/{comment}', [TaskCommentController::class, 'destroy'])->name('comments.destroy');
});


require __DIR__ . '/settings.php';
