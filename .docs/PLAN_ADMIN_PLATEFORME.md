# Plan — Portail d'administration partagé multi-clients

> Cible : **un seul projet d'administration**, branchable sur n'importe quel site
> client, piloté depuis une console superadmin. Priorité donnée à Continental.

---

## 0. Principes de conception

1. **Le navigateur ne décide de rien.** Toute écriture passe par une route serveur
   authentifiée. La clé de base de données n'existe que côté serveur.
2. **Un dépôt, aucune duplication.** Le code n'est pas forké par client ; ce qui
   varie passe par la base (contenu) ou par un fichier de configuration typé.
3. **Aucun secret dans le bundle.** Pas de clé Supabase en `NEXT_PUBLIC_*` côté
   site public.
4. **Chaque mutation est traçable.** Audit écrit dans la même transaction.
5. **Français d'abord**, y compris l'interface d'administration.

---

## 1. Positionnement des dépôts

```
atelier/
├── atelier-admin/          ← NOUVEAU. Portail unique, tous clients.
│   ├── (app) admin UI + API
│   ├── core/               ← socle partagé : auth, db, modules, audit
│   └── modules/            ← un dossier par module activable
├── continental-website/    ← site client, devient « mince »
└── mgperfume-website/      ← à migrer
```

Le site client ne contient **plus** de logique métier : il consomme le contenu.

---

## 2. Modèle de données (Postgres)

Un schéma partagé, `tenant_id` sur **toutes** les tables métier.

```sql
tenants          (id, slug, name, domain, status, theme jsonb, modules jsonb,
                  locale, created_at)
tenant_domains   (tenant_id, domain, primary)
products         (tenant_id, slug, name, brand, price, …)
product_images   (tenant_id, product_id, url, alt, position)
categories       (tenant_id, kind, slug, label)     -- produit, blog, page
banners          (tenant_id, slot, title, subtitle, image, cta, active, order)
pages            (tenant_id, slug, title, blocks jsonb, seo jsonb, published_at)
faqs             (tenant_id, question, answer, position)
blog_posts       (tenant_id, slug, title, excerpt, body, status, published_at,
                  cover, author_id)
site_settings    (tenant_id, contact jsonb, social jsonb, hours jsonb, seo jsonb,
                  payments jsonb, delivery jsonb)
leads            (tenant_id, kind, name, phone, message, payload jsonb, status)
media            (tenant_id, key, url, width, height, mime, size, folder)
audit_events     (tenant_id, actor_id, entity, entity_id, action, before, after, ip)
site_events      (tenant_id, path, event, meta jsonb, day)
```

### Isolation : RLS forcée

```sql
ALTER TABLE products FORCE ROW LEVEL SECURITY;   -- sans FORCE, le propriétaire contourne
CREATE POLICY tenant_isolation ON products
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
```

Le `tenant_id` est set **une fois par requête**, dérivé de la session (jamais de
l'input), via un wrapper Drizzle. En plus d'un helper applicatif, pour que les
erreurs soient lisibles.

Règle non négociable : **RLS échoue ouverte si l'application se connecte en
propriétaire des tables.** D'où `FORCE ROW LEVEL SECURITY` + un rôle applicatif
dédié. C'est l'erreur classique que je veux éviter dès le départ.

---

## 3. Système de modules

Le point central : *tous les sites ne ont pas besoin de tout*.

### Les types vivent dans le code

```ts
// modules/registry.ts
export interface ModuleDef {
  key: 'products' | 'blog' | 'faq' | 'banners' | 'leads' | 'orders'
      | 'media' | 'pages' | 'analytics' | 'payments';
  label: string;                        // « Produits »
  icon: string;
  tables: string[];                     // tables SQL utilisées
  permissions: Permission[];            // permissions requises
  adminRoutes: string[];                // chemins du back-office
  clientSlots: string[];                // emplacements rendus côté site
  requires?: ModuleKey[];               // ex. orders ⇒ products
}
```

### L'activation vit dans la base

`tenants.modules jsonb` = `["products","blog","faq"]`.

**Un seul drapeau pilote tout :** la navigation du back-office, l'enregistrement
des routes API, les politiques RLS générées, les slots rendus côté site. Pas de
`if (tenant.slug === 'x')` dispersé dans le code.

La console superadmin active/désactive par tenant, en cochant.

> Point d'attention : la liste des modules est statique en code (migrations,
> types, permissions doivent exister au build), mais l'**activation** est
> dynamique. Désactiver un module ne doit pas nécessiter de redéploiement.

---

## 4. Utilisateurs, rôles et superadmin

Auth : **Better Auth** (auto-hébergé, Postgres). Rappel : NextAuth est passé en
maintenance (récupéré par Better Auth en sept. 2025), Lucia est déprécié.

Une **organisation = un site client**.

