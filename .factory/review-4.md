# Adversarial first-read review 4 — Future Skills Portfolio

**Verdict: PASS**

**Work order:** `future-skills-portfolio-review-4`  
**Reviewed commit:** `b2224fba53ee7d2093e9537101f5a526bfd2d66c`  
**Live URL:** <https://future-skills-portfolio.sociobot.in/>  
**Reviewed:** 2026-08-28 UTC

There are zero open findings. The live deployment is understandable before scrolling, the sample workspace is isolated, every public claim has a passing clean-clone test, and the previous findings remain fixed in both the deployed product and the source.

## 30-second cold read

Fresh Chromium contexts had empty browser storage and blocked service workers for the initial observation. No scrolling occurred. The first screen at both 390×844 and 1440×900 said:

> “Build a portfolio of math and computing work”  
> “For families guiding ages 10–16 through printable challenges, reflection, and human review.”  
> “Try it with sample data” / “Opens four completed work records.”

My first-read answer is: this gives parents or educators printable math and computing activities, then lets them keep a local record of the learner’s work and adult or peer review. It is for families guiding ages 10–16. Click **Try it with sample data** first; it opens four completed examples. The facts “8 challenges are free.”, “Work stays in this browser.”, and “Works offline after one visit.” make the privacy, price, and offline boundaries clear. This passes at both sizes.

## Copy audit

The full landing-page sentence/fragment list, including exact text and Unicode word counts for all 204 production-rendered entries, is in [`.factory/copy-audit.md`](copy-audit.md). I regenerated that audit in a disposable clean clone against the live URL; it produced the same 204 rows as the checked-in audit. The deployed JS name also matched the clean build (`index-B0GCFvIf.js`).

- Landing entries over 22 words: 0
- Landing banned plain-words terms: 0
- Landing jargon, marketing adjectives, inconsistent terms, contextless headings, or non-result-naming buttons: 0 findings

README sentence and fragment audit:

| Location | Words | Exact copy | Result |
| --- | ---: | --- | --- |
| Title | 3 | Future Skills Portfolio | Pass |
| Opening | 12 | A private, printable challenge deck for families supporting curious learners aged 10–16. | Pass |
| Opening | 11 | Families save short records after completing challenges across six skill modes. | Pass |
| Link label | 1 | Live | Pass |
| Link label | 2 | Sample demo | Pass |
| Heading | 3 | What is included | Pass |
| List item | 12 | Eight free challenges with materials, limits, reflection prompts, and a four-row rubric | Pass |
| List item | 11 | Local work records with evidence, an observation, and a next step | Pass |
| List item | 6 | Print-ready individual challenges and family-selected decks | Pass |
| List item | 9 | Local challenge creation plus JSON deck import and export | Pass |
| List item | 10 | Export portfolio JSON and restore it by merging or replacing | Pass |
| List item | 9 | Offline demo and real workspace use after one visit | Pass |
| List item | 12 | A separate sample workspace that never reads or changes the real portfolio | Pass |
| Privacy | 14 | Free and demo use needs no account and sends no data to another site. | Pass |
| Privacy | 5 | Browser storage holds portfolio data. | Pass |
| Privacy | 4 | See the privacy policy. | Pass |
| Availability | 7 | Purchases are not offered in this release. | Pass |
| Heading | 2 | Run locally | Pass |
| Requirement | 5 | Use Node.js 20 or later. | Pass |
| Run note | 5 | Vite prints the local URL. | Pass |
| Run note | 9 | The product uses vanilla TypeScript and local runtime assets. | Pass |
| Heading | 3 | Test and build | Pass |
| Test note | 13 | Run one public claim with `npm run test:claims -- --grep @claim:<id>`. | Pass |
| Test note | 7 | Every command is listed in `.factory/claims.json`. | Pass |
| Build note | 7 | The production build is in `dist/`. | Pass |
| Build note | 8 | Azure Static Web Apps configuration is in `public/staticwebapp.config.json`. | Pass |
| Heading | 4 | Product and visual notes | Pass |
| Note | 10 | See `.factory/design.md` for the visual system, asset prompts, and provenance. | Pass |
| Heading | 1 | License | Pass |
| License | 10 | Application code and included materials use the MIT License. | Pass |
| License | 6 | Exported challenges use CC BY 4.0. | Pass |
| License | 7 | Imports without that license are rejected. | Pass |

