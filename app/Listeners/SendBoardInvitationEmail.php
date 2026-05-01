<?php

namespace App\Listeners;

use App\Events\BoardInvitationCreated;
use App\Notifications\BoardInvitationNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Notification;

class SendBoardInvitationEmail implements ShouldQueue
{
    public function handle(BoardInvitationCreated $event): void
    {
        Notification::route('mail', $event->invitation->email)
            ->notify(new BoardInvitationNotification($event->invitation));
    }
}
