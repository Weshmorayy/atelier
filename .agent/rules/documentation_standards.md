---
trigger: always_on
---

# Standards de Documentation — Atelier

## La Règle Fondamentale

Il existe deux types de fichiers. Les confondre est l'erreur la plus fréquente.

| | Fichiers registre | Fichiers standalone |
|---|---|---|
| Exemples | `[8]_TASKS_DONE.md`, `[7]_COMMON_ISSUES.md` | `Tasks/[N]-....md`, `Issues/[N]-....md` |
| Rôle | Index scannable en quelques secondes | Le dossier complet |
| Longueur max par entrée | 3 lignes : titre, date, 1-2 phrases | Illimitée |
| Contient | Un lien, rien d'autre | Cause racine, étapes, code, vérification |

**Limite stricte :** une entrée de registre fait 1-2 phrases, moins de ~150 caractères. Si ce que tu vas écrire est plus long, contient des sous-listes, ou explique le "comment" — stop, mets ça dans le fichier standalone et mets le lien dans le registre.

---

## Règles Générales

1. **Lire le workflow avant tout** : Quand l'USER dit "update doc", lire `~/atelier/.agent/workflows/update_docs.md` ET ce fichier EN ENTIER avant d'agir.

2. **Lire le fichier entier avant de modifier** : Avant toute mise à jour, lire le fichier de la première à la dernière ligne. Pas d'exception.

3. **Mises à jour groupées** : Lire tous les fichiers à modifier en parallèle, puis faire toutes les modifications en parallèle. Jamais en séquentiel (lire → modifier → lire → modifier).

4. **Atomique** : Créer le fichier standalone ET mettre à jour le registre dans la même passe. Jamais l'un sans l'autre.

5. **Couverture complète** : Quand l'USER demande "update doc", chaque tâche significative depuis la dernière mise à jour doit avoir son propre fichier standalone et son entrée dans le registre. Pas seulement la dernière tâche.

6. **Déclenchement** : UNIQUEMENT quand l'USER dit "update doc", "mets à jour la doc" ou équivalent. Jamais automatiquement.

7. **Contexte projet** : Toujours vérifier dans quel projet on travaille avant de modifier les chemins. Erreur classique : écrire dans `.docs/` du mauvais projet.

---

## Numérotation

- Chaque fichier standalone (Task ou Issue) a un numéro entre crochets `[N]`
- Les Tasks et Issues sont numérotées indépendamment
- La numérotation continue depuis le numéro le plus haut existant
- Ne jamais réutiliser ou sauter un numéro

---

## Nommage des Fichiers

- Tasks : `[N]-JJ-MM-AAAA-HH-MM_Nom_Tache.md`
- Issues : `[N]-JJ-MM-AAAA-HH-MM_Nom_Issue.md`
- Les crochets `[N]` sont obligatoires

---

## Formats des Registres

### Tasks (`[8]_TASKS_DONE.md`)
```
#### [N]. Titre de la tâche
**Date** : JJ-MM-AAAA-HH-MM
**Description** : Une à deux phrases. Moins de ~150 caractères.
**Lien** : [.docs/Tasks/[N]-JJ-MM-AAAA_Nom.md](.docs/Tasks/[N]-JJ-MM-AAAA_Nom.md)
```

### Issues (`[7]_COMMON_ISSUES.md`)
```
#### [N]. Titre du problème
**Date** : JJ-MM-AAAA-HH-MM
**Description** : Le problème et la solution en 1-2 phrases.
**Lien** : [.docs/Issues/[N]-JJ-MM-AAAA_Nom.md](.docs/Issues/[N]-JJ-MM-AAAA_Nom.md)
```

---

## Comportement des Fichiers

| Fichier | Comportement |
|---|---|
| `[8]_TASKS_DONE.md` | Append uniquement — ne jamais écraser |
| `[7]_COMMON_ISSUES.md` | Append uniquement — ne jamais écraser |
| `[2]_DESIGN_GUIDE.md` | Remplacer les infos obsolètes (pas un registre) |
| `[3]_CODE_GUIDE.md` | Remplacer les infos obsolètes |
| `[6]_DEPENDENCIES_GUIDE.md` | Remplacer les infos obsolètes |
| `Tasks/` et `Issues/` | Jamais modifier après création — archive historique |

---

## Portée de Chaque Guide

### `[1]_PROJECT_DETAILS.md`
Contexte global : client, secteur, ville, type de site, URL de production, contacts clés.

### `[2]_DESIGN_GUIDE.md`
Décisions visuelles : palette exacte (hex), typographie, espacement, composants clés, règles spécifiques au projet. Aucun code, aucune dépendance.

### `[3]_CODE_GUIDE.md`
Architecture, conventions de nommage, patterns clés, structure des dossiers, commandes build/dev. Pas de snippets sauf si le pattern est critique et illisible sans code.

### `[4]_SEO_GUIDE.md`
Métadonnées par page, mots-clés métier, schémas JSON-LD, ville/quartiers cibles, stratégie de contenu.

### `[5]_DATABASE_GUIDE.md`
Schémas, relations, indexes, notes de migration. Rempli uniquement pour les boutiques avec backend. Vide pour les vitrines statiques.

### `[6]_DEPENDENCIES_GUIDE.md`
Format par package :
```
nom-du-package : Description courte.
Raison : Pourquoi ce package, pas un autre.
Config : (optionnel) Étapes spécifiques si critique.
```

### `[7]_COMMON_ISSUES.md`
Registre des problèmes résolus. Section `## Problèmes Résolus` uniquement. Déclenché par l'USER ou si le bug a de fortes chances de revenir.

### `[8]_TASKS_DONE.md`
Registre des tâches complétées. Append only.

---

## Templates — Fichiers Standalone

### Template Task
```markdown
# Tâche : [Titre]

## Détails
- **Date** : JJ-MM-AAAA-HH-MM
- **Statut** : Complétée

## Description
[Ce qui a été accompli]

## Actions
1. **[Catégorie]** :
   - [Action spécifique]

## Vérification
[Comment ça a été testé ou validé]
```

### Template Issue
```markdown
# Issue : [Titre]

## Détails
- **Date** : JJ-MM-AAAA-HH-MM
- **Statut** : Résolue

## Description
[Le problème qui s'est produit]

## Cause Racine
[Ce qui a causé le problème]

## Solution
[Comment c'a été réglé]

## Prévention
[Comment éviter que ça revienne — optionnel]
```

---

## Anti-Redondance

| Contenu | Design | Code | Dépendances | SEO | Base de données |
|---|---|---|---|---|---|
| Décisions visuelles | ✅ | ❌ | ❌ | ❌ | ❌ |
| Architecture | ❌ | ✅ | ❌ | ❌ | ❌ |
| Packages | ❌ | Lien seulement | ✅ | ❌ | ❌ |
| Mots-clés, schémas | ❌ | ❌ | ❌ | ✅ | ❌ |
| Schémas BDD | ❌ | ❌ | ❌ | ❌ | ✅ |
