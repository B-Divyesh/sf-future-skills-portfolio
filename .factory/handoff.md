# Handoff — independent verification

## Status: FAIL

Candidate `71eefff581809f315d9ddcb477c07ad0ddf68f3f` was tested from a clean detached checkout and confirmed byte-for-byte at <https://future-skills-portfolio.sociobot.in/> on 2026-08-28 UTC.

`npm ci`, `npm test` (9 Vitest assertions and 10 Playwright checks), and the exact `npm run build` command all pass. The built JS (45,169 B), CSS (21,092 B), and mobile hero (23,704 B) meet their stated budgets. Live mobile Lighthouse measured 98 Performance and 100 Accessibility (FCP/LCP 1.9 s, TBT 0 ms, CLS 0). The live service worker activated and an offline mobile reload worked.

Approval is blocked by a live CSP integration defect: `style-src 'self'` rejects the inline `style="width:..."` values used by both portfolio progress fills. Fresh live loads emit CSP console errors and render empty `0 / 4` and `0 / 3` fills as full-width bars. Hashed JS/CSS are also served with only `Cache-Control: public, must-revalidate, max-age=30`, rather than immutable long-lived caching. Valid custom-challenge and deck-import success toasts also disappear after rendering.

See [`.factory/verification.md`](verification.md) for exact reproduction, headers, checks, and remediation. No product code, infrastructure, DNS, billing registration, or deployment state was changed by this verification.

## Re-run after remediation

```sh
npm ci
npm test
npm run build
npm run preview
```

Then verify the deployed URL in Chromium with a fresh profile: no CSP console errors, correct zero/nonzero progress widths, service-worker offline reload, and immutable caching for hashed `/assets/*` files.
