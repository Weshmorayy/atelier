---
trigger: always_on
---

# Règles Design Anti-IA

Lire avant toute décision visuelle. Ces règles s'appliquent à tous les projets.

---

## Ce qui trahit immédiatement un site généré par IA

### Patterns visuels à bannir

| ❌ Pattern IA | ✅ Alternative |
|---|---|
| 3 cartes exactement identiques en colonnes | Grille asymétrique, liste éditoriale, format magazine |
| Badge "pillule" flottant sur le Hero | Surtitre en petites capitales, numéro de référence, trait horizontal |
| FAQ accordéon systématique | Questions intégrées dans le corps des sections |
| Section Contact formulaire centré seul | Fusionner avec footer ou Info Pratique |
| Dégradé générique Tailwind (`from-indigo-500 to-purple-600`) | Couleurs extraites du logo client avec variables CSS |
| `backdrop-blur` sur toutes les cards | Réservé à 1 seul élément max par page |
| Tout parfaitement centré, même padding partout | Asymétrie voulue, respirations variables |
| Icônes dans des ronds répétées | Numéros 01/02/03, traits, typographie seule |
| Même taille de carte partout | Grandes cartes hero + petites cartes secondaires |
| Section sombre Contact en bas | Footer élégant avec infos pratiques intégrées |
| `animate-bounce` ou `animate-pulse` génériques | Transitions CSS mesurées, ou pas d'animation |
| Emojis dans les titres H1/H2 | Typographie seule — les emojis restent dans le footer/contact |
| Stat inventée "98% de satisfaction" | Aucune stat sans source client confirmée |
| Témoignages génériques avec avatar placeholder | Vrais témoignages avec prénom réel ou aucun testimonial |

---

## Règles de rythme visuel (non-négociables)

1. **Fond alterné** : jamais 3 sections consécutives avec le même fond
2. **Densité variée** : section dense (catalogue) → section aérée (bannière épurée)
3. **Au moins une section plein viewport** par page : hero, split éditorial, ou image de fond
4. **Hiérarchie typographique marquée** : grand titre + corps plus petit. Jamais toutes les tailles identiques
5. **La palette vient du logo réel** — jamais une palette "qui va bien" inventée

---

## Règles produits et images

- Fond des photos produit sur fond blanc d'origine → `bg-white` pur `#FFFFFF`, sans bordure dure
- `object-contain` pour les produits, `object-cover` pour les images éditoriales
- Les badges/labels se positionnent **en dehors** du `overflow-hidden`
- Jamais de screenshots de réseaux sociaux directement dans le site
- Vraies photos du client en priorité — le stock photo est un fallback

---

## Navigation

- Sur mobile : Logo + Panier (si boutique) + Hamburger. Rien d'autre
- Barre de recherche dans la page catalogue, jamais compressée dans la nav
- Drawers (nav mobile, panier) montés à la racine : `fixed inset-0 !z-[999999]`, ouverture depuis la droite
- Transparente sur le hero → fond opaque au scroll (`transition-all duration-300`)

---

## Checklist Design (avant commit)

- [ ] Chaque section a un fond différent de la précédente
- [ ] Aucun texte sombre sur fond sombre
- [ ] Cartes de tailles et dispositions variées
- [ ] Aucun dégradé générique Tailwind
- [ ] Palette issue du logo réel du client
- [ ] Pas de `rounded-2xl border` répété sur toutes les cards
- [ ] Badges produits hors `overflow-hidden`
- [ ] Nav transparente sur hero, opaque au scroll
- [ ] Zéro statistique inventée
- [ ] Photos de produits sur fond blanc pur si source fond blanc
