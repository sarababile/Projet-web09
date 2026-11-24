<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Culture;
use App\Models\Intrant;
use App\Models\Recolte;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /** GET /api/dashboard : chiffres clés et données pour les graphiques. */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        // Production par mois (12 derniers mois), calculée en PHP pour rester
        // compatible avec MySQL et SQLite (utilisé par les tests).
        $productionParMois = Recolte::ownedBy($user)
            ->where('date_recolte', '>=', now()->subMonths(11)->startOfMonth())
            ->get(['date_recolte', 'quantite'])
            ->groupBy(fn ($r) => $r->date_recolte->format('Y-m'))
            ->map(fn ($groupe) => round($groupe->sum('quantite'), 2))
            ->sortKeys();

        return response()->json([
            'nb_parcelles' => $user->parcelles()->count(),
            'superficie_totale' => (float) $user->parcelles()->sum('superficie'),
            'nb_cultures' => Culture::ownedBy($user)->count(),
            'cultures_actives' => Culture::ownedBy($user)->where('etat', '!=', 'recoltee')->count(),
            'cultures_par_etat' => Culture::ownedBy($user)
                ->selectRaw('etat, COUNT(*) as total')->groupBy('etat')->pluck('total', 'etat'),
            'cout_intrants' => (float) Intrant::ownedBy($user)->sum('cout'),
            'cout_par_type' => Intrant::ownedBy($user)
                ->selectRaw('type, SUM(cout) as total')->groupBy('type')->pluck('total', 'type'),
            'production_totale' => (float) Recolte::ownedBy($user)->sum('quantite'),
            'production_par_mois' => $productionParMois,
            'dernieres_recoltes' => Recolte::ownedBy($user)
                ->with('culture:id,nom,parcelle_id', 'culture.parcelle:id,nom,superficie')
                ->orderByDesc('date_recolte')->limit(5)->get(),
        ]);
    }

    /**
     * GET /api/rendements : pour chaque culture, production totale, rendement (kg/ha),
     * coût des intrants et coût de revient par kg.
     */
    public function rendements(Request $request): JsonResponse
    {
        $lignes = Culture::ownedBy($request->user())
            ->with('parcelle:id,nom,superficie')
            ->withSum('recoltes', 'quantite')
            ->withSum('intrants', 'cout')
            ->withCount('recoltes')
            ->get()
            ->map(function (Culture $c) {
                $production = (float) ($c->recoltes_sum_quantite ?? 0);
                $superficie = (float) $c->parcelle->superficie;
                $cout = (float) ($c->intrants_sum_cout ?? 0);

                return [
                    'culture_id' => $c->id,
                    'culture' => $c->nom,
                    'variete' => $c->variete,
                    'parcelle' => $c->parcelle->nom,
                    'superficie' => $superficie,
                    'etat' => $c->etat,
                    'nb_recoltes' => $c->recoltes_count,
                    'production_totale' => $production,
                    'rendement' => $superficie > 0 ? round($production / $superficie, 2) : null,
                    'cout_intrants' => $cout,
                    'cout_par_kg' => $production > 0 ? round($cout / $production, 2) : null,
                ];
            })
            ->sortByDesc('rendement')
            ->values();

        return response()->json($lignes);
    }
}