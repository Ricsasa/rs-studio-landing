# CalWidget Component Specification

## Overview
Generic, reusable component that renders a button which opens a Cal.com
scheduling modal. Built based on the resolved decisions in
`calcom-widget-discovery.spec.md`. First consumer is `homepage-quoter`,
replacing its current placeholder — other quoters may adopt it later, but
this component itself has no dependency on `Quoter` internals.

## Component Name
`CalWidget`

## Props

```typescript
interface CalWidgetProps {
  /**
   * Cal.com event identifier, e.g. "ricsasa/discovery-call".
   * Not hardcoded anywhere — always passed in from the consumer, which
   * should read it from an env var (e.g. PUBLIC_CAL_DISCOVERY_EVENT_SLUG).
   */
  eventSlug: string;

  /**
   * Button label shown to the user.
   */
  triggerLabel: string;

  /**
   * Only 'popup' is supported for now (resolved decision #1 in the
   * discovery spec). Kept as a literal union, not a boolean, so a future
   * mode can be added without a breaking prop rename.
   */
  mode: 'popup';

  /**
   * Theming to match RS Studio's flat, no-gradient, square-corner visual
   * language, mapped to whatever Cal.com's `cal-config` theming API
   * exposes (resolved decision #4).
   */
  theme?: CalThemeConfig;

  /**
   * Prefill data, mapped from the quoter's collected answers
   * (resolved decision #6). All optional — the modal must work with none
   * of them provided.
   */
  prefillName?: string;
  prefillEmail?: string;
  prefillNotes?: string;

  /**
   * Optional CSS class for the trigger button.
   */
  className?: string;

  /**
   * Fired when the modal successfully opens. Useful for analytics.
   */
  onOpen?: () => void;

  /**
   * Fired when Cal.com reports a completed booking (the embed's
   * `bookingSuccessfulV2` event), not merely when the modal opens.
   * Consumers use this to react to an actual scheduled call — e.g.
   * homepage-quoter's results screen swaps to a thank-you message.
   */
  onBookingSuccess?: () => void;
}

interface CalThemeConfig {
  brandColor?: string;
  borderRadius?: number; // square corners per design language — likely 0
  // extend with additional fields as Cal.com's theming API allows;
  // do not attempt to override parts of the calendar grid Cal.com
  // doesn't expose theming hooks for
}
```

## Behavior

### Script loading (resolved decision #3: lazy-load on click)
- Cal.com's embed SDK is NOT loaded on page load
- The first time the trigger button is clicked, dynamically import
  `@calcom/embed-react`'s `getCalApi` (or load the vanilla embed snippet
  if the React package isn't used) and initialize it
- Subsequent clicks reuse the already-loaded SDK instance — no repeated
  network requests
- While the SDK is loading, show a brief loading state on the button
  (e.g. disabled + spinner or "Cargando…" label) so a slow connection
  doesn't look like a broken button

### Opening the modal (resolved decision #1: popup only)
- On click (after the SDK is ready), open the Cal.com modal scoped to
  `eventSlug`
