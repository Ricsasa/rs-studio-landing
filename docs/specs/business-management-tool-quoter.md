# Business Management Tool — Quoter Integration Spec

## Status
Implemented. This document reflects the live config in
`public/locales/{es-MX,en-US}/services.json`
(`businessManagementTool.quoter`), rendered by
`src/components/services/ServiceQuoter.astro` inside
`src/components/services/ServicePage.astro`.

## Overview
The `Quoter` component (see `quoter.spec.md`) is wired into the
`/business-management-tool/` page as a section titled "Diagnóstico Rápido".
Questions are built around the pain point categories identified for
micro/small businesses (salones, barberías, spas, talleres, consultorías,
servicios médicos, fitness): financial control, inventory, staff management,
and reporting/decisions.

## Placement
`ServicePage.astro` renders sections in this order:
`Hero → Problem → PainPoints/Benefits → Quoter → Deliverables → DomainOptions
→ Trust → DesignedFor → Process → FAQ → FinalCta`.

The quoter renders between the pain points/benefits section and Deliverables
("Qué construimos") for this service.

## Section Wrapper
- `instanceId`: `business-management-tool-quoter` (does not collide with
  `landing-pages-quoter`)
- `sectionTitle`: "Herramienta de Control Empresarial" / "Business
  Management Tool"
- `heading`: "Diagnóstico Rápido" / "Quick Diagnostic"
- `subheading`: "Responde 3 preguntas y recibe una propuesta personalizada
  por WhatsApp, sin costo." / "Answer 3 questions and get a personalized
  proposal on WhatsApp, at no cost."

## i18n
All strings (question labels, option labels, "otro"/"other" placeholders,
heading/subheading, `whatsappTemplate`) live under
`businessManagementTool.quoter` in `public/locales/es-MX/services.json` and
`public/locales/en-US/services.json`. Option `id` values are identical
across locales — only `label` changes.

## whatsappNumber
Not part of the locale config. `ServiceQuoter.astro` passes the shared
constant `WHATSAPP_PHONE` from `src/lib/whatsapp.ts` (`"522206315612"`), the
same number used by the site's other WhatsApp CTAs and by the
`landing-pages-quoter`.

## Quoter Config (current, es-MX source)

```json
{
  "instanceId": "business-management-tool-quoter",
  "sectionTitle": "Herramienta de Control Empresarial",
  "heading": "Diagnóstico Rápido",
  "subheading": "Responde 3 preguntas y recibe una propuesta personalizada por WhatsApp, sin costo.",
  "whatsappTemplate": "Hola, completé mi diagnóstico rápido:\n{answers_json}\n\nMe interesa saber más sobre cómo esta herramienta puede ayudar mi negocio.",
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
      "id": "main-pain-point",
      "type": "single",
      "required": true,
      "label": "¿Cuál es tu mayor dolor de cabeza operativo?",
      "options": [
        { "id": "financial", "label": "Control financiero (ingresos, gastos, cobros)" },
        { "id": "inventory", "label": "Inventario y compras" },
        { "id": "staff", "label": "Gestión de equipo y nómina" },
        { "id": "reporting", "label": "Reportes y datos para decidir" },
        {
          "id": "other",
          "label": "Otro",
          "includeOtherField": true,
          "otherFieldPlaceholder": "Describe tu principal problema"
        }
      ]
    },
    {
      "id": "current-tracking",
      "type": "multi",
      "required": true,
      "label": "¿Cómo llevas el control de tu negocio hoy?",
      "options": [
        { "id": "spreadsheets", "label": "Hojas de cálculo" },
        { "id": "notebooks", "label": "Cuadernos o papel" },
        { "id": "multiple-apps", "label": "Varias aplicaciones sueltas" },
        { "id": "none", "label": "Nada, lo llevo de memoria", "exclusive": true },
        {
          "id": "other",
          "label": "Otro",
          "includeOtherField": true,
          "otherFieldPlaceholder": "Especifica cómo lo llevas"
        }
      ]
    }
  ]
}
```

