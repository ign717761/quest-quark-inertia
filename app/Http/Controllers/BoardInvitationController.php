<?php

namespace App\Http\Controllers;

use App\Models\BoardInvitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class BoardInvitationController extends Controller
{
    public function accept(Request $request, string $token): RedirectResponse
    {
        $invitation = BoardInvitation::query()
            ->with('board')
            ->where('token', $token)
            ->firstOrFail();

        $user = $request->user();

        if ($user === null) {
            return redirect()->guest(route('login'));
        }

        if (strcasecmp($user->email, $invitation->email) !== 0) {
            return redirect()
                ->route('dashboard')
                ->with('error', 'Это приглашение предназначено для другого email-адреса.');
        }

        $invitation->board->users()->syncWithoutDetaching([
            $user->id => ['role' => $invitation->role],
        ]);

        if ($invitation->accepted_at === null) {
            $invitation->forceFill(['accepted_at' => now()])->save();
        }

        return redirect()
            ->route('boards.show', $invitation->board)
            ->with('success', 'Вы присоединились к доске.');
    }
}
