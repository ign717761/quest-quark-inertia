<?php

use App\Models\Task;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('task_checklist_items', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Task::class)->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->boolean('is_completed')->default(false);
            $table->integer('position');
            $table->timestamps();

            $table->index(['task_id', 'position']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_checklist_items');
    }
};
