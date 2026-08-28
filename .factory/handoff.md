# Handoff — adversarial review 3

## Outcome

Reviewed the deployed Future Skills Portfolio at commit `3db1395ee65db694a58987a6957026044ed05d29` without changing product code. The verdict in `.factory/review-3.md` is **FAIL** with six findings: mobile touch targets, incomplete checkout-claim coverage, a missing first-screen offline fact, non-result-naming visible deck controls, inconsistent unavailable-product terminology, and no portfolio restore/import path.

## Verification performed

- Fresh 390×844 and 1440×900 cold-load review
- One-click demo, realistic first viewport, Reset, exit, and byte-for-byte real/demo storage isolation
- Offline reload and same-origin request interception
- All 14 `.factory/claims.json` commands run separately in clean clone `/tmp/fsp-review3-xKoZFk`; all passed
- Full clean-clone `npm test`: 16 Vitest assertions and 54 Playwright checks passed
- Clean-clone `npm run build`: produced `dist/` with 50,889 B JS and 26,660 B CSS raw
- Live route/title/metadata/focus/404 checks and complete link crawl
- Factory URL verifier and axe on home, demo, privacy, terms, and 404; no console errors or axe violations
- Live/local SHA-256 identity for HTML, JavaScript, and CSS
- Every earlier review, polish report, verification report, and handoff checked against live behavior and current source

## Files changed

- `.factory/review-3.md`
- `.factory/handoff.md`

No application source, tests, dependencies, or deployment files were changed.

## Remaining work

Resolve F-3-1 through F-3-6 in `.factory/review-3.md`, deploy, and repeat the complete review from a fresh context. The highest user-impact repair is the 44×44 px mobile target audit. Narrow the checkout copy/test so the claim remains mechanically true.
