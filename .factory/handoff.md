# Repair handoff — Future Skills Portfolio polish 1

## Status: PASS

All 20 findings in `.factory/review-1.md` are resolved and mapped in `.factory/polish-1.md`. The repair preserves the static Vite/TypeScript artifact and the glacial ceramic visual system.

**Implementation commit:** `ec3a1b8`

**Deployment:** Azure Static Web Apps production deployment `a7ba9bae-a3e7-4604-8f47-d5b491ee2824`

**Live:** <https://future-skills-portfolio.sociobot.in/>

**Demo:** <https://future-skills-portfolio.sociobot.in/?demo=1>

## What changed

- Rewrote the first screen around the family’s task and added three concrete facts.
- Added a seeded, resettable demo in a separate `demo:` storage namespace.
- Added 12 public claims with one tagged browser test per claim.
- Added route-specific metadata, History API focus behavior, real legal routes, and an HTTP 404 page.
- Added the missing how-it-works and privacy/non-goals sections, consistent navigation, and build ownership in the footer.
- Standardized challenge, deck, artifact, portfolio, and skill-mode language across UI and README.
- Removed the dead paid checkout and every price or purchase action. New purchases are not represented while the upstream product is disabled.
- Added a product-derived social card, touch icon, `/demo` sitemap entry, and versioned offline shell.
- Kept prior storage-denial, corrupt-state, CC BY import, CSP, caching, reflow, dialog, and feedback repairs intact.

## Exact verification

Clean clone `/tmp/fsp-polish-clean-saeBKp` at `ec3a1b8`:

- `npm ci`: PASS, 0 vulnerabilities.
- Every command in `.factory/claims.json`: PASS independently, 12 claims and 24 desktop/mobile cases.
- `npm test`: PASS, 16 Vitest assertions and 50 Playwright checks across desktop and 390px Chromium.
- `npm run build`: PASS; `dist/index.html` produced.
- Initial JavaScript: 49,461 B raw / 16.96 KB gzip (budget ≤200 KB).
- Initial CSS: 24,565 B raw / 6.30 KB gzip (budget ≤50 KB).
- Mobile hero: 23,704 B (budget ≤300 KB). Runtime fonts: 0 B.

Local mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.2 s, CLS 0, TBT 0 ms.

Live cold checks after deployment:

- `/`, `/demo`, `/privacy`, and `/terms`: HTTP 200 with the correct title, canonical, description, one h1, and one main.
- `/missing-challenge`: HTTP 404 with “Page not found” and a home action.
- Axe: zero serious or critical findings on all five route states.
- Demo: four artifacts; reset works; the real storage value remains byte-for-byte unchanged; exit deletes the demo key.
- Mobile at 200% text: `scrollWidth=390`, `clientWidth=390`.
- Offline demo reload: four artifacts and visible offline status.
- Browser health: zero unexpected console or page errors.
- Privacy: all requests observed in the complete cold flow were same-origin.
- Factory `verify-url.sh`: PASS in 941 ms with title/lang/main/alt/button checks.
- Live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.1 s, CLS 0, TBT 40 ms, 49 KiB transferred.

Deployment byte identity:

| File | SHA-256 |
| --- | --- |
| `index.html` | `3789f2e270235cfc34a3ca9167f3470d0468de9f53d51290f579c76acbd7d69a` |
| `assets/index-BpiRrhTv.js` | `111430979ffe48a89ad7410c7446e63f1ce206130a9c0f49e3ecfc704f84c729` |
| `assets/index-CYKaDfkG.css` | `2fc7e588df9e58167b0c9c14dc4509e4f44fda8843c38faaa1cc9964e384a2c1` |
| `sw.js` | `06d9a9ff0c185cc51b1a2541bb8ac401c861229ecf37c0a4290e7b8cb5a6faa6` |
| `assets/social-card.jpg` | `0790131c574532a025d552850f4c3ddf4d3ee8c2f63c92a5851f900645648057` |

Evidence is in `.factory/evidence/polish-1/`, especially `live/live-audit.json`, `live/verify.json`, `live/lighthouse-mobile.json`, and the cold desktop/mobile screenshots.

## Known gaps and next steps

No review finding or product defect remains open. The external Sociobot checkout product is still disabled, so the product honestly offers no new purchase flow. A future billing work order may restore it only after endpoint reachability and hosted-checkout tests pass.

## Run locally

```sh
npm ci
npm test
npm run build
npm run preview
```
