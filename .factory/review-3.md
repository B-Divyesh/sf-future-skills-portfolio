# Adversarial first-read review 3 — Future Skills Portfolio

**Verdict: FAIL**

**Work order:** `future-skills-portfolio-review-3`  
**Reviewed commit:** `3db1395ee65db694a58987a6957026044ed05d29`  
**Live URL:** <https://future-skills-portfolio.sociobot.in/>  
**Reviewed:** 2026-08-28 UTC

The core product, demo, storage isolation, routes, and all 14 listed claim commands work. Acceptance still fails because mobile link targets are undersized, the first-screen facts omit offline use, some visible controls do not name their result, one README claim is not fully asserted, and portfolio exports cannot be restored.

## 30-second cold read

Fresh Chromium contexts were opened at 390×844 and 1440×900. Storage was empty and nothing was scrolled.

| Question | Answer in my own words | Exact first-screen evidence | Result |
| --- | --- | --- | --- |
| What does this do? | It gives families printable math and computing challenges and saves a portfolio of completed work. | “Build a portfolio of math and computing work” and “Printable challenges · ages 10–16” | Clear |
| For whom? | Families guiding learners aged 10–16. | “For families guiding ages 10–16 through printable challenges, reflection, and human review.” | Clear |
| What should I click first? | Open the sample portfolio. | “Try it with sample data” and “Opens four completed work records.” | Clear |

The cold-read requirement passes at both widths. The mobile first screen also showed all three facts and the beginning of the product artwork without horizontal overflow.

## Findings

### Major

#### F-3-1 — Several mobile links have hit areas below 44×44 px

**Location / exact text:** At 390 px, live bounding boxes measured “Open all four records” at 113×17 px, “Read the privacy policy” at 165×25 px, “← Back to the portfolio” at 176×25 px, footer “Privacy” at 41×14 px, footer “Terms” at 34×14 px, and policy email links at about 145×17 px. The header “Demo” link is 38×44 px. “CC BY 4.0 (opens Creative Commons)” is 290×38 px.

**Why this fails:** The attached accessibility and site-structure contracts require 44 px touch targets. These links are easy to miss on a phone. The 36 px deck-pin boxes are excluded because their `::after { inset: -4px; }` hit area reaches 44 px.

**Concrete fix:** Render the affected links as `inline-flex` controls with `min-block-size: 44px` and enough inline padding, or provide an equivalent non-overlapping 44×44 hit area. Add a 390 px test for every visible link and button on home, demo, privacy, and terms.

#### F-3-2 — The checkout claim test does not prove the stated reason

**Location / exact quote:** README: “New Keepsake Deck purchases are not offered because the hosted checkout is unavailable.” `.factory/claims.json` lists `checkout-disabled`, but its test only confirms that no purchase link, price, or buy action is rendered.

**Why this fails:** The test would still pass if hosted checkout became available, leaving the causal README statement stale. Manual review confirmed the old endpoint currently returns HTTP 404, but the named regression test does not assert that condition.

**Concrete fix:** Prefer the stable sentence “Purchases are not offered in this release.” Then narrow the claim to the rendered behavior already tested. If the causal wording remains, add an availability assertion to `@claim:checkout-disabled`.

### Minor

#### F-3-3 — The mandatory first-screen fact set omits offline use

**Location / exact quote:** “8 challenges are free.”, “Work stays in this browser.”, and “Print or export when ready.”

**Why this fails:** The attached plain-words contract requires privacy, offline, and price facts on the first screen. Price/free and privacy are present; offline use is not.

**Concrete fix:** Replace “Print or export when ready.” with “Works offline after one visit.” The existing `@claim:offline-reload` test proves this wording.

#### F-3-4 — Visible deck-toggle labels do not name the result

**Location / exact quote:** Eight card buttons display “+ Deck”; selected demo cards display “✓ In deck”. Their accessible names correctly say “Add [title] to print deck” or “Remove [title] from print deck”.

**Why this fails:** A sighted first-time visitor sees a noun/state, not the result-naming verb required by the plain-words contract. “✓ In deck” is especially ambiguous because activating it removes the challenge.

**Concrete fix:** Use visible labels “Add to print deck” and “Remove from print deck”. Keep the challenge-specific accessible names.

#### F-3-5 — The README introduces an unexplained, unavailable “Keepsake Deck” term

