# 🏓 Calendrier AUS Équipe 3

Application web PWA (Progressive Web App) pour gérer le calendrier, les compositions d'équipe et les scores de l'équipe ALSATIA UNITAS SCHILTIGHEIM 3 - Division 2.

## 📋 Description

Cette application permet de :
- 📅 Consulter le calendrier complet des matchs (saisons 2025 et 2026)
- 👥 Gérer la composition de l'équipe pour chaque match
- 🏆 Enregistrer et consulter les scores
- 📊 Suivre le classement de la division
- 🔍 Rechercher et filtrer les matchs
- 📱 Installer l'application sur mobile (PWA)
- 🌙 Mode sombre/clair

## 🚀 Technologies utilisées

- **Frontend** : HTML, CSS, JavaScript (Vanilla)
- **Backend** : Firebase Firestore
- **Hébergement** : Netlify
- **Functions** : Netlify Serverless Functions
- **PWA** : Service Worker pour fonctionnement hors ligne

## 🏗️ Architecture

```
calendrier-aus-equipe3/
├── index.html                          # Page principale de l'application
├── netlify/
│   └── functions/
│       ├── seedDatabase-equipe3.js     # Initialisation de la base de données
│       ├── getMatches-equipe3.js       # Récupération des matchs
│       ├── getPlayers-equipe3.js       # Récupération des joueurs
│       ├── getRanking-equipe3.js       # Récupération du classement
│       ├── updateMatch-equipe3.js      # Mise à jour d'un match
│       ├── updateScore-equipe3.js      # Mise à jour d'un score
│       └── updatePlayers-equipe3.js    # Mise à jour des joueurs
├── netlify.toml                        # Configuration Netlify
├── package.json                        # Dépendances du projet
└── README.md                           # Ce fichier

```

## 📦 Collections Firebase

### `matches-equipe3`
Stocke les matchs de l'équipe :
- `journee` : Numéro de journée (1-14)
- `homeTeam` / `awayTeam` : Équipes domicile/extérieur
- `date` : Date du match (YYYY-MM-DD)
- `time` : Heure du match
- `venue` : 'home' ou 'away'
- `month` : Mois du match
- `composition` : Disponibilités des joueurs
- `score` : Score du match

### `players-equipe3`
Liste des joueurs :
- `id` : Identifiant unique
- `name` : Nom du joueur

### `ranking-equipe3`
Classement de la division :
- `rang` : Position au classement
- `equipe` : Nom de l'équipe
- `pointsResultat` : Points de résultat
- `joues` / `gagnes` / `nuls` / `perdus` : Statistiques
- `pointsJeuGagnes` / `pointsJeuPerdus` : Points de jeu
- `isOurTeam` : Identifie notre équipe

## ⚙️ Installation et Configuration

### Prérequis
- Node.js (version 14+)
- Compte Firebase
- Compte Netlify

### Configuration Firebase

1. Créez un projet Firebase sur [console.firebase.google.com](https://console.firebase.google.com)
2. Activez Firestore Database
3. Créez un compte de service et téléchargez le fichier JSON des credentials
4. Configurez les variables d'environnement dans Netlify :
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`

### Déploiement sur Netlify

1. Connectez votre repository GitHub à Netlify
2. Configurez les variables d'environnement
3. Déployez l'application
4. Initialisez la base de données en appelant :
   ```
   https://VOTRE-SITE.netlify.app/.netlify/functions/seedDatabase-equipe3
   ```

## 🔧 Utilisation

### Initialiser la base de données

Pour ajouter les matchs initiaux ou les nouveaux matchs :
```bash
# Ouvrez cette URL dans votre navigateur
https://VOTRE-SITE.netlify.app/.netlify/functions/seedDatabase-equipe3
```

La fonction vérifie chaque match et ajoute uniquement ceux qui n'existent pas encore.

### Ajouter de nouveaux matchs

1. Éditez le fichier `netlify/functions/seedDatabase-equipe3.js`
2. Ajoutez les nouveaux matchs dans le tableau `initialMatchesData`
3. Committez et pushez vers GitHub
4. Attendez le déploiement Netlify
5. Appelez la fonction `seedDatabase-equipe3` pour synchroniser

### Gestion des compositions

Les utilisateurs peuvent :
- Marquer leur disponibilité (disponible/indisponible)
- Sélectionner les 3 joueurs qui joueront le match
- Les modifications sont sauvegardées automatiquement dans Firebase

### Enregistrement des scores

Pour chaque match, vous pouvez :
- Saisir le score (points Alsatia vs points adversaire)
- Le statut du match (victoire/défaite/nul) est calculé automatiquement
- Les scores sont affichés avec des couleurs :
  - 🟢 Vert : Victoire
  - 🔴 Rouge : Défaite
  - ⚫ Gris : Match nul

## 📱 Fonctionnalités PWA

L'application peut être installée sur mobile et bureau :
- Fonctionne hors ligne (lecture seule)
- Icône sur l'écran d'accueil
- Mode plein écran
- Notifications (à venir)

## 🎨 Thèmes

L'application propose deux thèmes :
- **Thème clair** : Idéal pour une utilisation en journée
- **Thème sombre** : Réduit la fatigue visuelle en soirée

Le choix est sauvegardé dans le navigateur.

## 📅 Calendrier 2026-2027

### 1ère Phase 2025
- Journées 1 à 7 : Septembre 2025 - Décembre 2025

### 2ème Phase 2026
- Journées 8 à 14 : Janvier 2026 - Mai 2026

## 👥 Joueurs de l'équipe

1. Philippe
2. Jean-Pierre THEODIN
3. Bernard Wolf
4. Julien
5. Laurent Husser
6. Christine Pontida

## 🤝 Contribution

Pour contribuer au projet :

1. Créez une branche feature
   ```bash
   git checkout -b feature/nouvelle-fonctionnalite
   ```

2. Committez vos changements
   ```bash
   git commit -m "Ajout de la nouvelle fonctionnalité"
   ```

3. Pushez vers GitHub
   ```bash
   git push origin feature/nouvelle-fonctionnalite
   ```

4. Créez une Pull Request

## 🐛 Résolution de problèmes

### Les nouveaux matchs n'apparaissent pas

1. Vérifiez que le déploiement Netlify est terminé
2. Appelez la fonction `seedDatabase-equipe3`
3. Rafraîchissez la page (Ctrl+F5 ou Cmd+Shift+R)

### Erreur Firebase

Vérifiez que les variables d'environnement sont correctement configurées dans Netlify.

### L'application ne se met pas à jour

Videz le cache du navigateur ou utilisez le mode navigation privée.

## 📄 Licence

Ce projet est développé pour l'équipe ALSATIA UNITAS SCHILTIGHEIM 3.

## 📞 Contact

Pour toute question ou suggestion, contactez l'équipe de gestion.

---

**Développé avec ❤️ pour l'équipe AUS 3** 🏓