| Rôle | Portée | Peut |
|---|---|---|
| `superadmin` (agence) | tous les tenants | tout, y compris facturation, suspension, suppression |
| `owner` | 1 tenant | tout sur son site, y compris modules et utilisateurs |
| `manager` | 1 tenant | contenu + commandes, pas les réglages du site |
| `editor` | 1 tenant | contenus assigned, publication, pas les prix |
| `viewer` | 1 tenant | lecture seule |

Permissions en statements, vérifiées **côté serveur** uniquement :

```ts
await auth.api.hasPermission({ permissions: { products: ['update'] } });
```

Le staff agence est `owner` sur chaque org client + drapeau `superadmin` pour la
vue transverse.

---

## 5. Journal d'audit

Table unique `audit_events`, **append-only**, écrite dans la même transaction que
la mutation.

```ts
await db.transaction(async (tx) => {
  const before = await tx.select().from(products).where(...);
  const after  = await tx.update(products).set(patch).returning();
  await tx.insert(auditEvents).values({
    tenantId: ctx.tenantId,            // jamais depuis l'input
    actorId: session.user.id, action: 'update',
    entity: 'product', entityId: id,
    before, after, ip: req.ip, ua: req.ua,
  });
});
```

- déclencheurs `BEFORE UPDATE/DELETE/TRUNCATE` → `RAISE EXCEPTION` (immuabilité) ;
- partitionnement mensuel `RANGE (created_at)` ;
- assainissement des clés `password` / `token` / `secret` ;
- vue superadmin transverse, avec export CSV.

---

## 6. Blog

`blog_posts` + `blog_categories` + `blog_tags`, statuts `draft` / `scheduled` /
`published`, couverture, auteur, `published_at` programmable, aperçu automatique,
slug automatique, OpenGraph auto. Sitemap et JSON-LD `Article`.

---

## 7. Statistiques

Deux sources complémentaires :

1. **Trafic** — Umami auto-hébergé (Postgres, pas de ClickHouse), une ligne par
   site client, tableau de bord embarqué dans le back-office. Sans cookies →
   conformité triviale (autorité compétente au Sénégal : APDP, pas la CNIL).
2. **Conversion** — table `site_events` maison : clic WhatsApp, ajout au panier,
   commande démarrée. Ces chiffres sont le vrai intérêt pour un commerçant, et
   ils restent disponibles même si Umami tombe.

---

## 8. Médias

Stockage S3-compatible (Cloudflare R2 en priorité : 10 Go gratuits, **egress
gratuit** ; MinIO en auto-hébergé strict). Téléversement par **URL pré-signée**,
clé en `crypto.randomUUID()` — jamais le nom d'origine. Dérivés générés au
téléversement avec `sharp` (320/640/1280/1920 + WebP/AVIF + blur placeholder),
plutôt qu'à la requête.

---

## 9. Comment un site client se branche

C'est la pièce qui répond à « brancher sur n'importe quel site ».

### Le principe

Un seul mécanisme, deux modes, selon l'hébergement du client :

```ts
// core/content.ts — le SEUL point d'accès au contenu
export async function getSiteContent(tenant: string): Promise<SiteContent>
```

- **mode `build`** — récupéré au build (SSG). L'enregistrement admin déclenche un
  *deploy hook* Coolify → rebuild. SEO maximal, hébergement statique possible.
  **Recommandé par défaut** : ce sont des sites vitrines/catalogue, la performance
  et l'indexation priment sur la mise à jour à la seconde.
- **mode `live`** — récupéré en Server Component (SSR). Mise à jour immédiate,
  exige un serveur Node (Docker).

Le site client ne stocke plus son contenu : il **le rend**.

### Ce qui reste dans le dépôt du site client

Ce qui est structurel, pas éditorial : layout, sections, composants, styles.
Un `site.config.ts` par client déclare le tenant, le mode et les modules attendus.

### Personnalisation par client

`tenants.theme jsonb` alimente un générateur de variables CSS au build :
logo, couleurs, typographies, rayons. C'est ainsi qu'**une seule base de code**
produit N identités visuelles différentes — sans fork.

### Le thème d'administration est lui aussi par client

Contrainte explicite : **le design actuel du back-office MG Perfume doit être
conservé**, son client le connaît déjà et le réapprendre serait une régression.

Le back-office n'est donc pas « une seule UI pour tout le monde » mais
**une UI unique, thémable par tenant**. On extrait le langage visuel du portail
MG (palette, rayons, typographie, composants, écran de chargement) pour en faire
un thème versionné : `themes/mg-perfume`. Continental utilisera le thème par
défaut, lui aussi dérivé de son propre site.

Les admin portails sont donc traités comme des **assets de design versionnés**,
pas comme du code éphémère. Toute évolution doit rester opt-in par tenant, sans
jamais casser le rendu connu du client.

---

## 9 bis. Tout se fait à distance

Règle de travail : **tout ce qui peut être exécuté à distance, l'est.**

