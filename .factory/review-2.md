# Adversarial first-read review 2 — Future Skills Portfolio

**Verdict: FAIL**

**Reviewed commit:** `cd6ce74c0b7cd3963ec240aaf6d6860f85494d98`  
**Live URL:** <https://future-skills-portfolio.sociobot.in/>  
**Reviewed:** 2026-08-28 UTC

This is not accepted. The landing page is understandable and the demo is safely isolated, but the demo does not show the product being used in its first viewport, and several visitor-relevant statements remain outside the claims inventory.

## 30-second cold read

Fresh Chromium contexts with empty storage were opened at 390×844 and 1440×900. Nothing was scrolled before recording the result.

| Question | Answer from first screen | Result |
| --- | --- | --- |
| What does it do? | It helps a family build a portfolio from printable math and computing challenges. | Clear: “Build a portfolio of math and computing work”. |
| For whom? | Families guiding learners aged 10–16. | Clear: “For families guiding ages 10–16…”. |
| What should I click first? | “Try it with sample data”. | Clear; the adjacent line says “Opens a ready six-week example.” |

The 390px screen and desktop screen therefore pass the initial comprehension test. The issue is what happens after that click (F-2-1).

## Findings

### Blocking

#### F-2-1 — The one-click demo opens a second marketing hero, not a visible sample portfolio

**Location / exact quote:** The landing action is “Try it with sample data” and promises “Opens a ready six-week example.” After clicking at 390px, the whole first viewport contains the banner, hero headline, audience sentence, the same two hero actions, and facts. It does not show a sample artifact, artifact list, completed-work total, or a realistic portfolio entry. The first real sample item is below the hero, How it works, and challenge-deck introduction.

**Verification:** The demo banner is present: “Demo — sample data, nothing is saved”; Reset works; `demo:future-skills-portfolio:v1` is used; a byte-for-byte sentinel in `future-skills-portfolio:v1` stayed unchanged through entry, reset, and exit; exit removed the demo key. The sample itself is realistic once scrolled to: four named artifacts with observations and next steps. That does not meet the required first-screen result.

**Why this fails:** The visitor makes the requested one-click attempt and sees another sales screen. “Four sample artifacts show a six-week portfolio” is only a statement in the banner, not the product visibly in use.

**Concrete fix:** On demo entry, make the first viewport a compact portfolio view: show “4 / 4 artifacts”, three skill modes, and at least two named sample artifacts with their observation/next step, above the fold. Keep the persistent banner and controls. Add a mobile viewport claim test which asserts an `.artifact-list` item and the portfolio progress intersect the 390×844 viewport immediately after the action.

### Major

#### F-1-4 (reopened; F-2-2) — Public claims remain unlisted or are not proved by the named claim test

The earlier finding required every public claim to be represented by a manifest entry and observable test. `.factory/claims.json` and its 12 tagged tests are a substantial repair, but the following live/README statements still have no matching manifest claim and test. This reopens F-1-4 under the required history rule.

