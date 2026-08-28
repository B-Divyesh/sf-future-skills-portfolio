# Perfection-loop polish 1 — finding closure

**Base review:** `9bf4235fe5200ee2f38255d8edfdc84165152c5f`  
**Reviewed candidate:** `83454db2e894b42155b5df449eeec3557fab9089`  
**Repair implementation:** `ec3a1b8`  
**Live URL:** <https://future-skills-portfolio.sociobot.in/>  
**Result:** PASS — every F-1 finding is closed.

Repository history contains one `.factory/review-*.md` (`review-1.md`) and no earlier `.factory/polish-*.md`. Earlier verification reports were also checked; their storage, import-license, reflow, CSP, caching, feedback, and corrupt-state repairs remain covered by the passing suite.

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Added the one-click `/?demo=1` and `/demo` sample workspace. It seeds four artifacts across five modes and four print choices under `demo:future-skills-portfolio:v1`. A persistent banner provides **Reset demo** and **Start for real**. Every exit deletes the demo key; the real key is never read or written in demo mode. | `@claim:demo-isolation`; `the demo is one click away…`; [live demo mobile](evidence/polish-1/live/demo-cold-mobile.png); live audit reports `realBytesUnchanged: true` and `discardedOnExit: true`. |
| F-1-2 | Removed the broken buy link, $19 price, purchase wording, and paid availability UI. Eight free challenges remain complete. Existing saved licenses can still be honored without advertising a sale. | `@claim:checkout-disabled`; `the first screen names the job…`; live cold DOM has no `/checkout` anchor, buy action, or price. The upstream endpoint still returned 404 before repair, so it is not offered. |
| F-1-3 | Added a ceramic-studio not-found page and Azure `responseOverrides` routing. Only `/demo`, `/privacy`, and `/terms` rewrite to the SPA; unknown paths return the designed page with HTTP 404. | `@claim:routing-metadata`; deployment unit test `rewrites only real application routes…`; [live 404](evidence/polish-1/live/404-cold-desktop.png); live `/missing-challenge` = HTTP 404. |
| F-1-4 | Added `.factory/claims.json` with 12 claims and exactly one tagged test for each. Claims cover demo isolation, offline, privacy, checkout suppression, included content, printing, both exports, licensed import, routing, local authoring, and static budgets. | Every manifest command passed independently from clean clone `/tmp/fsp-polish-clean-saeBKp`; 24/24 desktop/mobile claim cases passed. Full suite: 50/50 browser checks. |
| F-1-5 | Added route-specific titles, descriptions, canonicals, Open Graph and Twitter metadata, a derived 1200×630 social image, and a 180px touch icon. Added `/demo` to the sitemap. | `@claim:routing-metadata`; `scripts/live-audit.mjs`; live audit confirms exact titles/canonicals for all five route states; `social-card.jpg` is 1200×630. |
| F-1-6 | Added History API navigation, back/forward handling, scroll-state storage, destination heading focus, and a polite route announcer. Demo anchors preserve demo mode. | `@claim:routing-metadata` exercises click, back, forward, and section focus on desktop and mobile. Live audit confirms route rendering. |
| F-1-7 | Added a three-step **How it works** section and a dedicated privacy/non-goals section. Header now contains Demo, Challenges, Portfolio, and Privacy. Every route footer contains Privacy, Terms, Param Factory, and `polish-1`. | `the standard sections, legal links, ownership…`; [live home](evidence/polish-1/live/home-cold-desktop.png); live crawl returned 200 for `/demo`, `/privacy`, and `/terms`. |
| F-1-8 | Replaced the abstract headline with “Build a portfolio of math and computing work” and the prescribed family/age explanation. | `the first screen names the job…`; copy audit rows 2–3; [live home](evidence/polish-1/live/home-cold-desktop.png). |
| F-1-9 | Reworded the image caption to “Four ceramic forms represent four example skills.” The product count consistently says six skill modes. | `@claim:included-deck`; copy audit rows 11 and 15; live home screenshot. |
| F-1-10 | Empty real workspaces say **Print selected challenge** and render one sheet. Saved workspaces say **Print deck (N)** and render exactly N sheets. | `@claim:print-results` passes on both viewports; live demo shows **Print deck (4)**. |
| F-1-11 | Replaced the first-screen fragment with three tested facts: eight free challenges, browser-local work, and print/export availability. | `the first screen names the job…`; `@claim:included-deck`, `@claim:private-free-use`, `@claim:print-results`; live home screenshot. |
| F-1-12 | Standardized vocabulary: challenge, deck, artifact, portfolio, and skill mode. Removed “shelf” from product UI and README. | `.factory/copy-audit.md` terminology table; `rg` vocabulary audit returned no old shelf terms in public copy. |
| F-1-13 | Replaced abstract and promotional wording with concrete nouns and actions. Removed “AI-rich,” “human skill modes,” “transparent,” “complete,” “curated,” and “cross-mode” from public copy. | `.factory/copy-audit.md`: 203 fragments, zero over 22 words, zero banned-word matches; live home screenshot. |
| F-1-14 | Replaced the three unclear headings with “No artifacts yet” and “Export or import a challenge deck”; the unavailable paid heading was removed with its offer. | `the standard sections…`; copy audit rows 172 and 199; live home screenshot. |
| F-1-15 | Card buttons now say “Open challenge: …”; deck toggles say add/remove with the challenge title; every filter exposes “Show … challenges.” | `the standard sections, legal links, ownership, and accessible action names are present`; live axe has zero serious/critical findings. |
| F-1-16 | Rewrote the README opening to 12 words. | README line 3; copy review and `git diff --check`. |
| F-1-17 | Split the second README thought into two short sentences with concrete terms. | README line 5; no sentence exceeds 22 words. |
| F-1-18 | Replaced the visual-notes sentence with a short direct pointer to `.factory/design.md`. | README **Product and visual notes**; 12 words. |
| F-1-19 | Split the license explanation into short MIT, CC BY 4.0, and rejection statements. | README **License**; `@claim:deck-export`; `@claim:licensed-import`. |
| F-1-20 | Added the verb-first 86-character summary to `.factory/brief.json` and `.factory/catalog-description.txt`. | Exact text: “Build a private portfolio with printable math and computing challenges for ages 10–16.” |

## Verification summary

- Clean clone: `npm ci` passed with 0 vulnerabilities; every `.factory/claims.json` command passed independently; `npm test` passed 16 unit assertions and 50 browser checks; `npm run build` produced `dist/`.
- Live accessibility: zero serious or critical axe findings on `/`, `/demo`, `/privacy`, `/terms`, and the 404 page. The factory URL verifier reports one title, one h1, one main, complete alt text, labelled buttons, and zero console/page errors.
- Live mobile: 390px at 200% text has `scrollWidth=390` and `clientWidth=390`.
- Live offline: the demo reloaded with four artifacts and the offline status after the network was disabled.
- Live privacy: every observed request during the cold audit was same-origin.
- Live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.1 s, CLS 0, TBT 40 ms, 49 KiB transferred.
- Deployment identity: live HTML, JS, CSS, service worker, and social image match `dist/` byte for byte. Full records are in `evidence/polish-1/live/`.
