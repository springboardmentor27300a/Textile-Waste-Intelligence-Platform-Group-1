import React, { useEffect, useState } from 'react';
import { Factory, Search, MapPin, Calendar, Boxes, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../services/userService';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const Manufacturers = () => {
  const [manufacturers, setManufacturers] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    userService
      .list({ role: 'manufacturer' })
      .then((res) => {
        // filter client-side just in case
        const list = (res.users || []).filter(u => u.role === 'manufacturer');
        setManufacturers(list);
      })
      .catch(() => {
        toast.error('Could not load manufacturers list');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = manufacturers.filter((m) =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.organization?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <LoadingSpinner label="Loading manufacturers network…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Manufacturers Network</h1>
        <p className="text-sm text-ink/60">Audit and collaborate with textile producers logging waste.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search manufacturer name or org…"
            className="input-field pl-10"
          />
        </div>
        <div className="text-xs text-ink/50 font-semibold bg-forest-50 border border-forest-100 px-3 py-1.5 rounded-lg flex items-center gap-1">
          <Sparkles size={13} className="text-forest-600" />
          {manufacturers.length} Connected Production Nodes
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16 text-ink/40">
          <Factory className="h-10 w-10 mx-auto text-ink/20 mb-3" />
          <p className="text-sm font-semibold">No manufacturers found</p>
          <p className="text-xs">Invite new manufacturers from the Users section to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <div key={m.id} className="card flex flex-col justify-between hover:shadow-soft transition-all duration-200">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 text-forest-600">
                    <Factory size={20} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-ink leading-tight">{m.name}</h3>
                    <p className="text-xs text-ink/50">{m.organization}</p>
                  </div>
                </div>
                
                <div className="border-t border-forest-50 pt-3 space-y-2 text-xs text-ink/70">
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-ink/40" />
                    <span>HQ Office Location (HQ)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-ink/40" />
                    <span>Member since: {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'Active'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Boxes size={13} className="text-ink/40" />
                    <span>System Status: <span className="text-forest-600 font-semibold">Verified Supplier</span></span>
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-forest-50 pt-3 flex items-center justify-between text-2xs text-ink/40 font-semibold">
                <span>EMAIL: {m.email}</span>
                <span className="bg-forest-500 text-white px-2 py-0.5 rounded uppercase tracking-wider text-3xs font-bold">Active</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Manufacturers;