**Location / exact quote:** “New Keepsake Deck purchases are not offered because the hosted checkout is unavailable.” The landing page and terminology table otherwise use “challenge deck” and “print deck”.

**Why this fails:** A reader must infer whether a Keepsake Deck is a third kind of deck, although it cannot be bought or inspected.

**Concrete fix:** Remove the obsolete product name. “Purchases are not offered in this release.” is shorter and consistent.

#### F-3-6 — Portfolio JSON can be exported but not restored

**Location / exact quote:** The portfolio action says “Export portfolio JSON”. The only import action is “Import a challenge deck”.

**Why this matters:** This local-only portfolio can be lost with browser storage. A person exporting structured portfolio data will reasonably expect to restore it on another browser or after clearing storage.

**Concrete fix:** Add “Import portfolio JSON” with preview, format/version validation, duplicate handling, and an explicit replace-or-merge choice. Keep it local, isolate it in demo mode, and add a round-trip claim test.

## Copy audit

The production landing copy was extracted again with `Intl.Segmenter`. It exactly matches [`.factory/copy-audit.md`](copy-audit.md), except that the stored audit names the local preview URL. Every row is at most 22 words and contains no banned term. F-3-4 is the remaining visible-button flag; F-3-5 is the remaining README terminology flag. Headings make sense out of context, and challenge/deck/work record/portfolio/skill mode vocabulary is otherwise consistent.

### Landing page sentences and fragments

