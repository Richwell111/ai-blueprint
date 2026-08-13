# Feature: PNG export

**From build-plan:** feature 3
**Status:** complete

## Goal

Turn the live certificate preview into a downloadable, high-resolution PNG,
rendered server-side by Puppeteer so the exported file matches the on-screen
preview pixel-for-pixel. This is the project's headline feature and the first
thing that ships to Render.

## In scope

- Puppeteer added as a real `dependencies` entry, with the Render Chrome-cache
  config (`.puppeteerrc.cjs`) and `.gitignore` update, so the build-time Chrome
  download ships with the deploy later.
- An internal, chrome-less route that renders `BlackBorderCertificate` alone
  (no header, form, or page padding) so Puppeteer has something precise to
  screenshot.
- A shared Puppeteer browser instance (launched once, reused across requests,
  one page per request) with the container-safe launch flags and a small
  concurrency cap, per `build-plan.md`'s Deployment notes.
- A POST API route that takes the current certificate data and returns a
  high-resolution PNG (`deviceScaleFactor: 2`).
- A "Download PNG" button wired into the existing form/preview UI.

## Out of scope

- PDF export (feature 4) - shares the same render pipeline but is a separate
  step later.
- Template/style picker (feature 5), brand settings incl. logo upload
  (feature 6), certificate history (feature 7), date picker/Zod
  validation/long-name auto-fit (feature 8), production hardening
  (feature 9).
- Actually creating the Render web service and deploying. `build-plan.md` is
  explicit that this is manual, not a build step - it's the immediate next
  action once the steps below pass locally, not part of this spec.

## Build loop

Build one step at a time, never the whole feature at once.

1. Plan mode lays out the step before any code.
2. The AI implements just that step.
3. It shows the diff (not full files); you read it and understand it.
4. You approve, then choose whether to commit a checkpoint or roll straight on.
   Checkpoints are optional; `/complete` makes the real feature-level commit at the end.

Never accept a step you haven't read. If a diff is too big to review, the step was too big, so split it.

## Build steps

- [x] **Step 1 - Puppeteer install + Chrome cache config** - add `puppeteer` to
  `dependencies` (not `devDependencies`), add `.puppeteerrc.cjs` at the repo
  root pointing `cacheDirectory` at `join(__dirname, '.cache', 'puppeteer')`,
  and add `.cache` to `.gitignore`. *Done when:* `npm install` completes and
  downloads Chrome into `.cache/puppeteer`.
- [x] **Step 2 - Print-only render route** - add `app/certificate/print/page.tsx`,
  a server component that reads certificate data from a `data` search param
  (URL-encoded JSON matching `CertificateData`) and renders only
  `BlackBorderCertificate` on a plain white page - no header, form, or extra
  padding - with a `data-certificate-export` attribute on the element Puppeteer
  will screenshot. *Done when:* visiting
  `/certificate/print?data=<encoded-json>` in a browser shows just the
  certificate, matching the live preview for the same data.
