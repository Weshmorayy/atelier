#!/usr/bin/env node
/**
 * Phase 0 — Remediação remota do projeto Supabase MG Perfume
 * =============================================================================
 * Executa SQL via Supabase Management API (HTTPS puro, sem binário — o
 * supabase CLI não tem build aarch64 e não roda no Termux).
 *
 * USO
 *   export SUPABASE_ACCESS_TOKEN=sbp_...        # PAT, escopo database:write
 *   node phase0.mjs                            # DRY-RUN (só mostra)
 *   node phase0.mjs --apply                     # aplica de verdade
 *
 * O PAT é criado em https://supabase.com/dashboard/account/tokens
 * (New personal access token, escopo database:write). NUNCA commitar.
 *
 * Depois de aplicado, `exec_sql` deixa de existir: o caminho de administração
 * passa a ser exclusivamente esta Management API, autenticada pelo PAT — que
 * vive só na máquina/CI do agency's, não no bundle do navegador.
 */

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'xnmolqmcfnjvcblizahu'
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN
const APPLY = process.argv.includes('--apply')

const ENDPOINT = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`

if (!TOKEN) {
  console.error('✗ SUPABASE_ACCESS_TOKEN ausente.')
  console.error('  export SUPABASE_ACCESS_TOKEN=sbp_...')
  process.exit(1)
}

async function sql(query) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })

  const text = await res.text()
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 400)}`)
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/** Cada passo = [rótulo, SQL]. Idempotentes quando possível. */
const STEPS = [
  // ── 0. Inventário AVANT (preuve de estado) ────────────────────────────────
  ['Inventaire — comptages avant',
   `select 'products' t, count(*) n from public.products
    union all select 'orders', count(*) from public.orders
    union all select 'faqs', count(*) from public.faqs
    union all select 'banners', count(*) from public.editorial_banners
    union all select 'shipping', count(*) from public.shipping_zones
    union all select 'backups', count(*) from public.site_backups;`],

  // ── 1. Superfície d'exécution de SQL : à supprimer ─────────────────────────
  ['Revogar EXECUTE sobre exec_sql',
   `revoke execute on function public.exec_sql(text) from public, anon, authenticated;`],

  ['Supprimer exec_sql (SECURITY DEFINER)',
   `drop function if exists public.exec_sql(text) cascade;`],

  // ── 2. Supprimer les politiques « Full access » (= USING (true)) ────────────
  ['Retirer les politiques FOR ALL (products)',  `drop policy if exists "Full access products" on public.products;`],
  ['Retirer les politiques FOR ALL (orders)',    `drop policy if exists "Full access orders" on public.orders;`],
  ['Retirer les politiques FOR ALL (banners)',   `drop policy if exists "Full access banners" on public.editorial_banners;`],
  ['Retirer les politiques FOR ALL (shipping)',  `drop policy if exists "Full access shipping" on public.shipping_zones;`],
  ['Retirer les politiques FOR ALL (faqs)',      `drop policy if exists "Full access faqs" on public.faqs;`],
  ['Retirer les politiques FOR ALL (backups)',   `drop policy if exists "Full access backups" on public.site_backups;`],

  ['Retirer les politiques SELECT «:USING (true)» (products)',
   `drop policy if exists "Public read products" on public.products;`],
  ['Retirer les politiques SELECT «USING (true)» (orders)',
   `drop policy if exists "Public select own order" on public.orders;`],
  ['Retirer les politiques SELECT «USING (true)» (banners)',
   `drop policy if exists "Public read banners" on public.editorial_banners;`],
  ['Retirer les politiques SELECT «USING (true)» (shipping)',
   `drop policy if exists "Public read shipping" on public.shipping_zones;`],
  ['Retirer les politiques SELECT «USING (true)» (faqs)',
   `drop policy if exists "Public read faqs" on public.faqs;`],
  ['Retirer les politiques SELECT «USING (true)» (backups)',
   `drop policy if exists "Public read backups" on public.site_backups;`],

  ['Retirer la politique d\'insertion publique des commandes',
   `drop policy if exists "Public insert orders" on public.orders;`],

  // ── 3. Politiques saines : lecture publique restreinte, écriture bloquée ───
  ['Lecture publique — produits, FAQ, zones, bannières',
   `create policy "anon_read_public" on public.products for select to anon using (true);
    create policy "anon_read_public" on public.faqs for select to anon using (true);
    create policy "anon_read_public" on public.shipping_zones for select to anon using (true);
    create policy "anon_read_public" on public.editorial_banners for select to anon using (true);`],

  ['Backups : plus aucun accès public',
   `-- site_backups reste fermé : la lecture publique est supprimée et
    -- l'écriture passe par le service_role (jamais exposé au navigateur).
    create policy "service_only_backups" on public.site_backups for all
      to service_role using (true) with check (true);`],

  ['Commandes : lecture par le service seul (plus de « own order » par ref)',
   `create policy "service_only_orders" on public.orders for all
      to service_role using (true) with check (true);`],

  ['Écriture produits/FAQ/zones/bannières : service_role seulement',
   `create policy "service_write_products" on public.products for all
      to service_role using (true) with check (true);
    create policy "service_write_faqs" on public.faqs for all
      to service_role using (true) with check (true);
    create policy "service_write_shipping" on public.shipping_zones for all
      to service_role using (true) with check (true);
    create policy "service_write_banners" on public.editorial_banners for all
      to service_role using (true) with check (true);`],

  // ── 4. Vérification ────────────────────────────────────────────────────────
  ['Vérification — exec_sql a disparu',
   `select count(*) as exec_sql_restants
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.proname = 'exec_sql';`],

  ['Vérification — politiques restantes',
   `select tablename, policyname, cmd, roles::text
      from pg_policies where schemaname = 'public' order by tablename, policyname;`],
]

