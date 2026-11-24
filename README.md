# 🌾 AgriGestion — Gestion d'exploitation agricole

Projet de module **Programmation Web Dynamique** — Filière IL, FS Agadir (2026)
Réalisé par : **Sara BABILE**

Application web pour gérer les parcelles, cultures, intrants et récoltes d'une exploitation agricole et suivre ses rendements.

## Technologies
- **Frontend** : React (Vite)
- **Backend** : Laravel (API REST) + Sanctum — PHP 8.4
- **Base de données** : MySQL 8.4

## Structure
```
Projet-web09/
├── frontend/   → application React
├── backend/    → API Laravel
└── README.md
```

## Environnement de développement (macOS)
PHP 8.4 et MySQL 8 sont installés avec [MacPorts](https://www.macports.org) :
```bash
sudo port install php84 php84-mbstring php84-openssl php84-intl php84-mysql php84-zip php84-iconv php84-curl php84-sqlite
sudo port select --set php php84
sudo port install mysql8-server
```

## Base de données
Démarrer MySQL (une seule fois, il redémarre ensuite automatiquement) :
```bash
sudo port load mysql8-server
```
Création de la base et de l'utilisateur :
```sql
CREATE DATABASE gestion_agricole CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'agri'@'localhost' IDENTIFIED BY 'agri';
GRANT ALL PRIVILEGES ON gestion_agricole.* TO 'agri'@'localhost';
```

## Données de démonstration
```bash
cd backend
php artisan migrate:fresh --seed
```
Compte de démonstration : **demo@ferme.ma** / **password**