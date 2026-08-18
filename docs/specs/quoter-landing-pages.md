# Landing Pages — Quoter Integration Spec

## Overview
Integrate the existing `Quoter` component (see `quoter.spec.md`) into the
`/landing-pages/` page as a new section titled "Diagnóstico Rápido". This is a
config-only integration — no changes to the `Quoter` component itself.

## Placement
Insert the section immediately after "Beneficios" and before "Qué construimos".

## Section Wrapper
- Section id: `diagnostico-rapido`
- Section heading: "Diagnóstico Rápido"
- Subheading: one short line explaining this is a free, no-cost quick diagnostic
  (copy to be confirmed, not defined by this spec)

## i18n Requirement
The site is bilingual (es-MX / en-US) via i18next. All user-facing strings in
this config — question labels, option labels, "otro" placeholders, section
heading/subheading, and the `whatsappTemplate` — must be translation keys
resolved through the existing i18next setup, not hardcoded Spanish strings.

The Spanish copy below is the source content to translate; English strings
must be added to the corresponding locale file following the project's
existing i18next key structure (mirror however other sections on this page
are already keyed).

`sectionTitle` also needs an English equivalent (e.g. "Landing Pages" is
already language-neutral, but confirm against how other `sectionTitle`
values are handled if the Quoter is reused elsewhere with translated titles).

## Quoter Config (Spanish source content, to be run through i18next)

```typescript
const quoterConfig: QuoterProps = {
  instanceId: 'landing-pages-quoter',
  sectionTitle: 'Landing Pages',
  whatsappNumber: '522206315612', // confirm against current WhatsApp CTA number on the page
  whatsappTemplate: `Hola, completé mi diagnóstico rápido:
{answers_json}

Me gustaría recibir una propuesta personalizada.`,
  questions: [
    {
      id: 'business-type',
      type: 'single',
      required: true,
      label: '¿Qué tipo de negocio tienes?',
      options: [
        { id: 'beauty', label: 'Estética/Belleza' },
        { id: 'health', label: 'Servicios de salud' },
        { id: 'consulting', label: 'Consultoría' },
        { id: 'trades', label: 'Oficios/Talleres' },
        {
          id: 'other',
          label: 'Otro',
          includeOtherField: true,
          otherFieldPlaceholder: 'Describe tu negocio'
        }
      ]
    },
    {
      id: 'main-challenge',
      type: 'single',
      required: true,
      label: '¿Cuál es tu principal desafío?',
      options: [
        { id: 'customers', label: 'Conseguir más clientes' },
        { id: 'trust', label: 'Mostrar confianza' },
        { id: 'filter', label: 'Filtrar clientes' },
        { id: 'schedule', label: 'Agendar citas' },
        { id: 'prices', label: 'Mostrar precios' }
      ]
    },
    {
      id: 'digital-assets',
      type: 'multi',
      required: true,
      label: '¿Qué activos digitales ya tienes?',
      options: [
        { id: 'logo', label: 'Logo' },
        { id: 'photos', label: 'Fotos de calidad' },
        { id: 'instagram', label: 'Cuenta Instagram' },
        { id: 'gmaps', label: 'Perfil Google Maps' },
        { id: 'menu', label: 'Menús/Catálogo' },
        { id: 'testimonials', label: 'Testimonios' },
        { id: 'none', label: 'Ninguno', exclusive: true },
        {
          id: 'other',
          label: 'Otros',
          includeOtherField: true,
          otherFieldPlaceholder: 'Especifica qué tienes'
        }
      ]
    }
  ]
};
```

## English Equivalent (en-US locale)

The same structure, with these strings for the English locale file:

| Key | Spanish | English |
|---|---|---|
| section heading | Diagnóstico Rápido | Quick Diagnostic |
| business-type label | ¿Qué tipo de negocio tienes? | What type of business do you have? |
| beauty | Estética/Belleza | Beauty/Aesthetics |
| health | Servicios de salud | Health services |
| consulting | Consultoría | Consulting |
| trades | Oficios/Talleres | Trades/Workshops |
| other (business-type) | Otro | Other |
| business-type other placeholder | Describe tu negocio | Describe your business |
| main-challenge label | ¿Cuál es tu principal desafío? | What's your main challenge? |
| customers | Conseguir más clientes | Get more customers |
| trust | Mostrar confianza | Build trust |
| filter | Filtrar clientes | Filter leads |
| schedule | Agendar citas | Schedule appointments |
| prices | Mostrar precios | Show pricing |
| digital-assets label | ¿Qué activos digitales ya tienes? | What digital assets do you already have? |
| logo | Logo | Logo |
| photos | Fotos de calidad | Quality photos |
| instagram | Cuenta Instagram | Instagram account |
| gmaps | Perfil Google Maps | Google Maps profile |
| menu | Menús/Catálogo | Menu/Catalog |
| testimonials | Testimonios | Testimonials |
| none | Ninguno | None |
| other (digital-assets) | Otros | Other |
| digital-assets other placeholder | Especifica qué tienes | Specify what you have |
| whatsappTemplate | Hola, completé mi diagnóstico rápido:\n{answers_json}\n\nMe gustaría recibir una propuesta personalizada. | Hi, I completed the quick diagnostic:\n{answers_json}\n\nI'd like to receive a personalized proposal. |

Note: option `id` values stay identical across locales — only the displayed
`label` changes. The WhatsApp message language should match whichever locale
the user is viewing the page in when they submit.

## Expected WhatsApp Message Output

Given the answers below:
- business-type: `beauty`
- main-challenge: `customers`
- digital-assets: `logo`, `photos`, `other` → "Catálogo digital"

**es-MX:**
```
Hola, completé mi diagnóstico rápido:
- Tipo de negocio: Estética/Belleza
- Desafío principal: Conseguir más clientes
- Activos actuales: Logo, Fotos de calidad, Otros: Catálogo digital

Me gustaría recibir una propuesta personalizada.
```

**en-US:**
```
Hi, I completed the quick diagnostic:
- Business type: Beauty/Aesthetics
- Main challenge: Get more customers
- Current assets: Logo, Quality photos, Other: Digital catalog

I'd like to receive a personalized proposal.
```

The message language sent to WhatsApp must match the locale of the page the
user was on when they submitted, not a single hardcoded language.

## Acceptance Criteria
- [ ] Section renders between "Beneficios" and "Qué construimos" on both
      `/landing-pages/` (es-MX) and `/en-US/landing-pages/`
- [ ] All three questions match the config above exactly (ids, labels, order)
      in both locales
- [ ] `digital-assets` question: selecting "Ninguno"/"None" clears any other
      selection, and selecting any other option clears it back (per
      `exclusive` behavior defined in `quoter.spec.md`)
- [ ] Final WhatsApp message matches the expected output format above,
      in the language of the page the user submitted from
- [ ] `whatsappNumber` matches the number already used by the page's existing
      "Solicitar una propuesta" CTA (confirm before hardcoding)
- [ ] All labels, placeholders, and the WhatsApp template are pulled from
      i18next locale files — no hardcoded strings in the config passed to
      `Quoter`
- [ ] Option `id` values are identical across locales (only `label` changes)
- [ ] No changes made to the `Quoter` component source — this is config only

## Out of Scope
- Copy/microcopy for the section heading and subheading (confirm separately)
- Styling — handled by existing design skills/tokens
- Any change to the `Quoter` component's props, behavior, or tests