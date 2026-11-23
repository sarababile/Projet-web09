<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cultures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parcelle_id')->constrained()->cascadeOnDelete();
            $table->string('nom');                       // ex : Blé, Tomate
            $table->string('variete')->nullable();
            $table->date('date_plantation');
            $table->date('date_recolte_prevue')->nullable();
            $table->enum('etat', [
                'planifiee', 'en_croissance', 'en_floraison', 'prete_a_recolter', 'recoltee',
            ])->default('planifiee');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cultures');
    }
};