| Location / exact quote | Why it is unlisted or unproved | Concrete fix |
| --- | --- | --- |
| Hero and demo banner: “Opens a ready six-week example.” / “Four sample artifacts show a six-week portfolio.” | No claim entry covers six weeks. The shipped artifact dates are 2026-08-04, 11, 18, and 25: a three-week span, not six. | Either change both to “Opens four sample artifacts” / “Four sample artifacts are ready to inspect”, or seed and assert a real six-week span in a new `sample-six-week` claim. |
| Challenge deck: “Filter by skill or age.” | No claim asserts filter results, only that the controls exist. | Add `challenge-filters` with sample filter/result assertions, or change to “Choose a skill mode or age range.” |
| Challenge deck: “Each challenge includes materials, limits, reflection, and review.” | `included-deck` counts cards, modes, and one selected rubric; it does not prove all eight cards supply those fields. | Extend `included-deck` to inspect all eight source/rendered challenges, or remove “Each”. |
| Portfolio: “A six-week goal is four artifacts across at least three skill modes.” | It is an outcome/recommendation the visitor could rely on, without a claim or evidence. | Say “This example tracks four artifacts across three skill modes”, or add a clearly labelled configurable goal and a claim proving its calculation. |
| Privacy section and README: “No AI scoring or career predictions.” / “The product does not predict careers or score children with AI.” | `private-free-use` proves same-origin requests and no account, not the absence of an AI-scoring/career feature. | Remove the promise, or add a source-level/public-surface claim test that asserts no AI endpoint, key field, scoring control, or career-output copy across the shipped app. |
| Import panel: “Imports stay in this browser.” | `licensed-import` tests license acceptance/rejection but not that an import changes only the current storage namespace. | Extend `licensed-import` to compare real and demo keys before and after import. |
| README: “Offline use after the first production visit.” | The listed offline test exercises `/?demo=1`, not the stated production workspace. | Change README to “Offline demo use after one visit”, or test a fresh real workspace offline reload and portfolio edit. |
| README: “The site asks for no child account, profile, photo, analytics identifier, or cloud sync.” | The privacy test covers same-origin requests/no account, but does not assert the stated absence of profile, photo, analytics, or sync surfaces. | Narrow copy to the tested claim, or add a privacy-surface test for those controls and all network origins. |

**Why this fails:** The manifest no longer gives a complete, machine-checkable inventory of statements a family may rely on. The erroneous “six-week” wording is also directly misleading.

### Minor

#### F-2-3 — “Artifact” and “reviewable work” are unexplained education jargon in action copy

**Location / exact quote:** “Turn a challenge into reviewable work”; “Log an artifact”; “A six-week goal is four artifacts across at least three skill modes”; README “Families collect reviewable work across six skill modes.”

**Why this matters:** The site does explain the data model later, but a first-time parent is asked to perform “Log an artifact” before being told that this means keeping a short record of completed work. “Reviewable” is also an abstract adjective rather than a result.

**Concrete fix:** Use “Complete a challenge and review the work”, “Save a work record”, and “This example tracks four work records in three activity types.” Add a one-line definition only if “artifact” must remain in exported data.

#### F-2-4 — The external Creative Commons link is not identified as external

**Location / exact quote:** The landing-page link text is “CC BY 4.0” and leads to `https://creativecommons.org/licenses/by/4.0/`.

**Why this matters:** The site-structure contract requires external links to say so. A visitor cannot tell that this leaves the product site.

**Concrete fix:** Label it “CC BY 4.0 (opens Creative Commons)” and add an accessible external-link indication.

## Copy audit

Method: the production landing DOM was read in a fresh desktop context and segmented by the existing project audit’s Unicode-word method. The full landing inventory is the 203 exact text fragments with word counts in [`.factory/copy-audit.md`](copy-audit.md), rows 1–203. It is reproduced there rather than abbreviated here: all are ≤22 words and it records no banned-word match. Header/footer/demo additions checked in this round are below. “Fragment” includes headings and controls because they must make sense in isolation.

### Additional landing chrome and demo fragments

| Words | Exact copy | Flag |
| ---: | --- | --- |
| 4 | Skip to main content | — |
| 3 | FUTURE SKILLS PORTFOLIO | — |
| 1 | Demo | — |
| 1 | Privacy | — |
| 6 | Printable math and computing challenges for ages 10–16. | — |
| 2 | Privacy · Terms | — |
| 5 | Built by Param Factory · polish-1 | — |
| 4 | Original generated hero image. | — |
| 6 | Demo — sample data, nothing is saved | — |
| 7 | Four sample artifacts show a six-week portfolio. | F-2-2 |
| 2 | Reset demo | — |
| 3 | Start for real | — |

### README sentences and fragments

