/**
 * site.ts — Source unique de vérité des données métier
 *
 * RÈGLES :
 * - Toutes les données visibles sur le site viennent d'ici
 * - Aucune donnée inventée — attendre les vraies informations du client
 * - Ne jamais hardcoder de données dans les composants
 */

export const siteConfig = {
  // ─── Identité ────────────────────────────────────────────────
  name: 'NomClient',           // ← Remplacer
  tagline: '',                  // ← Remplacer (slogan validé avec le client)
  description: '',              // ← Remplacer (description SEO ~150 chars)
  url: 'https://example.com',  // ← Remplacer

  // ─── Contact ─────────────────────────────────────────────────
  contact: {
    phone: '',                  // ← Remplacer
    whatsapp: '',               // ← Remplacer (avec indicatif : 221XXXXXXXXX)
    email: '',                  // ← Remplacer
    address: '',                // ← Remplacer (adresse exacte)
    neighborhood: '',           // ← Remplacer (quartier)
    city: 'Dakar',              // ← Adapter
    country: 'Sénégal',
  },

  // ─── Réseaux sociaux ─────────────────────────────────────────
  social: {
    facebook: '',               // ← Remplacer (URL complète)
    instagram: '',              // ← Remplacer
    tiktok: '',                 // ← Remplacer si pertinent
  },

  // ─── Horaires ────────────────────────────────────────────────
  hours: {
    weekdays: '',               // ← Ex: '8h – 20h'
    saturday: '',               // ← Ex: '9h – 18h'
    sunday: '',                 // ← Ex: 'Fermé'
  },

  // ─── Paiements ───────────────────────────────────────────────
  payments: {
    wave: false,                // ← true si accepté
    orangeMoney: false,         // ← true si accepté
    freeMoney: false,           // ← true si accepté
    cash: true,                 // ← presque toujours true
  },

  // ─── Livraison (pour boutiques) ──────────────────────────────
  delivery: {
    available: false,           // ← true si livraison proposée
    zones: [],                  // ← Ex: ['Dakar', 'Guédiawaye']
    freeFrom: 0,                // ← Montant minimum pour livraison gratuite (FCFA)
  },

  // ─── SEO ─────────────────────────────────────────────────────
  seo: {
    keywords: [],               // ← Mots-clés métier en français
    ogImage: '/og-image.jpg',  // ← Créer une image 1200x630
    twitterHandle: '',          // ← Si compte Twitter/X
  },
}

export type SiteConfig = typeof siteConfig
