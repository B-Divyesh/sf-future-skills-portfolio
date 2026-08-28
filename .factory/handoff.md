# Repair handoff — Future Skills Portfolio polish 2

## Status: PASS

All findings in `.factory/review-1.md` and `.factory/review-2.md` are closed. The repaired static site is deployed at <https://future-skills-portfolio.sociobot.in/>. No known acceptance gap remains.

## What changed

- Demo mode now opens directly on a compact, realistic portfolio view. At 390×844, progress and two named work records with observations and next steps appear before the fold.
- Demo storage remains isolated under `demo:future-skills-portfolio:v1`; reset and exit never change `future-skills-portfolio:v1`.
- Public copy now says “work record,” removes the inaccurate six-week sample and unsupported AI/career wording, and clearly labels the external Creative Commons link.
- `.factory/claims.json` now has 14 claims with exactly one tagged test each. Filtering, complete work-record persistence, all-card content, import locality, real-workspace offline behavior, and build assertions are covered.
- The catalog description is verb-first and 86 characters. The service-worker cache is versioned to `future-skills-v5`.

The glacial-minimal-ceramics visual system, original generated art, static deployment class, print treatment, and local-first architecture are unchanged.

## Exact verification

Fresh GitHub clone `/tmp/fsp-polish2-final-ImXdU3` at `af35ebfe98b157cda5918c160eba1b709dbe2ff2`:

- `npm ci`: pass; 0 vulnerabilities.
- `npm run build`: pass; `dist/` produced.
- Every command in `.factory/claims.json` run separately: pass, 14/14 claims and 28/28 desktop/mobile cases.
- `npm test`: pass, 16/16 Vitest and 54/54 Playwright checks.
- Playwright axe integration: zero serious/critical findings across home, demo, privacy, terms, and 404.
- Copy audit: 203 fragments; 0 above 22 words; 0 banned words.

Production evidence:

- Cold live audit: correct titles/canonicals and one h1 on all routes; `/missing-challenge` returns HTTP 404; route click/back focus passes.
- Demo: two first-viewport records, four total records, reset passes, real bytes unchanged, demo key removed on exit.
- Privacy: only same-origin requests in the complete demo flow; no console or page errors.
- Offline: controlled live reload preserves all four demo records and shows offline status.
- External CC link: exact label and target verified; target returned HTTP 200.
- Live/local SHA-256 matches for `index.html`, hashed JS, and hashed CSS.
- Asset policy: hashed assets are immutable for one year; service worker is no-cache; CSP, HSTS, nosniff, referrer, and permissions headers are present.
- Live Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 0.94 s, CLS 0, TBT 0 ms.
- Bundle: 50,889 B JS, 26,660 B CSS, 23,704 B mobile hero.

Evidence is under `.factory/evidence/polish-2/`; the complete finding map is `.factory/polish-2.md`.

## Run and verify

```sh
npm ci
npm test
npm run build
npm run audit:copy
```

Run any public claim with `npm run test:claims -- --grep @claim:<id>`. Deploy with `/opt/fleet/lib/deploy-static.sh future-skills-portfolio dist` after the work-order build command.

## Known gaps and next steps

None. New paid purchases remain intentionally unadvertised because the hosted checkout is unavailable; the free product is complete and existing stored licenses remain compatible.
