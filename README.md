# RS Studio — Landing site

The marketing site for RS Studio: a static, bilingual (Spanish/English) [Astro](https://astro.build) site with a homepage, dedicated service pages, portfolio case studies, and a blog. Built with React (for interactive islands), Tailwind CSS v4, and `astro-react-i18next` for localized routing.

## Requirements

- Node.js 22.12 or newer (run `nvm use 22` before starting work)
- npm

## Getting started

Install dependencies and start the development server:

```sh
nvm use 22
npm install
npm run dev
```

The site is then available at [http://localhost:4321](http://localhost:4321).

### Running the dev server in the background

When working with an agent or in a terminal you don't want blocked, run the dev server detached and manage it with the Astro CLI:

```sh
npx astro dev --background
npx astro dev status
npx astro dev logs
npx astro dev stop
```

**Content changes in `public/locales/**/*.json` are not hot-reloaded.** The i18next filesystem backend loads every namespace once when the dev server starts, so after editing any locale JSON file, restart the dev server (`astro dev stop && astro dev --background`) to see the change.

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server. |
| `npm run build` | Create an optimized production build in `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run astro -- <command>` | Run the Astro CLI directly. |

## Project structure

```text
/
├── public/
│   └── locales/                   # i18next translation files, see "Content sources" below
│       ├── es-MX/                 # common.json, projects.json, services.json
│       └── en-US/                 # same namespaces, English copy
├── src/
│   ├── assets/                    # Imported images and other bundled assets
│   ├── components/                # Reusable Astro/React components
│   │   ├── work/                  # Case-study page sections (ProjectHeader, ProjectOverview, ...)
│   │   ├── services/              # Service page sections (ServiceHero, ServiceFaq, ...)
│   │   └── blog/                  # Blog listing/detail components
│   ├── content/
│   │   ├── projects.ts            # Case-study slug list + typed accessors over projects.json
│   │   └── blog/                  # Markdown/MDX blog posts, one folder per locale
│   ├── i18n/
│   │   ├── t.ts                   # tList() helper for array-shaped translations
│   │   ├── routing.ts             # Locale-aware path builders (homePath, servicePath, ...)
│   │   └── locales.ts             # Locale display metadata (labels shown in the language toggle)
│   ├── lib/
│   │   ├── whatsapp.ts            # whatsappHref() — wa.me links with a prefilled message
│   │   └── markdown.ts            # Markdown → HTML rendering for rich-text content fields
│   ├── layouts/
│   │   └── Layout.astro           # Document shell: meta tags, canonical URL, hreflang, OG tags
│   ├── pages/
│   │   ├── [...locale]/           # Every localized route lives here — see "Routing" below
│   │   └── 404.astro
│   └── styles/
│       └── global.css             # Design tokens (color, type scale, spacing) and base styles
├── astro.config.mjs                # Astro integrations, i18n locales/namespaces, Vite config
└── package.json
```

## Content sources

Two different places hold site copy, by design:

- **`src/content/blog/`** — Astro content collections, one Markdown/MDX file per post per locale. Reserved for free-form long-form writing (the blog).
- **`public/locales/<locale>/*.json`** — i18next namespaces, read with `i18n.t()` / `tList()`. Everything else: navigation labels, homepage sections, service page copy, project case-study text, buttons, meta titles/descriptions. This keeps short structured copy translatable and centrally reviewable without touching component code.

Current namespaces (configured in `astro.config.mjs`):

| Namespace | File | Backs |
| --- | --- | --- |
| `common` | `common.json` | Nav, hero, homepage sections, contact, shared `cta.*` and `servicePage.*` labels |
| `projects` | `projects.json` | Case-study content for `/work/[slug]` |
| `services` | `services.json` | One object per service page (`landingPages`, `wordpressEcommerce`, `businessManagementTool`, `digitalMarketing`) |

Every key added to an ES file must have a matching key in the EN file (and vice versa) — nothing falls back silently.

## Internationalization

Localization is provided by [`astro-react-i18next`](https://github.com/yassinedoghri/astro-react-i18next).

| Locale | Language | URL behavior |
| --- | --- | --- |
| `es-MX` | Spanish (Mexico) | Default language; served without a locale prefix. |
| `en-US` | English (United States) | Served with the `/en-US` prefix. |

URL **slugs** (`/landing-pages`, `/work/some-project`, `/blog/some-post`) stay in English in both locales — only the locale prefix changes. Canonical URLs and hreflang alternates are generated automatically by `Layout.astro` for every page; you don't need to add them per page.

### Routing helpers (`src/i18n/routing.ts`)

Never hand-build a localized `href`. Use the matching helper so links stay correct across locales:

```ts
homePath();              // "/" or "/en-US"
projectPath(slug);       // "/work/<slug>" (localized)
blogPath();               // "/blog" (localized)
blogPostPath(slug);      // "/blog/<slug>" (localized)
servicePath(serviceKey); // "/<service-slug>" (localized) — serviceKey is a ServiceKey, not the URL slug
```

### Adding a language

1. Add the locale code to `locales` in the `reactI18next()` integration in `astro.config.mjs`.
2. Create `public/locales/<locale>/` with a JSON file for every existing namespace (`common.json`, `projects.json`, `services.json`), translating every key.
3. Restart the dev server (locale files are read once at startup — see the note above) and check the new localized routes.

## Routing

Every localized page lives under `src/pages/[...locale]/`. Two patterns are used, depending on whether the page is one of a fixed set or one of a content-driven catalogue:

**Fixed pages** (homepage, each service page) — `getStaticPaths()` returns one entry per locale:

```astro
---
import { buildStaticPaths } from "astro-react-i18next/utils";

export function getStaticPaths() {
  return buildStaticPaths();
}
---
```

**Catalogue pages** (`work/[slug].astro`, `blog/[slug].astro`) — `getStaticPaths()` crosses `buildStaticPaths()` with the list of slugs:

```astro
export function getStaticPaths() {
  return buildStaticPaths().flatMap(({ params }) =>
    someSlugList.map((slug) => ({ params: { ...params, slug } })),
  );
}
```

## Creating a new homepage section

Homepage sections are composed in `src/pages/[...locale]/index.astro`. Each section is its own component in `src/components/`, following the pattern already used by `Hero.astro`, `Work.astro`, `Services.astro`, `Process.astro`, and `Stack.astro`:

1. Create `src/components/YourSection.astro`.
2. Add its copy to `common.json` in both locale files.
3. Read a section title/eyebrow with `<SectionHead title={...} meta={...} />` (`src/components/SectionHead.astro`) — every section on the site uses this for a consistent masthead.
4. Add a decorative background with `<OrganicField variant="..." />` (`src/components/OrganicField.astro`). Pick an unused variant, or add a new one to the `VARIANTS` map in that file — reuse an existing variant's colors/blend rather than inventing a new palette.
5. Import and render the component in `index.astro`, and add an entry to the `links` array in `SiteHeader.astro` if it needs a nav link.

Background colors on the homepage alternate deliberately (`bg-paper` → `bg-substrate` → `bg-pine` → …) so consecutive sections never share the same tone — check the sections immediately above and below before choosing one.

## Creating a new service page

Service pages follow one shared template. To add a new one:

1. **Add the service to `src/i18n/routing.ts`**: extend `ServiceKey` and add its entry to `SERVICE_SLUGS`.
2. **Add its content** to `services.json` in both locale files, matching the existing shape (`title`, `intro`, `problem`, `whyItMatters`, `benefits[]`, `deliverables[]`, `process[]` with 4 steps, `faq[]`, `seoKeywords[]`, `meta.title`/`meta.description`, `whatsappMessage`).
3. **Add a glyph** for it in `src/components/ServiceGlyph.astro` (`GlyphName` union + a hand-drawn `<path>`/`<rect>` block — hairline strokes, square corners, no curves other than the existing diagonal style).
4. **Add the route file** at `src/pages/[...locale]/<slug>.astro`, copying an existing one (e.g. `landing-pages.astro`) and swapping the `serviceKey`.
5. **Link to it** from the homepage `Services.astro` cards (`common.json`'s `services.items[]`).

The page itself is assembled by `src/components/services/ServicePage.astro`, which composes one component per section (`ServiceHero`, `ServiceProblem`, `ServiceBenefits`, `ServiceDeliverables`, `ServiceProcess`, `ServiceFaq`, `ServiceFinalCta`) plus a `ServiceSchema` JSON-LD block. Add or reorder sections there, not in the route files.

## Creating a case study (`/work/[slug]`)

Case studies are catalogue pages driven by `src/content/projects.ts` (slug list, screenshot lookups) and `projects.json` (title, descriptions, technologies, links). Add a project by adding its slug and content in both places; `work/[slug].astro` handles routing automatically via `getStaticPaths()`.

## Writing a blog post

Blog posts are Astro content collection entries under `src/content/blog/<locale>/<slug>/index.md(x)`. Create the same slug folder in both `es-MX/` and `en-US/` so the post exists in both languages.

## CTAs and contact

Every "talk to us" call to action on the site reuses the same two targets, via shared helpers rather than hardcoded links:

- **Email** — `mailto:${i18n.t("contact.email")}`.
- **WhatsApp** — `whatsappHref(message)` from `src/lib/whatsapp.ts`, which builds a `wa.me` link with an optional prefilled, localized message. Omit the argument to use the generic `whatsapp.message` key.

Shared button copy lives under the `cta` key in `common.json` (`cta.requestProposal`, `cta.scheduleCall`) — reuse these keys instead of writing new button labels per page.

## Styling and design tokens

- `src/styles/global.css` defines the full design system as CSS custom properties under `@theme`: the color ramp (`--color-paper` through `--color-pine-deep`), type scale (`--text-display` down to `--text-micro`), and spacing scale (`--spacing-section`, `--spacing-heading`, etc.), all consumed as Tailwind utilities (`text-display`, `py-section`, ...).
- Border radii are forced to `0` globally — the site has no rounded corners. Don't add `rounded-*` utilities.
- `OrganicField.astro` draws the decorative blob backgrounds behind sections; everything a visitor can interact with stays square and flat.
- Use the `@/` import alias for files in `src`; for example, `@/components/Button`.

## Included integrations

- [React](https://docs.astro.build/en/guides/integrations-guide/react/) for interactive client components
- [Tailwind CSS](https://tailwindcss.com/) v4 for utility-first styling
- [MDX](https://docs.astro.build/en/guides/integrations-guide/mdx/) for rich blog content
- [Sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) — generated automatically from every static route, no per-page configuration needed
- [Partytown](https://docs.astro.build/en/guides/integrations-guide/partytown/) for moving supported third-party scripts off the main thread
- [`astro-react-i18next`](https://github.com/yassinedoghri/astro-react-i18next) for localized routing

## Deployment

Before deploying, set `site` in `astro.config.mjs` to the final public URL of the project. Astro uses this URL when generating canonical URLs and the sitemap.

```js
export default defineConfig({
  site: "https://rs-studio.dev",
  // integrations and other options...
});
```

Set `base` only if the site is served from a subdirectory rather than the domain root.

## Documentation

- [Astro documentation](https://docs.astro.build)
- [Astro routing guide](https://docs.astro.build/en/guides/routing/)
- [Astro styling guide](https://docs.astro.build/en/guides/styling/)
- [astro-react-i18next](https://github.com/yassinedoghri/astro-react-i18next)
