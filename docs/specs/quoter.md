# Quoter Component Specification

## Overview
Generic, reusable component for multi-step questionnaires that funnel leads to WhatsApp with pre-populated answers. Used across service pages to qualify leads and capture data.

## Component Name
`Quoter`

## Props

```typescript
interface QuoterProps {
  /**
   * Unique identifier for this quoter instance (landing-pages, business-management-tool, etc)
   * Used for tracking, analytics, and WhatsApp message routing
   */
  instanceId: string;

  /**
   * Page/section title for context in WhatsApp message
   * Example: "Landing Pages Quoter", "Business Management Tool Quoter"
   */
  sectionTitle: string;

  /**
   * Array of questions to display sequentially
   */
  questions: Question[];

  /**
   * WhatsApp phone number where messages will be sent (with country code, no + or spaces)
   * Example: "522206315612"
   */
  whatsappNumber: string;

  /**
   * Template for the WhatsApp message. Supports placeholders.
   * Available placeholders: {sectionTitle}, {answers_json}
   * Example: "Hola, completé mi diagnóstico de {sectionTitle}:\n{answers_json}\n\nMe gustaría recibir una propuesta personalizada."
   */
  whatsappTemplate: string;

  /**
   * Optional CSS class for styling wrapper
   */
  className?: string;

  /**
   * Callback fired when user clicks "Enviar a WhatsApp"
   * Useful for analytics/tracking
   */
  onSubmit?: (answers: AnswerRecord) => void;
}

/**
 * Single question in the quoter
 */
interface Question {
  id: string; // unique identifier for this question
  type: "single" | "multi"; // single select or multi-select
  label: string; // question text
  options: Option[];
  required?: boolean; // default: true
}

/**
 * Each selectable option
 */
interface Option {
  id: string; // unique identifier
  label: string; // display text
  includeOtherField?: boolean; // if true, shows text input for "otro" when selected
  otherFieldPlaceholder?: string; // custom placeholder for "otro" field
  exclusive?: boolean; // multi-select only: selecting this deselects all others (e.g. "Ninguno")
}

/**
 * User's answer to a question
 */
interface Answer {
  questionId: string;
  selectedOptionIds: string[]; // array, even for single-select
  otherValue?: string; // text entered in "otro" field if applicable
}

/**
 * Record of all answers keyed by question ID
 */
type AnswerRecord = Record<string, Answer>;
```

## Behavior

### Question Flow
1. Display questions one at a time (step N/Total)
2. User selects option(s) based on question type
3. If `includeOtherField` is true on selected option, show text input below
4. "Siguiente" button appears when question is answered (or optional if not required)
5. Continue to next question or show summary

### Summary View
- Display all questions with selected answers in readable format
- Show "otro" values if provided
- "Enviar a WhatsApp" button at bottom

### WhatsApp Integration
When user clicks "Enviar a WhatsApp":
1. Format answers into readable message
2. Populate `whatsappTemplate` with placeholders
3. URL-encode and open WhatsApp web link: `https://wa.me/{whatsappNumber}?text={encodedMessage}`
4. Fire `onSubmit` callback with answer data
5. Optional: track in analytics

### "Otro" Field Behavior
- Text input appears inline below selected option (if `includeOtherField: true`)
- Max 100 characters
- Optional field (can be empty)
- If user selects "otro" option but leaves text empty, include in WhatsApp as "Otro: (sin especificar)"

### "Exclusive" Option Behavior (multi-select only)
- Used for options like "Ninguno" that logically conflict with any other selection
- Selecting an `exclusive` option immediately clears all other selections for that question
- Selecting any other option while an `exclusive` option is active clears the exclusive selection
- At most one `exclusive` option should be defined per question

### Validation Rules (when is a question "answered")
- `type: "single"`, `required: true` → exactly one option selected
- `type: "multi"`, `required: true` → at least one option selected
- `required: false` → "Siguiente" is always enabled, question can be skipped
- Selecting an option with `includeOtherField: true` does NOT require the text field to be filled to advance

## Usage Examples

### Landing Pages Section
```astro
---
import Quoter from '@/components/Quoter.astro';

const quoterConfig = {
  instanceId: 'landing-pages-quoter',
  sectionTitle: 'Landing Pages',
  whatsappNumber: '522206315612',
  whatsappTemplate: `Hola, completé mi diagnóstico de {sectionTitle}:
{answers_json}

Me gustaría recibir una propuesta personalizada.`,
  questions: [
    {
      id: 'q1-business-type',
      type: 'single',
      label: '¿Qué tipo de negocio tienes?',
      options: [
        { id: 'opt-beauty', label: 'Estética/Belleza' },
        { id: 'opt-health', label: 'Servicios de salud' },
        { id: 'opt-consulting', label: 'Consultoría' },
        { id: 'opt-trades', label: 'Oficios/Talleres' },
        { id: 'opt-other', label: 'Otro', includeOtherField: true, otherFieldPlaceholder: 'Describe tu negocio' }
      ]
    },
    {
      id: 'q2-challenge',
      type: 'single',
      label: '¿Cuál es tu principal desafío?',
      options: [
        { id: 'opt-customers', label: 'Conseguir más clientes' },
        { id: 'opt-trust', label: 'Mostrar confianza' },
        { id: 'opt-filter', label: 'Filtrar clientes' },
        { id: 'opt-schedule', label: 'Agendar citas' },
        { id: 'opt-prices', label: 'Mostrar precios' }
      ]
    },
    {
      id: 'q3-assets',
      type: 'multi',
      label: '¿Qué activos digitales ya tienes?',
      options: [
        { id: 'opt-logo', label: 'Logo' },
        { id: 'opt-photos', label: 'Fotos de calidad' },
        { id: 'opt-instagram', label: 'Cuenta Instagram' },
        { id: 'opt-gmaps', label: 'Perfil Google Maps' },
        { id: 'opt-menu', label: 'Menús/Catálogo' },
        { id: 'opt-testimonials', label: 'Testimonios' },
        { id: 'opt-none', label: 'Ninguno' },
        { id: 'opt-other', label: 'Otros', includeOtherField: true, otherFieldPlaceholder: 'Especifica qué tienes' }
      ]
    }
  ]
};
---

<Quoter {...quoterConfig} />
```

