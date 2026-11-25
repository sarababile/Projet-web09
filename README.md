# 🌿 AgriGestion — Gestion d'exploitation agricole

Application web de gestion d'une exploitation agricole : **parcelles**, **cultures**, **intrants** et **récoltes**, avec un tableau de bord et une analyse des **rendements**.

> Projet du module **Programmation Web Dynamique** — Filière IL, Faculté des Sciences d'Agadir (2026)
> Réalisé par **Sara BABILE**

![Tableau de bord](docs/captures/03-tableau-de-bord.png)

---

## Sommaire

1. [Présentation](#présentation)
2. [Fonctionnalités](#fonctionnalités)
3. [Technologies](#technologies)
4. [Structure du projet](#structure-du-projet)
5. [Modèle de données](#modèle-de-données)
6. [Installation](#installation)
7. [Compte de démonstration](#compte-de-démonstration)
8. [API REST](#api-rest)
9. [Tests](#tests)
10. [Captures d'écran](#captures-décran)
11. [Diagrammes UML](#diagrammes-uml)
12. [Problèmes rencontrés et solutions](#problèmes-rencontrés-et-solutions)

---

## Présentation

AgriGestion permet à un agriculteur de suivre toute la vie de son exploitation :

- il enregistre ses **parcelles** (superficie, localisation, type de sol) ;
- il y planifie des **cultures** et suit leur état, de la plantation à la récolte ;
- il note les **intrants** utilisés (engrais, semences, traitements, irrigation) et leur coût ;
- il enregistre ses **récoltes**, et l'application calcule automatiquement le **rendement** (kg/ha) et le **coût de production** (DH/kg).

Chaque utilisateur ne voit que **ses propres données**.

## Fonctionnalités

| Module | Fonctionnalités |
|---|---|
| **Authentification** | Inscription, connexion (option « Se souvenir de moi »), déconnexion, pages protégées |
| **Tableau de bord** | Superficie totale, cultures actives, coût des intrants, production des 12 derniers mois (graphique), cultures en cours, dernières récoltes |
| **Parcelles** | Ajout, modification, suppression, recherche par nom ou localisation |
| **Cultures** | CRUD, filtre par parcelle et par état (planifiée → en croissance → en floraison → prête à récolter → récoltée) |
| **Intrants** | CRUD, filtre par type, coût total par type |
| **Récoltes** | CRUD, filtre par qualité, aperçu du rendement pendant la saisie |
| **Rendements** | Rendement (kg/ha) et coût de production (DH/kg) par culture, graphiques comparatifs |

Autres points :
- messages de validation **en français** sous chaque champ ;
- suppression **en cascade** (supprimer une parcelle supprime ses cultures, intrants et récoltes) ;
- interface pensée pour **ordinateur**.

## Technologies

| Partie | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, React Router, Axios, Recharts, Lucide (icônes) |
| **Backend** | Laravel 13 (PHP 8.4), Laravel Sanctum (authentification par jeton) |
| **Base de données** | MySQL 8.4 |
| **Tests** | PHPUnit (backend), ESLint (frontend) |
| **Outils** | Git / GitHub, Composer, npm, VS Code, MacPorts |

## Structure du projet

```
Projet-web09/
├── backend/                     # API Laravel
│   ├── app/
│   │   ├── Http/Controllers/Api/  # Auth, Parcelle, Culture, Intrant, Recolte, Dashboard
│   │   └── Models/                # User, Parcelle, Culture, Intrant, Recolte
│   ├── database/
│   │   ├── migrations/            # Tables et relations
│   │   └── seeders/               # Données de démonstration
│   ├── lang/fr/validation.php     # Messages d'erreur en français
│   ├── routes/api.php             # Routes de l'API
│   └── tests/Feature/             # Tests automatisés
├── frontend/                    # Application React
│   └── src/
│       ├── api/client.js          # Appels à l'API (Axios + jeton)
│       ├── context/AuthContext.jsx# Utilisateur connecté
│       ├── hooks/useCrud.js       # Liste / ajout / modification / suppression
│       ├── components/            # Mise en page, formulaires, panneaux
│       ├── pages/                 # Une page par écran
│       └── utils/format.js        # Formatage (dates, poids, DH)
├── docs/
│   ├── captures/                  # Captures d'écran
│   └── uml/                       # Diagrammes UML
└── README.md
```

## Modèle de données

```
User 1 ──── * Parcelle 1 ──── * Culture 1 ──── * Intrant
                                       1 ──── * Recolte
```

| Table | Champs principaux |
|---|---|
| `users` | id, name, email, password |
| `parcelles` | id, **user_id**, nom, superficie (ha), localisation, type_sol, description |
| `cultures` | id, **parcelle_id**, nom, variete, date_plantation, date_recolte_prevue, etat, notes |
| `intrants` | id, **culture_id**, nom, type, quantite, unite, date_utilisation, cout, notes |
| `recoltes` | id, **culture_id**, date_recolte, quantite (kg), qualite, notes |

Toutes les clés étrangères utilisent `ON DELETE CASCADE`.

**Calculs :**
- Rendement = quantité récoltée (kg) ÷ superficie de la parcelle (ha)
- Coût de production = coût total des intrants (DH) ÷ quantité récoltée (kg)

## Installation

### Prérequis

| Outil | Version utilisée |
|---|---|
| PHP | 8.4 (extensions : mbstring, openssl, intl, pdo_mysql, zip, curl) |
| Composer | 2.x |
| MySQL | 8.x |
| Node.js / npm | 20.x / 10.x |
| Git | 2.x |

> Sur macOS 11 (Big Sur), Homebrew n'est plus pris en charge : PHP et MySQL ont été installés avec **MacPorts** (`php84`, `mysql8-server`).

### 1. Récupérer le projet

```bash
git clone https://github.com/sarababile/Projet-web09.git
cd Projet-web09
```

### 2. Base de données

Dans le client MySQL (`mysql -u root -p`) :

```sql
CREATE DATABASE gestion_agricole CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'agri'@'localhost' IDENTIFIED BY 'agri';
CREATE USER 'agri'@'127.0.0.1' IDENTIFIED BY 'agri';
GRANT ALL PRIVILEGES ON gestion_agricole.* TO 'agri'@'localhost';
GRANT ALL PRIVILEGES ON gestion_agricole.* TO 'agri'@'127.0.0.1';
FLUSH PRIVILEGES;
```

### 3. Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

L'API est disponible sur **http://localhost:8000/api**.

### 4. Frontend (React)

Dans un **second terminal** :

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

L'application est disponible sur **http://localhost:5173**.

### Réinitialiser les données de démonstration

```bash
cd backend
php artisan migrate:fresh --seed
```

## Compte de démonstration

| Email | Mot de passe |
|---|---|
| `demo@ferme.ma` | `password` |

Le bouton **« Essayer avec le compte démo »** de la page de connexion se connecte directement.

Données incluses : 4 parcelles (région de Souss-Massa, 18,1 ha), 6 cultures, 11 intrants (82 200 DH) et 8 récoltes (183 100 kg).

## API REST

Toutes les routes sont préfixées par `/api`. Les routes protégées demandent l'en-tête :
`Authorization: Bearer <jeton>`

### Authentification

| Méthode | Route | Description | Protégée |
|---|---|---|---|
| POST | `/register` | Inscription → `{ user, token }` | Non |
| POST | `/login` | Connexion → `{ user, token }` | Non |
| POST | `/logout` | Déconnexion (supprime le jeton) | Oui |
| GET | `/user` | Utilisateur connecté | Oui |

### Ressources

| Méthode | Route | Description |
|---|---|---|
| GET | `/parcelles?search=` | Liste des parcelles (avec nombre de cultures) |
| POST | `/parcelles` | Ajouter une parcelle |
| GET | `/parcelles/{id}` | Détail d'une parcelle |
| PUT | `/parcelles/{id}` | Modifier une parcelle |
| DELETE | `/parcelles/{id}` | Supprimer une parcelle |
| GET | `/cultures?parcelle_id=&etat=` | Liste des cultures |
| POST · GET · PUT · DELETE | `/cultures`, `/cultures/{id}` | CRUD des cultures |
| GET | `/intrants?culture_id=&type=` | Liste des intrants |
| POST · GET · PUT · DELETE | `/intrants`, `/intrants/{id}` | CRUD des intrants |
| GET | `/recoltes?culture_id=` | Liste des récoltes (avec rendement) |
| POST · GET · PUT · DELETE | `/recoltes`, `/recoltes/{id}` | CRUD des récoltes |
| GET | `/dashboard` | Statistiques du tableau de bord |
| GET | `/rendements` | Rendement et coût de production par culture |

**Codes de réponse :** `200` OK · `201` créé · `204` supprimé · `401` non connecté · `403` accès refusé (ressource d'un autre utilisateur) · `404` introuvable · `422` données invalides (messages en français).

## Tests

```bash
cd backend
php artisan test       # 14 tests : authentification, CRUD, validation, rendements, isolation des utilisateurs, cascade

cd ../frontend
npm run lint           # vérification du code React
npm run build          # version de production
```

## Captures d'écran

| Connexion | Inscription |
|---|---|
| ![Connexion](docs/captures/01-connexion.png) | ![Inscription](docs/captures/02-inscription.png) |

| Tableau de bord | Parcelles |
|---|---|
| ![Tableau de bord](docs/captures/03-tableau-de-bord.png) | ![Parcelles](docs/captures/04-parcelles.png) |

| Formulaire et validation | Cultures |
|---|---|
| ![Validation](docs/captures/05-validation.png) | ![Cultures](docs/captures/06-cultures.png) |

| Intrants | Récoltes |
|---|---|
| ![Intrants](docs/captures/07-intrants.png) | ![Récoltes](docs/captures/08-recoltes.png) |

| Rendements |
|---|
| ![Rendements](docs/captures/09-rendements.png) |

## Diagrammes UML

Les diagrammes se trouvent dans [`docs/uml/`](docs/uml) :

- diagramme de cas d'utilisation ;
- diagramme de classes ;
- diagramme de séquence (connexion et ajout d'une récolte) ;
- modèle de données.

## Problèmes rencontrés et solutions

| Problème | Solution |
|---|---|
| macOS 11 : Homebrew non pris en charge, PHP système en 7.3 | Installation de PHP 8.4 et MySQL 8 avec **MacPorts** |
| Docker Desktop bloqué au démarrage sur ce Mac | Abandon de Docker au profit d'une installation locale |
| MySQL refusait les connexions (`ERROR 2003`) | `skip_networking = OFF` dans `my.cnf` |
| Erreur `caching_sha2_password` avec PHP | Utilisateur MySQL créé avec `mysql_native_password` |
| Messages de validation du navigateur en anglais | `noValidate` sur les formulaires + traductions Laravel dans `lang/fr` |
| `npm run build` : module `lightningcss.darwin-x64.node` introuvable | Réinstallation propre de `node_modules` |
