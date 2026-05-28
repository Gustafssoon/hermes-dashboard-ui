/* ============================================================
   Tingzel Pantheon — primitives (presentational building blocks)
   ============================================================ */

const STATE_LABEL = {
  nominal: "nominal", attention: "attention", degraded: "degraded",
  down: "down", info: "info", idle: "idle",
};

function StatusDot({ state = "idle", pulse = false }) {
  return <span className={`status-dot s-${state} ${pulse ? "pulse" : ""}`} />;
}

function Badge({ state = "idle", children }) {
  return (
    <span className={`badge b-${state}`}>
      <StatusDot state={state} />
      {children || STATE_LABEL[state]}
    </span>
  );
}

function Card({ icon, title, count, children, className = "", ...rest }) {
  return (
    <section className={`card ${className}`} {...rest}>
      {title && (
        <div className="card-head">
          {icon && <span className="ci"><Icon name={icon} size={15} /></span>}
          {title}
          {count != null && <span className="count">{count}</span>}
        </div>
      )}
      {children}
    </section>
  );
}

function KeyValue({ k, v }) {
  return (
    <div className="kv">
      <div className="k">{k}</div>
      <div className="v">{v}</div>
    </div>
  );
}

function Button({ variant = "", icon, children, iconOnly = false, ...rest }) {
  const cls = ["btn", variant && `btn-${variant}`, iconOnly && "btn-icon"].filter(Boolean).join(" ");
  return (
    <button className={cls} {...rest}>
      {icon && <Icon name={icon} size={15} />}
      {children}
    </button>
  );
}

function Meter({ value, tone = "" }) {
  const t = tone || (value >= 80 ? "warn" : value >= 60 ? "" : "ok");
  return (
    <div className={`meter ${t}`}>
      <i style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}

/* Service row — the recurring object across the portal */
function ServiceRow({ svc, onClick }) {
  return (
    <div className="row" style={onClick ? { cursor: "pointer" } : null} onClick={onClick}>
      <div className="row-ic"><Icon name={svc.icon} size={18} /></div>
      <div className="row-main">
        <div className="row-name">
          {svc.name}
          <span className="row-kind">{svc.kind}</span>
        </div>
        <div className="row-detail">{svc.detail}</div>
      </div>
      <div className="row-right">
        <Badge state={svc.state} />
        <span className="row-checked">{svc.checked}</span>
      </div>
    </div>
  );
}

function LinkRow({ label, url, onClick }) {
  return (
    <button className="linkrow" onClick={onClick}>
      <div className="row-ic" style={{ width: 30, height: 30 }}><Icon name="external-link" size={15} /></div>
      <div className="row-main">
        <div className="linkrow-label">{label}</div>
        <div className="linkrow-url">{url}</div>
      </div>
      <span className="linkrow-go"><Icon name="arrow-right" size={16} /></span>
    </button>
  );
}

Object.assign(window, { StatusDot, Badge, Card, KeyValue, Button, Meter, ServiceRow, LinkRow, STATE_LABEL });
