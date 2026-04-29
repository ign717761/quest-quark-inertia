<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\BoardInvitation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BoardInvitationController extends Controller
{
    public function store(Request $request, Board $board)
    {
        $this->authorize('update', $board);

        $validated = $request->validate([
            'email' => 'required|email|max:255',
            'role' => 'sometimes|in:editor,viewer',
        ]);

        $invitation = BoardInvitation::query()->updateOrCreate(
            [
                'board_id' => $board->id,
                'email' => $validated['email'],
                'status' => BoardInvitation::STATUS_PENDING,
            ],
            [
                'role' => $validated['role'] ?? BoardInvitation::ROLE_VIEWER,
                'token' => Str::random(48),
                'invited_by' => $request->user()->id,
                'expires_at' => now()->addDays(7),
            ],
        );

        $invitedUser = User::query()
            ->where('email', $validated['email'])
            ->first();

        if ($invitedUser instanceof User) {
            $board->users()->syncWithoutDetaching([
                $invitedUser->id => ['role' => $invitation->role],
            ]);

            $invitation->update(['status' => BoardInvitation::STATUS_ACCEPTED]);
        }

        return back()->with('success', 'Приглашение отправлено');
    }

    public function accept(Request $request, BoardInvitation $invitation)
    {
        abort_unless($request->user()?->email === $invitation->email, 403);
        abort_if($invitation->status !== BoardInvitation::STATUS_PENDING, 422, 'Приглашение уже обработано.');
        abort_if($invitation->expires_at->isPast(), 422, 'Срок действия приглашения истек.');

        $invitation->board->users()->syncWithoutDetaching([
            $request->user()->id => ['role' => $invitation->role],
        ]);

        $invitation->update(['status' => BoardInvitation::STATUS_ACCEPTED]);

        return redirect()
            ->route('boards.show', $invitation->board)
            ->with('success', 'Приглашение принято');
    }

    public function decline(Request $request, BoardInvitation $invitation)
    {
        abort_unless($request->user()?->email === $invitation->email, 403);
        abort_if($invitation->status !== BoardInvitation::STATUS_PENDING, 422, 'Приглашение уже обработано.');

        $invitation->update(['status' => BoardInvitation::STATUS_DECLINED]);

        return redirect()
            ->route('dashboard')
            ->with('success', 'Приглашение отклонено');
    }

    public function destroy(Board $board, BoardInvitation $invitation)
    {
        $this->authorize('update', $board);
        abort_unless((int) $invitation->board_id === (int) $board->id, 404);

        $invitation->delete();

        return back()->with('success', 'Приглашение удалено');
    }
}