| # | Words | Exact copy | Flag |
| ---: | ---: | --- | --- |
| 1 | 5 | PRINTABLE CHALLENGES · AGES 10–16 | — |
| 2 | 8 | Build a portfolio of math and computing work | — |
| 3 | 13 | For families guiding ages 10–16 through printable challenges, reflection, and human review. | — |
| 4 | 5 | Try it with sample data | — |
| 5 | 5 | Opens four completed work records. | — |
| 6 | 3 | Browse free challenges | — |
| 7 | 3 | Print selected challenge | — |
| 8 | 4 | 8 challenges are free. | — |
| 9 | 5 | Work stays in this browser. | — |
| 10 | 5 | Print or export when ready. | F-3-3 |
| 11 | 7 | Four ceramic forms represent four example skills. | — |
| 12 | 1 | 8 | — |
| 13 | 2 | FREE CHALLENGES | — |
| 14 | 1 | 6 | — |
| 15 | 2 | SKILL MODES | — |
| 16 | 1 | 1 | — |
| 17 | 4 | ADULT OR PEER RUBRIC | — |
| 18 | 1 | 0 | — |
| 19 | 2 | REQUIRED ACCOUNTS | — |
| 20 | 3 | HOW IT WORKS | — |
| 21 | 7 | Complete a challenge and review the work | — |
| 22 | 8 | Use the same short cycle for each activity. | — |
| 23 | 1 | 01 | — |
| 24 | 3 | Choose a challenge | — |
| 25 | 7 | Pick an age range and skill mode. | — |
| 26 | 1 | 02 | — |
| 27 | 3 | Make and review | — |
| 28 | 10 | Keep the work, then use the adult or peer rubric. | — |
| 29 | 1 | 03 | — |
| 30 | 4 | Save a work record | — |
| 31 | 9 | Record the evidence, one observation, and a next step. | — |
| 32 | 2 | CHALLENGE DECK | — |
| 33 | 4 | Choose a printable challenge | — |
| 34 | 7 | Choose a skill mode or age range. | — |
| 35 | 8 | Each challenge includes materials, limits, reflection, and review. | — |
| 36 | 2 | SKILL MODE | — |
| 37 | 1 | All | — |
| 38 | 1 | Build | — |
| 39 | 1 | Explain | — |
| 40 | 1 | Critique | — |
| 41 | 1 | Model | — |
| 42 | 1 | Debug | — |
| 43 | 1 | Collaborate | — |
| 44 | 1 | AGE | — |
| 45 | 1 | All | — |
| 46 | 2 | 10–12 | — |
| 47 | 2 | 13–16 | — |
| 48 | 3 | Showing 8 challenges | — |
| 49 | 1 | NO. | — |
| 50 | 1 | 01 | — |
| 51 | 3 | Make structure visible | — |
| 52 | 3 | The one-sheet bridge | — |
| 53 | 5 | Ages 10–14 · 45 min | — |
| 54 | 1 | Build | — |
| 55 | 1 | Model | — |
| 56 | 1 | + Deck | F-3-4 |
| 57 | 1 | NO. | — |
| 58 | 1 | 02 | — |
| 59 | 5 | Turn examples into a rule | — |
| 60 | 4 | Explain a black box | — |
| 61 | 5 | Ages 10–16 · 30 min | — |
| 62 | 1 | Explain | — |
| 63 | 1 | Model | — |
| 64 | 1 | + Deck | F-3-4 |
| 65 | 1 | NO. | — |
| 66 | 1 | 03 | — |
| 67 | 5 | Find ambiguity by running it | — |
| 68 | 4 | Debug a human algorithm | — |
| 69 | 5 | Ages 10–13 · 35 min | — |
| 70 | 1 | Debug | — |
| 71 | 1 | Collaborate | — |
| 72 | 1 | + Deck | F-3-4 |
| 73 | 1 | NO. | — |
| 74 | 1 | 04 | — |
| 75 | 3 | Make values computable | — |
| 76 | 4 | Design a fair score | — |
| 77 | 5 | Ages 12–16 · 60 min | — |
| 78 | 1 | Model | — |
| 79 | 1 | Critique | — |
| 80 | 1 | + Deck | F-3-4 |
| 81 | 1 | NO. | — |
| 82 | 1 | 05 | — |
| 83 | 4 | Separate evidence from polish | — |
| 84 | 4 | Audit a confident claim | — |
| 85 | 5 | Ages 12–16 · 40 min | — |
| 86 | 1 | Critique | — |
| 87 | 1 | Explain | — |
| 88 | 1 | + Deck | F-3-4 |
| 89 | 1 | NO. | — |
| 90 | 1 | 06 | — |
| 91 | 6 | Design rules another person can run | — |
| 92 | 4 | Invent a tiny language | — |
| 93 | 5 | Ages 13–16 · 75 min | — |
| 94 | 1 | Build | — |
| 95 | 1 | Explain | — |
| 96 | 1 | Debug | — |
| 97 | 1 | + Deck | F-3-4 |
| 98 | 1 | NO. | — |
| 99 | 1 | 07 | — |
| 100 | 5 | Bound what you cannot count | — |
| 101 | 4 | Estimate the impossible room | — |
| 102 | 5 | Ages 10–15 · 35 min | — |
| 103 | 1 | Model | — |
| 104 | 1 | Explain | — |
| 105 | 1 | + Deck | F-3-4 |
| 106 | 1 | NO. | — |
| 107 | 1 | 08 | — |
| 108 | 4 | Coordinate with limited information | — |
| 109 | 3 | The two-person protocol | — |
| 110 | 5 | Ages 11–16 · 45 min | — |
| 111 | 1 | Collaborate | — |
| 112 | 1 | Debug | — |
| 113 | 1 | + Deck | F-3-4 |
| 114 | 1 | CHALLENGE | — |
| 115 | 3 | The one-sheet bridge | — |
| 116 | 3 | Make structure visible | — |
| 117 | 1 | 45 | — |
| 118 | 1 | MIN | — |
| 119 | 1 | Build | — |
| 120 | 1 | Model | — |
| 121 | 2 | THE CHALLENGE | — |
| 122 | 12 | Build a bridge that spans 24 cm and holds the most coins. | — |
| 123 | 12 | Before testing, draw or calculate where you expect it to bend first. | — |
| 124 | 6 | Run three trials, then revise once. | — |
| 125 | 1 | MATERIALS | — |
| 126 | 7 | 1 sheet of A4 or Letter paper | — |
| 127 | 3 | 30 cm tape | — |
| 128 | 5 | Coins or equal small weights | — |
| 129 | 2 | Two books | — |
| 130 | 3 | Pencil and ruler | — |
| 131 | 2 | USEFUL LIMITS | — |
| 132 | 5 | No supports between the books | — |
| 133 | 7 | The bridge must be lifted off intact | — |
| 134 | 5 | Record every trial, including failures | — |
| 135 | 3 | PAUSE AND REFLECT | — |
| 136 | 5 | Which prediction matched what happened? | — |
| 137 | 6 | What did your revision trade away? | — |
| 138 | 7 | What would you measure with better tools? | — |
| 139 | 5 | ADULT OR PEER REVIEW RUBRIC | — |
| 140 | 10 | LOOK FOR 1 · EMERGING 2 · GROWING 3 · STRONG 4 · TRANSFERABLE | — |
| 141 | 7 | Reasoning trail Names an answer or choice. | — |
| 142 | 5 | Shows some steps or evidence. | — |
| 143 | 6 | Connects evidence to each important choice. | — |
| 144 | 9 | Tests the reasoning and names when it may fail. | — |
| 145 | 6 | Build craft Attempts the build task. | — |
| 146 | 6 | Uses one fitting method with support. | — |
| 147 | 7 | Chooses and applies a fitting method independently. | — |
| 148 | 9 | Adapts the method after feedback or a changed condition. | — |
| 149 | 5 | Judgment Accepts the first result. | — |
| 150 | 4 | Notices an obvious limitation. | — |
| 151 | 8 | Names a trade-off and makes a justified choice. | — |
| 152 | 6 | Compares alternatives and identifies missing evidence. | — |
| 153 | 5 | Reflection Describes what was made. | — |
| 154 | 5 | Names one difficulty or change. | — |
| 155 | 7 | Explains how a revision improved the work. | — |
| 156 | 9 | Names a specific next experiment and why it matters. | — |
| 157 | 4 | Save a work record | — |
| 158 | 4 | Add to print deck | — |
| 159 | 3 | Print this challenge | — |
| 160 | 3 | PRIVATE BY DESIGN | — |
| 161 | 5 | Your family controls the work | — |
| 162 | 10 | Portfolio notes stay in this browser unless you export them. | — |
| 163 | 7 | Free and demo use needs no account. | — |
| 164 | 10 | Free and demo use sends no data to another site. | — |
| 165 | 4 | Read the privacy policy | — |
| 166 | 4 | PORTFOLIO IN THIS BROWSER | — |
| 167 | 6 | Track completed work in a portfolio | — |
| 168 | 8 | Save a short record after each completed challenge. | — |
| 169 | 4 | 0 / 4 work records | — |
| 170 | 4 | 0 / 3 skill modes | — |
| 171 | 4 | ⌂ Stored in this browser | — |
| 172 | 4 | No work records yet | — |
| 173 | 10 | Complete a challenge, then record what was made and observed. | — |
| 174 | 3 | Choose a challenge | — |
| 175 | 3 | Export portfolio JSON | — |
| 176 | 3 | MAKE YOUR OWN | — |
| 177 | 6 | Make a challenge for your family | — |
| 178 | 10 | Add a task, limits, reflection prompts, and one review rubric. | — |
| 179 | 2 | Challenge title | — |
| 180 | 3 | Primary skill mode | — |
| 181 | 1 | Build | — |
| 182 | 1 | Explain | — |
| 183 | 1 | Critique | — |
| 184 | 1 | Model | — |
| 185 | 1 | Debug | — |
| 186 | 1 | Collaborate | — |
| 187 | 2 | Age range | — |
| 188 | 2 | 10–12 | — |
| 189 | 2 | 13–16 | — |
| 190 | 2 | 10–16 | — |
| 191 | 1 | Minutes | — |
| 192 | 5 | Build, explain, or critique task | — |
| 193 | 9 | Name what to make and what evidence to keep. | — |
| 194 | 5 | Material limits (one per line) | — |
| 195 | 5 | Reflection prompts (one per line) | — |
| 196 | 16 | I made this challenge or can share it under CC BY 4.0 (opens Creative Commons). | — |
| 197 | 4 | Add to print deck | — |
| 198 | 0 | ↗ | — |
| 199 | 6 | Export or import a challenge deck | — |
| 200 | 7 | Share a JSON file with another family. | — |
| 201 | 7 | An import changes only this browser workspace. | — |
| 202 | 6 | Export print deckImport a challenge deck | — |
| 203 | 8 | 0 made here · 0 in your print deck | — |

