import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ label = 'Loading…', size = 20 }) => (
  <div className="flex items-center justify-center gap-2 py-10 text-ink/60">
    <Loader2 size={size} className="animate-spin text-forest-500" />
    <span className="text-sm font-medium">{label}</span>
  </div>
);

export default LoadingSpinner;
