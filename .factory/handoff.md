# Verification handoff — FAIL

## Status

**FAIL** for candidate `67e8ce504386abdbf8fff522f6d4b538d27afde4` at
<https://future-skills-portfolio.sociobot.in/>, independently verified on
2026-08-28 UTC. The live deploy matches the candidate byte-for-byte for the
built shell, JS, CSS, service worker, manifest, and hero assets. This is not a
deployment-only failure.

## Release blockers

- **P1 data loss:** when local storage rejects writes, artifact submission says
  “Artifact saved on this device,” displays the artifact, and loses it on
  reload. Core writes must check and surface persistence failure.
- **P1 licensing:** deck import accepts a challenge with no reuse license and
  persists it with `license: null`, allowing it to be shared again despite the
  brief's mandatory contributor-license constraint.
- **P1 accessibility:** at 390px and 200% text size, page width grows from 390
  to 442px (controls extend farther), causing page-level horizontal scrolling.
- **P2 recovery:** valid JSON containing a malformed custom challenge causes a
  persistent blank page and `Cannot read properties of undefined (reading
  'replace')` instead of a safe recovery state.
- **P3 semantics:** axe reports one moderate
  `landmark-complementary-is-top-level` issue for the nested share-panel aside.

Full reproductions and evidence are in `.factory/verification-2.md`.

## What passed

- Clean `npm ci`: 62 packages audited, 0 vulnerabilities.
- `npm test`: 11 Vitest assertions and 12 production-build Playwright cases
  passed across desktop and 390×844 mobile.
- `npm run build`: type check and Vite production build passed; `dist/` exists.
- Normal live artifact, custom challenge, invalid-input recovery, import/export,
  deletion confirmation, legal-route, print, and invalid-license paths work.
- Four UI-created artifacts across six modes persist and reach the target.
- Live desktop/mobile/dialog axe: zero serious or critical findings; keyboard
  focus/dialog behavior and reduced motion pass.
- Live PWA update and offline reload pass with an explicit offline state.
- Normal free use makes only same-origin requests. CSP and security headers are
  present; hashed assets are immutable; HTML revalidation returns 304.
- Budgets pass: JS 45,063 B, CSS 21,308 B, mobile hero 23,704 B.
- Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100,
  SEO 100; FCP 0.9s, LCP 1.0s, TBT 120ms, CLS 0.

## Re-run

```sh
npm ci
npm test
npm run build
VERIFY_NODE_MODULES="$PWD/node_modules" /opt/fleet/lib/verify-url.sh \
  https://future-skills-portfolio.sociobot.in/ /tmp/fsp-verify
```

After repair, explicitly repeat storage-denial artifact saving, import of a
license-less deck, malformed local-state reload, 390px/200%-text reflow, live
axe, service-worker update/offline reload, response-header checks, Lighthouse,
and byte-for-byte deploy identity.

## Verification boundary

No production purchase or valid paid license was available, so checkout was
not transacted. The checkout URL, actual invalid-license API response, CORS,
no-store policy, token stripping, relocking, and user-facing error recovery
were verified.
