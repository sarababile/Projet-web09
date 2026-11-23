<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Culture extends Model
{
    public const ETATS = ['planifiee', 'en_croissance', 'en_floraison', 'prete_a_recolter', 'recoltee'];

    protected $fillable = [
        'parcelle_id', 'nom', 'variete', 'date_plantation',
        'date_recolte_prevue', 'etat', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'date_plantation' => 'date:Y-m-d',
            'date_recolte_prevue' => 'date:Y-m-d',
        ];
    }

    public function parcelle(): BelongsTo
    {
        return $this->belongsTo(Parcelle::class);
    }

    public function intrants(): HasMany
    {
        return $this->hasMany(Intrant::class);
    }

    public function recoltes(): HasMany
    {
        return $this->hasMany(Recolte::class);
    }

    /** Ne garde que les cultures appartenant à l'utilisateur donné (via la parcelle). */
    public function scopeOwnedBy(Builder $query, User $user): Builder
    {
        return $query->whereHas('parcelle', fn ($q) => $q->where('user_id', $user->id));
    }
}