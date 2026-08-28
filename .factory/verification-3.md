# Independent verification 3 — PASS

**Work order:** `future-skills-portfolio-verify-3`  
**Candidate:** `a18a1aabd0f8c56e256d949d84a5ca31b93cf47a`  
**Live URL:** <https://future-skills-portfolio.sociobot.in/>  
**Verified:** 2026-08-28 UTC

## Verdict

**PASS.** The candidate meets the researched brief and static-web release contract. It is a useful printable/local-first challenge deck for ages 10–16: eight free challenges have build/explain/critique-oriented tasks, material limits, reflection prompts, and adult/peer rubrics; the local portfolio tracks four artifacts across modes; families can make, import, export, and print decks. It makes no career prediction, AI-tutoring, child-account, profile, or data-collection claim.

This fresh evidence establishes that the live deployment is the candidate, not a deployment-only failure.

## Defects by severity

No release-blocking, high, medium, or low defects found in the tested scope.

Known test boundary: no real payment was submitted and no valid production license was used. The checkout is a plain Sociobot link; restore/verification was exercised with an intercepted invalid response and left paid cards locked.

## Clean checkout and quality gates

The checkout was clean and at the candidate SHA before installation.

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 61 packages installed; 62 audited; 0 vulnerabilities |
| `npm test` | PASS — 15 Vitest assertions and 18 Playwright checks (desktop and 390px Chromium), 48.8 s browser run |
| `npm run build` | PASS — `tsc --noEmit` and Vite 7.3.6; `dist/` produced |
| lint/type check | No lint script/configuration exists; TypeScript checking is part of `npm run build` and passed |

| Asset | Raw size | Budget | Result |
| --- | ---: | ---: | --- |
| Initial JavaScript | 46,023 B (16,180 B gzip) | ≤200 KB | PASS |
| Initial CSS | 21,490 B (5,680 B gzip) | ≤50 KB | PASS |
| Mobile hero WebP | 23,704 B | ≤300 KB | PASS |
| Desktop hero WebP | 68,972 B | ≤300 KB | PASS |
| Runtime webfonts | 0 B | ≤120 KB | PASS |

`dist/` is 288 KB including a 86 KB source map; the first-load JS/CSS budgets above exclude that non-referenced map. A direct Lighthouse CLI attempt was not usable in this container because its Chrome tab crashed; browser-based axe, responsive, offline, console, and byte-budget checks completed successfully.

## Functional evidence

- Keyboard Enter focused and activated the **Explain** filter (six results), then opened **Explain a black box**, opened its artifact dialog, and saved a complete artifact. It remained visible and was present in the sole local-storage record (`future-skills-portfolio:v1`).
- Export after adding a challenge to the shelf produced `future-skills-deck.json` as a browser download.
- Native boundaries reject authored-challenge duration below 15 minutes (`10`, `rangeUnderflow`) and above 240 (`245`, `rangeOverflow`). The 90-character artifact title limit is enforced by its input.
- Passing e2e coverage exercised custom challenge creation with CC BY 4.0 confirmation, valid import, license-less import rejection and recovery, blocked-storage recovery without a false saved message, malformed stored-state recovery, legal routes, and 200%-text mobile reflow.
- An intercepted invalid license verification returned the expected notice: “That license is not active. Check the token or buy a new license.” Paid cards stayed locked. The only resulting cross-origin request was the allowed `https://api.sociobot.in/api/v1/products/future-skills-portfolio/verify`.
- A service worker registered, controlled the page, and a forced-offline reload rendered the home shell successfully. Its cache is versioned (`future-skills-v3`); `skipWaiting`, old-cache cleanup, and `clients.claim` provide the update path.

## Accessibility, responsive, and visual checks

- Local production-build axe: zero serious/critical violations. Live 390px axe: zero serious/critical violations.
- Live and local pages have the expected title, `lang="en"`, exactly one h1, one main landmark, skip link, labelled controls, meaningful hero alt text, and direct `/privacy` and `/terms` routes.
- The keyboard focus treatment is visible: the focused filter has a 3px solid `rgb(166, 79, 56)` outline. Dialog focus trapping/Escape restoration is covered by the passing e2e suite.
- With reduced motion emulated, tested transition and animation durations are `0.00001s`; no looping or flashing motion was observed.
- At 390×844 the live and local pages have `scrollWidth=390` and `clientWidth=390`; the e2e test also passes at 200% root text size while filters and rubric intentionally scroll locally.
- Desktop and 390px visual review found the product-specific ceramic studio layout legible, correctly stacked on mobile, and free of clipped controls.
- Local representative normal/error flows and the live mobile load emitted zero console errors and zero page errors.

## Privacy, request, and response-policy evidence

In a clean free-use browser session, all observed requests were same-origin application shell/assets only. There are no analytics calls, child accounts, remote fonts, third-party scripts, CDN runtime assets, or cloud portfolio writes. The source permits only the stated Sociobot checkout/verification and the CC BY link for a contributor who chooses to read its licence.

Live responses use HTTPS and include HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, camera/microphone/geolocation denial, and:

```
Content-Security-Policy: default-src 'self'; img-src 'self' data:;
script-src 'self'; style-src 'self'; connect-src 'self' https://api.sociobot.in;
object-src 'none'; base-uri 'self'; frame-ancestors 'none'
```

HTML returns `public, must-revalidate, max-age=30`; hashed JavaScript/CSS assets return `public, max-age=31536000, immutable`; and `sw.js` returns `no-cache, must-revalidate`.

## Deployment identity

Fresh local `dist/` and live responses match byte-for-byte:

| File | SHA-256 |
| --- | --- |
| `index.html` | `c351216525f2591a33719312f5d48b5f399e3a5dfd040b2e1f87ffc3d61d2d16` |
| `assets/index-n3NRonPh.js` | `e1346c85497705ed9a16274fa0a5efd730817d82fc70462adfc6f0cf6458cd6d` |
| `assets/index-B23sdSeX.css` | `631a759a665ddbc067cb0e859bddc2fdef078dc91681c202e71e39c6bb150cc8` |
| `assets/hero-ceramic.webp` | `f1e9b9f0076b0525fbeab875ad2bab142c2060eef5a70f0655da1fc513e5aa08` |

The live HTML references the same hashed JS/CSS names as the candidate build.

## How to reproduce

```sh
npm ci
npm test
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Then run the Playwright suite or visit the preview with Chromium. The live URL above is the candidate verified here.
