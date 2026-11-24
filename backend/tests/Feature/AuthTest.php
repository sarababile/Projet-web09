<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase; // base vide et neuve pour chaque test

    public function test_un_utilisateur_peut_s_inscrire(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Sara',
            'email' => 'sara@test.ma',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
        ])->assertCreated()->assertJsonStructure(['user' => ['id', 'email'], 'token']);

        $this->assertDatabaseHas('users', ['email' => 'sara@test.ma']);
    }

    public function test_l_inscription_refuse_un_email_deja_utilise(): void
    {
        User::factory()->create(['email' => 'sara@test.ma']);

        $this->postJson('/api/register', [
            'name' => 'Sara', 'email' => 'sara@test.ma',
            'password' => 'secret123', 'password_confirmation' => 'secret123',
        ])->assertStatus(422)->assertJsonValidationErrors('email');
    }

    public function test_connexion_avec_bons_identifiants(): void
    {
        User::factory()->create(['email' => 'a@test.ma', 'password' => 'secret123']);

        $this->postJson('/api/login', ['email' => 'a@test.ma', 'password' => 'secret123'])
            ->assertOk()->assertJsonStructure(['user', 'token']);
    }

    public function test_connexion_refusee_avec_mauvais_mot_de_passe(): void
    {
        User::factory()->create(['email' => 'a@test.ma', 'password' => 'secret123']);

        $this->postJson('/api/login', ['email' => 'a@test.ma', 'password' => 'mauvais'])
            ->assertStatus(422);
    }

    public function test_les_routes_protegees_exigent_un_jeton(): void
    {
        $this->getJson('/api/parcelles')->assertUnauthorized();
        $this->getJson('/api/dashboard')->assertUnauthorized();
    }

    public function test_la_deconnexion_supprime_le_jeton(): void
    {
        $token = $this->postJson('/api/register', [
            'name' => 'Sara', 'email' => 'sara@test.ma',
            'password' => 'secret123', 'password_confirmation' => 'secret123',
        ])->json('token');

        $this->assertDatabaseCount('personal_access_tokens', 1);

        $this->withToken($token)->postJson('/api/logout')->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}