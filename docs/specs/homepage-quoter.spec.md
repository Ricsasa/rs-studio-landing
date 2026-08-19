# Homepage Quoter Spec (Cal.com CTA as Placeholder)

## Overview
Add a new "Quoter" flow to the homepage (`/`), placed inside the existing
empty `#get-started` ("¡Comencemos!") section. Unlike the previous two
integrations (landing-pages, business-management-tool), this flow is
**service-agnostic** — the visitor hasn't picked a service yet.

No backend, no data persistence, no contact form fields. There is no
active backend for this project, so this is a **config-only** integration
of the existing `Quoter` component, same as `landing-pages-quoter` and
`business-management-tool-quoter` — no component extension needed.

The flow ends on a results screen with **two CTAs**, both built from the
answers already collected client-side:
1. **Enviar WhatsApp** — same pattern as the other two quoters: opens
   `wa.me` with a prefilled message summarizing the answers
2. **Agendar una charla de descubrimiento** — for this version, clicking
   this CTA shows a **placeholder**, not a real Cal.com integration. The
   actual Cal.com embed/link is intentionally out of scope here and will
   be defined in a separate, future spec.

Both options are shown together; the visitor can click either. Neither
requires storing anything server-side — no Astro API route, no database.

## Placement
Render inside the existing `#get-started` section, which currently only
contains the heading "¡Comencemos!" — no layout changes needed elsewhere
on the page.

## Question Flow

### Step 1 — Project type (single select)
Label: "¿Qué tipo de proyecto tienes en mente?"
Options:
- Landing page
- Tienda online
- Herramienta de control empresarial
- Marketing digital
- No estoy seguro

### Step 2 — Primary goal (single select)
Label: "¿Cuál es tu objetivo principal?"
Options:
- Conseguir más clientes
- Automatizar procesos internos
- Modernizar mi presencia online
- Vender en línea
- Otro (with `includeOtherField`)

Explicitly excluded from this version, per product decision: budget range
and estimated delivery date. Do not add these as options or fields.

## Results Screen
After Step 2, show a summary of the two answers (same pattern as the
other quoters' summary view), followed by two buttons side by side (stack
vertically on mobile):

- **Enviar WhatsApp** — opens `wa.me` with `whatsappTemplate` populated,
  same mechanism already defined in `quoter.spec.md`
- **Agendar una charla de descubrimiento** — clicking this shows a
  **placeholder state** in place of the scheduling widget. Suggested
  placeholder copy: "Agendar en línea estará disponible pronto — mientras
  tanto, escríbenos por WhatsApp." The real Cal.com integration (embed vs.
  link-out, exact event slug, styling) will be defined in a dedicated
  follow-up spec once the Cal.com event is set up.

No field collects email or phone directly in this flow — whatever the
visitor shares happens inside WhatsApp.

## Quoter Config (Spanish source content, to be run through i18next)

```typescript
const quoterConfig: QuoterProps = {
  instanceId: 'homepage-quoter',
  sectionTitle: 'Comencemos',
  whatsappNumber: '522206315612', // confirm against current WhatsApp CTA number on the page
  whatsappTemplate: `Hola, completé el formulario en su página:
{answers_json}

Me gustaría platicar sobre mi proyecto.`,
  questions: [
    {
      id: 'project-type',
      type: 'single',
      required: true,
      label: '¿Qué tipo de proyecto tienes en mente?',
      options: [
        { id: 'landing-page', label: 'Landing page' },
        { id: 'online-store', label: 'Tienda online' },
        { id: 'management-tool', label: 'Herramienta de control empresarial' },
        { id: 'digital-marketing', label: 'Marketing digital' },
        { id: 'not-sure', label: 'No estoy seguro' }
      ]
    },
    {
      id: 'main-goal',
      type: 'single',
      required: true,
      label: '¿Cuál es tu objetivo principal?',
      options: [
        { id: 'more-customers', label: 'Conseguir más clientes' },
        { id: 'automate', label: 'Automatizar procesos internos' },
        { id: 'modernize', label: 'Modernizar mi presencia online' },
        { id: 'sell-online', label: 'Vender en línea' },
        {
          id: 'other',
          label: 'Otro',
          includeOtherField: true,
          otherFieldPlaceholder: 'Cuéntanos más'
        }
      ]
    }
  ]
};
```

## English Equivalent (en-US locale)

