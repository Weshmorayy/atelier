---
name: image-analyst
description: Analyse tous les fichiers dans le dossier client et produit IMAGE_ANALYSIS.md — étape 2 du processus client
---

# Skill : Image Analyst

## Rôle

Analyser les assets d'un client (logos, photos, captures sociales) et produire un document de référence structuré pour l'étape de design.

## Activation

**Déclencheurs :**
- "Analyse les assets de <NomClient>"
- "Étape 2 pour <NomClient>"
- "Scanne les images de <NomClient>"

## Instructions

1. Lire `~/atelier/.agent/workflows/image_analysis.md` en entier
2. Suivre ce workflow pas à pas
3. Produire `IMAGE_ANALYSIS.md` dans `~/storage/shared/Documents/Clients/<NomClient>/`

## Points Critiques

- Les fichiers dans `Social-Screenshots/` sont des **sources d'information uniquement** — jamais des assets de site. Le mentionner explicitement dans l'analyse.
- Les noms de fichiers dans IMAGE_ANALYSIS.md doivent être **exacts** — ils seront référencés dans le plan design et le code.
- La palette extraite des logos doit donner des valeurs hex précises si possible.
- Ne jamais inventer d'informations — décrire uniquement ce qui est visible.

## Output Attendu

```
~/storage/shared/Documents/Clients/<NomClient>/IMAGE_ANALYSIS.md
```

Suivi d'un résumé en 4-5 lignes dans la réponse à l'USER.
