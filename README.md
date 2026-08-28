# Future Skills Portfolio

A private, printable challenge deck for families supporting curious learners aged 10–16.

Families save short records after completing challenges across six skill modes.

Live: <https://future-skills-portfolio.sociobot.in>

Sample demo: <https://future-skills-portfolio.sociobot.in/?demo=1>

## What is included

- Eight free challenges with materials, limits, reflection prompts, and a four-row rubric
- Local work records with evidence, an observation, and a next step
- Print-ready individual challenges and family-selected decks
- Local challenge creation plus JSON deck import and export
- Offline demo and real workspace use after one visit
- A separate sample workspace that never reads or changes the real portfolio

Free and demo use needs no account and sends no data to another site. Browser storage holds portfolio data. See the [privacy policy](https://future-skills-portfolio.sociobot.in/privacy).

New Keepsake Deck purchases are not offered because the hosted checkout is unavailable.

## Run locally

Use Node.js 20 or later.

```sh
npm ci
npm run dev
```

Vite prints the local URL. The product uses vanilla TypeScript and local runtime assets.

## Test and build

```sh
npm test
npm run build
npm run preview
```

Run one public claim with `npm run test:claims -- --grep @claim:<id>`. Every command is listed in [`.factory/claims.json`](.factory/claims.json).

The production build is in `dist/`. Azure Static Web Apps configuration is in `public/staticwebapp.config.json`.

## Product and visual notes

See [`.factory/design.md`](.factory/design.md) for the visual system, asset prompts, and provenance.

## License

Application code and included materials use the [MIT License](LICENSE). Exported challenges use CC BY 4.0. Imports without that license are rejected.
