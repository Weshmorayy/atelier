# [GUIDE] — Anti-IA Design Web

Guide de référence complet pour produire des designs web qui ne ressemblent pas à une sortie IA.

---

## 1. Les "Tells" Visuels — Ce qui trahit immédiatement

### La structure stéréotypée IA

L'IA assemble toujours les mêmes blocs dans le même ordre :

```
❌ Structure IA :
Hero (avec pillule badge flottante)
→ 3 Feature Cards avec icône dans un rond
→ Grille de prix symétrique
→ FAQ accordéon
→ Bloc sombre Contact
→ Footer
```

Il n'existe pas de "bonne structure universelle". La structure doit dériver du **métier réel du client**.

```
✅ Exemple métier — Opticien :
Hero cinématique (photo lifestyle client)
→ Marquee des marques en stock
→ Rail de montures (catalogue scrollable horizontalement)
→ Split asymétrique — guide morpho visage
→ Services numérotés 01/02/03/04 (sans icônes)
→ Assurances mutuelles acceptées
→ Réservation split (photo + formulaire minimaliste)
→ 2 boutiques avec maps intégrées
```

### Les patterns visuels bannis

| Pattern | Pourquoi c'est IA | Alternative |
|---|---|---|
| 3 cartes égales côte à côte | Symétrie parfaite = absence de décision | Grille 2/3 + 1/3, ou liste éditoriale numérotée |
| Badge pillule flottant sur hero | Copié-collé Tailwind UI | Surtitre en petites capitales, numéro de référence |
| FAQ accordéon en bas de page | Structure par défaut automatique | Questions intégrées dans les sections concernées |
| `from-indigo-500 to-purple-600` | Couleurs de démonstration Tailwind | Variables CSS extraites du logo client |
| `backdrop-blur` partout | Tendance IA 2023-2024 | Réservé à 1 élément max par page |
| Icônes dans des ronds colorés | Figma UI Kit copié | Numéros 01/02/03, typographie seule, traits |
| Même padding sur toutes les sections | Aucune décision de rythme | Sections denses vs. sections aérées alternées |
| Boutons `rounded-2xl` partout | Défaut des générateurs | Cohérence choisie : sharp, pill, ou légèrement arrondi — pas les 3 à la fois |
| `animate-bounce` ou `animate-pulse` | Ornement vide | Transitions CSS mesurées (200-300ms) ou aucune animation |
| Emojis dans H1/H2 | IA pense que c'est "humain" | Emojis uniquement dans footer/contact si le client les utilise vraiment |

---

## 2. Règles de Rythme Visuel

### Le rythme par les fonds

```
Section 1 : fond blanc
Section 2 : fond sombre
Section 3 : fond blanc
Section 4 : fond couleur accent léger
Section 5 : fond sombre
```

**Jamais 3 sections consécutives avec le même fond.**

### Le rythme par la densité

Alterner obligatoirement :
- Sections **denses** : catalogue produit, grille de services, galerie
- Sections **aérées** : citation seule, chiffre clé, bannière avec une phrase

### Le plein viewport

Chaque page doit contenir au minimum **une section qui occupe 100% de la hauteur de l'écran** (hero, split éditorial, image de fond avec texte). Les sites vitrines qui n'ont que des sections "normales" semblent plats.

---

## 3. Palette — Extraire, Jamais Inventer

**Méthode :**

1. Ouvrir le logo dans un éditeur ou utiliser un color picker en ligne
2. Identifier la couleur principale, la couleur secondaire, la couleur d'accentuation
3. Ces 3 couleurs + blanc/noir = tout le site

**Ne jamais** choisir une palette "qui va bien". La palette du client EST la palette du site.

**Variables CSS (structure obligatoire) :**

```css
:root {
  --bg-primary: #......;     /* Fond principal de la page */
  --bg-secondary: #......;   /* Fond des sections alternées */
  --bg-accent: #......;      /* Sections spéciales, CTA de fond */
  --text-primary: #......;   /* Titres */
  --text-body: #......;      /* Corps de texte */
  --accent: #......;         /* Boutons, liens, highlights */
  --accent-hover: #......;   /* État hover du CTA */
}
```

---

## 4. Typographie

### Règle de hiérarchie

Un site avec une seule taille de police est plat. Un site avec une hiérarchie marquée semble professionnel.

```
H1 : grand, serif ou sans-serif bold, 48px+ sur desktop
H2 : medium, même famille ou contraste (serif vs sans), 28-36px
H3 : small-caps ou bold sans-serif, 18-22px
Body : lisible, 15-17px, line-height 1.6+
Labels : uppercase, tracking-widest, 11-12px
Prix : bold, grande taille, couleur accent ou texte primaire
```

