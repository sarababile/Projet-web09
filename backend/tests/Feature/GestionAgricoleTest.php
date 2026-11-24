<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class GestionAgricoleTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        Sanctum::actingAs($this->user); // simule un utilisateur connecté
    }

    /** Crée une parcelle de 2 ha et une culture dessus. */
    private function parcelleEtCulture(): array
    {
        $parcelle = $this->user->parcelles()->create(['nom' => 'P', 'superficie' => 2, 'localisation' => 'Taroudant']);
        $culture = $parcelle->cultures()->create(['nom' => 'Blé', 'date_plantation' => '2026-01-01', 'etat' => 'en_croissance']);

        return [$parcelle, $culture];
    }

    public function test_crud_complet_d_une_parcelle(): void
    {
        $id = $this->postJson('/api/parcelles', ['nom' => 'Parcelle 1', 'superficie' => 2.5, 'localisation' => 'Agadir'])
            ->assertCreated()->json('id');

        $this->getJson('/api/parcelles')->assertOk()->assertJsonCount(1);

        $this->putJson("/api/parcelles/{$id}", ['nom' => 'Modifiée', 'superficie' => 3, 'localisation' => 'Agadir'])
            ->assertOk()->assertJsonPath('nom', 'Modifiée');

        $this->deleteJson("/api/parcelles/{$id}")->assertNoContent();
        $this->assertDatabaseMissing('parcelles', ['id' => $id]);
    }

    public function test_validation_des_donnees(): void
    {
        $this->postJson('/api/parcelles', ['nom' => '', 'superficie' => -1])
            ->assertStatus(422)->assertJsonValidationErrors(['nom', 'superficie', 'localisation']);

        [, $culture] = $this->parcelleEtCulture();

        $this->postJson('/api/intrants', ['culture_id' => $culture->id, 'nom' => 'X', 'type' => 'magique', 'quantite' => 0, 'unite' => 'kg', 'date_utilisation' => '2026-01-01'])
            ->assertStatus(422)->assertJsonValidationErrors(['type', 'quantite']);
    }

    public function test_recolte_et_calcul_du_rendement(): void
    {
        [, $culture] = $this->parcelleEtCulture();

        $this->postJson('/api/intrants', ['culture_id' => $culture->id, 'nom' => 'NPK', 'type' => 'engrais', 'quantite' => 100, 'unite' => 'kg', 'date_utilisation' => '2026-01-10', 'cout' => 800])
            ->assertCreated();

        // 8000 kg récoltés sur 2 ha → 4000 kg/ha
        $this->postJson('/api/recoltes', ['culture_id' => $culture->id, 'date_recolte' => '2026-06-01', 'quantite' => 8000, 'qualite' => 'bonne'])
            ->assertCreated()->assertJsonPath('rendement', 4000);

        // coût par kg = 800 DH / 8000 kg = 0,10 DH
        $this->getJson('/api/rendements')
            ->assertOk()
            ->assertJsonPath('0.rendement', 4000)
            ->assertJsonPath('0.cout_par_kg', 0.1);
    }

    public function test_tableau_de_bord(): void
    {
        [, $culture] = $this->parcelleEtCulture();
        $culture->recoltes()->create(['date_recolte' => now()->format('Y-m-d'), 'quantite' => 1500, 'qualite' => 'bonne']);

        $this->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonPath('nb_parcelles', 1)
            ->assertJsonPath('nb_cultures', 1)
            ->assertJsonPath('production_totale', 1500);
    }

    public function test_un_utilisateur_ne_voit_pas_les_donnees_d_un_autre(): void
    {
        $autre = User::factory()->create();
        $parcelleAutre = $autre->parcelles()->create(['nom' => 'Privée', 'superficie' => 1, 'localisation' => 'X']);
        $cultureAutre = $parcelleAutre->cultures()->create(['nom' => 'Maïs', 'date_plantation' => '2026-01-01', 'etat' => 'planifiee']);

        $this->getJson('/api/parcelles')->assertJsonCount(0);
        $this->getJson("/api/parcelles/{$parcelleAutre->id}")->assertForbidden();
        $this->getJson("/api/cultures/{$cultureAutre->id}")->assertForbidden();

        // impossible d'utiliser la parcelle ou la culture d'un autre
        $this->postJson('/api/cultures', ['parcelle_id' => $parcelleAutre->id, 'nom' => 'Intrus', 'date_plantation' => '2026-01-01', 'etat' => 'planifiee'])
            ->assertStatus(422);
        $this->postJson('/api/recoltes', ['culture_id' => $cultureAutre->id, 'date_recolte' => '2026-06-01', 'quantite' => 10, 'qualite' => 'bonne'])
            ->assertStatus(422);
    }

    public function test_supprimer_une_parcelle_supprime_ses_donnees_en_cascade(): void
    {
        [$parcelle, $culture] = $this->parcelleEtCulture();
        $culture->recoltes()->create(['date_recolte' => '2026-06-01', 'quantite' => 100, 'qualite' => 'bonne']);

        $this->deleteJson("/api/parcelles/{$parcelle->id}")->assertNoContent();

        $this->assertDatabaseCount('cultures', 0);
        $this->assertDatabaseCount('recoltes', 0);
    }
}