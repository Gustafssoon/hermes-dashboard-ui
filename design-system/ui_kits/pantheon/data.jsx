/* ============================================================
   Tingzel Pantheon — mock data
   ------------------------------------------------------------
   Frontend-first. All values here are placeholder, shaped so a
   real read-only status feed can replace them later without
   touching the components. See ui_kits/pantheon/DATA_CONTRACT.md.

   States: "nominal" | "attention" | "degraded" | "down" | "info"
   ============================================================ */

const PANTHEON_DATA = {
  meta: {
    operator: "tingzel",
    portal: "Tingzel Pantheon",
    build: "0.2.0",
    lastSync: "12s ago",
    pollSeconds: 60,
    connected: true,
  },

  /* ---- Athena / Overview — derived summary ---- */
  overview: {
    nominal: 5,
    attention: 1,
    down: 0,
    headline: "1 service needs attention",
    note: "Portainer reports the media stack restarting. Storage on volume1 is at 68% and one restore drill is overdue — everything else is nominal.",
  },

  /* ---- Core monitored services ----
     `metrics` is a compact key/value list surfaced in the
     overview's service detail and reused per section. */
  services: [
    {
      id: "nas", name: "Synology DSM", kind: "NAS", icon: "hard-drive",
      state: "nominal", detail: "DS920+ · DSM 7.2.1 · 41°C", checked: "3m ago",
      host: "nas.tingzel.lan:5001",
      metrics: [["Model", "DS920+"], ["DSM", "7.2.1-69057"], ["Temp", "41°C"], ["Fan", "nominal"]],
    },
    {
      id: "dns", name: "Technitium", kind: "DNS", icon: "network",
      state: "nominal", detail: "412 q/min · 73% cache hit · 4 ms", checked: "2m ago",
      host: "dns.tingzel.lan:5380",
      metrics: [["Service", "running"], ["Queries", "412/min"], ["Blocked", "18.4%"], ["Latency", "4 ms"]],
    },
    {
      id: "portainer", name: "Portainer", kind: "Containers", icon: "boxes",
      state: "attention", detail: "5 stacks · 1 container restarting", checked: "1m ago",
      host: "portainer.tingzel.lan:9443",
      metrics: [["Endpoint", "local"], ["Stacks", "5"], ["Containers", "14"], ["Issue", "media · restarting"]],
    },
    {
      id: "twingate", name: "Twingate", kind: "Access", icon: "route",
      state: "nominal", detail: "Connector tingzel-gw connected · 1 device", checked: "1m ago",
      host: "tingzel.twingate.com",
      metrics: [["Connector", "tingzel-gw"], ["State", "connected"], ["Devices", "1"], ["Exposure", "none public"]],
    },
    {
      id: "hermes", name: "Hermes Dashboard", kind: "Agent", icon: "send",
      state: "nominal", detail: "v2.4.1 · 2 sessions · gateway running", checked: "2m ago",
      host: "hermes.tingzel.lan:9120",
      metrics: [["Version", "2.4.1"], ["Sessions", "2"], ["Gateway", "running"], ["Config", "v17"]],
    },
    {
      id: "hue", name: "Hue Bridge", kind: "Home", icon: "lightbulb",
      state: "nominal", detail: "14/14 lights reachable · fw 1.65.x", checked: "5m ago",
      host: "hue.tingzel.lan",
      metrics: [["Reachable", "yes"], ["Lights", "14/14"], ["Firmware", "1.65.x"], ["Seen", "5m ago"]],
    },
  ],

  /* ---- Synology DSM / NAS health ---- */
  nas: {
    model: "Synology DS920+",
    dsm: "DSM 7.2.1-69057 Update 5",
    temp: "41°C",
    fan: "nominal",
    uptime: "31d 04h",
    state: "nominal",
    volumes: [
      { name: "volume1", raid: "SHR-1 (1-disk fault tolerance)", used: 68, total: "14.5 TB", smart: "healthy", state: "attention", note: "approaching 80% threshold" },
      { name: "volume2", raid: "Basic",                          used: 22, total: "3.6 TB",  smart: "healthy", state: "nominal",   note: "" },
    ],
    disks: [
      { bay: "1", model: "WD Red 8TB",  smart: "healthy", temp: "38°C", hours: "26,304" },
      { bay: "2", model: "WD Red 8TB",  smart: "healthy", temp: "39°C", hours: "26,304" },
      { bay: "3", model: "WD Red 8TB",  smart: "healthy", temp: "40°C", hours: "18,120" },
      { bay: "4", model: "Crucial SSD", smart: "healthy", temp: "35°C", hours: "9,840" },
    ],
  },

  /* ---- Technitium DNS — resolution & service status ---- */
  dns: {
    service: "running",
    state: "nominal",
    uptime: "31d 04h",
    queriesPerMin: 412,
    blockedPct: 18.4,
    cacheHitPct: 73.1,
    avgLatencyMs: 4,
    upstreams: [
      { name: "Cloudflare", addr: "1.1.1.1", proto: "DoH", latency: "9 ms",  state: "nominal" },
      { name: "Quad9",      addr: "9.9.9.9", proto: "DoT", latency: "14 ms", state: "nominal" },
    ],
  },

  /* ---- Hermes Dashboard — agent status
     (mirrors the real Hermes /api/status fields) ---- */
  hermesAgent: {
    version: "2.4.1",
    release: "2026-05-12",
    sessions: 2,
    gatewayState: "running",
    configVersion: "17",
    authRequired: true,
    state: "nominal",
  },

  /* ---- Hermes / Links & routing ---- */
  links: [
    { label: "Synology DSM",     url: "https://nas.tingzel.lan:5001",       group: "Services" },
    { label: "Technitium DNS",   url: "http://dns.tingzel.lan:5380",        group: "Services" },
    { label: "Portainer",        url: "https://portainer.tingzel.lan:9443", group: "Services" },
    { label: "Hermes Dashboard", url: "https://hermes.tingzel.lan:9120",    group: "Services" },
    { label: "Hue Bridge",       url: "http://hue.tingzel.lan",             group: "Services" },
    { label: "Twingate Admin",   url: "https://tingzel.twingate.com",       group: "Access" },
  ],

  /* ---- Twingate remote access ---- */
  routing: {
    connector: "tingzel-gw",
    state: "nominal",
    devices: 1,
    network: "tingzel.twingate.com",
    lastHandshake: "1m ago",
    note: "Remote access flows over Twingate. No ports are exposed publicly; nothing here changes routing or firewall state.",
  },

  /* ---- Hephaestus / Infrastructure — host + Docker/Portainer ---- */
  infra: {
    host: { name: "hephaestus", os: "DSM 7.2 · Docker 24.0.9", uptime: "31d 04h", cpu: 12, mem: 46, disk: 68 },
    endpoint: { name: "local", state: "nominal", docker: "24.0.9", containers: 14, running: 13 },
    stacks: [
      { name: "hermes",      containers: 3, state: "nominal",   note: "up 31d" },
      { name: "technitium",  containers: 1, state: "nominal",   note: "up 31d" },
      { name: "monitoring",  containers: 4, state: "nominal",   note: "up 12d" },
      { name: "media",       containers: 5, state: "attention", note: "1 container restarting (transcoder)" },
      { name: "vaultwarden", containers: 1, state: "nominal",   note: "up 31d" },
    ],
  },

  /* ---- Oracle / Checks & signals (read-only observations) ---- */
  checks: [
    { name: "DNS resolution probe",  result: "pass",  value: "4 ms",     state: "nominal",   ago: "2m ago" },
    { name: "Docker daemon ping",    result: "pass",  value: "alive",    state: "nominal",   ago: "1m ago" },
    { name: "NAS volume SMART",      result: "pass",  value: "healthy",  state: "nominal",   ago: "1h ago" },
    { name: "Disk usage · volume1",  result: "watch", value: "68%",      state: "attention", ago: "12m ago" },
    { name: "Snapshot integrity",    result: "pass",  value: "verified", state: "nominal",   ago: "6h ago" },
    { name: "Twingate handshake",    result: "pass",  value: "1m ago",   state: "nominal",   ago: "1m ago" },
  ],

  /* ---- TLS certificate freshness for internal services ---- */
  certificates: [
    { host: "nas.tingzel.lan",       issuer: "Synology",    days: 12, state: "attention", note: "renew soon" },
    { host: "hermes.tingzel.lan",    issuer: "Internal CA", days: 41, state: "info",      note: "" },
    { host: "portainer.tingzel.lan", issuer: "Internal CA", days: 64, state: "nominal",   note: "" },
    { host: "dns.tingzel.lan",       issuer: "Internal CA", days: 88, state: "nominal",   note: "" },
  ],

  /* ---- Aegis / Backup freshness & restore verification ---- */
  backups: [
    { name: "Synology Hyper Backup", target: "Backblaze B2",  size: "1.21 TB", last: "6h ago",  state: "nominal", verified: true },
    { name: "Technitium zones",      target: "NAS · /backup", size: "8.4 MB",  last: "12h ago", state: "nominal", verified: true },
    { name: "Portainer config",      target: "NAS · /backup", size: "2.1 MB",  last: "1d ago",  state: "nominal", verified: true },
    { name: "Vaultwarden",           target: "Backblaze B2",  size: "44 MB",   last: "6h ago",  state: "nominal", verified: true },
  ],
  restore: {
    lastDrill: "9d ago",
    target: "scratch volume2",
    outcome: "passed",
    cadence: "weekly",
    state: "attention",
    note: "Last restore drill was 9 days ago — past the weekly cadence. Verify a restore point when convenient.",
  },

  /* ---- Hue Bridge status ---- */
  hue: {
    reachable: true,
    state: "nominal",
    lights: 14,
    reachableLights: 14,
    firmware: "1.65.x",
    lastSeen: "5m ago",
  },

  /* ---- Scrolls / Runbooks ---- */
  runbooks: [
    { id: "dns",   title: "DNS not resolving",            epigraph: "Know the path before the message.", steps: ["Check the Technitium service is up (Hephaestus → technitium stack).", "Confirm upstream forwarders (Cloudflare, Quad9) are reachable.", "Flush the client resolver cache and re-run the Oracle DNS probe."] },
    { id: "stack", title: "A Docker stack won't start",   epigraph: "The forge cools when the fuel runs out.", steps: ["Open Portainer → the stack → container logs.", "Check disk space on volume1 (Oracle → disk usage).", "Recreate the stack; watch the failing container come up."] },
    { id: "remote",title: "Can't reach services remotely",epigraph: "The messenger needs an open road.", steps: ["Verify the Twingate connector tingzel-gw is connected (Hermes → remote access).", "Confirm the device has an active Twingate session.", "Fall back to LAN only if on-site."] },
    { id: "nas",   title: "NAS volume degraded",          epigraph: "Guard the vault first.", steps: ["Read SMART status per disk (Hephaestus → storage).", "Do not write; verify the latest snapshot is intact (Aegis).", "Plan a rebuild during a quiet window."] },
    { id: "cert",  title: "Internal TLS cert expiring",   epigraph: "Renew the seal before it breaks.", steps: ["Identify the host nearing expiry (Oracle → certificates).", "Reissue from the Internal CA or Synology, depending on issuer.", "Re-deploy the cert and confirm the freshness check turns nominal."] },
  ],

  /* ---- Incident mode — what to check first, in order ---- */
  incident: {
    title: "Start here when something is down",
    line: "Work top to bottom. Stop when you find the break.",
    steps: [
      { n: 1, title: "Is the gateway up?",     detail: "Twingate connector tingzel-gw — without it, nothing is reachable remotely.", icon: "route",      service: "twingate" },
      { n: 2, title: "Can DNS resolve?",       detail: "Technitium — most 'everything is down' reports are really DNS.",             icon: "network",    service: "dns" },
      { n: 3, title: "Is the NAS reachable?",  detail: "Synology DSM — storage backs most stacks. Check before restarting things.",  icon: "hard-drive", service: "nas" },
      { n: 4, title: "Docker daemon + stacks", detail: "Portainer — confirm the daemon is alive, then the failing stack.",           icon: "boxes",      service: "portainer" },
      { n: 5, title: "Power / Hue canary",     detail: "Hue Bridge is a cheap power/network canary for the rack's circuit.",         icon: "lightbulb",  service: "hue" },
    ],
  },
};

if (typeof window !== "undefined") window.PANTHEON_DATA = PANTHEON_DATA;