### Business Management Tool Section
```astro
---
import Quoter from '@/components/Quoter.astro';

const quoterConfig = {
  instanceId: 'bmt-quoter',
  sectionTitle: 'Herramienta de Control Empresarial',
  whatsappNumber: '522206315612',
  whatsappTemplate: `Hola, completé mi diagnóstico de {sectionTitle}:
{answers_json}

Me interesa saber más sobre cómo esta herramienta puede ayudar mi negocio.`,
  questions: [
    // ... question configuration
  ]
};
---

<Quoter {...quoterConfig} />
```

## Message Format

The `{answers_json}` placeholder will be replaced with a formatted string:

```
- Tipo de negocio: Estética/Belleza
- Desafío principal: Conseguir más clientes
- Activos actuales: Logo, Fotos de calidad, Otros: Catálogo digital
```

Not JSON, but a readable bullet-point format.

## Testing Requirements

### Unit Tests

#### Test: Single Select Question
- [ ] User can select one option from single-select question
- [ ] Selecting another option deselects the previous one
- [ ] "Otro" field appears when "Otro" option is selected
- [ ] "Otro" field is hidden when "Otro" option is deselected
- [ ] User can enter text in "Otro" field (max 100 chars)

#### Test: Multi-Select Question
- [ ] User can select multiple options
- [ ] User can deselect options
- [ ] "Otro" field appears only when "Otro" option is selected
- [ ] Text input doesn't affect other selections
- [ ] Selecting an option marked `exclusive: true` (e.g. "Ninguno") deselects all other options
- [ ] Selecting any other option while an `exclusive` option is active deselects the exclusive one

#### Test: Question Flow
- [ ] First question displays on load
- [ ] Step counter shows correctly (1/3, 2/3, etc)
- [ ] "Siguiente" button disabled until question meets its answer requirement (see Validation Rules)
- [ ] "Siguiente" button always enabled when `required: false`
- [ ] Clicking "Siguiente" advances to next question
- [ ] Clicking back goes to previous question, preserving prior answers
- [ ] Back button is hidden or disabled on the first question
- [ ] Summary displays all answers after final question

#### Test: WhatsApp Integration
- [ ] WhatsApp link is correctly formatted
- [ ] Message contains all selected answers
- [ ] "Otro" values are included in message
- [ ] Message is URL-encoded properly
- [ ] Clicking "Enviar a WhatsApp" opens correct WhatsApp link
- [ ] `onSubmit` callback is fired with correct answer data

#### Test: Edge Cases
- [ ] User selects "Otro" but leaves text empty → message shows "sin especificar"
- [ ] Multi-select with only one option selected works correctly
- [ ] Required multi-select with zero options selected → cannot proceed
- [ ] Special characters in "Otro" field are escaped properly before URL encoding

### Integration Tests
- [ ] Component renders with minimal required props
- [ ] Component renders with all optional props
- [ ] Component works independently across multiple instances on same page
- [ ] Different `instanceId` values don't interfere with each other

### E2E Tests (Browser)
- [ ] Full user journey: Answer all questions → View summary → Send to WhatsApp
- [ ] Mobile viewport: All elements readable and clickable on mobile
- [ ] Accessibility: All options reachable via keyboard
- [ ] Accessibility: Form labels associated with inputs

## Implementation Notes

- Build as a React island (`Quoter.tsx`) rendered inside an Astro page/section, consistent with the existing hybrid boilerplate
- State management: local component state only (`useState`/`useReducer`), no external store needed
- No external dependencies beyond your existing setup
- Mobile-first responsive design (delegated to project design skills/tokens, not defined here)
- URL encoding: Use `encodeURIComponent()` for the final WhatsApp message string
- Timezone: Not relevant for this component
- Analytics: Delegate via `onSubmit` callback (optional) — do not hardcode any analytics provider in the component
- Out of scope: persisting answers across page reloads, saving to a database, or sending the WhatsApp message server-side. This is a pure client-side funnel to `wa.me`.
- English and spanish support.

## Files to Create
- `src/components/Quoter.astro` (main component)
- `src/components/Quoter.test.ts` (unit tests with Vitest)
- `src/components/__tests__/quoter.e2e.ts` (E2E tests with Playwright)
- `.claude-spec/quoter.spec.md` (this file, for reference)

## Success Criteria
- ✅ Component renders and functions as specified
- ✅ All tests pass (unit + E2E)
- ✅ Can be used in 2+ sections without modification
- ✅ WhatsApp message is clear and actionable
- ✅ Mobile responsive and accessible