# Adversarial first-read review 1 — Future Skills Portfolio

**Verdict: FAIL**

**Work order:** `future-skills-portfolio-review-1`

**Reviewed commit:** `83454db2e894b42155b5df449eeec3557fab9089`

**Live URL:** <https://future-skills-portfolio.sociobot.in/>

**Reviewed:** 2026-08-28 UTC

The live product is visually distinct, readable at 390 px, and its tested local-first workflows work. It still fails acceptance because there is no isolated sample demo, no claims manifest or claim-tagged tests, the paid checkout link returns 404, and unknown routes silently render the home app instead of a designed 404. Zero findings are required for `PASS`.

## 30-second cold read

Fresh Chromium contexts were opened at 390×844 and 1440×900 with empty storage and service workers blocked for the first-load observation. Nothing was scrolled before recording the following.

| Question | Mobile answer | Desktop answer | Result |
| --- | --- | --- | --- |
| What does this do? | It is a printable challenge deck intended to produce evidence of math and computing work. | Same. | Understandable from “A printable challenge deck…” but “Make evidence” is abstract. |
| For whom? | Families supporting learners aged 10–16. | Same. | Clear from “AGES 10–16” and “for families”. |
| What should I click first? | “Choose a challenge”. | “Choose a challenge”. | Clear, but it is not the mandatory one-click sample demo. |

The exact first-screen copy was: “AGES 10–16 · OFFLINE BY DEFAULT”; “Make evidence. Not predictions.”; “A printable challenge deck for families growing mathematical and computational judgment in an AI-rich world.”; “Choose a challenge”; “Print my shelf”; and “No child account. No AI scoring. No career claims.” The mobile first screen also began to show the ceramic hero image. The desktop first screen showed the full hero image. The first-read comprehension check therefore passes, but the headline and fact-row issues below remain findings.

## Findings

### Blocking

#### F-1-1 — There is no one-click demo, and `/demo` writes to real storage

**Location/quote:** The first screen offers “Choose a challenge” and “Print my shelf”; it has no “Try it with sample data”. Direct visits to `/demo` and `/?demo=1` render the ordinary home app. Neither shows “Demo — sample data, nothing is saved”, “Reset demo”, or “Start for real”. `.factory/demo.md` is absent.

**Evidence:** A fresh `/demo` context had zero artifacts and no sample portfolio. After seeding `future-skills-portfolio:v1` with `savedIds: ["paper-bridge"]`, `/demo` read that state (`aria-pressed="true"`). Removing the item in `/demo` overwrote the same real key with an empty `savedIds` array. No `demo:` key was created. Source uses one unconditional `STORAGE_KEY = "future-skills-portfolio:v1"` and does not branch on route/query.

**Why this fails:** A visitor cannot see the product working with realistic data in one click. Worse, the route that looks like a demo can read and change a family's real browser data.

**Concrete fix:** Add a first-screen “Try it with sample data” action linking to `/demo`. Seed a realistic six-week portfolio with at least four artifacts across three modes and selected print challenges. While in demo mode, show the persistent required banner and controls, use only a separate `demo:` namespace or memory store, implement Reset, and discard demo state on “Start for real”. Document the entry point and namespace in `.factory/demo.md` and test that the real key is byte-for-byte unchanged through the complete demo flow.

#### F-1-2 — The paid primary action is a dead link

**Location/quote:** Landing page button “Buy the Keepsake Deck”; README: “checkout uses the matching hosted Sociobot product URL.” Source points to `https://api.sociobot.in/api/v1/products/future-skills-portfolio/checkout`.

**Evidence:** Clicking the live link navigated to HTTP 404 with `{"error":"enabled factory product","status":404}`. A direct followed GET also returned 404.

**Why this fails:** The page offers a $19 purchase that cannot be started. This is a broken end-to-end paid flow and a dead-link failure.

**Concrete fix:** Enable the product in the Sociobot billing API or remove the purchase CTA and all availability claims until it is enabled. Add a clean-browser test that follows the exact anchor and asserts a successful hosted-checkout response, without submitting payment.

#### F-1-3 — Unknown routes impersonate the home page instead of showing a 404

**Location/quote:** `/this-route-does-not-exist` returned HTTP 200, title “Future Skills Portfolio — Make evidence, not predictions”, and h1 “Make evidence. Not predictions.” `render()` sends every path other than `/privacy` and `/terms` to `homePage()`.

**Why this fails:** A mistyped or stale link looks valid. This violates the required designed 404 and makes broken routing undetectable to visitors and crawlers.

**Concrete fix:** Render a product-styled not-found page for unknown paths with h1 “Page not found”, a home action, and title “Page not found — Future Skills Portfolio”. Configure the host to return 404 for that state where supported, and add direct-load/reload tests.

#### F-1-4 — Every public claim is unlisted and untested

