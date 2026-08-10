# Astro Blog Spec — Content Collections + MDX

Portable spec for adding a blog to an Astro site using the Content Layer API
(Astro 5+) and MDX. Extracted from a working implementation; adapt naming and
the i18n section to the target repo.

## Requirements

- Astro `^5.0.0` or later (Content Layer API — `glob()` loader, `src/content.config.ts`).
- `@astrojs/mdx` installed and added to `integrations` in `astro.config.mjs`.

```js
import mdx from "@astrojs/mdx";

export default defineConfig({
  integrations: [/* ...existing integrations */, mdx()],
  markdown: {
    shikiConfig: { theme: "github-light", wrap: true }, // pick one theme; skip if the site supports dark mode and needs a light/dark pair
  },
});
```

No extra Tailwind config is needed if the project already scans `.astro`/`.tsx`
by extension — `.mdx` is picked up the same way. No sitemap config needed
either; static-site sitemap integrations walk emitted routes automatically.

## 1. Content collection

File **must** be at `src/content.config.ts` (project root of `src/`, not
`src/content/config.ts` — that path is legacy and errors on Astro 5+).

```ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({
    pattern: "**/index.mdx",
    base: "./src/content/blog",
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog };
```

### Directory convention

One folder per post, `index.mdx` plus colocated images (cover and inline body
images resolve via relative path and get auto-optimized):

```
src/content/blog/
  shipping-project-x/
    index.mdx
    cover.jpg
    screenshot-1.jpg
```

Slug = folder name. Sort by `pubDate`, not by filename — keeps URLs stable if
you ever reorder or backdate a post.

### Multi-language variant

If the site is i18n and posts need per-locale versions, nest one more level
and strip it in `generateId` so a translated pair shares one `id`:

```
src/content/blog/
  es/shipping-project-x/index.mdx
  en/shipping-project-x/index.mdx
```

```ts
loader: glob({
  pattern: "**/index.mdx",
  base: "./src/content/blog",
  generateId: ({ entry }) => entry.split("/").slice(1, -1).join("/"),
}),
```

Add `lang: z.enum([...]).` to the schema as an explicit frontmatter field —
the schema function can't see the file path, only `generateId` can, so `lang`
has to be self-declared per file, not derived.

## 2. Routing

Two pages: a list and a detail page. Exact path depends on whether the site
has locale-prefixed routing already (e.g. `src/pages/[locale]/blog/...`) or
not (`src/pages/blog/...`). Core logic is the same either way.

**List** (`.../blog/index.astro`):

```ts
import { getCollection } from "astro:content";

const posts = (await getCollection("blog", (p) => !p.data.draft)).sort(
  (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
);
```

**Detail** (`.../blog/[slug].astro`):

```ts
import { getCollection, render } from "astro:content";

export async function getStaticPaths() {
  const posts = await getCollection("blog", (p) => !p.data.draft);
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

const { post } = Astro.props;
const { Content } = await render(post); // standalone `render()`, NOT `post.render()` — that method doesn't exist on Astro 5–7 collection entries, a common mistake
```

### Multi-language routing variant

