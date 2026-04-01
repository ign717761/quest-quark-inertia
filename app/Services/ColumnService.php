<?php

namespace App\Services;

use App\Models\Board;
use App\Models\Column;
use App\Models\Task;
use Illuminate\Support\Facades\DB;

class ColumnService
{
    private const FALLBACK_COLUMN_TITLE = 'Бэклог';

    public function createColumn(Board $board, array $data): Column
    {
        $maxPosition = $board->columns()->max('position') ?? -1;

        $column = Column::create([
            'board_id' => $board->id,
            'title' => $data['title'],
            'position' => $maxPosition + 1,
        ]);

        return $column;
    }

    public function updateColumn(Column $column, array $data): Column
    {
        $column->update($data);

        return $column;
    }

    public function deleteColumn(Column $column): array
    {
        $columnId = $column->id;
        $boardId = $column->board_id;
        $destinationColumn = null;

        DB::transaction(function () use ($column, &$destinationColumn) {
            /** @var Board $board */
            $board = $column->board;
            $deletedPosition = $column->position;
            $candidate = $board->columns()
                ->where('id', '!=', $column->id)
                ->orderBy('position')
                ->first();
            $destinationColumn = $candidate instanceof Column ? $candidate : null;

            if ($destinationColumn === null) {
                $destinationColumn = Column::create([
                    'board_id' => $board->id,
                    'title' => self::FALLBACK_COLUMN_TITLE,
                    'position' => ($board->columns()->max('position') ?? -1) + 1,
                ]);
            }

            $this->moveTasksToColumn($column, $destinationColumn);
            $column->delete();

            $board->columns()
                ->where('position', '>', $deletedPosition)
                ->decrement('position');
        });

        $columnIds = Column::inBoard($boardId)
            ->ordered()
            ->pluck('id')
            ->all();

        return [
            'columnId' => $columnId,
            'boardId' => $boardId,
            'columnIds' => $columnIds,
            'destinationColumn' => $destinationColumn?->fresh([
                'tasks' => fn ($query) => $query->orderBy('position'),
                'tasks.assignee:id,name',
                'tasks.creator:id,name',
                'tasks.comments' => fn ($query) => $query->latest(),
                'tasks.comments.author:id,name',
            ]),
        ];
    }

    private function moveTasksToColumn(Column $sourceColumn, Column $destinationColumn): void
    {
        $nextPosition = (int) (Task::inColumn($destinationColumn->id)->max('position') ?? -1) + 1;

        Task::inColumn($sourceColumn->id)
            ->ordered()
            ->get()
            ->each(function (Task $task) use ($destinationColumn, &$nextPosition) {
                $task->update([
                    'column_id' => $destinationColumn->id,
                    'position' => $nextPosition++,
                ]);
            });
    }
}
