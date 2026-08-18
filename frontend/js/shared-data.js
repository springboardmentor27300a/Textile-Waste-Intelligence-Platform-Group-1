/**
 * shared-data.js — Shared constants and helpers for the AI Pipeline
 */

const MATERIALS = [
  { name: 'Cotton',       icon: '🌿', family: 'Natural Fibre'   },
  { name: 'Wool',         icon: '🐑', family: 'Natural Fibre'   },
  { name: 'Linen',        icon: '🌾', family: 'Natural Fibre'   },
  { name: 'Silk',         icon: '✨', family: 'Natural Fibre'   },
  { name: 'Rayon',        icon: '💧', family: 'Semi-Synthetic'  },
  { name: 'Denim',        icon: '👖', family: 'Blended Fabric'  },
  { name: 'Polyester',    icon: '⚗️', family: 'Synthetic Fibre' },
  { name: 'Nylon',        icon: '🔬', family: 'Synthetic Fibre' },
  { name: 'Acrylic',      icon: '🧪', family: 'Synthetic Fibre' },
  { name: 'Mixed Fabric', icon: '🧶', family: 'Mixed/Blended'   },
];

const MATERIAL_META = {
  'Cotton':       { icon:'🌿', family:'Natural Fibre',   recyclability:'High',    wasteCat:'Fabric Scraps',   },
  'Wool':         { icon:'🐑', family:'Natural Fibre',   recyclability:'High',    wasteCat:'Fabric Scraps',   },
  'Linen':        { icon:'🌾', family:'Natural Fibre',   recyclability:'High',    wasteCat:'Fabric Scraps',   },
  'Silk':         { icon:'✨', family:'Natural Fibre',   recyclability:'Medium',  wasteCat:'Dye Waste',       },
  'Rayon':        { icon:'💧', family:'Semi-Synthetic',  recyclability:'Medium',  wasteCat:'Dye Waste',       },
  'Denim':        { icon:'👖', family:'Blended Fabric',  recyclability:'Medium',  wasteCat:'Cutting Waste',   },
  'Polyester':    { icon:'⚗️', family:'Synthetic Fibre', recyclability:'Low',     wasteCat:'Cutting Waste',   },
  'Nylon':        { icon:'🔬', family:'Synthetic Fibre', recyclability:'Low',     wasteCat:'Chemical Waste',  },
  'Acrylic':      { icon:'🧪', family:'Synthetic Fibre', recyclability:'Low',     wasteCat:'Chemical Waste',  },
  'Mixed Fabric': { icon:'🧶', family:'Mixed/Blended',   recyclability:'Low',     wasteCat:'Packaging Waste', },
};

const MAT_ICON = {
  Cotton: '🌿', Wool: '🐑', Linen: '🌾', Silk: '✨', Rayon: '💧',
  Denim: '👖', Polyester: '⚗️', Nylon: '🔬', Acrylic: '🧪', 'Mixed Fabric': '🧶',
};

const WASTE_CAT_META = {
  Recyclable: {
    icon: '♻️', label: 'Recyclable',
    description: 'Material is highly suitable for mechanical or chemical recycling.',
    handling:    'Keep dry, separate by fibre type, and bundle in labelled bags.',
    disposal:    'Send to certified textile recycling facility for fibre recovery.',
    urgency:     'Low — stable, non-hazardous material.',
  },
  Reusable: {
    icon: '🔁', label: 'Reusable',
    description: 'Material can be resold or reprocessed for second-hand use.',
    handling:    'Clean, inspect, and route to secondary retail or donation streams.',
    disposal:    'Donation drives, resale platforms, or corporate refurbishment programs.',
    urgency:     'Low — stable material, high secondary value.',
  },
  Repairable: {
    icon: '🧵', label: 'Repairable',
    description: 'Durable material that can be restored with minor repairs.',
    handling:    'Assess damage — minor repairs restore to saleable condition.',
    disposal:    'In-house repair teams or third-party refurbishment services.',
    urgency:     'Low — prioritize repair over recycling.',
  },
  Upcyclable: {
    icon: '✨', label: 'Upcyclable',
    description: 'High-value material suitable for creative reuse and transformation.',
    handling:    'Partner with designers or artisans for high-value transformation.',
    disposal:    'Creative reuse: quilts, insulation panels, fashion upcycling.',
    urgency:     'Low — highest value retention potential.',
  },
  Compostable: {
    icon: '🌱', label: 'Compostable',
    description: 'Natural or semi-synthetic cellulose fibres that are biodegradable.',
    handling:    'Shred and compost with industrial composting — no synthetic blends.',
    disposal:    'Industrial composting — decomposes within 6–12 months.',
    urgency:     'Low — fully biodegradable if separated properly.',
  },
  Hazardous: {
    icon: '⚠️', label: 'Hazardous',
    description: 'Synthetic material requiring specialist chemical treatment or disposal.',
    handling:    'Segregate immediately — route to licensed hazardous waste handler.',
    disposal:    'Specialist chemical waste contractor — do NOT landfill or incinerate.',
    urgency:     'Critical — serious environmental and health hazard if mishandled.',
  },
};

function getMaterialMeta(name) {
  return MATERIALS.find(m => m.name.toLowerCase() === name.toLowerCase())
    || { icon: '🧵', family: 'Unknown' };
}

function getMeta(material) {
  return MATERIAL_META[material] || {
    icon: '🧵', family: 'Unknown', recyclability: '—', wasteCat: '—',
  };
}

function getCatMeta(category) {
  return WASTE_CAT_META[category] || {
    icon: '🗂️',
    label: category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    description: 'No additional information available for this category.',
    handling: '—', disposal: '—', urgency: '—',
  };
}

function matIcon(m) { return MAT_ICON[m] || '🧵'; }

function confLevel(pct) {
  if (pct >= 88) return { label: 'High Confidence',   cls: 'conf-high' };
  if (pct >= 75) return { label: 'Medium Confidence', cls: 'conf-med'  };
  return               { label: 'Low Confidence',    cls: 'conf-low'  };
}

function confCls(pct) {
  return pct >= 88 ? 'conf-high' : pct >= 75 ? 'conf-med' : 'conf-low';
}

function confLabel(pct) {
  return pct >= 88 ? 'High Confidence' : pct >= 75 ? 'Medium Confidence' : 'Low Confidence';
}

window.MATERIALS = MATERIALS;
window.MATERIAL_META = MATERIAL_META;
window.MAT_ICON = MAT_ICON;
window.WASTE_CAT_META = WASTE_CAT_META;
window.getMaterialMeta = getMaterialMeta;
window.getMeta = getMeta;
window.getCatMeta = getCatMeta;
window.matIcon = matIcon;
window.confLevel = confLevel;
window.confCls = confCls;
window.confLabel = confLabel;

// ── SessionBridge ─────────────────────────────────────────────────────────────
// Passes the full pipeline state between image-analysis.html → sustainability.html
// via sessionStorage. Does not touch the backend.
const _SESSION_KEY = 'twi_pipeline_state';
const SessionBridge = {
  /** Save the complete pipeline state object after analysis completes. */
  save(state) {
    try { sessionStorage.setItem(_SESSION_KEY, JSON.stringify(state)); } catch (e) { console.warn('SessionBridge.save failed', e); }
  },
  /** Load the saved state. Returns null if nothing is saved or JSON is invalid. */
  load() {
    try { const raw = sessionStorage.getItem(_SESSION_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  },
  /** Clear saved state (call on resetPipeline). */
  clear() { try { sessionStorage.removeItem(_SESSION_KEY); } catch (e) {} },
};
window.SessionBridge = SessionBridge;
