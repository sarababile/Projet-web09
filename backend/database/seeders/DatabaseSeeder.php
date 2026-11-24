<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Données de démonstration — compte : demo@ferme.ma / password
 * Lancer avec : php artisan migrate:fresh --seed
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Date relative à aujourd'hui (ex : il y a 3 mois et 5 jours)
        $ilYa = fn (int $mois, int $jours = 0) => now()->subMonths($mois)->subDays($jours)->format('Y-m-d');

        $user = User::create([
            'name' => 'Sara Babile',
            'email' => 'demo@ferme.ma',
            'password' => 'password',
        ]);

        // ---------- Parcelles ----------
        $nord = $user->parcelles()->create(['nom' => 'Parcelle Nord', 'superficie' => 5.5, 'localisation' => 'Chtouka Aït Baha', 'type_sol' => 'Limoneux', 'description' => 'Irriguée au goutte-à-goutte.']);
        $serre = $user->parcelles()->create(['nom' => 'Serre A', 'superficie' => 1.2, 'localisation' => 'Biougra', 'type_sol' => 'Sableux', 'description' => 'Serre canarienne.']);
        $verger = $user->parcelles()->create(['nom' => 'Verger Sud', 'superficie' => 8, 'localisation' => 'Taroudant', 'type_sol' => 'Argilo-calcaire']);
        $est = $user->parcelles()->create(['nom' => 'Champ Est', 'superficie' => 3.4, 'localisation' => 'Ouled Teima', 'type_sol' => 'Limono-sableux']);

        // ---------- Cultures ----------
        $ble = $nord->cultures()->create(['nom' => 'Blé tendre', 'variete' => 'Achtar', 'date_plantation' => $ilYa(12), 'date_recolte_prevue' => $ilYa(7), 'etat' => 'recoltee']);
        $tomate = $serre->cultures()->create(['nom' => 'Tomate', 'variete' => 'Cerise', 'date_plantation' => $ilYa(4), 'date_recolte_prevue' => $ilYa(0, -20), 'etat' => 'prete_a_recolter']);
        $orange = $verger->cultures()->create(['nom' => 'Orange', 'variete' => 'Maroc Late', 'date_plantation' => '2020-03-10', 'etat' => 'en_floraison', 'notes' => 'Verger adulte, floraison en cours.']);
        $patate = $est->cultures()->create(['nom' => 'Pomme de terre', 'variete' => 'Spunta', 'date_plantation' => $ilYa(5), 'date_recolte_prevue' => $ilYa(1), 'etat' => 'recoltee']);
        $mais = $est->cultures()->create(['nom' => 'Maïs', 'variete' => 'Fourrager', 'date_plantation' => $ilYa(1), 'date_recolte_prevue' => $ilYa(0, -90), 'etat' => 'en_croissance']);
        $fraise = $serre->cultures()->create(['nom' => 'Fraise', 'variete' => 'Fortuna', 'date_plantation' => $ilYa(0, -15), 'etat' => 'planifiee']);

        // ---------- Intrants ----------
        $ble->intrants()->createMany([
            ['nom' => 'Semences Achtar', 'type' => 'semence', 'quantite' => 900, 'unite' => 'kg', 'date_utilisation' => $ilYa(12), 'cout' => 6300],
            ['nom' => 'NPK 14-28-14', 'type' => 'engrais', 'quantite' => 550, 'unite' => 'kg', 'date_utilisation' => $ilYa(11, 20), 'cout' => 4400],
            ['nom' => 'Herbicide sélectif', 'type' => 'traitement', 'quantite' => 5, 'unite' => 'L', 'date_utilisation' => $ilYa(10), 'cout' => 1200],
        ]);
        $tomate->intrants()->createMany([
            ['nom' => 'Plants greffés', 'type' => 'semence', 'quantite' => 24000, 'unite' => 'plant', 'date_utilisation' => $ilYa(4), 'cout' => 19000],
            ['nom' => 'Nitrate de potassium', 'type' => 'engrais', 'quantite' => 300, 'unite' => 'kg', 'date_utilisation' => $ilYa(3), 'cout' => 3600],
            ['nom' => 'Eau d\'irrigation', 'type' => 'irrigation', 'quantite' => 850, 'unite' => 'm³', 'date_utilisation' => $ilYa(2), 'cout' => 2100],
        ]);
        $orange->intrants()->createMany([
            ['nom' => 'Fongicide cuivre', 'type' => 'traitement', 'quantite' => 20, 'unite' => 'kg', 'date_utilisation' => $ilYa(2), 'cout' => 1500],
            ['nom' => 'Fumier organique', 'type' => 'engrais', 'quantite' => 12, 'unite' => 't', 'date_utilisation' => $ilYa(3), 'cout' => 4800],
        ]);
        $patate->intrants()->createMany([
            ['nom' => 'Plants certifiés Spunta', 'type' => 'semence', 'quantite' => 7500, 'unite' => 'kg', 'date_utilisation' => $ilYa(5), 'cout' => 30000],
            ['nom' => 'Engrais de fond', 'type' => 'engrais', 'quantite' => 900, 'unite' => 'kg', 'date_utilisation' => $ilYa(5), 'cout' => 6750],
        ]);
        $mais->intrants()->create(['nom' => 'Semences de maïs', 'type' => 'semence', 'quantite' => 85, 'unite' => 'kg', 'date_utilisation' => $ilYa(1), 'cout' => 2550]);

        // ---------- Récoltes (réparties sur l'année pour les graphiques) ----------
        $ble->recoltes()->createMany([
            ['date_recolte' => $ilYa(7), 'quantite' => 14000, 'qualite' => 'bonne'],
            ['date_recolte' => $ilYa(7, -4), 'quantite' => 3600, 'qualite' => 'moyenne'],
        ]);
        $orange->recoltes()->createMany([
            ['date_recolte' => $ilYa(9), 'quantite' => 52000, 'qualite' => 'excellente', 'notes' => 'Campagne précédente, 1re cueillette.'],
            ['date_recolte' => $ilYa(8), 'quantite' => 61000, 'qualite' => 'excellente'],
        ]);
        $patate->recoltes()->createMany([
            ['date_recolte' => $ilYa(2), 'quantite' => 28000, 'qualite' => 'bonne'],
            ['date_recolte' => $ilYa(1), 'quantite' => 19000, 'qualite' => 'moyenne'],
        ]);
        $tomate->recoltes()->createMany([
            ['date_recolte' => $ilYa(1, 5), 'quantite' => 2400, 'qualite' => 'excellente'],
            ['date_recolte' => $ilYa(0, 10), 'quantite' => 3100, 'qualite' => 'bonne'],
        ]);
    }
}