<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Culture;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CultureController extends Controller
{
    private function rules(Request $request): array
    {
        return [
            // la parcelle doit exister ET appartenir à l'utilisateur connecté
            'parcelle_id' => ['required', Rule::exists('parcelles', 'id')->where('user_id', $request->user()->id)],
            'nom' => ['required', 'string', 'max:255'],
            'variete' => ['nullable', 'string', 'max:255'],
            'date_plantation' => ['required', 'date'],
            'date_recolte_prevue' => ['nullable', 'date', 'after_or_equal:date_plantation'],
            'etat' => ['required', Rule::in(Culture::ETATS)],
            'notes' => ['nullable', 'string'],
        ];
    }

    private function authorizeOwner(Request $request, Culture $culture): void
    {
        abort_if($culture->parcelle->user_id != $request->user()->id, 403, 'Accès refusé.');
    }

    /** GET /api/cultures?parcelle_id=&etat= */
    public function index(Request $request): JsonResponse
    {
        $cultures = Culture::ownedBy($request->user())
            ->with('parcelle:id,nom,superficie')
            ->withSum('recoltes', 'quantite')
            ->when($request->query('parcelle_id'), fn ($q, $id) => $q->where('parcelle_id', $id))
            ->when($request->query('etat'), fn ($q, $etat) => $q->where('etat', $etat))
            ->orderByDesc('date_plantation')
            ->get();

        return response()->json($cultures);
    }

    public function store(Request $request): JsonResponse
    {
        $culture = Culture::create($request->validate($this->rules($request)));

        return response()->json($culture->load('parcelle:id,nom,superficie'), 201);
    }

    public function show(Request $request, Culture $culture): JsonResponse
    {
        $this->authorizeOwner($request, $culture);

        return response()->json($culture->load(['parcelle', 'intrants', 'recoltes']));
    }

    public function update(Request $request, Culture $culture): JsonResponse
    {
        $this->authorizeOwner($request, $culture);
        $culture->update($request->validate($this->rules($request)));

        return response()->json($culture->load('parcelle:id,nom,superficie'));
    }

    public function destroy(Request $request, Culture $culture): JsonResponse
    {
        $this->authorizeOwner($request, $culture);
        $culture->delete();

        return response()->json(null, 204);
    }
}