# 🏆 Platine Guides — PWA personnelle

Application web progressive (PWA) pour accéder à mes guides trophées depuis n'importe quel appareil, même hors-ligne.

## Structure du projet

```
platine-pwa/
├── index.html              ← Page d'accueil (liste des guides)
├── manifest.webmanifest    ← Config PWA (icône, nom, couleurs)
├── sw.js                   ← Service Worker (cache offline)
├── games.json              ← Catalogue des guides (à éditer)
├── icon-192.png            ← Icône PWA 192×192
├── icon-512.png            ← Icône PWA 512×512
├── guides/                 ← Dossier de vos fichiers HTML
│   ├── guide_platine_tainted_grail.html
│   └── guide_platine_kingdom_come.html
└── .github/
    └── workflows/
        └── deploy.yml      ← Déploiement automatique sur GitHub Pages
```

---

## Mise en place (une seule fois)

### 1. Créer le dépôt GitHub

1. Aller sur [github.com/new](https://github.com/new)
2. Nommer le dépôt `platine-guides` (ou ce que vous voulez)
3. Le mettre en **Public** (requis pour GitHub Pages gratuit)
4. Cliquer **Create repository**

### 2. Uploader les fichiers

```bash
git clone https://github.com/VOTRE_PSEUDO/platine-guides.git
cd platine-guides

# Copier tous les fichiers du projet ici
cp -r /chemin/vers/platine-pwa/* .

# Créer le dossier guides et y mettre vos fichiers HTML
mkdir guides
cp /chemin/vers/guide_platine_tainted_grail.html guides/
cp /chemin/vers/guide_platine_kingdom_come.html guides/

git add .
git commit -m "Initial deploy"
git push
```

### 3. Activer GitHub Pages

1. Aller dans **Settings** → **Pages** (menu de gauche)
2. Source : **GitHub Actions**
3. Sauvegarder

Le déploiement se lance automatiquement. L'URL sera :
`https://VOTRE_PSEUDO.github.io/platine-guides/`

---

## Ajouter un nouveau guide

### Étape 1 — Déposer le fichier HTML dans `guides/`

```bash
cp mon_nouveau_guide.html guides/
```

### Étape 2 — Mettre à jour `games.json`

Ajouter un objet dans le tableau :

```json
{
  "id": "mon-jeu",
  "title": "Titre du Jeu",
  "subtitle": "Sous-titre",
  "file": "guides/mon_nouveau_guide.html",
  "cover": "URL_image_de_couverture",
  "platform": "PS5",
  "trophies": 42,
  "difficulty": "4/10",
  "color": "#1a1a2e"
}
```

**Trouver une cover :** Chercher sur [SteamGridDB](https://www.steamgriddb.com/) ou utiliser l'header Steam (`https://cdn.cloudflare.steamstatic.com/steam/apps/APP_ID/header.jpg`).

### Étape 3 — Push

```bash
git add .
git commit -m "Ajouter guide : Titre du Jeu"
git push
```

GitHub Actions déploie en ~30 secondes. L'appli détecte la mise à jour et affiche un bouton **↑ Mise à jour** — tap dessus pour actualiser.

---

## Installer l'appli sur mobile

### Android (Chrome)
1. Ouvrir l'URL dans Chrome
2. Bannière "Ajouter à l'écran d'accueil" → Installer
3. Ou : menu ⋮ → **Ajouter à l'écran d'accueil**

### iOS (Safari)
1. Ouvrir l'URL dans Safari
2. Bouton Partager (carré avec flèche) → **Sur l'écran d'accueil**

---

## Comportement offline

Une fois installée, l'appli fonctionne entièrement sans connexion :
- L'accueil et la liste des guides sont toujours disponibles
- Les guides HTML déjà visités sont mis en cache automatiquement
- Les nouveaux guides se téléchargent en arrière-plan à la prochaine connexion

---

## Mise à jour automatique

À chaque `git push` :
1. GitHub Actions injecte un nouveau hash de version dans `sw.js`
2. Le navigateur détecte que le Service Worker a changé
3. Le bouton **↑ Mise à jour** apparaît en haut de l'appli
4. Tap → rechargement instantané avec la nouvelle version
