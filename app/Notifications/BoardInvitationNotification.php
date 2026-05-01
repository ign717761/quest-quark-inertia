<?php

namespace App\Notifications;

use App\Models\BoardInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BoardInvitationNotification extends Notification
{
    use Queueable;

    public function __construct(public BoardInvitation $invitation) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $board = $this->invitation->board;
        $invitedBy = $this->invitation->invitedBy;

        return (new MailMessage())
            ->subject("Приглашение в доску {$board->title}")
            ->greeting('Вас пригласили в доску Quest Quark')
            ->line("{$invitedBy->name} пригласил(а) вас присоединиться к доске \"{$board->title}\".")
            ->line('Чтобы принять приглашение, откройте ссылку и войдите под этим email-адресом.')
            ->action(
                'Принять приглашение',
                route('board-invitations.accept', $this->invitation->token),
            )
            ->line('Если вы не ожидали это приглашение, просто проигнорируйте письмо.');
    }
}
