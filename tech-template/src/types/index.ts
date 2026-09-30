/**
 * types/index.ts — Types partagés du projet
 *
 * Ajouter ici tous les types métier du client
 */

// ─── Produit ─────────────────────────────────────────────────────────────────

export interface Product {
  id: string
  name: string
  ref: string          // Référence fabricant (ex: FS40-1688)
  category: string
  price: number        // Prix en FCFA
  images: string[]     // Chemins relatifs depuis /public
  features: string[]   // Liste des caractéristiques
  inStock: boolean
  badge?: string       // Ex: 'Nouveau', 'Best-seller' — optionnel
}

// ─── Catégorie ───────────────────────────────────────────────────────────────

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  productCount?: number
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export interface NavItem {
  label: string
  href: string
  external?: boolean
}

// ─── SEO ─────────────────────────────────────────────────────────────────────

export interface PageMeta {
  title: string
  description: string
  canonical?: string
}
