<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('intrants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('culture_id')->constrained()->cascadeOnDelete();
            $table->string('nom');                       // ex : NPK 15-15-15
            $table->enum('type', ['engrais', 'semence', 'traitement', 'irrigation', 'autre']);
            $table->decimal('quantite', 10, 2);
            $table->string('unite', 20);                // kg, L, sac…
            $table->date('date_utilisation');
            $table->decimal('cout', 10, 2)->nullable(); // en DH
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('intrants');
    }
};