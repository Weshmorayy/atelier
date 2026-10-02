# SPEC_ADMIN_MG — Analyse complète du portail admin MG Perfume (Next.js)

> **But de ce document** : spécification fidèle de l'ÉTAT ACTUEL de `src/app/admin/page.tsx`
> du site MG Perfume, en vue d'une réimplémentation sur une nouvelle plateforme
> multi-tenant partagée. Le client connaît déjà ce design : le langage visuel
> doit être reproduit à l'identique.
>
> **Sources lues intégralement** :
> - `/data/data/com.termux/files/home/.dsh-research/mgp/src/page.tsx` → `src/app/admin/page.tsx` — **4112 lignes** (204 KB) — **lecture séquentielle complète 1→4112** (voir section F).
> - `/data/data/com.termux/files/home/.dsh-research/mgp/src/StoreContext.tsx` → `src/context/StoreContext.tsx` — 422 lignes.
> - `/data/data/com.termux/files/home/.dsh-research/mgp/src/src_types_index.ts` → `src/types/index.ts` — 130 lignes.
> - `/data/data/com.termux/files/home/atelier/mgperfume-website/supabase_master_schema.sql` — 391 lignes.
> - `/data/data/com.termux/files/home/.dsh-research/mgp/src/src_lib_supabase.ts` → `src/lib/supabase.ts` — 21 lignes.
>
> **Stack** : Next.js (App Router) + TypeScript + Tailwind CSS + `@supabase/supabase-js` + `lucide-react`.
> **Langue** : 100 % français (UI, labels, messages d'erreur).

---

## TABLE DES MATIÈRES

| Section | Contenu | Statut |
|---|---|---|
| **A. UI SHELL & VISUAL DESIGN LANGUAGE** | palette, typo, layout, **loading screen**, login, header, **8 onglets**, primitives | ✅ complet |
| **B. FEATURES PER TAB** | les 8 onglets + modale produit, handlers, quirks, code mort | ✅ complet |
| **C. DATA FLOW & STATE** | StoreContext, sync Supabase, offline fallback, mutations, clés de stockage | ✅ complet |
| **D. REUSABILITY ASSESSMENT** | générique vs MG Perfume, ligne par ligne | ✅ complet |
| **E. DATA TYPES** | 13 types de `types/index.ts` + 8 types locaux | ✅ complet |
| **F. COVERAGE** | lignes lues, découpage, limites | ✅ complet |
| **G. RÉSUMÉ EXÉCUTIF** | 10 décisions, quoi reproduire à l'identique, quoi corriger | ✅ complet |

---
---

# E. DATA TYPES

*(source : `src/types/index.ts`, 130 lignes — transcrit intégralement ci-dessous)*

## E.1 Types unions

```ts
export type ScentFamily = 'all' | 'gourmand' | 'aquatique' | 'boise' | 'floral' | 'oriental';
export type PaymentMethod = 'paytech' | 'whatsapp' | 'cod';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
```

> `'all'` dans `ScentFamily` est le sentinel de filtre « Toutes les familles ».

## E.2 Interfaces

### `PerfumeProduct` (ligne 3-24)
```ts
export interface PerfumeProduct {
  id: string;
  name: string;
  brand?: string;
  tagline: string;
  price: number;
  originalPrice?: number;
  volume: string;
  image: string;
  family: ScentFamily;
  categoryLabel: string;
  badge?: string;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  description: string;
  isPopular?: boolean;
  isHero?: boolean;
  inStock?: boolean;
  isArchived?: boolean;
  freeDelivery?: boolean;
}
```
Note : `id` est un **slug texte** (`'khamrah-waha'`), pas un UUID — c'est la PK `TEXT` en base.

### `OrderItem` (30-37)
```ts
export interface OrderItem {
  productId: string; name: string; brand: string;
  price: number; quantity: number; image: string;
}
```

### `Order` (39-59)
```ts
export interface Order {
  id: string;
  ref_command: string;            // snake_case : référence commande affichée à l'admin
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  shipping_zone_id: string;
  shipping_zone_name: string;
  shipping_cost: number;
  subtotal: number;
  total_amount: number;
  items: OrderItem[];
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  paytech_token?: string;        // PayTech (paiement carte Sénégal)
  paytech_redirect_url?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}
```
→ **Mélange camelCase (`items`, `paytech_token`) et snake_case** : l'interface Order est modelée sur les colonnes DB.

### `SiteBackup` (61-72)
```ts
export interface SiteBackup {
  id: string; backup_name: string;
  products_data: PerfumeProduct[]; banners_data: EditorialBanner[];
  shipping_data: ShippingZone[]; faqs_data: FAQItem[];
  contact_data: SiteConfig['contact']; social_data: SiteConfig['social'];
  created_at?: string; updated_at?: string;
}
```
→ JSONB snapshots (table `site_backups`).

### `CartItem` (74-77) — ` { product: PerfumeProduct; quantity: number }`
Utilisé par le front public (panier), **pas lu par l'admin**.

### `ShippingZone` (79-84)
```ts
export interface ShippingZone { id: string; name: string; price: number; delay: string; }
```

### `EditorialBanner` (86-96)
```ts
export interface EditorialBanner {
  id: string; tag: string; title: string; image: string; alt: string;
  linkText: string; href: string; bgColor: string; objectPosition?: string;
}
```

### `FAQItem` (98-101) — `{ q: string; a: string }` (pas d'`id` : l'ordre est porté par `display_order` en DB).

### `SiteConfig` (103-130)
```ts
export interface SiteConfig {
  name: string; brandName: string; tagline: string; description: string;
  url: string; city: string; country: string; currency: string;
  contact: { phone: string; phoneFormatted: string; whatsappNumber: string;
             email: string; address: string; hours: string; };
  social: { facebook?: string; instagram?: string; tiktok?: string;
            whatsappChannel?: string; };
  shippingZones: ShippingZone[];
  editorialBanners?: EditorialBanner[];
  faqs?: FAQItem[];
  products: PerfumeProduct[];
}
```

**Index des types exportés par `src/types/index.ts` (9 types/interfaces + 4 unions) :**

| # | Nom | Type | Ligne |
|---|-----|------|-------|
| 1 | `ScentFamily` | union | 1 |
| 2 | `PerfumeProduct` | interface | 3 |
| 3 | `PaymentMethod` | union | 26 |
| 4 | `PaymentStatus` | union | 27 |
| 5 | `OrderStatus` | union | 28 |
| 6 | `OrderItem` | interface | 30 |
| 7 | `Order` | interface | 39 |
| 8 | `SiteBackup` | interface | 61 |
| 9 | `CartItem` | interface | 74 |
| 10 | `ShippingZone` | interface | 79 |
| 11 | `EditorialBanner` | interface | 86 |
| 12 | `FAQItem` | interface | 98 |
| 13 | `SiteConfig` | interface | 103 |

### E.2bis Types LOCAUX déclarés dans `admin/page.tsx`
*(déclarés en dehors de `src/types/index.ts` — listés et documentés dans les sections B correspondantes ; ils n'existent que dans le fichier admin)*

| Type local | Rôle | Section |
|------------|------|---------|
| `TabId` | identifiant des 8 onglets | [B.0](#b0-navigation--déclaration-des-onglets) |
| `ProductDraft` | brouillon de formulaire produit | [B.2 products](#b2-onglet-products--) |
| `PromoDraft` | brouillon de promotion (discount) | [B.3 promotions](#b3-onglet-promotions--) |
| `BadgeDraft` | brouillon de badge produit | [B.3 promotions](#b3-onglet-promotions--) |
| `BannerDraft` | brouillon de bannière | [B.4 banners](#b4-onglet-banners--) |
| `ZoneDraft` | brouillon de zone de livraison | [B.5 shipping](#b5-onglet-shipping--) |
| `FaqDraft` | brouillon FAQ | [B.6 faq](#b6-onglet-faq--) |
| `OrderFilters` | état des filtres commandes | [B.1 orders](#b1-onglet-orders--) |
| *(scalaires)* | `Promotion`, `HeroPick`, `SUPABASE_SQL_*` | [B.3](#b3-onglet-promotions--), [B.7](#b7-onglet-supabase--le-qui-fait-vraiment) |

---
---

# C. DATA FLOW & STATE

*(source : `src/context/StoreContext.tsx` — 422 lignes, transcrit intégralement)*

## C.1 Ce que contient le StoreContext

`StoreContextType` (lignes 8-28) expose :

**État (lecture) :**

| Champ | Type | Origine initiale |
|-------|------|------------------|
| `products` | `PerfumeProduct[]` | `siteConfig.products` (constante locale `src/config/site.ts`) |
| `banners` | `EditorialBanner[]` | `siteConfig.editorialBanners` |
| `shippingZones` | `ShippingZone[]` | `siteConfig.shippingZones` |
| `faqs` | `FAQItem[]` | `siteConfig.faqs` |
| `contact` | `SiteConfig['contact']` | `siteConfig.contact` |
| `social` | `SiteConfig['social']` | `siteConfig.social` |
| `heroProduct` | `PerfumeProduct` | dérivé : `products.find(p=>p.isHero) || products[0] || siteConfig.products[0]` (l.383) |
| `selectionDuMoment` | `PerfumeProduct[]` | dérivé : `products.filter(p=>p.isPopular)` ; **si moins de 2 → fallback `products.slice(0,4)`** (l.385) |
| `orders` | `Order[]` | `[]` (jamais seedé) |
| `isLoading` | `boolean` | `true` |

**Actions (écriture) — toutes retourne `Promise<{success: boolean; error?: string}>` :**

| Action | Ligne | Effet state | Effet Supabase |
|--------|-------|-------------|----------------|
| `refreshStore()` | 93-181 | recharge tout | SELECT parallèles (5) + SELECT orders |
| `saveProduct(p)` | 204-227 | upsert optimiste en tête si nouveau | `products.upsert(payload, {onConflict:'id'})` |
| `deleteProduct(id)` | 230-244 | filtre hors liste | `products.delete().eq('id', id)` — **suppression DÉFINITIVE** |
| `setHeroProduct(id)` | 247-255 | `isHero = (p.id===id)` sur tous | **AUCUN** — localStorage seulement |
| `toggleSelectionDuMoment(id)` | 258-281 | via `saveProduct` | idem |
| `saveOrder(o)` | 284-324 | `setOrders([order, ...])` | `orders.upsert(..., {onConflict:'id'})` (erreur = `console.warn` **non propagée**) |
| `updateOrderStatus(id, st, pay?)` | 327-352 | patch + `updated_at` | `orders.update({...}).eq('id',id)` |
| `deleteOrder(id)` | 355-366 | filtre | `orders.delete().eq('id',id)` |
| `updateSettings(contact, social)` | 370-381 | setContact + setSocial | `site_settings.upsert({id:'main', contact, social})` |

`useStore()` (416-422) : lit le contexte, **throw** `useStore must be used within a StoreProvider` si absent.

## C.2 Séquence de synchronisation (`refreshStore`, l.93-181) — l'« offline fallback »

C'est **une stratégie cache-first en deux temps**, à décoder exactement :

**Étape 1 — cache localStorage, appliqué AVANT tout réseau (l.95-111) :**
```ts
const cached = localStorage.getItem('mg_store_cache');
if (cached) { JSON.parse → setProducts/setBanners/setShippingZones/setFaqs/setContact/setSocial
             (chacun gardé seulement si `Array.isArray` ou truthy) }
const cachedOrders = localStorage.getItem('mg_orders_cache');
if (cachedOrders) setOrders(JSON.parse(cachedOrders))
```
→ Si le réseau échoue, **les données du cache restent affichées** : c'est le mode « hors-ligne ».
Enveloppé dans `try { } catch (_) {}` : un cache corrompu (JSON invalide) est **ignoré silencieusement**.

**Étape 2 — 5 SELECT Supabase en `Promise.all` (l.116-128) :**

| Table | `.order()` |
|-------|-----------|
| `products` | `created_at` ASC |
| `editorial_banners` | `display_order` ASC |
| `shipping_zones` | *(aucun)* |
| `faqs` | `display_order` ASC |
| `site_settings` | `.eq('id','main').single()` |

**Règle de fusion CRITIQUE :** chaque résultat n'écrase l'état local **que si `error` est nul ET `length > 0`** (l.135, 140, 155, 159) :
```ts
if (!prodErr && dbProds && dbProds.length > 0) setProducts(mapped)
```
→ **Une table vide en base ne vide PAS l'affichage** : on garde le seed `siteConfig`. Effet de bord notable : *on ne peut pas vider le catalogue depuis l'admin en supprimant toutes les lignes*.

Exception : `site_settings` (l.130-133) applique `contact`/`social` dès que `!settingsErr && dbSettings` (pas de test de longueur — un objet vide serait accepté).

**Étape 3 — orders (l.164-174) :** SELECT `orders` ORDER BY `created_at` DESC dans un **try/catch totalement silencieux** (`catch (_) {}`) — commentaire du code : *« fail silently if table not yet created »*. Le résultat réécrit `mg_orders_cache` seulement s'il n'y a pas d'erreur.

**Étape 4 (l.175-177) :** l'erreur globale est rattrapée avec `console.warn('Supabase fetch error, fallback to defaults:', err)` → l'app **reste fonctionnelle en local-only**.

**Étape 5 (l.180) :** `setIsLoading(false)` — appelé **inconditionnellement** (jamais de blocage).

**Garde global :** `if (supabase && isSupabaseConfigured)` (l.114) — si non configuré, aucune requête n'est faite, l'app tourne 100 % sur `siteConfig` + localStorage.

## C.3 Persistance du cache (effets, l.187-201)

```ts
// déclenché à chaque changement de products|banners|shippingZones|faqs|contact|social
localStorage.setItem('mg_store_cache', JSON.stringify({products, banners, shippingZones, faqs, contact, social}))
localStorage.setItem('mg_orders_cache', JSON.stringify(orders))   // sur chaque changement de orders
```
→ Écriture **synchrone et non debouncée** : chaque frappe dans un formulaire inline peut réécrire le cache entier.

## C.4 Mapping DB ↔ UI (`mapDbProduct` l.43-67 / `formatProductForDb` l.70-90)

Colonne DB → champ UI, avec **valeurs par défaut codées en dur** :

| DB (colonne) | UI (champ) | Défaut si vide |
|---|---|---|
| `id` | `id` | — |
| `name` | `name` | — |
| `brand` | `brand` | `'MG Perfume'` ⚠️ hardcodé |
| `tagline` | `tagline` | `''` |
| `price` | `price` (`Number()`) | — |
| `original_price` | `originalPrice` | `undefined` si falsy |
| `volume` | `volume` | `'100 ml'` ⚠️ |
| `image` | `image` | — |
| `family` | `family` | `'oriental'` ⚠️ |
| `category_label` | `categoryLabel` | `'Eau de Parfum'` ⚠️ |
| `badge` | `badge` | `undefined` |
| `top_notes` / `heart_notes` / `base_notes` | `topNotes` / `heartNotes` / `baseNotes` | `[]` si non-array |
| `description` | `description` | `''` |
| `is_popular` | `isPopular` | `Boolean()` |
| `is_hero` | `isHero` | **`localStorage['mg_hero_product_id']` prime sur `is_hero`** (l.62) ⚠️ |
| `in_stock` | `inStock` | `row.in_stock !== false` |
| `is_archived` | `isArchived` | `Boolean()` |
| `free_delivery` | `freeDelivery` | `Boolean()` |

**Colonnes DB non mappées (lues par `select('*')` mais ignorées) :** `created_at`, `updated_at`.
**Colonnes DB **non écrites** par `formatProductForDb` :** `is_hero` (volontairement), `created_at`, `updated_at`.

**Bannières** (l.141-151) — mapping avec défauts :
```ts
{ id, tag, title, image,
  alt: b.alt || 'Bannière MG Perfume',      // ⚠️ FR
  linkText: b.link_text || 'Découvrir',      // ⚠️ FR
  href: b.href || '/boutique',
  bgColor: b.bg_color || '#171513',         // ⚠️ noir chaud
  objectPosition: b.object_position || 'center' }
```

## C.5 Clés localStorage / sessionStorage — liste EXHAUSTIVE

| Clé | Type | Écrit par | Lu par | Contenu |
|---|---|---|---|---|
| `mg_store_cache` | `localStorage` | `StoreContext` l.190 | `StoreContext` l.96 | `{products, banners, shippingZones, faqs, contact, social}` JSON |
| `mg_orders_cache` | `localStorage` | `StoreContext` l.199, l.172, l.290 | `StoreContext` l.106, l.288 | `Order[]` JSON |
| `mg_hero_product_id` | `localStorage` | `setHeroProduct` l.249 | `mapDbProduct` l.44 | `id` texte du produit « Édition Phare » |
| `mg_admin_auth` | `localStorage` **ET** `sessionStorage` | `checkSession` l.227 ; `handleLogin` l.260-261, 271-272, 283-284 | `checkSession` l.214-215 | la chaîne `'true'` — **flag d'authentification sans aucune vérification** |
| `mg_admin_active_tab` | `localStorage` | `handleTabClick` l.324 ; modale l.1416 | `useEffect` l.117 | un des 8 identifiants d'onglet (`'orders' | 'products' | …`) |

**Récapitulatif : 5 clés localStorage + 1 clé sessionStorage. Aucune autre clé (ni cookie, ni `window.name`) n'est utilisée.**

- Les 3 premières (`mg_store_cache`, `mg_orders_cache`, `mg_hero_product_id`) appartiennent à `StoreContext` → **c'est la couche données**.
- Les 2 dernières (`mg_admin_auth`, `mg_admin_active_tab`) appartiennent **exclusivement à `page.tsx`** → **c'est la couche admin** (voir [A.5.1](#a51-authentification--faille-majeure-à-ne-pas-reproduire-l211-309)).
- `handleLogout` (l.304-308) retire `localStorage.mg_admin_auth` et `localStorage.mg_admin_active_tab` mais **oublie `sessionStorage.mg_admin_auth`** → après déconnexion, un rechargement de page redonne la session.

⚠️ **Toutes les clés sont préfixées `mg_`** (MG Perfume) — à préfixer par tenant (`mgperfume_`/`sl:`) en multi-tenant.

## C.6 Client Supabase (`src/lib/supabase.ts`, 21 lignes)

```ts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  || 'https://xnmolqmcfnjvcblizahu.supabase.co';            // ⚠️ URL projet hardcodée en fallback
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  || 'eyJhbGciOiJIUzI1NiIs...';                              // ⚠️ clé anon hardcodée en fallback
export const isSupabaseConfigured = Boolean(url && key && url.startsWith('https://') && !url.includes('your-project'));
export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null;   // peut être null !
export const supabaseAdmin = (isSupabaseConfigured && process.env.SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(url, serviceRoleKey) : supabase;
```
→ **La clé anon d'un projet public est committée en dur** : à supprimer en multi-tenant (un `tenant_id` + RLS par tenant la remplace).
→ `supabase` peut valoir **`null`** : tous les appels doivent être gardés par `if (supabase)`.
→ `supabaseAdmin` retombe sur la clé anon si `SUPABASE_SERVICE_ROLE_KEY` est absente (⚠️ ne contourne donc pas RLS).

## C.7 Schéma base — `supabase_master_schema.sql` (391 lignes)

7 tables + 1 fonction :

| Table | Colonnes clés | RLS |
|---|---|---|
| `products` | `id TEXT PK`, `name`, `brand DEFAULT 'MG Perfume'`, `tagline`, `price NUMERIC`, `original_price`, `volume DEFAULT '100 ml'`, `image`, `family DEFAULT 'oriental'`, `category_label DEFAULT 'Eau de Parfum'`, `badge`, `top_notes TEXT[]`, `heart_notes TEXT[]`, `base_notes TEXT[]`, `description`, `is_popular`, `is_hero`, `in_stock`, `created_at`, `updated_at` | ON, `SELECT USING(true)` + `ALL USING(true)` |
| `orders` | `id TEXT PK`, `ref_command TEXT UNIQUE`, `customer_*`, `shipping_zone_id/name`, `shipping_cost`, `subtotal`, `total_amount`, `items JSONB`, `payment_method`, `payment_status`, `order_status`, `paytech_token`, `paytech_redirect_url`, `notes`, `created_at`, `updated_at` + **4 index** (`ref`, `phone`, `status`, `created DESC`) | ON : `INSERT` public, `SELECT USING(true)`, `ALL USING(true)` |
| `editorial_banners` | `id TEXT PK`, `tag`, `title`, `image`, `alt DEFAULT 'Bannière MG Perfume'`, `link_text DEFAULT 'Découvrir'`, `href DEFAULT '/boutique'`, `bg_color DEFAULT '#171513'`, `object_position`, `display_order`, `created_at` | ON, public read + all |
| `shipping_zones` | `id TEXT PK`, `name`, `price NUMERIC`, `delay`, `created_at` | idem |
| `faqs` | `id TEXT PK DEFAULT gen_random_uuid()::text`, `q`, `a`, `display_order`, `created_at` | idem |
| `site_backups` | `id TEXT PK`, `backup_name`, `products_data/banners_data/shipping_data/faqs_data/contact_data/social_data JSONB`, `created_at`, `updated_at` | idem |
| `site_settings` | ⚠️ **NON DÉFINIE DANS CE FICHIER** | — |
| `fn exec_sql(query text) RETURNS jsonb` | `SECURITY DEFINER`, `EXECUTE query` — **exécution SQL arbitraire via RPC**, retourne `{success, error?}` | ⚠️ accessible anon si `EXECUTE` accordé |

**Divergences critiques entre le SQL et le code :**

1. ⚠️ **`site_settings` n'est pas dans le master schema** alors que `StoreContext` la lit/écrit (`id='main'`). Elle a été créée à la main.
2. ⚠️ **`products.is_archived` et `products.free_delivery` manquent dans le SQL** (l.7-28 et l.31-45) alors que `mapDbProduct` les lit et que `formatProductForDb` les écrit → **obligerait `ALTER TABLE ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;` et `free_delivery`**.
3. ⚠️ **RLS en `USING(true)` partout** : aucune isolation, aucune notion de rôle admin. Tout client anon peut écrire/supprimer n'importe quelle ligne. **Point de départ obligatoire pour le multi-tenant.**
4. ⚠️ **`fn exec_sql` est un SQL-injection par design exposée au public.**

**Seeds :** 3 shipping zones (`dakar-centre` 2000 « Sous 2h à 4h », `dakar-banlieue` 3000 « Sous 4h à 6h », `interieur-senegal` 4000 « Sous 24h à 48h »), 4 bannières éditoriales, 6 produits parfum, 1 commande démo (`MGP-2026-DEMO`).

---
---

*(sections A, B, D, F en cours d'écriture — lecture séquentielle de page.tsx en cours)*

---

# A. UI SHELL & VISUAL DESIGN LANGUAGE

*(source : `page.tsx` lignes 96–1560 — lecture directe des className)*

## A.1 Palette exacte — « Luxe Dakar » (crème / or / noir chaud)

Toutes les couleurs sont des **hexarbitraires en Tailwind** (`bg-[#...]`), pas des couleurs de thème Tailwind. Aucune classe sémantique (`bg-primary`) : tout est en arbitrary values.

### Fondations

| Rôle | Hex | Classe | Usage |
|---|---|---|---|
| **Fond clair (page)** | `#FAF8F5` | `bg-[#FAF8F5]` | crème chaud, TOUT le body en mode clair + champs de saisie |
| **Surface carte (clair)** | `#FFFFFF` | `bg-white` | cartes, modales, header |
| **Noir principal** | `#171513` | `bg-[#171513]` / `text-[#171513]` | encre du texte ET couleur des boutons primaires (inversion) |
| **Bordure chaude** | `#E8DCC2` | `border-[#E8DCC2]` | TOUTES les bordures de cartes/champs en mode clair |
| **Or principal (accent)** | `#C59B3F` | `bg-[#C59B3F]` / `text-[#C59B3F]` | CTA hover, icônes, focus ring, toast |
| **Or foncé (texte)** | `#967120` | `text-[#967120]` | micro-labels uppercase, valeurs chiffrées |
| **Gris texte secondaire** | `#6B655E` | `text-[#6B655E]` | sous-textes, hints |
| **Gris placeholder / icône** | `#9E968D` | `text-[#9E968D]` / `placeholder-[#9E968D]` | labels de stats, placeholders |
| **Blanc cassé (dark)** | `#F3E5AB` | `text-[#F3E5AB]` | texte d'accent en mode sombre |

### Mode sombre (« dark », toggle dans le header)

| Rôle | Hex | Classe |
|---|---|---|
| Fond page | `#110F0D` | `bg-[#110F0D] text-[#FAF8F5]` |
| Header (sticky) | `#171513` (opacité `/95`) + bordure `border-[#C59B3F]/20` |
| Carte | `#171513` + `border-[#C59B3F]/20` |
| Sous-carte / champ | `#221F1B` + `border-white/10` |
| Texte | `#FAF8F5` |
| Inputs | `bg-[#171513] border-white/10 text-white` |

### Sémantique (status / feedback)

| État | Couleurs |
|---|---|
| **Succès / "new"** | `bg-emerald-500 text-white` (badge drawer), `text-emerald-600` |
| **Warning** | `text-amber-500`, `text-amber-600`, `animate-pulse` (modif non enregistrées) |
| **Danger** | `bg-red-50 text-red-600 border-red-200` (bouton logout), `hover:bg-red-600 hover:text-white`, `text-red-700` (banner erreur), modale « Changer d'onglet » `bg-red-600 text-white` |
| **Neutre / Supabase OK** | `text-[#3ECF8E]` (icône Database du drawer) |

### Variables de thème (l.1146-1150) — à copier telles quelles
```ts
const isDark   = theme === 'dark';
const bgClass    = isDark ? 'bg-[#110F0D] text-[#FAF8F5]' : 'bg-[#FAF8F5] text-[#171513]';
const cardBgClass= isDark ? 'bg-[#171513] border-[#C59B3F]/20' : 'bg-white border-[#E8DCC2] shadow-xs';
const subCardBg = isDark ? 'bg-[#221F1B] border-white/10' : 'bg-[#FAF8F5] border-[#E8DCC2]';
const inputBg   = isDark ? 'bg-[#171513] border-white/10 text-white' : 'bg-white border-[#E8DCC2] text-[#171513]';
```
⚠️ **Quirk** : `cardBgClass` en dark **n'a pas** `shadow-xs` ; en light si. Et le mode sombre n'inverse PAS `#171513`/`#FAF8F5` : `text-[#171513]` est **écrit en dur** dans ~40 endroits (stats, titres de cartes) → **le mode sombre est partiellement cassé/illisible**. À corriger en multi-tenant via des variables CSS (`--ink`).

### A.1bis Census exhaustif des couleurs — **16 hex** utilisés dans tout le fichier

Relevé exact sur les 4112 lignes (`grep -oE '\[[#][0-9A-Fa-f]+\]'`) :

| Hex | Occurrences | Rôle | Palette |
|-----|------------|------|---------|
| `#C59B3F` | **156** | or principal — icônes, hover CTA, spinner, badges actifs, boutons de pourcentage | 🟡 |
| `#171513` | **86** | noir encre — texte principal, fond des boutons primaires, fond onglet actif | ⚫ |
| `#967120` | **69** | or foncé — micro-labels uppercase, prix, valeurs chiffrées, liens | 🟡 |
| `#E8DCC2` | **67** | bordure chaude — cartes, champs, séparateurs | 🟤 |
| `#FAF8F5` | **27** | crème — fond de page, fond des inputs, panneaux | ⬜ |
| `#9E968D` | **21** | gris — placeholders, labels de stats, texte tertiaire | ⚪ |
| `#6B655E` | **18** | gris foncé — sous-textes, légendes | ⚪ |
| `#F3E5AB` | **8** | crème doré — texte d'accent sur fond noir (mode sombre, chips) | 🟡 |
| `#3ECF8E` | **5** | vert Supabase — icône Database, bouton snapshot | 🟢 |
| `#221F1B` | **3** | gris-brun — surfaces du mode sombre | ⚫ |
| `#FBF4E2` | **2** | crème doré très clair — fond du badge produit | 🟤 |
| `#8C8377` | **2** | gris chaud — **hors palette**, utilisé uniquement pour « Slot #N » et l'aide des slots | ⚪ |
| `#34b27b` | **1** | vert Supabase foncé (hover) | 🟢 |
| `#25D366` | **1** | vert WhatsApp (bouton client) — **couleur de marque tierce** | 🟢 |
| `#1EBE5B` | **1** | vert WhatsApp (hover) | 🟢 |
| `#110F0D` | **1** | noir profond — fond de page en mode sombre | ⚫ |

**Ratio clé** : les 4 couleurs-brand-or (`#C59B3F` + `#967120` + `#F3E5AB` + `#FBF4E2`) totalisent **235 occurrences**, soit **~60 % des couleurs du fichier**. Le portail est donc Decisions : crème / noir / or.

Hors arbitrary values, le fichier n'utilise que des couleurs Tailwind **standard** : `emerald` (50/100/200/300/400/600/700/800), `amber` (50/100/200/300/400/600/700/800/900), `rose` (50/100/200/300/700/800/900), `red` (50/100/200/300/500/600/700), `blue` (50/100/200/300/800/900), `sky` (50/300/600/800), `purple` (100/300/900), `gray` (100/200/400/600), `white`, `black` (`black/5`, `black/70`).

---

## A.2 Typographie

| Élément | Classes | Rôle |
|---|---|---|
| `font-luxury` | classe **personnalisée** (définie dans `globals.css`, hors de ce fichier) | Serif/display pour tous les titres de marque : « MG PERFUME DAKAR », « Administration », titre de module, noms |
| `font-sans` | sur le root du dashboard (l.1153) | tout le reste |
| Micro-label | `text-[10px] font-bold uppercase tracking-wider` + couleur or/gris | labels de stats, « Module Actif : » |
| Label de formulaire | `text-[11px] font-bold uppercase tracking-wider text-[#967120]` | labels du formulaire de login |
| Titre module | `font-luxury text-xl sm:text-2xl font-bold` | H1 du header de module |
| Titre login | `font-luxury text-2xl font-bold uppercase tracking-widest` | H1 « ADMINISTRATION » |
| Statistique | `text-xl sm:text-2xl font-extrabold` | chiffres des KPI |
| Corps / texte | `text-xs` (11–12px) quasi partout ; `text-sm`/`text-base` pour la marque du header | **le portal est typographiquement très petit — à conserver** |
| Sous-texte | `text-[10px] text-[#6B655E]` | légendes de cartes |

## A.3 Structure de page (layout)

```jsx
<div className={`min-h-screen ${bgClass} flex flex-col font-sans transition-colors duration-200`}>   // root
  <header className="sticky top-0 z-30 … backdrop-blur-md border-b px-4 sm:px-6 lg:px-8 py-3 …" />  // l.1156
  {isNavDrawerOpen && …}                                                                              // drawer portal, l.1212
  {pendingTabSwitch && …}                                                                             // modale confirm, l.1396
  {saveMessage && …}                                                                                  // toast, l.1430
  <input type="file" ref={bannerFileInputRef} className="hidden" />                                   // l.1438
  <div className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">                     // l.1447 CONTENEUR
    <div className={`… p-5 rounded-3xl border ${cardBgClass}`}>                                       // barre de module, l.1450
    <main className="space-y-6"> … </main>                                                           // l.1513
  </div>
</div>
```

| Élément | Valeur |
|---|---|
| Largeur conteneur | **`max-w-7xl` (1280px)** centré `mx-auto` |
| Padding conteneur | `p-4 sm:p-6 lg:p-8` |
| Gap vertical | `space-y-6` (24px) partout |
| Rayons | cartes **`rounded-2xl`** (16px), barres de module/modales **`rounded-3xl`** (24px), boutons/inputs **`rounded-full`** (pilules), champs de formulaire **`rounded-2xl`**, chips de nav **`rounded-xl`** |
| Header | `sticky top-0 z-30`, `backdrop-blur-md`, `py-3`, `border-b` |
| Drawer | `fixed inset-0 !z-[999999]`, overlay `bg-black/70 backdrop-blur-xs animate-in fade-in duration-200`, panneau `fixed inset-y-0 right-0`, `pl-10`, `w-screen max-w-xs` (320px), `shadow-2xl p-6`, `animate-in slide-in-from-right duration-300` |
| Modale | `fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs`, boîte `max-w-sm rounded-3xl p-6 shadow-2xl` |
| Toast | `fixed bottom-6 right-6 z-50 … rounded-2xl px-5 py-3 shadow-2xl animate-in slide-in-from-bottom-5` |
| Scroll lock | `document.body.style.overflow = 'hidden'` quand le drawer est ouvert (l.196-205) |
| Transitions | thème `transition-colors duration-200` ; drawer 200/300ms |

## A.4 Le LOADING SCREEN (l.1026-1050) — rendu intégral

Condition : `if (isAuthChecking)` → rendu **avant** tout le reste, court-circuite le dashboard.

```jsx
<div className="min-h-screen bg-[#FAF8F5] text-[#171513] flex flex-col justify-center items-center px-4">
  <div className="w-full max-w-sm bg-white border border-[#E8DCC2] rounded-3xl p-8 shadow-lg text-center space-y-4">
    <div className="relative w-16 h-16 mx-auto animate-pulse">
      <Image src="/images/brand/logo.png" alt="MG Perfume Logo" fill className="object-contain" />
    </div>
    <div className="space-y-1">
      <h2 className="font-luxury text-lg font-bold tracking-wider text-[#171513]">
        MG PERFUME DAKAR
      </h2>
      <div className="flex items-center justify-center gap-2 text-xs text-[#967120] font-medium pt-1">
        <Loader2 className="w-4 h-4 animate-spin text-[#C59B3F]" />
        <span>Chargement du tableau de bord...</span>
      </div>
    </div>
  </div>
</div>
```

| Aspect | Valeur exacte |
|---|---|
| **Fond** | crème `#FAF8F5` pleine page, centrage vertical/horizontal (`flex flex-col justify-center items-center`) |
| **Carte** | `max-w-sm` (384px), `bg-white`, bordure or pâle `#E8DCC2`, `rounded-3xl`, `p-8`, `shadow-lg`, `text-center` |
| **Logo** | `/images/brand/logo.png`, boîte `w-16 h-16` (64px), `animate-pulse` (respiration lente), `object-contain`, `relative` + `fill` (Next Image) |
| **Titre** | `font-luxury text-lg font-bold tracking-wider` → **« MG PERFUME DAKAR »** (⚠️ nom complet avec ville) |
| **Ligne de statut** | `flex items-center justify-center gap-2`, `text-xs` `text-[#967120]` `font-medium pt-1` |
| **Spinner** | `Loader2` `w-4 h-4 animate-spin text-[#C59B3F]` |
| **Texte** | `Chargement du tableau de bord...` (3 points ASCII, pas d'ellipse typographique) |
| **Thème** | ⚠️ **toujours en mode clair**, même si le thème dark est mémorisé — le loading n'est pas theme-aware |

**Durée** : `isAuthChecking` est mis à `false` dans le `finally` du `checkSession` (l.233-235) — donc quasi immédiate, mais **bloque le rendu si `supabase.auth.getSession()` hang**.

## A.5 Le LOGIN SCREEN (l.1055-1143)

Condition : `if (!isAuthenticated)`.

- Même fond crème ; carte `max-w-md` (448px), `rounded-3xl`, `p-8 sm:p-10`, `shadow-xl`, `relative overflow-hidden`.
- **Filet doré en haut** : `absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C59B3F] to-transparent`.
- Logo `w-16 h-16` (sans pulse), `alt="MG Perfume Logo"`.
- H1 `font-luxury text-2xl font-bold uppercase tracking-widest` → **« ADMINISTRATION »** (en capitales).
- Sous-titre `text-xs text-[#6B655E]` → **« MG Perfume — Accès sécurisé »** (tiret cadratin).
- 2 champs (`Identifiant` — icône `Mail` ; `Mot de Passe` — icône `KeyRound`), placeholder `Votre identifiant` / `••••••••••••` (12 bullet).
- Classe input (référence pour **tous** les inputs du portal) :
  `w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#E8DCC2] text-[#171513] placeholder-[#9E968D] text-xs focus:outline-none focus:border-[#C59B3F] focus:bg-white transition-all`
  → icône `absolute left-4 top-1/2 -translate-y-1/2 text-[#9E968D] w-4 h-4` ; `autoFocus` sur l'identifiant.
- Erreur : `p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2` + `AlertCircle w-4 h-4 flex-shrink-0`.
- Bouton submit (référence CTA primaire) :
  `w-full py-3.5 rounded-full bg-[#171513] hover:bg-[#C59B3F] text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2` + `Lock w-4 h-4` → **« Accéder au Dashboard »**.
- Lien retour : `ArrowLeft w-3.5 h-3.5` + « Retourner sur la boutique » → `<Link href="/">`.

### A.5.1 Authentification — FAILLE MAJEURE À NE PAS REPRODUIRE (l.211-309)

```ts
const localAuth    = localStorage.getItem('mg_admin_auth');
const sessionAuth  = sessionStorage.getItem('mg_admin_auth');
if (localAuth === 'true' || sessionAuth === 'true') { setIsAuthenticated(true); return; }  // ← AUCUNE vérification serveur
```
- **Bypass total** : écrire `localStorage.mg_admin_auth = 'true'` dans la console ouvre le dashboard. Le flag est persisté **indéfiniment** (aucune expiration).
- **Fallback mot de passe en clair dans le bundle client** (l.268 & l.280) :
  ```ts
  if (cleanLogin === 'admin' && cleanPass === 'MG@D4k4r-Parfum!2026') { /* connexion directe */ }
  ```
  → identifiant + mot de passe **committés dans le JS client**. À supprimer impérativement en multi-tenant.
- Alias : `const emailToAuth = cleanLogin === 'admin' ? 'admin@mgperfume.store' : cleanLogin;` (l.249).
- Ordre réel : (1) alias + `signInWithPassword` ; (2) si échec ET identifiant=`admin` ET mot de passe = secret → connexion ; (3) sinon erreur.
- `supabase === null` (non configuré) → **seul le mot de passe en clair permet d'entrer**.
- `handleLogout` (298-309) : `supabase.auth.signOut().catch(()=>{})`, puis `localStorage.removeItem` de `mg_admin_auth` **et** `mg_admin_active_tab` (mais **`sessionStorage.mg_admin_auth` n'est PAS retiré** → ⚠️ après déconnexion puis rechargement, l'utilisateur reste connecté via sessionStorage).
- Affiché dans le drawer : `Connecté : {adminEmail || 'admin@mgperfume.store'}`.

## A.6 HEADER / BRANDING (l.1156-1209)

| Zone | Contenu & style |
|---|---|
| Logo | `/images/brand/logo.png`, `w-8 h-8` (32px), `relative` + `fill object-contain`, `alt="MG Perfume"` |
| Titre | `font-luxury text-sm sm:text-base font-bold uppercase tracking-wider` → **« MG Perfume »** |
| Pastille | `px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#C59B3F]/20 text-[#967120] border border-[#C59B3F]/40 uppercase` → **« Admin »** |
| Badge unsaved | `flex items-center gap-1 text-[10px] font-bold text-amber-600 animate-pulse` + `AlertTriangle w-3 h-3` + « Modifications non enregistrées » (`hidden sm:inline` pour le texte) |
| Toggle thème | `p-2 rounded-full border` + `title="Basculer en mode clair/sombre"`, icône `Sun w-4 h-4 text-amber-400` (dark) / `Moon w-4 h-4` (light) |
| « Voir le site » | `<Link href="/" target="_blank">` `hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold` + `Eye w-3.5 h-3.5 text-[#C59B3F]` |
| « Onglets & Modules » | bouton `px-3.5 py-1.5 rounded-full bg-[#171513] hover:bg-[#C59B3F] text-white text-xs font-bold shadow-xs` + `Menu w-4 h-4 text-[#C59B3F]`, texte `hidden sm:inline` |

⚠️ **Le nom du site est hardcodé en 3 endroits minimum** : header (`MG Perfume`), drawer (`MG Perfume` + `Menu Admin`), login (`MG Perfume — Accès sécurisé`), loading (`MG PERFUME DAKAR`), footer drawer (`admin@mgperfume.store`). **Aucun `siteConfig.name` n'est utilisé dans le shell** → à rendre dynamique (`siteConfig.name` + `.city`) en multi-tenant.

## A.7 La navigation à 8 onglets — DÉCLARATION ET RENDU

### A.7.1 Déclaration (l.110)
```ts
const [activeTab, setActiveTab] = useState<
  'orders'|'products'|'promotions'|'banners'|'shipping'|'faq'|'supabase'|'settings'
>('orders');
```
**Pas de tableau de config** : c'est un **union type + 8 `<button>` écrits à la main dans le drawer** (l.1248-1372). Chaque bouton est un bloc quasi identique (aucun `.map()`). C'est la duplication principale à refactorer.

### A.7.2 Persistance de l'onglet (l.114-122, 318-326)
- Au montage : `localStorage.getItem('mg_admin_active_tab')`, validé contre le **tableau littéral inline** `['orders','products','promotions','banners','shipping','faq','supabase','settings']` (⚠️ dupliqué en dur).
- Au clic : `handleTabClick(tab)` → ferme le drawer, écrit `mg_admin_active_tab`.
- Si `hasUnsavedChanges` et onglet différent → `setPendingTabSwitch(tab)` (ouvre la modale de confirmation, [A.8](#a8-modale--modifications-non-enregistrées)).

### A.7.3 Le drawer (portail de navigation)
| Onglet | Icône | Libellé (avec compteurs) | Sujet |
|---|---|---|---|
| `orders` | `ShoppingBag` w-4 h-4 `text-[#C59B3F]` | **`Commandes ({orders.length})`** | → badge `px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white animate-pulse` affichant `{nb new} new` si `order_status==='new'` (sinon `ChevronRight w-3.5 h-3.5 opacity-60`) |
| `products` | `Package` | **`Catalogue Parfums ({products.length})`** | chevron |
| `promotions` | `Percent` | **`Promos & Badges`** | chevron |
| `banners` | `ImageIcon` | **`Bannières Shooting ({banners.length})`** | chevron |
| `shipping` | `Truck` | **`Frais de Livraison`** | chevron |
| `faq` | `HelpCircle` | **`Foire Aux Questions`** | chevron |
| `supabase` | `Database` **`text-[#3ECF8E]`** (⚠️ seule icône verte) | **`Supabase Cloud`** | chevron |
| `settings` | `Settings` | **`Contact & Réseaux`** | chevron |

**Structure du bouton** (classe commune) :
```jsx
className={`w-full flex items-center justify-between py-3 px-3.5 rounded-xl text-xs font-bold tracking-wide transition-colors ${
  activeTab === 'orders'
    ? 'bg-[#171513] text-white shadow-xs font-bold'
    : 'hover:bg-black/5'
}`}
```
- **Actif** : fond noir `#171513`, texte blanc, `shadow-xs` (⚠️ `font-bold` dupliqué).
- **Inactif** : transparent, `hover:bg-black/5`.
- **Toutes les icônes sont dorées** même inactives (pas de changement de couleur sur l'état actif) → l'actif se distingue uniquement par le fond noir.
- Zone : `<nav className="py-6 space-y-2">` (10px de gap).

**Header du drawer** (l.1223-1244) : logo 32px + `font-luxury text-sm font-bold uppercase tracking-wider` « MG Perfume » + `text-[8px] tracking-widest text-[#967120] uppercase font-semibold` « Menu Admin », séparateur `pb-5 border-b border-[#E8DCC2]`, bouton fermer `p-1.5 rounded-full border border-[#E8DCC2] text-[#6B655E] hover:text-[#171513]` + `X w-5 h-5`.

**Footer du drawer** (l.1376-1388) : `pt-6 border-t border-[#E8DCC2] space-y-3 text-xs`
- Bouton déconnexion : `w-full py-3 rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 font-bold transition-all flex items-center justify-center gap-2` + `LogOut w-4 h-4` → « Se Déconnecter »
- `p.text-[10px] text-center opacity-60` → `Connecté : …`

⚠️ **Quirk majeur** : la bordure du drawer est `border-[#E8DCC2]` **écrite en dur**, donc invisible/cassé en mode sombre (`border-l border-[#E8DCC2]`).

### A.7.4 Barre de module (l.1450-1510) — la « navigation secondaire »
```jsx
<div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl border ${cardBgClass}`}>
  <div>
    <div className="flex items-center gap-2 text-xs font-bold text-[#967120] uppercase tracking-wider">
      <span>Module Actif :</span><span className="capitalize">{activeTab}</span>   // ← affiche l'ID TECHNIQUE ('faq', 'supabase')
    </div>
    <h1 className="font-luxury text-xl sm:text-2xl font-bold mt-0.5"> … </h1>
  </div>
  <div className="flex items-center gap-2 self-stretch sm:self-auto"> …actions contextuelles… </div>
</div>
```
Titres H1 par onglet (mapping 1:1, l.1457-1464) :

| onglet | Titre affiché |
|---|---|
| `orders` | Commandes & Ventes (PayTech / WhatsApp) |
| `products` | Catalogue des Parfums Orientaux |
| `promotions` | Promotions & Badges |
| `banners` | Bannières de Shooting & Visuels |
| `shipping` | Frais & Délais de Livraison |
| `faq` | Questions Fréquentes |
| `supabase` | Synchronisation Supabase Cloud |
| `settings` | Coordonnées & Réseaux Sociaux |

⚠️ 3 de ces 8 titres sont **hardcodés MG Perfume / PayTech / Orientaux** (orders, products, shipping→générique, supabase).

**Actions contextuelles** (à droite de la barre, `self-stretch sm:self-auto`) :
- onglet `products` : segmented control vue `LayoutGrid` / `List` + bouton `Nouveau Parfum`
- onglet `banners` : bouton `Ajouter une Bannière (Max 6)`
- ⚠️ **aucune action pour `promotions`, `shipping`, `faq`, `supabase`, `settings`** (les actions sont dans le corps de l'onglet)

**Segmented control vue (l.1471-1488)** — primitive à réutiliser :
```jsx
<div className={`flex items-center p-1 rounded-full border ${subCardBg}`}>
  <button className={`p-1.5 rounded-full transition-colors ${productsViewMode==='cards' ? 'bg-[#C59B3F] text-[#171513]' : 'opacity-60'}`} title="Vue Grille"><LayoutGrid className="w-3.5 h-3.5"/></button>
  <button className={`p-1.5 rounded-full transition-colors ${productsViewMode==='list'  ? 'bg-[#C59B3F] text-[#171513]' : 'opacity-60'}`} title="Vue Liste"><List className="w-3.5 h-3.5"/></button>
</div>
```

**Bouton primaire « Nouveau Parfum » (référence pour tous les CTA d'ajout)** :
```jsx
className="px-4 py-2 rounded-full bg-[#171513] hover:bg-[#C59B3F] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm"
```
→ icône `Plus w-4 h-4 text-[#C59B3F]` ⚠️ **l'icône reste dorée au survol → elle devient invisible sur le fond doré**.
Bannière : `Ajouter une Bannière (Max 6)` (même classe).

## A.8 Modale « Modifications non enregistrées » (l.1396-1427)

- Overlay : `fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs`
- Boîte : `p-6 rounded-3xl border max-w-sm w-full space-y-4 shadow-2xl ${cardBgClass}`
- Titre : `flex items-center gap-3 text-amber-600 font-bold text-sm` + `AlertTriangle w-5 h-5` → « Modifications non enregistrées »
- Corps : `text-xs opacity-75` → « Vous avez des modifications en cours. Voulez-vous continuer sans enregistrer ? »
- Pied : `flex items-center justify-end gap-2 pt-2`
  - `Annuler` → `px-4 py-2 rounded-full border text-xs font-bold` (**⚠️ sans couleur de bordure : hérite de la bordure par défaut du navigateur**)
  - `Changer d'onglet` → `px-4 py-2 rounded-full bg-red-600 text-white text-xs font-bold`
- Effet : bascule l'onglet, écrit `mg_admin_active_tab`, `setHasUnsavedChanges(false)`.
- ⚠️ Zéro bouton « Enregistrer » — on ne peut que discarding.

## A.9 Toast de succès (l.1430-1435) — primitive unique

```jsx
{saveMessage && (
  <div className="fixed bottom-6 right-6 z-50 bg-[#C59B3F] text-[#171513] px-5 py-3 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5">
    <Check className="w-4 h-4" /><span>{saveMessage}</span>
  </div>
)}
```
- **Fond OR, texte NOIR** — signature visuelle distinctive.
- `showFeedback(msg)` (l.311-315) : `setSaveMessage(msg)` + **`setHasUnsavedChanges(false)` (⚠️ effet de bord : n'importe quel toast valide des modifs non sauvegardées)** + `setTimeout(..., 3000)`.
- ⚠️ **Quirk** : aucun `clearTimeout` → des toasts successifs peuvent s'annuler mutuellement ou laisser `saveMessage` vide/null avant 3s.
- ⚠️ **Toutes les erreurs utilisent `window.alert()` / `window.confirm()` natifs** (pas de toast d'erreur) — incohérence assumée : `alert('Erreur : ' + res.error)`, `alert(res.error)`, `alert('Erreur lors de l’enregistrement : ' + result.error)`.

## A.10 Inventaire des primitives UI à reproduire

| Primitive | Classes de référence | Où |
|---|---|---|
| **Bouton primaire** | `px-4 py-2 rounded-full bg-[#171513] hover:bg-[#C59B3F] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm` | Nouveau Parfum, Ajouter Bannière, sauvegarder formulaires |
| **Bouton secondaire** | `px-3 py-1.5 rounded-full border text-xs font-semibold` + bg `bg-[#FAF8F5]` + `border-[#E8DCC2]` | « Voir le site », Annuler |
| **Bouton danger** | `bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200` | Se Déconnecter, supprimer |
| **Bouton icône ghost** | `p-1.5 rounded-full border border-[#E8DCC2] text-[#6B655E] hover:text-[#171513]` | fermer drawer, éditer, supprimer ligne |
| **Input texte** | `w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#E8DCC2] text-[#171513] placeholder-[#9E968D] text-xs focus:outline-none focus:border-[#C59B3F] focus:bg-white transition-all` | login, modale produit |
| **Carte** | `p-4 sm:p-5 rounded-2xl border ${cardBgClass} space-y-1` | stats, panneaux |
| **Sous-carte** | `p-4 rounded-2xl border ${subCardBg}` | formulaires |
| **Badge pastille** | `px-2 py-0.5 rounded-full text-[9px] font-bold … uppercase` (variante or `bg-[#C59B3F]/20 text-[#967120] border border-[#C59B3F]/40`) | « Admin », statuts |
| **Toast** | voir [A.9](#a9-toast-de-succès-l1430-1435--primitive-unique) | feedback |
| **Modale** | voir [A.8](#a8-modale--modifications-non-enregistrées-l1396-1427) | confirmations |
| **Drawer** | voir [A.7.3](#a73-le-drawer-portail-de-navigation) | navigation |
| **Segmented** | voir [A.7.4](#a74-bare-de-module-l1450-1510--la--navigation-secondaire-) | vue produits, sous-onglets |
| **Vide (empty state)** | à voir dans les onglets | — |
| **Table** | à voir (onglet orders) | — |
| **Toggle** | à voir (utilisé pour isPopular / hero) | — |
| **Select** | à voir (filtres) | — |
| **Chiffres KPI** | `text-[10px] font-bold uppercase tracking-wider text-[#9E968D]` (label) + `text-xl sm:text-2xl font-extrabold` (valeur) + `text-[10px] text-[#6B655E]` (légende) | bandeau orders |

---

# B. FEATURES PER TAB — EXHAUSTIF

## B.0 Vue d'ensemble

| # | Onglet (`activeTab`) | Sous-onglets | Blocs fonctionnels |
|---|---|---|---|
| 1 | `orders` | — | 4 KPI, recherche, 2 filtres, liste de cartes, changer statut, WhatsApp, supprimer |
| 2 | `products` | `active` / `archived` | archive, recherche, 4 filtres + tri, bulk, 2 vues (cartes/table), pagination 12, modale produit |
| 3 | `promotions` | `featured` / `discounts` / `badges` | Édition Phare (1 slot), Sélection du Moment (2–4), remises individuelles + par lot, bibliothèque de badges |
| 4 | `banners` | — | max 6, édition inline tag/titre/CTA/lien/cadrage, upload photo, enregistrer |
| 5 | `shipping` | — | édition inline délai + prix FCFA, enregistrer |
| 6 | `faq` | — | ajout/suppression/édition q+a, enregistrer |
| 7 | `supabase` | — | statut connexion, copie SQL, snapshots cloud (créer/lister/restaurer/supprimer), export/import JSON local |
| 8 | `settings` | — | 7 champs contact+social, enregistrer |

**Modale globale hors onglets** : « Ajouter / Modifier un Parfum » (l.3859-4108), ouverte depuis `products`, `promotions/discounts` et `promotions/badges`.

---

## B.1 Onglet ORDERS — `activeTab === 'orders'` (l.1518-1840)

### B.1.1 Bandeau KPI (4 cartes, `grid-cols-2 sm:grid-cols-4`)

| Carte | Label (uppercase 10px) | Valeur | Sous-titre | Icône |
|---|---|---|---|---|
| 1 | `Total Commandes` | `orders.length` | « Toutes méthodes confondues » | `ShoppingBag text-[#C59B3F]` |
| 2 | `Chiffre d'Affaires` | `Σ Number(o.total_amount)` `.toLocaleString('fr-FR')` + `<span class="text-xs font-bold text-[#171513]">FCFA</span>` | « Valeur totale cumulée » | `Sparkles text-[#C59B3F]` |
| 3 | `À Traiter` | `orders.filter(o => o.order_status==='new' \|\| 'processing').length` en `text-amber-600` | « Nouvelles ou en préparation » | `Clock text-amber-500` |
| 4 | `Paiements PayTech` | `orders.filter(o => o.payment_method==='paytech').length` en `text-emerald-700` | « Wave • OM • Free • Carte » | `CreditCard text-emerald-600` |

Classe : `p-4 sm:p-5 rounded-2xl border ${cardBgClass} space-y-1` ; valeur `text-xl sm:text-2xl font-extrabold`.

⚠️ **Bug de calcul** : le CA cumule **toutes** les commandes, y compris annulées et non payées (aucun filtre `order_status`/`payment_status`).

### B.1.2 Recherche (l.1573-1590)
- Input : `placeholder="Rechercher par référence (#MGP-...), nom du client, ou téléphone..."`
- Icône `Search w-4 h-4 opacity-50 absolute left-4 top-1/2 -translate-y-1/2`
- Classe : `w-full pl-11 pr-4 py-2.5 rounded-2xl border text-xs focus:outline-none focus:border-[#C59B3F] ${inputBg}`
- Bouton effacer `X w-4 h-4` : `absolute right-3.5 top-1/2 -translate-y-1/2 text-xs opacity-50 hover:opacity-100` (affiché si non vide)
- **Champs cherchés** : `ref_command`, `customer_name`, `customer_phone`, **`customer_address`** (le placeholder ne le mentionne pas), tous en `.toLowerCase().includes()`, joined par `||`.

### B.1.3 Deux filtres (`grid-cols-1 sm:grid-cols-2 gap-2 pt-1`)

**Select « Statut de la commande »** (`orderStatusFilter`, défaut `'all'`) :
| value | libellé |
|---|---|
| `all` | Tous les statuts de livraison |
| `new` | Nouvelle commande |
| `processing` | En préparation |
| `shipped` | En cours de livraison |
| `delivered` | Livrée avec succès |
| `cancelled` | Annulée |

**Select « Méthode & Paiement »** (`orderPaymentFilter`, défaut `'all'`) — ⚠️ **surchargé : 2 dimensions dans un seul contrôle** :
| value | libellé | filtre appliqué |
|---|---|---|
| `all` | Tous les modes de règlement | — |
| `paytech` | PayTech (Paiement en ligne) | `o.payment_method === 'paytech'` |
| `whatsapp` | WhatsApp (Paiement à la livraison) | `o.payment_method === 'whatsapp'` |
| `paid` | Payé | `o.payment_status === 'paid'` |
| `pending` | En attente de paiement | `o.payment_status === 'pending'` |

→ **`cod` (paiement à la livraison via COD) et `failed`/`refunded` ne sont pas filtrables.** L'absence de `cod` est un bug : une commande COD disparaît dès qu'on filtre autre chose que `all` sur la méthode.

Classe select : `w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-[#C59B3F] ${inputBg}` ; label `text-[10px] font-bold text-[#967120] uppercase tracking-wider block mb-1`.

### B.1.4 Liste des commandes (l.1662-1836)
Rendu via **IIFE** `(() => { const filteredOrders = ...; ... })()` — pas de variable d'état.

**Carte commande** : `p-5 rounded-3xl border space-y-4 transition-all hover:border-[#C59B3F]/60 ${cardBgClass}`

**En-tête** (`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E8DCC2]/60`) :
- `#{order.ref_command}` en `font-mono text-sm font-extrabold text-[#171513]`
- Date : `{created_at ? new Date(created_at).toLocaleDateString('fr-FR', {day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : 'Récent'}` en `text-[11px] text-[#9E968D]`
- **Badge paiement** : si `payment_method==='paytech'` → `Payé (PayTech)` (`bg-emerald-50 text-emerald-800 border-emerald-300`) sinon `PayTech (En attente)` (`bg-amber-50 text-amber-800 border-amber-300`) ; sinon badge `MessageCircle text-sky-600` + « Paiement à la livraison » (`bg-sky-50 text-sky-800 border-sky-300`). Classe commune : `px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1`
- **Badge statut** : classe `px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border`

| `order_status` | libellé | couleurs |
|---|---|---|
| `new` | Nouvelle | `bg-amber-100 text-amber-900 border-amber-300` |
| `processing` | En préparation | `bg-blue-100 text-blue-900 border-blue-300` |
| `shipped` | En livraison | `bg-purple-100 text-purple-900 border-purple-300` |
| `delivered` | Livrée | `bg-emerald-100 text-emerald-900 border-emerald-300` |
| `cancelled` | Annulée | `bg-red-100 text-red-900 border-red-300` |

**Bloc client / livraison** (`grid-cols-1 sm:grid-cols-2 gap-3 text-xs`) :
- `User text-[#C59B3F]` + `customer_name` (gras)
- `Phone text-[#C59B3F]` + `<a href={\`tel:${customer_phone}\`} class="hover:underline font-semibold text-[#171513]">` + `customer_phone`
- `MapPin text-[#C59B3F] flex-shrink-0` + `customer_address`
- Colonne droite (`sm:text-right`) : `Zone : {shipping_zone_name}` (`text-[11px] text-[#9E968D]`) ; `Total : {total_amount} FCFA` (`text-sm font-extrabold text-[#967120]`) ; `(Sous-total : {subtotal} + Port : {shipping_cost} FCFA)` (`text-[11px] text-[#6B655E]`)

**Articles** (`order.items?.length > 0`) — panneau `p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8DCC2]/60 space-y-2` :
- Titre `Articles ({Σ quantity}) :` en `text-[10px] font-bold text-[#967120] uppercase tracking-wider`
- `grid-cols-1 sm:grid-cols-2 gap-2`, par item : vignette `relative w-8 h-8 rounded-lg bg-white border border-[#E8DCC2] flex-shrink-0 p-0.5` + `<Image fill object-contain>`, `name` gras + `x{quantity}` en `text-[#9E968D]`, ligne droite `{(price*quantity).toLocaleString('fr-FR')} F` (`ml-auto font-bold text-[#967120] text-[11px]`)
- ⚠️ `<Image src={item.image}>` **sans garde** → une image vide/invalide casse le rendu (pas de fallback, pas de `onError`).

**Actions** (`flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E8DCC2]/60`) :
1. **Select « Changer statut : »** — label `text-[11px] font-bold text-[#6B655E]` ; options `Nouvelle / En préparation / En livraison / Livrée / Annulée` ; classe `text-xs px-2.5 py-1.5 rounded-xl border font-bold ${inputBg}`.
   Handler : `updateOrderStatus(order.id, newStatus)` puis **`showFeedback(\`Statut mis à jour : ${newStatus}\`)` — affiche la valeur technique anglaise ('processing'), pas le libellé français, et n'attend pas le résultat** → un échec DB affiche quand même un succès.
2. **Bouton « WhatsApp Client »** (`<a target="_blank" rel="noopener noreferrer">`) :
   ```
   href = `https://wa.me/${(customer_phone||'').replace(/[^0-9]/g,'')}?text=${encodeURIComponent(
     `Bonjour ${customer_name}, c'est MG Perfume Dakar concernant votre commande #${ref_command} !`)}`
   ```
   classe : `px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5B] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs`
   ⚠️ **Texte hardcodé « MG Perfume Dakar »** ; apostrophe droite `'` (pas typographique) contrairement au reste du fichier.
3. **Bouton supprimer** : `confirm('Voulez-vous vraiment supprimer la commande #${ref_command} ?')` → `deleteOrder(order.id)` + `showFeedback('Commande supprimée')` (**pas de `await`, pas de test d'erreur**). Classe `p-1.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-600 hover:text-white border border-red-200 transition-colors`.

### B.1.5 Empty state (l.1650-1660)
```
p-10 rounded-3xl border text-center space-y-3 ${cardBgClass}
ShoppingBag w-10 h-10 text-[#C59B3F]/40 mx-auto
h3 font-luxury text-base font-bold  → "Aucune commande trouvée"
p text-xs text-[#6B655E] max-w-sm mx-auto →
  "Aucune commande ne correspond à vos filtres actuels. Dès qu'un client commande
   via PayTech ou WhatsApp, elle apparaîtra ici."
```
⚠️ Même rendu « aucune commande trouvée » pour « aucune donnée » et « aucun résultat de filtre ».

### B.1.6 Destructives de l'onglet orders
| Op | Confirmation | Résultat |
|---|---|---|
| Changer statut | ❌ **aucune** | `updateOrderStatus` → UPDATE + toast optimiste |
| Supprimer commande | ✅ `confirm()` natif | `deleteOrder` → DELETE (⚠️ pas d'await) |

---

## B.2 Onglet PRODUCTS — `activeTab === 'products'` (l.1845-2471)

### B.2.1 Sous-navigation ACTIF / ARCHIVÉS (l.1849-1881)
Conteneur : `flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#E8DCC2]/80`

| Bouton | Icône | Libellé + compteur | Actif | Inactif |
|---|---|---|---|---|
| 1 | `Package w-4 h-4 text-[#C59B3F]` | `Catalogue Actif ({products.filter(p=>!p.isArchived).length})` | `bg-[#171513] text-white shadow-xs` | `${subCardBg} text-[#6B655E] hover:border-[#C59B3F]` |
| 2 | `Archive w-4 h-4 text-amber-500` | `Produits Archivés / Masqués ({products.filter(p=>p.isArchived).length})` | idem | idem |

Classe commune : `px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2`.
À droite, aide contextuelle `text-xs text-[#9E968D]` : « Ces produits sont visibles sur la boutique publique » / « Ces produits sont masqués pour vos clients ».

**Mécanique d'archivage (exacte) :**
- `handleToggleArchive(product)` → `{...product, isArchived: !product.isArchived}` → `saveProduct(updated)` → persiste `is_archived`.
- **Aucun `confirm()` sur l'archivage unitaire** (seule la suppression en a un).
- Toast : `"X" archivé et masqué de la boutique !` / `"X" restauré dans le catalogue actif !`
- En **vues cartes** : badge `bg-amber-100 text-amber-800 border border-amber-300` « Archivé / Masqué » et carte entière en `opacity-85`.
- En **vue liste** : colonne Statut = badge `Archivé` (amber) / `Actif` (emerald-50).
- Bouton dedicated : archivé → `ArchiveRestore` + « Restaurer » en `bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-700` ; actif → `Archive` + « Archiver » en `bg-amber-50 text-amber-900 hover:bg-amber-100 border-amber-200` ; commun `py-1.5 px-2.5 rounded-xl font-bold text-xs … border flex-1 transition-colors`.
- Bulk : `Archiver / Masquer` (amber) dans l'onglet actif, `Restaurer Actif` (emerald + `ArchiveRestore`) dans l'onglet archivé.
- ⚠️ **Le filtre archive est appliqué AVANT la recherche** dans `filteredProducts` (l.976-977).
- ⚠️ **Le compteur du drawer `Catalogue Parfums (N)` inclut les archivés** (pas de filtre).

### B.2.2 Recherche + 4 filtres + tri (l.1884-2002)
Carte : `p-4 rounded-3xl border space-y-3 ${cardBgClass}`

**Recherche** `productSearch` — placeholder : **« Rechercher par nom, maison (Lattafa, Afnan...), ou description... »** ⚠️ **les maisons réelles sont citées en dur dans le placeholder** alors que le filtre réel porte sur `name`, `brand`, `tagline` (**jamais `description`**) → placeholder faux.

**Select 1 — Famille Olfactive** (`filterFamily`, `'all'`) : `Toutes les familles` / `oriental`→Oriental / `boise`→Boisé / `gourmand`→Gourmand / `floral`→Floral / `aquatique`→Aquatique / Frais — classe ajoute `capitalize`.

**Select 2 — Maison / Marque** (`filterBrand`) : `Toutes les maisons` + `uniqueBrands` = `Array.from(new Set(products.map(p => p.brand || 'MG Perfume').filter(Boolean)))` ⚠️ défaut `'MG Perfume'` codé en dur.

**Select 3 — Statut & Stock** (`filterStatus`) — combinaisons :

| value | libellé | test (l.993-998) |
|---|---|---|
| `all` | Tous les états | — |
| `in_stock` | En Stock | garde les `p.inStock !== false` |
| `out_of_stock` | ⚠️ Rupture de Stock | `p.inStock === false` |
| `free_delivery` | 🚚 Livraison Gratuite | `p.freeDelivery` truthy |
| `promo` | En promotion (Prix barré) | `p.originalPrice` truthy |
| `badge` | Avec Badge | `p.badge` truthy |
| `popular` | Sélection du Moment | `p.isPopular` |

**Select 4 — Trier par** (`sortBy`, `'default'`) : `Ordre par défaut` / `price-asc` Prix : Croissant / `price-desc` Prix : Décroissant / `name-asc` Nom : A à Z / `name-desc` Nom : Z à A. Sort implémenté par `.sort()` inline (⚠️ `sortBy='default'` renvoie `0` → **l'ordre des objets est celui du tableau source**, pas restauré : `.sort()` est stable en JS moderne, mais si un tri a déjà été appliqué puis remis à 'default', l'ordre reste celui du tri précédent → **bug de tri**).

**Pied de filtres** (`flex items-center justify-between pt-2 border-t border-[#E8DCC2]/60 text-[11px]`) :
- `Affichage de <strong class="text-[#967120]">{filteredProducts.length}</strong> parfum(s) {archivé(s)|actif(s)}`
- Bouton `Réinitialiser les filtres` (`text-[#967120] hover:underline font-bold`) affiché **seulement si** au moins un filtre est actif ; remet family/brand/status/sort/search à 'all'/'default'/''.

### B.2.3 Barre d'actions groupées (l.2005-2089)
Conteneur : `p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${subCardBg}`
- **« Tout cocher sur la page (N sélectionné{s}) »** : bascule tout cocher/décocher **sur la page courante seulement** (`paginatedAdminProducts.map(p=>p.id)`). Icônes `CheckSquare w-4 h-4 text-[#C59B3F]` (coché) / `Square w-4 h-4 text-[#9E968D]`. Classe `flex items-center gap-1.5 text-xs font-bold text-[#171513] hover:text-[#967120]`.
- Si sélection > 0 : `div.animate-in fade-in duration-200` avec label `Actions groupées :` (`text-[11px] font-bold text-[#967120] mr-1`) et 6 boutons. **Tous `disabled={isBulkApplying}`.**

| Action | Icône | Libellé | Couleurs | Confirm |
|---|---|---|---|---|
| `archive` | `Archive` | Archiver / Masquer | `bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300` | ❌ |
| `unarchive` | `ArchiveRestore` | Restaurer Actif | `bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300` | ❌ |
| `out_of_stock` | `Box` | Marquer Rupture | `bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300` | ❌ |
| `in_stock` | `Check` | En Stock | `bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200` | ❌ |
| `free_delivery_on` | `Truck` | Livraison Gratuite | `bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200` | ❌ |
| `delete` | `Trash2` | *(icône seule)* | `px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200` | ✅ `confirm()` |

**Moteur bulk** `handleBulkAction` (l.505-542) :
- garde : 0 sélectionné → `alert('Veuillez sélectionner au moins un parfum.')`
- boucle **`for…of` avec `await` séquentiel** → **N requêtes HTTP en série** (pas de batch, pas de RPC)
- compte les succès, vide la sélection, toast `Action groupée exécutée avec succès sur {count} parfum(s) !`
- ⚠️ Le toast annonce le succès même si `count === 0` (toutes les requêtes ont échoué silencieusement : `if (res.success) count++` sans sinon).

### B.2.4 Vue CARTES (l.2092-2271) — `productsViewMode === 'cards'`
Grille : `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`

**Carte** : `relative rounded-2xl p-4 border flex flex-col justify-between space-y-4 transition-all` + sélection → `border-[#C59B3F] ring-2 ring-[#C59B3F]/30`, sinon `hover:border-[#C59B3F]/60` + `${cardBgClass}` + `opacity-85` si archivé.

| Zone | Contenu / style |
|---|---|
| Case à cocher | `CheckSquare text-[#C59B3F]` / `Square text-[#9E968D]` + `text-[10px] text-[#9E968D]` « Sélectionner » |
| Pastilles état | `Archivé / Masqué` (amber), `Rupture` (rose-100), `Truck + Gratuit` (emerald-100) — `px-2 py-0.5 rounded-full text-[9px] font-bold border` |
| Vignette | `relative w-full h-44 bg-white rounded-xl overflow-hidden p-2 flex items-center justify-center border border-[#E8DCC2]` ; image interne `relative w-28 h-36 object-contain` ⚠️ **`bg-white` hardcodé → cassé en thème sombre** |
| Badges produit (superposés) | `absolute top-2 left-2 flex flex-wrap gap-1 z-10 max-w-[85%] pointer-events-none` ; `isHero` → `bg-[#C59B3F] text-[#171513] border-[#967120]` « ★ Édition Phare » ; `isPopular` → `bg-[#171513] text-[#F3E5AB] border-[#C59B3F]/40` « Sélection » ; `badge` → `bg-[#FBF4E2] text-[#967120] border-[#E8DCC2]` `{badge}` |
| Titre | `text-[10px] font-bold text-[#967120] uppercase tracking-wider` → `{brand} • {volume}` ; `h3 font-luxury text-base font-bold leading-tight` → `{name}` ; `p text-xs opacity-70 line-clamp-1` → `{tagline}` |
| Prix | `text-sm font-extrabold` `{price} FCFA` ; prix barré `text-[10px] text-red-500 line-through` |
| **Toggles rapides** (`grid-cols-2 gap-1.5`) | **Stock** : rose (`En Rupture`) / emerald (`En Stock`), icône `Box w-3 h-3`, classe `py-1.5 px-2 rounded-xl font-bold … border transition-colors` → `handleToggleInStock`. **Livraison** : blue-100 `Livraison Gratuite` / `bg-white border-[#E8DCC2] text-[#6B655E]` `Livraison Payante`, icône `Truck text-[#C59B3F]` → `handleToggleFreeDelivery` |
| **Boutons** (`flex items-center gap-1.5 pt-1`) | `Archiver`/`Restaurer` (flex-1), `Modifier` (`${subCardBg} hover:bg-[#171513] hover:text-white`, icône `Edit3`), `Supprimer` (`p-1.5 rounded-xl bg-red-50 hover:bg-red-600 border border-red-200 text-red-500 hover:text-white`, icône `Trash2`, `aria-label="Supprimer"`) |

### B.2.5 Vue LISTE (l.2274-2399) — `<table className="w-full text-left text-xs">`
Wrapper `rounded-3xl border overflow-hidden ${cardBgClass}` + `overflow-x-auto` ; `thead` = `${subCardBg} border-b` ; `tbody` = `divide-y divide-[#E8DCC2]/60` ; ligne survolée `hover:bg-black/5`, ligne sélectionnée `bg-amber-50/50`.

**8 colonnes** (toutes `p-3.5`) :
| # | Colonne | Contenu |
|---|---|---|
| 1 | (w-10) | `<input type="checkbox">` **natif** (⚠️ pas stylé — le seul checkbox natif du fichier) |
| 2 | `Parfum` | vignette `relative w-9 h-9 bg-white rounded-lg p-0.5 border` + `Image fill object-contain`, `name` en gras (`block`), `volume` `text-[10px] opacity-60` |
| 3 | `Maison` | `product.brand` en `opacity-80` |
| 4 | `Stock` | **bouton-tuile** `px-2 py-0.5 rounded-full text-[10px] font-bold border` — `Rupture` rose / `En Stock` emerald → toggle |
| 5 | `Livraison` | **bouton-tuile** — `Gratuite` blue / `Standard` `bg-gray-100 text-gray-600 border-gray-200` → toggle |
| 6 | `Prix Actuel` | `font-bold text-[#967120]` → `{price} FCFA` (⚠️ **pas de prix barré en vue liste**) |
| 7 | `Statut` | badge `Archivé` / `Actif` |
| 8 | `Actions` (`text-right space-x-1.5`) | 3 boutons icônes `p-1.5 rounded-lg border` : Archive/ArchiveRestore (amber/emerald), `Edit3` (`hover:bg-[#171513] hover:text-white`), `Trash2` (`border-red-300 text-red-500 hover:bg-red-600 hover:text-white`) |

⚠️ **La vue liste n'expose ni le badge produit, ni la sélection/popularité, ni les remises rapides, ni le prix barré, ni l'image en base64 (upload)** — l'édition complète passe obligatoirement par la modale.

### B.2.6 Pagination (l.2402-2468)
- `adminProductsPerPage = 12` (constante non configurable)
- `totalAdminProductPages = Math.ceil(filteredProducts.length / 12) || 1` ; bloc rendu **seulement si > 1**
- `paginatedAdminProducts = filteredProducts.slice((page-1)*12, page*12)`
- **Reset automatique** (l.1018-1021) sur changement de `productSearch`, `filterFamily`, `filterBrand`, `filterStatus`, `sortBy`, `productArchiveTab` → `setAdminProductPage(1)` **+ `setSelectedAdminProductIds([])`** (la sélection est effacée à chaque frappe dans la recherche)
- ⚠️ **Les IDs sélectionnés au-delà de la page courante sont purgés au changement de page ?** Non — `setSelectedAdminProductIds` n'est pas appelé par les boutons de page → la sélection peut porter sur des produits invisibles, et « Tout cocher » compare à `paginatedAdminProducts.length` → incohérences de compteur.
- Contrôles (`flex flex-wrap items-center justify-center gap-3 pt-6 border-t border-[#E8DCC2]/60`) :
  - ◀ `p-2 rounded-full border border-[#E8DCC2] bg-white … disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#C59B3F]` + `ChevronLeft w-4 h-4`
  - Select « Page » : options `"{p} / {total}"`, classe `text-xs font-bold px-3 py-1.5 rounded-xl border border-[#E8DCC2] bg-white …`
  - **Pastilles numérotées** : `flex items-center gap-1 overflow-x-auto max-w-xs py-1`, chaque `w-7 h-7 rounded-lg text-xs font-bold` ; actif `bg-[#171513] text-[#F3E5AB]`, sinon `bg-white text-[#6B655E] border border-[#E8DCC2] hover:border-[#C59B3F]`
  - ▶ `ChevronRight w-4 h-4`
  - ⚠️ Chaque changement de page appelle `window.scrollTo({top:0, behavior:'smooth'})` — **le scroll remonte en haut de la page, pas de la grille produits**.

### B.2.7 Modale produit — voir [B.9](#b9-modale-produit--ajouter--modifier-l3859-4108)

### B.2.8 Destructives de l'onglet products
| Op | Confirm | Persistance |
|---|---|---|
| Supprimer 1 produit | ✅ `confirm('Voulez-vous vraiment supprimer ce parfum du catalogue ?')` | `DELETE` définitif (⚠️ **les commandes passées gardent la ligne `items` JSONB mais la FK produit disparaît**) |
| Supprimer en bulk | ✅ `confirm('Voulez-vous vraiment supprimer définitivement N parfum(s) ?')` | N `DELETE` séquentiels |
| Archiver / Restaurer | ❌ | `is_archived` (⚠️ colonne absente du master SQL) |
| Toggle stock / livraison | ❌ | `in_stock` / `free_delivery` |

---

## B.3 Onglet PROMOTIONS — `activeTab === 'promotions'` (l.2476-3180)

`promoSubTab : 'featured' | 'discounts' | 'badges'` — défaut `'featured'`. **Aucune persistance de ce sous-onglet** (perdu au reload).

### B.3.0 En-tête du module (l.2480-2542)
- H2 `font-luxury text-xl font-bold` + `Percent w-5 h-5 text-[#C59B3F]` → **« Studio Promotions & Badges Marketing »**
- `p.text-xs opacity-75 mt-0.5` → « Contrôlez les remises en pourcentage, prix barrés, badges d'attractivité et mises en avant sur l'accueil. »
- **2 compteurs** (`flex flex-wrap gap-2 text-xs`) :
  - `px-3 py-1 rounded-full font-bold bg-[#FAF8F5] border border-[#E8DCC2] text-[#967120] flex items-center gap-1.5` + `Percent w-3.5 h-3.5` → `{products.filter(p=>p.originalPrice).length} en Promotion`
  - même classe mais `text-[#171513]` + `Tag w-3.5 h-3.5 text-[#C59B3F]` → `{products.filter(p=>p.badge).length} avec Badge`
- **Sous-onglets** (`flex flex-wrap gap-2 pt-2 border-t border-[#E8DCC2]/60`), classe `px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2`, actif `bg-[#171513] text-white shadow-xs`, inactif `bg-[#FAF8F5] border border-[#E8DCC2] text-[#171513] hover:border-[#C59B3F]` :

| id | Icône | Libellé |
|---|---|---|
| `featured` | `Award w-4 h-4 text-[#C59B3F]` | **Mises en Avant (Accueil)** |
| `discounts` | `Percent w-4 h-4 text-emerald-600` | **Prix Barrés & Remises Rapides** |
| `badges` | `Tag w-4 h-4 text-[#C59B3F]` | **Bibliothèque de Badges** |

### B.3.1 SOUS-ONGLET `featured` — Mises en avant

#### (a) ÉDITION PHARE — 1 slot unique (l.2549-2639)
- Pastille `1 Slot Unique` : `px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#C59B3F] text-[#171513]`
- H3 `font-luxury text-lg font-bold` + `Award w-5 h-5 text-[#C59B3F]` → **« Édition Phare (Hero Accueil) »**
- `p.text-xs opacity-75 mt-1` → « Le parfum roi affiché en grand format dans la section principale de la page d'accueil. »
- À droite : `Actuel : <strong class="text-[#171513]">{heroProduct.name}</strong> ({heroProduct.brand})`
- **Carte aperçu** (`p-4 rounded-2xl border flex flex-col sm:flex-row items-center gap-4 ${subCardBg}`) : vignette `w-20 h-24 bg-white rounded-xl p-2 border` ; `Édition Phare Actuelle • {volume}` (`text-[10px] uppercase tracking-wider text-[#967120]`) ; `{name}` `font-luxury text-base font-bold` ; `{tagline || categoryLabel}` ; `{price} FCFA` `text-sm font-extrabold text-[#967120]`
- **Sélecteur** : label « Cliquez pour désigner un autre parfum comme Édition Phare : » + champ recherche `heroSearch` (`w-full sm:w-64`, `pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#E8DCC2] bg-white`), puis grille `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1`.
- Chaque bouton : `p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all` ; **sélectionné** → `border-[#C59B3F] bg-[#FAF8F5] shadow-xs ring-2 ring-[#C59B3F]` ; non-sélectionné → `hover:border-[#C59B3F]/50 bg-white`. Contenu : vignette `w-10 h-10` + `name` (`font-bold text-xs truncate`) + `{brand} • {price} FCFA` (`text-[10px] opacity-60 truncate`) + **radio** `w-5 h-5 rounded-full border flex items-center justify-center` (coché `bg-[#C59B3F] border-[#C59B3F]` + `Check w-3.5 h-3.5 text-white stroke-[3]` ; non coché `border-[#9E968D]`).
- Filtre : `!heroSearch || name.includes(heroSearch) || brand?.includes(heroSearch)` — **inclut les produits archivés** (⚠️).
- Handler `handleSelectHero` → `setHeroProduct(id)` → toast « Édition Phare mise à jour avec succès ! ».
- ⚠️ **PERSISTENCE UNIQUEMENT DANS localStorage (`mg_hero_product_id`)** — pas de colonne DB écrite, pas de partage multi-navigateur/multi-appareil. Un autre appareil ne voit pas le même hero.

#### (b) SÉLECTION DU MOMENT — 2 à 4 (l.2641-2760)
- Pastille de compteur `{selectionDuMoment.length} / 4 Slots Occupés` avec 3 états :
  - `>= 4` → `bg-amber-100 text-amber-800 font-extrabold border border-amber-300`
  - `< 2` → `bg-red-100 text-red-700`
  - sinon → `bg-[#171513] text-[#F3E5AB]`
- H3 + `Sparkles w-5 h-5 text-[#C59B3F]` → **« Sélection du Moment (Grille Accueil) »**
- `p.text-xs opacity-75 mt-1` → « Présentez 2 à 4 parfums en vedette sur l'accueil. Vous pouvez ajouter ou retirer des parfums librement. »
- Si `< 2` : alerte `text-xs font-bold text-red-600 flex items-center gap-1.5 animate-pulse` + `AlertTriangle w-4 h-4` → « Minimum 2 parfums requis »
- **Slots actifs** (`bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8DCC2]/80`) : titre `Slots Actifs ({n}/4) :` ; aide `text-[10px] text-[#8C8377] font-normal` « Cliquez sur X pour libérer un slot » ⚠️ **couleur `#8C8377` utilisée ici et ici-seulement (hors palette)** ; chaque slot `bg-white p-3 rounded-xl border border-[#C59B3F] … shadow-xs`, vignette `w-9 h-9`, `Slot #{idx+1}` en `text-[9px] text-[#8C8377]` ; bouton X `p-1.5 rounded-full hover:bg-red-50 text-red-500 hover:text-red-700`.
- **Recherche** `promoSearch` : placeholder « Rechercher un parfum dans le catalogue à ajouter... », classe `w-full text-xs pl-10 pr-4 py-2.5 rounded-2xl border`.
- **Picker** `max-h-[380px] overflow-y-auto pr-2 …` ; filtre `!p.isArchived` (**exclut les archivés**, contrairement au hero) ; bouton d'action à 3 états :
  - sélectionné → `bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200` → libellé **« Retirer »**
  - limite atteinte (`selectionDuMoment.length >= 4 && !isSelected`) → `bg-amber-50 text-amber-700 border border-amber-200` → **« Remplacer »** ⚠️ **libellé trompeur : le clic toggle normalement, il ne remplace rien et l'action échoue avec une alerte**
  - sinon → `border border-[#E8DCC2] hover:bg-[#C59B3F] hover:text-white` → **« Ajouter »**
  - sous le nom : `★ En vedette` (`text-[9px] font-bold text-[#967120] uppercase`)
- **Règles métier (dans `StoreContext.toggleSelectionDuMoment`, l.258-281)** :
  - minimum 2 → refus avec message : *« Minimum 2 parfums requis dans la "Sélection du Moment". Veuillez en ajouter un autre avant de retirer celui-ci. »*
  - maximum 4 → refus : *« Limite de 4 parfums atteinte pour la "Sélection du Moment". Veuillez en désélectionner un pour faire de la place. »*
  - ces messages arrivent via **`alert(res.error)`** (popup native), pas le toast.
  - ⚠️ **Le compteur `selectionDuMoment` vient de `StoreContext` (l.385) : si `isPopular` < 2, il **retourne `products.slice(0,4)`** → l'UI affiche 4 slots alors qu'aucun n'est coché en base → **le compteur est mensonger dans le cas dégradé**.

### B.3.2 SOUS-ONGLET `discounts` — Prix barrés & remises rapides (l.2767-3002)

**(a) Barre « Actions Promotionnelles par Lot (Multi-Sélection) »** — `p-5 rounded-3xl border space-y-4 bg-gradient-to-br from-[#FAF8F5] to-white border-[#E8DCC2]`
⚠️ **seul dégradé du fichier** (`bg-gradient-to-br from-[#FAF8F5] to-white`) — à noter car AGENTS.md interdit les dégradés génériques ; celui-ci est sobre et fait partie du langage.
- H3 `font-luxury text-base font-bold text-[#171513]` + `Zap w-4 h-4 text-[#C59B3F]` ; `p.text-xs text-[#6B655E]`
- **Bouton tout sélectionner** : bascule `selectedPromoProductIds` sur **`products` ENTIER (tous onglets, y compris archivés)** ⚠️ ≠ sélection du catalogue filtré ; libellé bascule entre `Tout sélectionner` et `Tout désélectionner` ; classe `px-3 py-1.5 rounded-xl border border-[#E8DCC2] bg-white text-xs font-semibold hover:border-[#C59B3F]`
- Compteur `text-xs font-bold text-[#967120] bg-[#FAF8F5] px-2.5 py-1 rounded-xl border border-[#E8DCC2]` → `{n} sélectionné(s)`
- **Presets de remise** `[10, 15, 20, 25, 30]` : pills `px-2.5 py-1 rounded-lg text-xs font-bold transition-all`, actif `bg-[#171513] text-[#F3E5AB]`, sinon `bg-white border border-[#E8DCC2] hover:border-[#C59B3F]`, libellé `-{pct}%`
- **Saisie libre** : `<input type="number" min=1 max=90>` `w-16 px-2 py-1 rounded-xl border text-xs text-center font-bold` + `%`
  - ⚠️ **l'attribut HTML `max=90` contredit la validation JS `bulkDiscountPercent >= 100` → des remises de 91–99 % passent.**
  - ⚠️ un champ vide → `Number('') === 0` → toast d'erreur.
- **Bouton appliquer** `px-4 py-1.5 rounded-xl bg-[#C59B3F] hover:bg-[#967120] text-white font-bold text-xs … shadow-xs` (`Loader2 animate-spin` pendant) → `handleBulkApplyDiscount`
- **Bouton réinitialiser** `px-3 py-1.5 rounded-xl bg-white hover:bg-red-50 border border-red-200 text-red-600 text-xs font-bold … disabled:opacity-40` + `RotateCcw` → `handleBulkClearDiscounts`

**Algorithme de remise (identique en unitaire et en bulk)** :
```ts
const basePrice = product.originalPrice || product.price;          // toujours le prix NON remisé
const discounted = Math.round(basePrice * (100 - pct) / 100 / 1000) * 1000;  // arrondi au millier de FCFA
{ ...product, originalPrice: basePrice, price: discounted, badge: product.badge || `-${pct}%` }
```
Exemples : 25 000 → -10 % = 22 500 ; -15 % = 21 000 (22 500 → arrondi à 21 000) ; -20 % = 20 000 ; -30 % = 17 500.
35 000 → -15 % = 29 750 → **arrondi à 30 000** (au-dessus du prix exact) ⚠️.
→ **Les remises ne se cumulent pas** (chaque application repart du `originalPrice`), mais le badge n'est posé que s'il n'y en a déjà pas (`product.badge || ...`) → enchaîner -10 % puis -20 % laisse le badge « -10 % » ⚠️ **incohérence badge/prix**.

**Retrait de remise** `handleRemoveDiscount` : `{price: originalPrice || price, originalPrice: undefined, badge: badge.startsWith('-') ? undefined : badge}` — donc **seuls les badges commençant par `-` sont effacés** (Bestseller, Coup de Cœur survivent).
→ aucun `confirm()`.

**(b) Barre de recherche** `promoSearch` — placeholder « Rechercher un parfum par nom ou marque pour appliquer une remise... »

**(c) Grille de cartes produits** `max-h-[500px] overflow-y-auto pr-2 border-t border-[#E8DCC2]/40 pt-3` + `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4` ; filtre `!p.isArchived` + recherche `name`/`brand`.

Carte `p-4 rounded-3xl border space-y-3` ; sélectionnée → `border-[#C59B3F] ring-2 ring-[#C59B3F]/40 bg-[#FAF8F5]`, sinon `${cardBgClass}`.
| Élément | Détail |
|---|---|
| Checkbox | `<input type="checkbox" className="w-4 h-4 rounded text-[#C59B3F] focus:ring-[#C59B3F] cursor-pointer">` (ici stylé, contrairement au tableau) |
| Vignette | `relative w-12 h-12 bg-white rounded-xl p-1 border` + `Image fill object-contain` |
| Nom/maison | `h4.font-luxury font-bold text-xs truncate` ; `text-[10px] text-[#967120] font-bold uppercase` |
| Pastille remise | calculée `discountPct = round((original-price)/original*100)` → `bg-red-100 text-red-700 border-red-300` `-{n}%` ; sinon `Prix Standard` (`bg-[#FAF8F5] text-[#9E968D] border border-[#E8DCC2]`, `text-[9px]`) |
| Bloc prix | `p-2.5 rounded-xl bg-black/5 flex items-center justify-between` — `Prix Boutique` (`text-[9px] opacity-60 uppercase font-bold block`) + `text-sm font-extrabold` ; `Prix Barré` (`text-[9px] text-red-600 uppercase font-bold block`) + `line-through text-red-500` |
| **Presets unitaires** | `grid grid-cols-4 gap-1` avec `[10, 15, 20, 30]` → `py-1 rounded-lg border border-[#E8DCC2] bg-white hover:bg-[#171513] hover:text-white text-[10px] font-bold` (⚠️ 25 % présent en bulk mais **absent** en unitaire) |
| Actions | `Annuler remise` (`RotateCcw w-3 h-3`, `text-[10px] font-bold text-red-600 hover:underline`, visible seulement si remise) ; `Éditer prix exact` (`Edit3 w-3 h-3`, `ml-auto text-[10px] font-bold text-[#967120] hover:underline`) → ouvre la modale produit |

⚠️ `hasDiscount` est calculé `originalPrice && originalPrice > price` ; si une promo est appliquée deux fois de suite avec un même badge, l'affichage reste cohérent mais le prix baisse à chaque clic.

### B.3.3 SOUS-ONGLET `badges` — Bibliothèque (l.3007-3177)

**(a) Palette de badges recommandés** — `p-5 rounded-3xl border space-y-4 bg-gradient-to-br from-[#FAF8F5] to-white border-[#E8DCC2]`
- H3 + `Tag w-4 h-4 text-[#C59B3F]` → **« Bibliothèque de Badges Marketing Recommandés »**
- `p.text-xs text-[#6B655E] mt-0.5` → « Sélectionnez des parfums ci-dessous puis cliquez sur un badge prédéfini pour l'attribuer instantanément. »
- **11 presets** (⚠️ **100 % hardcodés, orientés parfum/marketing local**) :
  `Bestseller`, `Coup de Cœur`, `Nouveauté`, `Édition Limitée`, `Tendance`, `Offre Spéciale`, `Cadeau Idéal`, `Exclusivité Dakar`, `-15% Flash`, `-20% Promo`, `-30% VIP`
  Style : `px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white border border-[#E8DCC2] hover:border-[#C59B3F] hover:bg-[#FAF8F5] text-[#967120] transition-all disabled:opacity-40 shadow-xs flex items-center gap-1` + `Plus w-3 h-3`.
  → Chaque clic applique le badge à **toute la sélection** (`handleBulkApplyBadge`), `disabled` si 0 sélectionné.
- **Bouton « Retirer les badges »** : `bg-red-50 border border-red-200 text-red-600 hover:bg-red-100` + `Trash2` → `handleBulkApplyBadge(undefined)`
- **Badge personnalisé** : label « Ou créer un badge personnalisé : » ; input placeholder **`ex: Sélection Tabaski, Coffret Luxe...`** ⚠️ exemple très(localisé (Tabaski = fête sénégalaise) ; `{n} sélectionné(s) sélectionné(s)` en libellé ; bouton `px-4 py-1.5 rounded-xl bg-[#171513] text-[#F3E5AB] hover:bg-[#C59B3F] hover:text-white` dont le libellé est **« Appliquer aux {n} sélectionné(s) »** (⚠️ texte dynamique dans un bouton noir à texte or : peu lisible en dark).
- État initial de l'input : `bulkCustomBadge = 'Offre Spéciale'` (⚠️ **valeur par défaut déjà remplie**).

**(b) Recherche** `promoSearch` — placeholder « Rechercher un parfum par nom ou marque pour attribuer un badge... »

**(c) Matrice produits** — mêmes conteneurs que `discounts` ; `!p.isArchived` + recherche `name`/`brand` ; **la sélection multi est ici la même variable `selectedPromoProductIds` que dans l'onglet discounts** (⚠️ les deux sous-onglets partagent l'état, pas de reset au changement de sous-onglet).
Carte :
- Checkbox + vignette `w-12 h-12` + nom/maison
- Pastille badge : si présent `px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FBF4E2] text-[#967120] border border-[#E8DCC2] shadow-xs` ; sinon `text-[10px] opacity-40 italic` « Aucun badge »
- **Sélecteur rapide 1-clic** : label `Changer le badge rapidement :` (`text-[9px] font-bold text-[#967120] uppercase`) ; 4 chips `['Bestseller','Coup de Cœur','Nouveauté','Tendance']` → `px-2 py-0.5 rounded-lg text-[9px] font-bold transition-all` ; actif `bg-[#171513] text-[#F3E5AB] border border-[#C59B3F]` et libellé préfixé `✓ ` (→ re-clic = **retirer** ce badge) ; inactif `bg-white border border-[#E8DCC2] hover:border-[#C59B3F] text-[#171513]`
- Bouton `Effacer` si badge présent : `px-2 py-0.5 rounded-lg text-[9px] font-bold text-red-600 bg-red-50 hover:bg-red-100`
- ⚠️ La bibliothèque complète (11 presets) n'est accessible **que par le toolbar** ; la carte n'en propose que 4.

### B.3.4 Synthèse promotions — champs écrits

| Action | Champs modifiés | Persistance |
|---|---|---|
| `handleSelectHero` | `localStorage.mg_hero_product_id` ; `isHero` en mémoire (jamais en DB) | localStorage |
| `handleTogglePopular` | `is_popular` (→ `saveProduct`) | Supabase |
| `handleApplyQuickDiscount` | `original_price`, `price`, `badge` | Supabase |
| `handleRemoveDiscount` | `price`, `original_price=null`, `badge` (si `-…%`) | Supabase |
| `handleBulkApplyDiscount` | idem × N | Supabase (N upserts) |
| `handleBulkClearDiscounts` | idem × N | Supabase |
| `handleSetProductBadge` | `badge` | Supabase |
| `handleBulkApplyBadge` | `badge` × N | Supabase |

---

## B.4 Onglet BANNERS — `activeTab === 'banners'` (l.3185-3362)

### ⚠️⚠️ BUG CRITIQUE : l'onglet est en grande partie INOPÉRANT

**Le rendu itère sur `banners` (contexte, immuable pendant la saisie) alors que toutes les écritures vont dans `localBanners`.**

```jsx
3200: {banners.length === 0 ? ( … ) : (
3212:   <div className="grid …">
3213:     {banners.map((banner, index) => (      // ← LISTE LUE DEPUIS LE CONTEXTE
3215:       value={banner.tag}                  // ← INPUT CONTRÔLÉ
3238:       onChange={… setLocalBanners(…) }     // ← ÉCRITURE VERS localBanners
```
Conséquences :
1. **Tous les champs inline (`tag`, `title`, `linkText`, `href`, `objectPosition`) sont figés** — l'input est contrôlé par une valeur qui ne change jamais ; la saisie est immédiatement écrasée visuellement.
2. **Le bouton supprimer ne fait rien à l'écran** (`handleDeleteBanner` filtre `localBanners`, la liste est rendue depuis `banners`).
3. **Le bouton « Uploader » de photo ne montre rien** (il écrit `image` en base64 dans `localBanners`).
4. **L'ajout d'une bannière** (`handleAddBanner` → `setLocalBanners([...prev, new])`) **n'apparaît pas** dans la grille.
5. **Seul le bouton « Enregistrer les bannières » produit un effet** — et il enregistre `localBanners`, qui n'a donc jamais été modifié par l'utilisateur → il ré-enregistre l'état existant.
6. La **limite de 6** fonctionne (contrôlée sur `localBanners.length`) mais l'utilisateur ne voit jamais la 6ᵉ.
→ **À corriger en liant lecture ET écriture à `localBanners`.** (Le même pattern est correctement appliqué dans `shipping`, `faq` et `settings`.)

### B.4.1 Ce que le module est censé faire

**Titre** : H2 `font-luxury text-xl font-bold` + `ImageIcon w-5 h-5 text-[#C59B3F]` → « Bannières Éditoriales de Shooting » ; `p.text-xs opacity-75` → « Gérez les visuels, titres, tags, liens et cadrages photos (Position de l'image). »

**Limite** : `handleAddBanner` refuse au-delà de **6** → `alert('Limite maximale de 6 bannières atteinte.')`
Nouvel objet créé :
```ts
{ id: `banner-${Date.now()}`, tag: 'Nouvelle Collection', title: 'TITRE DE LA BANNIÈRE',
  image: '/images/shooting/naimez-que-moi-model.jpg',   // ⚠️ image MG hardcodée
  alt: 'Nouvelle bannière shooting', linkText: 'Découvrir', href: '/boutique',
  bgColor: '#171513', objectPosition: 'center' }
```

**Empty state** : `p-8 text-center rounded-2xl border border-dashed border-[#E8DCC2] space-y-3` + `ImageIcon w-8 h-8 text-[#9E968D] mx-auto` + « Aucune bannière de shooting configurée. La page d'accueil s'adapte automatiquement sans bannière. » + bouton `Ajouter une bannière` (`px-4 py-2 rounded-full bg-[#171513] text-white text-xs font-bold`).

**Grille** `grid-cols-1 sm:grid-cols-2 gap-4`, carte `p-4 rounded-2xl border space-y-3 ${subCardBg}` :

| Élément | Détail |
|---|---|
| Aperçu | `relative w-full h-48 rounded-xl overflow-hidden border` + `<Image fill className="object-cover" style={{objectPosition: banner.objectPosition \|\| 'center'}} />` |
| Supprimer | superposé `absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700` + `Trash2` → `confirm('Voulez-vous supprimer cette bannière de shooting ?')` |
| `Tag Supérieur` | input texte |
| `Titre Principal` | input texte |
| `Texte Bouton` + `Lien Cible` | 2 inputs dans `grid-cols-2` |
| `Cadrage / Position` | `<select>` : `center`→Centré (Center), `top`→Haut (Top), `bottom`→Bas (Bottom), `left`→Gauche (Left), `right`→Droite (Right) |
| `Changer la Photo` | bouton `w-full py-1.5 px-3 rounded-xl bg-[#171513] text-white hover:bg-[#C59B3F]` + `Upload w-3.5 h-3.5` → `bannerFileInputRef.current?.click()` ; fichier → `FileReader.readAsDataURL` → `image` en **base64** stocké en base ⚠️ (voir B.4.2) |

Classe input : `w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:border-[#C59B3F] ${inputBg}` ; label `text-[10px] text-[#967120] uppercase font-bold`.

### B.4.2 Enregistrement des bannières (l.3333-3358)
Bouton `px-5 py-2.5 rounded-full bg-[#171513] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#C59B3F] flex items-center gap-2` + `Save w-4 h-4` → « Enregistrer les bannières »

```ts
const formatted = localBanners.map((b, i) => ({
  id, tag, title, image,
  alt: b.alt || 'Bannière MG Perfume',       // ⚠️ FR hardcodé
  link_text: b.linkText || 'Découvrir',      // ⚠️ FR
  href: b.href || '/boutique',
  bg_color: b.bgColor || '#171513',
  object_position: b.objectPosition || 'center',
  display_order: i,                          // ✅ l'ordre du tableau EST persisté
}));
await supabase.from('editorial_banners').upsert(formatted, { onConflict: 'id' });
await refreshStore();
showFeedback('Bannières shooting enregistrées');
```
⚠️ **Pas de DELETE** → une bannière supprimée dans l'UI **revient** après `refreshStore()` (qui réapplique `dbBanners` si `length > 0`).
⚠️ **`bg_color` n'est pas éditable** dans l'UI (champ `bgColor` existant mais non exposé).
⚠️ **Upload base64** : l'image est stockée en data-URL dans la colonne `TEXT` — functional mais **bloque le `select('*')` de toutes les autres pages** (payload énorme, aucune compression, aucun upload vers un bucket).

---

## B.5 Onglet SHIPPING — `activeTab === 'shipping'` (l.3367-3432)

**Titre** : `Truck w-5 h-5 text-[#C59B3F]` + « Zones & Frais de Livraison » ; sous-titre ⚠️ **hardcodé au geography MG** : « Ajustez les tarifs et délais pour Dakar Centre, banlieues et régions. »

**Liste** `localShipping.map` — `space-y-3`, ligne `p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${subCardBg}` :
- `zone.name` en `font-bold text-sm` — ⚠️ **NON ÉDITABLE** (aucun input sur le nom)
- `Délai :` (`text-[10px] opacity-70`) + input `px-2 py-1 text-xs rounded-lg border …` → `delay`
- `Prix (FCFA) :` (`text-xs opacity-70`) + input `type="number"`, classe `px-3 py-1.5 text-xs rounded-xl border font-bold … w-28 text-right` → `Number(e.target.value)`

**Pied** : `pt-4 border-t border-[#E8DCC2] flex justify-end` + bouton `px-5 py-2.5 rounded-full bg-[#171513] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#C59B3F]` + `Save` → « Enregistrer les tarifs »
```ts
if (supabase) await supabase.from('shipping_zones').upsert(localShipping, { onConflict: 'id' });
await refreshStore();
showFeedback('Frais de livraison mis à jour');
```

### Capacités ABSENTES (à savoir pour la refonte)
- ❌ **Pas d'ajout de zone** ❌ **Pas de suppression de zone** ❌ **Pas de renommage de zone** ❌ **Pas de réordonnancement**
- ❌ **Aucun message d'erreur** : le `await` n'est pas try/caught ; une erreur réseau est **silencieuse** (le toast « Frais de livraison mis à jour » s'affiche quand même).
- ⚠️ `localShipping` est écrit avec la forme `{id,name,price,delay}` qui correspond **exactement** aux colonnes → `upsert` direct sans mapping.
- ⚠️ `upsert` sans DELETE → une zone supprimée hors-UI reviendrait, mais il n'y a pas de suppression dans l'UI.
- La réorganisation (ajout/suppression) est donc **impossible depuis l'admin** : c'est une opération manuelle SQL.

---

## B.6 Onglet FAQ — `activeTab === 'faq'` (l.3437-3522)

**Titre** : `HelpCircle w-5 h-5 text-[#C59B3F]` + « Foire Aux Questions (FAQ) » ; `p.text-xs opacity-75 mt-0.5` « Modifiez ou ajoutez des questions fréquentes pour vos clients. »

**Bouton ajout** : `self-start sm:self-auto shrink-0 px-3.5 py-2 rounded-full bg-[#171513] hover:bg-[#C59B3F] text-white text-xs font-bold transition-colors flex items-center gap-1.5` + `Plus w-3.5 h-3.5 text-[#C59B3F]` → **« Ajouter une question »**
```ts
setLocalFaqs(prev => [...prev, { q: 'Nouvelle Question ?', a: 'Réponse détaillée ici...' }]);
```
⚠️ Le `key` React est `index` → après suppression d'une FAQ, les valeurs des champs peuvent se décaler visuellement.

**Éditeur** (`space-y-4`), carte `p-4 rounded-2xl border space-y-2 relative ${subCardBg}` :
- input question `font-bold` + bouton `p-1.5 text-red-500 hover:text-red-400` + `Trash2 w-4 h-4` (**aucune confirmation**) → `setLocalFaqs(prev => prev.filter((_,i)=>i!==index))`
- `<textarea rows={2}>` pour la réponse, même classe que les inputs
- classe : `w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:border-[#C59B3F] ${inputBg}`

**Enregistrement** (l.3502-3519) :
```ts
const formatted = localFaqs.map((f, i) => ({ id: `faq-${i}`, q: f.q, a: f.a, display_order: i }));
await supabase.from('faqs').upsert(formatted, { onConflict: 'id' });
await refreshStore();
showFeedback('FAQ enregistrée avec succès');
```
⚠️⚠️ **Les identifiants sont régénérés à chaque sauvegarde à partir de l'index.** Conséquences :
1. Insérer une FAQ en tête renumérote **toutes** les lignes ; les anciennes (`faq-2`, `faq-3`…) ne sont pas supprimées → **accumulation de lignes orphelines** en base.
2. `StoreContext` ne conserve que `{q,a}` (les `id` sont jetés au SELECT) → à chaque rechargement, l'ordre vient de `display_order`, mais les doublons orphelins réapparaissent comme doublons dans l'UI.
3. **Supprimer une FAQ ne la supprime pas en base** (upsert seulement) → elle revient au prochain `refreshStore()`.
4. Aucun `try/catch` → **échec silencieux + toast de succès**.

**Aucun** : réordonnancement par drag, import/export individuel, aperçu du rendu public, séparateur de catégorie.

---

## B.7 Onglet SUPABASE — `activeTab === 'supabase'` — « le qui fait vraiment » (l.3527-3719)

**Ce que ce module fait RÉELLEMENT** : c'est le **centre de sauvegarde/restauration de la boutique**. Ce n'est **PAS** un panneau d'administration SQL (aucune exécution de requête, aucun navigateur de tables, aucune migration). Concrètement 6 fonctions :

**Titre** : `Database w-5 h-5 text-[#3ECF8E]` + « Supabase Cloud & Historique des Snapshots » ; `p.text-xs opacity-75 mt-1` « Créez des points de sauvegarde complets et restaurez n'importe quel état de votre catalogue en un clic. » ⚠️ « complets » est **faux** (voir plus bas).

### B.7.1 (a) Bandeau statut + script SQL
Carte `p-5 rounded-2xl border space-y-3 ${subCardBg}`
- Pastille : `w-3 h-3 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}` ⚠️ **classe inline, donc invisible en thème sombre**
- Texte `flex items-center gap-2.5 font-bold text-xs` → « Statut Connexion Supabase : » + `isSupabaseConfigured ? 'Connecté & Opérationnel' : 'Identifiants en attente'`
- **Bouton « Copier le Script SQL »** (`Copy`/`Check`) : `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#171513] text-white text-xs font-bold hover:bg-[#C59B3F]` → `handleCopySql` : copie dans le presse-papier un **DDL de 100 lignes en dur** (constante `SQL_TEXT`, l.795-894) : CREATE TABLE pour products/editorial_banners/shipping_zones/faqs/site_backups + `ENABLE ROW LEVEL SECURITY` + policies `USING (true)`.
  - `setHasCopiedSql(true)` 3 s → libellé « Code SQL Copié » + `Check w-3.5 h-3.5 text-emerald-400`.
  - ⚠️ **Ce SQL est DIFFERENT et plus PÉRIMÉ que `supabase_master_schema.sql`** : il ne contient ni `orders`, ni `site_settings`, ni `exec_sql`, ni les index, ni les seeds ; `site_backups.id` y a `DEFAULT 'latest'` (une seule sauvegarde possible dans cette version) ; `shipping_zones` y inverse l'ordre des colonnes `delay`/`price` (sans incidence).
  - `navigator.clipboard.writeText` **sans `.catch`** → peut échouer silencieusement (contexte non sécurisé / permission).
- `p.text-xs opacity-75 leading-relaxed` : « Toutes les tables PostgreSQL (`products`, `editorial_banners`, `shipping_zones`, `faqs`, `site_backups`) sont actives et synchronisées en temps réel. » ⚠️ **affirmation trompeuse** : (a) `orders` et `site_settings` sont omises, (b) rien n'est « temps réel » (pas de realtime, pas de websocket — tout est du polling manuel).

### B.7.2 (b) Création d'un snapshot cloud
Carte `p-5 rounded-2xl border space-y-4 ${subCardBg}` ; titre `flex items-center gap-2 text-[#3ECF8E] font-bold text-sm` + `CloudUpload w-4 h-4` → « Créer un Nouveau Snapshot Cloud »
- Input `flex-grow px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[#3ECF8E] ${inputBg}`, placeholder **« Nom du snapshot (ex: Sauvegarde Rentrée 2026)... »** ⚠️ exemple daté/hardcodé
- Nom par défaut si vide : `` `Sauvegarde du ${toLocaleDateString('fr-FR')} à ${toLocaleTimeString('fr-FR')}` ``
- Bouton `px-6 py-2.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-black font-bold text-xs uppercase tracking-wider … shadow-xs whitespace-nowrap` + `CloudUpload` / `RefreshCw animate-spin` + « Enregistrement... » → `handleCreateSnapshot`
- Payload (**la SEULE chose réellement « complète »**) :
```ts
{ id: `snapshot-${Date.now()}`, backup_name: title,
  products_data: products,           // ← depuis le CONTEXTE (donc à jour)
  banners_data:  localBanners,       // ← état local NON SAUVÉ si modifs non appliquées
  shipping_data: localShipping,
  faqs_data:     localFaqs,
  contact_data:  localContact,
  social_data:   localSocial,
  created_at / updated_at: now }
→ supabase.from('site_backups').insert(newBackup)   // INSERT, jamais UPDATE
```
⚠️ `INSERT` (pas upsert) → l'historique s'accumule sans limite, jamais purgé automatiquement.
⚠️ Les bannières/shipping/faq viennent des **états locaux** : un snapshot peut ne pas refléter la base si l'utilisateur n'a pas cliqué « Enregistrer » avant.

### B.7.3 (c) Liste des snapshots
- Titre `font-luxury text-base font-bold` + `Clock w-4 h-4 text-[#C59B3F]` → « Liste des Snapshots Cloud ({n}) »
- Bouton « Actualiser » : `text-xs text-[#967120] hover:underline font-bold` + `RefreshCw` (spinner si chargement)
- Chargement : `p-8 text-center text-xs opacity-60` → « Chargement des snapshots... »
- Vide : `p-6 rounded-2xl border text-center text-xs opacity-75 ${subCardBg}` → « Aucun snapshot enregistré pour le moment. Utilisez le formulaire ci-dessus pour en créer un. »
- Ligne : `p-4 rounded-2xl border flex flex-col sm:flex-row … hover:border-[#C59B3F]/60 ${subCardBg}`
  - `backup_name` (`font-bold text-sm`) + pastille `{prodCount} Parfums` (`bg-[#C59B3F]/20 text-[#967120] border border-[#C59B3F]/40`) où `prodCount = Array.isArray(s.products_data) ? s.products_data.length : 0`
  - `Clock w-3 h-3` + « Enregistré le {toLocaleString('fr-FR')} »
  - **Restaurer** : `px-4 py-2 rounded-xl bg-[#171513] hover:bg-[#C59B3F] text-white font-bold text-xs uppercase tracking-wider … disabled:opacity-50` + `FolderSync` / `RefreshCw animate-spin` + « Restaurer » / « Restauration... »
  - **Supprimer** : `p-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50` + `Trash2`, `confirm('Supprimer ce snapshot cloud ?')`
- Chargement auto : `useEffect(() => { if (activeTab==='supabase') fetchSnapshots(); }, [activeTab, fetchSnapshots])` (l.695-699) → la liste est rechargée **à chaque entrée dans l'onglet** ✅

### B.7.4 (d) Restauration — ⚠️ LIMITATIONS CRITIQUES (l.739-777)
```ts
if (!confirm(`Voulez-vous vraiment restaurer la boutique avec le snapshot "${snapshot.backup_name}" ?`)) return;
// UNIQUEMENT products :
await supabase.from('products').upsert(snapshot.products_data.map(p => ({
  id, name, brand: p.brand || 'MG Perfume', tagline: p.tagline || '',
  price: p.price, original_price: p.originalPrice || null,
  volume: p.volume || '100 ml', image: p.image,
  family: p.family || 'oriental', category_label: p.categoryLabel || 'Eau de Parfum',
  badge: p.badge || null, top_notes/heart_notes/base_notes, description,
  is_popular: Boolean(p.isPopular),
  // ⚠️ ABSENTS : in_stock, is_archived, free_delivery, is_hero
})), { onConflict: 'id' });
await refreshStore();
showFeedback('Boutique restaurée avec succès !');
```
**Il faut savoir exactement ceci :**
1. ❌ **`banners_data`, `shipping_data`, `faqs_data`, `contact_data`, `social_data` ne sont JAMAIS restaurés** — ils sont stockés puis ignorés. Le module ne restaure **que le catalogue produits**.
2. ⚠️ **Les colonnes `in_stock`, `is_archived`, `free_delivery` sont absentes du payload de restauration** → sur un `upsert`, PostgREST **met les colonnes non mentionnées à NULL** → **restaurer un snapshot remet en rupture de stock, désarchive, et supprime la livraison gratuite de TOUS les produits restaurés**. (À vérifier selon la version de `upsert`, mais c'est le comportement par défaut de PostgREST pour les colonnes absentes.)
3. ❌ **Pas de DELETE** avant upsert → les produits créés **après** le snapshot **restent en base** : la restauration n'est pas un retour arrière exact.
4. `is_hero` non écrit → cohérent avec le fait que le hero est en localStorage.
5. `try/catch` présent → `alert('Erreur lors de la restauration : ' + …)` ✅

### B.7.5 (e) Export / Import JSON local (l.903-967)
Carte `p-5 rounded-2xl border space-y-3 ${subCardBg}` ; titre `FileJson w-4 h-4 text-[#C59B3F]` + « Export / Import Fichier Local (.json) » ; `p.text-xs opacity-75` « Téléchargez une copie autonome complète sur votre appareil ou importez un ancien fichier. »

**EXPORT** (`handleExportJsonBackup`) — **effectivement complet** :
```ts
const backupData = { app: 'MG Perfume', exportedAt: ISO,
  products, banners: localBanners, shippingZones: localShipping,
  faqs: localFaqs, contact: localContact, social: localSocial };
Blob → URL.createObjectURL → a.download = `mgperfume_backup_${YYYY-MM-DD}.json`
```
Bouton `px-5 py-2.5 rounded-full bg-[#171513] hover:bg-[#C59B3F] text-white font-bold text-xs uppercase tracking-wider … shadow-xs` + `Download w-4 h-4 text-[#C59B3F]` → « Télécharger Sauvegarde (.json) »
⚠️ Le nom de fichier est **préfixé `mgperfume_`** (non multi-tenant) et `app: 'MG Perfume'` est figé.

**IMPORT** (`handleImportJsonBackup`) — ⚠️ **ne lit QUE `parsed.products`** :
```ts
if (parsed.products && Array.isArray(parsed.products)) {
  → même mapping tronqué que la restauration (sans in_stock/is_archived/free_delivery)
  → await supabase.from('products').upsert(...)  ;  await refreshStore();
  showFeedback('Sauvegarde JSON importée avec succès !');
} else alert('Fichier de sauvegarde invalide : tableau de parfums manquant.');
```
Bouton `px-5 py-2.5 rounded-full border border-[#E8DCC2] hover:bg-black/5 font-bold text-xs uppercase tracking-wider …` + `Upload w-4 h-4 text-[#967120]` → « Importer un fichier (.json) » ; `<input type="file" accept=".json,application/json" className="hidden" ref={jsonFileInputRef}>`.

**Asymétrie majeure : l'export exporte 6 collections, l'import n'en importe qu'une.** Bannières / shipping / FAQ / contact / social exportés sont **purement décoratifs** — un utilisateur qui believe pouvoir tout restaurervia JSON se trompe.

---

## B.8 Onglet SETTINGS — `activeTab === 'settings'` (l.3724-3851)

**Titre** : `Settings w-5 h-5 text-[#C59B3F]` + « Coordonnées & Réseaux Sociaux » ; `p.text-xs opacity-75` « Mettez à jour le numéro WhatsApp pour les commandes directes et vos liens sociaux. »

### B.8.1 Champs — grille `grid-cols-1 sm:grid-cols-2 gap-4`, label `text-[10px] font-bold text-[#967120] uppercase`, input `w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-[#C59B3F] ${inputBg}`

| # | Label | Champ UI | Type | Objet | Ligne |
|---|---|---|---|---|---|
| 1 | `Numéro WhatsApp (sans +)` | `localContact.whatsappNumber` | text | `contact` | 3738 |
| 2 | `Téléphone d'appel` | `localContact.phoneFormatted` | text | `contact` | 3751 |
| 3 | `Email de Contact` | `localContact.email` | **email** | `contact` | 3764 |
| 4 | `Page Facebook` | `localSocial.facebook \|\| ''` | text, ph `https://facebook.com/...` | `social` | 3777 |
| 5 | `Compte Instagram` | `localSocial.instagram \|\| ''` | text, ph `https://instagram.com/...` | `social` | 3791 |
| 6 | `Compte TikTok` | `localSocial.tiktok \|\| ''` | text, ph `https://tiktok.com/@...` | `social` | 3805 |
| 7 | `Horaires d'ouverture` | `localContact.hours` | text, `sm:col-span-2` | `contact` | 3819 |

### B.8.2 Champs NON éditables (présents dans le type mais absents de l'UI)
`SiteConfig.contact.phone`, `contact.address`, `social.whatsappChannel`, et **tous** les autres champs de `SiteConfig` : `name`, `brandName`, `tagline`, `description`, `url`, `city`, `country`, `currency`, `shippingZones[]`, `editorialBanners[]`, `faqs[]`, `products[]`.
→ **L'onglet ne manages que 7 champs sur ~20.**

### B.8.3 Enregistrement (l.3833-3848)
```ts
const updatedContact = {
  ...localContact,
  phoneFormatted: localContact.phoneFormatted || localContact.phone,   // repli
  whatsappNumber:  localContact.whatsappNumber  || localContact.phone,   // repli
};
await updateSettings(updatedContact, localSocial);   // → site_settings.upsert({id:'main', contact, social})
setHasUnsavedChanges(false);
showFeedback('Coordonnées et réseaux sociaux enregistrés avec succès');
```
Bouton `px-5 py-2.5 rounded-full bg-[#171513] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#C59B3F] flex items-center gap-2` + `Save w-4 h-4` → « Enregistrer les coordonnées »

### B.8.4 Où cela persiste — réponse précise
| Couche | Emplacement |
|---|---|
| **Source de vérité** | table **`site_settings`**, ligne unique `id = 'main'`, colonnes `contact JSONB` et `social JSONB` |
| **Écriture** | `StoreContext.updateSettings()` → `supabase.from('site_settings').upsert({ id:'main', contact, social })` |
| **Cache local** | `localStorage.mg_store_cache` (`{… contact, social}`) réécrit à chaque changement d'état (effet l.188-195) |
| **Seed de repli** | `siteConfig.contact` / `siteConfig.social` (`src/config/site.ts`) |
| ⚠️ **`site_settings` n'existe PAS dans `supabase_master_schema.sql`** | table créée manuellement ; **à intégrer au schéma multi-tenant** |
| ⚠️ **`updateSettings` n'a pas de garde d'erreur** | `try/catch` autour d'un `await` qui ne throw pas (`upsert` retourne `{error}` sans lever) → **échec silencieux, toast de succès affiché quand même** |
| ⚠️ **Aucune normalisation** | pas de nettoyage du numéro WhatsApp (`+`, espaces, `00`), pas de validation d'URL sociale, pas de validation d'email au-delà de `type="email"` |

---

## B.9 MODALE PRODUIT — Ajouter / Modifier (l.3859-4108)

Condition : `{isProductModalOpen && editingProduct}` — **rendue en dehors du conteneur `max-w-7xl`**, à la racine du composant.

**Overlay** : `fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200`, `onClick` = fermeture (clic extérieur ferme ⚠️ **perte de saisie non confirmée**).
**Boîte** : `relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl flex flex-col ${cardBgClass}`, `onClick={e => e.stopPropagation()}`.

**Barre collante** : `sticky top-0 z-30 px-6 py-3.5 border-b flex items-center justify-between backdrop-blur-md` (`bg-white/95 border-[#E8DCC2]` en clair, `bg-[#171513]/95 border-white/10` en dark) ; H3 `font-luxury text-base sm:text-lg font-bold` + `Package w-5 h-5 text-[#C59B3F]` → titre dynamique : **`Nouveau Parfum` si `editingProduct.id.startsWith('product-')` sinon `Modifier le Parfum`** ; fermeture `p-1.5 rounded-full border text-xs font-bold hover:bg-red-500 hover:text-white` + `X w-5 h-5`.

**Formulaire** `<form onSubmit={handleSaveProductForm} className="p-6 sm:p-8 space-y-6 text-xs">` :

### B.9.1 Zone image (l.3887-3924)
`flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border border-dashed border-[#C59B3F]/40 bg-black/5`
- Aperçu `relative w-24 h-28 bg-white rounded-xl p-1 border flex-shrink-0` : `<Image src={editingProduct.image} fill className="object-contain p-1" />` ou `<ImageIcon w-6 h-6 text-gray-400 />` si vide
- Label : **« Image du Flacon (Fond Blanc recommandé) »** ⚠️ MG-spécifique
- Bouton `px-3.5 py-1.5 rounded-full bg-[#171513] text-white font-bold text-xs flex items-center gap-1.5 hover:bg-[#C59B3F]` + `Upload w-3.5 h-3.5 text-[#C59B3F]` → « Uploader une photo » (input caché `ref={fileInputRef}` accept `image/*`)
- Texte `text-[10px] opacity-70` « ou saisir le chemin »
- Input texte, placeholder `/images/products/... ou https://...` → permet une URL distante
- ⚠️ L'upload lit le fichier en **base64** (`FileReader.readAsDataURL`) et l'écrit dans `image` → stocké tel quel en base. Aucun redimensionnement, aucun contrôle de taille, aucune compression.

### B.9.2 Champs du formulaire (grille `grid-cols-1 sm:grid-cols-2 gap-4`)
Label commun : `text-[10px] font-bold text-[#967120] uppercase` ; input commun : `w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-[#C59B3F] ${inputBg}`

| # | Label | Champ | Type | Obligatoire | Placeholder |
|---|---|---|---|---|---|
| 1 | `Nom du Parfum *` | `name` | text | **`required`** | — |
| 2 | `Maison / Marque` | `brand \|\| ''` | text | — | — |
| 3 | `Prix Actuel (FCFA) *` | `price` | **number** | **`required`** | — |
| 4 | `Prix Barré Promo (Optionnel)` | `originalPrice` | number | — | `ex: 30000` (⚠️ apostrophe droite) |
| 5 | `Volume / Contenance` | `volume` | text | — | `ex: 100 ml, 50 ml, 30 ml` |
| 6 | `Badge Promotionnel` | `badge \|\| ''` | text | — | `ex: Bestseller, Coup de Cœur, Nouveauté` |
| 7 | `Famille Olfactive` | `family` | **select** | — | 5 options (voir ci-dessous) |
| 8 | `Catégorie / Titre` | `categoryLabel` | text | — | `ex: Eau de Parfum, Élixir Féminin` |

**Options du select Famille Olfactive** (⚠️ libellés différents de ceux du filtre !) :
`oriental`→« Oriental & Épices », `gourmand`→« Gourmand & Sucré », `boise`→« Boisé & Cèdre », `floral`→« Floral & Fruité », `aquatique`→« Frais & Hespéridé »

### B.9.3 Champs pleine largeur
| Label | Champ | Type | Placeholder |
|---|---|---|---|
| `Slogan Poétique (Tagline)` | `tagline` | text | `ex: Sillage ambré chaleureux et vanille précieuse` |
| `Description Détaillée` | `description` | **textarea rows=3** | — |

### B.9.4 Pyramide olfactive (l.4041-4075) — ⚠️ 100 % SPÉCIFIQUE AU PARFUM
Carte `p-4 rounded-2xl border space-y-3 ${subCardBg}` ; titre `font-bold text-[#967120] uppercase tracking-wider text-[11px] block` → **« Pyramide Olfactive (Séparer par des virgules) »**
3 sous-champs, même mécanique :
```tsx
<label className="text-[10px] opacity-70">Notes de Tête :</label>   // Cœur : de cœur ; Fond : de fond
<input value={editingProduct.topNotes.join(', ')}
  onChange={e => setEditingProduct({...editingProduct,
    topNotes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
  className="w-full px-3 py-1.5 rounded-xl border …" />
```
Labels exacts : **« Notes de Tête : »**, **« Notes de Cœur : »**, **« Notes de Fond : »**.

### B.9.5 Pied de formulaire (l.4077-4103)
`pt-3 border-t border-[#E8DCC2] flex items-center justify-end gap-3`
- `Annuler` : `type="button"`, `px-4 py-2 rounded-full border text-xs font-bold ${subCardBg}` → ferme
- `Enregistrer` : `type="submit"`, `px-6 py-2.5 rounded-full bg-[#171513] hover:bg-[#C59B3F] text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all … disabled:opacity-50` ; spinner `RefreshCw animate-spin` + « Enregistrement... » sinon `Save w-4 h-4` + « Enregistrer »

**Champs absents de la modale** (modifiables uniquement en base) : `isPopular`, `isHero`, `inStock`, `isArchived`, `freeDelivery`. → **l'état « en rupture », « archivé », « livraison gratuite » ne se règle QUE depuis les cartes / le tableau / les sous-onglets promotions.**

### B.9.6 Flux d'enregistrement
```ts
handleSaveProductForm(e):
  e.preventDefault(); if (!editingProduct) return;
  setIsSavingProductModal(true);
  const result = await saveProduct(editingProduct);
  setIsSavingProductModal(false);
  if (result.success) { showFeedback('Parfum enregistré et synchronisé avec succès !');
                       setIsProductModalOpen(false); setEditingProduct(null); }
  else alert('Erreur lors de l\'enregistrement : ' + result.error);
```
⚠️ **Aucune validation métier** : pas de contrôle que `price > 0`, pas de contrôle d'unicité du `name`, pas d'image obligatoire, pas de slug.
⚠️ `handleOpenAddProduct` génère `id: \`product-${Date.now()}\`` → **les IDs de nouveaux produits sont horodatés, pas des slugs lisibles** (contrairement aux seeds `khamrah-waha`).

---

## B.10 Matrice « qui écrit quoi » — tous les handlers

| Handler | Ligne | Écrit quoi | Persiste où | Confirm | Toast | Erreur |
|---|---|---|---|---|---|---|
| `handleLogin` | 240 | session | localStorage+sessionStorage | — | — | `authError` inline |
| `handleLogout` | 298 | — | supabase signOut + removeItem | — | — | silencieux |
| `handleTabClick` | 318 | onglet | `mg_admin_active_tab` | modale si dirty | — | — |
| `handleImageFileChange` | 329 | `image` (base64) | état `editingProduct` | — | — | — |
| `handleBannerFileChange` | 344 | `image` (base64) | `localBanners` + dirty | — | — | — |
| `handleOpenAddProduct` | 357 | nouveau draft | état | — | — | — |
| `handleSaveProductForm` | 380 | produit | `products.upsert` | — | ✅ | `alert` |
| `handleDeleteProductConfirm` | 397 | suppression | `products.delete` | ✅ | ✅ | `alert` |
| `handleSelectHero` | 409 | hero | localStorage | — | ✅ | `alert` |
| `handleTogglePopular` | 419 | `is_popular` | upsert | ❌ (min 2 / max 4 → `alert`) | ✅ | `alert` |
| `handleApplyQuickDiscount` | 429 | `price`,`original_price`,`badge` | upsert | ❌ | ✅ | `alert` |
| `handleRemoveDiscount` | 447 | idem | upsert | ❌ | ✅ | `alert` |
| `handleToggleInStock` | 463 | `in_stock` | upsert | ❌ | ✅ | `alert` |
| `handleToggleArchive` | 477 | `is_archived` | upsert | ❌ | ✅ | `alert` |
| `handleToggleFreeDelivery` | 491 | `free_delivery` | upsert | ❌ | ✅ | `alert` |
| `handleBulkAction` | 505 | 1 champ × N | N upsert/delete | ✅ si delete | ✅ | **aucune** |
| `handleSetProductBadge` | 545 | `badge` | upsert | ❌ | ✅ | `alert` |
| `handleBulkApplyDiscount` | 559 | 3 champs × N | N upsert | ❌ | ✅ | `alert` (plage de 0) |
| `handleBulkApplyBadge` | 593 | `badge` × N | N upsert | ❌ | ✅ | **aucune** |
| `handleBulkClearDiscounts` | 619 | 3 champs × N | N upsert | ❌ | ✅ | **aucune** |
| `handleAddBanner` | 647 | bannière locale | `localBanners` + dirty | ❌ | — | `alert` si >6 |
| `handleDeleteBanner` | 667 | bannière locale | `localBanners` + dirty | ✅ | ✅ | — |
| `fetchSnapshots` | 676 | — | SELECT | — | — | `console.warn` |
| `handleCreateSnapshot` | 702 | `site_backups` | INSERT | — | ✅ | `alert` |
| `handleRestoreSnapshot` | 739 | `products` | upsert (colonnes tronquées) | ✅ | ✅ | `alert` |
| `handleDeleteSnapshot` | 780 | `site_backups` | DELETE | ✅ | ✅ | `alert` |
| `handleCopySql` | 794 | — | presse-papiers | — | ✅ | **aucune** |
| `handleExportJsonBackup` | 903 | — | fichier local | — | ✅ | **aucune** |
| `handleImportJsonBackup` | 927 | `products` | upsert | — | ✅ | `alert` |
| **inline orders** | 1788 | `order_status` | UPDATE | ❌ | ✅ | **aucune** |
| **inline orders** | 1819 | suppression | DELETE | ✅ | ✅ | **aucune** |
| **inline banners** | 3335 | `editorial_banners` | upsert | — | ✅ | **aucune** |
| **inline shipping** | 3418 | `shipping_zones` | upsert | — | ✅ | **aucune** |
| **inline faq** | 3502 | `faqs` | upsert (ids regenerés) | — | ✅ | **aucune** |
| **inline settings** | 3833 | `site_settings` | upsert | — | ✅ | **aucune** |

**Bilan des confirmations :** seules **6 opérations destructives** sur 30 sont confirmées (supprimer produit, supprimer en bulk, supprimer commande, supprimer bannière, restaurer snapshot, supprimer snapshot). **Le reste est instantané et irréversible.**

---

## B.11 Quirks, workarounds et pièges — RÉCAPITULATIF

| # | Quirk | Localisation | Impact |
|---|---|---|---|
| 1 | **Auth bypass** : `localStorage.mg_admin_auth='true'` ouvre le dashboard | l.214-221 | faille critique |
| 2 | **Mot de passe admin en clair dans le bundle** : `admin` / `MG@D4k4r-Parfum!2026` | l.268, l.280 | faille critique |
| 3 | `handleLogout` ne supprime pas `sessionStorage.mg_admin_auth` | l.304-308 | déconnexion incomplète |
| 4 | **Onglet bannières non fonctionnel** : lecture `banners`, écriture `localBanners` | l.3213 vs 3238… | onglet inutilisable |
| 5 | ~~typo de classe~~ — **vérifié : aucune classe hex invalide** (census complet en [A.1bis](#a1bis-census-exhaustif-des-couleurs--16-hex-utilisés)) | — | — |
| 6 | `showFeedback()` force `hasUnsavedChanges = false` | l.313 | modifs non sauvegardées déclarées « sauvegardées » |
| 7 | `setTimeout` de toast jamais nettoyé | l.314, l.899 | toasts qui s'annulent |
| 8 | Mode sombre partiellement cassé : `text-[#171513]` écrit en dur ~40 fois | throughout | texte illisible en dark |
| 9 | `bg-white` sur vignettes produits/bannières en dur | l.2142, l.2631, l.3888… | boîte blanche en dark |
| 10 | Bordures drawer/tableaux en dur `border-[#E8DCC2]` | l.1223, l.1377, l.1670… | invisibles en dark |
| 11 | `alert()` / `confirm()` natifs pour tous les succès/échecs et la moitié des destructifs | throughout | look non conforme au design system |
| 12 | Restore snapshot & import JSON **n'écrivent pas** `in_stock`, `is_archived`, `free_delivery` | l.748-765, l.936-953 | perte de données à la restauration |
| 13 | Restore/import ne couvrent **que** les produits (5 collections ignorées) | idem | restauration partielle |
| 14 | Upsert sans DELETE : bannières/FAQ supprimées reviennent | l.3349, l.3510 | suppressions non persistées |
| 15 | FAQ : `id` régénéré à l'index → lignes orphelines en base | l.3505 | accumulation de doublons |
| 16 | Le tri `'default'` ne restaure pas l'ordre source | l.1007 | tri incohérent |
| 17 | La sélection bulk n'est pas purgée au changement de page | l.2405-2466 | compteurs trompeurs |
| 18 | Chaque changement de page scroll en haut de la **page** | l.2408… | saut de scroll désagréable |
| 19 | Panneau KPI « CA » cumule annulées et non payées | l.1540 | chiffre faux |
| 20 | Le filtre méthode ne couvre pas `cod` | l.1620-1624, 1643-1646 | commandes invisibles |
| 21 | `orderSearch` cherche l'adresse mais le placeholder ne l'annonce pas | l.1577, 1639 | — |
| 22 | `productSearch` promet la description, ne teste que name/brand/tagline | l.1889, 980-983 | placeholder faux |
| 23 | Presets de remise asymétriques : `[10,15,20,25,30]` en bulk vs `[10,15,20,30]` en unitaire | l.2813, l.2961 | incohérence |
| 24 | `max=90` sur le % vs validation `>=100` en JS | l.2832, l.564 | 91–99 % passants |
| 25 | Badge non mis à jour en cas de 2ᵉ remise (`badge \|\| ...`) | l.436, l.581 | badge faux |
| 26 | Arrondi au millier **supérieur** possible (35 000 −15 % → 30 000) | l.431 | prix non conforme |
| 27 | `heroSearch` inclut les produits archivés ; `promoSearch` non | l.2608, l.2717 | incohérence |
| 28 | Le hero est **localStorage-only** : pas de synchro entre appareils | StoreContext l.249 | hero perdu ailleurs |
| 29 | Compteur `selectionDuMoment` fallback trompeur si < 2 populaires | StoreContext l.385 | affiche 4 slots vides |
| 30 | Bouton « Remplacer » de la sélection du moment ne remplace rien | l.2753 | libellé faux |
| 31 | `saveOrder` avale l'erreur Supabase en `console.warn` | StoreContext l.315 | perte silencieuse |
| 32 | N requêtes séquentielles pour toutes les actions bulk | l.518, 572, 602, 628 | lent / rate-limits |
| 33 | Cache localStorage réécrit (JSON complet) à chaque frappe | StoreContext l.188 | perf + quota |
| 34 | `Image` sans `onError` → image cassée = carte cassée | l.1765, 2144… | rendu cassé |
| 35 | Toast « Label MG Perfume Dakar » dans le lien WhatsApp | l.1807 | non paramétrable |
| 36 | Aucune pagination sur `orders`, `banners`, `shipping`, `faq`, `snapshots` | — | perf |
| 37 | `handleCreateSnapshot` utilise `INSERT` → historique non purgé | l.725 | croissance illimitée |
| 38 | Le SQL copié depuis l'admin ≠ `supabase_master_schema.sql` (périmé) | l.795-894 | documentation fausse |
| 39 | `exec_sql` RPC en base = exécution SQL arbitraire | schema l.124-135 | faille |
| 40 | RLS `USING (true)` sur toutes les tables | schema l.140-186 | aucune isolation |
| 41 | `is_archived` / `free_delivery` absents du master SQL | schema l.7-45 | erreurs silencieuses |
| 42 | `site_settings` absente du master SQL | — | table orpheline |
| 43 | Clé anon Supabase + URL projet **en dur** | lib/supabase.ts | à supprimer |
| 44 | Texte « Toutes les tables … synchronisées en temps réel » | l.3557 | affirmation fausse |

---

## B.12 Code mort / imports inutilisés (dans `page.tsx`)

| Symbole | Ligne | Statut |
|---|---|---|
| `selectedOrderForView` / `setSelectedOrderForView` | 128 | état déclaré, **jamais lu ni écrit** → vestige d'un ancien panneau de détail de commande |
| `siteConfig` | 69 | importé, **jamais utilisé** dans le fichier |
| `ShieldCheck` | 28 | icône importée, jamais rendue |
| `Flame` | 51 | idem |
| `Star` | 52 | idem |
| `SlidersHorizontal` | 47 | idem |
| `ExternalLink` | 49 | idem |
| `ArrowDownRight` | 59 | idem |
| `Filter` | 45 | idem (les 32 occurrences sont `filterFamily`/`filterStatus`/…) |
| `isSupabaseConfigured` | 71 | utilisé **1 seule fois** (l.3543) |

---

# D. REUSABILITY ASSESSMENT

Critère de classement : **une fonctionnalité est « générique » si elle fonctionne telle quelle pour n'importe quel site client francophone** (e-commerce ou vitrine) en changeant seulement des libellés/valeurs par tenant. Elle est « MG Perfume » si elle repose sur le **domaine parfum**, la **géographie Dakar**, ou une **marque** codée en dur.

## D.1 GÉNÉRIQUE — réutilisable tel quel dans la plateforme partagée

### D.1.1 Coquille applicative (100 % générique, à déplacer dans un composant shell commun)

| Brique | Lignes | Note de réemploi |
|---|---|---|
| **Loading screen** | 1026-1050 | Seulement le libellé « MG PERFUME DAKAR » et le chemin `/images/brand/logo.png` à paramétrer (`{site.name} {site.city}`) |
| **Login screen** | 1055-1143 | Entièrement générique ; le libellé « MG Perfume — Accès sécurisé » → `{site.name} — Accès sécurisé` |
| **Header sticky** | 1156-1209 | « MG Perfume » + pastille « Admin » + logo → paramétrables |
| **Drawer de navigation** | 1212-1393 | **Structure 100 % générique** (8 entrées) ; seul le libellé, l'icône et le compteur varient |
| **Barre de module + H1** | 1450-1510 | Les 8 titres sont du texte ; 3 contiennent du MG → à sortir en table de configuration |
| **Modale de confirmation « modifs non enregistrées »** | 1396-1427 | générique |
| **Toast de succès** | 1430-1435 | générique (or/noir) |
| **Scroll lock drawer** | 196-205 | générique |
| **Auth Supabase + persistance de session** | 211-309 | **mécanisme générique, implémentation à jeter** (voir D.1.7) |
| **Palette + variables de thème + typo** | A.1 / A.2 | générique ; à exposer en **tokens de thème par tenant** |
| **Toggle thème clair/sombre** | 97, 1146-1150, 1181-1188 | générique |

### D.1.2 CRUD générique « contenu éditorial »

| Module | Lignes | Champs | Générique ? |
|---|---|---|---|
| **Onglet `banners`** | 3185-3362 | `tag`, `title`, `image`, `alt`, `linkText`, `href`, `bgColor`, `objectPosition`, ordre | ✅ **générique à 95 %** — modèle « bloc éditorial de page d'accueil ». Seuls `'/images/shooting/…'`, `'Nouvelle Collection'`, `'Bannière MG Perfume'`, `'/boutique'` sont MG. ⚠️ à corriger (bug lecture/écriture) |
| **Onglet `shipping`** | 3367-3432 | `id`, `name`, `price`, `delay` | ✅ **générique** — « zones de livraison » vaut pour tout marchand. Il manque seulement CRUD complet (ajout/suppression) |
| **Onglet `faq`** | 3437-3522 | `q`, `a`, ordre | ✅ **générique** — FAQ universelle |
| **Onglet `settings`** | 3724-3851 | 7 champs contact + social | ✅ **générique** — téléphone, email, horaires, FB/IG/TikTok. Le libellé « Numéro WhatsApp » est lui-même déjà une convention Dakar/Afrique de l'Ouest |
| **Onglet `supabase`** | 3527-3719 | snapshots + export/import | ✅ **générique** — sauvegarde/restauration de site. À renommer « Sauvegardes » (le mot « Supabase » est une implémentation) |
| **Modale produit — champs génériques** | 3926-4038 | `name`, `brand`, `price`, `originalPrice`, `image`, `description`, `badge`, `categoryLabel`, `freeDelivery`, `inStock`, `isArchived` | ✅ **génériques** — modèle « produit de catalogue » |

### D.1.3 Génie du catalogue (transposable tel quel)

| Fonctionnalité | Lignes | Pourquoi générique |
|---|---|---|
| Recherche + bouton effacer | 1885-1902 | primitive |
| 4 filtres combinables (dont 1 dynamique sur une valeur dérivée) | 1905-1979 | le filtre « famille olfactive » est le seul spécifique ; les 3 autres (marque, statut, tri) sont universels |
| Compteur + « Réinitialiser les filtres » | 1982-2001 | pattern universal |
| **Vues cartes ⇄ liste** avec segmented control | 2092-2400 | pattern universal ; seules les colonnes/variantes de badges sont MG |
| **Sélection multiple + 6 actions groupées** | 2005-2089, 2904-2915 | pattern universal |
| **Pagination 12 + select + pastilles + scroll-to-top** | 2402-2468 | paramétrable (`adminProductsPerPage`) |
| **Rupture de stock / livraison gratuite / archivage** | 463-502, 2223-2266 | **e-commerce générique** (indépendant du parfum) |
| **Suppression confirmée** (`confirm` natif) | 397, 511 | pattern |
| Toast / `alert` / `confirm` | passim | à remplacer par une couche dialog/sonnée cohérente par tenant |
| **Upload image → base64** | 329-341, 344-354, 3887-3924 | **⚠️ à remplacer par un vrai upload (bucket + CDN)** : base64 en colonne TEXT est un défaut à ne pas reproduire |
| **Bulk prix/remises** avec arrondi au millier | 429-444, 559-590 | générique à condition de paramétrer **l'unité monétaire et l'arrondi** (ici FCFA / 1000) |
| **Export/Import JSON** | 903-967 | générique (une fois élargi à toutes les collections) |

### D.1.4 Gestion des commandes

| Élément | Lignes | Générique ? |
|---|---|---|
| 4 cartes KPI (volume, CA, à traiter, paiements en ligne) | 1522-1569 | ✅ structure générique ; **le calcul du CA est à corriger** (filtrer annulées/non payées) |
| Recherche multi-champs + 2 filtres | 1571-1628 | ✅ générique |
| Carte commande détaillée (client, tel cliquable, adresse, zone, sous-total/port/total, articles) | 1664-1836 | ✅ générique |
| Sélecteur de statut de commande | 1786-1800 | ✅ générique (libellés + workflow à paramétrer par tenant) |
| **Suppression confirmée de commande** | 1818-1829 | ✅ générique |
| Badges de statut colorés (5 états) | 1704-1720 | ✅ générique |

### D.1.5 Multi-tenance — adaptation obligatoire de l'existant

| Point | Où | Action requise |
|---|---|---|
| Préfixe de toutes les clés de stockage | C.5 | remplacer `mg_` par `mgperfume:` / `sl:<tenant>:` |
| `siteConfig.name` non utilisé dans le shell | A.6 | **le shell ne lit pas la config du tenant** → brancher `siteConfig` (l.69 est importé mais inutilisé) |
| `site_backups.id = snapshot-${Date.now()}` | 702-725 | passer en UUID ou `(tenant_id, id)` |
| `site_settings.id = 'main'` | StoreContext 375 | passer en PK composite `(tenant_id, id)` ou `id = tenantId` |
| Tables sans `tenant_id` | schema | **toutes** les tables doivent avoir `tenant_id` + RLS `USING (tenant_id = auth.jwt()…)` |
| `exec_sql` | schema 124-135 | **supprimer** (injection SQL par design) |
| RLS `USING(true)` | schema 140-186 | remplacer par politiques par rôle/tenant |
| `navigator.clipboard` SQL en dur | 795-894 | générer le DDL depuis le schéma réel du tenant |

## D.2 SPÉCIFIQUE MG PERFUME — liste exhaustive du hardcoding

### D.2.1 Domaine « parfum » (olfactif)

| Élément | Lignes | Détail |
|---|---|---|
| Type `ScentFamily` | types/index.ts:1 | `'gourmand' \| 'aquatique' \| 'boise' \| 'floral' \| 'oriental'` (avec `'all'`) |
| `DEFAULT 'family'` | StoreContext 55, 78 | `'oriental'` |
| Colonne DB | schema 17 | `family TEXT DEFAULT 'oriental'` |
| **Filtre « Famille Olfactive »** | 1907-1923 | 6 options, libellés : Toutes / Oriental / Boisé / Gourmand / Floral / « Aquatique / Frais » |
| **Select « Famille Olfactive » de la modale** | 3993-4004 | libellés **différents** : « Oriental & Épices », « Gourmand & Sucré », « Boisé & Cèdre », « Floral & Fruité », « Frais & Hespéridé » |
| **Pyramide olfactive** | 4040-4075 | bloc de 3 champs `topNotes`/`heartNotes`/`baseNotes`, saisie « séparée par des virgules », labels « Notes de Tête / de Cœur / de Fond » |
| Colonnes `top_notes`/`heart_notes`/`base_notes` `TEXT[]` | schema 19-21 | — |
| `DEFAULT 'volume' = '100 ml'` | StoreContext 52, 77 ; schema 15 ; page 365, 3976 | placeholder « ex: 100 ml, 50 ml, 30 ml » |
| `DEFAULT 'category_label' = 'Eau de Parfum'` | StoreContext 55, 80 ; schema 17 ; page 368, 4013 | placeholder « ex: Eau de Parfum, Élixir Féminin » |
| Placeholder badge | 3987 | « ex: Bestseller, Coup de Cœur, Nouveauté » |
| Placeholder tagline | 4025 | « ex: Sillage ambré chaleureux et vanille précieuse » (accent aigu sur le `é` de « précieuse ») |
| Label upload | 3897 | « **Image du Flacon** (Fond Blanc recommandé) » |
| Titre module products | 1458 | « Catalogue des **Parfums Orientaux** » |
| Libellés catalogue | 1279, 1458, 1860, 1884 | « Catalogue Parfums », « Catalogue des Parfums Orientaux », « Catalogue Actif », « X parfum(s) actif(s) » |
| Prix.currency | types 111 | `currency: 'FCFA'` (types) ; `FCFA` écrit en dur l.1543, 1746, 1749, 1773, 2179, 2183, 2627, 2734, 2941, 2949, 3352 |

### D.2.2 Presets marketing orientés parfum/territoire

| Preset | Ligne | Commentaire |
|---|---|---|
| `Bestseller`, `Coup de Cœur`, `Nouveauté`, `Édition Limitée`, `Tendance`, `Offre Spéciale`, `Cadeau Idéal` | 3024-3031 | **génériques e-commerce** → pourraient être des presets par tenant |
| **`Exclusivité Dakar`** | 3032 | 🟡 **géographique** |
| `-15% Flash`, `-20% Promo`, `-30% VIP` | 3033-3035 | 🟡 marketing, générique |
| Placeholder badge perso | 3063 | « ex: **Sélection Tabaski, Coffret Luxe**… » 🔴 **très local** (Tabaski = fête de l’Aïd, purement local) |
| `bulkCustomBadge` défaut | 183 | `'Offre Spéciale'` |
| Marque « Édition **Phare** » | 2559, 2554 | nom marketing de la home — 💡 réutilisable comme libellé générique « Mettre en avant » |
| « Sélection du **Moment** » | 2653, 2657, 383 (StoreContext) | 💡 générique |
| Presets de remise `[10,15,20,25,30]` / `[10,15,20,30]` | 2813, 2961 | 💡 générique (à paramétrer) |
| Arrondi `Math.round(x/1000)*1000` | 431, 576 | 🟡 **FCFA** (arrondi au millier) — à paramétrer (centimes pour d'autres devises) |

### D.2.3 Géographie & paiements

| Élément | Ligne | Détail |
|---|---|---|
| **Zones de livraison seed** | schema 193-201 | `dakar-centre` 2000 « Sous 2h à 4h » / `dakar-banlieue` 3000 / `interieur-senegal` 4000 |
| Sous-titre onglet shipping | 3375 | « pour **Dakar Centre, banlieues et régions** » 🔴 |
| `PaymentMethod` | types 26 | `'paytech' \| 'whatsapp' \| 'cod'` — **PayTech =agrégateur sénégalais** 🔴 |
| `paytech_token`, `paytech_redirect_url` | types 54-55 ; schema 63-64 | 🔴 |
| Titre module orders | 1457 | « Commandes & Ventes (**PayTech / WhatsApp**) » 🔴 |
| KPI 4 | 1561-1567 | « **Paiements PayTech** » + « **Wave • OM • Free • Carte** » 🔴 (opérateurs sénégalais) |
| Options filtre | 1621-1622 | « PayTech (Paiement en ligne) », « **WhatsApp (Paiement à la livraison)** » 🔴 |
| Badge paiement | 1694, 1699 | « Payé (**PayTech**) », « **Paiement à la livraison** » |
| Message WhatsApp | 1807 | « Bonjour {name}, c'est **MG Perfume Dakar** concernant votre commande **#{ref}** ! » 🔴 |
| Placeholder recherche commandes | 1577 | « (#**MGP**-…) » 🔴 (préfixe de commande) |
| Bouton vert WhatsApp `#25D366` | 1811 | convention WA (⚠️ `bg-[#25D366] hover:bg-[#1EBE5B]` est **écrit en dur**, hors du thème → à garder tel quel, c'est une convention de marque) |
| Label settings | 3738 | « Numéro **WhatsApp** (sans +) » 🟡 (convention Dakar, quasi universelle en Afrique de l'Ouest) |

### D.2.4 Identité MG Perfume

| Élément | Ligne(s) | Valeur |
|---|---|---|
| Logo (×5 usages) | 1032, 1064, 1159, 1226 | `/images/brand/logo.png` 🔴 |
| Titre loading | 1040 | « **MG PERFUME DAKAR** » 🔴 |
| Titre login | 1076 | « **MG Perfume** — Accès sécurisé » 🔴 |
| Nom header | 1164 | « **MG Perfume** » 🔴 |
| Nom drawer | 1230-1234 | « **MG Perfume** » + « Menu Admin » 🔴 |
| Compte connecté | 1386 | `admin@mgperfume.store` 🔴 |
| **Alias d'auth** | 249 | `'admin'` → `admin@mgperfume.store` 🔴 |
| **Mot de passe en clair** | 268, 280 | `MG@D4k4r-Parfum!2026` 🔴🔴 |
| Défaut marque produit | StoreContext 48, 73 ; page 361, 751, 939 | `'MG Perfume'` 🔴 (apparaît aussi comme valeur de secours dans le filtre « Maison ») |
| Défaut bannière `alt` | StoreContext 146 ; page 3342 | `'Bannière **MG Perfume**'` 🔴 |
| Noms bannières seed | schema 206-209 | `naimez-que-moi`, `rose-desir`, `un-amour`, `gamme-gouttes` 🔴 |
| Image bannière par défaut (ajout) | 656 | `/images/shooting/naimez-que-moi-model.jpg` 🔴 |
| Image produit par défaut (ajout) | 366 | `/images/products/khamrah-waha.jpg` 🔴 |
| Placeholder recherche produits | 1889 | « maison (**Lattafa, Afnan**…) » 🔴 |
| Export JSON | 905, 918 | `app: 'MG Perfume'`, `mgperfume_backup_*.json` 🔴 |
| Empty state orders | 1656 | « … commande via PayTech ou WhatsApp… » 🔴 |
| Fantôme d'auth | C.6 | URL + clé anon du projet Supabase MG 🔴 |
| Marqueur `select *` produits | page 70 | `PerfumeProduct` importé partout |
| Table `products` semicolon | — | `category_label DEFAULT 'Eau de Parfum'` 🔴 |

### D.2.5 Verdict par onglet

| Onglet | Générique | MG Perfume |
|---|---|---|
| `orders` | 85 % | PayTech, WhatsApp, « MG Perfume Dakar » dans le message, `#MGP-`, KPI Wave/OM/Free |
| `products` | 70 % | famille olfactive, pyramide, « Flacon », « 100 ml », « Eau de Parfum », « Parfums Orientaux », maisons seed |
| `promotions` | 80 % | presets « Édition Limitée »/« Exclusivité Dakar », placeholder Tabaski, arrondi FCFA |
| `banners` | 95 % | images seed, « Bannière MG Perfume », `/boutique` |
| `shipping` | 90 % | libellé Dakar, unités FCFA |
| `faq` | 100 % | — |
| `supabase` | 100 % | nom de fichier d'export (trivial) |
| `settings` | 100 % | libellé « WhatsApp » (convention) |
| **Coquille** | 90 % | logo, 3 titres de module, 2 libellés de login/drawer |

**Bilan :** sur 4112 lignes, **≈ 120 lignes** sont du hardcoding MG strict (identity, credentials, seed imagery), **≈ 150 lignes** du parfum/olfactif, **≈ 80 lignes** de la géographie/paiement Dakar. Le reste — **≈ 3750 lignes (~91 %)** — est du portail e-commerce générique réutilisable tel quel dans la plateforme partagée, à condition de remplacer : (1) les libellés par une config de tenant, (2) `mg_` par un préfixe tenant, (3) `alert/confirm` par une couche de dialogues, (4) le base64 par un vrai upload, (5) les 3 failles d'auth, (6) le pattern upsert-only par des mutations explicites.

---

# F. CONFIRM COVERAGE

## F.1 Couverture de lecture

| Fichier | Lignes réelles | Lignes lues | Couverture | Méthode |
|---|---|---|---|---|
| `src/app/admin/page.tsx` | **4112** | **1 → 4112** | **100 %** | lecture séquentielle par blocs contigus de 520 lignes : `[1–520] [521–1040] [1041–1560] [1561–2080] [2081–2600] [2601–3120] [3121–3640] [3641–4112]`. Aucun bloc n'a été sauté, aucun résumé intermédiaire. |
| `src/context/StoreContext.tsx` | 422 | 1 → 422 | 100 % | lecture intégrale en un appel |
| `src/types/index.ts` | 130 | 1 → 130 | 100 % | lecture intégrale en un appel |
| `src/lib/supabase.ts` | 21 | 1 → 21 | 100 % | lecture intégrale en un appel |
| `supabase_master_schema.sql` | 391 | 1 → 391 | 100 % | lecture intégrale en un appel |

**Aucun snippet de grep n'a servi à la rédaction.** Les seuls `grep` lancés ont servi à **vérifier** des affirmations après lecture complète :
- occurrences de `selectedOrderForView`, `siteConfig`, `ShieldCheck`, `Flame`, `Star`, `SlidersHorizontal`, `ExternalLink`, `ArrowDownRight`, `Filter` → **imports/états morts** (§ B.12) ;
- comparaison `banners.*` vs `localBanners.*` → **confirmation du bug de l'onglet bannières** (§ B.4) ;
- `grep -oE '\[[#][0-9A-Fa-f]+\]' | sort | uniq -c` → **census des 16 couleurs** (§ A.1bis) ;
- `sed -n '3017p'` → **vérification de la classe hex** (mon soupçon initial de typo était **infondé**, corrigé en conséquence).

## F.2 Découpage structurel du fichier (pour repérage dans la réimplémentation)

| Plages | Contenu |
|---|---|
| 1–72 | `'use client'`, imports (`lucide-react` : 62 icônes), imports types/config/supabase/context |
| 74–94 | `export default function AdminDashboardPage()` + destructure `useStore()` |
| 96–205 | États : thème, auth, drawer, onglet + persistance, filtres, pagination, bulk, **états locaux éditables**, refs fichier, toast |
| 207–326 | Authentification (session, login avec mot de passe en clair, logout), `showFeedback`, `handleTabClick` |
| 328–644 | Handlers produits : upload image, CRUD, hero, sélection, remises, stock, archive, livraison, **bulk actions produits**, badges |
| 646–673 | Handlers bannières (ajout, suppression) |
| 675–791 | Snapshots : `fetchSnapshots`, `useEffect` d'auto-chargement, créer / restaurer / supprimer |
| 793–900 | `handleCopySql` (DDL en dur de 100 lignes) |
| 902–967 | Export / import JSON |
| 969–1021 | `uniqueBrands`, `filteredProducts` (filtre + tri), pagination, reset page |
| **1023–1050** | **LOADING SCREEN** |
| 1052–1143 | LOGIN SCREEN |
| 1145–1150 | Variables de thème |
| 1152–1210 | Header |
| 1211–1393 | Drawer de navigation (8 onglets) |
| 1395–1435 | Modale de confirmation + toast + input fichier caché |
| 1446–1510 | Conteneur `max-w-7xl` + barre de module |
| 1515–1840 | **TAB orders** |
| 1842–2471 | **TAB products** (archive, filtres, bulk, cartes, table, pagination) |
| 2473–3180 | **TAB promotions** (3 sous-onglets) |
| 3182–3362 | **TAB banners** (⚠️ bug) |
| 3364–3432 | **TAB shipping** |
| 3434–3522 | **TAB faq** |
| 3524–3719 | **TAB supabase** |
| 3721–3851 | **TAB settings** |
| 3853–3855 | `</main>` + fermeture du conteneur |
| 3856–4108 | **Modale produit** |
| 4109–4112 | Fermetures JSX + `}` |

## F.3 Ce que je n'ai PAS pu déterminer (limites explicites)

| Limite | Raison |
|---|---|
| Valeur réelle de la classe `font-luxury` | définie hors de `page.tsx` (dans `globals.css` / `tailwind.config`) — **non lu**, à récupérer pour une reproduction typographique exacte |
| Contenu de `src/config/site.ts` (`siteConfig`) | non lu — il alimente les seeds du StoreContext (`siteConfig.products`, `.contact`, `.social`, `.shippingZones`, `.editorialBanners`, `.faqs`) |
| Politiques RLS réelles en production | le `supabase_master_schema.sql` n'est qu'un instantané ; la base MG a été modifiée à la main (`site_settings`, `is_archived`, `free_delivery`) |
| Comportement du `upsert` PostgREST sur colonnes absentes | déduit du comportement documenté, non testé contre la base réelle |
| `AdminDashboardPage` n'a **pas** de `generateMetadata()` | ce n'est pas une page publique indexable, cohérent ; à conserver |

---

# G. RÉSUMÉ EXÉCUTIF POUR LA RÉIMPLÉMENTATION

## G.1 Les 10 décisions à prendre avant de coder

1. **Sécurité d'abord** — supprimer le mot de passe en clair (l.268/280) et le bypass `mg_admin_auth` (l.214-221) ; brancher sur une vraie session Supabase Auth avec rôle + `tenant_id`.
2. **Neutraliser `exec_sql`** et remplacer toutes les politiques `USING (true)` par des politiques tenant.
3. **Ajouter `tenant_id`** à `products`, `orders`, `editorial_banners`, `shipping_zones`, `faqs`, `site_backups`, `site_settings` ; **`site_settings` doit devenir `(tenant_id, id)`** au lieu de `id='main'`.
4. **Ajouter les colonnes manquantes** : `products.is_archived`, `products.free_delivery` (absentes du master SQL).
5. **Remplacer le préfixe `mg_`** par un préfixe tenant sur les 5 clés de stockage : `mg_store_cache`, `mg_orders_cache`, `mg_hero_product_id`, `mg_admin_auth`, `mg_admin_active_tab`.
6. **Réparer l'onglet bannières** (lire `localBanners`, pas `banners`) et le commit `sessionStorage` dans `handleLogout`.
7. **Extraire la config de tenant** : `siteConfig` doit piloter le logo, le nom, la ville, la devise, l'arrondi, le libellé du module, et le texte WhatsApp. Aucune de ces valeurs ne doit rester en dur.
8. **Remplacer `alert`/`confirm`** par une couche de dialogues toasts cohérente avec le design (le toast existe déjà : `bg-[#C59B3F] text-[#171513]`).
9. **Remplacer l'upload base64** par un vrai stockage objet (bucket) + URL ; et remplacer les **N upserts séquentiels** par un **RPC/batch** (`upsert_products_bulk`) — sinon les actions groupées resteront lentes et fragiles.
10. **Compléter les CRUD manquants** : ajout/suppression de zone de livraison, réordonnancement FAQ/bannières, pagination de `orders`.

## G.2 Ce qui doit être reproduit **à l'identique** (le client le connaît)

- Fond crème `#FAF8F5`, cartes blanches bordées `#E8DCC2`, encre `#171513`, or `#C59B3F` / `#967120`.
- **Loading screen** : logo 64px qui pulse + « MG PERFUME DAKAR » + spinner doré + « Chargement du tableau de bord... » sur carte `max-w-sm rounded-3xl`.
- **Header** : logo 32px + nom en `font-luxury uppercase` + pastille « Admin » or + bascule thème + « Voir le site » + bouton noir « Onglets & Modules ».
- **Navigation en drawer latéral droit** (`slide-in-from-right`, `max-w-xs`, fond blanc, onglet actif = fond noir + texte blanc, badge vert émeraude animé sur les nouvelles commandes).
- **Toast** : bloc or en bas à droite, texte noir, icône check, 3 s.
- **Cartes produits** : vignette sur boîte blanche, badges superposés (or « ★ Édition Phare », noir « Sélection », crème pour le badge libre), prix en gras + prix barré rouge, deux tuiles de toggle (stock / livraison) et une rangée Archiver · Modifier · Supprimer.
- **Micro-typographie** : `text-[10px] uppercase tracking-wider` en or pour les labels, `text-xs` pour tout le texte, `font-luxury` pour les titres.
- **Pyramide olfactive** (tête / cœur / fond, saisie par virgules) et les 5 familles olfactives.
- **Rythme des 4 badges de commandes** (orange / bleu / violet / vert / rouge) et le bouton WhatsApp `#25D366`.
- **Ordre de grandeur** : conteneur `max-w-7xl`, grilles `sm:grid-cols-2 lg:grid-cols-3`, rayons `2xl`/`3xl`, boutons pilule.

## G.3 Ce qui doit être **corrigé** (et ne sera pas reconnu par le client s'il change)

| Correction | Pourquoi |
|---|---|
| Mode sombre lisible (variables CSS `--ink`, `--surface`, `--border` au lieu de hex en dur) | aujourd'hui ~40 `text-[#171513]` rendent le dark inutilisable |
| Onglet bannières fonctionnel | aujourd'hui non éditable |
| KPI « CA » hors commandes annulées | aujourd'hui faux |
| Filtre méthode couvrant `cod` | aujourd'hui les commandes COD deviennent invisibles |
| Restauration de snapshot **complète** (6 collections + toutes les colonnes) | aujourd'hui elle corrompt `in_stock`/`is_archived`/`free_delivery` |
| Suppression effective (DELETE) des bannières et FAQ | aujourd'hui les suppressions « reviennent » |
| Filtrage des commandes / listes longues | pas de pagination sur 5 onglets |
