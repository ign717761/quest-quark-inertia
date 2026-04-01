<?php

namespace App\Events;

use App\Models\Column;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ColumnCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Column $column;

    public function __construct(Column $column)
    {
        $this->column = $column->loadMissing('tasks');
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('board.'.$this->column->board_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'column.created';
    }

    public function broadcastWith(): array
    {
        return [
            'column' => $this->column->toArray(),
        ];
    }
}