**Location/quote:** `.factory/claims.json` does not exist and the repository contains zero `@claim:` tags. This leaves zero listed tests to run. The claim-like copy below is public but has no claim entry:

- Home/offline: “OFFLINE BY DEFAULT”; “You’re offline. The deck and local portfolio still work.”
- Home/privacy: “No child account.”; “No AI scoring.”; “No career claims.”; “0 accounts or uploads”; “Stored locally.”; “No account.”; “Your challenge stays local until you export it.”; “Importing adds the challenges to this browser; nothing is uploaded.”; “No tracking, child accounts, or public profiles.”
- Home/features and counts: “A printable challenge deck…”; “Four modes of evidence, shaped by hand.”; “8 free, complete challenges”; “6 human skill modes”; “1 transparent review rubric”; “Showing 16 challenges”; “A photo is not required.”; “Export a small JSON file for another family.”
- Home/paid: “Unlock eight additional curated challenge sheets for $19 USD, once.”; “The free eight-card deck, custom challenges, accessibility, and all exports stay free.”; “Lifetime license for this product”; “Restore on another device with your license token”; “Sociobot/Dodo is the merchant of record.”; “Refunds are handled there.”
- README/features: all six bullets under “What is included”; “The app requests no child account, profile, photo, analytics identifier, or cloud sync.”; “Browser storage holds the portfolio and optional license token.”
- README/runtime/build: “Requires Node.js 20 or later.”; “The app is a vanilla TypeScript static site with no runtime framework and no third-party runtime CDN.”; the `dist/`, Azure headers, verification, checkout, provider, asset provenance, MIT, and CC BY assertions.

The copy audit marks the same sentences with `C`. Outcome language such as “growing mathematical and computational judgment” and “Difficulty comes from reasoning and revision, not more screen time” is also unsupported and should be made purely descriptive unless a valid observable test is defined.

**Why this fails:** A visitor has no machine-checked basis for any privacy, offline, export, count, price, license, or build promise. The ordinary test suite passes, but none of those tests is connected to public claims through the required manifest.

**Concrete fix:** Add `.factory/claims.json`. Give each retained claim one unique id, exact locations, one tagged test, and an isolated sandbox. At minimum cover offline reload, no cross-origin requests during free/demo use, demo storage isolation, challenge/artifact counts, print/export/import outcomes, and checkout reachability. Remove or rewrite outcome claims that cannot be observed. Make the clean-clone verifier run each manifest command individually.

### Major

#### F-1-5 — Route metadata is incomplete and identical across pages

**Location/quote:** `/`, `/privacy`, `/terms`, `/demo`, and an unknown route all use “Future Skills Portfolio — Make evidence, not predictions” and the same home description. There is no canonical link, Open Graph metadata, Twitter card metadata, 1200×630 social image reference, or apple-touch icon.

**Why this fails:** Legal pages and invalid routes are mislabeled in browser history, search results, and shares. The home title describes a slogan, not the product job.

**Concrete fix:** Use route-specific titles such as “Future Skills Portfolio — Printable math challenges”, “Privacy — Future Skills Portfolio”, “Terms — Future Skills Portfolio”, and “Demo — Future Skills Portfolio”. Add route-specific descriptions and canonicals, complete OG/Twitter tags with original 1200×630 art, and a 180 px apple-touch icon. Add the real demo route to `sitemap.xml`. Test the head after direct navigation to every route.

#### F-1-6 — Route changes do not move or announce focus

**Location/quote:** Direct deep links scroll to `#deck`, `#portfolio`, `#make`, and `#keepsake`, but `document.activeElement` remains `BODY`. Navigating to `/privacy` also leaves focus on `BODY`. Source has no `pushState` route handler, `popstate` handler, or route-change focus code; the `aria-live` node is only the toast/status mechanism and is absent on legal pages.

**Why this fails:** A keyboard or screen-reader visitor receives no confirmation that the place/page changed. Back/forward changes visual position but not semantic focus.

**Concrete fix:** Implement the documented routing contract: update history for real routes, restore scroll on back/forward, focus the destination h1 or section heading with `tabindex="-1"`, and announce the new route/section through a persistent polite live region. Add direct-link, click, back, and forward tests.

#### F-1-7 — The required landing skeleton is incomplete

**Location/quote:** After the hero and number strip, the site immediately opens the full challenge shelf. There is no “How it works” three-step section and no dedicated “What it does not do / privacy” section. The four-link header provides neither Demo nor Privacy, and the footer omits “Built by Param Factory” and a version/build id.

**Why this fails:** A cold visitor must infer the sequence from a very long app page, and the required ownership/version details are unavailable during support or verification.

**Concrete fix:** Add three concise steps—choose a challenge, do and review the work, log the artifact—then a plain privacy/non-goals section. Replace lower-priority header anchors with Demo and Privacy while keeping at most four links. Add “Built by Param Factory” and an immutable build identifier to the footer on every route.

