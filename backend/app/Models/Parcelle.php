<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Parcelle extends Model
{
    protected $fillable = ['nom', 'superficie', 'localisation', 'type_sol', 'description'];

    protected function casts(): array
    {
        return ['superficie' => 'float'];
    }

    /** Une parcelle appartient à un utilisateur (le responsable agricole). */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Une parcelle contient plusieurs cultures. */
    public function cultures(): HasMany
    {
        return $this->hasMany(Culture::class);
    }
}