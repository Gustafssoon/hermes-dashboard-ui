# Tingzel Pantheon — Design System

> A calm, Athena-inspired operations console for one technical operator.

**Tingzel Pantheon** is a private homelab operations portal — not a public
marketing site and not a multi-tenant SaaS. It exists to give a single
technical operator a strategic, premium, low-noise view of their internal
infrastructure: service health, backup state, recent read-only checks, runbook
shortcuts, incident guidance, and quick links.

Greek mythology is used as a **subtle operational language** — through naming,
hierarchy, symbols, and atmosphere — never as fantasy or RPG decoration. Each
section of the portal is named for a deity whose domain matches its function:

| Section | Deity | Function |
| --- | --- | --- |
| **Overview** | Athena | Overall health and what needs attention now |
| **Links & routing** | Hermes | Quick links, remote access (Twingate), wayfinding |
| **Infrastructure** | Hephaestus | Docker, Portainer, the machines and forges |
| **Checks & signals** | Oracle | Recent read-only checks and observations |
| **Backup & protection** | Aegis | Backup state and restore verification |
| **Runbooks** | Scrolls | Troubleshooting shortcuts, written procedure |
| **Incident mode** | — | What to check first when something is down |

### Core monitored services
NAS / Synology DSM · DNS / Technitium · Portainer · Twingate ·
Hermes Dashboard · Hue Bridge.

### Posture
The portal is **read-only and frontend-first**. It observes and guides; it does
not act on infrastructure. All data here is mock/placeholder, structured so real
read-only status feeds can be dropped in later. No backend, auth, secrets, or
external APIs live in this design system.

---

## Sources

This design system was built from materials the operator provided. The reader
may not have access, but they are recorded here so they can be explored to build
higher-fidelity Pantheon designs later:

- **Hermes Dashboard UI** — https://github.com/Gustafssoon/hermes-dashboard-ui
  The existing static frontend for the Hermes Agent dashboard (nginx-proxied,
  polls a read-only API every 10s). Pantheon **inherits its operational
  grammar** — topbar wordmark, status dots, card grid, uppercase tracked card
  headers, monospace data values, translucent semantic badges, and a
  poll-and-render data model — but **re-skins** it from the original purple
  (`#7c6aef`) accent to the Athena palette documented below. Explore that repo
  to see the real data contract (`/api/status`, `/api/sessions`, etc.) the
  Pantheon shell is designed to eventually consume.

---

## Content Fundamentals

How copy is written across Tingzel Pantheon.

- **Voice — strategic, precise, protective.** The portal speaks like a calm
  chief-of-staff, not a marketing site and not a chatbot. It states the
  situation and the recommended next move. No hype, no exclamation, no fluff.