| Words | Exact copy | Flag |
| ---: | --- | --- |
| 3 | Future Skills Portfolio | — |
| 11 | A private, printable challenge deck for families supporting curious learners aged 10–16. | — |
| 9 | Families collect reviewable work across six skill modes. | F-2-3 |
| 10 | The product does not predict careers or score children with AI. | F-1-4 / F-2-2 |
| 2 | What is included | — |
| 11 | Eight free challenges with materials, limits, reflection prompts, and a four-row rubric | F-1-4 / F-2-2 |
| 14 | Local artifact records with a six-week goal of four artifacts across three skill modes | F-1-4 / F-2-2, F-2-3 |
| 7 | Print-ready individual challenges and family-selected decks | — |
| 9 | Local challenge creation plus JSON deck import and export | — |
| 7 | Offline use after the first production visit | F-1-4 / F-2-2 |
| 11 | A separate sample workspace that never reads or changes the real portfolio | — |
| 15 | The site asks for no child account, profile, photo, analytics identifier, or cloud sync. | F-1-4 / F-2-2 |
| 6 | Browser storage holds portfolio data. | — |
| 4 | New Keepsake Deck purchases are not offered because the hosted checkout is unavailable. | — |
| 2 | Run locally | — |
| 6 | Use Node.js 20 or later. | — |
| 5 | Vite prints the local URL. | — |
| 9 | The product uses vanilla TypeScript and local runtime assets. | — |
| 3 | Test and build | — |
| 9 | Run one public claim with `npm run test:claims -- --grep @claim:<id>`. | — |
| 7 | Every command is listed in `.factory/claims.json`. | — |
| 6 | The production build is in `dist/`. | — |
| 7 | Azure Static Web Apps configuration is in `public/staticwebapp.config.json`. | — |
| 4 | Product and visual notes | — |
| 12 | See `.factory/design.md` for the visual system, asset prompts, and provenance. | — |
| 1 | License | — |
| 9 | Application code and included materials use the MIT License. | — |
| 6 | Exported challenges use CC BY 4.0. | — |
| 7 | Imports without that license are rejected. | — |

No sentence exceeds 22 words. No banned marketing adjective was found. The term audit is otherwise consistent (`challenge`, `deck`, `artifact`, `portfolio`, `skill mode`), but F-2-3 flags the remaining jargon rather than an inconsistent label. Buttons use result-naming verbs or accessible names except the short visual “+ Deck”, which has the accessible name “Add [challenge] to print deck”; it is not a finding.

## Demo, sandbox, and claims evidence

The demo’s isolation behavior passes manual verification. I stored the literal sentinel `{"sentinel":"keep exactly"}` under the real key before entry. Entry and Reset left those bytes unchanged, placed sample changes only under `demo:future-skills-portfolio:v1`, and Start for real removed that demo key. A complete demo flow loaded only same-origin requests. The service worker was exercised by the listed offline claim test after network disable.

Every listed claim command was run independently from a fresh clone in `/tmp/fsp-review2-TIc31q` after `npm ci` and `npm run build`:

| Claim id | Result |
| --- | --- |
| `demo-isolation` | PASS |
| `offline-reload` | PASS |
| `private-free-use` | PASS |
| `checkout-disabled` | PASS |
| `included-deck` | PASS |
| `print-results` | PASS |
| `portfolio-export` | PASS |
| `deck-export` | PASS |
| `licensed-import` | PASS |
| `routing-metadata` | PASS |
| `local-authoring` | PASS |
| `static-build` | PASS |

The clean clone’s `npm test` and `npm run build` also pass. Passing listed tests does not close F-1-4/F-2-2 because the omitted statements have no matching entry.

## Earlier-report audit

I read `.factory/review-1.md`, `.factory/polish-1.md`, and the previous `.factory/handoff.md`, then verified each prior finding against live behavior and source. “Fixed” means the original condition was no longer reproduced; the separate demo-quality and claims-inventory problems above are newly observed/reopened scope gaps.

