# Handoff — CSP, caching, and feedback repair

## Status: ready to deploy

This repair resolves every release blocker recorded in
`.factory/verification.md` for candidate `71eefff` while preserving the
researched brief, static Vite + TypeScript artifact, local-first storage, and
the existing free and paid-deck behaviors.

## What changed

- Replaced CSP-blocked inline-width progress fills with native, labelled
  `<progress>` elements. Empty portfolios now render as real `0 / 4` and
  `0 / 3` progress, without weakening `style-src 'self'`.
- Added Azure Static Web Apps route headers: content-hashed `/assets/*` now
  receive `Cache-Control: public, max-age=31536000, immutable`; `sw.js` and
  the manifest revalidate with `no-cache, must-revalidate`.
- Made persistence feedback render after the subsequent UI replacement, so
  successful custom challenge creation and valid deck import retain their
  visible live-region toast. The same safeguard covers other save-and-render
  actions.
- Mirrored the production CSP in Vite development and preview servers, and
  made Playwright run the production build. Browser tests therefore catch CSP
  integration regressions before deployment.
- Versioned the service-worker cache to `future-skills-v3` and use
  `ignoreVary` for same-origin cache lookups. This makes the offline shell
  robust in preview servers that emit `Vary: Origin`, while cache keys remain
  same-origin content-hashed URLs.

## Regression coverage

- `src/deployment.test.ts` asserts the strict CSP and exact Azure cache
  policies for assets, service worker, and manifest.
- The desktop and 390px Playwright suite asserts semantic zero-valued progress
  with no inline style, runs under the strict CSP with zero console errors,
  and verifies the custom-create and valid-import confirmation toasts.

## Verification before deployment

Run from the repository root:

```sh
npm ci
npm test
npm run build
```

Evidence from this repair:

- Clean `npm ci`: 62 packages audited, 0 vulnerabilities.
- Unit/integration: 11 Vitest tests passed. Chromium production-build tests
  passed on desktop (6/6) and 390×844 mobile (6/6), including axe serious and
  critical checks.
- Type check and production build passed. `dist/` contains its root
  `index.html`; initial JS is 45,063 B raw and CSS is 21,308 B raw, both below
  the product budgets. The mobile hero is 23,704 B WebP.
- Local production `verify-url.sh` passed: title/lang/one h1/main/alt/button
  checks pass, 0 browser errors, 642 ms observed load. Local Lighthouse mobile
  reported Performance 100 and Accessibility 100 (FCP/LCP 1.1 s, CLS 0).
- Production-build 390px manual smoke check: no horizontal overflow
  (390/390), skip link receives keyboard focus, artifact dialog focuses
  `#artifact-title` and closes with Escape, 0 console/page errors, only
  same-origin normal-free-use requests, service worker controls root scope,
  `registration.update()` succeeds, and offline reload renders the app.

## Post-deployment checks required

After deploying `dist/` to `https://future-skills-portfolio.sociobot.in/`:

1. Confirm fresh desktop and 390px loads have zero console errors and that
   the two empty progress elements have values 0/4 and 0/3.
2. Confirm a hashed `/assets/index-*.js` and `/assets/index-*.css` response
   sends `Cache-Control: public, max-age=31536000, immutable`; confirm
   `sw.js` revalidates.
3. Run `/opt/fleet/lib/verify-url.sh` against the live URL and repeat the
   service-worker offline/update smoke check.

## Known gaps

None. The next step is the static deployment and its live-header verification.
