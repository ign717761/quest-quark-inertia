<?php

namespace App\Http\Controllers;

use App\Http\Requests\ColumnStoreRequest;
use App\Http\Requests\ColumnUpdateRequest;
use App\Models\Board;
use App\Models\Column;
use App\Models\Task;
use Illuminate\Support\Facades\DB;

class ColumnController extends Controller
{
    public function store(ColumnStoreRequest $request, Board $board)
    {
        Column::create([
            'board_id' => $board->id,
            'title' => $request->validated()['title'],
            'type' => $request->validated()['type'],
            'position' => ($board->columns()->max('position') ?? -1) + 1,
        ]);

        return back();
    }

    public function update(ColumnUpdateRequest $request, Column $column)
    {
        $column->update($request->safe()->only(['title', 'type']));

        return back();
    }

    public function destroy(Column $column)
    {
        $this->authorize('update', $column->board);

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
                    'title' => 'Бэклог',
                    'type' => Column::TYPE_BACKLOG,
                    'position' => ($board->columns()->max('position') ?? -1) + 1,
                ]);
            }

            $this->moveTasksToColumn($column, $destinationColumn);
            $column->delete();

            $board->columns()
                ->where('position', '>', $deletedPosition)
                ->decrement('position');
        });

        return back();
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
