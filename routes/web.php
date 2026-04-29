<?php

use App\Http\Controllers\BoardController;
use App\Http\Controllers\BoardInvitationController;
use App\Http\Controllers\BoardSettingController;
use App\Http\Controllers\ColumnController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\TaskActivityLogController;
use App\Http\Controllers\TaskAttachmentController;
use App\Http\Controllers\TaskChecklistItemController;
use App\Http\Controllers\TaskCommentController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TaskMovementController;
use App\Http\Controllers\TaskTagController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [BoardController::class, 'index'])->name('dashboard');

    // --- Доски (Boards) ---
    Route::get('/boards/{board}', [BoardController::class, 'show'])->name('boards.show');
    Route::post('/boards', [BoardController::class, 'store'])->name('boards.store');
    Route::patch('/boards/{board}', [BoardController::class, 'update'])->name('boards.update');
    Route::delete('/boards/{board}', [BoardController::class, 'destroy'])->name('boards.destroy');
    Route::post('/boards/{board}/invite', [BoardController::class, 'invite'])->name('boards.invite');
    Route::patch('/boards/{board}/settings', [BoardSettingController::class, 'update'])->name('boards.settings.update');
    Route::post('/boards/{board}/invitations', [BoardInvitationController::class, 'store'])->name('boards.invitations.store');
    Route::delete('/boards/{board}/invitations/{invitation}', [BoardInvitationController::class, 'destroy'])->name('boards.invitations.destroy');
    Route::post('/invitations/{invitation}/accept', [BoardInvitationController::class, 'accept'])->name('invitations.accept');
    Route::post('/invitations/{invitation}/decline', [BoardInvitationController::class, 'decline'])->name('invitations.decline');

    // --- Управление участниками ---
    Route::patch('/boards/{board}/users/{user}', [BoardController::class, 'updateUserRole'])->name('boards.users.update');
    Route::delete('/boards/{board}/users/{user}', [BoardController::class, 'removeUser'])->name('boards.users.remove');

    // --- Теги (Tags) ---
    Route::post('/boards/{board}/tags', [TagController::class, 'store'])->name('tags.store');
    Route::patch('/tags/{tag}', [TagController::class, 'update'])->name('tags.update');
    Route::delete('/tags/{tag}', [TagController::class, 'destroy'])->name('tags.destroy');

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
    Route::post('/tasks/{task}/tags', [TaskTagController::class, 'store'])->name('tasks.tags.store');
    Route::delete('/tasks/{task}/tags/{tag}', [TaskTagController::class, 'destroy'])->name('tasks.tags.destroy');
    Route::post('/tasks/{task}/checklist-items', [TaskChecklistItemController::class, 'store'])->name('tasks.checklist-items.store');
    Route::patch('/checklist-items/{checklistItem}', [TaskChecklistItemController::class, 'update'])->name('checklist-items.update');
    Route::delete('/checklist-items/{checklistItem}', [TaskChecklistItemController::class, 'destroy'])->name('checklist-items.destroy');
    Route::post('/tasks/{task}/attachments', [TaskAttachmentController::class, 'store'])->name('tasks.attachments.store');
    Route::delete('/attachments/{attachment}', [TaskAttachmentController::class, 'destroy'])->name('attachments.destroy');
    Route::get('/tasks/{task}/activity-logs', [TaskActivityLogController::class, 'index'])->name('tasks.activity-logs.index');
    Route::post('/tasks/{task}/activity-logs', [TaskActivityLogController::class, 'store'])->name('tasks.activity-logs.store');
    Route::post('/tasks/{task}/comments', [TaskCommentController::class, 'store'])->name('comments.store');
    Route::patch('/comments/{comment}', [TaskCommentController::class, 'update'])->name('comments.update');
    Route::delete('/comments/{comment}', [TaskCommentController::class, 'destroy'])->name('comments.destroy');
});

require __DIR__.'/settings.php';
