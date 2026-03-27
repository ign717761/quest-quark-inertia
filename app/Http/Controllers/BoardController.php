<?php

namespace App\Http\Controllers;

use App\Http\Requests\BoardInviteRequest;
use App\Http\Requests\BoardRemoveUserRequest;
use App\Http\Requests\BoardStoreRequest;
use App\Http\Requests\BoardUpdateRequest;
use App\Http\Requests\BoardUpdateUserRoleRequest;
use App\Models\Board;
use App\Models\User;
use App\Services\BoardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BoardController extends Controller
{
    public function index(Request $request, BoardService $boardService)
    {
        $data = $boardService->getDashboardData($request->user());

        return Inertia::render('dashboard', [
            'boards' => $data['boards'],
            'stats' => $data['stats'],
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

    public function store(BoardStoreRequest $request, BoardService $boardService)
    {
        $board = $boardService->createBoard($request->user(), $request->validated());

        return redirect()->route('boards.show', $board->id);
    }

    public function update(BoardUpdateRequest $request, Board $board, BoardService $boardService)
    {
        $boardService->updateBoard($board, $request->validated());

        return redirect()->route('boards.show', $board);
    }

    public function destroy(Board $board, BoardService $boardService)
    {
        $this->authorize('delete', $board);

        $boardService->deleteBoard($board);

        return redirect()->route('dashboard');
    }

    public function invite(BoardInviteRequest $request, Board $board, BoardService $boardService)
    {
        $boardService->inviteUser($board, $request->validated()['email']);

        return back();
    }

    public function updateUserRole(
        BoardUpdateUserRoleRequest $request,
        Board $board,
        User $user,
        BoardService $boardService
    )
    {
        $boardService->updateUserRole($board, $user, $request->validated()['role']);

        return back();
    }

    public function removeUser(
        BoardRemoveUserRequest $request,
        Board $board,
        User $user,
        BoardService $boardService
    )
    {
        if (!$boardService->removeUser($board, $user, $request->user())) {
            return back()->withErrors(['error' => 'Вы не можете удалить себя из доски']);
        }

        return back();
    }
}