- The modal renders as an overlay on top of the current page — the page
  behind it (e.g. the quoter's results screen with the WhatsApp CTA)
  stays intact and interactive once the modal is closed
- Closing the modal (X button, overlay click, escape key — whatever
  Cal.com's embed provides natively) returns the user to the exact
  results screen state they were on, no page reload, no lost quoter
  answers

### Missing `eventSlug` (fail loudly, not silently)
- If `eventSlug` is empty or undefined when the component mounts, do not
  silently disable the button or fall back to a broken modal
- Render the button as disabled and log a clear console error identifying
  the missing prop, so this is caught immediately in development/staging
  rather than shipping a dead CTA to production
- This is expected to happen in the current phase, since the event slug
  is not yet finalized (see `calcom-widget-discovery.spec.md`, decision #2)

### Theming (resolved decision #4)
- Apply `theme` via Cal.com's `cal("ui", {...})` configuration call before
  opening the modal
- Map `theme.brandColor` and `theme.borderRadius` (and any other exposed
  fields) to their corresponding Cal.com theming keys
- If `theme` is omitted, fall back to Cal.com's default look rather than
  throwing — theming is a visual nice-to-have, not a functional
  requirement

### Prefill mapping (resolved decision #6)
- `prefillName` → passed as Cal.com's `name` config field
- `prefillEmail` → passed as Cal.com's `email` config field, omitted
  entirely from the config object if not provided (not passed as an
  empty string)
- `prefillNotes` → passed as Cal.com's `notes` config field, omitted
  entirely if not provided
- The component does not construct `prefillNotes` itself — formatting
  answers (project type, goal, telefono) into a readable notes string is
  the consumer's responsibility, same pattern as the WhatsApp
  `whatsappTemplate` in `quoter.spec.md`

### Booking success (post-launch addition)
- The embed's `bookingSuccessfulV2` event is registered via `cal("on", ...)`
  the same way `linkReady` is wired for `onOpen` — after the SDK is ready
  and before `cal("modal", ...)` opens
- `onBookingSuccess` fires only on an actual completed booking, not on
  modal open — distinct from `onOpen`
- First consumer: `homepage-quoter` passes `onBookingSuccess` to trigger
  its results-screen thank-you state (see `homepage-quoter.spec.md`,
  "Post-Launch Additions")

## Usage Example

```tsx
import CalWidget from '@/components/CalWidget';

<CalWidget
  eventSlug={import.meta.env.PUBLIC_CAL_DISCOVERY_EVENT_SLUG}
  triggerLabel={t('quoter.homepage.scheduleCta')}
  mode="popup"
  theme={{ brandColor: '#000000', borderRadius: 0 }}
  prefillName={answers.nombre}
  prefillEmail={answers.email}
  prefillNotes={formatCalNotes(answers)}
  // formatCalNotes builds a string like:
  // "Tipo de proyecto: Landing page\nObjetivo: Conseguir más clientes\nTeléfono: 33 1234 5678"
/>
```

## Testing Requirements

### Unit Tests

#### Test: Rendering
- [ ] Renders a button with `triggerLabel` as its text
- [ ] Button is disabled and logs a console error when `eventSlug` is
      empty or undefined
- [ ] Button is enabled when `eventSlug` is a non-empty string

#### Test: Script Loading
- [ ] Cal.com SDK is not loaded on initial render
- [ ] Clicking the button triggers the SDK to load exactly once
- [ ] Button shows a loading state while the SDK is loading
- [ ] Clicking the button a second time does not reload the SDK
- [ ] `onOpen` fires only after the modal successfully opens, not before

#### Test: Modal Behavior
- [ ] Clicking the button (with a valid `eventSlug`) opens the modal
      scoped to that `eventSlug`
- [ ] Closing the modal does not unmount or reset the page behind it
- [ ] Opening the modal twice in a row (open, close, open again) works
      correctly both times

#### Test: Theming
- [ ] `theme.brandColor` is passed through to Cal.com's `ui` config
- [ ] `theme.borderRadius` is passed through to Cal.com's `ui` config
- [ ] Component does not throw when `theme` is omitted

#### Test: Prefill Mapping
- [ ] `prefillName` is passed as Cal.com's `name` field
- [ ] `prefillEmail` is passed as Cal.com's `email` field when provided
- [ ] `prefillEmail` is omitted from the config (not passed as `""`) when
      not provided
- [ ] `prefillNotes` is passed as Cal.com's `notes` field when provided
- [ ] `prefillNotes` is omitted from the config when not provided
- [ ] Modal opens correctly when all three prefill props are omitted

### Integration Tests
- [ ] Component renders with only required props (`eventSlug`,
      `triggerLabel`, `mode`)
- [ ] Component renders with all optional props provided
- [ ] Multiple `CalWidget` instances on the same page (once reused by
      other quoters) don't interfere with each other's SDK state

### E2E Tests (Browser)
- [ ] Full flow: click trigger → SDK loads → modal opens → modal shows
      correct event
- [ ] Mobile viewport: button and modal are usable on a small screen
- [ ] Accessibility: button is reachable and triggerable via keyboard
- [ ] Accessibility: modal traps focus while open and returns focus to
      the trigger button on close

## Implementation Notes
- Build as a React island (`CalWidget.tsx`), consistent with the existing
  hybrid Astro/React boilerplate
- Use `@calcom/embed-react`'s `getCalApi` for the popup integration
  rather than hand-rolling the vanilla embed script, unless there's a
  reason to avoid the extra dependency
- State management: local component state only (loading/loaded/error),
  no external store needed
- Out of scope: server-side booking confirmation, webhooks, syncing
  bookings to any internal system — this component only opens the
  scheduling UI, it does not know or care what happens after a booking
  is made
- Out of scope: availability/timezone configuration — that's a Cal.com
  dashboard task (see `calcom-widget-discovery.spec.md`, decision #5),
  not something this component controls

## Files to Create
- `src/components/CalWidget.tsx` (main component)
- `src/components/CalWidget.test.ts` (unit tests with Vitest)
- `src/components/__tests__/calwidget.e2e.ts` (E2E tests with Playwright)

## Success Criteria
- ✅ Component renders and functions as specified
- ✅ All tests pass (unit + E2E)
- ✅ Works standalone without any `Quoter`-specific imports or assumptions
- ✅ Missing `eventSlug` fails visibly in development, never ships a dead
     button silently
- ✅ Ready to wire into `homepage-quoter`'s results screen once the event
     slug is finalized (see `calcom-widget-discovery.spec.md`)
