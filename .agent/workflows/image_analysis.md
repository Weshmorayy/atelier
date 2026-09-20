---
description: Workflow d'analyse des assets client (Étape 2 du processus)
---

# Workflow — Analyse des Assets Client

> Déclenché par : "Analyse les assets de <NomClient>" ou "Étape 2 pour <NomClient>"

---

## Objectif

Produire `IMAGE_ANALYSIS.md` dans `~/storage/shared/Documents/Clients/<NomClient>/`.

Ce fichier est la base de travail pour l'étape 3 (plan design). Il doit être suffisamment détaillé pour qu'un designer — sans voir les images — comprenne exactement ce que le client possède comme matière visuelle.

---

## Étape 1 — Localiser les assets

```
~/storage/shared/Documents/Clients/<NomClient>/
├── Brand/
├── Stock-Images/
├── Social-Screenshots/
└── Notes/
```

Lister tous les fichiers dans chacun de ces dossiers.

---

## Étape 2 — Analyser chaque fichier

Pour chaque image, produire une description couvrant :

### Pour les fichiers Brand/
- Nom exact du fichier
- Type : logo, favicon, charte couleur, illustration de marque
- Couleurs dominantes (hex si lisible, sinon description précise : "bordeaux foncé", "or chaud", "ivoire")
- Typographie visible (si logo avec texte) : style, graisse, casse
- Fond : transparent, blanc, coloré
- Ce qu'on peut extraire pour le site : couleurs primaires, secondaires, accent

### Pour les fichiers Stock-Images/
- Nom exact du fichier
- Ce qu'on voit : sujet, cadrage, lumière, fond
- Qualité utilisable pour le web : bonne / acceptable / trop basse résolution
- Utilisation possible : hero, galerie produit, section éditoriale, fond de section
- Ce qu'on ne voit PAS (fond, logo, branding — à noter si absent)

### Pour les fichiers Social-Screenshots/
- Nom exact du fichier
- Type de contenu : post produit, promo, annonce, témoignage client, story
- Informations extractibles : prix mentionnés, slogans récurrents, offres, services listés, ton de communication, quartiers/villes mentionnés, moyens de paiement affichés
- ⚠️ Mentionner explicitement : "Image non utilisable sur le site — source d'information seulement"

---

## Étape 3 — Produire IMAGE_ANALYSIS.md

Structure du fichier :

```markdown
# Analyse des Assets — <NomClient>
> Générée le : JJ-MM-AAAA

---

## Résumé Exécutif

[3-5 phrases résumant ce que les assets révèlent sur la marque : 
couleurs dominantes, ambiance générale, matière photo disponible, 
informations extraites des réseaux sociaux]

---

## Brand/

### <nom-exact-fichier.ext>
- **Type** : ...
- **Couleurs** : ...
- **Typographie** : ...
- **Fond** : ...
- **À retenir** : ...

[répéter pour chaque fichier]

---

## Stock-Images/

### <nom-exact-fichier.ext>
- **Sujet** : ...
- **Cadrage** : ...
- **Qualité web** : ...
- **Usage possible** : ...

[répéter pour chaque fichier]

---

## Social-Screenshots/

> ⚠️ Ces images sont des sources d'information uniquement. Elles ne peuvent pas être utilisées directement sur le site.

### <nom-exact-fichier.ext>
- **Type de contenu** : ...
- **Informations extraites** :
  - Prix : ...
  - Services : ...
  - Slogans / accroches : ...
  - Villes / quartiers : ...
  - Paiements : ...
  - Ton : ...

[répéter pour chaque fichier]

---

## Synthèse pour le Design

### Palette disponible
- Couleur principale : ...
- Couleur secondaire : ...
- Couleur accent : ...
- Blanc/Noir utilisés : ...

### Typographie de marque
- Style identifié : ...

### Photos utilisables
- Heroes possibles : [liste des fichiers]
- Produits : [liste des fichiers]
- Éditoriales : [liste des fichiers]
- À éviter / trop basse qualité : [liste]

### Informations commerciales extraites
- Gamme de prix : ...
- Services confirmés : ...
- Zone géographique : ...
- Paiements acceptés : ...
- Slogan(s) identifié(s) : ...
```

---

## Étape 4 — Signaler à l'USER

Une fois `IMAGE_ANALYSIS.md` créé :

```
✅ Analyse terminée — IMAGE_ANALYSIS.md créé dans Documents/Clients/<NomClient>/

Résumé :
- [N] fichiers Brand analysés
- [N] fichiers Stock-Images analysés
- [N] captures Social-Screenshots analysées

Palette identifiée : [couleur principale], [couleur secondaire], [accent]
Photos utilisables pour le site : [N]

Quand tu es prêt pour l'étape 3 (plan design), utilise un modèle avancé et dis :
"Plan design pour <NomClient>"
```
