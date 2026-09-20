# AGENTS.md — Règles Permanentes du Système Atelier

> Ce fichier est lu en priorité à chaque session. Il définit les règles non-négociables pour tout agent IA travaillant sur un projet de ce système.

---

## 1. Philosophie Fondamentale

Chaque site est une commande unique. Pas de réutilisation de structure, de layout ou de composant visuel entre deux projets. Le brief client, son identité visuelle réelle et son secteur dictent tout — pas un template.

**Ce système produit des sites vitrines et boutiques en ligne pour des clients francophones (Dakar, Abidjan).** Tout le contenu visible (titres, descriptions, labels, SEO) est en français par défaut.

---

## 2. Règles Absolues

### 2.1 Avant de commencer un projet
- Lire `~/atelier/.agent/rules/` en entier
- Ne jamais commencer à coder avant que le plan design soit approuvé par le USER
- Ne jamais inventer de contenu (prix, adresses, témoignages, statistiques) — attendre les vraies données

### 2.2 Design
- Zéro copie de layout entre deux projets
- La palette vient exclusivement du logo et des visuels réels du client
- Les captures de réseaux sociaux sont des **sources d'information**, jamais des assets à publier sur le site
- Lire `~/atelier/guides/[GUIDE]_ANTI_AI_DESIGN.md` avant toute décision visuelle

### 2.3 Écriture
- Zéro mot de la blacklist (voir `~/atelier/guides/[GUIDE]_ANTI_AI_WRITING.md`)
- Tout texte doit passer le test WhatsApp : *"Un vrai commerçant enverrait-il cette phrase à un client ?"*
- Prix en FCFA, lieux réels, délais concrets

### 2.4 Code
- Stack par défaut : Next.js (App Router) + TypeScript + Tailwind CSS
- Chaque page a sa `generateMetadata()` pour le SEO
- Pas de `'use client'` inutile — Server Components par défaut
- `next build` doit passer sans erreur avant tout push

### 2.5 GitHub & Déploiement
- Push GitHub automatique à la fin de chaque projet, sans attendre que l'USER le demande
- Repo : `<nomcompte>/<slug>-website` — toujours public
- Format du commit initial : `feat: initial build — <NomClient>`
- Lire `~/atelier/guides/[GUIDE]_DEPLOYMENT.md` pour Coolify et Vercel

### 2.6 Documentation
- Mettre à jour la doc uniquement quand l'USER dit "update doc" ou équivalent
- Lire `~/atelier/.agent/rules/documentation_standards.md` avant toute mise à jour
- Ne jamais modifier un fichier `Tasks/` ou `Issues/` après sa création

---

## 3. Workflow des 4 Étapes

```
ÉTAPE 1 — new-client (Termux)
  Créer le dossier assets dans Documents/Clients/<NomClient>/
  Le USER dépose les fichiers manuellement

ÉTAPE 2 — Analyse des assets
  Skill : image-analyst
  Prompt : "Analyse les assets de <NomClient>"
  Produit : IMAGE_ANALYSIS.md dans Documents/Clients/<NomClient>/

ÉTAPE 3 — Plan design (modèle avancé recommandé)
  Skill : design-director
  Prompt : "Plan design pour <NomClient>"
  Produit : un document de plan soumis à approbation
  → Attendre confirmation explicite avant de passer à l'étape 4

ÉTAPE 4 — Build
  Skill : web-builder
  Prompt : "Commence le site de <NomClient>"
  Produit : code complet + push GitHub
```

---

## 4. Structure d'un Projet Client

```
~/atelier/<slug>-website/
├── AGENTS.md          ← Règles spécifiques au projet (généré auto)
├── .docs/             ← Toute la documentation du projet
│   ├── [1]_PROJECT_DETAILS.md
│   ├── [2]_DESIGN_GUIDE.md
│   ├── [3]_CODE_GUIDE.md
│   ├── [4]_SEO_GUIDE.md
│   ├── [5]_DATABASE_GUIDE.md   ← Rempli uniquement pour les boutiques
│   ├── [6]_DEPENDENCIES_GUIDE.md
│   ├── [7]_COMMON_ISSUES.md
│   ├── [8]_TASKS_DONE.md
│   ├── Tasks/
│   └── Issues/
└── src/               ← Code source (construit de zéro)
```

---

## 5. Ce que l'Agent ne fait JAMAIS

- ❌ Copier un layout ou une structure de section d'un projet précédent
- ❌ Ajouter des fonctionnalités non demandées
- ❌ Utiliser des screenshots de réseaux sociaux comme images de site
- ❌ Inventer des prix, témoignages, adresses ou statistiques
- ❌ Commencer à coder avant approbation du plan design
- ❌ Auto-mettre à jour la documentation
- ❌ Utiliser des dégradés Tailwind génériques (`from-indigo-500`, `to-purple-600`)
- ❌ Mettre 3 cartes identiques côte à côte
- ❌ Ajouter un header avec barre d'adresse collée au-dessus de la nav

---

*Maintenu dans : `~/atelier/AGENTS.md`*
