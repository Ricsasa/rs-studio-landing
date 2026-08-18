# Pain Points Section — Business Management Tool Page

**Route:** `/business-management-tool` (`src/pages/[...locale]/business-management-tool.astro`)
**Status:** Implemented

---

## Summary

Replaced the generic "Benefits" section with a new "Problemas que resolvemos" (Problems We Solve) section, positioned where Benefits used to sit — right after the Hero/Problem intro and before "Qué construimos" (Deliverables). The new section groups concrete client-facing pain points into five categories, and folds the old Benefits copy into each card as a one-line outcome, instead of repeating similar ground in two separate sections.

This change is scoped to `businessManagementTool` only. Other service pages (`digitalMarketing`, `landingPages`, `wordpressEcommerce`) are unaffected and keep rendering the original Benefits section.

---

## Problem

Benefits ("Automatización de procesos", "Mejor gestión de clientes", ...) and the newly added pain points section ("Cash flow ciego", "Compras de emergencia", ...) covered near-identical ground from opposite angles — one abstract/positive, one concrete/negative — reading as repetitive back-to-back.

## Solution

- Merge Benefits into the pain points cards as a per-card "outcome" line (checkmark-prefixed, `text-moss`), so each card reads: problem → fix.
- Add one intro line under the section title tying the cards together and covering the one benefit that didn't map to a single category ("Un negocio que puede crecer").
- Drop the standalone Benefits section for this page; render `ServicePainPoints` in its old slot instead.

---

## Component Changes

### `src/components/services/ServicePainPoints.astro` (new)
Renders `title`, optional `intro`, and a grid of category cards (icon, category eyebrow, title, description, outcome). Grid: 1 col mobile, 2 col `sm`, 3 col `wide`. Section background: `bg-paper`.

### `src/components/services/ServicePage.astro`
- Added `painPoints` to the `Service` type: `{ title, intro?, categories: { category, icon, title, description, outcome }[] }`.
- Replaced the unconditional Benefits render with a conditional swap:
  ```astro
  {service.painPoints ? <ServicePainPoints {...service.painPoints} /> : <ServiceBenefits benefits={service.benefits} />}
  ```
- No background-rhythm changes needed: swapping one section for another in the same slot keeps the existing paper/substrate alternation (`bg-paper` → `bg-substrate` → `bg-paper` → ... → `bg-pine-deep` on Contact) intact.

### `src/components/Icon.astro`
Added five icon names backing the categories: `wallet`, `package`, `clock`, `line-chart`, `user-x` (all from `@lucide/astro`).

---

## Content Structure

`painPoints.categories[]`, one item per category:

| Category | Icon | Pain point | Outcome |
|---|---|---|---|
| Financiero y tesorería | wallet | Cash flow ciego | Reportes claros de ingresos y márgenes, al día |
| Inventario y compras | package | Compras de emergencia | Stock visible y compras planeadas |
| Gestión de equipo | clock | Nómina manual | Nómina automatizada, sin errores ni retrasos |
| Datos y decisiones | line-chart | Decisiones a ciegas | Reportes automáticos para decidir con datos reales |
| Retención y clientes | user-x | Clientes que desaparecen | Seguimiento automático que no deja ir a un cliente |

Content lives in `public/locales/{es-MX,en-US}/services.json` under `businessManagementTool.painPoints`, mirroring the existing `es-MX`/`en-US` split for the rest of the service data. `common.json`'s `servicePage.*Label` keys were not touched — the section title is data-driven (`painPoints.title`), same pattern as `domainOptions.title`.

The `benefits` array is left in place in `services.json` (type-required field, `ServiceBenefits` fallback for other pages) but is no longer rendered on this page.

---

## Verification

- `npx astro build` — 19 pages built, no errors.
- Confirmed `"Problemas que resolvemos"` renders in the built `business-management-tool/index.html`.
- Confirmed section background alternation unchanged for the page (no regression on `digitalMarketing`/`landingPages`/`wordpressEcommerce`, which don't set `painPoints` and keep the original `ServiceBenefits` section).
