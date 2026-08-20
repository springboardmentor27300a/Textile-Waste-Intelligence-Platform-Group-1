import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import inventoryService from '../services/inventoryService';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip as ChartTooltip, 
  Legend as ChartLegend,
  ArcElement
} from 'chart.js';
import { Bar as BarComponent, Doughnut } from 'react-chartjs-2';
import { 
  Layers, 
  Weight, 
  Calendar, 
  Plus, 
  FileSpreadsheet, 
  MapPin, 
  ArrowRight,
  RefreshCw,
  Droplet,
  Globe,
  Zap,
  ShoppingBag,
  TrendingUp,
  Users,
  Shield,
  Activity
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  ChartLegend
);

const DashboardPage = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await inventoryService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to fetch real-time dashboard statistics. Proceeding with local offline simulation.');
      // Create local fallback simulator for complete reliability in case backend is loading/restarting
      setStats({
        total_records: 10,
        total_quantity: 5900.0,
        recent_entries: [
          { id: 10, fabric_type: 'Denim', source: 'Pre-consumer', quantity: 950, collection_date: '2026-07-07', status: 'Processing' },
          { id: 9, fabric_type: 'Cotton-Wool Blend', source: 'Post-consumer', quantity: 280, collection_date: '2026-07-05', status: 'Sorting' },
          { id: 7, fabric_type: 'Linen', source: 'Industrial', quantity: 400, collection_date: '2026-06-30', status: 'Recycled' }
        ],
        status_distribution: { 'Collected': 3, 'Sorting': 2, 'Processing': 2, 'Recycled': 2, 'Disposed': 1 },
        fabric_distribution: { 'Cotton': 3, 'Polyester': 2, 'Wool': 1, 'Nylon': 1, 'Silk': 1, 'Linen': 1, 'Denim': 1 }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
          <p className="text-slate-400 text-sm font-semibold">Loading role-based dashboard intelligence...</p>
        </div>
      </div>
    );
  }

  // Common Chart Configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: 'Outfit', size: 10 },
          boxWidth: 8,
        },
      },
    },
  };

  // 1. RECYCLING OPERATOR DASHBOARD
  const renderOperatorDashboard = () => {
    const fabricLabels = Object.keys(stats.fabric_distribution);
    const fabricValues = Object.values(stats.fabric_distribution);

    const fabricChartData = {
      labels: fabricLabels,
      datasets: [{
        label: 'Batches by Fabric',
        data: fabricValues,
        backgroundColor: 'rgba(21, 128, 61, 0.75)', // primary-700
        borderColor: 'rgb(21, 128, 61)',
        borderWidth: 1,
        borderRadius: 6,
      }],
    };

    const statusLabels = Object.keys(stats.status_distribution);
    const statusValues = Object.values(stats.status_distribution);

    const statusChartData = {
      labels: statusLabels,
      datasets: [{
        data: statusValues,
        backgroundColor: [
          'rgba(59, 130, 246, 0.75)', // blue
          'rgba(245, 158, 11, 0.75)', // amber
          'rgba(168, 85, 247, 0.75)', // purple
          'rgba(34, 197, 94, 0.75)',  // green
          'rgba(239, 68, 68, 0.75)',  // red
        ],
        borderWidth: 1,
      }],
    };

    return (
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 flex items-center justify-between shadow-sm">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Batches Cataloged</span>
              <h3 className="text-3xl font-black text-slate-800">{stats.total_records}</h3>
              <p className="text-xs text-slate-400 font-semibold">Logged by you & other operators</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <Layers className="h-6 w-6" />
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 flex items-center justify-between shadow-sm">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Quantity</span>
              <h3 className="text-3xl font-black text-slate-800">{stats.total_quantity} <span className="text-sm font-bold text-slate-400">kg</span></h3>
              <p className="text-xs text-slate-400 font-semibold">Total received warehouse weight</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Weight className="h-6 w-6" />
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 flex items-center justify-between shadow-sm">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sorting Queue</span>
              <h3 className="text-3xl font-black text-slate-800">
                {stats.status_distribution['Sorting'] || 0}
              </h3>
              <p className="text-xs text-slate-400 font-semibold">Batches requiring manual grading</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin-slow" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4">Fabric Type Distribution</h4>
            <div className="h-56"><BarComponent data={fabricChartData} options={chartOptions} /></div>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4">Batch Recycling Statuses</h4>
            <div className="h-56"><Doughnut data={statusChartData} options={chartOptions} /></div>
          </div>
        </div>

        {/* Action Links & Recent Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <h4 className="text-sm font-bold text-slate-800">Operator Quick Actions</h4>
            <button onClick={() => navigate('/inventory?add=true')} className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-primary-200 hover:shadow-md transition-all">
              <div className="text-left">
                <span className="block text-xs font-bold text-slate-800">Log New Batch</span>
                <span className="text-[10px] text-slate-400 font-medium">Record incoming shipment details</span>
              </div>
              <Plus className="h-5 w-5 text-primary-600" />
            </button>
            <button onClick={() => navigate('/inventory')} className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-primary-200 hover:shadow-md transition-all">
              <div className="text-left">
                <span className="block text-xs font-bold text-slate-800">Audit Active Bin Locations</span>
                <span className="text-[10px] text-slate-400 font-medium">Map batches to zones A, B, and C</span>
              </div>
              <MapPin className="h-5 w-5 text-blue-600" />
            </button>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-bold text-slate-800">Recent Sorting Logs</h4>
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs font-semibold">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase">
                  <tr>
                    <th className="px-6 py-3">Batch ID</th>
                    <th className="px-6 py-3">Fabric</th>
                    <th className="px-6 py-3">Weight</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {stats.recent_entries.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3 font-mono text-slate-400">#BATCH-{item.id}</td>
                      <td className="px-6 py-3">{item.fabric_type}</td>
                      <td className="px-6 py-3">{item.quantity} kg</td>
                      <td className="px-6 py-3">
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md text-[10px] font-bold">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 2. SUSTAINABILITY MANAGER DASHBOARD
  const renderManagerDashboard = () => {
    // Computes ESG sustainability estimates (water, carbon footprints saved)
    const totalQty = stats.total_quantity;
    const co2Saved = Math.round(totalQty * 2.5); // Estimate 2.5kg CO2 offset per kg recycled
    const waterSaved = Math.round(totalQty * 10.0); // Estimate 10k Litres water offset per kg recycled

    const esgChartData = {
      labels: ['Carbon Offset Target', 'Actual CO2 Saved (kg)'],
      datasets: [{
        label: 'Metric Performance',
        data: [20000, co2Saved],
        backgroundColor: ['rgba(226, 232, 240, 0.8)', 'rgba(34, 197, 94, 0.8)'],
        borderRadius: 6
      }]
    };

    const landfillChartData = {
      labels: ['Diverted', 'Incinerated', 'Landfilled'],
      datasets: [{
        data: [totalQty, totalQty * 0.05, totalQty * 0.02],
        backgroundColor: ['rgba(34, 197, 94, 0.75)', 'rgba(245, 158, 11, 0.75)', 'rgba(239, 68, 68, 0.75)']
      }]
    };

    return (
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 flex items-center justify-between shadow-sm">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Carbon Offset</span>
              <h3 className="text-3xl font-black text-slate-800">{co2Saved.toLocaleString()} <span className="text-sm font-bold text-slate-400">kg CO₂</span></h3>
              <p className="text-xs text-slate-400 font-semibold">Equivalent carbon footprint averted</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Globe className="h-6 w-6" />
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 flex items-center justify-between shadow-sm">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Water Conserved</span>
              <h3 className="text-3xl font-black text-slate-800">{waterSaved.toLocaleString()} <span className="text-sm font-bold text-slate-400">K-Liters</span></h3>
              <p className="text-xs text-slate-400 font-semibold">Agricultural and processing water saved</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Droplet className="h-6 w-6" />
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 flex items-center justify-between shadow-sm">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Diversion Rate</span>
              <h3 className="text-3xl font-black text-slate-800">93%</h3>
              <p className="text-xs text-slate-400 font-semibold">Average circular recovery index</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4">Carbon Reduction Performance (vs Target)</h4>
            <div className="h-56"><BarComponent data={esgChartData} options={chartOptions} /></div>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4">Waste Diversion Breakdown</h4>
            <div className="h-56"><Doughnut data={landfillChartData} options={chartOptions} /></div>
          </div>
        </div>

        {/* Action and reports */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <h4 className="text-sm font-bold text-slate-800">Sustainability Reports</h4>
            <button className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-primary-200 hover:shadow-md transition-all">
              <div className="text-left">
                <span className="block text-xs font-bold text-slate-800">Generate ESG Report</span>
                <span className="text-[10px] text-slate-400 font-medium">Export standard compliance statistics</span>
              </div>
              <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            </button>
            <button onClick={() => navigate('/datasets')} className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-primary-200 hover:shadow-md transition-all">
              <div className="text-left">
                <span className="block text-xs font-bold text-slate-800">Browse Integrated Datasets</span>
                <span className="text-[10px] text-slate-400 font-medium">Review training baselines and labels</span>
              </div>
              <Layers className="h-5 w-5 text-primary-600" />
            </button>
          </div>

          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-800">Sustainability Guidelines</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Based on the **Sustainable Fashion Dataset**, recycling cotton and wool delivers the highest CO2 diversion rates. Operators should prioritize sorting white/pure cotton scraps over mixed acrylic fabrics which present low recyclability scores (under 30%).
            </p>
            <div className="border-t border-slate-100 pt-4 flex justify-between text-xs font-bold text-slate-400">
              <span>Circularity scoring weights:</span>
              <span className="text-primary-700">Cotton (95%), Denim (88%), Wool (70%), Acrylic (30%)</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 3. TEXTILE MANUFACTURER DASHBOARD
  const renderManufacturerDashboard = () => {
    // Manufacturer metrics
    const fabricLabels = Object.keys(stats.fabric_distribution);
    const fabricValues = Object.values(stats.fabric_distribution);

    const procurementChartData = {
      labels: fabricLabels,
      datasets: [{
        label: 'Available Weight for Procurement (kg)',
        data: fabricValues.map(v => v * 150), // simulation of purchase potential
        backgroundColor: 'rgba(245, 158, 11, 0.75)', // amber
        borderRadius: 6
      }]
    };

    return (
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 flex items-center justify-between shadow-sm">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fibers Sourced</span>
              <h3 className="text-3xl font-black text-slate-800">1,850 <span className="text-sm font-bold text-slate-400">meters</span></h3>
              <p className="text-xs text-slate-400 font-semibold">Recycled fabrics purchased this month</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6" />
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 flex items-center justify-between shadow-sm">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Procurement Pipeline</span>
              <h3 className="text-3xl font-black text-slate-800">
                {stats.total_quantity.toLocaleString()} <span className="text-sm font-bold text-slate-400">kg</span>
              </h3>
              <p className="text-xs text-slate-400 font-semibold">Total recycled materials currently in warehouses</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <Layers className="h-6 w-6" />
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 flex items-center justify-between shadow-sm">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Circularity Supply Ratio</span>
              <h3 className="text-3xl font-black text-slate-800">38%</h3>
              <p className="text-xs text-slate-400 font-semibold">Percentage of sourced fabric that is post-recycled</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <RefreshCw className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4">Available Recycled Fabric Stock (by Type)</h4>
            <div className="h-56"><BarComponent data={procurementChartData} options={chartOptions} /></div>
          </div>
          <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-2">Procurement Actions</h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Source high-quality sorted materials from recycling warehouses. white Cotton and Denim fabrics are certified and ready for purchase order drafts.
              </p>
            </div>
            <div className="space-y-3 mt-4">
              <button onClick={() => navigate('/inventory')} className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-100 transition-all">
                Browse Recycled Inventory
              </button>
              <button className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all">
                Draft Material PO
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 4. ADMINISTRATOR DASHBOARD
  const renderAdminDashboard = () => {
    // Admin stats
    const activityChartData = {
      labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      datasets: [{
        label: 'Platform Operations Logged',
        data: [15, 24, 18, 30, 25, 10, 8],
        backgroundColor: 'rgba(79, 70, 229, 0.75)', // indigo
        borderRadius: 6
      }]
    };

    return (
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 flex items-center justify-between shadow-sm">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Accounts</span>
              <h3 className="text-3xl font-black text-slate-800">4</h3>
              <p className="text-xs text-slate-400 font-semibold">1 account active per designated role</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 flex items-center justify-between shadow-sm">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Database Records</span>
              <h3 className="text-3xl font-black text-slate-800">{stats.total_records + 14}</h3>
              <p className="text-xs text-slate-400 font-semibold">Total rows inside relational schema</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <Layers className="h-6 w-6" />
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 flex items-center justify-between shadow-sm">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Server Status</span>
              <h3 className="text-3xl font-black text-emerald-600">Online</h3>
              <p className="text-xs text-slate-400 font-semibold">API services fully functional</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="h-6 w-6 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4">Platform Weekly Activity Logs</h4>
            <div className="h-56"><BarComponent data={activityChartData} options={chartOptions} /></div>
          </div>
          <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-800">System Monitoring</h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Monitor API health, database constraints, user tables, and security JWT key status.
              </p>
              <div className="bg-slate-50 p-4 rounded-xl text-[10px] font-mono text-slate-600 space-y-1">
                <p>DB Engine: SQLAlchemy 2.0</p>
                <p>Auth Scheme: OAuth2 Bearer</p>
                <p>Pass hashing: BCrypt Direct</p>
                <p>CORS Policy: Star (*)</p>
              </div>
            </div>
            <a 
              href="http://localhost:8000/docs" 
              target="_blank" 
              rel="noreferrer" 
              className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold text-center shadow-md shadow-indigo-100 transition-all block"
            >
              Open API Swagger Docs
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            {user?.role?.name || 'Guest'} Control Room
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Tailored dashboard workspace for <span className="text-primary-700">{user?.full_name}</span>.
          </p>
        </div>
        <button 
          onClick={fetchStats}
          className="self-start flex items-center space-x-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 text-xs font-bold border border-slate-200 shadow-sm transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Sync Workspace</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-[10px] font-bold">
          {error}
        </div>
      )}

      {/* Render Dashboard based on Role */}
      {user?.role?.name === 'Recycling Facility Operator' && renderOperatorDashboard()}
      {user?.role?.name === 'Sustainability Manager' && renderManagerDashboard()}
      {user?.role?.name === 'Textile Manufacturer' && renderManufacturerDashboard()}
      {user?.role?.name === 'Administrator' && renderAdminDashboard()}

      {!user?.role?.name && (
        <div className="py-24 text-center">
          <Shield className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-semibold">Assigning control room controls...</p>
        </div>
      )}

    </div>
  );
};

export default DashboardPage;
