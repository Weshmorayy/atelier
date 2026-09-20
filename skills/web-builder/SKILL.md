---
name: web-builder
description: Initialise, construit et livre un projet web client sur GitHub — étape 4 du processus
---

# Skill : Web Builder

## Rôle

Construire le site client de A à Z selon le plan design approuvé, vérifier le build, et pusher sur GitHub.

## Activation

**Déclencheurs :**
- "Commence le site de <NomClient>"
- "Étape 4 pour <NomClient>"
- "Build le site de <NomClient>"

## Prérequis Obligatoires

Avant d'activer ce skill, vérifier :
- Plan design approuvé explicitement par l'USER (confirmation dans la conversation)
- `CLIENT_BRIEF.md` et `IMAGE_ANALYSIS.md` disponibles et lus
- Stack décidée (Next.js + TypeScript + Tailwind par défaut, ou autre si spécifié)

## Instructions

1. Lire `~/atelier/.agent/workflows/build_project.md` en entier
2. Lire `~/atelier/.agent/rules/code_quality.md`
3. Lire `~/atelier/.agent/rules/anti_ai_design.md`
4. Lire `~/atelier/.agent/rules/anti_ai_writing.md`
5. Suivre le workflow build_project.md pas à pas

## Points Critiques

- Toujours initialiser le projet **from scratch** via `create-next-app` — jamais copier un projet existant
- `src/config/site.ts` est la seule source de vérité pour les données métier
- Le build doit passer (`next build` + `tsc --noEmit`) avant tout push
- Créer la documentation `.docs/` complète avec le contexte du projet
- Mettre à jour `~/atelier/PROJECTS_INDEX.md` après le push
- **S'arrêter après le push** — ne pas continuer sans retour de l'USER

## Checklist Finale

Avant de déclarer le projet terminé :
- [ ] `next build` sans erreur
- [ ] `tsc --noEmit` sans erreur
- [ ] Toutes les pages ont `generateMetadata()`
- [ ] JSON-LD injecté dans le layout
- [ ] `.docs/` créé et rempli
- [ ] Pushé sur GitHub avec URL
- [ ] `PROJECTS_INDEX.md` mis à jour
- [ ] Rapport final présenté à l'USER avec URL GitHub

## Output Attendu

Un rapport final clair avec :
- URL GitHub cliquable
- Confirmation Vercel-ready
- Confirmation Coolify-ready
- Liste des pages construites
- Arrêt en attente de validation
