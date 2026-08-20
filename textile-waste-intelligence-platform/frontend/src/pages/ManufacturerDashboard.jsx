import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Download,
  Droplets,
  Factory,
  Leaf,
  Package,
  Recycle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';
import EmptyState from '../components/EmptyState.jsx';
import KpiCard from '../components/KpiCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { useAuth } from '../hooks/useAuth';
import { wasteService } from '../services/wasteService';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CHART_COLORS = ['#1F7A54', '#2563EB', '#D97706', '#7C3AED', '#EC4899', '#06B6D4', '#10B981'];

const formatKg = (value) => `${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const ManufacturerDashboard = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');

    try {
      const res = await wasteService.list({ page: 1, limit: 1000 });
      const rawRecords = Array.isArray(res?.records) ? res.records : [];
      setRecords(rawRecords);
    } catch (err) {
      console.error('Manufacturer dashboard error:', err);
      setError(err?.response?.data?.detail || 'Unable to load manufacturer dashboard data.');
      setRecords([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalWaste = useMemo(
    () => records.reduce((sum, batch) => sum + (Number(batch?.quantity) || 0), 0),
    [records]
  );

  const fabricBreakdown = useMemo(() => {
    const map = {};
    records.forEach((batch) => {
      const name = batch.fabricType || 'Other';
      map[name] = (map[name] || 0) + (Number(batch.quantity) || 0);
    });

    return Object.entries(map)
      .map(([name, quantity]) => ({
        name,
        quantity: Number(quantity.toFixed(1)),
        share: totalWaste > 0 ? Number(((quantity / totalWaste) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.quantity - a.quantity);
  }, [records, totalWaste]);

  const monthlyTrend = useMemo(() => {
    const buckets = {};
    records.forEach((batch) => {
      if (!batch?.collectionDate) return;
      const date = new Date(batch.collectionDate);
      const monthIndex = date.getMonth();
      const year = date.getFullYear();
      const key = `${year}-${monthIndex}`;
      buckets[key] = (buckets[key] || 0) + (Number(batch.quantity) || 0);
    });

    const now = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const quantity = Number((buckets[key] || 0).toFixed(1));
      return {
        month: MONTH_LABELS[date.getMonth()],
        quantity,
      };
    });
  }, [records]);

  const pendingWaste = useMemo(
    () => records
      .filter((batch) => (batch?.processingStatus || '').toLowerCase() === 'pending')
      .reduce((sum, batch) => sum + (Number(batch.quantity) || 0), 0),
    [records]
  );

  const recyclableBreakdown = useMemo(() => {
    const map = { Recyclable: 0, NonRecyclable: 0 };
    records.forEach((batch) => {
      const condition = batch?.condition || '';
      if (condition === 'Recyclable') {
        map.Recyclable += Number(batch.quantity) || 0;
      } else {
        map.NonRecyclable += Number(batch.quantity) || 0;
      }
    });

    return Object.entries(map).map(([name, value], index) => ({
      name,
      value: Number(value.toFixed(1)),
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [records]);

  const reusableQty = useMemo(
    () => records
      .filter((batch) => (batch?.condition || '').toLowerCase() === 'reusable')
      .reduce((sum, batch) => sum + (Number(batch.quantity) || 0), 0),
    [records]
  );

  const recyclableQty = useMemo(
    () => records
      .filter((batch) => (batch?.condition || '').toLowerCase() === 'recyclable')
      .reduce((sum, batch) => sum + (Number(batch.quantity) || 0), 0),
    [records]
  );

  const recycledQty = useMemo(
    () => records
      .filter((batch) => (batch?.processingStatus || '').toLowerCase() === 'recycled')
      .reduce((sum, batch) => sum + (Number(batch.quantity) || 0), 0),
    [records]
  );

  const wasteBatches = records.length;
  const diversionRate = totalWaste > 0 ? clamp(((recyclableQty + reusableQty + recycledQty) / totalWaste) * 100, 0, 100) : 0;
  const materialRecoveryRate = totalWaste > 0 ? clamp((recycledQty / totalWaste) * 100, 0, 100) : 0;
  const circularityScore = clamp(Math.round(diversionRate * 0.9 + materialRecoveryRate * 0.6), 0, 100);
  const sustainabilityScore = clamp(Math.round((circularityScore * 0.65) + (diversionRate * 0.35)), 0, 100);

  const recoveryRows = useMemo(() => {
    const byFabric = {};
    records.forEach((batch) => {
      const fabric = batch.fabricType || 'Other';
      const qty = Number(batch.quantity) || 0;
      if (!byFabric[fabric]) {
        byFabric[fabric] = { fabric, recovered: 0, reused: 0, total: 0 };
      }
      byFabric[fabric].total += qty;
      if ((batch.processingStatus || '').toLowerCase() === 'recycled') {
        byFabric[fabric].recovered += qty;
      }
      if ((batch.condition || '').toLowerCase() === 'reusable') {
        byFabric[fabric].reused += qty;
      }
    });

    return Object.values(byFabric)
      .map((item) => ({
        ...item,
        recoveryPercentage: item.total > 0 ? Number(((item.recovered + item.reused) / item.total * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [records]);

  const recoveryTrend = useMemo(() => {
    const buckets = {};
    records.forEach((batch) => {
      if (!batch.collectionDate) return;
      const date = new Date(batch.collectionDate);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const recoveredQty = (batch.processingStatus || '').toLowerCase() === 'recycled' ? (Number(batch.quantity) || 0) : 0;
      buckets[key] = (buckets[key] || 0) + recoveredQty;
    });

    const now = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const quantity = Number((buckets[key] || 0).toFixed(1));
      return {
        month: MONTH_LABELS[date.getMonth()],
        recovered: quantity,
      };
    });
  }, [records]);

  const sustainabilityMetrics = useMemo(() => ({
    co2Avoided: Number((totalWaste * 0.62).toFixed(1)),
    waterSavings: Number((totalWaste * 18).toFixed(1)),
    energySavings: Number((totalWaste * 7.5).toFixed(1)),
  }), [totalWaste]);

  const recommendedActions = useMemo(() => {
    const items = [];
    if (recyclableQty > 0) {
      items.push('Prioritize recycling streams for recyclable material to improve diversion and recovery rates.');
    }
    if (reusableQty > 0) {
      items.push('Re-route reusable material into internal reuse loops instead of disposal.');
    }
    if (fabricBreakdown[0]) {
      items.push(`Increase sorting and collection efficiency for ${fabricBreakdown[0].name} waste to capture more recovery value.`);
    }
    if (items.length === 0) {
      items.push('Add more waste inventory entries to unlock circular-economy recommendations.');
    }
    return items.slice(0, 3);
  }, [fabricBreakdown, recyclableQty, reusableQty]);

  const hasData = records.length > 0 && totalWaste > 0;

  const handleDownloadFullReport = () => {
    if (!hasData) {
      toast.error('No data available to generate a manufacturer report.');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const manufacturerName = user?.name || 'Manufacturer';

    doc.setFillColor(27, 122, 84);
    doc.rect(0, 0, pageWidth, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('Textile Waste Intelligence Platform', 14, 14);
    doc.setFontSize(10);
    doc.text('Manufacturer Dashboard Full Report', 14, 20);

    doc.setTextColor(15, 23, 42);
    let y = 34;
    doc.setFontSize(11);
    doc.text(`Manufacturer: ${manufacturerName}`, 14, y);
    y += 7;
    doc.text(`Report generation date: ${new Date().toLocaleString()}`, 14, y);
    y += 12;

    doc.setFontSize(13);
    doc.setTextColor(27, 122, 84);
    doc.text('Production Waste Summary', 14, y);
    y += 8;

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10.5);
    const summaryRows = [
      ['Total production waste', formatKg(totalWaste)],
      ['Waste batches', String(wasteBatches)],
      ['Pending waste processing', formatKg(pendingWaste)],
      ['Recyclable waste', formatKg(recyclableQty)],
      ['Reusable waste', formatKg(reusableQty)],
      ['Circularity score', `${circularityScore}%`],
      ['Waste diversion percentage', `${Number(diversionRate).toFixed(1)}%`],
    ];

    autoTable(doc, {
      startY: y,
      head: [['Metric', 'Value']],
      body: summaryRows,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [27, 122, 84], textColor: [255, 255, 255] },
    });

    y = doc.lastAutoTable.finalY + 12;
    doc.setFontSize(13);
    doc.setTextColor(27, 122, 84);
    doc.text('Circular Economy Insights', 14, y);
    y += 8;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10.5);
    const insightItems = [
      `Reuse potential: ${formatKg(reusableQty)}`,
      `Recycling potential: ${formatKg(recyclableQty)}`,
      `Material recovery potential: ${formatKg(recycledQty)}`,
      `Waste diversion percentage: ${Number(diversionRate).toFixed(1)}%`,
      `Circularity score: ${circularityScore}/100`,
      `Recommended actions: ${recommendedActions.join(' ')}`,
    ];
    insightItems.forEach((line) => {
      const wrapped = doc.splitTextToSize(line, pageWidth - 30);
      doc.text(wrapped, 14, y);
      y += wrapped.length * 6 + 2;
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
    });

    if (y > 180) {
      doc.addPage();
      y = 18;
    }

    doc.setFontSize(13);
    doc.setTextColor(27, 122, 84);
    doc.text('Material Recovery by Fabric Type', 14, y);
    y += 8;
    doc.setTextColor(15, 23, 42);
    const fabricTable = recoveryRows.map((row) => [row.fabric, formatKg(row.total), `${row.recoveryPercentage}%`]);
    autoTable(doc, {
      startY: y,
      head: [['Fabric Type', 'Total Volume', 'Recovery %']],
      body: fabricTable,
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] },
      margin: { left: 14 },
    });

    doc.save(`manufacturer-dashboard-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success('Full manufacturer report downloaded as PDF');
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading manufacturer dashboard…" />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="card border-red-200 bg-red-50/60">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
            <div>
              <h2 className="font-display text-lg font-bold text-ink">Unable to load dashboard</h2>
              <p className="mt-1 text-sm text-ink/70">{error}</p>
            </div>
          </div>
          <button onClick={() => fetchData()} className="btn-secondary mt-4">Retry</button>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <EmptyState
        icon={Factory}
        title="No manufacturer data available"
        description="Your textile inventory is empty right now. Once waste batches are added, this dashboard will show production, recovery, and sustainability insights."
        action={
          <Link to="/inventory/add" className="btn-primary mt-1">
            Add inventory item
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Manufacturer Dashboard</h1>
          <p className="text-sm text-ink/60">Production, circularity, recovery, and sustainability performance for {user?.name || 'your facility'}.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setIsRefreshing(true); fetchData(); }} className="btn-secondary flex items-center gap-1.5" disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button onClick={handleDownloadFullReport} className="btn-primary flex items-center gap-1.5">
            <Download className="h-4 w-4" />
            Download Full Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total production waste" value={formatKg(totalWaste)} sublabel="Across all tracked batches" icon={Package} tone="forest" trend={{ direction: 'up', value: 'Live' }} />
        <KpiCard label="Waste batches" value={String(wasteBatches)} sublabel="Registered inventory entries" icon={Factory} tone="ledger" trend={{ direction: 'up', value: 'Current' }} />
        <KpiCard label="Pending waste processing" value={formatKg(pendingWaste)} sublabel="Awaiting processing" icon={AlertTriangle} tone="amber" trend={{ direction: 'down', value: 'Review' }} />
        <KpiCard label="Waste diversion %" value={`${Number(diversionRate).toFixed(1)}%`} sublabel="Recovered + reused share" icon={Recycle} tone="ink" trend={{ direction: 'up', value: 'Target' }} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-ink">Production Waste Analysis</h3>
              <p className="text-xs text-ink/50">Waste generated by fabric and material type</p>
            </div>
            <BarChart3 className="h-4 w-4 text-forest-600" />
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={fabricBreakdown.slice(0, 6)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAF4EE" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#12211B99' }} />
              <YAxis tick={{ fontSize: 11, fill: '#12211B99' }} />
              <Tooltip formatter={(value) => [`${value} kg`, 'Waste']} contentStyle={{ borderRadius: 10, border: '1px solid #D2E8DC', fontSize: 12 }} />
              <Bar dataKey="quantity" radius={[6, 6, 0, 0]} fill="#1F7A54" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-ink">Recyclable vs non-recyclable</h3>
              <p className="text-xs text-ink/50">Current inventory split by recovery category</p>
            </div>
            <Recycle className="h-4 w-4 text-forest-600" />
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={recyclableBreakdown} dataKey="value" nameKey="name" innerRadius={52} outerRadius={86} paddingAngle={3}>
                {recyclableBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} kg`, 'Waste']} contentStyle={{ borderRadius: 10, border: '1px solid #D2E8DC', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink/70">
            {recyclableBreakdown.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                {item.name}: {formatKg(item.value)}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-ink">Monthly production waste trend</h3>
              <p className="text-xs text-ink/50">Trailing six months of generation volume</p>
            </div>
            <TrendingUp className="h-4 w-4 text-forest-600" />
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAF4EE" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#12211B99' }} />
              <YAxis tick={{ fontSize: 11, fill: '#12211B99' }} />
              <Tooltip formatter={(value) => [`${value} kg`, 'Waste']} contentStyle={{ borderRadius: 10, border: '1px solid #D2E8DC', fontSize: 12 }} />
              <Line type="monotone" dataKey="quantity" stroke="#2563EB" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-ink">Circular Economy Insights</h3>
              <p className="text-xs text-ink/50">Recovery opportunities based on inventory profile</p>
            </div>
            <Leaf className="h-4 w-4 text-forest-600" />
          </div>
          <div className="space-y-3">
            <div className="rounded-lg bg-forest-50 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-forest-700">Reuse potential</p>
              <p className="mt-1 text-xl font-bold text-ink">{formatKg(reusableQty)}</p>
            </div>
            <div className="rounded-lg bg-ledger-50 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-ledger-700">Recycling potential</p>
              <p className="mt-1 text-xl font-bold text-ink">{formatKg(recyclableQty)}</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-amber-700">Material recovery potential</p>
              <p className="mt-1 text-xl font-bold text-ink">{formatKg(recycledQty)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-700">Circularity score</p>
              <p className="mt-1 text-xl font-bold text-ink">{circularityScore}/100</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-ink/70">
            {recommendedActions.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-forest-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-ink">Material Recovery Reports</h3>
              <p className="text-xs text-ink/50">Recovered material by fabric type and recovery percentage</p>
            </div>
            <Sparkles className="h-4 w-4 text-forest-600" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-forest-100 text-ink/60">
                  <th className="pb-2 pr-4 font-medium">Fabric</th>
                  <th className="pb-2 pr-4 font-medium">Recovered</th>
                  <th className="pb-2 pr-4 font-medium">Recovery %</th>
                  <th className="pb-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {recoveryRows.map((row) => (
                  <tr key={row.fabric} className="border-b border-forest-50 last:border-0">
                    <td className="py-3 pr-4 font-medium text-ink">{row.fabric}</td>
                    <td className="py-3 pr-4 text-ink/70">{formatKg(row.recovered + row.reused)}</td>
                    <td className="py-3 pr-4 text-ink/70">{row.recoveryPercentage}%</td>
                    <td className="py-3 text-ink/70">{formatKg(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-ink">Recovery trend</h3>
              <p className="text-xs text-ink/50">Recovered material over the past six months</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-forest-600" />
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={recoveryTrend}>
              <defs>
                <linearGradient id="recoveryFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAF4EE" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#12211B99' }} />
              <YAxis tick={{ fontSize: 11, fill: '#12211B99' }} />
              <Tooltip formatter={(value) => [`${value} kg`, 'Recovered']} contentStyle={{ borderRadius: 10, border: '1px solid #D2E8DC', fontSize: 12 }} />
              <Area type="monotone" dataKey="recovered" stroke="#10B981" fill="url(#recoveryFill)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-ink">Sustainability Performance</h3>
            <p className="text-xs text-ink/50">KPI summary and monthly performance signals</p>
          </div>
          <ShieldCheck className="h-4 w-4 text-forest-600" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Sustainability score" value={`${sustainabilityScore}%`} sublabel="Weighted operational score" icon={Leaf} tone="forest" />
          <KpiCard label="CO2 emissions avoided" value={formatKg(sustainabilityMetrics.co2Avoided)} sublabel="Estimated annualized impact" icon={ArrowUpRight} tone="ledger" />
          <KpiCard label="Water savings" value={formatKg(sustainabilityMetrics.waterSavings)} sublabel="Based on processing reduction" icon={Droplets} tone="amber" />
          <KpiCard label="Energy/resource savings" value={formatKg(sustainabilityMetrics.energySavings)} sublabel="Operational efficiency gain" icon={Zap} tone="ink" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-xl border border-forest-100 bg-forest-50/50 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-forest-700">Material recovery rate</p>
            <p className="mt-2 text-2xl font-bold text-ink">{Number(materialRecoveryRate).toFixed(1)}%</p>
            <p className="mt-1 text-sm text-ink/60">Recovered material as a share of total production waste.</p>
          </div>
          <div className="rounded-xl border border-forest-100 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-ink/60">Waste diversion rate</p>
            <p className="mt-2 text-2xl font-bold text-ink">{Number(diversionRate).toFixed(1)}%</p>
            <p className="mt-1 text-sm text-ink/60">Combined reuse and recycling performance.</p>
          </div>
        </div>

        <div className="mt-6">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAF4EE" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#12211B99' }} />
              <YAxis tick={{ fontSize: 11, fill: '#12211B99' }} />
              <Tooltip formatter={(value) => [`${value} kg`, 'Sustainability']} contentStyle={{ borderRadius: 10, border: '1px solid #D2E8DC', fontSize: 12 }} />
              <Bar dataKey="quantity" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ManufacturerDashboard;
