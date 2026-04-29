<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskActivityLogController extends Controller
{
    public function index(Task $task)
    {
        $this->authorize('view', $task->board);

        return response()->json(
            $task->activityLogs()
                ->with('user:id,name')
                ->latest()
                ->get()
        );
    }

    public function store(Request $request, Task $task)
    {
        $this->authorize('update', $task->board);

        $validated = $request->validate([
            'action' => 'required|string|max:120',
            'old_value' => 'nullable|array',
            'new_value' => 'nullable|array',
        ]);

        $task->activityLogs()->create([
            'user_id' => $request->user()->id,
            'action' => $validated['action'],
            'old_value' => $validated['old_value'] ?? null,
            'new_value' => $validated['new_value'] ?? null,
        ]);

        return back()->with('success', 'Событие добавлено');
    }
}
