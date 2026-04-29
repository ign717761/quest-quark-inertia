<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\Tag;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function store(Request $request, Board $board)
    {
        $this->authorize('update', $board);

        $validated = $request->validate([
            'name' => 'required|string|max:64',
            'color' => 'required|string|max:32',
        ]);

        $board->tags()->create($validated);

        return back()->with('success', 'Тег создан');
    }

    public function update(Request $request, Tag $tag)
    {
        $this->authorize('update', $tag->board);

        $tag->update($request->validate([
            'name' => 'required|string|max:64',
            'color' => 'required|string|max:32',
        ]));

        return back()->with('success', 'Тег обновлен');
    }

    public function destroy(Tag $tag)
    {
        $this->authorize('update', $tag->board);

        $tag->delete();

        return back()->with('success', 'Тег удален');
    }
}
