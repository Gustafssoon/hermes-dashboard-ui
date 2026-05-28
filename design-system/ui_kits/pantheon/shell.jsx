/* ============================================================
   Tingzel Pantheon — app shell (sidebar, topbar, incident, App)
   ============================================================ */

const NAV = [
  { id: "athena",     deity: "Athena",     fn: "Overview",          icon: "gauge" },
  { id: "hermes",     deity: "Hermes",     fn: "Links & routing",   icon: "send" },
  { id: "hephaestus", deity: "Hephaestus", fn: "Infrastructure",    icon: "boxes" },
  { id: "oracle",     deity: "Oracle",     fn: "Checks & signals",  icon: "eye" },
  { id: "aegis",      deity: "Aegis",      fn: "Backup & protection",icon: "shield-check" },
  { id: "scrolls",    deity: "Scrolls",    fn: "Runbooks",          icon: "scroll-text" },
];

function Sidebar({ active, onNav, data, onOpenIncident }) {
  const attention = data.overview.attention + data.overview.down;
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-glyph" />
        <div className="brand-text">
          <span className="brand-name">Tingzel <em>Pantheon</em></span>
          <span className="brand-tag">Operations Console</span>
        </div>
      </div>

      <div className="nav-group-label">Pantheon</div>
      {NAV.map((n) => (
        <button key={n.id} className={`nav-item ${active === n.id ? "active" : ""}`} onClick={() => onNav(n.id)}>
          <span className="nav-icon"><Icon name={n.icon} size={18} /></span>
          <span className="nav-label">
            <span className="nav-deity">{n.deity}</span>
            <span className="nav-fn">{n.fn}</span>
          </span>
          {n.id === "athena" && attention > 0 && <span className="nav-attention-dot" />}
        </button>
      ))}

      <div className="sidebar-foot">
        <button className="incident-btn" onClick={onOpenIncident}>
          <Icon name="triangle-alert" size={15} /> Incident mode
        </button>
        <div className="conn">
          <StatusDot state={data.meta.connected ? "nominal" : "down"} pulse />
          {data.meta.connected ? "Connected" : "Disconnected"}
          <span className="version">v{data.meta.build}</span>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ nav, data, onRefresh }) {
  return (
    <header className="topbar">
      <div className="topbar-titles">
        <div className="eyebrow">{nav.deity} <span className="dot-sep">·</span> {nav.fn}</div>
        <h1>{nav.deity}</h1>
      </div>
      <div className="topbar-right">
        <span className="sync"><Icon name="clock" size={13} /> synced {data.meta.lastSync}</span>
        <Button variant="ghost" icon="refresh-cw" iconOnly onClick={onRefresh} title="Refresh" />
      </div>
    </header>
  );
}

function IncidentOverlay({ data, onClose, onJump }) {
  const inc = data.incident;
  const byId = Object.fromEntries(data.services.map((s) => [s.id, s]));
  return (
    <div className="overlay" onClick={onClose}>
      <div className="incident-panel" onClick={(e) => e.stopPropagation()}>
        <div className="incident-head">
          <span className="ih-ic"><Icon name="triangle-alert" size={24} /></span>
          <div>
            <h2>{inc.title}</h2>
            <div className="ih-line">{inc.line}</div>
          </div>
          <span className="ih-close"><Button variant="ghost" icon="x" iconOnly onClick={onClose} /></span>
        </div>
        <div className="incident-steps">
          {inc.steps.map((st) => {
            const svc = byId[st.service];
            return (
              <button className="istep" key={st.n} onClick={() => onJump(st.service)}>
                <span className="istep-n">{st.n}</span>
                <span className="istep-ic"><Icon name={st.icon} size={20} /></span>
                <span className="istep-body">
                  <span className="istep-title">{st.title}{svc && <Badge state={svc.state} />}</span>
                  <span className="istep-detail">{st.detail}</span>
                </span>
                <Icon name="chevron-right" size={18} style={{ color: "var(--fg3)" }} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function App() {
  const data = window.PANTHEON_DATA;
  const [active, setActive] = useState("athena");
  const [incident, setIncident] = useState(false);
  const [spin, setSpin] = useState(false);
  const nav = NAV.find((n) => n.id === active);

  const refresh = () => { setSpin(true); setTimeout(() => setSpin(false), 700); };

  const views = {
    athena: <AthenaOverview data={data} onOpenIncident={() => setIncident(true)} />,
    hermes: <HermesLinks data={data} />,
    hephaestus: <HephaestusInfra data={data} />,
    oracle: <OracleChecks data={data} />,
    aegis: <AegisBackup data={data} />,
    scrolls: <ScrollsRunbooks data={data} />,
  };

  return (
    <div className="pantheon-root">
      <div className="app">
        <Sidebar active={active} onNav={setActive} data={data} onOpenIncident={() => setIncident(true)} />
        <div className="main">
          <Topbar nav={nav} data={data} onRefresh={refresh} />
          <div className="content" style={spin ? { opacity: 0.55, transition: "opacity .2s" } : { transition: "opacity .2s" }}>
            {views[active]}
          </div>
        </div>
      </div>
      {incident && (
        <IncidentOverlay
          data={data}
          onClose={() => setIncident(false)}
          onJump={(svc) => {
            const map = { twingate: "hermes", dns: "oracle", nas: "hephaestus", portainer: "hephaestus", hue: "athena" };
            setActive(map[svc] || "athena");
            setIncident(false);
          }}
        />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
