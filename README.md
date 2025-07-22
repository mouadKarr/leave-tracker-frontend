# Leave Tracker - Frontend

## 📋 Objectif du projet

Le frontend de Leave Tracker est une application web développée avec Vue.js 3 et Vite.  
Elle permet aux utilisateurs de se connecter via Google OAuth 2.0, de créer et consulter leurs demandes de congé, et pour les managers, de gérer toutes les demandes.

--------------------------------------------------------------------------------------------------------------------------------------------------------------------

## ⚙️ Installation et configuration

### Prérequis

- Node.js (version 18 ou plus)  
- Un compte Google avec OAuth configuré

### Étapes

1. Cloner le dépôt frontend :

```bash
git clone https://github.com/mouadKarr/leave-tracker-frontend.git
cd leave-tracker-frontend
Installer les dépendances :
npm install
Créer un fichier .env à la racine avec le contenu suivant :

env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_API_BASE_URL=http://localhost:5032/api
Lancer le serveur de développement :
npm run dev

🚀 Commandes utiles
npm run dev : démarre l’application en mode développement

npm run build : compile l’application pour la production

npm run preview : prévisualise la build de production

🔗 Fonctionnalités principales
Authentification Google OAuth 2.0 avec rôle sélectionnable

Soumission des demandes de congé

Consultation des demandes personnelles (employé)

Tableau de bord manager avec validation/rejet des demandes

Protection des routes selon les rôles utilisateur

📚 Ressources
Vue.js 3 Documentation

Vite Documentation

vue3-google-login

🛠 Variables d’environnement
Variable	Description
VITE_GOOGLE_CLIENT_ID	Client ID Google OAuth 2.0
VITE_API_BASE_URL	URL de base de l’API backend