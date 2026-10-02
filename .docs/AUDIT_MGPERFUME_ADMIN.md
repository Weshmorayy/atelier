# Audit — Portail d'administration MG Perfume

Analyse du repo `Weshmorayy/mgperfume-website`, fichiers lus :
`supabase_master_schema.sql`, `src/app/admin/page.tsx`, `src/lib/supabase.ts`,
`src/context/StoreContext.tsx`, `ProjectInfo/Tasks/[004]…`, `ProjectInfo/Issues/[002]…`,
`README.md`, `AGENTS.md`.

> Aucune connexion n'a été tentée sur la base de production. Ceci est une lecture
> statique du code et du SQL.

---

## 🔴🔴 CRITIQUE — mot de passe admin en clair dans un dépôt public

Analyse complète du portail : `src/app/admin/page.tsx`, 4 112 lignes lues
intégralement. Spécification dans `SPEC_ADMIN_MG.md`.

**`src/app/admin/page.tsx:268` et `:280`** — deux chemins de code distincts :

```ts
if (cleanLogin === 'admin' && cleanPass === 'MG@D4k4r-Parfum!2026') {
  setIsAuthenticated(true);
  localStorage.setItem('mg_admin_auth', 'true');
  sessionStorage.setItem('mg_admin_auth', 'true');
  return;
}
```

Le mot de passe administrateur du portail est **écrit en clair dans le bundle
navigateur**, publié sur un dépôt public. Il contourne même l'authentification
Supabase : il fonctionne même lorsque `supabase === null`.

À cela s'ajoute le contournement total par `localStorage.mg_admin_auth='true'`
(l.214-221) — drapeau sans expiration, vérifiable en une ligne dans les DevTools.

Combiné aux politiques `USING (true)` (§ plus bas) et à `exec_sql` accessible au
public, l'administration complète est accessible à **quiconque sait lire un dépôt
public**.

### Action n°1, avant tout le reste

1. **Changer ce mot de passe immédiatement** — partout où il est réutilisé.
2. Le supprimer du dépôt : il restera dans l'historique Git. **Traiter comme
   divulgué**, pas comme à dissimuler. Rotation par le client ; ne pas se
   contenter de supprimer la ligne.
3. Supprimer les deux blocs `if (cleanLogin === 'admin' && …)` (l.268, l.280).
4. `git filter-repo` / rotation de l'historique si le dépôt doit rester public
   — à acter avec le client, car cela réécrit les commits.

---

## 🔴 Faille fonctionnelle — l'onglet Bannières est inopérant

`page.tsx:3213` (lecture) vs `:3238` (écriture) :

- la liste lit `banners` depuis le contexte ;
- **toutes** les écritures vont dans un état local `localBanners`.

Conséquence : champs inline figés, bouton supprimer sans effet, ajout invisible,
upload d'image sans effet. Seul « Enregistrer les bannières » (qui persiste
`display_order`) produit un effet. `shipping`, `faq` et `settings` utilisent le
bon motif — l'erreur est isolée à cet onglet.

## 🔴 La restauration de snapshot corrompt le catalogue

L'onglet `supabase` (en réalité un centre sauvegarde/restauration) n'écrit que
la table `products`, et **omet** `in_stock`, `is_archived` et `free_delivery` :
restaurer un snapshot remet donc en rupture et désarchive des produits.
Symétriquement, l'export sort 6 collections mais l'import n'en lit qu'une.

De plus, le DDL affiché (100 lignes figées dans le composant) est **périmé** et
divergent du `supabase_master_schema.sql`.

## ⚠️ Schéma SQL incomplet

`supabase_master_schema.sql` ne définit pas :

- `products.is_archived` — utilisé par l'onglet Catalogue (sous-onglet Archivé) ;
- `products.free_delivery` — utilisé par les produits et la restauration ;
- la table `site_settings` — où l'onglet Contact & Réseaux écrit ses 7 champs.

L'application fonctionne donc contre un schéma **différent** de celui versionné.
C'est la cause structurelle de l'incident `[002]`.

## ✅ Ce qui est réellement réutilisable

Sur les 4 112 lignes : **≈ 3 750 (91 %) génériques** — coquille, écran de
chargement, header, tiroir, toasts, modale produit, CRUD éditorial, recherche +
filtres + tri, vues cartes/liste, sélection multiple et actions groupées,
pagination, upload, gestion des commandes, snapshots.

≈ 350 lignes spécifiques à MG : identité (logo, titres, compte admin), et
≈ 150 lignes de vocabulaire parfum (familles olfactives, pyramide tête/cœur/fond,
« Eau de Parfum », « Flacon »), et ≈ 80 lignes Dakar (zones, PayTech, preset
« Exclusivité Dakar »).

**Conclusion : le portail est récupérable.** Il ne faut pas le jeter, il faut le
transporter — en corrigeant la sécurité et en remplaçant la partie domaine.

---

## 🔴 URGENT — la base MG Perfume est publiquement modifiable

Ce point n'est pas une dette technique, c'est une faille exploitable aujourd'hui.

### 1. `exec_sql` = exécution de SQL arbitraire par n'importe qui

`supabase_master_schema.sql:124`

```sql
CREATE OR REPLACE FUNCTION public.exec_sql(query text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN EXECUTE query; … END; $$;
```

Trois faits se combinent :

- `SECURITY DEFINER` → s'exécute avec les droits du propriétaire, **RLS ignoré** ;
- aucun `GRANT`/`REVOKE` dans le fichier → hérite du `PUBLIC EXECUTE` par défaut
  de Supabase sur le schéma `public` (donc `anon` et `authenticated`) ;
- la clé `anon` est **publique par conception** et embarquée dans le bundle
  navigateur.

