<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $taskId;

    public int $columnId;

    public int $boardId;

    public array $taskIds;

    public function __construct(int $taskId, int $columnId, int $boardId, array $taskIds = [])
    {
        $this->taskId = $taskId;
        $this->columnId = $columnId;
        $this->boardId = $boardId;
        $this->taskIds = $taskIds;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('board.'.$this->boardId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'task.deleted';
    }

    public function broadcastWith(): array
    {
        return [
            'task_id' => $this->taskId,
            'column_id' => $this->columnId,
            'task_ids' => $this->taskIds,
        ];
    }
}
