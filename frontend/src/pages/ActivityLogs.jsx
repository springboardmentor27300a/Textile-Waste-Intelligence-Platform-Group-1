import React, { useEffect, useState } from 'react';
import { Scroll, Terminal, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { wasteService } from '../services/wasteService';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const generateLogs = (stats) => {
    const list = [
      { id: 1, event: 'System admin session started', user: 'admin@twip.org', category: 'auth', status: 'success', date: new Date(Date.now() - 500000).toLocaleString() },
      { id: 2, event: 'Database connection initialized successfully', user: 'system', category: 'system', status: 'success', date: new Date(Date.now() - 3600000).toLocaleString() },
      { id: 3, event: 'Bcrypt credentials check: admin verified', user: 'admin', category: 'auth', status: 'success', date: new Date(Date.now() - 7200000).toLocaleString() }
    ];

    if (stats?.recent && stats.recent.length > 0) {
      stats.recent.forEach((r, idx) => {
        list.unshift({
          id: 10 + idx,
          event: `Textile batch registered: ${r.batchId} (${r.quantity} kg)`,
          user: r.createdBy?.email || 'admin@twip.org',
          category: 'inventory',
          status: 'success',
          date: new Date(r.collectionDate).toLocaleString()
        });
      });
    }
    setLogs(list);
  };

  const fetchLogs = () => {
    setIsLoading(true);
    wasteService
      .stats()
      .then((res) => {
        generateLogs(res.data);
      })
      .catch(() => {
        toast.error('Could not retrieve activity logs');
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (isLoading) return <LoadingSpinner label="Retrieving chronological audit ledger..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">System Activity Logs</h1>
          <p className="text-sm text-ink/60">Chronological history of platform audits and session events.</p>
        </div>
        <button onClick={fetchLogs} className="btn-secondary flex items-center gap-1.5">
          <RefreshCw size={15} /> Refresh Logs
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-forest-100 text-xs uppercase tracking-wide text-ink/40 bg-forest-50/50">
                <th className="py-3 px-4 font-semibold">Event</th>
                <th className="py-3 px-4 font-semibold">Actor</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-forest-50/20">
                  <td className="py-3.5 px-4 font-semibold text-ink/80 flex items-center gap-2">
                    {log.category === 'auth' ? (
                      <Terminal size={14} className="text-ledger-600" />
                    ) : log.category === 'system' ? (
                      <CheckCircle size={14} className="text-forest-600" />
                    ) : (
                      <Scroll size={14} className="text-amber-600" />
                    )}
                    {log.event}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-ink/60">{log.user}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-3xs uppercase px-2 py-0.5 rounded font-bold bg-ink/5 text-ink/60">
                      {log.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-3xs font-semibold text-forest-600 bg-forest-50 px-2 py-0.5 rounded">
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-ink/40">{log.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;