- **Person.** Mostly impersonal/declarative ("3 services nominal", "Backup
  verified 6h ago"). When it addresses the operator it uses **you** sparingly
  and only for guidance ("Start here", "Check the gateway first"). It never
  refers to itself as "I".
- **Casing.** Sentence case for everything readable. **UPPERCASE with wide
  tracking** is reserved for eyebrows, card headers, and labels (e.g.
  `SYSTEM STATUS`, `LAST CHECK`, `GATEWAY`). Deity/section names appear in the
  classical serif and may be Title Case ("Aegis", "Oracle").
- **The mythology is a thin lacquer, never a costume.** Use deity names as
  section identities and the occasional one-line epigraph in the runbooks. Do
  **not** write "the gods", role-play, or use mythological flavor text in place
  of real operational information. A status line says `DNS · nominal`, not
  "Hermes smiles upon your queries".
- **Numbers and time are concrete.** Prefer relative time for freshness
  ("checked 4m ago", "verified 6h ago") and absolute ISO-ish timestamps in mono
  for logs (`2026-05-28 14:02`). Never invent business KPIs, revenue, or vanity
  metrics — this is infrastructure, not a dashboard demo.
- **Severity language is short and graded:** `nominal` → `degraded` →
  `attention` → `down`. Recommendations are imperative and specific: "Restart
  the Portainer stack", "Verify last restore point".
- **No emoji. Ever.** Status is carried by color, a small dot/glyph, and a word.

**Examples of on-brand copy**
- Eyebrow: `ATHENA · OVERVIEW`
- Headline state: `All systems nominal` / `1 service needs attention`
- Service row: `Synology DSM — nominal · checked 3m ago`
- Incident prompt: `Something is down. Start with the gateway.`
- Runbook epigraph (sparing): *"Know first, then act."*

---

## Visual Foundations

The atmosphere is **a lamplit stone chamber after dark** — obsidian surfaces,
warm marble text, a single restrained gleam of antique gold. Calm, dense with
real information, premium, and quiet.

- **Color.** Obsidian/dark-stone surfaces (`#0D0F12`→`#2A2F38`) layered by
  elevation. Text is warm **marble/parchment**, never pure white
  (`#ECE6D8`→`#6E6A60`). The accent is **muted antique gold** (`#C9A961`), used
  sparingly — for the active nav item, focus, key figures, and the wordmark
  gleam. Operational signals: **laurel green** = nominal, **gold** = warn/
  attention, **amphora red** (oxidized terracotta `#C25B4E`, not neon) = down,
  **Aegean blue** (`#6699B5`) = informational/links. See `colors_and_type.css`.
- **Type.** Three families. **Cormorant Garamond** (classical serif) for deity
  names, page titles, and the occasional epigraph — it carries the mythological
  register. **Hanken Grotesk** for all UI text, labels, and body — warm,
  precise, legible. **JetBrains Mono** for every piece of operational data:
  versions, counts, timestamps, IDs, raw payloads. The mono/serif contrast is
  the core typographic idea: *machine truth in mono, human/mythic framing in
  serif.*
- **Spacing.** 4px base grid; cards padded `20–24px`; dashboard gutters `16px`.
  Density is intentional — this is a console, so information is close-packed but
  separated by hairlines and generous line-height, not big empty space.
- **Backgrounds.** Flat obsidian. **No photographic imagery, no gradients as
  decoration.** At most a near-invisible warm vignette or a faint engraved
  hairline. The only "texture" is the layering of stone surfaces and 1px warm
  borders. Avoid full-bleed images entirely — this is an internal tool.
- **Borders.** Hairline warm charcoal (`#282C33`). Cards, dividers, and wells
  are defined by 1px borders rather than heavy shadows. An optional `--edge-light`
  inset (1px top highlight at 4% marble) gives surfaces a faint "engraved stone"
  bevel.
- **Shadows / elevation.** Soft, low, near-black — like dim light over stone
  (`--shadow`, `--shadow-lg`). Elevation is communicated more by surface
  lightening (`--bg-card` → `--bg-raised`) than by drop shadow. Sunken wells
  (code/raw payload) use an inset shadow.
- **Corner radii.** Restrained and architectural: `3px`/`5px`/`8px`, pills only
  for status chips. Nothing is heavily rounded — sharp-ish corners read as
  premium and engineered.
- **Hover states.** Surfaces lighten one step (`--bg-card`→`--bg-raised`); text
  goes from `--fg2`→`--fg1`; gold elements brighten toward `--gold-300`. Borders
  on interactive elements warm toward gold on hover.
- **Press / active states.** Surface goes to `--bg-active` and the element
  nudges down 1px (no bounce). The active nav item carries a gold left-edge
  marker and gold text.
- **Focus.** A 3px soft gold ring (`--focus-ring`) with an obsidian inset gap —
  visible but quiet.
- **Transparency & blur.** Used sparingly: translucent semantic fills behind
  badges (12–15% of the signal color), and an optional `backdrop-filter: blur`
  on the incident-mode overlay and sticky topbar. Never frosted-glass for
  decoration.
- **Animation.** Minimal and calm. Status dots may have a slow 2s pulse
  (opacity only) for live/connecting states. Transitions are short
  (`120–180ms`) on `ease`/`ease-out` — color and opacity, **no bounce, no slide-
  in theatrics.** A console should feel instant and stable.
- **Imagery vibe.** If imagery is ever introduced, it should be warm,
  desaturated, lamplit, and architectural (stone, bronze, ink) — never bright,
  glossy, or "stock photo". This system ships with none by default.
- **Cards.** `--bg-card` fill, 1px `--border`, `8px` radius, `20–24px` padding,
  an uppercase tracked header with a bottom hairline. Low/no shadow at rest;
  optional `--shadow` when raised in an overlay.

---

## Iconography

See the **ICONOGRAPHY** section below and `assets/`.

- **Primary set: [Lucide](https://lucide.dev) via CDN.** Lucide's thin, even
  (≈1.75–2px) stroke, rounded joints, and restrained geometry match the calm,
  premium, engineered tone. The Hermes reference shipped **no icon set** (it
  used colored dots and text badges only), so Lucide is a documented, additive
  choice — flagged here, not lifted from the source.
- **Stroke icons only** — no filled/duotone glyphs. Render at `16`/`18`/`20px`,
  `stroke-width: 1.75`, colored with `currentColor` so they inherit `--fg2`/
  `--fg3` and warm to gold on active.
- **Deity → glyph mapping** (Lucide names): Athena/Overview → `shield-half` or
  `gauge`; Hermes/Links → `send` / `route`; Hephaestus/Infra → `hammer` /
  `boxes`; Oracle/Checks → `eye` / `activity`; Aegis/Backup → `shield-check`;
  Scrolls/Runbooks → `scroll-text`; Incident → `triangle-alert`.
- **Status is not an icon** — it's a colored dot (`.status-dot`) plus a word.
  Icons label *navigation and actions*, never severity.
- **No emoji, no unicode-glyph icons, no hand-drawn SVG illustrations.** The one
  permitted typographic "mark" is the Pantheon wordmark/monogram (see
  `assets/logo.html`), built from the brand serif — not a generated image.
- A copy of the original Hermes `favicon.svg` is kept in `assets/` for
  provenance only; it is **not** part of the Pantheon brand.

---

## Index — what's in this system

| Path | What it is |
| --- | --- |
| `README.md` | This file — product context, content + visual foundations, iconography. |
| `colors_and_type.css` | All design tokens: color palette + roles, type families/scale/styles, spacing, radii, elevation. **Load on every surface.** |
| `SKILL.md` | Agent-Skills manifest so this system can be used in Claude Code. |
| `HANDOFF.md` | GitHub handoff: branch, file manifest, run instructions, what's mocked, git push commands, and what to implement next. |
| `assets/` | Brand wordmark/monogram (`logo.html`), provenance favicon. |
| `preview/` | Small HTML cards rendered in the Design System tab (color, type, spacing, components). |
| `ui_kits/pantheon/` | The portal UI kit — `index.html` (interactive console) + JSX components, plus `DATA_CONTRACT.md` (the read-only data shape for real feeds). |

### Font substitution note
Cormorant Garamond, Hanken Grotesk, and JetBrains Mono are loaded from **Google
Fonts CDN** rather than bundled as local files (the build environment can't fetch
binary font files). If you need a fully offline/self-hosted system, download
these three families and drop the `.woff2` files into a `fonts/` folder, then
replace the Google Fonts `<link>` with local `@font-face` rules. **Flag to the
operator:** confirm these three families are the intended pairing, or provide
preferred brand fonts and I'll swap them in.