#### F-1-8 — The headline names an abstraction, not the job

**Location/quote:** h1 “Make evidence. Not predictions.” and title suffix “Make evidence, not predictions”.

**Why this fails:** “Evidence” is undefined until the visitor reads later sections; it could refer to research, compliance, or school assessment.

**Concrete fix:** Use “Build a portfolio of math and computing work” as the h1. Use the supporting sentence “For families guiding ages 10–16 through printable challenges, reflection, and human review.”

#### F-1-9 — “Four modes” contradicts the six-mode product

**Location/quote:** Hero caption “Four modes of evidence, shaped by hand.” versus the adjacent product fact “6 HUMAN SKILL MODES” and the filters Build, Explain, Critique, Model, Debug, Collaborate.

**Why this fails:** The visitor cannot tell whether the product has four or six modes.

**Concrete fix:** If the image intentionally shows four examples, say “Four ceramic forms represent four example skills.” Otherwise use “Different kinds of work, shaped by hand.” Do not state a conflicting count.

#### F-1-10 — “Print my shelf” produces a different result when the shelf is empty

**Location/quote:** Fresh first-screen button “Print my shelf”. Source falls back to `[selectedId]` when `savedIds` is empty, so it prints the default selected challenge rather than an empty shelf or an explained empty state.

**Why this fails:** The button does not name the result. A first-time visitor expects their shelf, not an unstated default sheet.

**Concrete fix:** When nothing is saved, label and implement “Print selected challenge” or disable “Print my deck” with a short instruction. When items are saved, use “Print my deck (N)”. Add a print-content assertion for both states.

### Minor copy and catalog findings

#### F-1-11 — The first-screen fact set omits price

**Location/quote:** “OFFLINE BY DEFAULT” and “No child account. No AI scoring. No career claims.” There is no first-screen price/free fact.

**Why this fails:** The required privacy/offline/price facts are not all visible together. The $19 option appears roughly ten mobile screens later.

**Concrete fix:** Show three short facts beside the primary action: “8 challenges are free.” “Work stays in this browser.” “Optional deck: $19 once.” Only retain tested wording.

#### F-1-12 — Core concepts use competing names

**Location/quote:** “challenge deck”, “challenge shelf”, “print shelf”, “evidence shelf”, “portfolio”, “artifact”, “evidence”, “work”, “prompts”, “challenge sheets”, and “cross-mode challenges”.

**Why this fails:** These terms make it unclear whether a shelf, deck, and portfolio are different saved objects.

**Concrete fix:** Define and use one vocabulary: **challenge** = activity; **deck** = challenges; **artifact** = one completed work record; **portfolio** = artifacts; **skill mode** = Build/Explain/etc. Rename “print shelf” to “print deck”, “evidence shelf” to “portfolio”, and paid “prompts/sheets” to “challenges”.

#### F-1-13 — Several phrases are jargon or unmeasured marketing copy

**Location/quote:** “mathematical and computational judgment in an AI-rich world”; “human skill modes”; “transparent review rubric”; “complete challenges”; “curated challenge sheets”; “cross-mode challenges”; “Same quiet format.”; README “human-reviewable evidence”.

**Why this fails:** A distracted parent must translate abstract nouns and adjectives before knowing what they get.

**Concrete fix:** Prefer “Printable math and computing challenges for families with learners aged 10–16”, “six activity types”, “one adult/peer rubric”, “eight free challenges”, “eight paid challenges”, and “the same printable format”.

#### F-1-14 — Three headings do not stand alone

**Location/quote:** “More prompts. Same quiet format.”; “Pass a deck hand to hand”; “Your shelf is ready”.

**Why this fails:** In a screen-reader heading list, the first depends on missing context, the second is a metaphor, and the third describes an empty state as complete.

**Concrete fix:** Rewrite them as “Get eight more printable challenges”, “Export or import a challenge deck”, and “No artifacts yet”.

#### F-1-15 — Selection and filter buttons do not name their result

**Location/quote:** Sixteen card buttons expose names such as “NO. 01 Make structure visible The one-sheet bridge…” with no action; shelf pins say “+ Shelf”; filters are only “All”, “Build”, “Explain”, and so on.

**Why this fails:** The control type is exposed, but its result is not. “+ Shelf” also uses the inconsistent noun from F-1-12.

**Concrete fix:** Give cards accessible names such as “Open challenge: The one-sheet bridge”, pins “Add The one-sheet bridge to print deck”, and filters “Show Build challenges” / “Show all challenges”. Visible filter text may stay short if the accessible name is explicit.

#### F-1-16 — README opening sentence exceeds 22 words

**Location/quote:** 24 words: “Future Skills Portfolio is a private, printable challenge deck for parents and home-school educators supporting mathematically and computationally curious young people aged 10–16.”

