# Feature: Form + live preview

**From build-plan:** feature 2
**Status:** complete

## Goal

Add the recipient/course/date/instructor inputs and wire them to
`BlackBorderCertificate` so the preview updates as you type. This turns
feature 1's static placeholder render into the actual product loop: type,
see the certificate update live.

## In scope

- A client component, `CertificateBuilder`, holding form state for the four
  `CertificateData` fields (`recipientName`, `courseTitle`, `date`,
  `instructorName`) and rendering both the inputs and the live
  `BlackBorderCertificate` preview from that state.
- A sensible first-run/empty state: when a field is blank, the preview shows
  placeholder text (e.g. "Recipient Name") instead of a blank gap, so the
  certificate never looks broken before the user types anything.
- The two-column app-chrome layout described in `project-overview.md`'s
  UI/UX section: form panel on the left, live preview on the right, using the
  dark chrome tokens already ported into `app/globals.css` in feature 1
  (`bg-surface`, `border-border`, `text-text`, `bg-accent`, etc.). Stacks
  vertically on narrow viewports.
- Wiring `CertificateBuilder` into `app/page.tsx`, replacing feature 1's
  static centered placeholder render.

## Out of scope

- Defaulting the instructor field from brand settings - `BrandSettings`
  doesn't exist yet (feature 6a). The instructor field starts blank like the
  others; feature 6a wires in a real default later.
- Persisting form values (to local storage or otherwise) - "remember the
  last form values" is feature 7's job. State here is in-memory only and
  resets on reload.
- Date picker, date formatting, and Zod validation (feature 8). The date
  field is a plain text input for now.
- Long-name/course-title auto-fit (feature 8).
- Download PNG/PDF buttons (features 3-4) - no export UI yet, just the form
  and preview.
- Template picker, brand-settings panel, and history list (features 5, 6, 7)
  - not built yet; the layout doesn't need to reserve space for them.

## Build steps

- [x] **Step 1 - `CertificateBuilder` state and live binding** - new
  `components/certificate/CertificateBuilder.tsx` (`'use client'`): `useState`
  holding `CertificateData` initialized to all-empty strings, four labeled
  controlled inputs (recipient name, course title, date as plain text,
  instructor name), and a derived "preview" object that substitutes a
  placeholder string (e.g. "Recipient Name", "Course Title", "Date",
  "Instructor Name") for any field that's still empty, passed to
  `BlackBorderCertificate`. Wired into `app/page.tsx` in place of the
  feature 1 placeholder. Also added `autoComplete="off"` to all inputs after
  the browser autofilled the empty fields with unrelated saved data on load,
  which would have broken the empty-state done-when for real users too.
  *Done when:* typing into any input immediately updates the corresponding
  text in the rendered certificate preview, and the preview shows the
  placeholder strings before anything is typed. Verified with Playwright:
  hard-reload showed genuinely empty fields with placeholder text, and
  typing into all four fields updated the preview live.
- [x] **Step 2 - Two-column app-chrome layout** - styled `CertificateBuilder`
  into the two-column layout: dark form panel (`bg-surface`/`border-border`)
  on the left with accent focus rings, live preview on the right
  (`md:sticky`). Stacks to one column below `md`. `app/page.tsx` widened to
  `max-w-5xl`. Also fixed `BlackBorderCertificate` (beyond the spec's file
  list): the narrow-viewport screenshot revealed the certificate's fixed
  padding/font sizes overflowing its aspect-ratio box at small widths,
  overlapping the border - added `sm:` responsive sizing throughout,
  verified fixed at 480px and unchanged at 1280px. *Done when:* desktop
  screenshot shows the two-column dark-chrome layout; narrow-viewport
  screenshot shows the form stacked above a cleanly-rendered preview.

## Files / areas

- `components/certificate/CertificateBuilder.tsx` - new
- `components/certificate/BlackBorderCertificate.tsx` - responsive sizing
  (not originally scoped, needed once step 2's own check found the overflow)
- `app/page.tsx` - renders `CertificateBuilder` instead of the static
  placeholder

## Data / contracts

- Reuses `CertificateData` from feature 1 (`types/certificate.ts`) - no
  changes to the type. Component state is `CertificateData` minus `logoUrl`
  (not collected by this form; stays `undefined`, which
  `BlackBorderCertificate` already renders as the placeholder mark).
- The empty-field placeholder substitution is view-only, computed in
  `CertificateBuilder` for the preview render - it never touches the actual
  stored state, so a field showing "Recipient Name" is genuinely empty, not
  pre-filled.

## Testing

- No test runner configured, and no parsing/formatting/validation logic was
  added (feature 8 owns that) - verified with build, typecheck, lint, and
  Playwright browser evidence, consistent with the Testing gate for
  UI/integration work.
- `/audit` additionally checked two risks by direct browser testing rather
  than inference: pressing Enter in a form field does not trigger an
  implicit submission/reload (confirmed - no navigation, value persisted),
  and the responsive breakpoint transition zone (~640-660px) renders
  cleanly, not just the two widths originally screenshotted.

## Notes for the AI

- `CertificateBuilder` is the first client component in the app
  (`'use client'`) - `app/page.tsx` stays a server component that just
  renders it.
- Certificate tokens and chrome tokens stayed separate as intended - no
  chrome dark-mode tokens leaked into the certificate's colors.

## Findings carried forward (still open, not resolved this feature)

- **F-01** [P2] Misplaced `eslint-disable` doesn't suppress the rule it
  targets - `components/certificate/BlackBorderCertificate.tsx:72`
- **F-02** [P3] Geist Mono loaded but never used - `app/layout.tsx:10`
- **F-03** [P3] Page metadata still says "Create Next App" -
  `app/layout.tsx:15` (confirmed this feature did not touch `app/layout.tsx`,
  so this remains genuinely open, not just speculatively deferred)

These remain in `blueprint/context/findings.md` (not archived here) since none
were fixed, closed, accepted, or invalidated during this feature.
