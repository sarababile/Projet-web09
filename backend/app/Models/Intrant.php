<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Intrant extends Model
{
    public const TYPES = ['engrais', 'semence', 'traitement', 'irrigation', 'autre'];

    protected $fillable = [
        'culture_id', 'nom', 'type', 'quantite', 'unite',
        'date_utilisation', 'cout', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'quantite' => 'float',
            'cout' => 'float',
            'date_utilisation' => 'date:Y-m-d',
        ];
    }

    public function culture(): BelongsTo
    {
        return $this->belongsTo(Culture::class);
    }

    public function scopeOwnedBy(Builder $query, User $user): Builder
    {
        return $query->whereHas('culture.parcelle', fn ($q) => $q->where('user_id', $user->id));
    }
}