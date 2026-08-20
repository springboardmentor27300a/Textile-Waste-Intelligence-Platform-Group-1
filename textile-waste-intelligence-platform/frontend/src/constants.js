export const ROLES = {
  ADMIN: 'Administrator',
  MANUFACTURER: 'Textile Manufacturer',
  RECYCLER: 'Recycling Facility Operator',
  SUSTAINABILITY_MANAGER: 'Sustainability Manager',
};

export const ALL_ROLES = Object.values(ROLES);

export const FABRIC_TYPES = [
  'Cotton',
  'Polyester',
  'Wool',
  'Nylon',
  'Denim',
  'Silk',
  'Linen',
  'Blended',
  'Other',
];

export const CONDITIONS = ['Reusable', 'Recyclable', 'Damaged', 'Contaminated'];

export const PROCESSING_STATUSES = ['Pending', 'Collected', 'Processing', 'Recycled'];

export const STATUS_STYLES = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Collected: 'bg-blue-50 text-blue-700 border-blue-200',
  Processing: 'bg-ledger-50 text-ledger-700 border-ledger-200',
  Recycled: 'bg-forest-50 text-forest-700 border-forest-200',
};

export const CONDITION_STYLES = {
  Reusable: 'bg-forest-50 text-forest-700 border-forest-200',
  Recyclable: 'bg-ledger-50 text-ledger-700 border-ledger-200',
  Damaged: 'bg-amber-50 text-amber-700 border-amber-200',
  Contaminated: 'bg-red-50 text-red-700 border-red-200',
};
