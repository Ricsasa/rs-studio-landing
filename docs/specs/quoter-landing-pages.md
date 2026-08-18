# Landing Pages — Quoter Integration Spec

## Status
Implemented. This document reflects the live config in
`public/locales/{es-MX,en-US}/services.json` (`landingPages.quoter`), rendered
by `src/components/services/ServiceQuoter.astro` inside
`src/components/services/ServicePage.astro`.

## Overview
The `Quoter` component (see `quoter.spec.md`) is wired into the
`/landing-pages/` page as a section titled "Diagnóstico Rápido". Config lives
entirely in the i18next locale files — no hardcoded strings in
`ServiceQuoter.astro`.

## Placement
`ServicePage.astro` renders sections in this order:
`Hero → Problem → PainPoints/Benefits → Quoter → Deliverables → DomainOptions
→ Trust → DesignedFor → Process → FAQ → FinalCta`.

For `landingPages`, `Deliverables` ("Qué construimos") and `DesignedFor`
("Diseñado para") are hidden (service-specific toggle in `ServicePage.astro`),
so the quoter renders between the pain points/benefits section and Domain
Options.

## Section Wrapper
- `instanceId`: `landing-pages-quoter`
- `sectionTitle`: "Landing Pages" (language-neutral, same in both locales)
- `heading`: "Diagnóstico Rápido" / "Quick Diagnostic"
- `subheading`: "Responde 3 preguntas y recibe una propuesta personalizada
  por WhatsApp, sin costo." / "Answer 3 questions and get a personalized
  proposal on WhatsApp, at no cost."

## i18n
All strings (question labels, option labels, "otro"/"other" placeholders,
heading/subheading, `whatsappTemplate`) live under `landingPages.quoter` in
`public/locales/es-MX/services.json` and `public/locales/en-US/services.json`.
Option `id` values are identical across locales — only `label` changes.

## whatsappNumber
Not part of the locale config. `ServiceQuoter.astro` passes the shared
constant `WHATSAPP_PHONE` from `src/lib/whatsapp.ts` (`"522206315612"`), the
same number used by the site's other WhatsApp CTAs.

## Quoter Config (current, es-MX source)

```json
{
  "instanceId": "landing-pages-quoter",
  "sectionTitle": "Landing Pages",
  "heading": "Diagnóstico Rápido",
  "subheading": "Responde 3 preguntas y recibe una propuesta personalizada por WhatsApp, sin costo.",
  "whatsappTemplate": "Hola, completé mi diagnóstico rápido:\n{answers_json}\n\nMe gustaría recibir una propuesta personalizada.",
  "questions": [
    {
      "id": "business-type",
      "type": "single",
      "required": true,
      "label": "¿Qué tipo de negocio tienes?",
      "options": [
        { "id": "salon", "label": "Salón" },
        { "id": "barbershop", "label": "Barbería" },
        { "id": "spa", "label": "Spa" },
        { "id": "aesthetics", "label": "Estética" },
        { "id": "workshop", "label": "Taller (mecánico, eléctrico, etc)" },
        { "id": "consulting", "label": "Consultoría (Legal, Financiera, Bienes raíces)" },
        { "id": "medical", "label": "Servicios médicos (Consulta privada, Nutrición, Dentista, Atención psicológica)" },
        { "id": "fitness", "label": "Fitness (Gimnasio, Crossfit, Pilates, Entrenamientos personalizados)" },
        { "id": "other-services", "label": "Otro negocio de servicios" },
        {
          "id": "other",
          "label": "Otro",
          "includeOtherField": true,
          "otherFieldPlaceholder": "Describe tu negocio"
        }
      ]
    },
    {
      "id": "main-challenge",
      "type": "multi",
      "required": true,
      "label": "¿Cuáles son tus principales desafíos?",
      "options": [
        { "id": "customers", "label": "Conseguir más clientes" },
        { "id": "trust", "label": "Mostrar confianza" },
        { "id": "filter", "label": "Filtrar clientes" },
        { "id": "schedule", "label": "Agendar citas" },
        { "id": "prices", "label": "Mostrar precios" }
      ]
    },
    {
      "id": "digital-assets",
      "type": "multi",
      "required": true,
      "label": "¿Qué activos digitales ya tienes?",
      "options": [
        { "id": "logo", "label": "Logo" },
        { "id": "photos", "label": "Fotos de calidad" },
        { "id": "instagram", "label": "Cuenta Instagram" },
        { "id": "gmaps", "label": "Perfil Google Maps" },
        { "id": "menu", "label": "Menús/Catálogo" },
        { "id": "testimonials", "label": "Testimonios" },
        { "id": "none", "label": "Ninguno", "exclusive": true },
        {
          "id": "other",
          "label": "Otros",
          "includeOtherField": true,
          "otherFieldPlaceholder": "Especifica qué tienes"
        }
      ]
    }
  ]
}
```