### Polices recommandées (sans dépendance lourde)

Pour les titres éditoriaux :
```css
font-family: Georgia, 'Times New Roman', Times, serif;
```

Pour le corps et l'interface :
```css
font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
```

Si Google Fonts est utilisé → charger au maximum 2 familles, avec `display: swap`.

---

## 5. Photos et Images

### Catégories et règles

**Photos de produits (fond blanc d'origine) :**
- Conteneur en `bg-white` pur — jamais crème ou gris
- `object-contain` dans un container à hauteur fixe
- Pas de `border` ou `rounded` fort — le produit flotte naturellement

**Photos éditoriales (hero, splits) :**
- `object-cover` + overlay gradient pour lisibilité du texte
- Gradient : `from-black/60 via-black/20 to-transparent`
- Utiliser les vraies photos du client en priorité

**Ce qui est interdit :**
- Photos générées par IA (visages trop parfaits, reflets plastiques)
- Screenshots de réseaux sociaux directement sur le site
- Stock photos génériques de mains tenant des tasses de café

### Badges sur les photos produits

```tsx
{/* ✅ Badge EN DEHORS du overflow-hidden */}
<div className="relative">
  <span className="absolute top-3 left-3 z-10 bg-[var(--accent)] text-white text-xs px-3 py-1">
    Nouveau
  </span>
  <div className="overflow-hidden h-[240px]">
    <img src={product.image} className="h-full w-full object-contain" />
  </div>
</div>
```

---

## 6. Navigation

**Mobile (ordre strict) :**
Logo — [Panier si boutique] — Hamburger

Rien d'autre. Pas de recherche, pas de téléphone, pas de slogan.

**Barre de recherche :**
Pour les boutiques avec catalogue → dans la page `/boutique`, pas dans le header.

**Transparence scroll-aware :**
```tsx
const [scrolled, setScrolled] = useState(false)
useEffect(() => {
  const onScroll = () => setScrolled(window.scrollY > 60)
  window.addEventListener('scroll', onScroll, { passive: true })
  return () => window.removeEventListener('scroll', onScroll)
}, [])

// Appliquer :
className={`fixed top-0 z-50 w-full transition-all duration-300 ${
  scrolled ? 'bg-white shadow-sm border-b' : 'bg-transparent'
}`}
```

---

## 7. Drawers (Navigation Mobile & Panier)

```tsx
// ✅ Toujours à la racine du DOM (via React Portal ou dans layout.tsx)
// ✅ Jamais dans <header> ou <section>
<div className="fixed inset-0 z-[999999] flex">
  {/* Backdrop */}
  <div className="flex-1 bg-black/50" onClick={onClose} />
  {/* Drawer — depuis la droite */}
  <div className="w-[85vw] max-w-sm bg-white h-full overflow-y-auto">
    ...
  </div>
</div>
```

Verrouiller le scroll : `document.body.style.overflow = 'hidden'` à l'ouverture.

---

## 8. Penser Métier, pas Composant

Avant de coder une section, se demander :

> *"Quel site web ferait un professionnel de CE métier, pas un webmaster généraliste ?"*

| Secteur | Ce que le site doit faire avant tout |
|---|---|
| Pâtisserie | Vitrine appétissante, tarifs à la part, commande WhatsApp rapide, saveurs listées |
| Parfumerie | Catalogue searchable, familles olfactives, prix au volume si gros, commande pro |
| Bijouterie | Produits sur fond neutre, matériaux précis, tailles/poids, confiance = artisanat |
| Opticien | Boutique mode, guide morpho, examen de vue valorisé, assurances acceptées |
| Traiteur | Menu déroulant, formules avec prix, galerie de réalisations, zone de livraison |
| Cosmétique | Ingrédients, bénéfices, routine, avant/après, témoignages réels |
| Mode | Tailles disponibles, photos portées, délais, politique retours |

---

## 9. Checklist Finale Design

- [ ] Structure de page unique (aucune ressemblance avec un projet précédent)
- [ ] Palette extraite du logo réel, pas inventée
- [ ] Fonds alternés entre toutes les sections
- [ ] Pas de 3 cartes identiques consécutives
- [ ] Au moins une section plein viewport
- [ ] Hiérarchie typographique marquée (pas une seule taille)
- [ ] Aucun dégradé Tailwind générique
- [ ] Aucun badge pillule flottant sur hero
- [ ] Badges produits hors `overflow-hidden`
- [ ] Nav transparente sur hero, opaque au scroll
- [ ] Drawers à la racine du DOM
- [ ] Aucune statistique inventée
- [ ] Aucun emoji dans H1/H2
