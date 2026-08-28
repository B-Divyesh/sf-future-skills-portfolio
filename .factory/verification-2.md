# Independent verification 2 — FAIL

**Work order:** `future-skills-portfolio-verify-2`

**Candidate:** `67e8ce504386abdbf8fff522f6d4b538d27afde4`

**Live URL:** <https://future-skills-portfolio.sociobot.in/>

**Verified:** 2026-08-28 UTC

## Verdict

**FAIL.** The deployment is current and the prior CSP, progress, cache, and
toast defects are repaired. Normal use, the production build, repository test
suite, offline shell, performance budgets, and serious/critical axe gates all
pass. Three release blockers remain:

1. an artifact is falsely reported as saved when browser storage rejects the
   write, then is lost on reload;
2. the sharing workflow accepts and re-exports challenges with no reuse
   license, contrary to the researched brief; and
3. the 390px layout horizontally overflows when text is resized to 200%,
   contrary to the non-negotiable accessibility contract.

No product code was changed during this verification.

## Defects by severity

### P1 — Failed artifact writes claim success and lose family work

Reproduction on the live deployment:

1. Make `Storage.prototype.setItem` throw `QuotaExceededError`, representing
   unavailable or exhausted browser storage.
2. Open **Explain a black box**, complete every required artifact field, and
   choose **Save artifact locally**.
3. The UI displays the artifact and announces **“Artifact saved on this
   device.”**
4. Reload. The artifact is gone (`1` visible before reload, `0` after).

The artifact handler calls `saveState(state)` but ignores its false return,
then unconditionally renders success. The shelf toggle follows the same
unchecked-write pattern. This is a data-loss path in the product's core
local-first promise. By contrast, the custom-challenge path correctly warns
when persistence fails.

### P1 — Deck import does not enforce the required reuse license

A structurally valid `future-skills-deck` challenge with no `license` field was
accepted by the live importer and announced as imported. Inspection of the
persisted imported challenge returned `license: null`. `parseDeck()` validates
content structure but not licensing, and `makeDeck()` serializes that
unlicensed challenge again.

This conflicts with the brief's explicit constraint that contributors must
license challenges for reuse. The built-in challenge maker does require a CC
BY 4.0 confirmation, so imported contributions bypass a safeguard applied to
locally authored contributions.

### P1 — 200% text sizing breaks mobile reflow

At the required 390×844 viewport, the ordinary page fits exactly:
`scrollWidth=390`, `clientWidth=390`. With the root text size changed to 200%,
the page becomes `scrollWidth=442`, `clientWidth=390`. The hero grows to
421.5px wide from x=20 to x=441.5, and filter controls extend as far as
x=706.3. This creates page-level horizontal scrolling and clips content in a
standard text-resize accessibility scenario.

### P2 — Structurally corrupt local state creates a persistent blank app

With the documented storage key containing valid JSON but an invalid member,
for example:

```json
{"artifacts":[],"savedIds":[],"customChallenges":[{}]}
```

reload produces no h1 and raises `Cannot read properties of undefined
(reading 'replace')`. Further reloads repeat the failure because the bad value
is retained. `loadState()` recovers from invalid JSON but does not validate
array members before rendering them.

### P3 — Axe reports one moderate landmark best-practice issue

The live home/dialog scan has zero serious or critical findings, but axe also
reports `landmark-complementary-is-top-level` for `<aside class="share-panel">`
nested within the main landmark. This is not part of the serious/critical gate
but should be cleaned up.

## Clean checkout and repository gates

The existing `/work/repo` checkout was clean and exactly at the candidate SHA
before installation. `npm ci` replaced dependencies from the lockfile.

| Check | Result |
| --- | --- |
| `node --version` | `v22.23.2` |
| `npm --version` | `10.9.8` |
| `npm ci` | PASS — 61 packages installed; 62 audited; 0 vulnerabilities |
| `npm test` | PASS — 11 Vitest unit/integration assertions and 12 Playwright cases (6 desktop, 6 at 390×844) |
| `npm run build` | PASS — `tsc --noEmit` and Vite 7.3.6; `dist/` produced |
| lint | Not available — no lint script or lint configuration is present |

