<?php

namespace App\Events;

use App\Models\Column;
use App\Models\Task;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskMoved implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Task $task;

    public int $fromColumnId;

    public int $toColumnId;

    public array $fromTaskIds;

    public array $toTaskIds;

    public function __construct(
        Task $task,
        int $fromColumnId,
        int $toColumnId,
        array $fromTaskIds = [],
        array $toTaskIds = [],
    ) {
        $this->task = $task->loadMissing(['assignee', 'creator', 'column']);
        $this->fromColumnId = $fromColumnId;
        $this->toColumnId = $toColumnId;
        $this->fromTaskIds = $fromTaskIds;
        $this->toTaskIds = $toTaskIds;
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
        return 'task.moved';
    }

    public function broadcastWith(): array
    {
        return [
            'task' => $this->task->toArray(),
            'from_column_id' => $this->fromColumnId,
            'to_column_id' => $this->toColumnId,
            'from_task_ids' => $this->fromTaskIds,
            'to_task_ids' => $this->toTaskIds,
        ];
    }
}
