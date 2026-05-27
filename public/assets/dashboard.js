/**
 * Hermes Dashboard UI - Client
 *
 * This dashboard is served by the nginx proxy at :9120.
 * It talks directly to the Hermes API at the same origin
 * (nginx proxies /api/* to 127.0.0.1:9119).
 *
 * API base is always the same origin as this page.
 */

(() => {
  "use strict";

  // --- Config ---
  const API = ""; // same origin; nginx proxies /api/* to Hermes

  // --- DOM refs ---
  const $ = (id) => document.getElementById(id);
  const statusDot = $("status-indicator");
  const statusText = $("status-text");
  const versionEl = $("version");
  const rawJson = $("raw-json");

  // --- Helpers ---
  function setText(id, value) {
    const el = $(id);
    if (el) el.textContent = value ?? "--";
  }

  function setGatewayBadge(state) {
    const el = $("val-gateway");
    if (!el) return;
    const map = {
      running: { text: "RUNNING", cls: "badge-ok" },
      stopped: { text: "STOPPED", cls: "badge-warn" },
      error: { text: "ERROR", cls: "badge-err" },
    };
    const m = map[state] || { text: (state || "UNKNOWN").toUpperCase(), cls: "badge-warn" };
    el.innerHTML = `<span class="badge ${m.cls}">${m.text}</span>`;
  }

  function setConnectionStatus(ok, msg) {
    statusDot.className = "status-dot " + (ok ? "dot-ok" : "dot-err");
    statusText.textContent = msg || (ok ? "Connected" : "Disconnected");
  }

  // --- API calls ---
  async function fetchStatus() {
    const res = await fetch(API + "/api/status");
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
  }

  async function fetchSessions() {
    const res = await fetch(API + "/api/sessions");
    if (res.status === 401) return { detail: "Unauthorized" };
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
  }

  async function fetchThemes() {
    const res = await fetch(API + "/api/dashboard/themes");
    if (res.status === 401) return { detail: "Unauthorized" };
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
  }

  async function fetchPlugins() {
    const res = await fetch(API + "/api/dashboard/plugins");
    if (res.status === 401) return { detail: "Unauthorized" };
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
  }

  async function setTheme(name) {
    const res = await fetch(API + "/api/dashboard/theme", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    return res.json();
  }

  // --- Renderers ---
  function renderStatus(data) {
    setText("val-version", data.version);
    setText("val-release", data.release_date);
    setText("val-sessions", data.active_sessions);
    setText("val-auth", data.auth_required ? "Yes" : "No");
    setText("val-config", data.config_version);
    setGatewayBadge(data.gateway_state);
    versionEl.textContent = "v" + (data.version || "?");
    rawJson.textContent = JSON.stringify(data, null, 2);
  }

  function renderSessions(data) {
    const container = $("sessions-list");
    if (!container) return;
    if (data.detail === "Unauthorized") {
      container.innerHTML = '<p class="empty">Authentication required</p>';
      return;
    }
    if (!data.sessions || data.sessions.length === 0) {
      container.innerHTML = '<p class="empty">No active sessions</p>';
      return;
    }
    container.innerHTML = data.sessions
      .map(
        (s) => `
      <div class="session-item">
        <span class="session-title">${escHtml(s.title || s.session_key || "Untitled")}</span>
        <span class="session-meta">${escHtml(s.updated_at || "")}</span>
      </div>`
      )
      .join("");
  }

  function renderThemes(data) {
    const container = $("theme-selector");
    if (!container) return;
    if (data.detail === "Unauthorized") {
      container.innerHTML = '<p class="empty">Authentication required</p>';
      return;
    }
    if (!data.themes || data.themes.length === 0) {
      container.innerHTML = '<p class="empty">No themes available</p>';
      return;
    }
    container.innerHTML = data.themes
      .map(
        (t) => `
      <button class="theme-btn ${t.name === data.active ? "active" : ""}"
              data-theme="${escHtml(t.name)}"
              title="${escHtml(t.description || "")}">
        ${escHtml(t.label || t.name)}
      </button>`
      )
      .join("");
    container.querySelectorAll(".theme-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        setTheme(btn.dataset.theme).then(() => {
          container.querySelectorAll(".theme-btn").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
        });
      });
    });
  }

  function renderPlugins(data) {
    const container = $("plugins-list");
    if (!container) return;
    if (data.detail === "Unauthorized") {
      container.innerHTML = '<p class="empty">Authentication required</p>';
      return;
    }
    if (!data || data.length === 0) {
      container.innerHTML = '<p class="empty">No plugins loaded</p>';
      return;
    }
    if (Array.isArray(data)) {
      container.innerHTML = data
        .map(
          (p) => `
        <div class="plugin-item">
          <span class="plugin-name">${escHtml(p.name || "?")}</span>
          <span class="plugin-desc">${escHtml(p.description || "")}</span>
        </div>`
        )
        .join("");
    } else {
      container.innerHTML = '<p class="empty">No plugins loaded</p>';
    }
  }

  function escHtml(str) {
    const d = document.createElement("div");
    d.textContent = str || "";
    return d.innerHTML;
  }

  // --- Main ---
  async function refresh() {
    try {
      const [status, sessions, themes, plugins] = await Promise.allSettled([
        fetchStatus(),
        fetchSessions(),
        fetchThemes(),
        fetchPlugins(),
      ]);

      if (status.status === "fulfilled") {
        renderStatus(status.value);
        setConnectionStatus(true, "Connected");
      } else {
        setConnectionStatus(false, "API error");
      }

      if (sessions.status === "fulfilled") renderSessions(sessions.value);
      if (themes.status === "fulfilled") renderThemes(themes.value);
      if (plugins.status === "fulfilled") renderPlugins(plugins.value);
    } catch (err) {
      console.error("Dashboard refresh failed:", err);
      setConnectionStatus(false, "Connection failed");
    }
  }

  // Initial + interval
  refresh();
  setInterval(refresh, 10000); // refresh every 10s
})();
