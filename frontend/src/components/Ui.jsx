import { BAND_TONE } from "../lib/api.js";

export function StatCard({ label, value, sub, icon: Icon, tone = "text-ink" }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">{label}</p>
          <p className={`mt-2 font-display text-[26px] font-bold leading-none tnum ${tone}`}>
            {value}
          </p>
          {sub && <p className="mt-2 truncate text-xs text-muted">{sub}</p>}
        </div>
        {Icon && (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand/12 text-brand">
            <Icon className="h-[18px] w-[18px]" />
          </span>
        )}
      </div>
    </div>
  );
}

export function Band({ band }) {
  return <span className={`text-sm font-semibold ${BAND_TONE[band] || "text-muted"}`}>{band}</span>;
}

export function Pill({ tone = "muted", children }) {
  const tones = {
    muted: "border-line text-muted",
    brand: "border-brand/40 text-brand",
    warn: "border-warn/40 text-warn",
    danger: "border-danger/40 text-danger",
    info: "border-info/40 text-info",
  };
  return <span className={`chip ${tones[tone]}`}>{children}</span>;
}

export function Loading({ label = "Loading" }) {
  return <p className="eyebrow animate-pulse">{label}…</p>;
}

export function ErrorNote({ children }) {
  return (
    <p className="rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
      {children}
    </p>
  );
}

export function Empty({ children }) {
  return <div className="card p-6 text-sm text-muted">{children}</div>;
}

export function Table({ head, children }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[640px]">
        <thead><tr>{head.map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