### README sentences and fragments

Word counting uses Unicode letter/number tokens. Headings, commands, and links are included because the audit covers all reader-facing README text.

| # | Words | Exact copy | Flag |
| ---: | ---: | --- | --- |
| 1 | 3 | Future Skills Portfolio | — |
| 2 | 13 | A private, printable challenge deck for families supporting curious learners aged 10–16. | — |
| 3 | 11 | Families save short records after completing challenges across six skill modes. | — |
| 4 | 5 | Live: https://future-skills-portfolio.sociobot.in | — |
| 5 | 8 | Sample demo: https://future-skills-portfolio.sociobot.in/?demo=1 | — |
| 6 | 3 | What is included | — |
| 7 | 12 | Eight free challenges with materials, limits, reflection prompts, and a four-row rubric | — |
| 8 | 11 | Local work records with evidence, an observation, and a next step | — |
| 9 | 6 | Print-ready individual challenges and family-selected decks | — |
| 10 | 9 | Local challenge creation plus JSON deck import and export | — |
| 11 | 9 | Offline demo and real workspace use after one visit | — |
| 12 | 12 | A separate sample workspace that never reads or changes the real portfolio | — |
| 13 | 14 | Free and demo use needs no account and sends no data to another site. | — |
| 14 | 5 | Browser storage holds portfolio data. | — |
| 15 | 4 | See the privacy policy. | — |
| 16 | 13 | New Keepsake Deck purchases are not offered because the hosted checkout is unavailable. | F-3-2, F-3-5 |
| 17 | 2 | Run locally | — |
| 18 | 6 | Use Node.js 20 or later. | — |
| 19 | 2 | npm ci | — |
| 20 | 3 | npm run dev | — |
| 21 | 5 | Vite prints the local URL. | — |
| 22 | 9 | The product uses vanilla TypeScript and local runtime assets. | — |
| 23 | 3 | Test and build | — |
| 24 | 2 | npm test | — |
| 25 | 3 | npm run build | — |
| 26 | 3 | npm run preview | — |
| 27 | 12 | Run one public claim with npm run test:claims -- --grep @claim:id. | — |
| 28 | 8 | Every command is listed in .factory/claims.json. | — |
| 29 | 6 | The production build is in dist/. | — |
| 30 | 11 | Azure Static Web Apps configuration is in public/staticwebapp.config.json. | — |
| 31 | 4 | Product and visual notes | — |
| 32 | 12 | See .factory/design.md for the visual system, asset prompts, and provenance. | — |
| 33 | 1 | License | — |
| 34 | 9 | Application code and included materials use the MIT License. | — |
| 35 | 7 | Exported challenges use CC BY 4.0. | — |
| 36 | 6 | Imports without that license are rejected. | — |

