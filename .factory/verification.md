# Independent verification — FAIL

**Work order:** `future-skills-portfolio-verify-1`  
**Candidate:** `71eefff581809f315d9ddcb477c07ad0ddf68f3f` (`fix: harden local import and license handling`)  
**Live URL:** <https://future-skills-portfolio.sociobot.in/>  
**Date:** 2026-08-28 UTC

## Verdict

**FAIL.** The live deployment is byte-for-byte the tested candidate, but its deployed Content Security Policy blocks the application's inline progress-bar widths. This emits browser console errors on every fresh load and displays both empty progress bars as full. The deployment also does not provide immutable caching for its hashed assets. These fail the factory quality gates for no console errors and static-asset caching.

## Reproducible release blocker

### P1 — CSP blocks progress rendering and creates console errors

On a fresh desktop Chromium visit to the live URL, the response header is:

```text
Content-Security-Policy: default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self'; connect-src 'self' https://api.sociobot.in; object-src 'none'; base-uri 'self'; frame-ancestors 'none'
```

The candidate renders each progress fill with an inline style in `src/main.ts`:

```html
<span style="width:0%"></span>
```

`style-src 'self'` blocks that style attribute. Chromium reports two `Applying inline style violates the following Content Security Policy directive 'style-src 'self''` errors on an otherwise empty portfolio. Both fills retain `style="width:0%"` but compute to their parent's full width (435.688px / 435.688px and 435.703px / 435.703px), so `0 / 4 artifacts` and `0 / 3 skill modes` falsely look complete. The same errors recur on live mobile and offline reload.

This is a production-only integration failure: Vite preview does not apply Azure Static Web Apps headers, which is why the local suite misses it.

### P2 — Hashed static assets are not cached immutably

The deployed `index-DZNI6OJm.js` and `index-s09Zvwq8.css` responses both send:

```text
Cache-Control: public, must-revalidate, max-age=30
```

Their filenames are content-hashed, but they are revalidated after 30 seconds rather than receiving long-lived immutable caching. This fails the supplied static/PWA caching requirement.

### P2 — Success feedback is removed by a subsequent render

The normal custom-challenge and valid-deck-import flows persist successfully, but show no toast afterwards. Reproduction: submit a valid local challenge or import a structurally valid deck; the new challenge appears and local state updates, while `#toast` is empty. `persist()` shows a toast before the handler calls `render()`, and the render replaces it. This violates the interaction requirement that every action gives immediate feedback, although the state change is recoverable and visible.

## Evidence: clean checkout and automated checks

A new clean clone was checked out detached at the candidate SHA. `npm ci` completed with 0 vulnerabilities. The first isolated test attempt was discarded because dependencies were accidentally installed outside that clone; installation was then repeated in the clone before all results below.

| Check | Result |
| --- | --- |
| `npm test` | PASS — 9 Vitest assertions and 10 Playwright desktop/390px checks |
| `npm run build` | PASS — type check and Vite production build completed; `dist/` produced |
| Initial JS | PASS — 45,169 B raw (limit 200 KB) |
| Initial CSS | PASS — 21,092 B raw (limit 50 KB) |
| Mobile hero | PASS — 23,704 B WebP (limit 300 KB) |
| Lighthouse mobile, live URL | 98 Performance; 100 Accessibility; FCP 1.9 s; LCP 1.9 s; TBT 0 ms; CLS 0 |

There is no lint script or separate type-check script; the exact build command runs `tsc --noEmit` before Vite.

## Functional and resilience QA

Using the production build and Chromium:

- PASS: the free eight-card deck has material limits, reflection prompts, and four-level adult/peer rubrics; its content matches the brief's build/explain/critique and human-reviewable-evidence purpose.
- PASS: selected `Explain a black box`, logged a representative artifact with evidence, observation, next step, and rubric; it appeared in the local portfolio.
- PASS: custom challenge form accepts boundary value 15 minutes; 241 is rejected by native validation with `Value must be less than or equal to 240.` The required CC BY confirmation is present.
- PASS: invalid JSON deck produces `That file is not a Future Skills deck.` A subsequent valid deck imports, and export downloads the documented `future-skills-deck` JSON format.
- PASS: individual print invokes printing; print media exposes one `.print-sheet` and `.print-area` as `display: block`.
- PASS: invalid-license API response locks premium challenges and presents `That license is not active. Check the token or buy a new license.`
- PASS: with browser storage methods forced to throw, `?license=token` is stripped from the URL, the free app renders one h1, and no page error occurs.
- PASS: live service worker is active at `/sw.js`, owns the root scope, accepts `registration.update()`, and live mobile reload succeeds offline with the explicit offline message.

## Accessibility, responsive, and browser checks

- PASS: fresh Chromium axe scans on production output and live 390x844 page have zero serious/critical violations.
- PASS: live mobile has one `h1`, one `main`, `lang="en"`, and no horizontal overflow (`scrollWidth=390`, `clientWidth=390`).
- PASS: keyboard Tab reaches and visibly reveals the skip link (3px outline); Enter opens a challenge. Artifact dialog starts at `#artifact-title`, traps Tab, closes with Escape, and restores focus to the triggering Log button.
- PASS: reduced motion changes transition duration to `0.01ms`.
- PASS locally: no console or page errors during normal artifact, invalid input/import, and invalid-license flows. FAIL live: the P1 CSP errors above occur on load.

## Privacy, network, headers, and deployment identity

- PASS: normal free use made no outbound requests. The only product runtime outbound request is the allowed Sociobot license verification endpoint when a license is supplied; no analytics, tracking, child account, or third-party runtime/CDN request was found.
- PASS: no downloaded font files; generated hero assets are local and provenance is documented in `.factory/design.md`.
- PASS: live responses provide HTTPS/HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` disabling camera/microphone/geolocation, and the CSP above. Direct `/privacy`, `/terms`, and a nonexistent route return the SPA shell as expected.
- PASS: live `index.html`, JS, CSS, both hero WebPs, `sw.js`, and manifest each had identical SHA-256 bytes to the clean candidate build. The live site is therefore the candidate, not a stale or divergent deployment.

## Required resolution before approval

1. Make the progress fill CSP-compatible (for example, use semantic progress elements/CSS classes or an explicitly safe CSP strategy), retaining a strict CSP, then test the deployed headers—not only Vite preview.
2. Configure long-lived `immutable` caching for content-hashed `/assets/*` while keeping HTML and `sw.js` short-lived/revalidated.
3. Render before issuing success toasts, or preserve the toast across render, for custom creation and import.
4. Re-run live Chromium console checks, offline reload, and cache-header verification after deployment.
