# CertiCreate - Project Overview

> Turn a name, course, and date into a polished, on-brand certificate (PNG +
> print-ready PDF) in seconds, replacing manual Canva duplication.

## Problem

Course-completion certificates are made by hand in Canva today: duplicate the
design, retype the recipient's name, course, and date, then export. It's slow,
error-prone, and impossible to hand off or automate. CertiCreate turns three
inputs (name, course, date) into a polished, on-brand certificate and exports a
high-quality PNG plus a print-ready PDF in seconds, with room to add more
designs over time.

## Users

- **Primary (v1):** Brad and Traversy Media, issuing certificates to students
  who finish a course.
- **Product direction (not v1):** other course creators, bootcamps, workshop
  hosts, and event organizers who need branded certificates without a designer
  or Canva.
- **Later:** students self-serving their own certificate after completing a
  course.

No login anywhere in v1 - everything is anonymous and local to the browser.

## Features

v1 is a local-only tool: no auth, no server-side database. Core single-certificate
flow first, then styles, local persistence, polish.

1. **Certificate template** - recreate the "Black Border" design as a
   self-contained, themeable HTML/CSS component with placeholder data and the
   logo mark. Foundation every other feature renders through.
2. **Form + live preview** - inputs for name, course, date, and instructor
   (defaulting from brand settings) bound to the template, updating live in the
   browser.
3. **PNG export** *(headline feature)* - server route renders the template via
   full Puppeteer (bundled Chromium, one shared browser instance, new page per
   request) and returns a high-resolution PNG (`deviceScaleFactor: 2-3`).
   Deploys to Render as soon as this works locally; auto-deploy stays on for
   everything after. Deployment itself is manual, not a tracked step.
4. **PDF export** - same render pipeline as PNG (shared browser instance)
   outputs a print-ready landscape PDF with correct page size and margins
   (`page.pdf({ landscape: true, printBackground: true })`).
5. **Template/style system** - a few templates sharing one theme (CSS
   variables) plus a picker in the UI, structured so new styles drop in
   cleanly.
6. **Brand settings (local)** - logo, colors, and instructor name saved in
   local storage and applied to the chosen template.
   - 6a. **Instructor + colors** - `BrandSettings` type, local-storage store,
     settings panel, instructor default, theme-color overrides applied to
     preview and export.
   - 6b. **Logo upload** - upload a logo (data URL) into brand settings,
     replace the placeholder mark in templates, carry it through export.
7. **Certificate history (local)** - save each generated certificate to local
   storage with a history list to re-open and re-download, and remember the
   last form values.
8. **Input polish** - date picker and formatting, Zod validation, long-name
   auto-fit, empty states.
9. **Production hardening on Render** - instance sizing under real renders,
   render queue behavior under concurrent requests, env config cleanup, custom
   domain.

### Later (not v1)

Only if CertiCreate grows into a product for others. Not scheduled; revisit
after v1 ships.

- Accounts (Clerk) and cloud sync of settings and history
- Server-side issued certificates (Postgres + Prisma) with a unique
  verification slug and public verification page
- Bulk generation from CSV - upload recipients, generate all, download as a zip
- Billing and plans (Stripe) - free vs. paid, watermark on free tier, feature
  gating

## Data model

No server-side database in v1. Two kinds of data: static template definitions
shipped in code, and per-device state in browser local storage. Nothing here is
sent to a server or persisted outside the browser; clearing site data wipes it.

### Template (in code, static)

- `id` (string) - template identifier, e.g. `black-border`
- `displayName` (string) - shown in the template picker
- `html`/`css` - the themeable, self-contained markup and styles (feature 1)
- `fonts` - self-hosted web fonts matching the Canva serif, so server render
  matches browser preview
- `logoAsset` - default logo mark placeholder

> Lock this shape in feature 1 - the render pipeline (features 3-4) and the
> template/style system (feature 5) both depend on it staying self-contained
> HTML/CSS with theme variables.

### BrandSettings (local storage)

- `logo` (data URL) - uploaded logo (feature 6b)
- `instructorName` (string) - default signatory, editable per certificate
- `colors` (theme color overrides) - applied to the chosen template

### CertificateHistoryEntry (local storage)

- `recipient` (string)
- `course` (string)
- `date` (string)
- `template` (string) - template id used
- `timestamp` (string/number) - when it was generated

### LastFormValues (local storage)

- `name`, `course`, `date`, `instructor`, `template` - so the form isn't empty
  on reload

### Later (not v1, product direction)

Only if CertiCreate becomes a database-backed product:

- **User** - account (Clerk-backed)
- **Organization/BrandSettings** - cloud-synced version of the local-storage
  model above
