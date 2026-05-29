# CHANGELOG.md — Hermes Dashboard

## Unreleased (working tree)

- Added Pantheon design system CSS (`assets/pantheon.css`, 19 892 bytes)
- Updated `assets/dashboard.js` (34 722 bytes)
- Updated `public/index.html` (7 982 bytes)
- Removed deprecated `assets/dashboard.css` (replaced by pantheon.css)
- Added `design-system/` integration directory
- Updated `deploy/deploy.sh`
- Added Pantheon agent documentation: `docs/AGENT.md`, `docs/ARCHITECTURE.md`, `docs/RUNBOOK.md`, `docs/CHANGELOG.md`

## [1.0.0] — 2026-05-27

- **Deploy: least-privilege deploy user**
  - GitHub Actions uses `deploy` user instead of `root`
  - Passwordless sudo scoped to: `nginx -t`, `systemctl restart|is-active|status hermes-dashboard-proxy.service`
  - No root SSH access from CI/CD

- **Initial commit: standalone Hermes Dashboard UI**
  - Static HTML/CSS/JS frontend at `/opt/hermes-dashboard-custom/public/`
  - Nginx reverse proxy on 127.0.0.1:9120 (`hermes-dashboard-proxy.service`)
  - Proxies `/api/` and `/ws` to Hermes dashboard backend on 127.0.0.1:9119
  - Hermes dashboard backend service (`hermes-dashboard.service`)
  - `include /etc/nginx/mime.types` fix — correct Content-Type for CSS/JS
  - GitHub Actions deploy workflow: rsync → configtest → restart → verify
