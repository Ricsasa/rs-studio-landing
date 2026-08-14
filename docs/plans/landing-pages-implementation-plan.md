# Plan: Landing Pages copy rewrite + new sections

## Context

`/landing-pages/` page copy sells the format ("landing page") not the outcome (trust + qualified leads). Spec at `docs/specs/landing-pages-implementation-spec.md` rewrites copy for service businesses (consultants, clinics, law firms, etc.) and adds new sections (Trust, Designed For, and optionally "What Your Website Should Do"). Spec says this structure/approach gets reused later on other service pages, but scope for those pages is not decided yet — so this round only touches `landing-pages`, both `en` and `es`, and the action list below stays flexible rather than a fixed sequence.

Architecture found: single `ServicePage.astro` orchestrator reads copy from `public/locales/{en-US,es-MX}/services.json` under key `landingPages`, and renders section components (`ServiceHero`, `ServiceProblem`, `ServiceBenefits`, `ServiceDeliverables`, `ServiceProcess`, `ServiceFaq`, `ServiceFinalCta`). This same orchestrator is shared by 3 other service pages (`wordpress-ecommerce`, `digital-marketing`, `business-management-tool`) — new section types must be gated so they render only for `landingPages`, not the other 3, until those pages' scope is decided.

## Confirmed JSON shape

```json
"trust": { "title": "...", "body": "...", "items": ["...", "..."], "quote": "..." },
"designedFor": { "title": "...", "items": ["...", "..."] }
```

## Action list (each independently doable, not a strict sequence)

1. Update `public/locales/en-US/services.json` → `landingPages`: rewrite `meta.title`, `meta.description`, `title` (H1), `intro`, `problem`, `whyItMatters`, `benefits[]`, `deliverables[]`, `faq[]` (update Q1/Q3/Q4, add Q2 pricing question). Leave `process[]` unchanged.
2. Update `public/locales/es-MX/services.json` → `landingPages`: same fields, natural Spanish, not a literal translation.
3. Add `trust` and `designedFor` fields (shape above) to both locale JSON files.
4. Optionally add a `whatShouldDo` field (title + items[]) for the "What Your Website Should Do" section — spec marks it skippable if the page feels crowded; decide after seeing Trust + Designed For rendered.
5. Extend the `Service` type in `ServicePage.astro` to include the new optional fields (`trust`, `designedFor`, `whatShouldDo`).
6. Create new section components in `src/components/services/`: `ServiceTrust.astro`, `ServiceDesignedFor.astro`, and (if used) `ServiceWhatShouldDo.astro` — follow the existing prop-drilling pattern and visual style of `ServiceBenefits.astro`/`ServiceDeliverables.astro`.
7. Wire new sections into `ServicePage.astro`, gated on presence of the corresponding JSON field (not hardcoded to `serviceKey === "landingPages"`) — this way it naturally stays off for the other 3 services until their JSON gets these keys, without needing a code change later.
8. Apply section background-rhythm rule (CLAUDE.md): starts `bg-paper`, alternates with `bg-substrate`, never repeats consecutively, Contact/footer stays `bg-pine-deep`. Recount full section order once final section list is settled (Hero, Problem, Benefits, What We Build, Trust, Designed For, [What Should Do], Process, FAQ, Final CTA) and assign backgrounds accordingly.
9. Verify no emdashes in any new/edited copy, both languages.
10. Verify no generic AI phrases survive ("increase your online presence," "professional digital experience," "modern and optimized," "high-converting design," etc.) in either language.
11. Run dev server, visually check `/landing-pages/` (en) and Spanish route: new sections render, background rhythm correct, FAQ has pricing question, language switcher works.
12. Confirm other 3 service pages unaffected (no Trust/Designed For sections appear, since their JSON won't have those keys yet).

## Verification

- `astro dev --background` (per CLAUDE.md), browser check both locales of `/landing-pages/`.
- Grep both `services.json` files for the em-dash character to confirm none remain.
- `astro dev status` / build check for type errors after extending `Service` type.
- Spot check other 3 service pages still render unchanged.
