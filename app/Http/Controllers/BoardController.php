<?php

namespace App\Http\Controllers;

use App\Events\BoardInvitationCreated;
use App\Http\Requests\BoardInviteRequest;
use App\Http\Requests\BoardRemoveUserRequest;
use App\Http\Requests\BoardStoreRequest;
use App\Http\Requests\BoardUpdateRequest;
use App\Http\Requests\BoardUpdateUserRoleRequest;
use App\Models\Board;
use App\Models\BoardInvitation;
use App\Models\Column;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BoardController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var Collection<int, Board> $boards */
        $boards = $request->user()
            ->boards()
            ->with(['users', 'columns.tasks'])
            ->get();

        $totalTasks = $boards->sum(
            fn (Board $board) => $board->columns->sum(fn (Column $column) => $column->tasks->count())
        );
        $totalMembers = $boards->pluck('users')->flatten()->unique('id')->count();

        return Inertia::render('dashboard', [
            'boards' => $boards,
            'stats' => [
                'total_boards' => $boards->count(),
                'total_tasks' => $totalTasks,
                'total_members' => $totalMembers,
            ],
        ]);
    }

    public function show(Board $board): Response
    {
        $this->authorize('view', $board);

        return Inertia::render('boards/show/index', [
            'board' => $this->loadBoardForShow($board),
        ]);
    }

    public function settings(Board $board): Response
    {
        $this->authorize('view', $board);

        return $this->renderBoardSettingsPage($board, 'boards/settings/profile');
    }

    public function settingsColumns(Board $board): Response
    {
        $this->authorize('view', $board);

        return $this->renderBoardSettingsPage($board, 'boards/settings/columns');
    }

    public function settingsMembers(Board $board): Response
    {
        $this->authorize('view', $board);

        return $this->renderBoardSettingsPage($board, 'boards/settings/members');
    }

    public function store(BoardStoreRequest $request)
    {
        $board = DB::transaction(function () use ($request): Board {
            $board = Board::create([
                'title' => $request->validated()['title'],
                'user_id' => $request->user()->id,
            ]);

            $board->users()->attach($request->user()->id, ['role' => 'admin']);

            Column::create([
                'board_id' => $board->id,
                'title' => 'Бэклог',
                'type' => Column::TYPE_BACKLOG,
                'position' => 0,
            ]);

            return $board;
        });

        return redirect()
            ->route('boards.show', $board->id)
            ->with('success', 'Доска создана.');
    }

    public function update(BoardUpdateRequest $request, Board $board)
    {
        $board->update($request->validated());

        return back()->with('success', 'Доска обновлена.');
    }

    public function destroy(Board $board)
    {
        $this->authorize('delete', $board);

        $board->delete();

        return redirect()
            ->route('dashboard')
            ->with('success', 'Доска удалена.');
    }

    public function invite(BoardInviteRequest $request, Board $board)
    {
        $email = $request->validated()['email'];

        $invitation = BoardInvitation::query()
            ->where('board_id', $board->id)
            ->where('email', $email)
            ->whereNull('accepted_at')
            ->latest('id')
            ->first();

        if (! $invitation instanceof BoardInvitation) {
            $invitation = new BoardInvitation([
                'board_id' => $board->id,
                'email' => $email,
            ]);
        }

        $invitation->fill([
            'invited_by_user_id' => $request->user()->id,
            'role' => 'editor',
            'token' => Str::random(64),
            'accepted_at' => null,
        ]);
        $invitation->save();

        BoardInvitationCreated::dispatch($invitation);

        return back()->with('success', 'Приглашение отправлено на email.');
    }

    public function updateUserRole(
        BoardUpdateUserRoleRequest $request,
        Board $board,
        User $user,
    ) {
        $board->users()->updateExistingPivot($user->id, ['role' => $request->validated()['role']]);

        return back()->with('success', 'Роль участника обновлена.');
    }

    public function removeUser(
        BoardRemoveUserRequest $request,
        Board $board,
        User $user,
    ) {
        if ($user->id === $request->user()->id) {
            return back()->withErrors(['error' => 'Вы не можете удалить себя из доски']);
        }

        DB::transaction(function () use ($board, $user): void {
            $columnIds = $board->columns()->pluck('id');

            Task::query()
                ->whereIn('column_id', $columnIds)
                ->where('assignee_id', $user->id)
                ->update(['assignee_id' => null]);

            $board->users()->detach($user->id);
        });

        return back()->with('success', 'Участник удален из доски.');
    }

    private function loadBoardForShow(Board $board): Board
    {
        return $board->load([
            'users',
            'columns' => fn ($query) => $query->ordered(),
            'columns.tasks' => fn ($query) => $query->ordered(),
            'columns.tasks.assignee:id,name',
            'columns.tasks.comments' => function ($query) {
                $query->latest();
            },
            'columns.tasks.comments.author:id,name',
        ]);
    }

    private function loadBoardForSettings(Board $board): Board
    {
        return $board->load([
            'users',
            'columns' => fn ($query) => $query->ordered()->withCount('tasks'),
        ]);
    }

    private function renderBoardSettingsPage(Board $board, string $component): Response
    {
        return Inertia::render($component, [
            'board' => $this->loadBoardForSettings($board),
        ]);
    }
}