Note: `business-type` uses the same option set (and same option `id`s) as
the `landing-pages-quoter`, kept in sync across both services.

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
| main-pain-point label | ¿Cuál es tu mayor dolor de cabeza operativo? | What's your biggest operational headache? |
| financial | Control financiero (ingresos, gastos, cobros) | Financial control (income, expenses, collections) |
| inventory | Inventario y compras | Inventory and purchasing |
| staff | Gestión de equipo y nómina | Staff management and payroll |
| reporting | Reportes y datos para decidir | Reports and data for decisions |
| other (main-pain-point) | Otro | Other |
| main-pain-point other placeholder | Describe tu principal problema | Describe your main problem |
| current-tracking label | ¿Cómo llevas el control de tu negocio hoy? | How do you currently track your business? |
| spreadsheets | Hojas de cálculo | Spreadsheets |
| notebooks | Cuadernos o papel | Notebooks or paper |
| multiple-apps | Varias aplicaciones sueltas | Several separate apps |
| none | Nada, lo llevo de memoria | Nothing, I keep it in my head |
| other (current-tracking) | Otro | Other |
| current-tracking other placeholder | Especifica cómo lo llevas | Specify how you track it |
| whatsappTemplate | Hola, completé mi diagnóstico rápido:\n{answers_json}\n\nMe interesa saber más sobre cómo esta herramienta puede ayudar mi negocio. | Hi, I completed the quick diagnostic:\n{answers_json}\n\nI'd like to learn more about how this tool can help my business. |

Note: option `id` values stay identical across locales — only the displayed
`label` changes.

## Expected WhatsApp Message Output

Given the answers below:
- business-type: `fitness`
- main-pain-point: `staff`
- current-tracking: `spreadsheets`, `notebooks`

**es-MX:**
```
Hola, completé mi diagnóstico rápido:
- Tipo de negocio: Fitness (Gimnasio, Crossfit, Pilates, Entrenamientos personalizados)
- Mayor dolor de cabeza: Gestión de equipo y nómina
- Control actual: Hojas de cálculo, Cuadernos o papel

Me interesa saber más sobre cómo esta herramienta puede ayudar mi negocio.
```

**en-US:**
```
Hi, I completed the quick diagnostic:
- Business type: Fitness (Gym, Crossfit, Pilates, Personal training)
- Biggest headache: Staff management and payroll
- Current tracking: Spreadsheets, Notebooks or paper

I'd like to learn more about how this tool can help my business.
```

The message language sent to WhatsApp matches the locale of the page the
user was on when they submitted, not a single hardcoded language.

## Acceptance Criteria (met)
- [x] Section renders on both `/business-management-tool/` (es-MX) and
      `/en-US/business-management-tool/`, between pain points/benefits and
      Deliverables
- [x] All three questions match the config above exactly (ids, labels,
      order) in both locales
- [x] `business-type` includes 10 options: salon, barbershop, spa,
      aesthetics, workshop, consulting, medical, fitness, other-services,
      other (with free-text field) — same set as `landing-pages-quoter`
- [x] `current-tracking` question: selecting "Nada, lo llevo de memoria"/
      "Nothing, I keep it in my head" clears any other selection, and
      selecting any other option clears it back (`exclusive` behavior
      defined in `quoter.spec.md`)
- [x] Final WhatsApp message matches the expected output format above, in
      the language of the page the user submitted from
- [x] `whatsappNumber` is the shared `WHATSAPP_PHONE` constant
      (`src/lib/whatsapp.ts`), same number used by the site's other
      WhatsApp CTAs
- [x] All labels, placeholders, and the WhatsApp template are pulled from
      i18next locale files — no hardcoded strings in `ServiceQuoter.astro`
- [x] Option `id` values are identical across locales (only `label` changes)
- [x] No changes made to the `Quoter` component's props, behavior, or tests
- [x] `instanceId` (`business-management-tool-quoter`) does not collide
      with the `landing-pages-quoter` instance

## Out of Scope
- Styling — handled by existing design skills/tokens
- Any change to the `Quoter` component's props, behavior, or tests
- Mapping `main-pain-point` answers to specific service recommendations
  (this quoter only qualifies and routes to WhatsApp — no dynamic
  recommendation logic is included)