No README sentence exceeds 22 words and no banned marketing adjective appears.

## Demo and sandbox verification

- One click from the cold landing opens `/?demo=1`.
- At 390×844, the first demo screen shows “4 / 4” work records, six skill modes, and two named records with observations and next steps.
- The banner says “Demo — sample data, nothing is saved” and supplies “Reset demo” and “Start for real”.
- A sentinel under `future-skills-portfolio:v1` stayed byte-for-byte unchanged through entry, a print-deck mutation, Reset, and exit.
- Demo writes used only `demo:future-skills-portfolio:v1`. Reset restored the original sample bytes and “Print deck (4)”. Exit removed the demo key.
- A complete demo flow emitted only same-origin requests. After one visit, demo and real workspace both reloaded and remained usable offline.

The demo passes. No blocking demo or sandbox finding remains.

## Claims verification

The repository was cloned at the reviewed commit into `/tmp/fsp-review3-xKoZFk`. `npm ci` and `npm run build` passed there. Each manifest command ran separately; every claim id has exactly one `@claim:<id>` occurrence.

| Claim id | Result |
| --- | --- |
| `demo-isolation` | PASS |
| `offline-reload` | PASS |
| `private-free-use` | PASS |
| `checkout-disabled` | PASS, with incomplete causal assertion in F-3-2 |
| `included-deck` | PASS |
| `challenge-filters` | PASS |
| `work-records` | PASS |
| `print-results` | PASS |
| `portfolio-export` | PASS |
| `deck-export` | PASS |
| `licensed-import` | PASS |
| `routing-metadata` | PASS |
| `local-authoring` | PASS |
| `static-build` | PASS |

The complete clean-clone suite also passed: 16 Vitest assertions and 54 Playwright checks. The production build emitted 50,889 B JavaScript and 26,660 B CSS raw. Live HTML, JavaScript, and CSS SHA-256 hashes match the clean build exactly.

## Earlier-finding audit

