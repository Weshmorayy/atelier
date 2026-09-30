import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'

/**
 * generatePageMetadata — Helper SEO pour chaque page
 *
 * Usage dans une page :
 * export const metadata = generatePageMetadata({
 *   title: 'Ventilateurs sur Pied',
 *   description: 'Découvrez notre gamme de ventilateurs...',
 *   path: '/ventilateurs',
 * })
 */

interface PageMetaOptions {
  title: string
  description?: string
  path?: string
  image?: string
  noIndex?: boolean
}

export function generatePageMetadata({
  title,
  description,
  path = '/',
  image,
  noIndex = false,
}: PageMetaOptions): Metadata {
  const fullTitle = `${title} — ${siteConfig.name}`
  const desc = description ?? siteConfig.description
  const url = `${siteConfig.url}${path}`
  const ogImage = image ?? siteConfig.seo.ogImage

  return {
    title: fullTitle,
    description: desc,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: siteConfig.name,
      images: [{ url: ogImage, width: 1200, height: 630, alt: fullTitle }],
      locale: 'fr_SN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: desc,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}

/**
 * JSON-LD — Schéma LocalBusiness
 * Placer dans le layout racine ou la page d'accueil
 */
export function buildLocalBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.contact.address,
      addressLocality: siteConfig.contact.city,
      addressCountry: 'SN',
    },
  }
}
