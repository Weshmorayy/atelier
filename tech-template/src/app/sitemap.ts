import { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'

/**
 * sitemap.ts — Sitemap dynamique Next.js App Router
 *
 * Ajouter les routes statiques ici.
 * Pour les routes dynamiques (produits), étendre avec les slugs réels.
 */

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url

  // Routes statiques — à adapter selon les pages du projet
  const staticRoutes = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/catalogue', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
  ]

  return staticRoutes.map(({ path, priority, changeFrequency }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }))
}
