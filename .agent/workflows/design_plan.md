---
description: Workflow de plan design (Étape 3 du processus) — à utiliser avec un modèle avancé
---

# Workflow — Plan Design

> Déclenché par : "Plan design pour <NomClient>"
> ⚠️ Ce workflow est fait pour un modèle avancé (vision + raisonnement). L'USER le spécifie manuellement.

---

## Objectif

Produire un plan de design complet, soumis à approbation de l'USER, avant d'écrire une seule ligne de code.

Le plan doit être si précis qu'un développeur pourrait le suivre sans demander de clarification visuelle.

---

## Étape 1 — Lire les sources

Lire dans cet ordre, tout en entier :

1. `~/storage/shared/Documents/Clients/<NomClient>/CLIENT_BRIEF.md`
2. `~/storage/shared/Documents/Clients/<NomClient>/IMAGE_ANALYSIS.md`
3. `~/atelier/.agent/rules/anti_ai_design.md`
4. `~/atelier/.agent/rules/anti_ai_writing.md`
5. `~/atelier/guides/[GUIDE]_DESIGN_FOUNDATIONS.md`

---

## Étape 2 — Analyser le secteur

Identifier les 3 meilleurs sites mondiaux du secteur du client. Observer :
- Structure de navigation
- Mode de présentation des produits/services
- Rythme typographique
- Usage des espaces et de la couleur

Ne pas copier — s'en inspirer pour savoir ce que "le meilleur du secteur" ressemble, puis faire mieux avec l'identité propre du client.

---

## Étape 3 — Construire le plan

Le plan doit couvrir :

### A. Analyse de l'identité
- Ce que les assets révèlent sur la marque (ton, ambiance, clientèle cible)
- Palette extraite du logo : couleur principale (hex), secondaire (hex), accent (hex)
- Typographie identifiée ou recommandée (avec justification)
- Ce que le client fait différemment de ses concurrents

### B. Fondation choisie
- Nom et description de la direction visuelle (pas un template — une direction)
- Justification en 2-3 phrases liées au client
- Ce qui rend ce choix unique pour CE client (pas générique)

### C. Architecture des pages

Pour chaque page :
```
Page : /
├── Section 1 : [Nom] — [Fond] — [Description précise du contenu et de la mise en page]
├── Section 2 : [Nom] — [Fond] — [Description]
└── ...
```

Règles :
- Les fonds alternent obligatoirement
- Pas de 3 sections avec le même fond consécutif
- Au moins une section plein viewport par page
- Nommer chaque section (pas "Hero", "Features", "CTA" — mais des noms spécifiques au métier)

### D. Palette complète
```
--color-bg-primary: #......   [Fond principal]
--color-bg-secondary: #......  [Fond alternatif]
--color-bg-accent: #......     [Sections spéciales]
--color-text-primary: #......  [Titres]
--color-text-body: #......     [Corps de texte]
--color-accent: #......        [CTA, liens, highlights]
--color-accent-hover: #......
```

### E. Typographie
- Police titre (avec source : Google Fonts, système, ou chargée localement)
- Police corps
- Tailles et graisses utilisées pour H1, H2, H3, corps, labels, prix

### F. Composants clés à concevoir
Lister les composants inhabituels ou spécifiques au métier qui devront être créés. Pas les composants génériques (nav, footer) — ceux qui donnent l'identité du site.

### G. Photos et assets
- Quelles photos utiliser pour quelles sections (références exactes aux noms de fichiers de IMAGE_ANALYSIS.md)
- Si des photos manquent → le noter explicitement pour que l'USER puisse les fournir

### H. Copywriting de base
- Proposition de slogan principal (tiré des réseaux sociaux ou validé avec l'USER)
- 2-3 accroches de section
- Ton général : tutoiement ou vouvoiement ? Formel ou chaleureux ?

---

## Étape 4 — Soumettre pour approbation

Présenter le plan de manière claire et lisible. Terminer par :

```
---
Ce plan attend ton approbation avant que je commence le code.

Tu peux :
- Approuver → je démarre immédiatement
- Modifier un point → dis-moi ce qui change
- Rejeter → dis-moi ce que tu veux à la place
```

**Ne pas commencer à coder avant la confirmation explicite de l'USER.**

---

## Ce que ce plan N'est PAS

- Pas un template à remplir mécaniquement
- Pas une reprise de la structure d'un projet précédent
- Pas un choix "qui va bien en général" — chaque décision doit se justifier par les données du client
