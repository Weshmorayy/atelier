#!/usr/bin/env node
/**
 * extract-mg.mjs — Extraction STRICTEMENT LECTURE du catalogue MG Perfume.
 *
 * ⚠ Cette extraction ne modifie ne modifie RIEN. Uniquement des GET vers l'API publique.
 *   Aucune écriture, aucun DELETE, aucun RPC d'écriture. Le site en ligne
 *   continue de fonctionner exactement pareil pendant et après l'extraction.
 *
 *   C'est possible parce que les politiques RLS actuelles autorisent la lecture
 *   publique (`FOR SELECT USING (true)`) — c'est-à-dire que ces données sont
 *   déjà exposées publiquement. La migration ne rend rien public qui ne l'était.
 *
 * USAGE
 *   node extract-mg.mjs > mg-data.json
 *   node extract-mg.mjs --sql > mg-seed.sql
 *
 * Sortie : produits, FAQ, zones de livraison, bannières — avec le schéma cible
 * de la plateforme, pour un seed direct.
 */

const SUPABASE_URL = process.env.MG_SUPABASE_URL ?? 'https://xnmolqmcfnjvcblizahu.supabase.co'
const ANON_KEY = process.env.MG_SUPABASE_ANON_KEY
const TENANT = process.env.MG_TENANT ?? 'mg-perfume'

if (!ANON_KEY) {
  console.error('✗ MG_SUPABASE_ANON_KEY manquant.')
  console.error('  export MG_SUPABASE_ANON_KEY=eyJ...')
  process.exit(1)
}

const TABLES = [
  'products',
  'faqs',
  'shipping_zones',
  'editorial_banners',
]

/** GET pur. Aucune méthode d'écriture n'est importée dans ce fichier. */
async function fetchTable(table) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=*`
  const res = await fetch(url, {
    method: 'GET',
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
  })
  if (!res.ok) {
    throw new Error(`${table} : HTTP ${res.status} ${await res.text()}`)
  }
  return res.json()
}

const q = (v) => (v === null || v === undefined || v === ''
  ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`)
const j = (v) => `${JSON.stringify(v ?? {}).replace(/'/g, "''")}::jsonb`

/**
 * Conversion du schéma MG vers le schéma de la plateforme.
 *
 * Ce qui n'a pas d'équivalent direct est conservé dans `specs` plutôt que
 * perdu : les notes olfactives sont la signature du catalogue MG, et les
 * écarter reviendrait à appauvrir le produit.
 */
function mapProduct(p, index) {
  const specs = {
    ...(p.ref ? { 'Référence': p.ref } : {}),
    ...(p.volume ? { 'Volume': p.volume } : {}),
    ...(p.family ? { 'Famille olfactive': p.family } : {}),
    ...(p.category_label ? { 'Type': p.category_label } : {}),
    ...(Array.isArray(p.top_notes) && p.top_notes.length
      ? { 'Notes de tête': p.top_notes.join(', ') } : {}),
    ...(Array.isArray(p.heart_notes) && p.heart_notes.length
      ? { 'Notes de cœur': p.heart_notes.join(', ') } : {}),
    ...(Array.isArray(p.base_notes) && p.base_notes.length
      ? { 'Notes de fond': p.base_notes.join(', ') } : {}),
  }

  return {
    slug: p.id ?? `produit-${index + 1}`,
    name: p.name,
    brand: p.brand ?? null,
    price: Number(p.price ?? 0),
    compareAt: p.original_price != null ? Number(p.original_price) : null,
    image: p.image ?? null,
    imageAlt: null,
    shortDesc: p.tagline || p.description?.slice(0, 300) || null,
    description: p.description ?? null,
    badge: p.badge ?? null,
    categorySlug: p.family ? slugify(p.family) : null,
    inStock: p.in_stock !== false,
    isActive: p.is_archived !== true,
    isFeatured: p.is_popular === true || p.is_hero === true,
    specs,
    features: [p.tagline, p.description?.slice(0, 160)].filter(Boolean),
  }
}

