---
description: Workflow de build et livraison (Étape 4 du processus)
---

# Workflow — Build & Livraison

> Déclenché par : "Commence le site de <NomClient>" (après approbation du plan design)
> Prérequis : plan design approuvé par l'USER

---

## Étape 1 — Vérifier le scaffolding projet

Le dossier `~/atelier/<slug>-website/` avec son `.docs/` doit avoir été créé via la commande `new-project` dans Termux (lancée par l'USER après approbation du plan design).

Vérifier qu'il existe :
```bash
ls ~/atelier/<slug>-website/.docs/
```

Si absent → demander à l'USER de lancer `new-project` d'abord.

Une fois confirmé, initialiser Next.js dans ce dossier :

```bash
cd ~/atelier/<slug>-website

npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git

npm install lucide-react
```

Configurer ensuite :
- `next.config.mjs` : compatibilité `output: 'export'` et `output: 'standalone'`
- `tailwind.config.ts` : variables CSS du client
- `src/app/globals.css` : palette issue du plan design approuvé

---

## Étape 2 — Créer la structure de fichiers

```
src/
├── app/
│   ├── layout.tsx          ← Métadonnées racine + JSON-LD
│   ├── page.tsx            ← Page d'accueil
│   ├── sitemap.ts          ← Sitemap dynamique
│   ├── robots.ts           ← Robots.txt dynamique
│   └── [autres pages]/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── sections/           ← Un fichier par section de page
├── config/
│   └── site.ts             ← Source unique de vérité des données métier
├── lib/
│   ├── seo.ts              ← generateMetadata() helper
│   └── whatsapp.ts         ← (si boutique) buildOrderUrl()
└── types/
    └── index.ts
```

---

## Étape 3 — Configurer site.ts

Remplir `src/config/site.ts` avec toutes les données du client issues de `CLIENT_BRIEF.md` et `IMAGE_ANALYSIS.md`.

Aucune donnée métier ne doit exister ailleurs que dans ce fichier.

---

## Étape 4 — Construire les sections

Suivre le plan design approuvé section par section.

Pour chaque section :
1. Vérifier la checklist anti-IA design (`~/atelier/.agent/rules/anti_ai_design.md`)
2. Vérifier la checklist anti-IA écriture (`~/atelier/.agent/rules/anti_ai_writing.md`)
3. Utiliser les vraies photos identifiées dans `IMAGE_ANALYSIS.md`
4. Aucune donnée hardcodée — tout vient de `site.ts`

---

## Étape 5 — Mettre à jour la documentation .docs/

Le `.docs/` a été créé par `new-project` avec des guides squelettes.

À cette étape, remplir les guides avec le contenu réel du build :
- `[2]_DESIGN_GUIDE.md` — compléter palette (hex), typographie, décisions visuelles du plan approuvé
- `[3]_CODE_GUIDE.md` — documenter l'architecture réelle du projet
- `[4]_SEO_GUIDE.md` — ajouter les mots-clés, métadonnées par page, schémas
- `[5]_DATABASE_GUIDE.md` — remplir si boutique avec backend, laisser vide sinon
- `[6]_DEPENDENCIES_GUIDE.md` — lister tous les packages installés
- Ajouter dans `[8]_TASKS_DONE.md` une entrée pour le build initial

---

## Étape 6 — Vérifications obligatoires

```bash
cd ~/atelier/<slug>-website

# Build statique
NEXT_OUTPUT=export npx next build

# TypeScript
npx tsc --noEmit

# Vérifier console.log
grep -r "console.log" src/ --include="*.tsx" --include="*.ts"
```

Corriger tout problème avant de continuer.

---

## Étape 7 — Push GitHub

```bash
cd ~/atelier/<slug>-website

# Git init
git init
git add .
git commit -m "feat: initial build — <NomClient>"

# Créer le repo et pusher
gh repo create <compte>/<slug>-website --public --source=. --remote=origin --push
```

---

## Étape 8 — Mettre à jour PROJECTS_INDEX.md

Ajouter une ligne dans `~/atelier/PROJECTS_INDEX.md` :

```
| NomClient | slug | <compte>/<slug>-website | Type | Ville | 🔵 En cours | AAAA-MM |
```

---

## Étape 9 — Rapport final à l'USER

```
✅ Site <NomClient> livré

📦 Repo GitHub : https://github.com/<compte>/<slug>-website
🚀 Vercel-ready : oui — connecter le repo sur vercel.com
☁️  Coolify-ready : oui — voir guides/[GUIDE]_DEPLOYMENT.md

Pages construites :
- / (Accueil)
- [autres pages]

⛔ Arrêt — en attente de ta validation visuelle avant toute itération.
```

**Toujours s'arrêter après le push initial. Ne pas continuer sans retour de l'USER.**