| Key | Spanish | English |
|---|---|---|
| section heading | Comencemos | Let's Get Started |
| project-type label | ¿Qué tipo de proyecto tienes en mente? | What kind of project do you have in mind? |
| landing-page | Landing page | Landing page |
| online-store | Tienda online | Online store |
| management-tool | Herramienta de control empresarial | Business management tool |
| digital-marketing | Marketing digital | Digital marketing |
| not-sure | No estoy seguro | Not sure yet |
| main-goal label | ¿Cuál es tu objetivo principal? | What's your main goal? |
| more-customers | Conseguir más clientes | Get more customers |
| automate | Automatizar procesos internos | Automate internal processes |
| modernize | Modernizar mi presencia online | Modernize my online presence |
| sell-online | Vender en línea | Sell online |
| other (main-goal) | Otro | Other |
| main-goal other placeholder | Cuéntanos más | Tell us more |
| whatsapp CTA label | Enviar WhatsApp | Send WhatsApp |
| schedule CTA label | Agendar una charla de descubrimiento | Book a discovery call |
| schedule placeholder copy | Agendar en línea estará disponible pronto — mientras tanto, escríbenos por WhatsApp. | Online booking will be available soon — in the meantime, message us on WhatsApp. |
| whatsappTemplate | Hola, completé el formulario en su página:\n{answers_json}\n\nMe gustaría platicar sobre mi proyecto. | Hi, I filled out the form on your site:\n{answers_json}\n\nI'd like to talk about my project. |

## Expected WhatsApp Message Output

Given the answers below:
- project-type: `landing-page`
- main-goal: `more-customers`

**es-MX:**
```
Hola, completé el formulario en su página:
- Tipo de proyecto: Landing page
- Objetivo principal: Conseguir más clientes

Me gustaría platicar sobre mi proyecto.
```

**en-US:**
```
Hi, I filled out the form on your site:
- Project type: Landing page
- Main goal: Get more customers

I'd like to talk about my project.
```

## Acceptance Criteria
- [ ] Quoter renders inside `#get-started` on both `/` (es-MX) and `/en-US`
- [ ] Both questions match the config above exactly (ids, labels, order)
      in both locales
- [ ] No budget range or delivery date question appears anywhere in this
      flow
- [ ] No email or phone input field appears anywhere in this flow — no
      data is collected or stored anywhere
- [ ] Results screen shows both CTAs together: "Enviar WhatsApp" and
      "Agendar una charla de descubrimiento"
- [ ] "Enviar WhatsApp" opens `wa.me` with the message matching the
      expected output above, in the locale of the page
- [ ] "Agendar una charla de descubrimiento" shows the placeholder copy
      instead of any real Cal.com widget or link — no Cal.com script,
      embed, or outbound link is added in this version
- [ ] Clicking one CTA does not disable or hide the other — visitor can
      interact with either
- [ ] All labels and messages are pulled from i18next locale files — no
      hardcoded strings
- [ ] No changes made to the `Quoter` component's core contract — this
      integration only adds a second CTA (placeholder) alongside the
      existing WhatsApp one on the results screen
- [ ] `instanceId` (`homepage-quoter`) does not collide with
      `landing-pages-quoter` or `business-management-tool-quoter`

## Follow-Up Spec (not part of this scope)
Once the Cal.com discovery-call event is set up, a separate spec will
define: exact event slug/link, whether the widget is embedded inline or
opens as a link-out, and how it replaces this placeholder.

## Post-Launch Additions (superseding the placeholder above)

The Cal.com event slug is now live (`rs-studio/descubrimiento`, per
`calwidget.spec.md`), and the results screen was extended beyond the
original two-CTA placeholder version:

- **Real Cal.com CTA**: "Agendar una charla de descubrimiento" opens the
  `CalWidget` popup (see `calwidget.spec.md`) scoped to
  `rs-studio/descubrimiento` instead of showing placeholder copy. The
  `schedulePlaceholder` i18n key has been removed from both locales.
- **Contact step**: name/email are now collected (`collectContact` on
  `Quoter`) before the summary screen, and are passed to `CalWidget` as
  `prefillName`/`prefillEmail`. The summary answers (formatted the same
  way as the WhatsApp message) are passed as `prefillNotes`.
- **Thank-you state**: after either CTA succeeds — "Enviar WhatsApp" is
  clicked, or the Cal.com modal fires a `bookingSuccessfulV2` event via
  `CalWidget`'s `onBookingSuccess` callback — the quoter is replaced by a
  thank-you message ("¡Gracias! Tu mensaje es muy importante para
  nosotros, seguiremos en contacto contigo.", i18n key
  `quoter.thankYouMessage`). This is a one-way transition: the quoter does
  not return to the summary screen afterward.
- **Section intro text**: the `#get-started` section shows an intro
  paragraph above the quoter ("¡Queremos conocerte mejor!, contesta estas
  sencillas preguntas para poder agendar una llamada de descubrimiento, o
  enviarnos un mensaje para obtener seguimiento personalizado", i18n key
  `getStarted.introText`), passed to `Quoter` as the optional `introText`
  prop. It disappears together with the quoter once the thank-you state
  is shown.

## Out of Scope
- Copy/microcopy for the section heading and subheading beyond what's
  listed above (confirm separately)
- Styling — handled by existing design skills/tokens
- Budget and estimated delivery date questions — explicitly excluded
- Any form of contact capture, backend persistence, email notification,
  or database storage — not part of this version
- Real Cal.com integration (embed, link-out, event slug) — deferred to a
  future spec; this version only shows a placeholder on click
- Lead scoring or filtering logic before showing the CTAs — every visitor
  who completes the two questions sees both options
