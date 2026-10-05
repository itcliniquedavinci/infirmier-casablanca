# infirmiercasablanca.ma — SAMUR Casablanca

Site vitrine pour SAMUR Casablanca, service privé de soins infirmiers à domicile à
Casablanca. Développé en Next.js (App Router), TypeScript et Tailwind CSS, sans CMS,
100% statique.

⚠️ **SAMUR Casablanca est un service privé de soins infirmiers à domicile. Ce site ne
représente pas un service public d'urgence, une structure hospitalière, ni le SAMU
officiel.**

## Stack technique

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- TypeScript
- Tailwind CSS v4
- Génération 100% statique (`generateStaticParams` pour les pages quartiers)
- Aucune base de données, aucun CMS : le contenu est géré dans `/data`

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

Le site est disponible sur [http://localhost:3000](http://localhost:3000).

## Build de production

```bash
npm run build
npm run start
```

## Lint

```bash
npm run lint
```

## Structure du projet

```
app/                          Pages (App Router)
  infirmier-a-domicile-casablanca/   Page pilier SEO
  soins-infirmiers/
  zones-intervention-casablanca/     Hub des quartiers
  zones/[slug]/                      Template quartier (généré depuis /data/zones.ts)
  faq/ a-propos/ contact/
  mentions-legales/ politique-confidentialite/
  sitemap.ts robots.ts not-found.tsx

components/
  layout/     Header, Footer, MobileCallBar
  sections/   Hero, ServiceCard, ZoneCard, FAQAccordion, CTASection, ContactCard, LocalInfo
  ui/         Breadcrumbs, PhoneButton, Container
  schema/     JsonLd (injecteur schema.org)

data/
  site.ts        Coordonnées, téléphones, horaires (source unique de vérité — NAP)
  services.ts     Catégories de soins (⚠️ contenu placeholder, voir ci-dessous)
  zones.ts        Quartiers desservis + contenu éditorial unique par quartier
  faq.ts          FAQ globale
  redirects.ts    Redirections 301 (ancien site → nouveau site)

lib/
  metadata.ts   Génération des metadata Next.js (title, canonical, OG)
  schema.ts     Générateurs JSON-LD (Organization, WebSite, WebPage, BreadcrumbList, FAQPage)
```

## Gérer le contenu sans toucher au code

### Ajouter un nouveau quartier

Ajouter une entrée dans le tableau `zones` de [`data/zones.ts`](data/zones.ts) :

```ts
{
  slug: "nouveau-quartier",       // génère l'URL /infirmier-a-domicile-nouveau-quartier
  name: "Nouveau Quartier",
  title: "Infirmier à domicile à Nouveau Quartier (Casablanca)",
  metaDescription: "...",
  intro: "...",                    // contenu éditorial unique, obligatoire
  localContext: "...",             // contexte local réel, non inventé
  neighboringSlugs: ["maarif"],    // maillage interne vers les quartiers voisins
  practicalInfo: "...",
  faq: [{ question: "...", answer: "..." }],
}
```

La page `/infirmier-a-domicile-nouveau-quartier` est générée automatiquement au build
(routage interne via `/zones/[slug]` + réécriture d'URL dans `next.config.ts`).

**Ne jamais publier un quartier sans contenu éditorial réel et vérifié** (voir section
"Points à valider" ci-dessous — risque de pages "doorway").

### Ajouter ou modifier un service

Modifier le tableau `services` dans [`data/services.ts`](data/services.ts). Chaque
service apparaît automatiquement sur la page d'accueil, `/soins-infirmiers` et la page
pilier.

### Modifier les coordonnées (NAP)

Tout est centralisé dans [`data/site.ts`](data/site.ts) : adresse, téléphones, email,
horaires. Ces informations sont utilisées partout sur le site (header, footer, schema.org,
metadata) — les modifier une seule fois ici suffit.

## ⚠️ Points à valider avant mise en production

1. **`data/services.ts`** contient des catégories de soins **génériques et placeholder**.
   À remplacer par la liste réelle des actes proposés par SAMUR Casablanca avant
   publication (ne jamais annoncer un acte médical non confirmé).
2. **`data/site.ts` → `legalMentions`** : forme juridique, RC, ICE et directeur de
   publication sont vides. À compléter pour les mentions légales.
3. **Logo** : à intégrer dans `public/` et dans le `Header`/favicon une fois le fichier
   source (SVG de préférence) fourni.
4. **WhatsApp** : non intégré à la `MobileCallBar` (confirmation requise avant ajout).
5. **`data/redirects.ts`** : vide. À compléter avec les redirections 301 réelles depuis
   l'inventaire de l'ancien site (sitemap ou export Google Search Console) avant bascule
   du domaine, pour ne perdre aucune URL indexée.

## SEO technique

- **Metadata** : title/description uniques par page, canonical absolu (`lib/metadata.ts`).
- **Sitemap** : généré dynamiquement (`app/sitemap.ts`) depuis `data/zones.ts` — toute
  nouvelle zone y apparaît automatiquement.
- **Robots** : `app/robots.ts`.
- **Schema.org (JSON-LD)** : `LocalBusiness`, `WebSite`, `WebPage`, `BreadcrumbList`,
  `FAQPage` uniquement — volontairement pas de `Physician` / `Hospital` /
  `EmergencyService` / `MedicalOrganization`, ni de faux `Review`/`AggregateRating`.
- **Redirections 301** : centralisées dans `data/redirects.ts`, appliquées par
  `next.config.ts` (`redirects()`).

## Déploiement

### Vercel (recommandé)

1. Pousser le projet sur un dépôt Git.
2. Importer le dépôt sur [vercel.com/new](https://vercel.com/new).
3. Aucune variable d'environnement n'est requise (voir `.env.example`).
4. Build command : `next build` (détecté automatiquement).

### Netlify

Le projet inclut un [`netlify.toml`](netlify.toml) qui configure automatiquement :
- le plugin officiel `@netlify/plugin-nextjs` (indispensable pour que les redirections,
  réécritures d'URL et pages générées dynamiquement fonctionnent),
- la version de Node.js (20).

Étapes :
1. Pousser le projet sur un dépôt Git (GitHub/GitLab/Bitbucket).
2. Sur [app.netlify.com](https://app.netlify.com), "Add new site" → "Import an existing
   project" → sélectionner le dépôt.
3. Netlify détecte automatiquement `netlify.toml` — aucune configuration manuelle requise.

⚠️ Le build (`npm run build`) utilise volontairement `next build --webpack` plutôt que
Turbopack (activé par défaut dans Next.js 16) : Turbopack ne génère pas encore les
"build traces" dont le plugin Netlify a besoin pour empaqueter les fonctions serverless,
ce qui fait échouer le déploiement. Le mode webpack reste pleinement supporté par
Next.js et produit une build identique en développement (`npm run dev` continue
d'utiliser Turbopack, plus rapide, sans impact sur la production).

### Tout hébergeur compatible Node.js

```bash
npm install
npm run build
npm run start
```

Le serveur démarre par défaut sur le port 3000 (`PORT=xxxx npm run start` pour changer
de port).
