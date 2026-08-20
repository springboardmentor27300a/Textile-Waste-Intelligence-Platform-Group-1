import React from 'react';
import { PackageSearch } from 'lucide-react';

const EmptyState = ({
  icon: Icon = PackageSearch,
  title = 'Nothing here yet',
  description = 'Data will show up here once it exists.',
  action,
}) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-forest-200 bg-forest-50/40 px-6 py-14 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
      <Icon size={22} className="text-forest-500" />
    </div>
    <div>
      <p className="font-display text-base font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-ink/60">{description}</p>
    </div>
    {action}
  </div>
);

export default EmptyState;
