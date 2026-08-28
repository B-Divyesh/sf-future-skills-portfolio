# Handoff — Future Skills Portfolio v1

## What shipped

- A responsive, static Vite + vanilla TypeScript product for families with learners aged 10–16.
- Eight free, complete challenges spanning Build, Explain, Critique, Model, Debug, and Collaborate. Every sheet includes a concrete task, constrained materials, reflection prompts, and a transparent four-level adult/peer rubric.
- A private local portfolio: log text evidence, a concrete growth observation, next step, reviewer, rubric scores, and completion date. The six-week target tracks four artifacts across at least three distinct modes.
- Filtering by skill mode and age, a family print shelf, individual challenge printing, and print-specific A4/Letter layouts.
- A local challenge maker with required CC BY 4.0 sharing confirmation, plus JSON deck import/export and portfolio export. Nothing uploads to this product.
- Designed empty, corrupt-storage, local-write failure, invalid import, offline, license-invalid, and filtered-no-results states.
- A $19 USD one-time Keepsake Deck with eight additional curated challenges. The implementation follows the Sociobot hosted checkout, query-string capture, `sb_license:future-skills-portfolio` storage, daily verification cache, optimistic offline access, restore field, and revoked-license behavior. Core export, accessibility, and the complete free deck remain ungated.
- Direct `/privacy` and `/terms` routes, an installable manifest, a service worker that precaches the generated Vite shell, a sitemap, robots policy, and Azure Static Web Apps fallback/security headers.
- A product-specific glacial minimal ceramics visual system in `.factory/design.md`, original inline mode marks, and an original generated hero still life. Source and prompt sidecar are in `assets/src/`; 720px and 1200px WebP delivery assets are 24 KB and 68 KB.

## Run and verify

```sh
npm ci
npm test
npm run build
npm run preview
```

`npm test` ran successfully on 2026-08-28:

- 9 Vitest unit/content-contract tests passed.
- 10 Playwright checks passed across desktop Chromium and a 390×844 mobile Chromium viewport.
- Playwright covers artifact logging, local custom challenge creation, direct legal routes, horizontal overflow, semantic structure, console errors, and axe-core serious/critical issues.

`npm run build` passed and produced `dist/index.html`. Production bundle measurements:

- JavaScript: 45.17 KB raw / 15.95 KB gzip (budget: 200 KB)
- CSS: 21.09 KB raw / 5.58 KB gzip (budget: 50 KB)
- Mobile hero WebP: 23.7 KB (budget: 300 KB)
- No downloaded font files and no third-party runtime scripts

`verify-url.sh` against the production preview returned HTTP 200, no console errors, one h1, a main landmark, `lang=en`, alt text on all images, and no unlabeled buttons.

Lighthouse 12.8.2 mobile run against the production preview:

| Category / metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| First Contentful Paint | 1.1 s |
| Largest Contentful Paint | 1.3 s |
| Total Blocking Time | 50 ms |
| Cumulative Layout Shift | 0 |

Offline production behavior was smoke-tested after service-worker activation: the page reloaded with network disabled, retained its title and h1, and showed the offline status message.

## Known gaps and next steps

- The factory still needs to register `future-skills-portfolio` with the Sociobot production billing service. The UI deliberately uses the slug endpoint and contains no hardcoded provider product ID. A real purchase/return could not be exercised before registration; restore, caching, offline, and invalid-verdict paths are implemented.
- The six-week outcome is a product success measure, not something automated tests can establish. Run a family pilot and revise challenge wording based on observed completion and review quality.
- Portfolio/deck files are intentionally manual exports with no cloud sync. This is a privacy feature for v1, not an unfinished backend.

No infrastructure, DNS, billing registration, or deployment state was changed from this repository.
