<?php

use App\Models\Board;
use App\Models\BoardInvitation;
use App\Models\User;
use App\Notifications\BoardInvitationNotification;
use Illuminate\Support\Facades\Notification;

test('admin can send board invitation email', function () {
    Notification::fake();

    $admin = User::factory()->create();
    $board = Board::create([
        'title' => 'Командная доска',
        'user_id' => $admin->id,
    ]);

    $board->users()->attach($admin->id, ['role' => 'admin']);

    $this->actingAs($admin)
        ->from(route('boards.settings.members', $board))
        ->post(route('boards.invite', $board), ['email' => 'invitee@example.com'])
        ->assertRedirect(route('boards.settings.members', $board))
        ->assertSessionHas('success');

    $invitation = BoardInvitation::query()->where('board_id', $board->id)->first();

    expect($invitation)->not->toBeNull()
        ->and($invitation?->email)->toBe('invitee@example.com')
        ->and($invitation?->role)->toBe('editor')
        ->and($invitation?->accepted_at)->toBeNull();

    Notification::assertSentOnDemand(
        BoardInvitationNotification::class,
        function (BoardInvitationNotification $notification, array $channels, object $notifiable) use ($board): bool {
            return ($notifiable->routes['mail'] ?? null) === 'invitee@example.com'
                && in_array('mail', $channels, true)
                && $notification->invitation->board->is($board);
        },
    );
    Notification::assertSentOnDemandTimes(BoardInvitationNotification::class, 1);
});

test('invited user can accept invitation from email link', function () {
    $admin = User::factory()->create();
    $invitee = User::factory()->create([
        'email' => 'invitee@example.com',
    ]);
    $board = Board::create([
        'title' => 'Командная доска',
        'user_id' => $admin->id,
    ]);

    $board->users()->attach($admin->id, ['role' => 'admin']);

    $invitation = BoardInvitation::create([
        'board_id' => $board->id,
        'invited_by_user_id' => $admin->id,
        'email' => $invitee->email,
        'role' => 'editor',
        'token' => 'accept-token',
    ]);

    $this->actingAs($invitee)
        ->get(route('board-invitations.accept', $invitation->token))
        ->assertRedirect(route('boards.show', $board))
        ->assertSessionHas('success');

    expect($board->users()->whereKey($invitee->id)->exists())->toBeTrue()
        ->and($invitation->fresh()?->accepted_at)->not->toBeNull();
});

test('user with different email cannot accept invitation', function () {
    $admin = User::factory()->create();
    $wrongUser = User::factory()->create([
        'email' => 'wrong@example.com',
    ]);
    $board = Board::create([
        'title' => 'Командная доска',
        'user_id' => $admin->id,
    ]);

    $board->users()->attach($admin->id, ['role' => 'admin']);

    $invitation = BoardInvitation::create([
        'board_id' => $board->id,
        'invited_by_user_id' => $admin->id,
        'email' => 'invitee@example.com',
        'role' => 'editor',
        'token' => 'wrong-email-token',
    ]);

    $this->actingAs($wrongUser)
        ->get(route('board-invitations.accept', $invitation->token))
        ->assertRedirect(route('dashboard'))
        ->assertSessionHas('error');

    expect($board->users()->whereKey($wrongUser->id)->exists())->toBeFalse()
        ->and($invitation->fresh()?->accepted_at)->toBeNull();
});
