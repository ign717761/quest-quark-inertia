<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\Column;
use Illuminate\Http\Request;

class BoardSettingController extends Controller
{
    public function update(Request $request, Board $board)
    {
        $this->authorize('update', $board);

        $validated = $request->validate([
            'show_wip_limits' => 'sometimes|boolean',
            'show_task_count' => 'sometimes|boolean',
            'allow_member_invites' => 'sometimes|boolean',
            'allow_all_column_moves' => 'sometimes|boolean',
            'default_task_column_id' => 'nullable|exists:columns,id',
        ]);

        if (array_key_exists('default_task_column_id', $validated) && $validated['default_task_column_id'] !== null) {
            abort_unless(
                Column::query()
                    ->whereKey($validated['default_task_column_id'])
                    ->where('board_id', $board->id)
                    ->exists(),
                422,
                'Колонка по умолчанию должна принадлежать этой доске.'
            );
        }

        $board->settings()->updateOrCreate(
            ['board_id' => $board->id],
            $validated,
        );

        return back()->with('success', 'Настройки доски обновлены');
    }
}