- Pas de `supabase db push` local → SQL via la [Management API](https://supabase.com/docs/reference/api/v1-run-a-query)
  (`POST /v1/projects/{ref}/database/query`, scope `database:write`) : HTTPS pur,
  fonctionne sur n'importe quel OS, scriptable et rejouable.
- Pas de clic manuel dans le dashboard quand un script fait le même travail.
- Les jetons vivent dans l'environnement ou un gestionnaire de secrets, jamais
  dans le dépôt ni dans le bundle.
- Les migrations sont des fichiers `.sql` versionnés, appliqués par script, avec
  vérification après coup. Cela corrige aussi la dette MG où le schéma était
  réappliqué à la main (incident `is_hero` manquant).

`atelier/.ops/` regroupe ces scripts d'exploitation, un dossier par intervention.

---

## 10. Phases

| Phase | Contenu | Sortie |
|---|---|---|
| **0** | Sécuriser la base MG Perfume — script remote Management API | base saine, `exec_sql` supprimé |
| **1** | Socle : repo, Postgres, Better Auth, tenants, RLS forcée, audit | admin vide mais sûr |
| **2** | Modules cœur : produits, réglages/contacts, bannières, FAQ, médias | back-office exploitable |
| **3** | **CONTINENTAL — site pilote** | premier client branché et vérifié |
| **4** | Commandes + WhatsApp + PayTech (repris de MG) | monétisation |
| **5** | Blog + statistiques + console superadmin + thèmes | polyvalence |
| **6** | MG Perfume devient le tenant n°1 — **en conservant son design d'admin** | plateforme unique |

**Continental passe avant MG.** C'est le client pilote : il valide l'architecture
sur un vrai site avant tout investissement sur les modules secondaires. MG
n'est touché qu'après, une fois le socle prouvé.

La Phase 0 reste prioritaire et indépendente : c'est une faille active, elle ne
dépend pas de l'ordre du reste.

---

## 11. Décisions prises et à trancher

**Déjà tranché :**

1. **Phase 0 immédiatement**, exécutée à distance via la Management API. Script
   prêt dans `.ops/phase0-mgperfume/phase0.mjs` ; il ne faut qu'un PAT à scope
   `database:write`.
2. **Continental d'abord**, comme site pilote. MG Perfume ensuite.
3. **Le design d'administration de MG est conservé** → thème versionné par tenant.
4. **Content mode `build`** pour Continental, avec deploy hook Coolify.
5. **Tout à distance** : scripts versionnés, pas de clic manuel, pas de binaire local.

**À trancher ensuite :**

- **Stockage média** — Cloudflare R2 (recommandé : egress gratuit) ou MinIO
  auto-hébergé ? Cela conditionne la Phase 2.
- **Hébergement de l'admin** — même VPS Coolify que les sites, ou déploiement
  séparé avec son propre domaine ?
- **MG : migration des données** — produits, commandes, FAQ, zones et PayTech
  proviennent de l'existant. On migrer en une passe, ou on repart d'une base
  neuve en réimportant uniquement le catalogue ?

---

## 12. Hors périmètre pour l'instant

- Paiement en ligne multi-devises (PayTech Sénégal d'abord, réutilisé)
- E-mail transactionnel (à brancher quand il y a de vraies commandes)
- Application mobile

---

## Références consultées

- [Payload multi-tenant plugin](https://payloadcms.com/docs/plugins/multi-tenant) · [Payload plugins](https://payloadcms.com/docs/plugins/overview)
- [Strapi multi-tenancy — un deployment par client](https://strapi.io/blog/multi-tenancy-in-strapi-a-comprehensive-guide)
- [MakerKit — architecture multi-tenant et RLS](https://makerkit.dev/blog/tutorials/multi-tenant-saas-architecture)
- [sovereign-audit-log — RLS FORCE et bypass](https://github.com/philtyp/sovereign-audit-log)
- [Auth.js rejoint Better Auth, NextAuth en maintenance](https://better-auth.com/blog/authjs-joins-better-auth) · [discussion NextAuth](https://github.com/nextauthjs/next-auth/discussions/13252)
- [Lucia déprécié](https://lucia-auth.com/lucia-v3/migrate)
- [Better Auth — plugin organization](https://better-auth.com/docs/plugins/organization)
- [Prisma — statut des versions et fin d'Accelerate](https://www.prisma.io/docs/prisma-orm/release-status) · [Accélérate hors service](https://www.prisma.io/docs/accelerate/keep-your-database)
- [Umami releases](https://github.com/umami-software/umami/releases) · [Umami self-host](https://umami.is/docs/guides/running-on-nodejs)
- [Cloudflare R2 — prix](https://developers.cloudflare.com/r2/pricing/)
- [MinIO — téléversement navigateur par URL pré-signée](https://minio.community/community/minio-object-store/integrations/presigned-put-upload-via-browser.html)
- [AuditKit — patterns d'audit multi-tenant](https://auditkit.dev/blog/multi-tenant-audit-logging-patterns)
