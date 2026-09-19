# Mentor Data Analyst

Compagnon d'apprentissage pour se former en profondeur au métier de Data Analyst : révision par quiz sur les notions clés, générateur de projets pilotes guidés (avec vrai jeu de données à trouver), et coaching sur le mindset du métier. Propulsé par l'API **Mistral**, avec tes données sauvegardées dans une **vraie base de données** (pas seulement dans ton navigateur).

La clé API Mistral et la base de données restent côté serveur — jamais exposées dans le navigateur.

---

## 1. Créer ta clé API Mistral

1. Va sur https://console.mistral.ai/api-keys
2. Crée un compte si besoin, puis génère une clé API.
3. Vérifie que ton compte a bien un plan actif (Billing / Plan dans la console — vérification par téléphone souvent nécessaire pour le tier gratuit "Experiment").

## 2. Créer une base de données Postgres gratuite

**Option recommandée : Neon (gratuit, sans expiration)**
1. Va sur https://neon.tech et crée un compte gratuit.
2. Crée un nouveau projet. Neon te donne une "Connection string" du type :
   `postgresql://user:password@ep-xxxx.neon.tech/dbname?sslmode=require`

## 3. Lancer en local

Prérequis : [Node.js](https://nodejs.org) version 18 ou plus.

```bash
cd data-analyst-mentor
npm install
cp .env.example .env
```

Remplis `.env` avec ta clé Mistral et ta connection string Postgres, puis :
```bash
npm start
```

**Important** : ouvre bien **http://localhost:3000** dans ton navigateur — n'ouvre jamais `public/index.html` directement en double-cliquant dessus (ça ne fonctionnera pas, le fichier a besoin d'être servi par ce serveur).

## 4. Mettre le projet sur GitHub

```bash
cd data-analyst-mentor
git init
git add .
git commit -m "Premier commit"
git branch -M main
git remote add origin https://github.com/TON_PSEUDO/data-analyst-mentor.git
git push -u origin main
```

## 5. Déployer sur Render

1. Sur [render.com](https://render.com), **New → Blueprint**, sélectionne ton dépôt (le fichier `render.yaml` est détecté automatiquement).
2. Renseigne `MISTRAL_API_KEY` et `DATABASE_URL` quand Render te les demande.
3. **Create Web Service** (ou **Apply**). Le déploiement prend 1 à 2 minutes.
4. Render te donne une URL du type `https://mentor-data-analyst.onrender.com`.

**Note** : le plan gratuit Render se met en veille après 15 minutes d'inactivité (~30-50s pour se relancer). Normal.

---

## Les trois modules

- **Réviser** — choisis une notion du parcours Google Data Analytics (SQL, nettoyage de données, visualisation, statistiques…), génère un quiz de 5 questions, et garde un historique de tes scores.
- **Projets pilotes** — génère un mini-projet complet (contexte métier simulé, jeu de données réel à trouver, étapes à cocher, livrable attendu) à trois niveaux de difficulté.
- **Mindset** — un espace de coaching conversationnel sur la façon de penser et de communiquer comme un data analyst (rigueur, gestion de l'ambiguïté, relation avec les non-techniques).

## Personnaliser

- Modèle Mistral : variable `MISTRAL_MODEL` (par défaut `mistral-small-latest`, accessible en tier gratuit).
- Les thèmes de révision et les prompts sont dans `public/index.html`, modifiables directement.
