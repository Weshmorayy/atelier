import type { Metadata } from 'next'
import { buildLocalBusinessJsonLd } from '@/lib/seo'
import { siteConfig } from '@/config/site'
import './globals.css'

// ─── Métadonnées racine ───────────────────────────────────────────────────────
// Ne pas répéter dans les pages enfants — chaque page a son generateMetadata()

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: 'website',
    locale: 'fr_SN',
    siteName: siteConfig.name,
  },
}

// ─── Layout racine ────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = buildLocalBusinessJsonLd()

  return (
    <html lang="fr">
      <head>
        {/* JSON-LD — Schema.org LocalBusiness */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {/* Header et Footer viennent ici, autour de children */}
        {children}
      </body>
    </html>
  )
}
