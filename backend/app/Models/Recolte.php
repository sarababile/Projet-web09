<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Recolte extends Model
{
    public const QUALITES = ['excellente', 'bonne', 'moyenne', 'faible'];

    protected $fillable = ['culture_id', 'date_recolte', 'quantite', 'qualite', 'notes'];

    /** Le rendement est ajouté automatiquement aux réponses JSON. */
    protected $appends = ['rendement'];

    protected function casts(): array
    {
        return [
            'quantite' => 'float',
            'date_recolte' => 'date:Y-m-d',
        ];
    }

    public function culture(): BelongsTo
    {
        return $this->belongsTo(Culture::class);
    }

    /** Rendement (kg/ha) = quantité récoltée ÷ superficie de la parcelle. */
    public function getRendementAttribute(): ?float
    {
        $superficie = $this->culture?->parcelle?->superficie;

        return $superficie > 0 ? round($this->quantite / $superficie, 2) : null;
    }

    public function scopeOwnedBy(Builder $query, User $user): Builder
    {
        return $query->whereHas('culture.parcelle', fn ($q) => $q->where('user_id', $user->id));
    }
}