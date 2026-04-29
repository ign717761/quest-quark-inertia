<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskAttachment;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class TaskAttachmentController extends Controller
{
    public function store(Request $request, Task $task)
    {
        $this->authorize('view', $task->board);

        $request->validate([
            'file' => 'required|file|max:10240',
        ]);

        $file = $request->file('file');
        abort_unless($file instanceof UploadedFile, 422);

        $path = $file->store("task-attachments/{$task->id}", 'public');

        $task->attachments()->create([
            'user_id' => $request->user()->id,
            'filename' => $file->getClientOriginalName(),
            'path' => $path,
            'mime_type' => $file->getClientMimeType(),
            'size' => $file->getSize(),
        ]);

        return back()->with('success', 'Файл прикреплен');
    }

    public function destroy(TaskAttachment $attachment)
    {
        $user = request()->user();

        abort_unless(
            $user !== null
            && (
                $user->can('update', $attachment->task->board)
                || (int) $attachment->user_id === (int) $user->id
            ),
            403
        );

        Storage::disk('public')->delete($attachment->path);
        $attachment->delete();

        return back()->with('success', 'Файл удален');
    }
}
