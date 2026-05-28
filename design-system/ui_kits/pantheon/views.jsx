/* ============================================================
   Tingzel Pantheon — section views (one per deity)
   ============================================================ */
const { useState } = React;

function MiniCert({ c }) {
  return (
    <div className="row">
      <StatusDot state={c.state} />
      <div className="row-main">
        <div className="row-name" style={{ fontSize: 13.5, fontFamily: "var(--font-mono)" }}>{c.host}</div>
        <div className="row-detail">{c.issuer}{c.note ? ` · ${c.note}` : ""}</div>
      </div>
      <div className="row-right">
        <span className="t-value" style={{ fontSize: 15 }}>{c.days}d</span>
        <span className="row-checked">until expiry</span>
      </div>
    </div>
  );
}

/* ---------- Athena · Overview ---------- */
function AthenaOverview({ data, onOpenIncident }) {
  const o = data.overview;
  const needs = data.services.filter((s) => s.state !== "nominal");
  return (
    <div className="stack">
      <div className="hero">
        <div className="hero-mark"><Icon name="gauge" size={24} /></div>
        <div className="hero-body">
          <div className="hero-state">{o.headline}</div>
          <div className="hero-note">{o.note}</div>
        </div>
        <div className="hero-stats">
          <div className="hero-stat"><div className="num">{o.nominal}</div><div className="lab">Nominal</div></div>
          <div className="hero-stat"><div className="num gold">{o.attention}</div><div className="lab">Attention</div></div>
          <div className="hero-stat"><div className="num">{o.down}</div><div className="lab">Down</div></div>
        </div>
      </div>

      <div className="grid-2">
        <Card icon="triangle-alert" title="Needs attention" count={needs.length}>
          {needs.length === 0
            ? <p className="row-detail" style={{ padding: "6px 4px" }}>All clear. Nothing requires action.</p>
            : needs.map((s) => <ServiceRow key={s.id} svc={s} />)}
          <div style={{ paddingTop: 14 }}>
            <Button variant="" icon="triangle-alert" onClick={onOpenIncident}>Enter incident mode</Button>
          </div>
        </Card>

        <Card icon="activity" title="Latest signals" count={data.checks.length}>
          {data.checks.slice(0, 5).map((c, i) => (
            <div className="row" key={i}>
              <StatusDot state={c.state} />
              <div className="row-main"><div className="row-name" style={{ fontSize: 13.5 }}>{c.name}</div></div>
              <div className="row-right">
                <span className="row-detail" style={{ margin: 0, color: "var(--fg1)" }}>{c.value}</span>
                <span className="row-checked">{c.ago}</span>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <Card icon="server" title="All services" count={`${data.services.length} monitored`}>
        {data.services.map((s) => <ServiceRow key={s.id} svc={s} />)}
      </Card>
    </div>
  );
}

/* ---------- Hermes · Links & routing ---------- */
function HermesLinks({ data }) {
  const r = data.routing;
  const a = data.hermesAgent;
  const groups = [...new Set(data.links.map((l) => l.group))];
  return (
    <div className="stack">
      <div className="grid-2">
        <Card icon="route" title="Remote access" count={r.connector}>
          <div className="kv-grid">
            <div className="kv"><div className="k">Connector</div><div className="v" style={{ display: "flex", alignItems: "center", gap: 9 }}><StatusDot state={r.state} pulse />{r.connector}</div></div>
            <KeyValue k="Network" v={r.network} />
            <KeyValue k="Devices" v={r.devices} />
            <KeyValue k="Last handshake" v={r.lastHandshake} />
          </div>
          <p className="hero-note" style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--divider)" }}>{r.note}</p>
        </Card>

        <Card icon="send" title="Hermes agent" count={`v${a.version}`}>
          <div className="kv-grid">
            <div className="kv"><div className="k">Gateway</div><div className="v" style={{ display: "flex", alignItems: "center", gap: 9 }}><StatusDot state={a.state} />{a.gatewayState}</div></div>
            <KeyValue k="Sessions" v={a.sessions} />
            <KeyValue k="Config" v={`v${a.configVersion}`} />
            <KeyValue k="Auth" v={a.authRequired ? "required" : "open"} />
            <KeyValue k="Release" v={a.release} />
          </div>
        </Card>
      </div>

      {groups.map((g) => (
        <Card icon="send" title={g} count={data.links.filter((l) => l.group === g).length} key={g}>
          <div className="stack" style={{ gap: 10 }}>
            {data.links.filter((l) => l.group === g).map((l) => (
              <LinkRow key={l.label} label={l.label} url={l.url} onClick={() => {}} />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ---------- Hephaestus · Infrastructure ---------- */
function HephaestusInfra({ data }) {
  const h = data.infra.host;
  const ep = data.infra.endpoint;
  const nas = data.nas;
  return (
    <div className="stack">
      <Card icon="cpu" title="Host" count={h.name}>
        <div className="kv-grid" style={{ marginBottom: 4 }}>
          <KeyValue k="Platform" v={h.os} />
          <KeyValue k="Uptime" v={h.uptime} />
          <KeyValue k="Containers" v={`${ep.running}/${ep.containers} running`} />
        </div>
        <div className="grid-3" style={{ marginTop: 18, gap: 22 }}>
          {[["CPU", h.cpu], ["Memory", h.mem], ["Disk", h.disk]].map(([lab, val]) => (
            <div key={lab}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span className="kv"><span className="k">{lab}</span></span>
                <span className="t-value" style={{ fontSize: 13 }}>{val}%</span>
              </div>
              <Meter value={val} />
            </div>
          ))}
        </div>
      </Card>

      <Card icon="boxes" title="Stacks" count={`${data.infra.stacks.length} stacks · Portainer`}>
        {data.infra.stacks.map((s) => (
          <div className="row" key={s.name}>
            <div className="row-ic"><Icon name="boxes" size={17} /></div>
            <div className="row-main">
              <div className="row-name" style={{ fontFamily: "var(--font-mono)", fontSize: 13.5 }}>{s.name}</div>
              <div className="row-detail">{s.containers} containers · {s.note}</div>
            </div>
            <div className="row-right"><Badge state={s.state} /></div>
          </div>
        ))}
      </Card>

      <Card icon="hard-drive" title="Storage" count={`${nas.model} · ${nas.temp}`}>
        <div className="stack" style={{ gap: 16 }}>
          {nas.volumes.map((v) => (
            <div key={v.name}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <StatusDot state={v.state} />
                <span className="t-value" style={{ fontSize: 14 }}>{v.name}</span>
                <span className="row-kind">{v.raid.split(" ")[0]}</span>
                <span className="row-detail" style={{ margin: 0, marginLeft: "auto" }}>{v.used}% of {v.total}{v.note ? ` · ${v.note}` : ""}</span>
              </div>
              <Meter value={v.used} />
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "10px 18px", marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--divider)" }}>
          {nas.disks.map((d) => (
            <div key={d.bay} style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <StatusDot state={d.smart === "healthy" ? "nominal" : "attention"} />
              <span className="t-mono-sm">Bay {d.bay} · {d.model.split(" ")[0]} · {d.temp}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---------- Oracle · Checks & signals ---------- */
function OracleChecks({ data }) {
  const dns = data.dns;
  return (
    <div className="stack">
      <Card icon="eye" title="Read-only checks" count={`${data.checks.length} · auto every ${data.meta.pollSeconds}s`}>
        {data.checks.map((c, i) => (
          <div className="row" key={i}>
            <StatusDot state={c.state} />
            <div className="row-main">
              <div className="row-name" style={{ fontSize: 14 }}>{c.name}</div>
              <div className="row-detail">result · {c.result}</div>
            </div>
            <div className="row-right">
              <span className="t-value" style={{ fontSize: 15 }}>{c.value}</span>
              <span className="row-checked">{c.ago}</span>
            </div>
          </div>
        ))}
      </Card>

      <div className="grid-2">
        <Card icon="network" title="DNS resolution" count={dns.service}>
          <div className="kv-grid" style={{ marginBottom: 16 }}>
            <KeyValue k="Queries" v={`${dns.queriesPerMin}/min`} />
            <KeyValue k="Cache hit" v={`${dns.cacheHitPct}%`} />
            <KeyValue k="Blocked" v={`${dns.blockedPct}%`} />
            <KeyValue k="Latency" v={`${dns.avgLatencyMs} ms`} />
          </div>
          {dns.upstreams.map((u) => (
            <div className="row" key={u.addr}>
              <StatusDot state={u.state} />
              <div className="row-main"><div className="row-name" style={{ fontSize: 13.5 }}>{u.name}<span className="row-kind">{u.proto}</span></div>
                <div className="row-detail">{u.addr}</div></div>
              <div className="row-right"><span className="t-value" style={{ fontSize: 14 }}>{u.latency}</span></div>
            </div>
          ))}
        </Card>

        <Card icon="lock" title="TLS certificates" count={`${data.certificates.length} internal`}>
          {data.certificates.map((c) => <MiniCert key={c.host} c={c} />)}
        </Card>
      </div>

      <p className="hero-note" style={{ paddingLeft: 4 }}>
        The Oracle only observes. Every check here is a read-only probe — it never changes state on
        the services it watches.
      </p>
    </div>
  );
}

/* ---------- Aegis · Backup & protection ---------- */
function AegisBackup({ data }) {
  const verified = data.backups.filter((b) => b.verified).length;
  const r = data.restore;
  return (
    <div className="stack">
      <div className="hero">
        <div className="hero-mark"><Icon name="shield-check" size={24} /></div>
        <div className="hero-body">
          <div className="hero-state">{verified} of {data.backups.length} backups verified</div>
          <div className="hero-note">{r.note}</div>
        </div>
      </div>

      <Card icon="shield-check" title="Backup jobs" count={data.backups.length}>
        {data.backups.map((b, i) => (
          <div className="row" key={i}>
            <div className="row-ic"><Icon name={b.verified ? "lock" : "clock"} size={17} /></div>
            <div className="row-main">
              <div className="row-name" style={{ fontSize: 14 }}>{b.name}</div>
              <div className="row-detail">{b.target} · {b.size}</div>
            </div>
            <div className="row-right">
              <Badge state={b.state}>{b.verified ? "verified" : "overdue"}</Badge>
              <span className="row-checked">last {b.last}</span>
            </div>
          </div>
        ))}
      </Card>

      <Card icon="refresh-cw" title="Restore verification" count={r.cadence}>
        <div className="kv-grid">
          <div className="kv"><div className="k">Last drill</div><div className="v" style={{ display: "flex", alignItems: "center", gap: 9 }}><StatusDot state={r.state} />{r.lastDrill}</div></div>
          <KeyValue k="Outcome" v={r.outcome} />
          <KeyValue k="Target" v={r.target} />
          <KeyValue k="Cadence" v={r.cadence} />
        </div>
      </Card>
    </div>
  );
}

/* ---------- Scrolls · Runbooks ---------- */
function ScrollsRunbooks({ data }) {
  const [open, setOpen] = useState(data.runbooks[0].id);
  return (
    <div className="stack">
      {data.runbooks.map((rb) => {
        const isOpen = open === rb.id;
        return (
          <Card key={rb.id} className="scroll-card" onClick={() => setOpen(isOpen ? null : rb.id)}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 13 }}>
              <div className="row-ic"><Icon name="scroll-text" size={18} /></div>
              <div style={{ flex: 1 }}>
                <div className="row-name" style={{ fontSize: 16, fontFamily: "var(--font-serif)", fontWeight: 600 }}>{rb.title}</div>
                <div className="epigraph">{rb.epigraph}</div>
              </div>
              <span style={{ color: "var(--fg3)", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .16s ease" }}>
                <Icon name="chevron-right" size={18} />
              </span>
            </div>
            {isOpen && (
              <ol className="steps" style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--divider)" }}>
                {rb.steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            )}
          </Card>
        );
      })}
    </div>
  );
}

Object.assign(window, { AthenaOverview, HermesLinks, HephaestusInfra, OracleChecks, AegisBackup, ScrollsRunbooks });
