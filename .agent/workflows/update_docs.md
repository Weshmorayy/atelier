---
description: Workflow de mise à jour de la documentation d'un projet
---

# Workflow — Mise à Jour Documentation

> Ce workflow est déclenché UNIQUEMENT quand l'USER dit "update doc", "mets à jour la doc" ou équivalent. Jamais automatiquement.

---

## Étape 1 — Identifier le projet

Vérifier dans quel projet on travaille.
- Projet actif = `~/atelier/<slug>-website/`
- Tous les chemins de fichiers doivent correspondre à ce projet
- Si ambigu → demander à l'USER

---

## Étape 2 — Lire les standards

Lire EN ENTIER avant de continuer :
- `~/atelier/.agent/rules/documentation_standards.md`

---

## Étape 3 — Recenser ce qui doit être mis à jour

Lister chaque tâche ou problème résolu depuis la dernière mise à jour (ou depuis le début de la session). Pour chacun, décider :
- Fichier standalone Task ?
- Fichier standalone Issue ?
- Guides à mettre à jour ? (Design, Code, SEO, Dépendances, BDD)

Guides à mettre à jour si :
- `[2]_DESIGN_GUIDE.md` : nouvelle palette, nouveau composant visuel, règle ajoutée
- `[3]_CODE_GUIDE.md` : nouveau pattern architectural, nouvelle convention
- `[4]_SEO_GUIDE.md` : nouveaux mots-clés, nouveau schéma, nouvelle page
- `[5]_DATABASE_GUIDE.md` : nouveau schéma, nouvelle relation, nouvelle table
- `[6]_DEPENDENCIES_GUIDE.md` : package installé ou retiré
- `[7]_COMMON_ISSUES.md` : bug résolu qui a de bonnes chances de revenir (ou demande explicite de l'USER)
- `[8]_TASKS_DONE.md` : toute tâche significative complétée

---

## Étape 4 — Lire tous les fichiers concernés (en parallèle)

Appeler `view_file` sur TOUS les fichiers à modifier en même temps — pas séquentiellement.

Identifier pour chaque fichier :
- Le numéro de la prochaine entrée (pour `[7]` et `[8]`)
- La ligne exacte où insérer ou remplacer du contenu

---

## Étape 5 — Effectuer toutes les modifications (en parallèle)

Créer les fichiers standalone ET mettre à jour les registres dans la même passe.

**Rappel absolu** : les entrées dans `[7]_COMMON_ISSUES.md` et `[8]_TASKS_DONE.md` font 1-2 phrases + un lien. Le détail va uniquement dans le fichier standalone.

---

## Étape 6 — Valider avant d'écrire

Pour chaque entrée de registre que tu t'apprêtes à écrire :
- La description fait 1-2 phrases, moins de ~150 caractères ?
- Elle contient un lien vers un fichier standalone qui est également créé dans cette même passe ?
- Elle n'explique pas le "comment" — juste le "quoi" ?

Si une réponse est non → corriger avant d'écrire.

---

## Étape 7 — Résumé post-mise à jour

Présenter un résumé court :

```
Documentation mise à jour :

Modifié :
- [2]_DESIGN_GUIDE.md — ...
- Tasks/[3]-... — Nouveau fichier standalone
- [8]_TASKS_DONE.md — Nouvelle entrée #3

Non modifié :
- [5]_DATABASE_GUIDE.md — Pas de changement BDD
```

---

## Erreurs Fréquentes à Éviter

- Mettre le contenu détaillé dans le registre au lieu du fichier standalone
- Oublier des tâches du début de session
- Modifier les mauvais chemins (vérifier le slug du projet)
- Lire et modifier les fichiers séquentiellement (lire tout d'abord, puis modifier tout)
- Créer un fichier standalone sans son entrée de registre correspondante
