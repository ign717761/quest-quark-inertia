<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ColumnMoved implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $boardId;

    public array $columnIds;

    public function __construct(int $boardId, array $columnIds = [])
    {
        $this->boardId = $boardId;
        $this->columnIds = $columnIds;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('board.'.$this->boardId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'column.moved';
    }

    public function broadcastWith(): array
    {
        return [
            'column_ids' => $this->columnIds,
        ];
    }
}
