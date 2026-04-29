<?php

use App\Models\Task;
use App\Models\User;
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
        Schema::create('task_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Task::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(User::class)->constrained()->cascadeOnDelete();
            $table->string('action');
            $table->json('old_value')->nullable();
            $table->json('new_value')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index(['task_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_activity_logs');
    }
};