- [x] **Step 3 - Shared browser + PNG API route** - add `lib/puppeteer.ts`
  exporting a singleton that launches Chrome once (flags: `--no-sandbox`,
  `--disable-setuid-sandbox`, `--disable-dev-shm-usage`) and reuses it across
  requests, plus a small concurrency gate (cap 2 concurrent renders, queue the
  rest) per `build-plan.md`'s Deployment notes. Add
  `app/api/certificate/png/route.ts`, a POST route handler that accepts
  `CertificateData` as JSON, opens a new page from the shared browser, sets
  `deviceScaleFactor: 2`, navigates to the print route (built from the
  request's own origin), waits for `document.fonts.ready` and the
  `data-certificate-export` element, screenshots that element, closes the
  page, and returns the PNG with `Content-Type: image/png`. *Done when:*
  `POST /api/certificate/png` with a JSON body returns a valid PNG that
  visually matches the preview for the same data (verified with `curl` and by
  opening the file).
- [x] **Step 4 - Download PNG button** - add a "Download PNG" button to
  `CertificateBuilder` that POSTs the current preview data to
  `/api/certificate/png`, receives the PNG blob, and triggers a browser
  download; show a simple loading state while the request is in flight and a
  basic error message if it fails. *Done when:* clicking "Download PNG" in the
  running app downloads a PNG file that matches the on-screen preview.

## Files / areas

- `package.json` - move/add `puppeteer` under `dependencies`
- `.puppeteerrc.cjs` - new, Chrome cache path
- `.gitignore` - add `.cache`
- `app/certificate/print/page.tsx` - new, chrome-less render target
- `lib/puppeteer.ts` - new, shared browser singleton + concurrency gate
- `app/api/certificate/png/route.ts` - new, PNG export route handler
- `components/certificate/CertificateBuilder.tsx` - add the Download PNG button

## Data / contracts

- Reuses `CertificateData` from `types/certificate.ts` unchanged - no new
  fields needed for PNG export.
- The print route's `data` search param is `encodeURIComponent(JSON.stringify(data))`
  of a `CertificateData`; the API route's POST body is the same shape as raw
  JSON. No schema validation yet (Zod input validation is feature 8) - trust
  the shape client-side, since there's no other caller yet.

## Testing

No test runner is configured (`AGENTS.md` declares no `test` command), so the
test gate is off. This feature is entirely integration/render-route work
(a Puppeteer-driven screenshot pipeline), which is explicitly exempt from unit
tests under `coding-standards.md` even when a runner exists - verify with real
evidence instead:

- Step 1: `npm install` output showing Chrome downloaded into
  `.cache/puppeteer`.
- Step 2: a browser screenshot of `/certificate/print?data=...` next to the
  live preview for the same values.
- Step 3: a `curl` PNG response saved to disk and opened, compared against the
  preview.
- Step 4: a browser walkthrough - fill the form, click Download PNG, confirm
  the downloaded file.

## Notes for the AI

- `app/api/certificate/png/route.ts` is a Next.js Route Handler (API route),
  not a Server Action - it needs a specific response `Content-Type` and
  returns binary data, which `coding-standards.md` calls out as an API-route
  case.
- The print route must stay a plain server component with no app chrome: it's
  exactly what gets screenshotted, so any stray padding or header shows up in
  every export.
- Launch the browser once at module scope in `lib/puppeteer.ts` and reuse it;
  never relaunch per request. Open and close a page per request.
- Build the print route's absolute URL from the incoming request (`req.url`'s
  origin), not a hardcoded `localhost:3000`, so this also works once deployed
  to Render.
- Keep the concurrency gate simple (an in-memory counter/queue is enough for
  v1) - full production queue behavior under load is feature 9.
- Send the resolved `previewData` (placeholders filled in), not the raw form
  state, to the PNG route - the download should match exactly what's on
  screen, including empty-field placeholders.
- Guard against a dead shared browser (`browser.isConnected()` before reuse,
  relaunch if not) so one crash doesn't take down every export until a server
  restart - cheap to add now, not worth deferring to feature 9.
- This is the feature that deploys to Render first. Once all four steps pass
  locally, say so explicitly and stop - deploying is a manual action outside
  this spec, not something to do automatically.

## Post-spec additions (same branch, same commit)

After all four steps above passed, the user asked for follow-on changes on the
same `feature/png-export` branch rather than a separate `/fix`. Not part of the
original spec's scope, but built, reviewed, and verified the same way (diff
shown, screenshots taken, build/lint green) before landing here:

- **Certificate design fix** - `blueprint/references/cert-example.png` was
  replaced with a corrected reference (the prior one was missing the black
  outer frame the "Black Border" template is named for). Updated
  `components/certificate/BlackBorderCertificate.tsx` to match: a black frame
  border, navy double-line border (was teal), an SVG scalloped corner
  flourish (was a solid blob), a serif display headline (added `Lora` via
  `next/font/google` in `app/layout.tsx`, `--font-serif` token in
  `app/globals.css`), and a triangular 3-dot logo placeholder (was a
  horizontal row). Verified against the reference at both preview and full
  export resolution (2800x1980).
- **Organization field** - `Has completed the following Traversy Media
  course:` was hardcoded copy; the reference showed it should be a field like
  any other. Added `organizationName` to `CertificateData`
  (`types/certificate.ts`), the form (`CertificateBuilder.tsx`), and the print
  route's fallback (`app/certificate/print/page.tsx`). This is a load-bearing
  data contract change - any future code constructing `CertificateData` needs
  this field.
- **Download reliability fix** - the download `<a>` in `CertificateBuilder.tsx`
  was never attached to the DOM before `.click()`, a known cross-browser
  reliability gap for anchor-triggered blob downloads. Fixed by appending it
  before the click and removing it after. (A separate GUID-filename report
  from the user during testing was diagnosed as their Chrome window running
  with a `--no-sandbox` launch flag - a local browser-launch issue, not a code
  defect; not fixed here since it isn't fixable from the app.)
- **F-01 fixed** - while touching `BlackBorderCertificate.tsx`'s `LogoMark`
  function for the design fix, moved the misplaced `eslint-disable-next-line`
  so it actually suppresses the rule on the `<img>` line. `npm run lint` now
  reports zero warnings project-wide.
- **`blueprint/project-plan.md`** - a pre-existing uncommitted edit (Brad ->
  Richwell, two spots) unrelated to this feature was folded into this commit
  at the user's explicit choice rather than left dangling.
