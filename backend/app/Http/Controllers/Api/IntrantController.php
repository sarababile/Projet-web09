<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Culture;
use App\Models\Intrant;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class IntrantController extends Controller
{
    private const RELATIONS = ['culture:id,nom,parcelle_id', 'culture.parcelle:id,nom'];

    private function rules(Request $request): array
    {
        $user = $request->user();

        return [
            // règle personnalisée : la culture doit appartenir à l'utilisateur
            'culture_id' => ['required', 'integer', function (string $attribute, mixed $value, Closure $fail) use ($user) {
                if (! Culture::ownedBy($user)->whereKey($value)->exists()) {
                    $fail('La culture sélectionnée est invalide.');
                }
            }],
            'nom' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in(Intrant::TYPES)],
            'quantite' => ['required', 'numeric', 'gt:0'],
            'unite' => ['required', 'string', 'max:20'],
            'date_utilisation' => ['required', 'date'],
            'cout' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ];
    }

    private function authorizeOwner(Request $request, Intrant $intrant): void
    {
        abort_if($intrant->culture->parcelle->user_id != $request->user()->id, 403, 'Accès refusé.');
    }

    /** GET /api/intrants?type=&culture_id= */
    public function index(Request $request): JsonResponse
    {
        $intrants = Intrant::ownedBy($request->user())
            ->with(self::RELATIONS)
            ->when($request->query('type'), fn ($q, $type) => $q->where('type', $type))
            ->when($request->query('culture_id'), fn ($q, $id) => $q->where('culture_id', $id))
            ->orderByDesc('date_utilisation')
            ->get();

        return response()->json($intrants);
    }

    public function store(Request $request): JsonResponse
    {
        $intrant = Intrant::create($request->validate($this->rules($request)));

        return response()->json($intrant->load(self::RELATIONS), 201);
    }

    public function show(Request $request, Intrant $intrant): JsonResponse
    {
        $this->authorizeOwner($request, $intrant);

        return response()->json($intrant->load(self::RELATIONS));
    }

    public function update(Request $request, Intrant $intrant): JsonResponse
    {
        $this->authorizeOwner($request, $intrant);
        $intrant->update($request->validate($this->rules($request)));

        return response()->json($intrant->load(self::RELATIONS));
    }

    public function destroy(Request $request, Intrant $intrant): JsonResponse
    {
        $this->authorizeOwner($request, $intrant);
        $intrant->delete();

        return response()->json(null, 204);
    }
}