Il suffit donc, sans compte et sans mot de passe :

```bash
curl -X POST "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $ANON_KEY" -H "Content-Type: application/json" \
  -d '{"query":"select * from public.orders"}'
```

pour lire les commandes clients (nom, téléphone, quartier), vider les produits,
ou supprimer les tables. La fonction doit être **supprimée**, pas corrigée.

### 2. Les 6 tables sont en `USING (true)`

```sql
CREATE POLICY "Full access products" ON public.products FOR ALL USING (true);
CREATE POLICY "Full access orders"   ON public.orders   FOR ALL USING (true);
CREATE POLICY "Full access backups"  ON public.site_backups FOR ALL USING (true);
```

`USING (true)` = lecture **et** écriture pour tout le monde, via l'API REST
publique. Chaque politique « publique en lecture » est immédiatement annulée par
la politique « Full access » juste en dessous — les deux étant en `PERMISSIVE`,
elles s'appliquent en OR.

### 3. `site_backups` est publiquement lisible

Cette table contient `contact_data`, `social_data`, `shipping_data` — des
informations commerciales et des identifiants sociaux.

### 4. L'authentification admin est un drapeau `localStorage`

`src/app/admin/page.tsx:214-284`

```ts
localStorage.setItem('mg_admin_auth', 'true');
```

C'est la seule source de vérité côté client. Un tiers ouvre les DevTools, tape
la ligne, et l'interface d'administration s'affiche. L'UI se déverrouille même si
les données restent (pour l'instant) accessibles à tout le monde (§2).

### 5. `supabaseAdmin` retombe sur la clé `anon`

`src/lib/supabase.ts:18-20`

```ts
export const supabaseAdmin = (isSupabaseConfigured && serviceRoleKey)
  ? createClient(supabaseUrl, serviceRoleKey)
  : supabase;   // ← anon
```

Il n'existe donc **aucune frontière de privilèges côté serveur**. Le navigateur
fait tout avec la clé publique.

### 6. Identifiants réels versionnés

URL Supabase + clé `anon` de production dans `.env.example` **et** en dur dans
`src/lib/supabase.ts:3-4` comme valeur de repli.

---

## Actions immédiates (à faire aujourd'hui, ~1 h)

1. Supprimer `exec_sql` : `DROP FUNCTION public.exec_sql(text);`
2. Supprimer les 6 politiques `FOR ALL`, ne garder que du `SELECT` explicite.
3. **Restaurer les données** : dump avant, vérifier après. Un attaquant a pu écrire.
4. Révoquer la clé `anon` et en générer une nouvelle dans le dashboard Supabase.
5. Supprimer `contact_data` / `social_data` de `site_backups`, ou rendre la table
   non accessible au public.
6. Vérifier les journaux d'accès Supabase depuis la mise en service.

---

## Ce qui fonctionne et mérite d'être conservé

- Les 8 onglets d'administration couvrent déjà un vrai périmètre métier :
  commandes, produits, promotions, bannières, zones de livraison, FAQ, réglages.
- Le studio promotions (mises en avant, remises, badges) est un vrai +
  pédagogique pour un commerçant.
- Le modèle produit avec notes (top/heart/base) est propre.
- La confirmation de commande avec référence horodatée est une bonne pratique.
- Les zones de livraison avec prix et délai sont bien modélisées.

---

## Manques / dettes, par rapport à la cible

| Domaine demanded | État actuel | Manque |
|---|---|---|
| Multi-clients | 1 projet Supabase par client | aucune isolation `tenant_id` |
| Rôles | binaire admin / non-admin | aucun RBAC, aucun superadmin |
| Modules | 8 onglets en dur dans un composant | aucun contrôle par site |
| Logs | aucun | aucun journal d'audit |
| Blog | absent | table, éditeur, pages |
| Statistiques | absent | aucun suivi de trafic |
| Médias | script d'upload hors site | pas de bibliothèque média |
| Config du site | JSON monolithique `site_backups` | pas de modèle structuré (contacts, réseaux, horaires) |
| Contenu | lu par le navigateur | pas de rendu serveur, SEO dégradé |
| Frontière serveur | inexistante | tout est client-side |
| Accessibilité admin | non évaluée | — |
| i18n de l'admin | interface française présente | à maintenir |

### Points d'architecture à corriger

- **L'admin est dans chaque site client** (`src/app/admin/page.tsx`, 204 Ko, un
  seul composant client). Il n'est ni partagé, ni réutilisable, ni maintenable :
  toute évolution doit être redéployée sur N sites.
- **Le contenu est lu par le navigateur**, donc absent du HTML statique. Les
  pages ne sont pas indexables avec leur contenu réel.
- **Un composant de 204 Ko** mélange authentification, 8 domaines et toutes les
  mutations.
- **Pas de migrations versionnées** : le schéma est réappliqué à la main, d'où
  l'incident `[002]` (`is_hero` manquant, politique SQL malformée).
- **RLS activée mais policies en `USING (true)`** : l'illusion d'un contrôle
  d'accès, sans aucun contrôle.

---

## Recommandation

Ne pas étendre ce portail. Il est rapide à écrire mais son modèle de sécurité
ne peut pas être rattrapé par des correctifs incrémentaux : sans frontière
serveur, la clé publique donne inevitably un accès complet.

Le reconstruire sur une base où **le navigateur ne peut rien décider** :

- les écritures passent par des routes serveur Next.js authentifiées ;
- la clé de base de données vit **uniquement** côté serveur ;
- les politiques RLS lient chaque ligne à un tenant **et** à un rôle ;
- l'audit est écrit dans la même transaction que la mutation.

C'est l'objet du plan joint.
