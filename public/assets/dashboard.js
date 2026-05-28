/**
 * Tingzel Pantheon — Operations Console
 *
 * Served by nginx proxy at :9120.
 * API calls to /api/* are proxied to 127.0.0.1:9119.
 *
 * All data is read-only. No state changes are made to backend services.
 */

(() => {
  "use strict";

  // --- Config ---
  const API = ""; // same origin; nginx proxies /api/*
  let currentSection = "athena";

  // --- DOM refs ---
  const $ = (id) => document.getElementById(id);
  const contentEl = $("content");
  const topbarEyebrow = $("topbar-eyebrow");
  const topbarTitle = $("topbar-title");
  const connDot = $("conn-dot");
  const connText = $("conn-text");
  const connVersion = $("conn-version");
  const syncText = $("sync-text");
  const incidentOverlay = $("incident-overlay");
  const incidentStepsEl = $("incident-steps");
  const navAttentionDot = $("nav-attention-dot");

  // --- Escaper ---
  function esc(str) {
    const d = document.createElement("div");
    d.textContent = str || "";
    return d.innerHTML;
  }

  // --- Mock data (read-only, matches DATA_CONTRACT.md) ---
  const MOCK = {
    meta: { operator: "tingzel", portal: "Tingzel Pantheon", build: "0.2.0", lastSync: "12s ago", pollSeconds: 60, connected: true },
    overview: { nominal: 5, attention: 1, down: 0, headline: "1 service needs attention", note: "Portainer reports the media stack restarting. Storage on volume1 is at 68% and one restore drill is overdue — everything else is nominal." },
    services: [
      { id: "nas", name: "Synology DSM", kind: "NAS", icon: "nas", state: "nominal", detail: "DS225 \u00b7 DSM \u00b7 41\u00b0C", checked: "3m ago", host: "nas.tingzel.lan:5001" },
      { id: "dns", name: "Technitium", kind: "DNS", icon: "dns", state: "nominal", detail: "412 q/min \u00b7 73% cache hit \u00b7 4 ms", checked: "2m ago", host: "ns1.tingzel.lan:5380" },
      { id: "portainer", name: "Portainer", kind: "Containers", icon: "portainer", state: "attention", detail: "5 stacks \u00b7 1 container restarting", checked: "1m ago", host: "portainer.tingzel.lan:9000" },
      { id: "twingate", name: "Twingate", kind: "Access", icon: "twingate", state: "nominal", detail: "Connector tingzel-lan-connector-01 connected \u00b7 1 device", checked: "1m ago", host: "tingzel.twingate.com" },
      { id: "hermes", name: "Hermes Dashboard", kind: "Agent", icon: "hermes", state: "nominal", detail: "v2.4.1 \u00b7 2 sessions \u00b7 gateway running", checked: "2m ago", host: "hermes-dashboard.tingzel.lan:9120" },
      { id: "hue", name: "Hue Bridge", kind: "Home", icon: "hue", state: "nominal", detail: "14/14 lights reachable \u00b7 fw 1.65.x", checked: "5m ago", host: "hue.tingzel.lan" },
    ],
    nas: {
      model: "Synology DS225", dsm: "DSM \u00b7 version placeholder", temp: "41\u00b0C", fan: "nominal", uptime: "31d 04h", state: "nominal",
      volumes: [
        { name: "volume1", raid: "SHR-1", used: 68, total: "14.5 TB", smart: "healthy", state: "attention", note: "approaching 80% threshold" },
        { name: "volume2", raid: "Basic", used: 22, total: "3.6 TB", smart: "healthy", state: "nominal", note: "" },
      ],
      disks: [
        { bay: "1", model: "WD Red 8TB", smart: "healthy", temp: "38\u00b0C" },
        { bay: "2", model: "WD Red 8TB", smart: "healthy", temp: "39\u00b0C" },
        { bay: "3", model: "WD Red 8TB", smart: "healthy", temp: "40\u00b0C" },
        { bay: "4", model: "Crucial SSD", smart: "healthy", temp: "35\u00b0C" },
      ],
    },
    dns: {
      service: "running", state: "nominal", uptime: "31d 04h", queriesPerMin: 412, blockedPct: 18.4, cacheHitPct: 73.1, avgLatencyMs: 4,
      upstreams: [
        { name: "Cloudflare", addr: "1.1.1.1", proto: "DoH", latency: "9 ms", state: "nominal" },
        { name: "Quad9", addr: "9.9.9.9", proto: "DoT", latency: "14 ms", state: "nominal" },
      ],
    },
    hermesAgent: { version: "2.4.1", release: "2026-05-12", sessions: 2, gatewayState: "running", configVersion: "17", authRequired: true, state: "nominal" },
    links: [
      { label: "Synology DSM", url: "https://nas.tingzel.lan:5001", group: "Services" },
      { label: "Technitium DNS", url: "http://ns1.tingzel.lan:5380", group: "Services" },
      { label: "Portainer", url: "http://portainer.tingzel.lan:9000", group: "Services" },
      { label: "Hermes Dashboard", url: "https://hermes-dashboard.tingzel.lan:9120", group: "Services" },
      { label: "Hue Bridge", url: "http://hue.tingzel.lan", group: "Services" },
      { label: "Twingate Admin", url: "https://tingzel.twingate.com", group: "Access" },
    ],
    routing: { connector: "tingzel-lan-connector-01", state: "nominal", devices: 1, network: "tingzel.twingate.com", lastHandshake: "1m ago", note: "Remote access flows over Twingate. No ports are exposed publicly." },
    infra: {
      host: { name: "hephaestus", os: "DSM 7.2 \u00b7 Docker 24.0.9", uptime: "31d 04h", cpu: 12, mem: 46, disk: 68 },
      endpoint: { name: "local", state: "nominal", docker: "24.0.9", containers: 14, running: 13 },
      stacks: [
        { name: "hermes", containers: 3, state: "nominal", note: "up 31d" },
        { name: "technitium", containers: 1, state: "nominal", note: "up 31d" },
        { name: "monitoring", containers: 4, state: "nominal", note: "up 12d" },
        { name: "media", containers: 5, state: "attention", note: "1 container restarting (transcoder)" },
        { name: "vaultwarden", containers: 1, state: "nominal", note: "up 31d" },
      ],
    },
    checks: [
      { name: "DNS resolution probe", result: "pass", value: "4 ms", state: "nominal", ago: "2m ago" },
      { name: "Docker daemon ping", result: "pass", value: "alive", state: "nominal", ago: "1m ago" },
      { name: "NAS volume SMART", result: "pass", value: "healthy", state: "nominal", ago: "1h ago" },
      { name: "Disk usage \u00b7 volume1", result: "watch", value: "68%", state: "attention", ago: "12m ago" },
      { name: "Snapshot integrity", result: "pass", value: "verified", state: "nominal", ago: "6h ago" },
      { name: "Twingate handshake", result: "pass", value: "1m ago", state: "nominal", ago: "1m ago" },
    ],
    certificates: [
      { host: "nas.tingzel.lan", issuer: "Synology", days: 12, state: "attention", note: "renew soon" },
      { host: "hermes-dashboard.tingzel.lan", issuer: "Internal CA", days: 41, state: "info", note: "" },
      { host: "portainer.tingzel.lan", issuer: "Internal CA", days: 64, state: "nominal", note: "" },
      { host: "ns1.tingzel.lan", issuer: "Internal CA", days: 88, state: "nominal", note: "" },
    ],
    backups: [
      { name: "Synology Hyper Backup", target: "Backblaze B2", size: "1.21 TB", last: "6h ago", state: "nominal", verified: true },
      { name: "Technitium zones", target: "NAS \u00b7 /backup", size: "8.4 MB", last: "12h ago", state: "nominal", verified: true },
      { name: "Portainer config", target: "NAS \u00b7 /backup", size: "2.1 MB", last: "1d ago", state: "nominal", verified: true },
      { name: "Vaultwarden", target: "Backblaze B2", size: "44 MB", last: "6h ago", state: "nominal", verified: true },
    ],
    restore: { lastDrill: "9d ago", target: "scratch volume2", outcome: "passed", cadence: "weekly", state: "attention", note: "Last restore drill was 9 days ago \u2014 past the weekly cadence. Verify a restore point when convenient." },
    runbooks: [
      { id: "dns", title: "DNS not resolving", epigraph: "Know the path before the message.", steps: ["Check the Technitium service is up (Hephaestus \u2192 technitium stack).", "Confirm upstream forwarders (Cloudflare, Quad9) are reachable.", "Flush the client resolver cache and re-run the Oracle DNS probe."] },
      { id: "stack", title: "A Docker stack won't start", epigraph: "The forge cools when the fuel runs out.", steps: ["Open Portainer \u2192 the stack \u2192 container logs.", "Check disk space on volume1 (Oracle \u2192 disk usage).", "Recreate the stack; watch the failing container come up."] },
      { id: "remote", title: "Can't reach services remotely", epigraph: "The messenger needs an open road.", steps: ["Verify the Twingate connector tingzel-lan-connector-01 is connected.", "Confirm the device has an active Twingate session.", "Fall back to LAN only if on-site."] },
      { id: "nas", title: "NAS volume degraded", epigraph: "Guard the vault first.", steps: ["Read SMART status per disk (Hephaestus \u2192 storage).", "Do not write; verify the latest snapshot is intact (Aegis).", "Plan a rebuild during a quiet window."] },
      { id: "cert", title: "Internal TLS cert expiring", epigraph: "Renew the seal before it breaks.", steps: ["Identify the host nearing expiry (Oracle \u2192 certificates).", "Reissue from the Internal CA or Synology, depending on issuer.", "Re-deploy the cert and confirm the freshness check turns nominal."] },
    ],
    incident: {
      title: "Start here when something is down",
      line: "Work top to bottom. Stop when you find the break.",
      steps: [
        { n: 1, title: "Is the gateway up?", detail: "Twingate connector tingzel-lan-connector-01 \u2014 without it, nothing is reachable remotely.", service: "twingate" },
        { n: 2, title: "Can DNS resolve?", detail: "Technitium \u2014 most 'everything is down' reports are really DNS.", service: "dns" },
        { n: 3, title: "Is the NAS reachable?", detail: "Synology DSM \u2014 storage backs most stacks. Check before restarting things.", service: "nas" },
        { n: 4, title: "Docker daemon + stacks", detail: "Portainer \u2014 confirm the daemon is alive, then the failing stack.", service: "portainer" },
        { n: 5, title: "Power / Hue canary", detail: "Hue Bridge is a cheap power/network canary for the rack's circuit.", service: "hue" },
      ],
    },
    themes: [],
    plugins: [],
    apiStatus: null,
    apiSessions: null,
  };

  let sectionData = { ...MOCK };

  // --- Helpers ---
  function stateClass(s) {
    const m = { nominal: "s-nominal", attention: "s-attention", degraded: "s-degraded", down: "s-down", info: "s-info", idle: "s-idle", running: "s-running", stopped: "s-stopped", error: "s-error" };
    return m[s] || "s-idle";
  }
  function badgeClass(s) {
    const m = { nominal: "b-nominal", attention: "b-attention", degraded: "b-degraded", down: "b-down", info: "b-info", idle: "b-idle" };
    return m[s] || "b-idle";
  }
  function badgeLabel(s) { return (s || "idle").charAt(0).toUpperCase() + (s || "idle").slice(1); }

  function dotHTML(state, pulse) {
    return '<span class="status-dot ' + stateClass(state) + (pulse ? " pulse" : "") + '"></span>';
  }
  function badgeHTML(state, label) {
    return '<span class="badge ' + badgeClass(state) + '">' + dotHTML(state) + esc(label || badgeLabel(state)) + '</span>';
  }

  // Inline SVG icons
  const ICO = {
    nas:       '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="22" x2="2" y1="12" y2="12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" x2="6.01" y1="16" y2="16"/><line x1="10" x2="10.01" y1="16" y2="16"/></svg>',
    dns:       '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>',
    portainer: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"/><path d="m7 16.5 5-3"/><path d="M7 16.5v5.17"/><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"/><path d="M17 16.5 12 13.5"/><path d="m17 16.5 4.74-2.85"/><path d="M17 16.5v5.17"/><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z"/><path d="M12 8 7.26 5.15"/><path d="m12 8 4.74-2.85"/><path d="M12 13.5V8"/></svg>',
    twingate:  '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg>',
    hermes:    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg>',
    hue:       '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
  };

  function svcRow(svc) {
    return '<div class="row"><span class="row-ic">' + (ICO[svc.icon] || "") + '</span><div class="row-main"><div class="row-name">' + esc(svc.name) + '<span class="row-kind">' + esc(svc.kind) + '</span></div><div class="row-detail">' + esc(svc.detail) + '</div></div><div class="row-right">' + badgeHTML(svc.state) + '<span class="row-checked">' + esc(svc.checked) + '</span></div></div>';
  }
  function checkRow(c) {
    return '<div class="row">' + dotHTML(c.state) + '<div class="row-main"><div class="row-name" style="font-size:14px">' + esc(c.name) + '</div><div class="row-detail">result \u00b7 ' + esc(c.result) + '</div></div><div class="row-right"><span style="font-family:var(--font-mono);font-size:15px;color:var(--fg1)">' + esc(c.value) + '</span><span class="row-checked">' + esc(c.ago) + '</span></div></div>';
  }
  function linkRow(l) {
    return '<a class="linkrow" href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer"><span class="row-ic" style="width:30px;height:30px"><svg class="icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg></span><div style="min-width:0;flex:1"><div class="linkrow-label">' + esc(l.label) + '</div><div class="linkrow-url">' + esc(l.url) + '</div></div><svg class="icon" width="16" height="16" style="color:var(--fg3);flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></a>';
  }
  function cardHTML(title, count, body, iconSvg) {
    return '<section class="card"><div class="card-head">' + (iconSvg ? '<span class="ci">' + iconSvg + '</span>' : "") + esc(title) + (count != null ? '<span class="count">' + esc(String(count)) + '</span>' : "") + '</div>' + body + '</section>';
  }
  function kvHTML(k, v) {
    return '<div class="kv"><div class="k">' + esc(k) + '</div><div class="v">' + esc(String(v)) + '</div></div>';
  }
  function meterHTML(val, tone) {
    const t = tone || (val >= 80 ? "warn" : val >= 60 ? "" : "ok");
    return '<div class="meter ' + t + '"><i style="width:' + Math.min(100, val) + '%"></i></div>';
  }

  // --- Section renderers ---
  function renderAthena() {
    const o = sectionData.overview;
    const needs = sectionData.services.filter(s => s.state !== "nominal");
    let h = '<div class="stack">';

    // Hero
    h += '<div class="hero"><div class="hero-mark">\u0391</div><div class="hero-body"><div class="hero-state">' + esc(o.headline) + '</div><div class="hero-note">' + esc(o.note) + '</div></div><div class="hero-stats">';
    [{ l: "Nominal", v: o.nominal, g: false }, { l: "Attention", v: o.attention, g: true }, { l: "Down", v: o.down, g: false }].forEach(s => {
      h += '<div class="hero-stat"><div class="num' + (s.g ? " gold" : "") + '">' + s.v + '</div><div class="lab">' + s.l + '</div></div>';
    });
    h += '</div></div>';

    // Two-col
    h += '<div class="grid-2">';
    let needsBody = needs.length === 0 ? '<p class="row-detail" style="padding:6px 4px">All clear. Nothing requires action.</p>' : needs.map(s => svcRow(s)).join("");
    needsBody += '<div style="padding-top:14px"><button class="btn" id="enter-incident-btn"><svg class="icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg> Enter incident mode</button></div>';
    h += cardHTML("Needs attention", needs.length, needsBody);
    h += cardHTML("Latest signals", sectionData.checks.length, sectionData.checks.slice(0, 5).map(c => checkRow(c)).join(""));
    h += '</div>';

    // All services
    h += cardHTML("All services", sectionData.services.length + " monitored", sectionData.services.map(s => svcRow(s)).join(""));

    // API status
    if (sectionData.apiStatus) {
      const st = sectionData.apiStatus;
      h += cardHTML("Hermes API", "v" + esc(st.version || "?"), '<div class="kv-grid">' + kvHTML("Version", st.version) + kvHTML("Release", st.release_date) + kvHTML("Active sessions", st.active_sessions) + kvHTML("Auth required", st.auth_required ? "Yes" : "No") + kvHTML("Config version", st.config_version) + "</div>");
    }

    // Sessions
    if (sectionData.apiSessions && sectionData.apiSessions.sessions) {
      const sess = sectionData.apiSessions.sessions;
      let sb = sess.length === 0 ? '<div class="empty">No active sessions</div>' : sess.map(s => '<div class="session-item"><span class="session-title">' + esc(s.title || s.session_key || "Untitled") + '</span><span class="session-meta">' + esc(s.updated_at || "") + '</span></div>').join("");
      h += cardHTML("Sessions", sess.length, sb);
    }

    // Plugins
    if (sectionData.plugins && sectionData.plugins.length > 0) {
      h += cardHTML("Dashboard Plugins", sectionData.plugins.length, sectionData.plugins.map(p => '<div class="plugin-item"><span class="plugin-name">' + esc(p.name || "?") + '</span><span class="plugin-desc">' + esc(p.description || "") + '</span></div>').join(""));
    }

    // Raw JSON
    if (sectionData.apiStatus) {
      h += cardHTML("Raw API Response", null, '<pre class="raw-json">' + esc(JSON.stringify(sectionData.apiStatus, null, 2)) + '</pre>');
    }

    h += '</div>';
    return h;
  }

  function renderHermes() {
    const r = sectionData.routing, a = sectionData.hermesAgent;
    const groups = [...new Set(sectionData.links.map(l => l.group))];
    let h = '<div class="stack"><div class="grid-2">';
    let rb = '<div class="kv-grid"><div class="kv"><div class="k">Connector</div><div class="v" style="display:flex;align-items:center;gap:9px">' + dotHTML(r.state, true) + esc(r.connector) + '</div></div>' + kvHTML("Network", r.network) + kvHTML("Devices", r.devices) + kvHTML("Last handshake", r.lastHandshake) + '</div><p class="hero-note" style="margin-top:16px;padding-top:14px;border-top:1px solid var(--divider)">' + esc(r.note) + '</p>';
    h += cardHTML("Remote access", r.connector, rb, ICO.twingate);
    let ab = '<div class="kv-grid"><div class="kv"><div class="k">Gateway</div><div class="v" style="display:flex;align-items:center;gap:9px">' + dotHTML(a.state, true) + esc(a.gatewayState) + '</div></div>' + kvHTML("Sessions", a.sessions) + kvHTML("Config", "v" + a.configVersion) + kvHTML("Auth", a.authRequired ? "required" : "open") + kvHTML("Release", a.release) + '</div>';
    h += cardHTML("Hermes agent", "v" + a.version, ab, ICO.hermes);
    h += '</div>';
    groups.forEach(g => {
      const links = sectionData.links.filter(l => l.group === g);
      h += cardHTML(g, links.length, '<div class="stack" style="gap:10px">' + links.map(l => linkRow(l)).join("") + '</div>', ICO.hermes);
    });
    h += '</div>';
    return h;
  }

  function renderHephaestus() {
    const h = sectionData.infra.host, ep = sectionData.infra.endpoint, nas = sectionData.nas;
    let html = '<div class="stack">';
    let hb = '<div class="kv-grid" style="margin-bottom:4px">' + kvHTML("Platform", h.os) + kvHTML("Uptime", h.uptime) + kvHTML("Containers", ep.running + "/" + ep.containers + " running") + '</div><div class="grid-3" style="margin-top:18px;gap:22px">' + [["CPU", h.cpu], ["Memory", h.mem], ["Disk", h.disk]].map(([lab, val]) => '<div><div style="display:flex;justify-content:space-between;margin-bottom:8px"><span><span class="k">' + lab + '</span></span><span style="font-family:var(--font-mono);font-size:13px;color:var(--fg1)">' + val + '%</span></div>' + meterHTML(val) + '</div>').join("") + '</div>';
    html += cardHTML("Host", h.name, hb);
    let sb = sectionData.infra.stacks.map(s => '<div class="row"><div class="row-ic">' + ICO.portainer + '</div><div class="row-main"><div class="row-name" style="font-family:var(--font-mono);font-size:13.5px">' + esc(s.name) + '</div><div class="row-detail">' + s.containers + ' containers \u00b7 ' + esc(s.note) + '</div></div><div class="row-right">' + badgeHTML(s.state) + '</div></div>').join("");
    html += cardHTML("Stacks", sectionData.infra.stacks.length + " stacks \u00b7 Portainer", sb, ICO.portainer);
    let stor = '<div class="stack" style="gap:16px">';
    nas.volumes.forEach(v => { stor += '<div><div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">' + dotHTML(v.state) + '<span style="font-family:var(--font-mono);font-size:14px;color:var(--fg1)">' + esc(v.name) + '</span><span class="row-kind">' + esc(v.raid) + '</span><span class="row-detail" style="margin:0;margin-left:auto">' + v.used + '% of ' + esc(v.total) + (v.note ? ' \u00b7 ' + esc(v.note) : '') + '</span></div>' + meterHTML(v.used) + '</div>'; });
    stor += '</div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px 18px;margin-top:18px;padding-top:16px;border-top:1px solid var(--divider)">';
    nas.disks.forEach(d => { stor += '<div style="display:flex;align-items:center;gap:9px">' + dotHTML(d.smart === "healthy" ? "nominal" : "attention") + '<span style="font-family:var(--font-mono);font-size:12px;color:var(--fg2)">Bay ' + esc(d.bay) + ' \u00b7 ' + esc(d.model.split(" ")[0]) + ' \u00b7 ' + esc(d.temp) + '</span></div>'; });
    stor += '</div>';
    html += cardHTML("Storage", nas.model + " \u00b7 " + nas.temp, stor, ICO.nas);
    html += '</div>';
    return html;
  }

  function renderOracle() {
    const dns = sectionData.dns;
    let h = '<div class="stack">';
    h += cardHTML("Read-only checks", sectionData.checks.length + " \u00b7 auto " + sectionData.meta.pollSeconds + "s", sectionData.checks.map(c => checkRow(c)).join(""));
    h += '<div class="grid-2">';
    let db = '<div class="kv-grid" style="margin-bottom:16px">' + kvHTML("Queries", dns.queriesPerMin + "/min") + kvHTML("Cache hit", dns.cacheHitPct + "%") + kvHTML("Blocked", dns.blockedPct + "%") + kvHTML("Latency", dns.avgLatencyMs + " ms") + '</div>';
    dns.upstreams.forEach(u => { db += '<div class="row">' + dotHTML(u.state) + '<div class="row-main"><div class="row-name" style="font-size:13.5px">' + esc(u.name) + '<span class="row-kind">' + esc(u.proto) + '</span></div><div class="row-detail">' + esc(u.addr) + '</div></div><div class="row-right"><span style="font-family:var(--font-mono);font-size:14px;color:var(--fg1)">' + esc(u.latency) + '</span></div></div>'; });
    h += cardHTML("DNS resolution", dns.service, db, ICO.dns);
    let cb = '';
    sectionData.certificates.forEach(c => { cb += '<div class="row">' + dotHTML(c.state) + '<div class="row-main"><div class="row-name" style="font-size:13.5px;font-family:var(--font-mono)">' + esc(c.host) + '</div><div class="row-detail">' + esc(c.issuer) + (c.note ? ' \u00b7 ' + esc(c.note) : '') + '</div></div><div class="row-right"><span style="font-family:var(--font-mono);font-size:15px;color:var(--fg1)">' + c.days + 'd</span><span class="row-checked">until expiry</span></div></div>'; });
    h += cardHTML("TLS certificates", sectionData.certificates.length + " internal", cb);
    h += '</div>';
    h += '<p class="hero-note" style="padding-left:4px">The Oracle only observes. Every check here is a read-only probe \u2014 it never changes state on the services it watches.</p>';
    h += '</div>';
    return h;
  }

  function renderAegis() {
    const verified = sectionData.backups.filter(b => b.verified).length, r = sectionData.restore;
    let h = '<div class="stack">';
    h += '<div class="hero"><div class="hero-mark"><svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg></div><div class="hero-body"><div class="hero-state">' + verified + ' of ' + sectionData.backups.length + ' backups verified</div><div class="hero-note">' + esc(r.note) + '</div></div></div>';
    let bb = '';
    sectionData.backups.forEach(b => { bb += '<div class="row"><div class="row-ic">' + (b.verified ? '<svg class="icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' : '<svg class="icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>') + '</div><div class="row-main"><div class="row-name" style="font-size:14px">' + esc(b.name) + '</div><div class="row-detail">' + esc(b.target) + ' \u00b7 ' + esc(b.size) + '</div></div><div class="row-right">' + badgeHTML(b.state, b.verified ? "verified" : "overdue") + '<span class="row-checked">last ' + esc(b.last) + '</span></div></div>'; });
    h += cardHTML("Backup jobs", sectionData.backups.length, bb);
    h += cardHTML("Restore verification", r.cadence, '<div class="kv-grid"><div class="kv"><div class="k">Last drill</div><div class="v" style="display:flex;align-items:center;gap:9px">' + dotHTML(r.state, true) + esc(r.lastDrill) + '</div></div>' + kvHTML("Outcome", r.outcome) + kvHTML("Target", r.target) + kvHTML("Cadence", r.cadence) + '</div>');
    h += '</div>';
    return h;
  }

  function renderScrolls() {
    let h = '<div class="stack">';
    sectionData.runbooks.forEach(rb => {
      h += '<section class="scroll-card card" data-runbook="' + esc(rb.id) + '"><div style="display:flex;align-items:flex-start;gap:13px"><div class="row-ic"><svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/></svg></div><div style="flex:1"><div class="row-name" style="font-size:16px;font-family:var(--font-serif);font-weight:600">' + esc(rb.title) + '</div><div class="epigraph">' + esc(rb.epigraph) + '</div></div><span style="color:var(--fg3);transition:transform .16s ease" data-chevron><svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></span></div><div data-steps style="display:none"><ol class="steps" style="margin-top:18px;padding-top:16px;border-top:1px solid var(--divider)">' + rb.steps.map(s => '<li>' + esc(s) + '</li>').join("") + '</ol></div></section>';
    });
    h += '</div>';
    return h;
  }

  // --- Navigation ---
  const SECTION_META = {
    athena:     { deity: "Athena",     fn: "Overview" },
    hermes:     { deity: "Hermes",     fn: "Links & routing" },
    hephaestus: { deity: "Hephaestus", fn: "Infrastructure" },
    oracle:     { deity: "Oracle",     fn: "Checks & signals" },
    aegis:      { deity: "Aegis",      fn: "Backup & protection" },
    scrolls:    { deity: "Scrolls",    fn: "Runbooks" },
  };
  const SECTION_RENDERERS = {
    athena: renderAthena, hermes: renderHermes, hephaestus: renderHephaestus,
    oracle: renderOracle, aegis: renderAegis, scrolls: renderScrolls,
  };

  function navigate(section) {
    currentSection = section;
    const meta = SECTION_META[section];
    topbarEyebrow.textContent = meta.deity + " \u00b7 " + meta.fn;
    topbarTitle.textContent = meta.deity;
    document.querySelectorAll(".nav-item").forEach(btn => btn.classList.toggle("active", btn.dataset.section === section));
    const renderer = SECTION_RENDERERS[section];
    contentEl.innerHTML = renderer ? renderer() : '<div class="stack"><div class="card"><div class="card-head">Coming soon</div></div></div>';
    if (section === "athena") { const b = $("enter-incident-btn"); if (b) b.addEventListener("click", openIncident); }
    if (section === "scrolls") { document.querySelectorAll(".scroll-card").forEach(card => { card.addEventListener("click", () => { const steps = card.querySelector("[data-steps]"); const ch = card.querySelector("[data-chevron]"); if (steps && ch) { const open = steps.style.display !== "none"; steps.style.display = open ? "none" : "block"; ch.style.transform = open ? "none" : "rotate(90deg)"; } }); }); }
  }

  // --- Incident mode ---
  function openIncident() {
    const inc = sectionData.incident;
    $("incident-title").textContent = inc.title;
    $("incident-line").textContent = inc.line;
    const byId = {};
    sectionData.services.forEach(s => { byId[s.id] = s; });
    incidentStepsEl.innerHTML = inc.steps.map(st => {
      const svc = byId[st.service];
      return '<button class="istep" data-jump="' + esc(st.service) + '"><span class="istep-n">' + st.n + '</span><span class="istep-ic">' + (ICO[st.icon] || "") + '</span><span class="istep-body"><span class="istep-title">' + esc(st.title) + (svc ? badgeHTML(svc.state) : "") + '</span><span class="istep-detail">' + esc(st.detail) + '</span></span><svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="color:var(--fg3)"><path d="m9 18 6-6-6-6"/></svg></button>';
    }).join("");
    incidentStepsEl.querySelectorAll(".istep").forEach(btn => { btn.addEventListener("click", () => { const svc = btn.dataset.jump; const map = { twingate: "hermes", dns: "oracle", nas: "hephaestus", portainer: "hephaestus", hue: "athena" }; closeIncident(); navigate(map[svc] || "athena"); }); });
    incidentOverlay.hidden = false;
  }
  function closeIncident() { incidentOverlay.hidden = true; }

  // --- API calls ---
  async function apiGet(path) {
    try {
      const res = await fetch(API + path);
      if (res.status === 401) return { detail: "Unauthorized" };
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    } catch (e) { return null; }
  }

  async function refresh() {
    try {
      const [status, sessions, themes, plugins] = await Promise.allSettled([
        apiGet("/api/status"), apiGet("/api/sessions"), apiGet("/api/dashboard/themes"), apiGet("/api/dashboard/plugins"),
      ]);
      let connected = false;
      if (status.status === "fulfilled" && status.value && !status.value.detail) {
        sectionData.apiStatus = status.value;
        sectionData.hermesAgent.version = status.value.version || sectionData.hermesAgent.version;
        sectionData.hermesAgent.release = status.value.release_date || sectionData.hermesAgent.release;
        sectionData.hermesAgent.sessions = status.value.active_sessions ?? sectionData.hermesAgent.sessions;
        sectionData.hermesAgent.authRequired = status.value.auth_required ?? sectionData.hermesAgent.authRequired;
        sectionData.hermesAgent.gatewayState = status.value.gateway_state || sectionData.hermesAgent.gatewayState;
        sectionData.hermesAgent.configVersion = String(status.value.config_version ?? sectionData.hermesAgent.configVersion);
        sectionData.hermesAgent.state = status.value.gateway_state === "running" ? "nominal" : "attention";
        connected = true;
      }
      if (sessions.status === "fulfilled" && sessions.value) sectionData.apiSessions = sessions.value;
      if (themes.status === "fulfilled" && themes.value) sectionData.themes = themes.value;
      if (plugins.status === "fulfilled" && plugins.value) sectionData.plugins = Array.isArray(plugins.value) ? plugins.value : [];

      connDot.className = "status-dot " + (connected ? "dot-ok pulse" : "dot-err");
      connText.textContent = connected ? "Connected" : "Disconnected";
      if (sectionData.apiStatus) connVersion.textContent = "v" + (sectionData.apiStatus.version || "?");
      syncText.textContent = connected ? "synced just now" : "sync stalled";

      const attention = sectionData.services.filter(s => s.state !== "nominal").length;
      navAttentionDot.hidden = attention === 0;

      if (!incidentOverlay.hidden) return; // don' t re-render over incident
      navigate(currentSection);
    } catch (err) {
      connDot.className = "status-dot dot-err";
      connText.textContent = "Connection failed";
    }
  }

  // --- Event listeners ---
  document.querySelectorAll(".nav-item").forEach(btn => { btn.addEventListener("click", () => navigate(btn.dataset.section)); });
  $("refresh-btn").addEventListener("click", refresh);
  $("incident-btn").addEventListener("click", openIncident);
  $("incident-close").addEventListener("click", closeIncident);
  incidentOverlay.addEventListener("click", (e) => { if (e.target === incidentOverlay) closeIncident(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !incidentOverlay.hidden) closeIncident(); });

  // --- Init ---
  navigate("athena");
  refresh();
  setInterval(refresh, 10000);
})();
