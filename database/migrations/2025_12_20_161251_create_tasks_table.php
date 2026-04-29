<?php

use App\Models\Column;
use App\Models\Board;
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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Board::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Column::class)->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium');
            $table->foreignIdFor(User::class, 'created_by')->constrained()->cascadeOnDelete();
            $table->foreignIdFor(User::class, 'assignee_id')->nullable()->constrained()->nullOnDelete();
            $table->integer('position');
            $table->date('due_date')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['column_id', 'position']);
            $table->index(['board_id', 'column_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
