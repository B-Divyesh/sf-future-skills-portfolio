# Visual thesis — Glacial minimal ceramics

Future Skills Portfolio should feel like a quiet worktable where evidence is shaped, fired, and kept — not a dashboard forecasting a child's future. The visual language combines the restraint of a glacial field with tactile, hand-built ceramic forms. Cool space creates calm; small cobalt and lichen marks help families orient themselves; warm clay records human judgment.

## Direction

- **World:** a pale, mineral workbench with porcelain slabs, translucent ice, pencil marks, and one hand-shaped cobalt object. Surfaces are matte, slightly irregular, and useful.
- **Hierarchy:** generous open fields lead into dense, printable challenge sheets. Large editorial headings defer to practical labels, prompts, and evidence.
- **Interaction grammar:** controls resemble stamped workshop labels. Selection appears as a cobalt inset line and a subtle lift; completed work earns a small clay “fired” mark. The product calls collections **shelves** and completed work **artifacts**.
- **Responsive intent:** desktop shows the challenge shelf beside a compact portfolio summary. At 390px everything becomes one reading column, filters become a horizontal scroll, and bottom actions stay in normal flow so no content is hidden.

## Palette

The site is intentionally single-mode: a fully painted, daylight ceramic studio. This avoids a cosmetic dark theme that would weaken the paper/print metaphor.

| Token | Value | Use |
| --- | --- | --- |
| `--ice` | `#F3F7F5` | page field |
| `--frost` | `#E4EEEB` | grouped surfaces |
| `--porcelain` | `#FCFDFC` | sheets and inputs |
| `--ink` | `#172421` | primary text |
| `--slate` | `#50615C` | secondary text (7.1:1 on porcelain) |
| `--cobalt` | `#174F68` | actions, links, focus (7.8:1 on porcelain) |
| `--cobalt-deep` | `#0D394C` | pressed action |
| `--lichen` | `#426450` | success |
| `--clay` | `#A64F38` | reflection/accent; never body text below AA size |
| `--ochre` | `#7B5414` | warning |
| `--danger` | `#963B39` | destructive/error |

Contrast is designed to meet WCAG AA: body text is ink or slate on ice/porcelain; white appears only on cobalt-deep/cobalt buttons. Status always includes words or icons, never color alone.

## Type

- **Display / reflective:** Georgia, Cambria, `Times New Roman`, serif. The modest, bookish contrast makes challenge titles feel authored rather than generated.
- **Utility / instructional:** Inter-compatible system sans stack (`Avenir Next`, `Segoe UI`, Arial, sans-serif). It keeps rubrics and controls crisp without downloading fonts or calling a CDN.
- Scale: 14, 16, 18, 24, 38, and responsive 56px. Body is 16–18px with 1.55 leading; prose is capped near 68 characters. Numerals use `font-variant-numeric: tabular-nums` in progress summaries.

## Spacing and shape

- 4px base rhythm; primary steps are 8, 12, 16, 24, 32, 48, 72, and 96px.
- Corners are restrained: 2px on sheets, 12–24px only on hand-shaped ceramic objects and large surfaces.
- Borders are mineral lines (`#B8C9C3`), usually 1px; shadows are cool and diffuse, reserved for selected/lifted objects.
- Targets are at least 44×44px with at least 8px between adjacent actions.

## Motion

- 180–240ms ease-out transitions for filter selection, shelf changes, and expanding details; only opacity and transform animate.
- Challenge sheets settle upward by 4px when selected, as if lifted from a table. Toasts enter from their nearby edge.
- Nothing loops or parallax-scrolls. Under `prefers-reduced-motion: reduce`, movement becomes instantaneous while outlines, text, and layering preserve state.

## Asset plan and provenance

- **Hero still:** an original editorial still life of four abstract ceramic artifacts on translucent glacial slabs. It communicates that varied capabilities leave tangible evidence without depicting or profiling a child.
- **Mode marks:** small original inline SVG symbols authored in the repository: Build (joined blocks), Explain (concentric speech/rings), Critique (split lens), Model (coordinate vessel), Collaborate (paired forms). They are simple functional symbols, not raster decoration.
- **Print textures:** CSS-only speckle and ruled rubric areas; no downloaded textures.

### Hero prompt sheet

- **Use case:** stylized-concept
- **Subject:** four abstract hand-built ceramic objects representing building, explaining, critiquing, and modelling; one bridge-like form, one spiral vessel, one split tile, one plotted pebble stack
- **World:** sparse pale mineral workbench with translucent glacial slabs; no room context
- **Materials:** matte porcelain, frosted glass/ice, graphite scoring, tiny cobalt glaze and terracotta clay accents
- **Light/lens:** diffuse northern daylight, soft long shadows, elevated 35mm editorial still-life view
- **Palette words:** glacier white, fog green, charcoal, deep cobalt, fired clay
- **Negative list:** no people, hands, faces, text, letters, numbers, logos, watermark, brands, screens, gradients, glossy plastic, neon, fantasy landscape, excessive objects
- **Generator:** Azure AI Foundry via `/opt/fleet/lib/gen-image.sh`, deployment `factory-image`
- **Date:** 2026-08-28
- **License/provenance:** generated specifically for Future Skills Portfolio; original project asset, disclosed in the footer.

The 1200×630 social card is a center crop of that original still. The 180px touch icon is a repository-authored raster rendering of `public/mark.svg`; neither introduces third-party material.

## Print treatment

Printing is a first-class mode, not a screenshot. Navigation, hero imagery, filters, and purchase controls disappear; each selected challenge becomes a clean A4/Letter sheet with task, constraints, reflection prompts, and the complete adult/peer rubric. Ink-heavy fields become white with dark outlines, and page breaks keep cards intact.
