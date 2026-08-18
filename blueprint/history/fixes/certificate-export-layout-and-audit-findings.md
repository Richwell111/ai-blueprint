# Fix: Certificate export layout and audit findings

**Type:** Fix
**Fixes:** F-02, F-03, F-04, F-05

## The problem

The generated PNG was too tall and spread the certificate content over
excessive vertical whitespace instead of matching
`blueprint/references/cert-example.png`. The audit also found an unused font,
placeholder metadata, a permanently cached Chromium launch failure, and an
unbounded render queue.

## The fix

The certificate now uses one explicit A-series landscape ratio in the shared
component and Puppeteer viewport, with content grouped into intentional header,
details, and footer zones. The unused font and scaffold metadata were removed.
Chromium startup can recover after a transient failure, and render admission is
bounded by a small queue with a timeout and retryable overload response.

## Build steps

- [x] Correct the certificate proportions and spacing.
- [x] Repair F-04 and F-05 in the render pipeline.
- [x] Repair F-02 and F-03 in the app shell.

## Verification

- `npm run lint` passed.
- `npm run build` passed.
- A real PNG export was inspected at 2800 by 1980 pixels with a 1.414 ratio.
- `/audit` re-reviewed and closed every repaired finding.

## Findings

### certificate-export-layout-and-audit-findings/F-01 [P2] closed - Misplaced eslint-disable doesn't suppress the rule it targets

**File:** components/certificate/BlackBorderCertificate.tsx:72
**Found:** 2026-08-13 by /audit (scope: current)
**Why it matters:** The suppression originally preceded `return (` instead of
the `<img>` it targeted, so lint still reported the image warning.
**Suggested fix:** Place the suppression immediately before the `<img>`.
**Resolution:** The directive now directly precedes the image. Re-reviewed on
2026-08-18; `npm run lint` reports no warnings.

### certificate-export-layout-and-audit-findings/F-02 [P3] closed - Geist Mono is loaded and preloaded but never used

**File:** app/layout.tsx:10
**Found:** 2026-08-13 by /audit (scope: current)
**Why it matters:** The unused font caused an unnecessary preload and request.
**Suggested fix:** Remove Geist Mono until the UI needs it.
**Resolution:** Removed the import, loader, HTML variable, and Tailwind mapping.
Re-reviewed on 2026-08-18; no Geist Mono reference remains.

### certificate-export-layout-and-audit-findings/F-03 [P3] closed - Page metadata is still create-next-app boilerplate

**File:** app/layout.tsx:15
**Found:** 2026-08-13 by /audit (scope: current)
**Why it matters:** The browser title and description did not identify the real
product.
**Suggested fix:** Replace the scaffold metadata with CertiCreate metadata.
**Resolution:** The layout now exports a CertiCreate title and description.
Re-reviewed on 2026-08-18.

### certificate-export-layout-and-audit-findings/F-04 [P1] closed - A failed Chromium launch poisons every later export

**File:** lib/puppeteer.ts:19
**Found:** 2026-08-18 by /audit (scope: full)
**Why it matters:** A rejected launch promise remained cached, disabling exports
until the server restarted.
**Suggested fix:** Clear the rejected cached promise without disturbing a newer
shared launch.
**Resolution:** `startBrowser` clears only its own rejected promise. Re-reviewed
on 2026-08-18; the identity guard preserves newer launches and permits retry.

### certificate-export-layout-and-audit-findings/F-05 [P2] closed - The render queue has no admission limit

**File:** lib/puppeteer.ts:32
**Found:** 2026-08-18 by /audit (scope: full)
**Why it matters:** Unlimited anonymous requests could accumulate in memory
behind the two active render slots.
**Suggested fix:** Bound and time out the queue, returning a retryable overload
response when capacity is unavailable.
**Resolution:** The queue permits four waiters for up to 30 seconds, and the PNG
route returns HTTP 503 with `Retry-After`. Re-reviewed on 2026-08-18; timers and
queue entries are cleaned without leaking render slots.
