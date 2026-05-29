# ARCHITECTURE.md — Hermes Dashboard

## Overview

Hermes Dashboard is a standalone web UI backed by the Hermes gateway.
It consists of three layers: a static frontend, a live API backend, and an nginx reverse
proxy that binds them together under `hermes-dashboard.tingzel.lan:9120`.

```
Browser/client
    |
    |  HTTPS via Twingate (hermes-dashboard.tingzel.lan:9120)
    v
hermes-dashboard-proxy.service (nginx, 127.0.0.1:9120)
    |
    |  Serves static files from /opt/hermes-dashboard-custom/public/
    |  /assets/    → static assets with cache headers (expires 1h)
    |  /api/       → proxy_pass http://127.0.0.1:9119
    |  /ws         → WebSocket proxy_pass http://127.0.0.1:9119 (Upgrade/Connection headers)
    |  /           → try_files $uri $uri/ /index.html (SPA fallback)
    v
hermes-dashboard.service (Hermes gateway, 127.0.0.1:9119)
    |
    |  Runs: hermes dashboard --host 127.0.0.1 --port 9119 --no-open --tui
    |  Wired after tailscaled.service (Twingate for remote access)
    v
Hermes gateway / TUI
```

## Layer Breakdown

### 1. Dashboard Frontend (Static UI)

- **Location**: `/opt/hermes-dashboard-custom/public/`
- **Repo**: `github.com/Gustafssoon/hermes-dashboard-ui`
- **Branch**: `main` (stable), `feat/integrate-pantheon-ui` (design system integration)
- **Files**:
  - `index.html` — entry point SPA shell
  - `assets/dashboard.js` — application logic
  - `assets/pantheon.css` — design-system CSS (Pantheon)
  - `assets/favicon.svg` — icon
- **Design system**: `design-system/` directory
- **Deployment**: GitHub Actions rsync to VPS as `deploy` user

### 2. Dashboard API / Backend

- **Service**: `hermes-dashboard.service`
- **ExecStart**: `/root/.local/bin/hermes dashboard --host 127.0.0.1 --port 9119 --no-open --tui`
- **Port**: 127.0.0.1:9119 (not exposed directly to network)
- **Dependency**: `tailscaled.service`, `network-online.target`
- **Restart policy**: `Restart=on-failure`, `RestartSec=5`

### 3. Nginx / Dashboard Proxy

- **Service**: `hermes-dashboard-proxy.service`
- **ExecStart**: `nginx -c /etc/nginx/hermes-dashboard-proxy.conf -g daemon off;`
- **Port**: 127.0.0.1:9120
- **Config**: `/etc/nginx/hermes-dashboard-proxy.conf`
- **root**: `/opt/hermes-dashboard-custom/public`
- **Proxy routes**:
  - `/api/` — `proxy_pass http://127.0.0.1:9119` (+ Host, X-Forwarded-*)
  - `/ws`    — WebSocket upgrade to 127.0.0.1:9119
  - `/assets/` — static with `Cache-Control: public, must-revalidate`, `expires 1h`
  - `/` — SPA fallback via `try_files $uri $uri/ /index.html`
- **Key**: `include /etc/nginx/mime.types` ensures correct Content-Type for CSS/JS

### 4. Systemd Services

| Unit | State | Purpose |
|------|-------|---------|
| `hermes-dashboard.service` | active/running | Hermes Web Dashboard (API port 9119) |
| `hermes-dashboard-proxy.service` | active/running | nginx reverse proxy (port 9120) |
| `hermes-dashboard-ui.service` | **not used/does not exist** | Legacy — ignore |
| `nginx.service` | disabled + failed | Normal — Traefik occupies 80/443. Do NOT enable. |

**Service ordering**: `hermes-dashboard-proxy.service` has `After=network-online.target
hermes-dashboard.service` + `Requires=hermes-dashboard.service`, meaning it only starts
when the API is up.

### 5. GitHub Actions / Deploy Pipeline

- **Workflow**: `.github/workflows/deploy.yml`
- **Trigger**: push to `main`
- **Mechanism**:
  1. Checkout repo
  2. Setup SSH with deploy user key
  3. `rsync` project to `/opt/hermes-dashboard-custom/` on VPS (excludes .git, .github, node_modules)
  4. Run `nginx -t -c /etc/nginx/hermes-dashboard-proxy.conf` on VPS via sudo
  5. `systemctl restart hermes-dashboard-proxy.service` + `is-active` check
  6. Verify: `curl http://127.0.0.1:9120/` (200) and `curl http://127.0.0.1:9120/api/status` (200)
- **Deploy user** (`deploy`) has passwordless sudo for exactly:
  - `/usr/sbin/nginx -t -c /etc/nginx/hermes-dashboard-proxy.conf`
  - `/usr/bin/systemctl restart hermes-dashboard-proxy.service`
  - `/usr/bin/systemctl is-active hermes-dashboard-proxy.service`
  - `/usr/bin/systemctl status hermes-dashboard-proxy.service`
- **Secrets required**: `VPS_HOST`, `VPS_USER`, `VPS_PORT`, `VPS_SSH_KEY`

### 6. Documentation

Located in `/opt/hermes-dashboard-custom/docs/`:

| File | Purpose |
|------|---------|
| `AGENT.md` | Pantheon agent responsibilities and boundaries |
| `ARCHITECTURE.md` | This file — system architecture |
| `RUNBOOK.md` | Operational procedures and troubleshooting |
| `CHANGELOG.md` | Version history of dashboard changes |

## Network Access

- `hermes-dashboard.tingzel.lan:9120` — accessible via **Twingate only** (Hermes Admins group)
- No router port forwarding for port 9120
- Traefik handles 80/443 on the VPS for other services
- Twingate SSH routing on port 22 for NAS access via `nas.tingzel.lan`
- The dashboard proxy is intentionally on 127.0.0.1:9120 so only Twingate routes to it

## Security Notes

- Dashboard is Hermes Admins only via Twingate — public internet cannot reach it
- `deploy` user has minimal sudo (nginx -t + systemctl for one unit only)
- No SSH keys, tokens, or API keys are stored in the repo
- Content-Type headers are now correct thanks to `include /etc/nginx/mime.types`