The exact production build emitted:

| Asset | Raw size | Budget | Result |
| --- | ---: | ---: | --- |
| Initial JavaScript | 45,063 B | 200 KB | PASS |
| Initial CSS | 21,308 B | 50 KB | PASS |
| Mobile hero WebP | 23,704 B | 300 KB | PASS |
| Desktop hero WebP | 68,972 B | — | PASS |
| Runtime webfonts | 0 B | 120 KB | PASS |

## End-to-end functional evidence

Fresh Chromium contexts exercised the production output and live deployment.

- PASS: all 16 challenge cards render: eight complete free challenges and
  eight visibly locked Keepsake challenges. Each inspected free challenge has
  a task, limits, reflection prompts, and a four-row review rubric.
- PASS: a normal family flow selected **Explain a black box**, rejected an
  empty artifact submission with `Please fill out this field.`, saved a peer-
  reviewed artifact, survived reload, exported valid portfolio JSON, cancelled
  deletion once, then confirmed deletion.
- PASS: four artifacts logged through the UI across six distinct modes survive
  reload and reach `4 / 4 artifacts`; the skill progress element correctly
  caps its value at `3` of `3` (the adjacent copy says `6 / 3 skill modes`).
- PASS: the custom challenge minimum boundary of 15 minutes saves and gets a
  visible success toast. The invalid value 241 is blocked with native
  `rangeOverflow` validation.
- PASS: non-JSON import and a 101-challenge deck are rejected; the same file
  input then recovers and imports a valid one-challenge deck. The lack of a
  required reuse license is the P1 defect above.
- PASS: portfolio download has the documented
  `future-skills-portfolio-YYYY-MM-DD.json` name and versioned format.
- PASS: delete cancel/confirm behavior is specific and reversible before the
  confirm decision.
- PASS: print media hides the application main content and exposes one full
  challenge sheet with task, materials, limits, reflection, and all four
  rubric rows.
- PASS: `/privacy` and `/terms` render directly with one h1 each.
- PASS: an invalid paid license is removed from the optimistic state, the URL
  token is stripped, locked cards return, and clear status is shown. The live
  verification API returned `{valid:false, reason:"invalid"}` with
  `Cache-Control: no-store` and origin-specific CORS.
- NOT RUN: a real paid checkout and successful production license were not
  transacted. The link target and invalid/revoked-style path were verified.

## Accessibility, responsive behavior, and browser health

- PASS: live desktop and fresh 390×844 mobile scans have zero axe serious or
  critical violations. The artifact dialog and privacy route also have zero
  serious or critical violations.
- PASS: `<title>`, `lang="en"`, exactly one h1, one main landmark, meaningful
  image alt, labelled buttons, ordered headings, and skip link are present.
- PASS: the skip link is the first Tab stop and has a 3px solid
  `rgb(166, 79, 56)` focus outline. Enter opens a challenge.
- PASS: artifact-dialog focus begins at **What did you make?**, wraps from the
  first to last control with Shift+Tab, Escape closes it, and focus returns to
  **Log an artifact**.
- PASS: reduced-motion emulation reduces all tested transition durations to
  `0.01ms`; no looping motion or flashing was observed.
- PASS: normal 390px rendering has no horizontal overflow. Effective mobile
  controls meet the 44px target; the visually 36px shelf button extends its
  hit region by 4px on each side, and the hidden file input is operated by a
  48px labelled control.
- FAIL: 200% text-size reflow, as detailed in P1.
- PASS: normal desktop/mobile load and representative workflows emitted zero
  console errors, page errors, or failed requests. The corrupt-state P2 case
  intentionally triggers one page error.

Factory `verify-url.sh` against the live URL passed in 770ms with zero browser
errors, title/lang/one h1/main present, zero images missing alt, and zero
unnamed buttons.

## Privacy, requests, and response policy

- PASS: a clean free-use session contacted only
  `https://future-skills-portfolio.sociobot.in`; there are no analytics,
  trackers, child accounts, CDN scripts, remote fonts, or cloud portfolio
  writes.
