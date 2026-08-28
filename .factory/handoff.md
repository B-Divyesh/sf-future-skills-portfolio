# Review handoff — Future Skills Portfolio review 2

## Status: FAIL

This review made no product-code, asset, configuration, or deployment changes. It added the committed QA report `.factory/review-2.md` and replaced this handoff with the review outcome.

## What was verified

- Cold live checks at 390×844 and 1440×900: the first screen clearly states the job, audience, and first action.
- Demo entry, Reset, and Start for real: the real storage sentinel remained byte-for-byte unchanged; demo state used `demo:future-skills-portfolio:v1`; exit removed that key; observed requests were same-origin.
- Direct route checks: `/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms` returned 200; a missing route returned designed HTTP 404. Titles, description, canonical, OG/Twitter image, favicon/touch icon, h1/main, route focus, and back/forward behavior were checked.
- Axe found no serious/critical issues on the checked routes. Crawled internal links and the Creative Commons target returned 200.
- Clean clone `/tmp/fsp-review2-TIc31q`: `npm ci`, `npm run build`, all 12 individual `.factory/claims.json` commands, and `npm test` passed.

## Findings left

1. **Blocking F-2-1:** The demo opens on the marketing hero; its first mobile viewport does not visibly show realistic sample work.
2. **Blocking reopened F-1-4 / F-2-2:** Several live/README claims are absent from the claims inventory, including incorrect “six-week” sample language (the data covers three weeks), filtering/content promises, import-locality, production offline wording, and broad privacy/AI promises.
3. **Minor F-2-3:** “Artifact” and “reviewable work” are unexplained jargon in action copy.
4. **Minor F-2-4:** The outbound CC BY 4.0 link is not marked external.

See `.factory/review-2.md` for exact quotes, evidence, and required fixes.

## Run / verify

```sh
npm ci
npm run build
npm test
```

For claim-by-claim verification, run each command listed in `.factory/claims.json` from a clean clone. Then repeat the live 390px demo-entry observation, storage-isolation check, offline/network interception, route/metadata crawl, and link crawl.
