import React from 'react';

const DEFAULT_STYLE = 'bg-ink/5 text-ink/70 border-ink/10';

const StatusBadge = ({ label, styleMap = {} }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
      styleMap[label] || DEFAULT_STYLE
    }`}
  >
    {label}
  </span>
);

export default StatusBadge;