| Earlier id | Live and code confirmation | Status |
| --- | --- | --- |
| F-1-1 | Hero action enters `?demo=1`; banner/reset/exit exist; source uses `DEMO_STORAGE_KEY`; real sentinel remained untouched. | Fixed, with new F-2-1 quality failure. |
| F-1-2 | No checkout/buy/price link appears; `checkout-disabled` passes. | Fixed. |
| F-1-3 | `/missing-review2` returns HTTP 404 with styled “Page not found”; source route branch matches. | Fixed. |
| F-1-4 | Manifest and tagged tests exist, but F-2-2 identifies remaining public claims outside it. | Reopened as blocking. |
| F-1-5 | Direct `/`, `/demo`, `/privacy`, `/terms`, and missing page each set title, description, canonical, OG image, favicon and touch icon. | Fixed. |
| F-1-6 | Privacy link, Back, Forward, and section navigation focus their h1/h2; source uses `pushState`, `popstate`, and polite status. | Fixed. |
| F-1-7 | Header/footer, How it works, privacy section, Param Factory attribution, and build id appear on all checked routes. | Fixed. |
| F-1-8 | Hero h1 is “Build a portfolio of math and computing work”. | Fixed. |
| F-1-9 | Copy distinguishes four ceramic examples from six skill modes. | Fixed. |
| F-1-10 | Empty workspace says “Print selected challenge”; demo says “Print deck (4)”; print claim passes. | Fixed. |
| F-1-11 | Three hero facts now state free, local, and print/export facts. | Fixed. |
| F-1-12 | Challenge/deck/artifact/portfolio/skill mode are used consistently. | Fixed; see F-2-3 for plain-language quality. |
| F-1-13 | No banned marketing terms or overlong sentence was found. | Fixed. |
| F-1-14 | Headings are understandable in the checked heading list. | Fixed. |
| F-1-15 | Cards and filters have result-naming accessible labels. | Fixed. |
| F-1-16 | README opening is 11 words. | Fixed. |
| F-1-17 | README second sentence is 10 words. | Fixed. |
| F-1-18 | Design pointer is 12 words. | Fixed. |
| F-1-19 | License explanation is split into short sentences. | Fixed. |
| F-1-20 | `brief.summary` and catalog description are present and verb-first. | Fixed. |

## Structure, accessibility, and crawl

- `/`, `/?demo=1`, `/demo`, `/privacy`, `/terms`, and `/missing-review2` were direct-loaded. The first five returned 200; the missing page returned 404. Each had one h1 and one main.
- Home uses `Future Skills Portfolio — Printable math challenges`; legal/demo titles use the required route pattern. Descriptions, canonicals, OG/Twitter art, SVG favicon, apple touch icon, robots, and sitemap are present.
- Back/forward and deep links were checked. Focus reaches the destination heading and the live status region is updated.
- Axe reported zero serious/critical violations on every checked route. No unexpected application console/page errors occurred; the browser logs the expected failed-resource message when intentionally loading the HTTP 404.
- Internal links and the Creative Commons link returned 200; hash/mailto links were correctly not fetched. F-2-4 remains because that outbound link is not identified.
- The glacial ceramic surface, original still life, editorial serif, stamped controls, and print-sheet layout are distinct from a generic SaaS template and conform to `.factory/design.md`.

## Missed leverage

No additional AI feature is expected. The brief expressly excludes AI tutoring and the product already provides the implied local challenge creation, JSON import/export, print deck, and offline flow. No provider key or decorative AI surface was found.

## What would make this perfect

Make demo entry show named, realistic sample work in the first 390px viewport; correct or prove the six-week language; complete the claims manifest/test inventory for every retained promise; replace or define “artifact” and “reviewable work”; and identify the external CC BY link. Then repeat the clean-clone, mobile, offline, privacy, route, and link checks.