**Concrete fix:** “A private, printable challenge deck for parents and home-school educators supporting curious learners aged 10–16.” (15 words.)

#### F-1-17 — README second sentence exceeds 22 words

**Location/quote:** 27 words: “Instead of predicting careers or asking an AI to score a child, it helps a family collect human-reviewable evidence across building, explaining, critiquing, modelling, debugging, and collaboration.”

**Concrete fix:** “Families collect reviewable work across building, explaining, critiquing, modelling, debugging, and collaboration—without career predictions or AI scoring.” (18 words.)

#### F-1-18 — README visual-notes sentence exceeds 22 words

**Location/quote:** 25 words: “The research brief is represented in the build work order and the complete product-specific visual system, asset prompt, and provenance are in `.factory/design.md`.”

**Concrete fix:** “See `.factory/design.md` for the product’s visual system, asset prompt, and provenance.” (13 counted tokens.)

#### F-1-19 — README license sentence exceeds 22 words

**Location/quote:** 29 words: “Every shareable challenge deck—whether it includes a free sheet or a family-created challenge—carries a CC BY 4.0 reuse license; imports without that explicit license are rejected.”

**Concrete fix:** “All exported challenges use CC BY 4.0. Imports without that license are rejected.” (14 counted tokens total.)

#### F-1-20 — The catalog description required by the copy contract is absent

**Location:** `.factory/brief.json` has no `summary` property.

**Why this fails:** The factory catalog cannot present the required one-line, plain-word product description from the source of truth.

**Concrete fix:** Add a ≤120-character summary starting with a verb, for example: “Build a private portfolio with printable math and computing challenges for ages 10–16.”

## Copy audit

Method: Chromium `innerText` was segmented with `Intl.Segmenter('en', { granularity: 'sentence' })`; word counts include letter/number tokens and hyphenated compounds as one word. UI fragments that are not grammatical sentences are included because the supplied checklist requires headings and control copy to work out of context. Repeated selected-challenge text appears twice because the live DOM includes both screen and print copies. Flags: `C` = unlisted claim under F-1-4; `J` = jargon/marketing/inconsistent term; `H` = unclear heading; `L` = over 22 words. A dash means no copy flag found.

### Landing page sentences and prose fragments

