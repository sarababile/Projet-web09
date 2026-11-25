<?php

/*
| Messages de validation en français (uniquement les règles utilisées par l'API).
| :attribute est remplacé par le nom du champ défini dans 'attributes' plus bas.
*/
return [
    'required' => 'Le champ :attribute est obligatoire.',
    'string' => 'Le champ :attribute doit être un texte.',
    'email' => 'Le champ :attribute doit être une adresse email valide.',
    'unique' => 'Cet :attribute est déjà utilisé.',
    'confirmed' => 'La confirmation du :attribute ne correspond pas.',
    'numeric' => 'Le champ :attribute doit être un nombre.',
    'integer' => 'Le champ :attribute doit être un nombre entier.',
    'date' => 'Le champ :attribute doit être une date valide.',
    'after_or_equal' => 'La :attribute doit être postérieure ou égale à la :date.',
    'exists' => 'La :attribute sélectionnée est invalide.',
    'in' => 'La valeur choisie pour le champ :attribute est invalide.',

    'gt' => [
        'numeric' => 'Le champ :attribute doit être supérieur à :value.',
        'string' => 'Le champ :attribute doit contenir plus de :value caractères.',
        'array' => 'Le champ :attribute doit contenir plus de :value éléments.',
        'file' => 'Le fichier :attribute doit dépasser :value kilo-octets.',
    ],
    'min' => [
        'numeric' => 'Le champ :attribute doit être au moins égal à :min.',
        'string' => 'Le champ :attribute doit contenir au moins :min caractères.',
        'array' => 'Le champ :attribute doit contenir au moins :min éléments.',
        'file' => 'Le fichier :attribute doit faire au moins :min kilo-octets.',
    ],
    'max' => [
        'numeric' => 'Le champ :attribute ne doit pas dépasser :max.',
        'string' => 'Le champ :attribute ne doit pas dépasser :max caractères.',
        'array' => 'Le champ :attribute ne doit pas contenir plus de :max éléments.',
        'file' => 'Le fichier :attribute ne doit pas dépasser :max kilo-octets.',
    ],

    // Noms des champs affichés dans les messages
    'attributes' => [
        'name' => 'nom',
        'email' => 'email',
        'password' => 'mot de passe',
        'nom' => 'nom',
        'superficie' => 'superficie',
        'localisation' => 'localisation',
        'type_sol' => 'type de sol',
        'description' => 'description',
        'parcelle_id' => 'parcelle',
        'culture_id' => 'culture',
        'variete' => 'variété',
        'date_plantation' => 'date de plantation',
        'date_recolte_prevue' => 'date de récolte prévue',
        'etat' => 'état',
        'notes' => 'notes',
        'type' => 'type',
        'quantite' => 'quantité',
        'unite' => 'unité',
        'date_utilisation' => "date d'utilisation",
        'cout' => 'coût',
        'date_recolte' => 'date de récolte',
        'qualite' => 'qualité',
    ],
];