- **IssuedCertificate** - recipient, course, date, template, unique
  verification slug, file URL
- **CsvBatchJob** - bulk-generation job record
- **BillingRecord** - subscription/plan state (Stripe)

## Tech stack

- **Next.js (App Router) + TypeScript** - app framework, matches
  `blueprint/context/coding-standards.md`
- **Tailwind v4 + shadcn/ui** - styling and component primitives
- **Puppeteer (full, not `puppeteer-core`/`@sparticuz/chromium`)** - headless
  Chrome rendering engine; renders the same HTML/CSS template to both PNG and
  PDF server-side so preview and export never drift. Render's web services are
  persistent containers, so the stripped serverless Chrome build isn't needed
  and would add fragility.
- **Self-hosted web fonts** - match the Canva serif so server render matches
  browser preview
- **Browser local storage** - brand settings, certificate history, last form
  values (no database in v1)
- **Zod** - input validation
- **Render** - deploy target, web service

### Later stack (not v1)

Render Postgres + Prisma (data), Clerk (auth), Cloudflare R2 (file storage),
Stripe (billing), archiver/jszip (CSV bulk zip).

## Monetization

v1: none. It's a free, local tool for Brad and anyone who lands on it, shipped
to prove the core flow and the rendering pipeline.

Later, if it grows into a product: freemium SaaS for course creators. A free
tier generates watermarked certificates from built-in templates at limited
volume; a paid Stripe subscription removes the watermark and unlocks custom
branding, all templates, CSV bulk generation, cloud-saved history, and higher
volume.

## UI/UX

One focused screen: a form on the left (name, course, date, template picker)
and a live certificate preview on the right with Download PNG and Download PDF
buttons. On mobile the form stacks above the preview. The preview is the real
template scaled down, so what you see is what you get.

- `/` - the main screen: form, live preview, template picker, brand-settings
  panel (logo, instructor name, colors), and a history list of previously
  generated certificates, all backed by local storage. No login.

Visual direction: the certificate artifact keeps the existing brand - formal
and classic, serif display headline, letter-spaced small-cap labels, blue
double-line border with corner flourishes, centered logo mark between the
instructor and date lines - and stays light and print-friendly regardless of
app theme. The app chrome around it is clean and modern, dark-mode-first per
coding standards.

## Deployment

- **Target:** Render, web service (not static/serverless - Puppeteer needs a
  persistent container)
- **Rollout order:** deploy right after the first Puppeteer PNG route works
  locally (feature 3), not held until the end; auto-deploy stays on afterward.
  Deployment itself is manual, not a build-plan step.
- **Chrome cache:** `.puppeteerrc.cjs` at repo root pointing `cacheDirectory` at
  `join(__dirname, '.cache', 'puppeteer')` so build-time Chrome download ships
  with the deploy; add `.cache` to `.gitignore`.
- **Launch flags:** `--no-sandbox`, `--disable-setuid-sandbox`,
  `--disable-dev-shm-usage` (containers have a tiny `/dev/shm`).
- **Browser lifecycle:** one Chrome instance launched at server boot, one page
  per request, never relaunched per request; concurrency capped at 1-2 renders
  with a small queue.
- **Dependency placement:** `puppeteer` must be in `dependencies`, not
  `devDependencies`, or the production install skips it.
- **Instance size:** Starter minimum, Standard (2GB) preferred; no free tier
  (spin-down + Chrome memory don't mix).
- **Known failure mode:** "Could not find Chrome" after a Puppeteer version
  bump - fix is "Clear build cache & deploy" on Render.
- **Env vars, health check path, domain:** not yet specified.

> project-plan.md section 8 (Deployment) was left blank; the details above were
> recovered from build-plan.md's "Deployment notes" section and the Tech
> section instead. Fine for now since the information exists, but worth
> filling in section 8 directly next time the plan is edited.

## Open questions

- **Naming inconsistency:** the plans spell the product "Certificreate" in a
  few places (project-plan.md §1, build-plan.md "Later" section) versus
  "CertiCreate" / `certicreate` elsewhere (package.json, most of the plans).
  This overview standardizes on **CertiCreate**. Worth a quick pass to make the
  plans consistent, non-blocking.
- **project-plan.md section 8 (Deployment) is empty** - see the note under
  Deployment above. Deployment info exists in build-plan.md instead; consider
  moving/duplicating a short version into section 8 for consistency with the
  template.
- **shadcn/ui not yet installed** - listed in Tech (project-plan.md §5) but no
  `components.json` exists in the repo yet. Not a contradiction, just not done
  - likely lands with feature 1 or 2.
