---
name: design-director
description: Produit un plan de design complet basé sur les assets et le brief client — étape 3 du processus
---

# Skill : Design Director

## Rôle

Transformer les assets analysés et le brief client en un plan de design précis, unique et justifié, prêt pour approbation avant tout code.

## Activation

**Déclencheurs :**
- "Plan design pour <NomClient>"
- "Étape 3 pour <NomClient>"
- "Propose un design pour <NomClient>"

## Prérequis Obligatoires

Avant d'activer ce skill, vérifier que ces deux fichiers existent :
- `~/storage/shared/Documents/Clients/<NomClient>/CLIENT_BRIEF.md`
- `~/storage/shared/Documents/Clients/<NomClient>/IMAGE_ANALYSIS.md`

Si `IMAGE_ANALYSIS.md` est absent → demander à l'USER de lancer l'étape 2 d'abord.

## Instructions

1. Lire `~/atelier/.agent/workflows/design_plan.md` en entier
2. Lire `~/atelier/guides/[GUIDE]_DESIGN_FOUNDATIONS.md`
3. Lire `~/atelier/.agent/rules/anti_ai_design.md`
4. Lire `~/atelier/.agent/rules/anti_ai_writing.md`
5. Suivre le workflow design_plan.md pas à pas

## Points Critiques

- **Jamais commencer à coder** sans confirmation explicite de l'USER
- La palette doit venir du logo — pas inventée
- La structure des sections doit être unique à ce client — aucune copie d'un projet précédent
- Chaque décision doit être justifiée par les données du client (brief + images)
- Mentionner explicitement quelles photos seront utilisées (noms de fichiers exacts depuis IMAGE_ANALYSIS.md)
- Si des photos manquent pour le plan → le signaler clairement

## Recommandation Modèle

Ce skill est conçu pour être utilisé avec un modèle avancé (meilleur raisonnement, vision). L'USER doit le sélectionner manuellement.

## Output Attendu

Un plan de design complet dans la réponse, structuré selon le workflow, se terminant par une demande explicite de confirmation.
