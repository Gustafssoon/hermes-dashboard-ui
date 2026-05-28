# Pantheon Console — UI Kit

A high-fidelity, interactive recreation of the **Tingzel Pantheon** operations
console. Frontend-first and read-only: it observes and guides, it never acts on
infrastructure.

## Run it
Open `index.html`. No build step. React + Babel are loaded from CDN; the three
brand fonts come from Google Fonts. Tokens come from `../../colors_and_type.css`.

## What's interactive
- **Sidebar navigation** between the six deity sections (Athena, Hermes,
  Hephaestus, Oracle, Aegis, Scrolls).
- **Incident mode** — the amphora-tinted button (and the Athena CTA) open an
  ordered "what to check first" overlay; each step jumps to the relevant section.
- **Runbooks (Scrolls)** expand/collapse to reveal numbered steps.
- **Refresh** dims-and-restores the content to simulate a poll cycle.

## Files
| File | Role |
| --- | --- |
| `index.html` | Entry point; loads tokens, `kit.css`, and the JSX in order. |
| `kit.css` | All component styles (consumes the design-system tokens). |
| `data.jsx` | **Mock data** for every section. Shaped like a real read-only feed — swap the values, keep the keys. |
| `icons.jsx` | `<Icon>` component with inlined Lucide path data. |
| `primitives.jsx` | `StatusDot`, `Badge`, `Card`, `KeyValue`, `Button`, `Meter`, `ServiceRow`, `LinkRow`. |
| `views.jsx` | One view per deity section. |
| `shell.jsx` | Sidebar, Topbar, IncidentOverlay, and the `App` root. |
| `favicon.svg` | Pantheon Π monogram. |

## Data contract (for real status later)
`data.jsx` is the single seam between mock and real. Each `service` carries
`{ id, name, kind, icon, state, detail, checked, host }`, where `state` is one of
`nominal | attention | degraded | down | info`. The `state` strings map directly
to the dot/badge classes in `kit.css` (`s-nominal`, `b-attention`, …). A future
read-only collector (e.g. polling the Hermes `/api/status` model documented in
the source repo) only needs to produce this shape — no component changes
required.

## Deliberately omitted
No auth, no settings persistence, no live network calls, no write actions. This
is a UI kit and a frontend prototype, not production code.
