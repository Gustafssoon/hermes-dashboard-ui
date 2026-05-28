---
name: tingzel-pantheon-design
description: Use this skill to generate well-branded interfaces and assets for Tingzel Pantheon, a calm, Athena-inspired private homelab operations console — either for production or throwaway prototypes/mocks. Contains design guidelines, color and type tokens, fonts, brand assets, and a UI kit of console components for prototyping.
user-invocable: true
---

# Tingzel Pantheon — Design Skill

Read `README.md` first — it holds the product context, content fundamentals,
visual foundations, and iconography rules. Then explore the other files:

- `colors_and_type.css` — all design tokens (palette + roles, type families/
  scale/styles, spacing, radii, elevation). Load this on every surface.
- `assets/` — the Pantheon wordmark/monogram (`logo.html`) and provenance.
- `preview/` — small specimen cards for color, type, spacing, and components.
- `ui_kits/pantheon/` — an interactive console recreation with reusable JSX
  components (`primitives.jsx`, `views.jsx`, `shell.jsx`) and a mock-data layer
  (`data.jsx`) shaped for real read-only status feeds.

## How to work in this brand
- It is a **private operations console for one operator** — calm, technical,
  premium, dense with real information. Not a marketing site, not a SaaS demo.
- Greek mythology is a **thin operational lacquer**: deity names label sections
  (Athena=overview, Hermes=links, Hephaestus=infra, Oracle=checks, Aegis=backup,
  Scrolls=runbooks). Never role-play gods, never use fantasy/RPG styling.
- Obsidian/stone surfaces, warm marble/parchment text, a single restrained gleam
  of antique gold. Laurel=ok, gold=warn, amphora red=down, Aegean=info.
- **Serif** (Cormorant Garamond) for mythic framing; **grotesk** (Hanken) for UI;
  **mono** (JetBrains Mono) for every piece of operational data.
- No emoji, no gradients-as-decoration, no photographic imagery, no fake business
  metrics. Icons are stroke-only Lucide.

## Output
- For visual artifacts (slides, mocks, throwaway prototypes): copy the assets and
  tokens out and produce static HTML files for the user to view.
- For production code: read the rules here and reuse the tokens/components to
  design accurately in-brand.
- If invoked with no guidance, ask what they want to build, ask a few focused
  questions, then act as an expert designer producing HTML artifacts or
  production code as appropriate.