- PASS: the only application cross-origin runtime integration is the allowed
  Sociobot license verification endpoint. Checkout is a plain link to the
  documented Sociobot endpoint; no payment provider is embedded.
- PASS: user content is escaped before HTML rendering, and rejected imports
  recover without a reload.
- PASS: HTTP redirects permanently to HTTPS. Live responses include HSTS,
  `nosniff`, strict-origin referrer policy, camera/microphone/geolocation
  denial, and a strict CSP: `default-src 'self'; img-src 'self' data:;
  script-src 'self'; style-src 'self'; connect-src 'self'
  https://api.sociobot.in; object-src 'none'; base-uri 'self';
  frame-ancestors 'none'`.
- PASS: HTML revalidates after 30 seconds and returned 304 for a matching
  ETag. Hashed JS, CSS, and hero assets return
  `public, max-age=31536000, immutable` with Brotli available. `sw.js` and the
  manifest return `no-cache, must-revalidate`.

## PWA and offline behavior

- PASS: the service worker owns root scope and `registration.update()`
  completes.
- PASS: after installation, a forced-offline reload renders the complete shell
  and the explicit **“You’re offline. The deck and local portfolio still
  work.”** state with no console/page errors.
- PASS: the manifest is same-origin and served as
  `application/manifest+json`; the service worker cache is versioned.

## Performance

Lighthouse 12.8.2 against the live URL, mobile defaults:

| Category/metric | Result | Gate |
| --- | ---: | ---: |
| Performance | 99 | ≥90 |
| Accessibility | 100 | ≥95 |
| Best Practices | 100 | — |
| SEO | 100 | — |
| FCP | 0.9 s | — |
| LCP | 1.0 s | <2.5 s |
| Total Blocking Time | 120 ms | <200 ms proxy for lab responsiveness |
| CLS | 0 | <0.1 |
| Total transferred | 47 KiB | — |

INP is not produced by a single-load Lighthouse lab run. The relevant lab
responsiveness proxy, TBT, is within budget.

## Deployment identity

The live shell names the candidate's `index-BSy1kADk.js` and
`index-C6mPKneA.css`. SHA-256 comparisons between the fresh `dist/` and live
responses matched exactly:

| File | SHA-256 |
| --- | --- |
| `index.html` | `3061d65f01e0be12a9ffd8b18915e22707e49d51ecd745d35426f90aa7b8176b` |
| JavaScript | `5aa80b307f00bec2a9196f51685150573db50ef1e7faa96f94a4e7f4b33b6de7` |
| CSS | `60c1e00acfdf29ecd37bc0c08fb634e4fdea24a392527ee06ae996be7ccda6f3` |
| `sw.js` | `b74ae1a2f2612afc8da2beb191c930050dfb45b824e9eedb208e281e87cf8871` |
| manifest | `c8840b473dcc8b2e04cb07843de466c77d40e22a1f1f3f281e590bc0ed8fc4ad` |
| mobile hero | `01f49837c9f82621ea6a138c932892e32b5f9e058a2ba1f2b9835aa2035944cf` |
| desktop hero | `f1e9b9f0076b0525fbeab875ad2bab142c2060eef5a70f0655da1fc513e5aa08` |

The live deployment therefore matches candidate
`67e8ce504386abdbf8fff522f6d4b538d27afde4`; this is not a stale-deployment
failure.

## Required before approval

1. Check every core persistence write and show an error instead of success
   when it fails; retain/export the in-memory work until the family chooses a
   recovery action.
2. Require an explicit supported reuse license in imported challenge records,
   reject or quarantine unlicensed records, and preserve license attribution
   through export.
3. Make the mobile layout reflow without page-level horizontal scrolling at
   200% text size, then test the full page and horizontally scrollable rubric
   independently.
4. Validate stored state members before render and recover to a useful warning
   or safe empty state when data is malformed.
5. Re-run the complete clean build/test suite and live identity, axe, mobile
   resize, storage-denial, import-license, and offline checks.
