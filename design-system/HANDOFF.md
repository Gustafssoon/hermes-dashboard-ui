# Tingzel Pantheon — Handoff

Prepared for handoff into **https://github.com/Gustafssoon/hermes-dashboard-ui**.

> **Read this first — about the push.** This package was produced in a design
> environment with **read-only** GitHub access. It can read and import from the
> repo but **cannot create a branch, commit, or open a PR on your behalf**, so
> there are **no commit hashes or PR link below** — producing fake ones would be
> dishonest. Everything you need to push it yourself in one paste is in
> [§ How to push](#how-to-push). The whole design system is also available as a
> download from the chat.

---

## Branch
```
feat/tingzel-pantheon-design-system
```

## What this is
A calm, Athena-inspired **operations console** design system + interactive UI
kit for the Tingzel Pantheon homelab portal. It reuses the operational grammar
of the existing Hermes dashboard (topbar wordmark, status dots, card grid, mono
data values, translucent badges, poll-and-render data model) and re-skins it to
the Pantheon palette. **Frontend-only.** No backend, auth, database, hosting,
deployment, or router/firewall/DNS/Twingate changes. No secrets.

## Where it goes in the repo
To leave the existing `public/` Hermes frontend **completely untouched**, drop
the whole system into a new top-level folder:

```
hermes-dashboard-ui/
  public/            # unchanged — existing Hermes frontend
  deploy/            # unchanged
  design-system/     # NEW ← everything in this package lands here
    README.md
    SKILL.md
    colors_and_type.css
    DATA model lives in ui_kits/pantheon/
    assets/  preview/  ui_kits/pantheon/
```

Nothing in `deploy/` or `.github/workflows/` is touched, so **no deployment
behaviour changes** — this is purely additive static files.

---

## File manifest (all NEW, under `design-system/`)

**Foundations & docs**
- `README.md` — product context, content fundamentals, visual foundations, iconography, index.
- `SKILL.md` — Agent-Skills manifest (usable as a Claude Code skill).
- `colors_and_type.css` — all tokens: palette + roles, type families/scale/styles, spacing, radii, elevation.

**Brand**
- `assets/logo.html` — Pantheon wordmark / Π monogram (on obsidian + marble).
- `assets/hermes-favicon-provenance.svg` — original Hermes favicon, kept for provenance only.

**Design-system specimen cards** (`preview/`, 19 files + `_card.css`) — color, type, spacing, and component cards used for review.

**UI kit** (`ui_kits/pantheon/`)
- `index.html` — entry point (loads tokens, `kit.css`, JSX in order).
- `kit.css` — all component styles.
- `data.jsx` — **mock data** for every section (the swap-in seam).
- `icons.jsx` — `<Icon>` with inlined Lucide path data.
- `primitives.jsx` — `StatusDot`, `Badge`, `Card`, `KeyValue`, `Button`, `Meter`, `ServiceRow`, `LinkRow`.
- `views.jsx` — one view per deity section.
- `shell.jsx` — Sidebar, Topbar, IncidentOverlay, `App` root.
- `favicon.svg` — Pantheon monogram favicon.
- `README.md` — kit overview + run notes.
- `DATA_CONTRACT.md` — the read-only data shape for wiring real status later.

---

## How to run locally
No build step. The console uses React + Babel from CDN and three Google Fonts,
so it needs network on first load.

```bash
# from the repo root, after the files are under design-system/
cd design-system
python3 -m http.server 8080
# open http://localhost:8080/ui_kits/pantheon/index.html
```
Or just open `design-system/ui_kits/pantheon/index.html` directly in a browser.

Tour: switch deity sections in the sidebar; click **Incident mode** (or the
Athena CTA) for the ordered "check first" overlay; expand a runbook in
**Scrolls**; hit refresh in the topbar to simulate a poll cycle.

---

## What is mocked
All values are placeholder, living in `ui_kits/pantheon/data.jsx`, shaped per
`DATA_CONTRACT.md`. Covered areas:

- **Synology DSM / NAS health** — model, DSM version, temp/fan, volumes (SHR-1 + Basic with usage %), per-bay disk SMART/temp/hours.
- **Technitium DNS** — service state, queries/min, cache-hit %, blocked %, latency, upstream resolvers (DoH/DoT) with per-upstream latency.
- **Portainer / Docker** — endpoint, container counts, five stacks with per-stack state (media stack shows a restarting transcoder).
- **Twingate remote access** — connector state, devices, last handshake, "no public exposure" note.
- **Hermes Dashboard agent** — version, sessions, gateway state, config version, auth flag, release (aligned to the real `/api/status` fields).
- **Hue Bridge** — reachability, lights reachable, firmware, last-seen.
- **Backup freshness & restore verification** — four backup jobs (target/size/last/verified) + a restore-drill card (last drill, outcome, cadence, overdue flag).
- **Disk usage / volume health** — volume usage meters + the volume1 "approaching 80%" watch signal.
- **TLS certificate freshness** — four internal hosts with days-to-expiry and a "renew soon" attention state on the Synology cert.

Nothing here calls a network service or performs an action — it is display-only.

---

## README update for the repo
The existing root `README.md` (Swedish build/deploy doc) is intentionally **not
overwritten**. Append this section to it:

```markdown
## Design system — Tingzel Pantheon (frontend-only)

`design-system/` contains the Tingzel Pantheon operations-console design system
and interactive UI kit (calm, Athena-inspired re-skin of the Hermes dashboard
grammar). It is **additive and frontend-only** — it does not touch `public/`,
`deploy/`, or the GitHub Actions pipeline.

- Start: open `design-system/ui_kits/pantheon/index.html`, or serve the folder
  (`cd design-system && python3 -m http.server 8080`).
- Tokens: `design-system/colors_and_type.css`. Docs: `design-system/README.md`.
- All data is mock; see `design-system/ui_kits/pantheon/DATA_CONTRACT.md` for the
  read-only shape to wire real status feeds later.
```

---

<a name="how-to-push"></a>
## How to push (you run these)
Download the bundle from the chat and unzip it **at the repo root** — it already
contains the `design-system/` folder, so no moving files around. Then:

```bash
git checkout -b feat/tingzel-pantheon-design-system
git add design-system/
# (optional) append the README section above, then: git add README.md
git commit -m "feat: Tingzel Pantheon design system + console UI kit (frontend-only, mock data)"
git push -u origin feat/tingzel-pantheon-design-system
```

Open the PR:
```bash
# with GitHub CLI:
gh pr create --base main --head feat/tingzel-pantheon-design-system \
  --title "Tingzel Pantheon design system + console UI kit" \
  --body "Frontend-only, additive under design-system/. Mock data per DATA_CONTRACT.md. No backend/auth/deploy changes."
```
Or open it in the browser:
`https://github.com/Gustafssoon/hermes-dashboard-ui/compare/main...feat/tingzel-pantheon-design-system?expand=1`

After pushing, the **branch name + commit hash + PR link** come from the commands
above (`git rev-parse HEAD` for the hash). Send those back and I can keep
iterating against the live branch.

---

## What Athena should implement next (technical, frontend-first)
1. **A read-only `status.json` collector.** A small script (cron/systemd timer)
   that writes a static JSON matching `DATA_CONTRACT.md`, served by nginx —
   mirroring how the Hermes frontend already polls its API. No write paths.
2. **Point `data.jsx` at it.** Replace the literal with a `fetch()` + poll on
   `meta.pollSeconds`; lift into React state. Keep the exact shapes.
3. **Field adapters** per source: Synology DSM (volumes/SMART), Technitium
   stats, Portainer/Docker, Twingate connector status, Hue Bridge, a cert-expiry
   scan, and the Hermes `/api/status` rename adapter (already shape-aligned).
4. **Freshness + error states.** Wire `meta.connected`/`lastSync` to the real
   poll result and render `down`/stale states when a feed is missing.
5. **Self-host fonts (optional).** Drop Cormorant Garamond, Hanken Grotesk, and
   JetBrains Mono `.woff2` into a `fonts/` folder and swap the Google Fonts
   `<link>` for `@font-face` for a fully offline console.

Boundaries to keep: no backend mutations, no auth in the frontend, no secrets,
no deployment/router/firewall/DNS/Twingate changes.