| # | Words | Occurrences | Exact copy | Flags |
| ---: | ---: | ---: | --- | --- |
| 1 | 6 | 1 | AGES 10–16 · OFFLINE BY DEFAULT | C |
| 2 | 15 | 1 | A printable challenge deck for families growing mathematical and computational judgment in an AI-rich world. | C, J |
| 3 | 3 | 1 | No child account. | C |
| 4 | 3 | 1 | No AI scoring. | C |
| 5 | 3 | 1 | No career claims. | C |
| 6 | 7 | 1 | Four modes of evidence, shaped by hand. | C, J |
| 7 | 3 | 1 | THE CHALLENGE SHELF | J |
| 8 | 5 | 1 | Mix modes across six weeks. | C, J |
| 9 | 10 | 1 | Difficulty comes from reasoning and revision, not more screen time. | C |
| 10 | 3 | 1 | Showing 16 challenges | C |
| 11 | 2 | 1 | CHALLENGE SHEET | J |
| 12 | 3 | 1 | Make structure visible | — |
| 13 | 12 | 2 | Build a bridge that spans 24 cm and holds the most coins. | — |
| 14 | 12 | 2 | Before testing, draw or calculate where you expect it to bend first. | — |
| 15 | 6 | 2 | Run three trials, then revise once. | — |
| 16 | 7 | 2 | 1 sheet of A4 or Letter paper | — |
| 17 | 3 | 2 | 30 cm tape | — |
| 18 | 5 | 2 | Coins or equal small weights | — |
| 19 | 2 | 2 | Two books | — |
| 20 | 3 | 2 | Pencil and ruler | — |
| 21 | 5 | 2 | No supports between the books | — |
| 22 | 7 | 2 | The bridge must be lifted off intact | — |
| 23 | 5 | 2 | Record every trial, including failures | — |
| 24 | 5 | 2 | Which prediction matched what happened? | — |
| 25 | 6 | 2 | What did your revision trade away? | — |
| 26 | 7 | 2 | What would you measure with better tools? | — |
| 27 | 5 | 2 | Names an answer or choice. | — |
| 28 | 5 | 2 | Shows some steps or evidence. | J |
| 29 | 6 | 2 | Connects evidence to each important choice. | J |
| 30 | 9 | 2 | Tests the reasoning and names when it may fail. | — |
| 31 | 4 | 2 | Attempts the build task. | — |
| 32 | 6 | 2 | Uses one fitting method with support. | — |
| 33 | 7 | 2 | Chooses and applies a fitting method independently. | — |
| 34 | 9 | 2 | Adapts the method after feedback or a changed condition. | — |
| 35 | 4 | 2 | Accepts the first result. | — |
| 36 | 4 | 2 | Notices an obvious limitation. | — |
| 37 | 8 | 2 | Names a trade-off and makes a justified choice. | — |
| 38 | 6 | 2 | Compares alternatives and identifies missing evidence. | J |
| 39 | 4 | 2 | Describes what was made. | — |
| 40 | 5 | 2 | Names one difficulty or change. | — |
| 41 | 7 | 2 | Explains how a revision improved the work. | — |
| 42 | 9 | 2 | Names a specific next experiment and why it matters. | — |
| 43 | 4 | 1 | PRIVATE ON THIS DEVICE | C |
| 44 | 17 | 1 | Success is concrete: four artifacts in at least three modes, each with an adult’s observable growth note. | C, J |
| 45 | 3 | 1 | 0 / 4 artifacts | C, J |
| 46 | 4 | 1 | 0 / 3 skill modes | C |
| 47 | 2 | 1 | Stored locally. | C |
| 48 | 2 | 1 | No account. | C |
| 49 | 13 | 1 | Complete a challenge, then log what was made and one thing you observed. | J |
| 50 | 5 | 1 | A photo is not required. | C |
| 51 | 3 | 1 | ADAPT THE FORMAT | H |
| 52 | 10 | 1 | Keep the structure: a task, real limits, reflection, and review. | — |
| 53 | 8 | 1 | Your challenge stays local until you export it. | C |
| 54 | 8 | 1 | Export a small JSON file for another family. | C, J |
| 55 | 10 | 1 | Importing adds the challenges to this browser; nothing is uploaded. | C |
| 56 | 8 | 1 | 0 made here · 0 on your print shelf | J |
| 57 | 3 | 1 | OPTIONAL KEEPSAKE DECK | J |
| 58 | 10 | 1 | Unlock eight additional curated challenge sheets for $19 USD, once. | C, J |
| 59 | 12 | 1 | The free eight-card deck, custom challenges, accessibility, and all exports stay free. | C, J |
| 60 | 4 | 1 | Eight additional cross-mode challenges | C, J |
| 61 | 5 | 1 | Lifetime license for this product | C |
| 62 | 8 | 1 | Restore on another device with your license token | C, J |
| 63 | 7 | 1 | Sociobot/Dodo is the merchant of record. | C, J |
| 64 | 4 | 1 | Refunds are handled there. | C |
| 65 | 2 | 2 | Privacy · Terms | — |
| 66 | 4 | 1 | Make evidence, not predictions. | J |
| 67 | 4 | 1 | Original generated hero imagery. | C |
| 68 | 7 | 1 | No tracking, child accounts, or public profiles. | C |
| 69 | 8 | 1 | Future Skills Portfolio · Ages 10–14 · 45 minutes | — |
| 70 | 5 | 1 | Make structure visible · Build + Model | — |
| 71 | 2 | 1 | Next experiment: | — |

The number strip also contains four non-sentence claim fragments not captured as prose elements: “8 free, complete challenges” (4), “6 human skill modes” (4), “1 transparent review rubric” (4), and “0 accounts or uploads” (4). All are `C`; “complete”, “human”, and “transparent” are also `J`.

### README sentences and fragments

| # | Words | Exact copy | Flags |
| ---: | ---: | --- | --- |
| 1 | 3 | Future Skills Portfolio | — |
| 2 | 24 | Future Skills Portfolio is a private, printable challenge deck for parents and home-school educators supporting mathematically and computationally curious young people aged 10–16. | C, J, L |
| 3 | 27 | Instead of predicting careers or asking an AI to score a child, it helps a family collect human-reviewable evidence across building, explaining, critiquing, modelling, debugging, and collaboration. | C, J, L |
| 4 | 5 | Live: https://future-skills-portfolio.sociobot.in | — |
| 5 | 3 | What is included | — |
| 6 | 15 | Eight complete free challenges with material limits, reflection prompts, and a four-level adult/peer rubric | C, J |
| 7 | 13 | Local-only artifact records and a six-week “four artifacts across three modes” progress view | C, J |
| 8 | 6 | Print-ready individual sheets and family-selected decks | C, J |
| 9 | 9 | A local challenge maker plus JSON deck import/export | C, J |
| 10 | 8 | Offline shell caching after the first production visit | C, J |
| 11 | 17 | An optional $19 one-time Keepsake Deck with eight more curated challenges, unlocked through the Sociobot billing API | C, J |
| 12 | 13 | The app requests no child account, profile, photo, analytics identifier, or cloud sync. | C, J |
| 13 | 9 | Browser storage holds the portfolio and optional license token. | C, J |
| 14 | 6 | See /privacy for the plain-language policy. | C |
| 15 | 2 | Run locally | — |
| 16 | 6 | Requires Node.js 20 or later. | C |
| 17 | 5 | Vite prints the local URL. | C, J |
| 18 | 17 | The app is a vanilla TypeScript static site with no runtime framework and no third-party runtime CDN. | C, J |
| 19 | 3 | Test and build | — |
| 20 | 9 | The exact production build command is npm run build. | C |
| 21 | 11 | Output lands in dist/, with dist/index.html at its root. | C, J |
| 22 | 20 | Azure Static Web Apps routing and security headers live in public/staticwebapp.config.json and are copied into the build. | C, J |
| 23 | 20 | License verification uses https://api.sociobot.in/api/v1/products/future-skills-portfolio/verify; checkout uses the matching hosted Sociobot product URL. | C, J |
| 24 | 11 | No payment provider is embedded and no product ID is hardcoded. | C, J |
| 25 | 4 | Product and visual notes | — |
| 26 | 25 | The research brief is represented in the build work order and the complete product-specific visual system, asset prompt, and provenance are in .factory/design.md. | C, J, L |
| 27 | 15 | Generated source artwork is kept in assets/src/; optimized WebP files ship from public/assets/. | C, J |
| 28 | 1 | License | — |
| 29 | 12 | Application code and included first-party materials are provided under the MIT License. | C, J |
| 30 | 29 | Every shareable challenge deck—whether it includes a free sheet or a family-created challenge—carries a CC BY 4.0 reuse license; imports without that explicit license are rejected. | C, J, L |