`challenge`, `deck`, `work record`, `portfolio`, and `skill mode` are used consistently. “JSON” is retained only as the explicit name of an import/export file format, next to result-naming import/export actions; it is not needed for the first task.

## Demo, sandbox, and privacy check

The first-screen action opened `/?demo=1`. At 390 px its first screen was already a used product: heading “Inspect four completed work records,” progress, and two named sample work records were visible. The persistent banner read “Demo — sample data, nothing is saved” and exposed **Reset demo** and **Start for real**.

I set a byte-for-byte sentinel in `future-skills-portfolio:v1`, modified the demo, reset it, imported a sample portfolio, and left with **Start for real**. The sentinel never changed; reset restored four records; leaving removed only `demo:future-skills-portfolio:v1`. An offline reload after the initial visit retained the demo and showed its offline status. Request interception observed only `https://future-skills-portfolio.sociobot.in` during the complete demo flow.

## Claims check

In a new clone at `/tmp/fsp-review4-clean`, `npm ci` completed with 0 vulnerabilities. Each of the 15 exact commands named in [`.factory/claims.json`](claims.json) passed independently; every command ran its desktop and mobile browser variants (30 passing claim checks total).

| Claim id | Result |
| --- | --- |
| `demo-isolation` | Pass (2/2) |
| `offline-reload` | Pass (2/2) |
| `private-free-use` | Pass (2/2) |
| `checkout-disabled` | Pass (2/2) |
| `included-deck` | Pass (2/2) |
| `challenge-filters` | Pass (2/2) |
| `work-records` | Pass (2/2) |
| `print-results` | Pass (2/2) |
| `portfolio-export` | Pass (2/2) |
| `portfolio-import` | Pass (2/2) |
| `deck-export` | Pass (2/2) |
| `licensed-import` | Pass (2/2) |
| `routing-metadata` | Pass (2/2) |
| `local-authoring` | Pass (2/2) |
| `static-build` | Pass (2/2) |

The full clean-clone suite then passed: 18 unit tests and 58 Playwright checks. `npm run build` passed and emitted 18.06 kB gzip JavaScript and 6.79 kB gzip CSS. I reread the live landing page and README after the run. All visitor-relevant statements map to a listed tested capability; no unlisted claim finding remains.

## Earlier-finding regression check

Each earlier finding was rechecked on the live site and in the source, not accepted merely because a polish document marked it closed.

