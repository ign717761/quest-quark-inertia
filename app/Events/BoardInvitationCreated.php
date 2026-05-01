<?php

namespace App\Events;

use App\Models\BoardInvitation;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BoardInvitationCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(public BoardInvitation $invitation) {}
}
