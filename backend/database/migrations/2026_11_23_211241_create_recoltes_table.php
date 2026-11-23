<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recoltes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('culture_id')->constrained()->cascadeOnDelete();
            $table->date('date_recolte');
            $table->decimal('quantite', 12, 2);          // en kg
            $table->enum('qualite', ['excellente', 'bonne', 'moyenne', 'faible'])->default('bonne');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recoltes');
    }
};