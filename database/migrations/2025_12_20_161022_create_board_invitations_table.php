<?php

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
        Schema::create('board_invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Board::class)->constrained()->cascadeOnDelete();
            $table->string('email');
            $table->enum('role', ['editor', 'viewer'])->default('viewer');
            $table->string('token')->unique();
            $table->enum('status', ['pending', 'accepted', 'declined', 'expired'])->default('pending');
            $table->foreignIdFor(User::class, 'invited_by')->constrained()->cascadeOnDelete();
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->index(['board_id', 'email']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('board_invitations');
    }
};
