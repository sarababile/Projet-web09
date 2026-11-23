<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Culture;
use App\Models\Recolte;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RecolteController extends Controller
{
    /** On charge la superficie de la parcelle pour calculer le rendement. */
    private const RELATIONS = ['culture:id,nom,parcelle_id', 'culture.parcelle:id,nom,superficie'];

    private function rules(Request $request): array
    {
        $user = $request->user();

        return [
            'culture_id' => ['required', 'integer', function (string $attribute, mixed $value, Closure $fail) use ($user) {
                if (! Culture::ownedBy($user)->whereKey($value)->exists()) {
                    $fail('La culture sélectionnée est invalide.');
                }
            }],
            'date_recolte' => ['required', 'date'],
            'quantite' => ['required', 'numeric', 'gt:0'],
            'qualite' => ['required', Rule::in(Recolte::QUALITES)],
            'notes' => ['nullable', 'string'],
        ];
    }

    private function authorizeOwner(Request $request, Recolte $recolte): void
    {
        abort_if($recolte->culture->parcelle->user_id != $request->user()->id, 403, 'Accès refusé.');
    }

    /** GET /api/recoltes?culture_id= */
    public function index(Request $request): JsonResponse
    {
        $recoltes = Recolte::ownedBy($request->user())
            ->with(self::RELATIONS)
            ->when($request->query('culture_id'), fn ($q, $id) => $q->where('culture_id', $id))
            ->orderByDesc('date_recolte')
            ->get();

        return response()->json($recoltes);
    }

    public function store(Request $request): JsonResponse
    {
        $recolte = Recolte::create($request->validate($this->rules($request)));

        return response()->json($recolte->load(self::RELATIONS), 201);
    }

    public function show(Request $request, Recolte $recolte): JsonResponse
    {
        $this->authorizeOwner($request, $recolte);

        return response()->json($recolte->load(self::RELATIONS));
    }

    public function update(Request $request, Recolte $recolte): JsonResponse
    {
        $this->authorizeOwner($request, $recolte);
        $recolte->update($request->validate($this->rules($request)));

        return response()->json($recolte->load(self::RELATIONS));
    }

    public function destroy(Request $request, Recolte $recolte): JsonResponse
    {
        $this->authorizeOwner($request, $recolte);
        $recolte->delete();

        return response()->json(null, 204);
    }
}