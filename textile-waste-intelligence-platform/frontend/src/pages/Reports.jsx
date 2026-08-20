import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, Download, Printer } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { reportService } from '../services/reportService';

const PIE_COLORS = ['#1F7A54', '#2563EB', '#D97706', '#0EA5A4', '#7C3AED', '#71B491', '#4E7FD6', '#DC2626'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Reports = () => {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    reportService
      .summary()
      .then((res) => {
        if (res?.success) {
          setReport(res);
        } else {
          toast.error('Could not load report data');
        }
      })
      .catch(() => toast.error('Could not load report data'))
      .finally(() => setIsLoading(false));
  }, []);

  const summary = report?.summary;
  const classification = report?.waste_classification || [];
  const sustainability = report?.sustainability_summary || [];
  const recommendations = report?.recommendations || [];

  const fabricPieData = useMemo(
    () => (summary?.material_breakdown || []).map((f) => ({ name: f.name, value: Math.round(f.value * 10) / 10 })),
    [summary]
  );

  const sourceBarData = useMemo(
    () =>
      (summary?.category_breakdown || []).map((s) => ({
        name: s.name,
        quantity: Math.round(s.value * 10) / 10,
      })),
    [summary]
  );

  const trendAreaData = useMemo(
    () =>
      (summary?.material_breakdown || []).map((m, index) => ({
        label: m.name,
        quantity: Math.round(m.value * 10) / 10,
      })),
    [summary]
  );

  if (isLoading) return <LoadingSpinner label="Building reports…" />;

  const hasData = summary && summary.total_batches > 0;

  const exportCsv = () => {
    if (!summary) return;
    const rows = [];
    rows.push(['Report Title', summary.report_title || 'Textile Waste Intelligence Report']);
    rows.push(['Generated At', summary.generated_at || new Date().toISOString()]);
    rows.push(['Total Batches', summary.total_batches]);
    rows.push(['Total Waste (kg)', summary.total_waste_kg]);
    rows.push(['Recyclable Weight (kg)', summary.recyclable_weight_kg]);
    rows.push(['Pending Batches', summary.pending_batches]);
    rows.push(['AI Analyses', summary.ai_analyses]);
    rows.push([]);
    rows.push(['Material Breakdown']);
    rows.push(['Material', 'Quantity (kg)']);
    summary.material_breakdown?.forEach((item) => rows.push([item.name, item.value]));
    rows.push([]);
    rows.push(['Category Breakdown']);
    rows.push(['Condition', 'Quantity (kg)']);
    summary.category_breakdown?.forEach((item) => rows.push([item.name, item.value]));

    const csvContent = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `textile_reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report CSV downloaded');
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Sustainability Reports</h1>
          <p className="text-sm text-ink/60">Aggregate view of waste composition, classification, and impact across the platform.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={printReport} className="btn-secondary flex items-center gap-1.5">
            <Printer size={16} /> Print report
          </button>
          <button onClick={exportCsv} className="btn-primary flex items-center gap-1.5">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          icon={BarChart3}
          title="No data to report on yet"
          description="Register waste batches to unlock fabric distribution, source, and trend analytics."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="card">
              <p className="text-sm font-medium text-ink/60">Total Waste</p>
              <p className="mt-1 font-display text-2xl font-bold text-ink">{summary.total_waste_kg.toLocaleString()} kg</p>
            </div>
            <div className="card">
              <p className="text-sm font-medium text-ink/60">Total Batches</p>
              <p className="mt-1 font-display text-2xl font-bold text-ink">{summary.total_batches}</p>
            </div>
            <div className="card">
              <p className="text-sm font-medium text-ink/60">Pending Batches</p>
              <p className="mt-1 font-display text-2xl font-bold text-ink">{summary.pending_batches}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="card">
              <h3 className="font-display text-base font-bold text-ink">Material Breakdown</h3>
              <p className="mb-2 text-xs text-ink/50">Total quantity by material category</p>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={fabricPieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                    {fabricPieData.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #D2E8DC', fontSize: 13 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="font-display text-base font-bold text-ink">Condition Breakdown</h3>
              <p className="mb-2 text-xs text-ink/50">Quantity by waste condition</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={sourceBarData} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EBF5EF" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#12211B99' }} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12, fill: '#12211B99' }} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #D2E8DC', fontSize: 13 }} />
                  <Bar dataKey="quantity" fill="#2563EB" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3 className="font-display text-base font-bold text-ink">Actionable Recommendations</h3>
            <p className="mb-2 text-xs text-ink/50">Prioritized sustainability and recycling actions for platform operators.</p>
            <div className="space-y-3">
              {recommendations.length === 0 ? (
                <p className="text-sm text-ink/70">No recommendations available at this time.</p>
              ) : (
                recommendations.map((recommendation, idx) => (
                  <div key={idx} className="rounded-2xl border border-forest-100 bg-forest-50/50 p-4">
                    <p className="text-sm font-semibold text-ink">{recommendation.title}</p>
                    <p className="mt-1 text-sm text-ink/75">{recommendation.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="border-b border-forest-100 px-5 py-4">
              <h3 className="font-display text-sm font-bold text-ink">Waste Classification</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-forest-100 bg-forest-50 text-xs uppercase tracking-wide text-ink/50">
                    <th className="py-3 px-4">Batch ID</th>
                    <th className="py-3 px-4">Material</th>
                    <th className="py-3 px-4">Condition</th>
                    <th className="py-3 px-4">Quantity (kg)</th>
                    <th className="py-3 px-4">Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-100">
                  {classification.map((item) => (
                    <tr key={item.batch_id} className="hover:bg-forest-50/40">
                      <td className="py-3 px-4 text-ink/80">{item.batch_id}</td>
                      <td className="py-3 px-4 text-ink/80">{item.material}</td>
                      <td className="py-3 px-4 text-ink/80">{item.category}</td>
                      <td className="py-3 px-4 text-ink/80">{item.quantity}</td>
                      <td className="py-3 px-4 text-ink/80">{item.classification}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="border-b border-forest-100 px-5 py-4">
              <h3 className="font-display text-sm font-bold text-ink">Sustainability Analysis</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-forest-100 bg-forest-50 text-xs uppercase tracking-wide text-ink/50">
                    <th className="py-3 px-4">Fabric</th>
                    <th className="py-3 px-4">Sustainability Score</th>
                    <th className="py-3 px-4">Circularity Score</th>
                    <th className="py-3 px-4">CO2 Savings (kg)</th>
                    <th className="py-3 px-4">Water Savings (L)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-100">
                  {sustainability.map((item) => (
                    <tr key={item.id} className="hover:bg-forest-50/40">
                      <td className="py-3 px-4 text-ink/80">{item.fabric_type}</td>
                      <td className="py-3 px-4 text-ink/80">{item.sustainability_score}</td>
                      <td className="py-3 px-4 text-ink/80">{item.circularity_score}</td>
                      <td className="py-3 px-4 text-ink/80">{item.co2_savings_kg}</td>
                      <td className="py-3 px-4 text-ink/80">{item.water_savings_liters}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
