# RUNBOOK.md — Hermes Dashboard Operations

## Quick Reference

| Component | Check | Command |
|-----------|-------|---------|
| API backend active | systemctl | `systemctl is-active hermes-dashboard.service` |
| Proxy active | systemctl | `systemctl is-active hermes-dashboard-proxy.service` |
| Port 9119 listening | ss | `ss -tlnp \| grep 9119` |
| Port 9120 listening | ss | `ss -tlnp \| grep 9120` |
| Root page returns 200 | curl | `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:9120/` |
| API returns 200 | curl | `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:9120/api/status` |
| CSS Content-Type | curl | `curl -s -o /dev/null -w '%{content_type}' http://127.0.0.1:9120/assets/pantheon.css` |
| JS Content-Type | curl | `curl -s -o /dev/null -w '%{content_type}' http://127.0.0.1:9120/assets/dashboard.js` |
| Nginx config valid | nginx | `nginx -t -c /etc/nginx/hermes-dashboard-proxy.conf` |
| Full service status | systemctl | `systemctl status hermes-dashboard.service hermes-dashboard-proxy.service` |
| View logs (API) | journalctl | `journalctl -u hermes-dashboard.service -n 50` |
| View logs (proxy) | journalctl | `journalctl -u hermes-dashboard-proxy.service -n 50` |
| Git status | git | `cd /opt/hermes-dashboard-custom && git status --short` |
| Prepare deploy via GitHub | PR | Push a feature branch and open a PR; merge to main only with operator approval |

## Common Tasks

### Prepare latest UI changes via PR

Default path: branch + PR first. Do not push directly to main unless the
operator explicitly approves a direct deploy.

```bash
cd /opt/hermes-dashboard-custom
git switch -c feat/<short-description> origin/main
git status --short
git add -- <exact-file-1> <exact-file-2>
git diff --cached --stat
git diff --cached --name-status
git commit -m "feat: <describe change>"
git push -u origin feat/<short-description>
```

Open a PR and review the diff before merge.

Merging to main triggers GitHub Actions:

1. rsync to /opt/hermes-dashboard-custom/
2. nginx -t -c /etc/nginx/hermes-dashboard-proxy.conf
3. restart hermes-dashboard-proxy.service
4. verify / and /api/status

Operational impact after merge to main: brief proxy restart.

### Manual deploy (if GitHub Actions is unavailable)

Requires operator approval. Must NOT be done by the Pantheon agent without consent:

```bash
# On VPS as deploy user:
git -C /opt/hermes-dashboard-custom pull origin main
sudo nginx -t -c /etc/nginx/hermes-dashboard-proxy.conf
sudo systemctl restart hermes-dashboard-proxy.service
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:9120/
```

**Operational impact**: Proxy restart required.

### View live dashboard API

```bash
curl -s http://127.0.0.1:9119/api/status | jq .
```

### Check if Twingate provides access

Dashboard is at `hermes-dashboard.tingzel.lan:9120` — accessible only through Twingate.
If you can SSH to the VPS but not reach the dashboard, check Twingate connectivity.

## Troubleshooting

### Symptom: HTTP 502 Bad Gateway from proxy

1. Check API backend: `systemctl is-active hermes-dashboard.service`
2. Check API port: `ss -tlnp | grep 9119`
3. Restart API: `systemctl restart hermes-dashboard.service` (requires approval)
4. Wait 5s, then retry: `curl http://127.0.0.1:9120/api/status`
5. If still 502, check API logs: `journalctl -u hermes-dashboard.service -n 100`

### Symptom: CSS/JS loads but looks unstyled or doesn't execute

1. Check Content-Type:
   ```bash
   curl -sI http://127.0.0.1:9120/assets/pantheon.css
   curl -sI http://127.0.0.1:9120/assets/dashboard.js
   ```
2. Expected: `text/css` and `application/javascript`
3. If `text/plain` or missing: verify `include /etc/nginx/mime.types;` in proxy config
4. Fix requires proxy config edit + `nginx -t` + `systemctl restart hermes-dashboard-proxy.service`

### Symptom: Plain text instead of rendered HTML

1. Check if `index.html` exists: `ls -la /opt/hermes-dashboard-custom/public/index.html`
2. Check nginx root directive matches actual path
3. Check nginx config: `nginx -t -c /etc/nginx/hermes-dashboard-proxy.conf`

### Symptom: WebSocket (/ws) not connecting

1. Check proxy upgrade headers in config (`Upgrade`, `Connection`)
2. Check `map $http_upgrade $connection_upgrade` block exists
3. Check API logs for WS-related errors
4. Verify `proxy_buffering off;` is set on `/ws` location

### Symptom: nginx.service is failed

**This is expected and correct.** Traefik occupies ports 80/443. Do NOT enable nginx.service.
The dashboard runs via the dedicated `hermes-dashboard-proxy.service` on 127.0.0.1:9120.
If Traefik config changes, nginx.service failure may change — only address if operator requests.

### Symptom: Deploy workflow fails in GitHub Actions

1. Check Actions log on GitHub
2. Common causes:
   - SSH key mismatch: verify `VPS_SSH_KEY` secret matches deploy user's authorized_keys
   - Sudo policy changed: verify deploy user has nginx -t + systemctl rights
   - Config syntax error: `nginx -t -c /etc/nginx/hermes-dashboard-proxy.conf` on VPS
3. After fix: re-run workflow from GitHub UI

## Rollback

### Rollback UI to previous version

```bash
cd /opt/hermes-dashboard-custom
# Find last known-good commit
git log --oneline -10
# Revert to specific commit (destructive — requires approval)
git revert <bad_commit_sha>
# Or reset to known good (destructive — requires approval)
# git reset --hard <good_sha>
# Open PR. Merge to main only with operator approval; merge triggers deploy.
git push -u origin fix/rollback-<short-description>
```

Direct push to main is an operator-approved emergency/direct deploy path only.
It triggers GitHub Actions and restarts hermes-dashboard-proxy.service.

### Rollback using backup

```bash
# Backup exists at:
ls -la /opt/hermes-dashboard-custom/public.bak.20260528213835/
# To restore (requires approval):
# cp -a /opt/hermes-dashboard-custom/public.bak.*/public/* /opt/hermes-dashboard-custom/public/
# Then restart proxy:
# sudo systemctl restart hermes-dashboard-proxy.service
```

## Monitoring

### Quick health check

```bash
systemctl is-active hermes-dashboard.service && \
systemctl is-active hermes-dashboard-proxy.service && \
curl -s -o /dev/null -w 'root:%{http_code} api:%{http_code}' \
  http://127.0.0.1:9120/ \
  http://127.0.0.1:9120/api/status && echo ""
```

### Expected healthy output

```
active
active
root:200 api:200
```