Every earlier review, polish report, verification report, and handoff was read. Each earlier finding was checked on live and in source.

| Earlier id | Current verification | Status |
| --- | --- | --- |
| F-1-1 | One-click demo, banner, sample, separate key, reset, exit, and real-key sentinel work. | Fixed |
| F-1-2 | No paid link, price, or purchase action is rendered; old checkout returns 404. | Fixed |
| F-1-3 | Unknown route returns HTTP 404 with the designed not-found page. | Fixed |
| F-1-4 | Fourteen claims and unique tagged tests exist; all commands pass. F-3-2 is narrower test quality. | Fixed |
| F-1-5 | Routes have distinct titles, descriptions, canonicals, OG/Twitter metadata, icons, and social art. | Fixed |
| F-1-6 | Click, back, forward, deep link, focus movement, and route announcement work. | Fixed |
| F-1-7 | Required order, header/footer, legal links, owner, and build id are present. | Fixed |
| F-1-8 | H1 is “Build a portfolio of math and computing work”. | Fixed |
| F-1-9 | Four pictured examples and six product skill modes are distinguished. | Fixed |
| F-1-10 | Empty state prints one selected challenge; demo prints four sheets. | Fixed |
| F-1-11 | Free and browser-local facts are present; F-3-3 is the newly checked offline omission. | Fixed |
| F-1-12 | Challenge, deck, work record, portfolio, and skill mode are consistent. | Fixed |
| F-1-13 | No banned word or sentence over 22 words remains. | Fixed |
| F-1-14 | Current heading outline is ordered and headings stand alone. | Fixed |
| F-1-15 | Cards, filters, and toggles have correct accessible action names. F-3-4 concerns visible wording. | Fixed |
| F-1-16 | README opening is 13 words. | Fixed |
| F-1-17 | README second sentence is 11 words. | Fixed |
| F-1-18 | README design pointer is 12 words. | Fixed |
| F-1-19 | Short license statements and tested imports/exports preserve licensing. | Fixed |
| F-1-20 | Brief and catalog contain the verb-first 86-character summary. | Fixed |
| F-2-1 | Demo first viewport contains progress and two realistic named records. | Fixed |
| F-2-2 / F-1-4 reopened | Six-week and broad AI/profile wording is gone; strengthened tests pass. | Fixed |
| F-2-3 | User-facing copy consistently says “work record”, not “artifact”. | Fixed |
| F-2-4 | External link names Creative Commons and returns 200. | Fixed |

Earlier verification defects also remain repaired: storage-denial feedback, license enforcement, corrupt-state recovery, 200% reflow, strict CSP, immutable asset caching, and persistent success feedback are covered by passing checks.

## Structure, accessibility, links, and identity

- `/`, `/demo`, `/privacy`, and `/terms` return 200; the designed missing route returns 404. Each has one h1, one main, and the expected title.
- Descriptions, canonicals, Open Graph/Twitter fields, 1200×630 social art, SVG favicon, touch icon, theme color, robots, and sitemap are present.
- Every discovered link returned its expected status. The 404 page’s same-page skip link correctly remains on the 404 response.
- The factory URL verifier passed with zero console errors, `lang="en"`, one h1, one main, complete alt text, and no unlabeled button.
- Axe reported zero violations on home, demo, privacy, terms, and 404 at 390 px.
- Mobile width stays 390 px at 200% text. Reduced motion is handled in CSS.
- The glacial ceramic palette, original still life, typography, stamped controls, asymmetrical vessels, and print treatment are product-specific rather than generic SaaS.
- F-3-1 remains the touch-target failure.

## Missed leverage

F-3-6 is the clear missed-leverage item: importing the product’s own portfolio export would make local data portable and recoverable. Challenge-deck import/export already exists. Cloud sync is not expected because local-first privacy is central. AI is not warranted: the brief excludes AI tutoring/scoring, and core work has useful non-AI paths. No provider key or decorative AI integration was found.

## What would make this perfect

Make every mobile link target at least 44×44 px; put the tested offline fact in the first-screen row; replace “+ Deck” and “✓ In deck” with visible result-naming actions; remove the Keepsake term and causal checkout wording; and add safe portfolio JSON restore with a round-trip claim. Then rerun the full claim matrix, link/route crawl, mobile target audit, offline interception, and clean-clone suite.