If cross-joining locale × posts, build `getStaticPaths` from scratch (don't
try to reuse whatever locale-only path helper the i18n library provides — it
won't know how to cross-join a second dynamic segment):

```ts
export async function getStaticPaths() {
  const posts = await getCollection("blog", (p) => !p.data.draft);
  const localesWithPosts = LOCALES.filter((l) => posts.some((p) => p.data.lang === l));

  return localesWithPosts.flatMap((locale) =>
    posts.filter((p) => p.data.lang === locale)
      .map((post) => ({ params: { locale, slug: post.id }, props: { post } })),
  );
}
```

Filtering `localesWithPosts` before generating paths means a locale with zero
posts simply doesn't get a route — no empty "coming soon" page, no dead link
in nav. Decide deliberately if you'd rather ship an empty-state page instead.

## 3. Rich content in MDX

- **Code blocks**: handled automatically by the `markdown.shikiConfig` set
  above — fenced code blocks work identically to plain `.md`, no component
  needed.
- **Body images**: plain `![alt](./local-image.jpg)` is auto-optimized by
  `@astrojs/mdx`'s image handling — no manual `<Image>` import needed for the
  common case.
- **Custom components**, passed via `<Content components={...} />` in the
  detail page, to restyle default markdown elements and add explicit rich
  tags:

```astro
<Content components={{ img: BlogImg, blockquote: Callout, Figure, Callout }} />
```

  - Overriding `img`/`blockquote` means a bare `![]()` or `>` quote picks up
    the site's design automatically — authors don't need to remember a
    custom tag for the common cases.
  - `Figure`/`Callout` (or whatever your equivalents are) are also available
    as explicit JSX inside `.mdx` for cases needing more control (captions,
    asides, multi-image comparisons).
  - Any existing image-gallery/carousel component already in the codebase can
    usually be reused directly inside MDX with zero changes — just export it
    as an available component.

## 4. SEO / OG metadata

If the base layout hardcodes `<title>`/has no meta description, extend it
with optional props (default to current behavior so every existing page
keeps working unchanged):

```astro
interface Props {
  title?: string;
  description?: string;
  ogImage?: string;      // absolute URL
  ogType?: string;       // "website" default, "article" for posts
  canonicalURL?: string; // defaults to Astro.url.href
}
```

```html
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonicalURL} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:type" content={ogType} />
<meta property="og:url" content={canonicalURL} />
{ogImage && <meta property="og:image" content={ogImage} />}
<meta name="twitter:card" content={ogImage ? "summary_large_image" : "summary"} />
```

A blog-specific layout wrapping the base one sets `ogType="article"`, resolves
`post.data.cover` to an absolute URL via `new URL(cover.src, Astro.site)`, and
passes `title`/`description` from frontmatter.

## 5. Navigation

- A `/blog` nav entry is a real route link, not a same-page anchor — don't
  force it into a scroll-spy/anchor nav system built for single-page sections.
- If posts might not exist yet for a given locale/section, gate the nav link
  on `(await getCollection("blog", ...)).length > 0` rather than always
  showing it.
- If the site has a language switcher that relocalizes the *current* page by
  path-matching against a fixed route list, that list won't know about
  `/blog/[slug]` (infinite slugs). Add a path-prefix fallback: if the current
  path starts with `/blog`, fall back to the blog index rather than home.

## 6. Common mistakes (hit these during the first implementation)

- `src/content/config.ts` instead of `src/content.config.ts` → `LegacyContentConfigError`.
- Calling `post.render()` instead of `render(post)` (standalone import) →
  `TypeError: post.render is not a function`. This trips up anyone recalling
  older or unrelated docs; the Astro 5–7 Content Layer API export is the
  standalone function, not a method on the entry.
- Forgetting to run `astro sync` after adding/changing `content.config.ts` —
  without it, `getCollection`/`CollectionEntry` types don't exist yet and every
  usage shows as implicit `any` in the editor.
- Building an empty list page for a language/section with zero content when
  the actual intent was "hide until there's something to show" — decide this
  explicitly, don't let it default either way.

## Verification checklist

- [ ] `astro sync` run after any `content.config.ts` change (regenerates
      collection types; not a full build).
- [ ] List page renders at least one seeded post.
- [ ] Detail page renders: highlighted code block, an inline image, and every
      custom rich component (callout/figure/etc.).
- [ ] Nav link logic matches intent (always shown vs. gated on content
      presence).
- [ ] `<head>` on a detail page has `og:title`, `og:image` (absolute URL),
      `og:type=article`, `canonical` — verify with a link-preview debugger
      before relying on it for social shares.
- [ ] If multi-language: switching language from a detail page lands
      somewhere sane (blog index, not home), and a locale with zero posts
      behaves as intended (404 vs. empty page — whichever was decided).
