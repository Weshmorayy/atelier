# Atelier — Système de Production Web

Dossier principal de tous les projets web de l'agence.

## Ce que c'est

Un système de production de sites vitrines et boutiques en ligne pour des clients francophones (Dakar, Abidjan). Chaque projet est construit de zéro — design unique, code unique, identité propre.

## Structure

```
~/atelier/
├── AGENTS.md             ← Règles permanentes pour l'IA
├── README.md             ← Ce fichier
├── PROJECTS_INDEX.md     ← Registre de tous les projets
├── .agent/               ← Règles et workflows IA
├── skills/               ← Skills AGY
├── guides/               ← Guides de référence
└── <slug>-website/       ← Projets clients
```

## Assets clients

Les fichiers clients (logos, photos, captures sociales) sont dans :
```
~/storage/shared/Documents/Clients/<NomClient>/
```

## Commandes

```bash
new-client          # Créer un nouveau dossier client dans Documents/Clients/
```

## Processus

1. `new-client` → dossier assets créé
2. USER dépose les fichiers (Brand/, Stock-Images/, Social-Screenshots/)
3. AGY — skill `image-analyst` → analyse des assets
4. AGY (modèle avancé) — skill `design-director` → plan design → approbation
5. AGY — skill `web-builder` → build + push GitHub

## Stack par défaut

Next.js (App Router) · TypeScript · Tailwind CSS · Lucide Icons

Modifiable projet par projet si le besoin l'exige.

## Déploiement

Coolify-ready et Vercel-ready sur chaque projet. Voir `guides/[GUIDE]_DEPLOYMENT.md`.
