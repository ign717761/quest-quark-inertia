<?php

use App\Models\Column;
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
            $table->foreignIdFor(Column::class)->constrained();
            $table->foreignIdFor(User::class, 'creator_id')->constrained();
            $table->foreignIdFor(User::class, 'assignee_id')->nullable()->constrained();
            $table->string('title');
            $table->text('description');
            $table->integer('position');
            $table->timestamps();
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
