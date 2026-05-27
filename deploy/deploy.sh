#!/usr/bin/env bash
# ============================================================
# Deploy script for Hermes Dashboard UI
# Called by GitHub Actions after rsync, or run locally.
# ============================================================
set -euo pipefail

DEPLOY_DIR="/opt/hermes-dashboard-custom"
SYSTEMD_UNIT_SRC="${DEPLOY_DIR}/deploy/systemd/hermes-dashboard-ui.service"
SYSTEMD_UNIT_DST="/etc/systemd/system/hermes-dashboard-ui.service"
NGINX_CONF_SRC="${DEPLOY_DIR}/deploy/nginx-hermes-dashboard-ui.conf"

echo "=== Hermes Dashboard UI Deploy ==="
echo "Deploy dir: ${DEPLOY_DIR}"

# --- Verify static files exist ---
if [ ! -f "${DEPLOY_DIR}/public/index.html" ]; then
    echo "ERROR: public/index.html not found"
    exit 1
fi

# --- Verify nginx config syntax ---
echo "Checking nginx config..."
/usr/sbin/nginx -t -c "${NGINX_CONF_SRC}"

# --- Install systemd unit ---
echo "Installing systemd unit..."
cp "${SYSTEMD_UNIT_SRC}" "${SYSTEMD_UNIT_DST}"

# --- Reload systemd ---
echo "Reloading systemd daemon..."
systemctl daemon-reload

# --- Restart the UI proxy ---
echo "Restarting hermes-dashboard-ui.service..."
systemctl restart hermes-dashboard-ui.service
sleep 1

# --- Verify ---
if systemctl is-active --quiet hermes-dashboard-ui.service; then
    echo "OK: hermes-dashboard-ui.service is active"
else
    echo "ERROR: hermes-dashboard-ui.service failed to start"
    journalctl -u hermes-dashboard-ui.service --no-pager -n 20
    exit 1
fi

# --- Verify old proxy is disabled ---
if systemctl is-enabled --quiet hermes-dashboard-proxy.service 2>/dev/null; then
    echo "NOTE: hermes-dashboard-proxy.service is still enabled. Disable it with:"
    echo "  systemctl disable --now hermes-dashboard-proxy.service"
fi

# --- Health check ---
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:9120/)
if [ "${HTTP_CODE}" = "200" ]; then
    echo "OK: HTTP 200 on 127.0.0.1:9120"
else
    echo "WARN: HTTP ${HTTP_CODE} on 127.0.0.1:9120"
fi

echo "=== Deploy complete ==="
