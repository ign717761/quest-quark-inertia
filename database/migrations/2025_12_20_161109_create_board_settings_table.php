<?php

use App\Models\Board;
use App\Models\Column;
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
        Schema::create('board_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Board::class)->constrained()->cascadeOnDelete();
            $table->boolean('show_wip_limits')->default(true);
            $table->boolean('show_task_count')->default(true);
            $table->boolean('allow_member_invites')->default(true);
            $table->boolean('allow_all_column_moves')->default(true);
            $table->foreignIdFor(Column::class, 'default_task_column_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();

            $table->unique('board_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('board_settings');
    }
};
