# Astro Boilerplate

A modern starting point for building fast, content-focused websites with [Astro](https://astro.build). It includes React support, Tailwind CSS v4, Starwind design tokens and utilities, sitemap generation, Partytown, and an i18n integration.

## Requirements

- Node.js 22.12 or newer
- npm

## Getting started

Install dependencies and start the development server:

```sh
npm install
npm run dev
```

The site is then available at [http://localhost:4321](http://localhost:4321).

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server. |
| `npm run build` | Create an optimized production build in `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run astro -- <command>` | Run the Astro CLI directly. |

## Deployment URL and base path

Before deploying, set `site` in `astro.config.mjs` to the final public URL of the project. Astro uses this URL when generating canonical URLs and the sitemap, so it should be the production domain rather than a local or preview address.

For a site deployed at the domain root, use only `site`:

```js
export default defineConfig({
  site: "https://example.com",
  // integrations and other options...
});
```

Set `base` only when the site is served from a subdirectory. Astro uses it as the root path for pages and assets in both local development and the production build.

```js
export default defineConfig({
  site: "https://example.com",
  base: "/portfolio",
  // integrations and other options...
});
```

With this configuration, the home page is deployed at `https://example.com/portfolio/`, and asset and route URLs include `/portfolio`. For a domain-root deployment, omit `base` rather than setting it to an empty string.

### Deploying to GitHub Pages

This repository includes a GitHub Pages workflow template at `.github/workflows/deploys.yml`. It builds the Astro site with `withastro/action` and publishes the generated artifact with `actions/deploy-pages`. The template is fully commented out, so enable it before its first deployment by removing the leading `#` from the workflow content.

Before pushing the enabled workflow:

1. Confirm the workflow’s deployment branch is correct. It is set to run on pushes to `main`; change `branches: [main]` if the repository uses another default branch.
2. Set the GitHub Pages URL in `astro.config.mjs`. For a project repository, use your account or organization GitHub Pages domain as `site` and the repository name as `base`:

   ```js
   export default defineConfig({
     site: "https://<account>.github.io",
     base: "/<repository>",
     // integrations and other options...
   });
   ```

   The resulting site URL is `https://<account>.github.io/<repository>/`.

3. If the repository is the special account site named `<account>.github.io`, omit `base` because it is deployed at the domain root.
4. Commit `package-lock.json`. The Astro GitHub Action uses the lockfile to select npm and install the exact dependency versions.
5. In the GitHub repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.

Push to the configured branch to deploy, or run the workflow manually from the repository’s **Actions** tab. When `base` is set, ensure root-relative internal links include the base path; for example, use `/&lt;repository&gt;/about` rather than `/about`.

## Project structure

```text
/
├── public/                 # Static files served as-is
├── src/
│   ├── assets/             # Imported images and other bundled assets
│   ├── components/         # Reusable Astro and React components
│   ├── layouts/            # Shared page shells and document metadata
│   ├── pages/              # File-based routes
│   └── styles/             # Global CSS and Starwind/Tailwind theme tokens
├── astro.config.mjs        # Astro integrations and Vite configuration
├── starwind.config.json    # Starwind component and token settings
└── package.json
```

To add a page, create an `.astro` file in `src/pages`. For example, `src/pages/about.astro` is served at `/about`.

## Styling

Global styles are loaded from `src/layouts/Layout.astro`:

- `src/styles/starwind.css` defines the Tailwind CSS imports, semantic color tokens, radius tokens, and light/dark theme values.
- `src/styles/global.css` is the place for application-wide styles.

Use the `@/` import alias for files in `src`; for example, `@/components/Button`.

## Internationalization

Localization is provided by [`astro-react-i18next`](https://github.com/yassinedoghri/astro-react-i18next). The current configuration in `astro.config.mjs` supports these languages:

| Locale | Language | URL behavior |
| --- | --- | --- |
| `es-MX` | Spanish (Mexico) | Default language; served without a locale prefix. |
| `en-US` | English (United States) | Served with the `/en-US` prefix. |

Translations are organized by locale and namespace in `public/locales`. The `common` namespace is configured for this project:

```text
public/locales/
├── en-US/
│   └── common.json
└── es-MX/
    └── common.json
```

Add matching keys to each language file. Then use the `i18next` instance in an Astro component:

```astro
---
import i18n from "i18next";
---

<h1>{i18n.t("welcome-label")}</h1>
```

### Adding a language

1. Add the locale code to `locales` in the `reactI18next()` integration in `astro.config.mjs`.
2. Create `public/locales/<locale>/common.json` and provide every translation key used by the site.
3. Run a production build to generate and check the new localized route.

For example, adding French (`fr-FR`) requires both `locales: ["en-US", "es-MX", "fr-FR"]` and `public/locales/fr-FR/common.json`.

### Localized static routes

Localized pages live under `src/pages/[...locale]/`. The catch-all route lets Astro handle both the default route (such as `/`) and locale-prefixed routes (such as `/en-US`). Put additional localized pages in the same directory; `src/pages/[...locale]/about.astro`, for example, creates localized versions of the About page.

This project uses static site generation, so each localized route exports `getStaticPaths()`:

```astro
---
import { buildStaticPaths } from "astro-react-i18next/utils";

export function getStaticPaths() {
  return buildStaticPaths();
}
---
```

`buildStaticPaths()` reads the configured locales and gives Astro a path for each one at build time. This is why localized pages are generated in the production output without manually listing each language.

## Included integrations

- [React](https://docs.astro.build/en/guides/integrations-guide/react/) for interactive client components
- [Tailwind CSS](https://tailwindcss.com/) v4 for utility-first styling
- [Sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) for generated sitemap support
- [Partytown](https://docs.astro.build/en/guides/integrations-guide/partytown/) for moving supported third-party scripts off the main thread
- [`astro-react-i18next`](https://github.com/yassinedoghri/astro-react-i18next) for localization with React

## Documentation

- [Astro documentation](https://docs.astro.build)
- [Astro routing guide](https://docs.astro.build/en/guides/routing/)
- [Astro styling guide](https://docs.astro.build/en/guides/styling/)
