import React, { useEffect, useState } from 'react';
import KpiCard from '../components/KpiCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { sustainabilityService } from '../services/sustainabilityService';
import { Leaf, Globe, BarChart as BarIcon } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

const COLORS = ['#16a34a', '#2563eb', '#d97706', '#7c3aed', '#0891b2'];

const SustainabilityDashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = async () => {
    setIsLoading(true);
    try {
      const res = await sustainabilityService.dashboard();
      if (res.success) setData(res);
    } catch (err) {
      // noop
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  if (isLoading) return <LoadingSpinner label="Loading dashboard..." />;
  if (!data) return <EmptyState title="Unable to load dashboard data" description="No data available" />;

  const totals = data.totals || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Sustainability Manager Dashboard</h1>
        <p className="text-sm text-ink/60">High-level sustainability metrics, carbon savings, and diversion analytics.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Avg Sustainability" value={`${data.summary.get('total_waste_kg',0) ? data.summary.get('total_waste_kg') : 0 }`} icon={Leaf} tone="forest" />
        <KpiCard label="Avg Circularity" value={`${data.summary.get('recyclable_weight_kg',0)}`} icon={Leaf} tone="blue" />
        <KpiCard label="Recyclability %" value={`${data.totals ? data.totals.waste_diversion_percent : 0}%`} icon={BarIcon} tone="amber" />
        <KpiCard label="Estimated CO2 Savings" value={`${totals.total_co2_savings_kg || 0} kg`} icon={Globe} tone="ink" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card">
          <h3 className="font-display text-sm font-bold text-ink">CO2 Savings by Material</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.totals.co2_by_material || []}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="font-display text-sm font-bold text-ink">Waste Diversion</h3>
          <div className="mt-3">
            <p className="text-2xs text-ink/60">Total Diverted: {data.totals.total_waste_diverted_kg} kg ({data.totals.waste_diversion_percent}%)</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SustainabilityDashboard;
