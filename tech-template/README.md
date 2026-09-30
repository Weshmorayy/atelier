# Atelier — Template Technologique

> **Usage** : Ce dossier n'est pas un projet client. C'est le socle de démarrage réutilisable pour chaque nouveau site Next.js. Copier, ne jamais modifier directement.

## Ce que ce template contient

- Next.js 14+ App Router + TypeScript strict
- Tailwind CSS configuré avec variables CSS (palette à remplir)
- ESLint + Prettier configurés
- Structure de dossiers Atelier (config/, components/, lib/, types/)
- `site.ts` vide prêt à remplir
- SEO helpers (generateMetadata, sitemap, robots)
- WhatsApp order URL builder (pour boutiques)
- Lucide React installé
- next.config.mjs avec options standalone + optimisation images

## Comment utiliser

```bash
# Dans le dossier atelier, créer le projet
mkdir continental-website
cp -r tech-template/. continental-website/
cd continental-website
npm install
```

Ensuite :
1. Remplir `src/config/site.ts` avec les données du client
2. Remplir `src/app/globals.css` avec la palette validée
3. Coder les sections selon le plan design approuvé
