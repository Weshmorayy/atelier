---
trigger: always_on
---

# Règles Qualité Code

Standards techniques non-négociables pour tous les projets.

---

## Stack et Contraintes

- **Framework** : Next.js (App Router) + TypeScript + Tailwind CSS
- **Icônes** : `lucide-react` uniquement — pas d'autres icon libraries
- **Polices** : Google Fonts ou polices système. Pas de polices non-optimisées
- **State** : Server Components par défaut. `'use client'` uniquement si interaction strictement nécessaire

---

## Compatibilité Déploiement

Chaque projet doit fonctionner dans les deux modes sans modification de code :

```bash
# Mode statique (Hostinger sans serveur, Netlify)
NEXT_OUTPUT=export next build

# Mode standalone (Coolify, Docker, Vercel)
# next.config : output: 'standalone'
```

Cela implique :
- Pas de `headers()` ou `cookies()` dans les composants statiques
- Toujours vérifier la compatibilité avant d'utiliser une API Next.js avancée

---

## Configuration Unique Source de Vérité

Chaque projet a un fichier `src/config/site.ts` qui contient **toutes** les données métier :
- Nom, adresse, téléphone, email, horaires
- Couleurs (re-exportées ici pour cohérence)
- Services, produits, témoignages
- Zones de livraison et tarifs (si boutique)

Aucune donnée métier hardcodée dans les composants.

---

## SEO — Obligations

- Chaque page implémente `generateMetadata()` — pas de page sans métadonnées
- Layout racine injecte les schémas JSON-LD (`LocalBusiness`, `Organization`)
- `sitemap.ts` et `robots.ts` générés dynamiquement via route handlers
- `og:image` configurée pour chaque page principale

---

## Images

Structure dans `/public/images/` :
```
brand/          → logo.png, favicon.ico, og-image.jpg
products/       → PNGs fond transparent ou fond blanc pur
editorial/      → photos lifestyle, héros
optimized/      → versions WebP/AVIF
```

- `next/image` (`<Image />`) pour toutes les images — jamais `<img>` brut sauf exception documentée
- `alt` descriptif obligatoire sur chaque image
- Pas d'images générées par IA

---

## Drawers et Overlays

Tout drawer (navigation mobile, panier) :
- Monté à la racine du DOM — jamais à l'intérieur d'un `<header>` ou d'une `<section>`
- `fixed inset-0 z-[999999]`
- Ouverture depuis la droite
- Verrouille le scroll : `document.body.style.overflow = 'hidden'` à l'ouverture

---

## Boutiques — WhatsApp Order

Format standard pour les liens de commande WhatsApp :

```typescript
// src/lib/whatsapp.ts
export function buildOrderUrl(phone: string, items: CartItem[], total: number): string {
  const lines = items.map(i => `• ${i.name} x${i.qty} — ${(i.price * i.qty).toLocaleString('fr-FR')} FCFA`)
  const msg = ['🛍️ *Nouvelle Commande*', '', ...lines, '', `💰 *Total : ${total.toLocaleString('fr-FR')} FCFA*`, '', 'Merci de confirmer 🙏'].join('\n')
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
}
```

---

## Vérifications Obligatoires Avant Push

```bash
# Build sans erreur
NEXT_OUTPUT=export npx next build

# TypeScript sans erreur
npx tsc --noEmit

# Pas de console.log en prod
grep -r "console.log" src/ --include="*.tsx" --include="*.ts"
```

---

## Checklist Code (avant push)

- [ ] `next build` passe sans erreur
- [ ] `tsc --noEmit` passe sans erreur
- [ ] Tous les `alt` des images sont descriptifs
- [ ] Aucun `console.log` en production
- [ ] Pas de `'use client'` inutile
- [ ] `src/config/site.ts` est la seule source de données métier
- [ ] Drawers montés à la racine
- [ ] Compatibilité `output: 'export'` et `output: 'standalone'` vérifiée
