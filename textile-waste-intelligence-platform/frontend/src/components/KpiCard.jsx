import React from 'react';

const TONES = {
  forest: 'bg-forest-50 text-forest-600',
  ledger: 'bg-ledger-50 text-ledger-600',
  amber: 'bg-amber-50 text-amber-600',
  ink: 'bg-ink/5 text-ink/70',
};

const KpiCard = ({ label, value, sublabel, icon: Icon, tone = 'forest', trend }) => (
  <div className="card flex flex-col gap-4">
    <div className="flex items-start justify-between">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${TONES[tone]}`}>
        <Icon size={20} />
      </div>
      {trend && (
        <span
          className={`text-xs font-semibold ${
            trend.direction === 'up' ? 'text-forest-600' : 'text-red-600'
          }`}
        >
          {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
        </span>
      )}
    </div>
    <div>
      <p className="font-display text-2xl font-bold text-ink">{value}</p>
      <p className="mt-0.5 text-sm font-medium text-ink/60">{label}</p>
      {sublabel && <p className="mt-2 text-xs text-ink/40">{sublabel}</p>}
    </div>
  </div>
);

export default KpiCard;