No sentence on the live landing page exceeds 22 words. README items 2, 3, 26, and 30 are the four hard-cap failures and have separate findings/rewrite proposals above. No banned plain-words term was found verbatim; the `J` flags identify domain jargon, promotional adjectives, or inconsistent product nouns.

### Heading and action audit

All 48 rendered heading/card labels and all 47 distinct link/button labels were checked. `H` points to F-1-8 or F-1-14; `A` points to F-1-10 or F-1-15; `J` points to F-1-12 or F-1-13.

| # | Words | Heading or card label | Flags |
| ---: | ---: | --- | --- |
| 1 | 4 | Make evidence. Not predictions. | H, J |
| 2 | 6 | Choose the next piece of evidence | J |
| 3 | 3 | Make structure visible | — |
| 4 | 3 | The one-sheet bridge | — |
| 5 | 5 | Turn examples into a rule | — |
| 6 | 4 | Explain a black box | — |
| 7 | 5 | Find ambiguity by running it | — |
| 8 | 4 | Debug a human algorithm | — |
| 9 | 3 | Make values computable | — |
| 10 | 4 | Design a fair score | — |
| 11 | 4 | Separate evidence from polish | J |
| 12 | 4 | Audit a confident claim | — |
| 13 | 6 | Design rules another person can run | — |
| 14 | 4 | Invent a tiny language | — |
| 15 | 5 | Bound what you cannot count | — |
| 16 | 4 | Estimate the impossible room | — |
| 17 | 4 | Coordinate with limited information | — |
| 18 | 3 | The two-person protocol | J |
| 19 | 6 | Find a signal without hiding variation | — |
| 20 | 4 | Tame a noisy sensor | — |
| 21 | 6 | Adapt a design without starting over | — |
| 22 | 4 | Survive a rule change | — |
| 23 | 5 | See how framing changes meaning | — |
| 24 | 5 | Tell two true data stories | — |
| 25 | 5 | Expose how examples shape rules | — |
| 26 | 4 | Teach a paper machine | — |
| 27 | 6 | Keep meaning while shrinking a message | — |
| 28 | 4 | Compress a treasure map | — |
| 29 | 5 | Infer behavior from careful tests | — |
| 30 | 4 | Reverse-engineer the odd calculator | — |
| 31 | 6 | Make trade-offs visible to a team | — |
| 32 | 4 | Negotiate a tiny budget | — |
| 33 | 5 | Attach uncertainty to a prediction | — |
| 34 | 4 | Forecast with honest confidence | — |
| 35 | 2 | THE CHALLENGE | — |
| 36 | 1 | MATERIALS | — |
| 37 | 2 | USEFUL LIMITS | — |
| 38 | 3 | PAUSE AND REFLECT | — |
| 39 | 4 | A six-week evidence shelf | J |
| 40 | 4 | Your shelf is ready | H, J |
| 41 | 6 | Shape a challenge of your own | — |
| 42 | 6 | Pass a deck hand to hand | H, J |
| 43 | 5 | More prompts. Same quiet format. | H, J |
| 44 | 2 | The challenge | — |
| 45 | 1 | Materials | — |
| 46 | 2 | Useful limits | — |
| 47 | 3 | Pause and reflect | — |
| 48 | 1 | Observation | — |

