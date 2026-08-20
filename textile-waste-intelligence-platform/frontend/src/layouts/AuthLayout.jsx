import React from 'react';
import { Outlet } from 'react-router-dom';
import { Recycle, Leaf, BarChart3, ShieldCheck } from 'lucide-react';

const FEATURES = [
  { icon: Leaf, text: 'Track every batch from cutting floor to recycler' },
  { icon: BarChart3, text: 'See diversion rate and fabric trends at a glance' },
  { icon: ShieldCheck, text: 'Role-based access keeps sensitive data scoped' },
];

const AuthLayout = () => (
  <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
    <div className="relative hidden flex-col justify-between overflow-hidden bg-forest-700 p-10 text-white lg:flex">
      <div className="relative z-10 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
          <Recycle size={18} />
        </div>
        <span className="font-display text-sm font-bold">Textile Waste Intelligence</span>
      </div>

      <div className="relative z-10 max-w-md">
        <h1 className="font-display text-3xl font-bold leading-tight">
          Every offcut, tracked. Every batch, accountable.
        </h1>
        <p className="mt-4 text-sm text-white/70">
          The system of record for manufacturers, recyclers, and sustainability
          teams managing textile waste at scale.
        </p>
        <div className="mt-8 space-y-4">
          {FEATURES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Icon size={15} />
              </div>
              <p className="text-sm text-white/80">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="relative z-10 text-xs text-white/40">
        © {new Date().getFullYear()} Textile Waste Intelligence Platform
      </p>

      {/* Ambient decorative rings, kept quiet and out of the way of content */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -bottom-32 -right-10 h-96 w-96 rounded-full border border-white/10" />
    </div>

    <div className="flex items-center justify-center bg-canvas p-6 sm:p-10">
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  </div>
);

export default AuthLayout;
