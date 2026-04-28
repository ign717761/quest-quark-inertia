<?php

namespace App\Http\Controllers;

use App\Http\Requests\BoardInviteRequest;
use App\Http\Requests\BoardRemoveUserRequest;
use App\Http\Requests\BoardStoreRequest;
use App\Http\Requests\BoardUpdateRequest;
use App\Http\Requests\BoardUpdateUserRoleRequest;
use App\Models\Board;
use App\Models\Column;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
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
            'board' => $board->load([
                'users',
                'columns' => fn ($query) => $query->ordered(),
                'columns.tasks' => fn ($query) => $query->ordered(),
                'columns.tasks.assignee:id,name',
                'columns.tasks.comments' => function ($query) {
                    $query->latest();
                },
                'columns.tasks.comments.author:id,name',
            ]),
        ]);
    }

    public function store(BoardStoreRequest $request)
    {
        $board = Board::create([
            'title' => $request->validated()['title'],
            'user_id' => $request->user()->id,
        ]);

        $board->users()->attach($request->user()->id, ['role' => 'admin']);

        return redirect()->route('boards.show', $board->id);
    }

    public function update(BoardUpdateRequest $request, Board $board)
    {
        $board->update($request->validated());

        return redirect()->route('boards.show', $board);
    }

    public function destroy(Board $board)
    {
        $this->authorize('delete', $board);

        $board->delete();

        return redirect()->route('dashboard');
    }

    public function invite(BoardInviteRequest $request, Board $board)
    {
        $userToInvite = User::where('email', $request->validated()['email'])->firstOrFail();

        $board->users()->syncWithoutDetaching([$userToInvite->id => ['role' => 'editor']]);

        return back();
    }

    public function updateUserRole(
        BoardUpdateUserRoleRequest $request,
        Board $board,
        User $user,
    ) {
        $board->users()->updateExistingPivot($user->id, ['role' => $request->validated()['role']]);

        return back();
    }

    public function removeUser(
        BoardRemoveUserRequest $request,
        Board $board,
        User $user,
    ) {
        if ($user->id === $request->user()->id) {
            return back()->withErrors(['error' => 'Вы не можете удалить себя из доски']);
        }

        $board->users()->detach($user->id);

        return back();
    }
}