| # | Words | Link or button label | Flags |
| ---: | ---: | --- | --- |
| 1 | 4 | Skip to main content | — |
| 2 | 3 | FUTURE SKILLS PORTFOLIO | — |
| 3 | 2 | Challenge shelf | J |
| 4 | 1 | Portfolio | — |
| 5 | 3 | Make a challenge | — |
| 6 | 2 | Keepsake deck | J |
| 7 | 3 | Choose a challenge | — |
| 8 | 3 | Print my shelf | A, J |
| 9 | 1 | All | A |
| 10 | 1 | Build | A |
| 11 | 1 | Explain | A |
| 12 | 1 | Critique | A |
| 13 | 1 | Model | A |
| 14 | 1 | Debug | A |
| 15 | 1 | Collaborate | A |
| 16 | 2 | 10–12 | A |
| 17 | 2 | 13–16 | A |
| 18 | 15 | NO. 01 Make structure visible The one-sheet bridge Ages 10–14 · 45 min Build Model | A |
| 19 | 1 | + Shelf | A, J |
| 20 | 18 | NO. 02 Turn examples into a rule Explain a black box Ages 10–16 · 30 min Explain Model | A |
| 21 | 18 | NO. 03 Find ambiguity by running it Debug a human algorithm Ages 10–13 · 35 min Debug Collaborate | A |
| 22 | 16 | NO. 04 Make values computable Design a fair score Ages 12–16 · 60 min Model Critique | A |
| 23 | 17 | NO. 05 Separate evidence from polish Audit a confident claim Ages 12–16 · 40 min Critique Explain | A, J |
| 24 | 20 | NO. 06 Design rules another person can run Invent a tiny language Ages 13–16 · 75 min Build Explain Debug | A |
| 25 | 18 | NO. 07 Bound what you cannot count Estimate the impossible room Ages 10–15 · 35 min Model Explain | A |
| 26 | 16 | NO. 08 Coordinate with limited information The two-person protocol Ages 11–16 · 45 min Collaborate Debug | A, J |
| 27 | 20 | KEEPSAKE ◇ LOCKED Find a signal without hiding variation Tame a noisy sensor Ages 13–16 · 70 min Model Critique Build | A, J |
| 28 | 19 | KEEPSAKE ◇ LOCKED Adapt a design without starting over Survive a rule change Ages 10–15 · 55 min Build Debug | A, J |
| 29 | 19 | KEEPSAKE ◇ LOCKED See how framing changes meaning Tell two true data stories Ages 12–16 · 60 min Critique Explain | A, J |
| 30 | 18 | KEEPSAKE ◇ LOCKED Expose how examples shape rules Teach a paper machine Ages 11–15 · 50 min Model Collaborate | A, J |
| 31 | 19 | KEEPSAKE ◇ LOCKED Keep meaning while shrinking a message Compress a treasure map Ages 10–14 · 50 min Explain Build | A, J |
| 32 | 18 | KEEPSAKE ◇ LOCKED Infer behavior from careful tests Reverse-engineer the odd calculator Ages 11–16 · 45 min Debug Model | A, J |
| 33 | 19 | KEEPSAKE ◇ LOCKED Make trade-offs visible to a team Negotiate a tiny budget Ages 12–16 · 60 min Collaborate Critique | A, J |
| 34 | 18 | KEEPSAKE ◇ LOCKED Attach uncertainty to a prediction Forecast with honest confidence Ages 13–16 · 55 min Model Critique | A, J |
| 35 | 3 | Log an artifact | J |
| 36 | 4 | Add to print shelf | J |
| 37 | 3 | Print this sheet | J |
| 38 | 3 | Export portfolio JSON | J |
| 39 | 4 | CC BY 4.0 | J |
| 40 | 4 | Add to my shelf | J |
| 41 | 3 | Export my shelf | J |
| 42 | 3 | Import a deck | J |
| 43 | 4 | Buy the Keepsake Deck | J |
| 44 | 5 | Have a license? Restore it | J |
| 45 | 3 | Verify and unlock | J |
| 46 | 1 | Privacy | — |
| 47 | 1 | Terms | — |

No heading or control exceeds 22 words. The card-selection pattern, terse filters, `+ Shelf`, and empty-shelf print action still fail the result-naming rule for the reasons given in F-1-10 and F-1-15.

## Demo, privacy, offline, and claims evidence

| Check | Result | Evidence |
| --- | --- | --- |
| One-click sample action | FAIL | No matching action on the first screen. |
| Realistic populated state after entry | FAIL | `/demo` had 0 artifacts and ordinary built-in data only. |
| Demo banner / Reset / Start for real | FAIL | All absent. |
| Separate storage namespace | FAIL | `/demo` read and overwrote `future-skills-portfolio:v1`; no `demo:` key. |
| Free-use network privacy | PASS for observed flow | Fresh load and representative local operations requested only the live origin. |
| Offline after a warm visit | PASS | Service worker controlled the page; forced-offline reload showed the h1 and “You’re offline. The deck and local portfolio still work.” |
| Claims manifest | FAIL | `.factory/claims.json` absent. |
| Listed claim commands | NONE TO RUN | There are zero entries, which does not validate any public claim. |
| Claim-tagged tests | FAIL | Repository search found zero `@claim:` tags. |

