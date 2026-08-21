import React, { useEffect, useState } from 'react';
import { Building2, Search, MapPin, Calendar, Recycle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../services/userService';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const RecyclingFacilities = () => {
  const [recyclers, setRecyclers] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    userService
      .list({ role: 'recycler' })
      .then((res) => {
        const list = (res.users || []).filter(u => u.role === 'recycler');
        setRecyclers(list);
      })
      .catch(() => {
        toast.error('Could not load recycling facilities');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = recyclers.filter((m) =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.organization?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <LoadingSpinner label="Loading recycling facilities..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Recycling Facilities</h1>
        <p className="text-sm text-ink/60">Manage integrated circular hubs and processors sorting textiles.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            value={search}
            onChange={(e) => setSearchInput ? setSearch(e.target.value) : setSearch(e.target.value)}
            placeholder="Search recycling hub name or org…"
            className="input-field pl-10"
          />
        </div>
        <div className="text-xs text-ink/50 font-semibold bg-ledger-50 border border-ledger-100 px-3 py-1.5 rounded-lg flex items-center gap-1">
          <Sparkles size={13} className="text-ledger-600" />
          {recyclers.length} Registered Recovery Points
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16 text-ink/40">
          <Building2 className="h-10 w-10 mx-auto text-ink/20 mb-3" />
          <p className="text-sm font-semibold">No recycling facilities found</p>
          <p className="text-xs">Invite new recyclers from the Users section to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <div key={m.id} className="card flex flex-col justify-between hover:shadow-soft transition-all duration-200">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ledger-50 text-ledger-600">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-ink leading-tight">{m.name}</h3>
                    <p className="text-xs text-ink/50">{m.organization}</p>
                  </div>
                </div>
                
                <div className="border-t border-forest-50 pt-3 space-y-2 text-xs text-ink/70">
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-ink/40" />
                    <span>Processing Station (Region Base)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-ink/40" />
                    <span>Onboard Date: {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'Active'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Recycle size={13} className="text-ink/40" />
                    <span>Primary Stream: <span className="text-ledger-600 font-semibold">Mechanical & Chemical</span></span>
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-forest-50 pt-3 flex items-center justify-between text-2xs text-ink/40 font-semibold">
                <span>EMAIL: {m.email}</span>
                <span className="bg-ledger-500 text-white px-2 py-0.5 rounded uppercase tracking-wider text-3xs font-bold">Operational</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecyclingFacilities;
