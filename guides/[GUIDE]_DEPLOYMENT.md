# [GUIDE] — Déploiement

Guide de référence pour déployer les projets clients. Trois environnements cibles. Chaque projet est compatible avec les trois sans modification de code.

---

## Architecture de Déploiement

Chaque projet supporte deux modes Next.js :

| Mode | Cas d'usage | Commande de build |
|---|---|---|
| `output: 'export'` | Sites 100% statiques, hébergement Hostinger, Netlify | `NEXT_OUTPUT=export npx next build` |
| `output: 'standalone'` | Coolify, Docker, Vercel | `npx next build` |

### Configuration `next.config.mjs` (standard)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NEXT_OUTPUT === 'export' ? 'export' : 'standalone',
  images: {
    unoptimized: process.env.NEXT_OUTPUT === 'export',
  },
  trailingSlash: process.env.NEXT_OUTPUT === 'export',
}

export default nextConfig
```

---

## 1. Vercel (Recommandé pour mise en ligne rapide)

### Setup

1. Connecter le repo GitHub sur [vercel.com](https://vercel.com)
2. Framework : Next.js (auto-détecté)
3. Build command : `npm run build` (ou laisser par défaut)
4. Output : auto (Vercel gère standalone nativement)

### Variables d'environnement

Ajouter dans le dashboard Vercel si nécessaire :
- `NEXT_PUBLIC_SITE_URL` : URL de production (ex: `https://monsite.com`)

### Domaine custom

1. Acheter le domaine (Namecheap, Gandi, etc.)
2. Dans Vercel → Settings → Domains → ajouter le domaine
3. Configurer les DNS chez le registrar selon les instructions Vercel

### Avantages
- Zero config, déploiement en 2 min
- SSL automatique
- Preview URLs pour chaque PR/push
- CDN global

---

## 2. Coolify (Self-hosted, recommandé pour contrôle total)

### Prérequis

- VPS avec Coolify installé (Ubuntu 22.04 recommandé)
- Au moins 1 GB RAM, 20 GB stockage
- Coolify accessible sur le VPS

### Déploiement

**Méthode GitHub (recommandée) :**

1. Dans Coolify → New Resource → Application
2. Source : GitHub → sélectionner le repo
3. Build Pack : **Nixpacks** (détecte Next.js automatiquement) ou **Dockerfile**
4. Port : `3000`
5. Environment variables :
   ```
   NEXT_PUBLIC_SITE_URL=https://mondomaine.com
   ```

**Méthode Dockerfile :**

Chaque projet contient un `Dockerfile` multi-stage :

```dockerfile
# Stage 1 — Deps
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2 — Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3 — Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### Domaine dans Coolify

1. Settings → Domains → ajouter le domaine
2. SSL : Let's Encrypt automatique (cocher "Generate SSL")
3. Force HTTPS : oui

---

## 3. Hostinger VPS (Statique via NGINX)

Pour les sites 100% statiques sans serveur Node.

### Build

```bash
NEXT_OUTPUT=export npx next build
# Les fichiers sont dans le dossier /out
```

### NGINX Config (fichier `nginx.conf` à la racine du projet)

```nginx
server {
    listen 80;
    server_name mondomaine.com www.mondomaine.com;
    root /var/www/html;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/css application/javascript image/svg+xml;

    # Cache statique
    location ~* \.(js|css|png|jpg|jpeg|webp|svg|ico|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Fallback
    location / {
        try_files $uri $uri.html $uri/index.html =404;
    }

    # 404 custom
    error_page 404 /404.html;
}
```

### Déploiement manuel

```bash
# Build local
NEXT_OUTPUT=export npx next build

# Copier sur le VPS
rsync -avz --delete out/ user@vps-ip:/var/www/html/

# Reload NGINX
ssh user@vps-ip "sudo nginx -t && sudo systemctl reload nginx"
```

---

## Checklist Pré-Déploiement

- [ ] `next build` passe sans erreur
- [ ] `tsc --noEmit` passe sans erreur
- [ ] Variables d'environnement configurées sur la plateforme
- [ ] Domaine configuré et DNS propagé
- [ ] SSL actif (HTTPS)
- [ ] `sitemap.xml` accessible à `/sitemap.xml`
- [ ] `robots.txt` accessible à `/robots.txt`
- [ ] Open Graph image visible (tester sur [opengraph.xyz](https://www.opengraph.xyz))
- [ ] Site testé sur mobile (iOS + Android)
- [ ] Toutes les images chargent correctement

---

## Après la Mise en Ligne

1. Soumettre le sitemap à Google Search Console
2. Tester les Core Web Vitals sur [PageSpeed Insights](https://pagespeed.web.dev)
3. Vérifier les schémas JSON-LD sur [Rich Results Test](https://search.google.com/test/rich-results)
4. Mettre à jour `PROJECTS_INDEX.md` avec le statut "✅ Livré"
