<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Parcelle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParcelleController extends Controller
{
    /** Règles de validation communes à l'ajout et à la modification. */
    private function rules(): array
    {
        return [
            'nom' => ['required', 'string', 'max:255'],
            'superficie' => ['required', 'numeric', 'gt:0'],
            'localisation' => ['required', 'string', 'max:255'],
            'type_sol' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
        ];
    }

    /** Refuse l'accès (403) si la parcelle n'appartient pas à l'utilisateur connecté. */
    private function authorizeOwner(Request $request, Parcelle $parcelle): void
    {
        abort_if($parcelle->user_id != $request->user()->id, 403, 'Accès refusé.');
    }

    /** GET /api/parcelles?search=... : liste des parcelles de l'utilisateur. */
    public function index(Request $request): JsonResponse
    {
        $parcelles = $request->user()->parcelles()
            ->withCount('cultures')
            ->when($request->query('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nom', 'like', "%{$search}%")
                      ->orWhere('localisation', 'like', "%{$search}%");
                });
            })
            ->orderBy('nom')
            ->get();

        return response()->json($parcelles);
    }

    /** POST /api/parcelles : ajouter une parcelle. */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules());
        $parcelle = $request->user()->parcelles()->create($data); // user_id rempli automatiquement

        return response()->json($parcelle, 201);
    }

    /** GET /api/parcelles/{id} : détail d'une parcelle avec ses cultures. */
    public function show(Request $request, Parcelle $parcelle): JsonResponse
    {
        $this->authorizeOwner($request, $parcelle);

        return response()->json($parcelle->load('cultures'));
    }

    /** PUT /api/parcelles/{id} : modifier une parcelle. */
    public function update(Request $request, Parcelle $parcelle): JsonResponse
    {
        $this->authorizeOwner($request, $parcelle);
        $parcelle->update($request->validate($this->rules()));

        return response()->json($parcelle);
    }

    /** DELETE /api/parcelles/{id} : supprimer (ses cultures, intrants et récoltes partent en cascade). */
    public function destroy(Request $request, Parcelle $parcelle): JsonResponse
    {
        $this->authorizeOwner($request, $parcelle);
        $parcelle->delete();

        return response()->json(null, 204);
    }
}