function slugify(s) {
  return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

;(async () => {
  const out = { tenant: TENANT, extractedAt: new Date().toISOString(), data: {} }

  for (const table of TABLES) {
    process.stderr.write(`  lecture ${table}… `)
    try {
      out.data[table] = await fetchTable(table)
      process.stderr.write(`${out.data[table].length} ligne(s)\n`)
    } catch (err) {
      process.stderr.write(`ÉCHEC — ${err.message}\n`)
      out.data[table] = []
    }
  }

  if (!process.argv.includes('--sql')) {
    process.stdout.write(JSON.stringify(out, null, 2))
    process.stderr.write('\n✓ JSON écrit sur stdout. Aucune écriture effectuée.\n')
    return
  }

  const products = (out.data.products ?? []).map(mapProduct)
  const cats = [...new Set(products.map((p) => p.categorySlug).filter(Boolean))]
  const modules = ['settings', 'categories', 'products', 'banners', 'media', 'leads', 'faq']

  const sql = `-- Généré par extract-mg.mjs --sql — LECTURE SEULE sur la source.
-- ${products.length} produit(s), ${out.data.faqs?.length ?? 0} FAQ.
-- Appliqué sur la NOUVELLE base uniquement ; la base MG reste intacte.

BEGIN;

INSERT INTO tenants (slug, name, status, locale, modules, theme)
VALUES (${q(TENANT)}, 'MG Perfume', 'active', 'fr',
        ${q(JSON.stringify(modules))}::jsonb,
        ${q(JSON.stringify({
          preset: 'mg-perfume',      // thème reconstitué à l'identique
          label: 'MG Perfume',
          logo: '/images/brand/logo.png',
          tagline: 'MG Perfume Dakar',
        }))}::jsonb)
ON CONFLICT (slug) DO UPDATE SET modules = EXCLUDED.modules,
                                 theme = EXCLUDED.theme,
                                 updated_at = now();

${cats.map((c, i) => `
INSERT INTO categories (tenant_id, slug, label, position)
SELECT t.id, ${q(c)}, ${q(c)}, ${i} FROM tenants t WHERE t.slug = ${q(TENANT)}
ON CONFLICT (tenant_id, slug) DO UPDATE SET label = EXCLUDED.label;`).join('\n')}

INSERT INTO products
  (tenant_id, slug, name, brand, price, compare_at, image, short_desc, description,
   badge, category_label, in_stock, is_active, is_featured, specs, features, published_at)
SELECT t.id, p.*::text[]
FROM tenants t
CROSS JOIN (VALUES
${products.map((p) => `  (${[
  q(p.slug), q(p.name), q(p.brand), p.price, p.compareAt, q(p.image),
  q(p.shortDesc), q(p.description), q(p.badge), q(p.categorySlug),
  p.inStock ? 'true' : 'false', p.isActive ? 'true' : 'false',
  p.isFeatured ? 'true' : 'false', j(p.specs),
  `ARRAY[${(p.features ?? []).map(q).join(', ')}]::text[]`,
  'now()',
].join(', ')})`).join(',\n')}
) AS p(slug, name, brand, price, compare_at, image, short_desc, description,
       badge, category_label, in_stock, is_active, is_featured, specs, features, published_at)
WHERE t.slug = ${q(TENANT)}
ON CONFLICT (tenant_id, slug) DO UPDATE
  SET name = EXCLUDED.name, price = EXCLUDED.price, image = EXCLUDED.image,
      badge = EXCLUDED.badge, specs = EXCLUDED.specs, updated_at = now();

${(out.data.faqs ?? []).map((f, i) => `
INSERT INTO faqs (tenant_id, question, answer, position)
SELECT t.id, ${q(f.question)}, ${q(f.answer)}, ${i} FROM tenants t WHERE t.slug = ${q(TENANT)}
ON CONFLICT DO NOTHING;`).join('\n')}

COMMIT;
`

  process.stdout.write(sql)
  process.stderr.write(`\n✓ SQL écrit. ${products.length} produits. Aucune écriture sur la source.\n`)
})()