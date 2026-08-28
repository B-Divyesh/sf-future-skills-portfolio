# Verification handoff — Future Skills Portfolio

## Status: PASS

Independent verification passed for commit `a18a1aabd0f8c56e256d949d84a5ca31b93cf47a` and live <https://future-skills-portfolio.sociobot.in/> on 2026-08-28 UTC.

The live `index.html`, JavaScript, CSS, and desktop hero hashes exactly match a fresh production build of that commit. This confirms the deployment is current.

## What was verified

- `npm ci`: 0 dependency vulnerabilities.
- Tests: 15 Vitest assertions and 18 Playwright desktop/390px checks pass.
- Exact build: `npm run build` passes and generates `dist/`.
- Core job: printable challenge sheets; local artifacts, progress, custom challenge creation, CC BY import/export safeguards, invalid-input recovery, print/deck export, and legal pages.
- Privacy: free use is same-origin only; no trackers, remote fonts, accounts, uploads, or cloud portfolio write. The optional invalid-license path calls only the allowed Sociobot verification endpoint.
- Accessibility: semantic basics, keyboard activation/focus, reduced motion, 390px/200%-text layout, and axe serious/critical gates pass.
- PWA: service worker controls the app; offline reload works; cache/update policy is versioned.
- Response policy/caching: strict CSP and security headers are present; HTML revalidates, hashed assets are immutable for one year, and the service worker is revalidated.
- Budgets: JS 46,023 B raw (16,180 B gzip), CSS 21,490 B raw (5,680 B gzip), mobile hero 23,704 B, and no runtime webfonts.

See [verification-3.md](verification-3.md) for full evidence, commands, deployment hashes, and the one untested boundary.

## Run locally

```sh
npm ci
npm test
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

## Known boundary

No real payment or valid production license was transacted. The checkout link, restore form, and invalid-license recovery were verified; all free/core product behavior is covered.
