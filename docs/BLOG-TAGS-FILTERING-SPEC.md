# Spec: Blog Tags + Tag Filtering

## Goal

Add tags to blog posts and a client-side tag filter on the blog index page.
No page reload for filtering; tag links still work with JavaScript disabled
(full navigation to an unfiltered list).

## Assumptions

- Astro project with Content Collections.
- A blog index page that lists post cards, and a blog post layout/page.
- Tailwind (or similar) available for `aria-[current=true]:` variant styling.
  Adjust to plain CSS if not using Tailwind v4+.

## 1. Content schema

Add a `tags` field to the blog collection schema:

```ts
tags: z.array(z.string()).default([]),
```

## 2. Blog index page

In the page/component that lists posts (e.g. `blog/index.astro`):

1. Compute the base URL of the blog index itself (localized if i18n is used).
2. Compute the unique, sorted set of tags across all listed posts:
   ```ts
   const allTags = [...new Set(posts.flatMap((post) => post.data.tags))].sort((a, b) =>
       a.localeCompare(b),
   );
   ```
3. Render a filter chip row above the post grid:
   - One chip for "All", `href` = blog index base URL, `data-tag=""`.
   - One chip per tag, `href` = `${blogIndexHref}?tag=${encodeURIComponent(tag)}`, `data-tag={tag}`.
   - Mark the container with `data-tag-filter` and `data-tag-filter-base={blogIndexHref}`.
   - Give every chip `data-tag-filter-option` and `aria-current="true"|"false"`.
4. Wrap each post card in a container with `data-tag-filter-item` and
   `data-tags={post.data.tags.join("|")}`.
5. Add an empty-state element (`data-tag-filter-empty`, hidden by default) shown
   when a filter matches zero posts.
6. Add an inline `<script>` (runs client-side) that:
   - Reads `?tag=` from `window.location.search` on load and applies it.
   - On chip click: `preventDefault()`, toggle the `tag` query param via
     `history.replaceState`, hide/show items by checking membership in each
     item's `data-tags` (split on `|`), update `aria-current` on chips, and
     toggle the empty-state element based on visible count.

This is progressive enhancement: without JS, chip links still navigate (full
reload) to the blog index — the filter itself just won't apply, so all posts
show. Do not treat that as broken; it's the deliberate no-JS fallback for a
static build where `?tag=` isn't available at prerender time.

## 3. Post card component

Tags must render as **separate real `<a>` elements** pointing to
`${blogIndexHref}?tag=${encodeURIComponent(tag)}`, not `<span>`.

If the whole card is currently a single wrapping `<a>`, this breaks (anchors
cannot nest). Refactor to a "stretched link" pattern instead:

- Card root becomes a `<div class="card relative ...">` (not `<a>`).
- The title (or another primary heading) becomes an `<a href={postHref}>`
  with a full-cover pseudo-element so the whole card stays clickable:
  `class="static after:absolute after:inset-0"`.
- Tag pills sit in their own `<div class="relative flex flex-wrap gap-1.5">`
  and each pill gets `class="... relative z-10 ..."` so they sit above the
  stretched link and remain independently clickable.

Pass a `tagsIndexHref` prop into the card component; only render tags as
links when it's provided (otherwise fall back to plain `<span>` — e.g. for
places that show tags without a filterable index nearby).

## 4. Single post page/layout

Pass the same `tagsIndexHref` (blog index base URL) into the post
layout/header. Render each tag as `<a href="${tagsIndexHref}?tag=${encodeURIComponent(tag)}">`
instead of `<span>`, so a reader can jump from an individual post back to the
filtered list.

## 5. Styling

Reuse whatever existing "pill" class exists (e.g. `.tag`) for both static tag
display and the filter chips. Add an active-state variant, e.g.:

```
aria-[current=true]:bg-<accent> aria-[current=true]:text-white
```

Add `hover:` styles to tag/chip links since they're now interactive.

## 6. i18n (skip if project isn't localized)

Add two strings per locale:

- `blog.filter-all-label` — "All" chip label.
- `blog.filter-empty-label` — message shown when a tag matches no posts.

## Non-goals

- No dedicated per-tag static routes/pages (`/blog/tags/[tag]`) — filtering
  is client-side only, on the existing index page.
- No multi-tag (AND/OR) filtering — single active tag at a time.
- No tag count badges.
