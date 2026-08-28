# Future Skills Portfolio

Future Skills Portfolio is a private, printable challenge deck for parents and home-school educators supporting mathematically and computationally curious young people aged 10–16. Instead of predicting careers or asking an AI to score a child, it helps a family collect human-reviewable evidence across building, explaining, critiquing, modelling, debugging, and collaboration.

Live: <https://future-skills-portfolio.sociobot.in>

## What is included

- Eight complete free challenges with material limits, reflection prompts, and a four-level adult/peer rubric
- Local-only artifact records and a six-week “four artifacts across three modes” progress view
- Print-ready individual sheets and family-selected decks
- A local challenge maker plus JSON deck import/export
- Offline shell caching after the first production visit
- An optional $19 one-time Keepsake Deck with eight more curated challenges, unlocked through the Sociobot billing API

The app requests no child account, profile, photo, analytics identifier, or cloud sync. Browser storage holds the portfolio and optional license token. See [`/privacy`](https://future-skills-portfolio.sociobot.in/privacy) for the plain-language policy.

## Run locally

Requires Node.js 20 or later.

```sh
npm ci
npm run dev
```

Vite prints the local URL. The app is a vanilla TypeScript static site with no runtime framework and no third-party runtime CDN.

## Test and build

```sh
npm test
npm run build
npm run preview
```

The exact production build command is `npm run build`. Output lands in `dist/`, with `dist/index.html` at its root. Azure Static Web Apps routing and security headers live in `public/staticwebapp.config.json` and are copied into the build.

License verification uses `https://api.sociobot.in/api/v1/products/future-skills-portfolio/verify`; checkout uses the matching hosted Sociobot product URL. No payment provider is embedded and no product ID is hardcoded.

## Product and visual notes

The research brief is represented in the build work order and the complete product-specific visual system, asset prompt, and provenance are in [`.factory/design.md`](.factory/design.md). Generated source artwork is kept in `assets/src/`; optimized WebP files ship from `public/assets/`.

## License

Application code and included first-party materials are provided under the [MIT License](LICENSE). Family-created challenges are exported under CC BY 4.0 when the creator confirms they have permission to do so.
