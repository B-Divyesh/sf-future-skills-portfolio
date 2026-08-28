# Repair handoff — Future Skills Portfolio

## Status

The release-blocking findings from independent verification 2 for candidate
`67e8ce504386abdbf8fff522f6d4b538d27afde4` are repaired in this worktree.
The artifact remains a Vite + vanilla TypeScript static web app, with `dist/`
as the Azure Static Web Apps deployment root.

## Repairs

- Artifact and print-shelf writes now use one checked persistence path. When
  browser storage rejects a write, the current in-memory work remains visible
  and exportable, and the UI says `Your browser blocked local storage. Export
  your work before leaving.` rather than claiming it was saved.
- Imported deck records must explicitly declare the supported `CC BY 4.0`
  reuse license. The parser rejects license-less or unsupported-license files;
  exported decks preserve the attribution. Built-in first-party sheets are
  attributed when exported, while family/imported sheets cannot be re-exported
  without their explicit license.
- `loadState()` now validates individual artifact and challenge records before
  rendering. Invalid members are ignored while valid local work is retained,
  avoiding the prior persistent blank screen.
- The 390px layout now wraps long text at 200% root text size and constrains
  filter rows to their own horizontal scrollers. Review rubrics retain their
  intentional local horizontal scroll without producing page-level overflow.
- The nested share-panel and locked-detail complementary landmarks are ordinary
  content containers now; axe reports no violations, including the earlier
  moderate landmark finding.

## Regression coverage

- Unit coverage verifies malformed stored members are filtered, imports without
  CC BY 4.0 are rejected, first-party exports are attributed, and an
  unlicensed family challenge cannot be re-exported.
- Browser coverage runs in desktop Chromium and 390x844 Chromium. It forces
  `Storage.prototype.setItem` to throw for artifact and shelf writes; verifies
  no false success toast, retained in-memory artifact, and the expected loss
  after reload; rejects an unlicensed deck; reloads malformed local state; and
  verifies 390px/200%-text page reflow plus independently scrollable filters
  and rubric.
- The home scan now asserts zero axe violations (not only serious/critical).

## Verification evidence

Performed on 2026-08-28 UTC after `npm ci` (61 packages installed, 0
vulnerabilities):

| Check | Result |
| --- | --- |
| `npm test` | PASS — 15 Vitest checks and 18 Playwright checks (9 scenarios × desktop and 390px mobile Chromium) |
| `npm run build` | PASS — `tsc --noEmit` and Vite; `dist/index.html` at deployment root |
| Local `verify-url.sh` | PASS — title, `lang=en`, exactly one h1, main landmark, image alt, named buttons, zero console/page errors |
| Axe | PASS — 0 violations on the home artifact dialog, `/privacy`, and `/terms` |
| Keyboard smoke | PASS — skip link is first Tab stop; Enter opens the selected control; artifact-dialog focus starts at its title field, Escape closes it, and focus returns to Log an artifact |
| Offline/update | PASS — production service worker took control; a forced-offline reload displayed the explicit offline state with no browser errors |
| Privacy smoke | PASS — normal free use made requests only to the app origin; no analytics, CDN, remote fonts, or cloud portfolio request |
| Lighthouse mobile/local | PASS — Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.3 s, TBT 90 ms, CLS 0 |
| Asset budgets | PASS — JS 46,023 B raw (<200 KB), CSS 21,490 B raw (<50 KB), mobile hero 23,704 B (<300 KB), no runtime webfonts |

## Production deployment and verification

Deployed `dist/` with `/opt/fleet/lib/deploy-static.sh` to Azure Static Web
Apps on 2026-08-28 UTC. Azure deployment ID:
`5c07baf8-1de9-4136-8c9d-3cfe3eb70a2a`. The live URL is
<https://future-skills-portfolio.sociobot.in/>.

| Live check | Result |
| --- | --- |
| Live `verify-url.sh` | PASS — 804 ms, title/lang/one h1/main/alt/named buttons present; zero console and page errors |
| Deployment identity | PASS — SHA-256 of live `index.html`, hashed JS/CSS, `sw.js`, manifest, and both hero assets matched the final `dist/` (7/7) |
| Live 390px + 200% text | PASS — `scrollWidth=390`, `clientWidth=390`; axe 0 violations |
| Live offline/update | PASS — service worker controlled root scope and a forced-offline reload rendered the explicit offline state with no errors |
| Live response policy | PASS — strict self-only CSP, HSTS, nosniff, strict-origin referrer policy, camera/microphone/geolocation denial; HTML `max-age=30, must-revalidate`; `sw.js`/manifest `no-cache, must-revalidate`; hashed JS/CSS immutable for one year |
| Live privacy identity | PASS — free-use browser requests were same-origin only; no analytics, remote fonts, CDN scripts, or cloud portfolio writes |
| License response | PASS — invalid-license endpoint returned `valid:false`, origin-specific CORS, and `Cache-Control: no-store` |
| Lighthouse mobile/live | PASS — Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.1 s, TBT 50 ms, CLS 0 |

## Run and verify

```sh
npm ci
npm test
npm run build
VERIFY_NODE_MODULES="$PWD/node_modules" /opt/fleet/lib/verify-url.sh \
  http://127.0.0.1:4173/ /tmp/fsp-verify
```

Use `npm run preview -- --host 127.0.0.1 --port 4173` before the final local
verification command.

## Known boundary

No real paid checkout or valid production license is transacted. The existing
checkout link and invalid-license flow remain covered; normal free use, local
storage, import/export, print, legal pages, accessibility, and offline use are
fully verified.
