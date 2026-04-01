<?php

namespace App\Events;

use App\Models\Column;
use App\Models\Task;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Task $task;

    public function __construct(Task $task)
    {
        $this->task = $task->loadMissing(['assignee', 'creator', 'column']);
    }

    public function broadcastOn(): array
    {
        /** @var Column $column */
        $column = $this->task->column;

        return [
            new PrivateChannel('board.'.$column->board_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'task.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'task' => $this->task->toArray(),
        ];
    }
}
