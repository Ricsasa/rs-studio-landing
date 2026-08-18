# Business Management Tool — Quoter Integration Spec

## Overview
Integrate the existing `Quoter` component (see `quoter.spec.md`) into the
`/business-management-tool/` page as a new section titled "Diagnóstico
Rápido". This is a config-only integration — no changes to the `Quoter`
component itself. Questions are built around the pain point categories
identified for micro/small businesses (talleres, salones, barberías, spas):
financial control, inventory, staff management, and reporting/decisions.

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

## Quoter Config (Spanish source content, to be run through i18next)

```typescript
const quoterConfig: QuoterProps = {
  instanceId: 'business-management-tool-quoter',
  sectionTitle: 'Herramienta de Control Empresarial',
  whatsappNumber: '522206315612', // confirm against current WhatsApp CTA number on the page
  whatsappTemplate: `Hola, completé mi diagnóstico rápido:
{answers_json}

Me interesa saber más sobre cómo esta herramienta puede ayudar mi negocio.`,
  questions: [
    {
      id: 'business-type',
      type: 'single',
      required: true,
      label: '¿Qué tipo de negocio tienes?',
      options: [
        { id: 'salon-barbershop', label: 'Salón/Barbería' },
        { id: 'spa-aesthetics', label: 'Spa/Estética' },
        { id: 'workshop', label: 'Taller (mecánico, eléctrico, etc)' },
        { id: 'other-services', label: 'Otro negocio de servicios' },
        {
          id: 'other',
          label: 'Otro',
          includeOtherField: true,
          otherFieldPlaceholder: 'Describe tu negocio'
        }
      ]
    },
    {
      id: 'main-pain-point',
      type: 'single',
      required: true,
      label: '¿Cuál es tu mayor dolor de cabeza operativo?',
      options: [
        { id: 'financial', label: 'Control financiero (ingresos, gastos, cobros)' },
        { id: 'inventory', label: 'Inventario y compras' },
        { id: 'staff', label: 'Gestión de equipo y nómina' },
        { id: 'reporting', label: 'Reportes y datos para decidir' },
        {
          id: 'other',
          label: 'Otro',
          includeOtherField: true,
          otherFieldPlaceholder: 'Describe tu principal problema'
        }
      ]
    },
    {
      id: 'current-tracking',
      type: 'multi',
      required: true,
      label: '¿Cómo llevas el control de tu negocio hoy?',
      options: [
        { id: 'spreadsheets', label: 'Hojas de cálculo' },
        { id: 'notebooks', label: 'Cuadernos o papel' },
        { id: 'multiple-apps', label: 'Varias aplicaciones sueltas' },
        { id: 'none', label: 'Nada, lo llevo de memoria', exclusive: true },
        {
          id: 'other',
          label: 'Otro',
          includeOtherField: true,
          otherFieldPlaceholder: 'Especifica cómo lo llevas'
        }
      ]
    }
  ]
};
```

## English Equivalent (en-US locale)

| Key | Spanish | English |
|---|---|---|
| section heading | Diagnóstico Rápido | Quick Diagnostic |
| business-type label | ¿Qué tipo de negocio tienes? | What type of business do you have? |
| salon-barbershop | Salón/Barbería | Salon/Barbershop |
| spa-aesthetics | Spa/Estética | Spa/Aesthetics |
| workshop | Taller (mecánico, eléctrico, etc) | Workshop (auto, electrical, etc) |
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
- business-type: `salon-barbershop`
- main-pain-point: `inventory`
- current-tracking: `spreadsheets`, `notebooks`

**es-MX:**
```
Hola, completé mi diagnóstico rápido:
- Tipo de negocio: Salón/Barbería
- Mayor dolor de cabeza: Inventario y compras
- Control actual: Hojas de cálculo, Cuadernos o papel

Me interesa saber más sobre cómo esta herramienta puede ayudar mi negocio.
```

**en-US:**
```
Hi, I completed the quick diagnostic:
- Business type: Salon/Barbershop
- Biggest headache: Inventory and purchasing
- Current tracking: Spreadsheets, Notebooks or paper

I'd like to learn more about how this tool can help my business.
```

The message language sent to WhatsApp must match the locale of the page the
user was on when they submitted, not a single hardcoded language.

## Acceptance Criteria
- [ ] Section renders between "Beneficios" and "Qué construimos" on both
      `/business-management-tool/` (es-MX) and
      `/en-US/business-management-tool/`
- [ ] All three questions match the config above exactly (ids, labels, order)
      in both locales
- [ ] `current-tracking` question: selecting "Nada, lo llevo de memoria"/
      "Nothing, I keep it in my head" clears any other selection, and
      selecting any other option clears it back (per `exclusive` behavior
      defined in `quoter.spec.md`)
- [ ] Final WhatsApp message matches the expected output format above,
      in the language of the page the user submitted from
- [ ] `whatsappNumber` matches the number already used by the page's existing
      "Solicitar una propuesta" CTA (confirm before hardcoding)
- [ ] All labels, placeholders, and the WhatsApp template are pulled from
      i18next locale files — no hardcoded strings in the config passed to
      `Quoter`
- [ ] Option `id` values are identical across locales (only `label` changes)
- [ ] No changes made to the `Quoter` component source — this is config only
- [ ] `instanceId` (`business-management-tool-quoter`) does not collide with
      the `landing-pages-quoter` instance if both are ever rendered on the
      same page/build

## Out of Scope
- Copy/microcopy for the section heading and subheading (confirm separately)
- Styling — handled by existing design skills/tokens
- Any change to the `Quoter` component's props, behavior, or tests
- Mapping `main-pain-point` answers to specific service recommendations
  (this quoter only qualifies and routes to WhatsApp — no dynamic
  recommendation logic is included)