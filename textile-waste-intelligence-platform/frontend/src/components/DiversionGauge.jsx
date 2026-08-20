import React from 'react';

/**
 * Signature dashboard element: a circular "diversion rate" gauge
 * showing the share of registered waste that is Reusable or
 * Recyclable (i.e. diverted from landfill) versus Damaged/Contaminated.
 */
const DiversionGauge = ({ percentage = 0, size = 168 }) => {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percentage));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#EBF5EF"
            strokeWidth={14}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1F7A54"
            strokeWidth={14}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-bold text-ink">{clamped.toFixed(0)}%</span>
          <span className="text-xs font-medium text-ink/50">diverted</span>
        </div>
      </div>
      <p className="max-w-[14rem] text-center text-xs text-ink/50">
        Share of registered waste marked Reusable or Recyclable, kept out of landfill
      </p>
    </div>
  );
};

export default DiversionGauge;