| Earlier id | Confirmed state |
| --- | --- |
| F-1-1 | Fixed: one-click demo, four realistic records, persistent banner, reset, discard-on-exit, and separate `demo:` storage work live; `src/main.ts` selects `DEMO_STORAGE_KEY`; `@claim:demo-isolation` passed. |
| F-1-2 | Fixed: no live purchase action, price, or checkout link; `@claim:checkout-disabled` passed. |
| F-1-3 | Fixed: `/missing-challenge` returned HTTP 404 with the designed ceramic page and a working Return home link. |
| F-1-4 | Fixed: `claims.json` contains 15 tagged, observable tests; every listed command passed. |
| F-1-5 | Fixed: home, demo, privacy, terms, and 404 had route-specific title, description, canonical, OG/Twitter fields, favicon, and social card. |
| F-1-6 | Fixed: direct route navigation, browser Back, heading focus, and polite route status worked live. |
| F-1-7 | Fixed: header, first-screen task/action/facts, live product, three-step explanation, privacy boundary, legal footer, Param Factory credit, and build id are present. |
| F-1-8 | Fixed: the sole home h1 remains the job-first “Build a portfolio of math and computing work.” |
| F-1-9 | Fixed: visual caption says four *example* skills; the deck and test show six skill modes. |
| F-1-10 | Fixed: an empty real workspace says “Print selected challenge”; a populated demo says “Print deck (4),” with exact sheet counts tested. |
| F-1-11 | Fixed: the first screen states free availability, local browser storage, and offline-after-one-visit. |
| F-1-12 | Fixed: public source and live copy use the audited terminology table above. |
| F-1-13 | Fixed: production copy audit has zero long or banned fragments. |
| F-1-14 | Fixed: headings are ordered and stand alone; live axe reported zero serious or critical violations on all five routes. |
| F-1-15 | Fixed: filters expose result-naming accessible names, and deck controls say Add/Remove from print deck. |
| F-1-16 | Fixed: README opening is 12 words. |
| F-1-17 | Fixed: README second sentence is 11 words. |
| F-1-18 | Fixed: visual/provenance note is 10 words. |
| F-1-19 | Fixed: license statements are short and separated. |
| F-1-20 | Fixed: the catalog description is present, verb-first, and 78 characters. |
| F-2-1 | Fixed: the demo first viewport contains product use—progress and two named sample records—not a second marketing hero. |
| F-2-2 / reopened F-1-4 | Fixed: current live/README claims map to the manifest and all claim commands passed. |
| F-2-3 | Fixed: public action copy uses the concrete term “work record.” |
| F-2-4 | Fixed: the only external link is labeled “CC BY 4.0 (opens Creative Commons)” and returned HTTP 200. |
| F-3-1 | Fixed: live 390 px measurement found no visible link or button under 44×44 px on home, demo, privacy, or terms. |
| F-3-2 | Fixed: checkout wording now makes only the observable no-price/no-action claim and its test verifies that result. |
| F-3-3 | Fixed: “Works offline after one visit.” is a first-screen fact and offline reload passed. |
| F-3-4 | Fixed: visible deck-toggle labels state the result. |
| F-3-5 | Fixed: README contains no unavailable Keepsake Deck or checkout wording. |
| F-3-6 | Fixed: live portfolio import validates, previews, merges, confirms replace, and stays in the demo namespace. |

## Structure and live-route check

| Route | HTTP | Title | h1 | Result |
| --- | ---: | --- | --- | --- |
| `/` | 200 | Future Skills Portfolio — Printable math challenges | Build a portfolio of math and computing work | Pass |
| `/demo` | 200 | Demo — Future Skills Portfolio | Inspect four completed work records | Pass |
| `/privacy` | 200 | Privacy — Future Skills Portfolio | How your work stays private | Pass |
| `/terms` | 200 | Terms — Future Skills Portfolio | Terms of use | Pass |
| `/missing-challenge` | 404 | Page not found — Future Skills Portfolio | Page not found | Pass |

Each route had one h1, description, canonical, OG/Twitter data, matching header/footer, skip link, and zero serious/critical axe violations. At 200% text size on 390 px, `scrollWidth` equaled `clientWidth` (390 px). The crawl found all normal route links at HTTP 200, the explicit mail links, and the named Creative Commons link at HTTP 200. The 404 page’s own `#main` skip link naturally retained its page’s intentional 404 status; it is not a destination failure. No console or page errors occurred.

The visual system is distinct rather than a generic SaaS template: the cold pale-mineral field, generated ceramic still life, editorial serif, stamped controls, and ceramic 404 all match the recorded glacial-ceramic thesis. The brief explicitly excludes AI tutoring and child profiling; the local creation, print, deck import/export, and portfolio export/restore workflows already supply the implied high-value actions. No decorative AI feature, provider key, or missing AI leverage finding applies.

## Findings

None. No `F-4-*` finding is open.

## What would make this perfect

The currently deployed product meets the review standard. Preserve the present demo-isolation and claim-test coverage on each future release; that is release discipline, not a remaining product change.
