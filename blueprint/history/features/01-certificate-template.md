# Feature: Certificate template

**From build-plan:** feature 1
**Status:** complete

## Goal

Recreate the "Black Border" certificate as a self-contained, themeable
React/CSS component rendered with placeholder data. This is the foundation
every later feature renders through: the live preview (2), the PNG/PDF export
pipeline (3-4), the template/style system (5), and brand settings (6) all
depend on this component staying self-contained HTML/CSS driven by theme
variables, with no client-only behavior that would break server-side
rendering in Puppeteer later.

## Design reference

- [`blueprint/references/cert-example.png`](blueprint/references/cert-example.png) -
  **authoritative** for the certificate artifact itself. Build to match this
  exactly: rounded-rect border in a muted teal-blue, a rounded petal/leaf
  flourish built into each corner (not a separate ornament), clean sans-serif
  type throughout (the headline is not a serif font, despite
  `project-plan.md`'s "serif display headline" - this spec supersedes that
  line; worth a quick fix in the plan later, non-blocking), bold uppercase
  underlined recipient name, and a 3-column footer (instructor | circular logo
  mark | date).
- `prototypes/main.html` and `prototypes/theme.css` - reference for the **app
  chrome** only (dark surfaces, blue accent, panel layout). Their
  certificate-specific styling (blue border, diamond corners, italic serif
  name) was a guess made before `cert-example.png` was found and is
  **superseded** by it for every cert-specific token. `prototypes/` was
  discarded at `/complete` as planned.

## In scope

- A `CertificateData` prop shape (recipient name, course title, date,
  instructor name, optional logo URL) - locked now, reused by every later
  feature that renders or exports a certificate.
- One React component, `BlackBorderCertificate`, matching `cert-example.png`:
  border, corner flourish, headline block, recipient block, body copy,
  3-column footer.
- Theme tokens ported into `app/globals.css` (`@theme`, Tailwind v4) - both
  the chrome tokens from `prototypes/theme.css` (unaffected by the reference
  image) and the certificate tokens, corrected to match `cert-example.png`
  instead of the prototype's guess.
- Rendering the component with placeholder data somewhere viewable (replaces
  the default `create-next-app` boilerplate on `app/page.tsx`).

## Out of scope

- The multi-template registry and picker UI (feature 5) - this feature only
  needs the one component to exist as self-contained HTML/CSS; the `Template`
  registry type (id, displayName, picker) is feature 5's job.
- Form inputs, live binding, and the surrounding two-column app-chrome layout
  (feature 2). This feature renders placeholder data only.
- Logo upload and brand-settings colors (feature 6), PNG/PDF export
  (features 3-4), history (feature 7).
- Long recipient-name/course-title auto-fit (feature 8) - use reasonable
  placeholder lengths; don't add truncation or dynamic font-sizing logic yet.
- Self-hosting the exact production font file. The reference headline looks
  like a clean geometric sans (not a system default); this feature uses the
  closest reasonable sans-serif stack for visual fidelity now. Locking and
  self-hosting the exact font family is a separate decision, needed by the
  time Puppeteer rendering (feature 3) has to guarantee server output matches
  the browser - flagged here, not solved here.

## Build steps

- [x] **Step 1 - Port theme tokens into `app/globals.css`** - add a Tailwind v4
  `@theme` block defining: chrome tokens as prototyped (surfaces, text,
  accent) and certificate tokens corrected to match `cert-example.png`
  (border teal-blue, ink colors, a sans-serif font stack for the certificate
  in place of the prototype's serif stack). Replace the default
  `create-next-app` light/dark tokens. *Done when:* `npm run build` succeeds
  and the new CSS variables are visible on `:root` in browser devtools.
- [x] **Step 2 - Define `CertificateData`** - add
  `types/certificate.ts` with the prop shape: `recipientName`, `courseTitle`,
  `date`, `instructorName`, `logoUrl?`. *Done when:* the type compiles and is
  exported for use by the component.
- [x] **Step 3 - Build `BlackBorderCertificate` core layout** -
  `components/certificate/BlackBorderCertificate.tsx`, a server component
  (no `'use client'`) taking `CertificateData` as props. Render: outer bordered
  frame, "Certificate" / "of Completion" headline, "THIS IS TO CERTIFY THAT"
  label, bold uppercase underlined recipient name, body copy naming the
  course, 3-column footer (instructor name + rule, circular logo placeholder
  or `logoUrl` image, date + rule). Wire it into `app/page.tsx` with
  placeholder data, replacing the boilerplate. *Done when:* `localhost:3000`
  shows the certificate with correct layout, type, and footer structure
  matching `cert-example.png` (corner flourish comes in step 4).
- [x] **Step 4 - Corner flourish** - add the rounded petal/leaf corner
  ornament from `cert-example.png` to `BlackBorderCertificate`, integrated
  with the rounded border corners (CSS only, no images). *Done when:* all
  four corners visually match the reference image's flourish shape and color.
  (First attempt used blocky, oversized quarter-circles that overlapped the
  inner border - `/check` caught this; revised to a smaller two-corner-radius
  "leaf" shape, inset from the edge, which matched on re-check.)

## Files / areas

- `app/globals.css` - theme tokens
- `types/certificate.ts` - new
- `components/certificate/BlackBorderCertificate.tsx` - new
- `app/page.tsx` - renders the component with placeholder data

## Data / contracts

- **`CertificateData`** (load-bearing - features 2, 3, 4, 6, 7 all reuse this
  exact shape):
  - `recipientName: string`
  - `courseTitle: string`
  - `date: string` (pre-formatted display string for this feature; feature 8
    owns date-picker/formatting logic)
  - `instructorName: string`
  - `logoUrl?: string` (data URL; undefined renders the placeholder mark)

## Testing

- No test runner is configured yet (`AGENTS.md` Commands has no `test`
  entry), so this rode on build + visual evidence, not unit tests - expected,
  since this feature is a UI component with no parsing/formatting/validation
  logic.
- Verified with `npm run build`, `npx tsc --noEmit`, and Playwright
  screenshots of `localhost:3000` compared against
  `blueprint/references/cert-example.png` for border color, corner flourish,
  type, and footer layout.

## Notes for the AI

- Server component, no client-only APIs - this markup gets rendered by
  Puppeteer in features 3-4, so avoid anything that only works in a browser
  (no `window`, no client-side hooks).
- Follow `coding-standards.md` file organization
  (`components/[feature]/ComponentName.tsx`, `types/[feature].ts`).
- Certificate tokens and chrome tokens are separate on purpose - the
  certificate stays light and print-friendly regardless of app theme; don't
  let chrome dark-mode tokens leak into the certificate's colors.
- `blueprint/references/cert-example.png` is the tie-breaker on any visual
  question this spec doesn't explicitly answer.
- Deliberate deviation from the reference image's literal copy: "Has
  completed the following Traversy Media course" was generalized to "Has
  successfully completed the course:" since `CertificateData` has no
  organization field and the product is meant to serve other course
  creators too.

## Findings carried forward (still open, not resolved this feature)

- **F-01** [P2] Misplaced `eslint-disable` doesn't suppress the rule it
  targets - `components/certificate/BlackBorderCertificate.tsx:72`
- **F-02** [P3] Geist Mono loaded but never used -
  `app/layout.tsx:10`
- **F-03** [P3] Page metadata still says "Create Next App" -
  `app/layout.tsx:15`

These remain in `blueprint/context/findings.md` (not archived here) since none
were fixed, closed, accepted, or invalidated during this feature.