The offline and privacy observations are evidence that suitable tests can pass; they do not cure F-1-4 because the copy-to-test inventory is missing.

## Site structure, accessibility, and link crawl

| Check | Result |
| --- | --- |
| `lang`, one h1, `main`, image alt, named buttons, console | PASS on fresh live desktop and 390 px; `verify-url.sh` reported 0 errors. |
| Axe | PASS; Playwright axe returned zero violations on fresh live 390 px. |
| Mobile width and 200% text | PASS; 390/390 px document width at normal and 200% text. |
| Reduced motion | PASS in existing clean-clone suite/source policy. |
| `<title>` pattern per route | FAIL; one slogan title is reused everywhere. |
| Description per route | FAIL; one home description is reused. |
| Canonical / OG / Twitter / 1200×630 image / apple icon | FAIL; absent. SVG favicon is present. |
| Designed 404 | FAIL/BLOCKING; unknown path renders home with 200. |
| Deep-link visual target | PASS for `#deck`, `#portfolio`, `#make`, `#keepsake`. |
| Route-change focus/announcement | FAIL; focus remains `BODY`. |
| Header/footer consistency | PASS for presence and legal links; footer attribution/build id missing. |
| Internal links | PASS for `/`, `/privacy`, `/terms`, and in-page destinations. |
| External CC BY link | PASS, HTTP 200. |
| Checkout link | FAIL/BLOCKING, HTTP 404. |
| Visual identity | PASS; the glacial ceramic still life, mineral palette, typography, stamped labels, and ruled workbench surfaces are recognizably product-specific rather than a generic gradient/card SaaS template. |

## Earlier-report audit

There were no earlier `.factory/review-*.md` or `.factory/polish-*.md` files. Every defect in the three verification reports and the current handoff was checked again live and in source.

| Earlier finding | Live confirmation | Source confirmation | Status |
| --- | --- | --- | --- |
| Verification 1: CSP blocked progress styles | No console errors; both progress elements have no inline style and value 0. | Semantic `<progress>` elements remain. | Fixed. |
| Verification 1: hashed assets lacked immutable cache | JS/CSS return `public, max-age=31536000, immutable`; HTML and SW revalidate. | Static Web Apps route headers remain. | Fixed. |
| Verification 1: success toasts disappeared | Custom challenge showed “Your challenge was added to the shelf.” | `persist()` queues toast after render. | Fixed. |
| Verification 2: blocked artifact writes claimed success | Live forced failure retained in-memory work and said “Your browser blocked local storage. Export your work before leaving.” | `saveState()` result is checked by `persist()`. | Fixed. |
| Verification 2: unlicensed imports accepted | Live import rejected with the exact CC BY error and added no challenge. | `parseDeck()` requires `CC BY 4.0`. | Fixed. |
| Verification 2: 200% text overflow | Live 390 px document remained 390 px wide. | Responsive overflow rules and regression test remain. | Fixed. |
| Verification 2: corrupt state blanked app | Live malformed member produced one h1 and no page error. | `loadState()` validates/filter members. | Fixed. |
| Verification 2: nested complementary landmark | Live axe returned zero violations. | Share panel is a `div`, not a nested `aside`. | Fixed. |
| Verification 3: no valid purchase was tested | Checkout target was checked in this round and returns 404. | Anchor still uses that endpoint. | Reopened as F-1-2. |

## Clean-clone gates

A separate clone at `/tmp/tmp.gO7iAD3eTz`, commit `83454db2e894b42155b5df449eeec3557fab9089`, was clean before dependency installation.

| Command/check | Result |
| --- | --- |
| `npm ci` | PASS; 61 packages, 0 vulnerabilities. |
| `npm test` | PASS; 15 Vitest assertions and 18 Playwright tests. |
| `npm run build` | PASS; `dist/` produced. |
| Initial JS | PASS; 46.02 kB raw / 16.18 kB gzip. |
| Initial CSS | PASS; 21.49 kB raw / 5.68 kB gzip. |

These generic gates do not include a demo or claims contract and do not exercise the live checkout link or 404 behavior.

## What would make this perfect

Resolve every finding, then rerun this review from a fresh browser and clean clone. The decisive end state is: a first-screen sample action opens a populated, resettable, visibly isolated demo; every retained promise maps to one passing claim-tagged test; checkout reaches hosted Sociobot checkout; unknown routes show a designed 404; route metadata and focus are correct; the required page skeleton/footer is complete; and the copy has one vocabulary, no overlong README sentences, no abstract heading, no conflicting counts, and no action whose result differs from its label. `PASS` requires zero remaining findings and zero untested claims.