## English Equivalent (en-US locale, live)

| Key | Spanish | English |
|---|---|---|
| section heading | Diagnóstico Rápido | Quick Diagnostic |
| section subheading | Responde 3 preguntas y recibe una propuesta personalizada por WhatsApp, sin costo. | Answer 3 questions and get a personalized proposal on WhatsApp, at no cost. |
| business-type label | ¿Qué tipo de negocio tienes? | What type of business do you have? |
| salon | Salón | Salon |
| barbershop | Barbería | Barbershop |
| spa | Spa | Spa |
| aesthetics | Estética | Aesthetics |
| workshop | Taller (mecánico, eléctrico, etc) | Workshop (auto, electrical, etc) |
| consulting | Consultoría (Legal, Financiera, Bienes raíces) | Consulting (Legal, Financial, Real estate) |
| medical | Servicios médicos (Consulta privada, Nutrición, Dentista, Atención psicológica) | Medical services (Private practice, Nutrition, Dental, Psychological care) |
| fitness | Fitness (Gimnasio, Crossfit, Pilates, Entrenamientos personalizados) | Fitness (Gym, Crossfit, Pilates, Personal training) |
| other-services | Otro negocio de servicios | Other service business |
| other (business-type) | Otro | Other |
| business-type other placeholder | Describe tu negocio | Describe your business |
| main-challenge label | ¿Cuáles son tus principales desafíos? | What are your main challenges? |
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
`label` changes. The WhatsApp message language matches whichever locale the
user is viewing the page in when they submit.

## Expected WhatsApp Message Output

Given the answers below:
- business-type: `fitness`
- main-challenge: `customers`, `schedule`
- digital-assets: `logo`, `photos`, `other` → "Catálogo digital"

**es-MX:**
```
Hola, completé mi diagnóstico rápido:
- Tipo de negocio: Fitness (Gimnasio, Crossfit, Pilates, Entrenamientos personalizados)
- Desafíos principales: Conseguir más clientes, Agendar citas
- Activos actuales: Logo, Fotos de calidad, Otros: Catálogo digital

Me gustaría recibir una propuesta personalizada.
```

**en-US:**
```
Hi, I completed the quick diagnostic:
- Business type: Fitness (Gym, Crossfit, Pilates, Personal training)
- Main challenges: Get more customers, Schedule appointments
- Current assets: Logo, Quality photos, Other: Digital catalog

I'd like to receive a personalized proposal.
```

The message language sent to WhatsApp matches the locale of the page the
user was on when they submitted, not a single hardcoded language.

## Acceptance Criteria (met)
- [x] Section renders on both `/landing-pages/` (es-MX) and
      `/en-US/landing-pages/`, between pain points/benefits and Domain
      Options (Deliverables and DesignedFor are hidden for this service)
- [x] All three questions match the config above exactly (ids, labels,
      order) in both locales
- [x] `business-type` includes 10 options: salon, barbershop, spa,
      aesthetics, workshop, consulting, medical, fitness, other-services,
      other (with free-text field)
- [x] `digital-assets` question: selecting "Ninguno"/"None" clears any other
      selection, and selecting any other option clears it back (`exclusive`
      behavior defined in `quoter.spec.md`)
- [x] Final WhatsApp message matches the expected output format above, in
      the language of the page the user submitted from
- [x] `whatsappNumber` is the shared `WHATSAPP_PHONE` constant
      (`src/lib/whatsapp.ts`), same number used by the site's other
      WhatsApp CTAs
- [x] All labels, placeholders, and the WhatsApp template are pulled from
      i18next locale files — no hardcoded strings in `ServiceQuoter.astro`
- [x] Option `id` values are identical across locales (only `label` changes)
- [x] No changes made to the `Quoter` component's props, behavior, or tests

## Out of Scope
- Styling — handled by existing design skills/tokens
- Any change to the `Quoter` component's props, behavior, or tests