;(async () => {
  console.log(`\n  Projet : ${PROJECT_REF}`)
  console.log(`  Mode   : ${APPLY ? '🔴 APPLY (écrit)' : '🟡 DRY-RUN (aucune écriture)'}\n`)

  if (!APPLY) {
    console.log('  Étapes qui seraient exécutées :\n')
    STEPS.forEach(([label], i) => console.log(`   ${String(i + 1).padStart(2)}. ${label}`))
    console.log('\n  Relancer avec --apply pour exécuter.')
    console.log('  ⚠ Faire un dump avant : node phase0.mjs --dump\n')
    return
  }

  let failed = 0
  for (const [i, [label, query]] of STEPS.entries()) {
    process.stdout.write(`   ${String(i + 1).padStart(2)}/${STEPS.length}  ${label} … `)
    try {
      const out = await sql(query)
      console.log('ok')
      if (i === 0 || label.startsWith('Vérification')) {
        console.log('      →', JSON.stringify(out).slice(0, 900))
      }
    } catch (err) {
      failed++
      console.log('ÉCHEC')
      console.log('      →', err.message.slice(0, 500))
    }
  }

  console.log(`\n  ${failed === 0 ? '✓ Terminé.' : `✗ ${failed} étape(s) en échec.`}`)
  console.log('\n  ⚠  ACTIONS MANUELLES, dans cet ordre :')
  console.log('   1. CHANGER LE MOT DE PASSE ADMIN — il est en clair dans le dépôt')
  console.log('      public (page.tsx:268 et :280). À traiter comme divulgué :')
  console.log('      il reste dans l\'historique Git, supprimer la ligne ne suffit pas.')
  console.log('   2. Supprimer les deux blocs de comparaison admin / mot de passe.')
  console.log('   3. Régénérer la clé anon (Dashboard → Project Settings → API),')
  console.log('      puis mettre à jour l\'env de production.')
  console.log('   4. Supprimer le repli clé+URL en dur dans src/lib/supabase.ts.')
  console.log('   5. Vérifier les logs d\'accès Supabase depuis la mise en service.')
  console.log('   6. Aligner le schéma : products.is_archived, products.free_delivery')
  console.log('      et la table site_settings manquent au master schema.')
  process.exit(failed === 0 ? 0 : 1)
})()