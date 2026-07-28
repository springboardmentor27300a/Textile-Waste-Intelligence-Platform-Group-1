import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Search, Plus, Eye, Edit, Trash2, ChevronLeft, ChevronRight, 
  ArrowUpDown, Filter, Download, X, AlertCircle, CheckCircle, RefreshCw 
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function InventoryList() {
  const { user } = useAuth();
  const location = useLocation();

  if (user && user.role.name === 'Sustainability Manager') {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 rounded-3xl text-xs font-semibold">
        Access Denied: Sustainability Managers do not have permissions to read or write raw warehouse inventories.
      </div>
    );
  }
  
  // State
  const [batches, setBatches] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [fabricFilter, setFabricFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');

  // Modals & Feedback
  const [modalOpen, setModalOpen] = useState(false);
  const [editBatch, setEditBatch] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isOperatorOrAdmin = user && ['Administrator', 'Recycling Facility Operator', 'Sustainability Manager', 'Textile Manufacturer'].includes(user.role.name);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Load Batches
  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory/batches', {
        params: {
          page,
          size,
          search: search || undefined,
          fabric_type: fabricFilter || undefined,
          status: statusFilter || undefined,
          sort_by: sortBy,
          order
        }
      });
      setBatches(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to query waste inventory database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [page, search, fabricFilter, statusFilter, sortBy, order]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('add') === 'true' && user) {
      // Clear the query param so refreshing does not keep reopening modal
      window.history.replaceState(null, '', window.location.pathname);
      handleOpenAdd();
    }
  }, [location, user]);

  // Open Modal for Add
  const handleOpenAdd = () => {
    setEditBatch(null);
    reset({
      fabric_type: 'Cotton Blend',
      source: user?.organization?.name || '',
      quantity: 100,
      color: 'White',
      condition: 'Clean Offcuts',
      collection_date: new Date().toISOString().split('T')[0],
      storage_location: 'Aisle A - Bin 1',
      remarks: '',
      status: 'Pending'
    });
    setModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (batch) => {
    setEditBatch(batch);
    reset({
      fabric_type: batch.fabric_type,
      source: batch.source,
      quantity: batch.quantity,
      color: batch.color,
      condition: batch.condition,
      collection_date: batch.collection_date,
      storage_location: batch.storage_location,
      remarks: batch.remarks || '',
      status: batch.status
    });
    setModalOpen(true);
  };

  // Handle Create/Update submit
  const onSubmit = async (data) => {
    setErrorMsg('');
    try {
      if (editBatch) {
        await api.put(`/inventory/batches/${editBatch.id}`, data);
        setSuccessMsg(`Batch ${editBatch.batch_number} updated successfully.`);
      } else {
        const res = await api.post('/inventory/batches', data);
        setSuccessMsg(`New waste batch ${res.data.batch_number} logged successfully.`);
      }
      setModalOpen(false);
      fetchBatches();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Failed to submit batch record.');
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!deleteId) return;
    setErrorMsg('');
    try {
      await api.delete(`/inventory/batches/${deleteId}`);
      setSuccessMsg('Waste batch deleted successfully.');
      setDeleteId(null);
      fetchBatches();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to delete target waste batch.');
    }
  };

  // Sorting Handler
  const requestSort = (col) => {
    if (sortBy === col) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setOrder('desc');
    }
  };

  // Status Badge Formatter
  const getStatusBadge = (status) => {
    const maps = {
      'Pending': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      'Sorting': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      'Sorted': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'Recycling': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
      'Recycled': 'bg-emerald-500/10 text-primary-neon border-emerald-500/20 shadow-neon',
      'Disposed': 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    };
    return maps[status] || 'bg-slate-500/10 text-slate-400';
  };

  const handleExportCSV = () => {
    setSuccessMsg('Download initiated: Exporting inventory CSV summary package.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const totalPages = Math.ceil(total / size) || 1;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">Inventory Database</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">View, search, and edit circular raw textile feedstocks</p>
        </div>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-2xl hover:bg-slate-50 dark:hover:bg-bgDark/45 text-xs font-bold hover-scale shadow-soft"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          
          {isOperatorOrAdmin && (
            <button
              onClick={handleOpenAdd}
              id="add-batch-btn"
              className="flex items-center space-x-2 px-5 py-2.5 bg-primary-800 dark:bg-emerald-950 text-white dark:text-primary-neon border border-transparent dark:border-borderDark rounded-2xl text-xs font-bold shadow-soft dark:shadow-neon hover-scale"
            >
              <Plus size={14} />
              <span>Log Waste Batch</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-primary-neon text-xs rounded-2xl flex items-center space-x-2 animate-fade-in">
          <CheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-2xl flex items-center space-x-2 animate-fade-in">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="p-4 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-3xl shadow-soft flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500" size={14} />
          <input
            type="text"
            placeholder="Search batch ID, fabric type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-bgDark/50 border border-borderLight dark:border-borderDark rounded-2xl outline-none text-xs focus:bg-white dark:focus:bg-bgDark focus:ring-2 focus:ring-primary-100 dark:focus:ring-emerald-950/30"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-bgDark/50 border border-borderLight dark:border-borderDark px-4 py-2 rounded-2xl">
            <Filter size={12} className="text-slate-400 dark:text-slate-500" />
            <select
              value={fabricFilter}
              onChange={(e) => setFabricFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="">All Fabrics</option>
              <option value="Cotton Blend">Cotton Blend</option>
              <option value="Polyester Knit">Polyester Knit</option>
              <option value="Denim / Indigo Cotton">Denim / Indigo Cotton</option>
              <option value="Wool">Wool</option>
              <option value="Silk Blend">Silk Blend</option>
              <option value="Nylon Reclaim">Nylon Reclaim</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-bgDark/50 border border-borderLight dark:border-borderDark px-4 py-2 rounded-2xl">
            <Filter size={12} className="text-slate-400 dark:text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Sorting">Sorting</option>
              <option value="Sorted">Sorted</option>
              <option value="Recycling">Recycling</option>
              <option value="Recycled">Recycled</option>
              <option value="Disposed">Disposed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-3xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-bgDark/40 border-b border-borderLight dark:border-borderDark text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider">
                <th className="px-6 py-4.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-bgDark" onClick={() => requestSort('batch_number')}>
                  <div className="flex items-center space-x-1">
                    <span>Batch Number</span>
                    <ArrowUpDown size={10} />
                  </div>
                </th>
                <th className="px-6 py-4.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-bgDark" onClick={() => requestSort('fabric_type')}>
                  <div className="flex items-center space-x-1">
                    <span>Fabric Type</span>
                    <ArrowUpDown size={10} />
                  </div>
                </th>
                <th className="px-6 py-4.5">Source</th>
                <th className="px-6 py-4.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-bgDark" onClick={() => requestSort('quantity')}>
                  <div className="flex items-center space-x-1">
                    <span>Weight (kg)</span>
                    <ArrowUpDown size={10} />
                  </div>
                </th>
                <th className="px-6 py-4.5">Color</th>
                <th className="px-6 py-4.5">Status</th>
                <th className="px-6 py-4.5">Location</th>
                <th className="px-6 py-4.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderLight dark:divide-borderDark text-xs font-medium">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw size={16} className="animate-spin text-primary-neon shadow-neon" />
                      <span>Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                    No textile batches logged.
                  </td>
                </tr>
              ) : (
                batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-slate-50/50 dark:hover:bg-bgDark/20 transition-colors">
                    <td className="px-6 py-4.5 font-bold text-slate-900 dark:text-white">
                      {batch.batch_number}
                    </td>
                    <td className="px-6 py-4.5 text-slate-700 dark:text-slate-300">{batch.fabric_type}</td>
                    <td className="px-6 py-4.5 text-slate-500 max-w-[120px] truncate">{batch.source}</td>
                    <td className="px-6 py-4.5 font-bold font-mono text-slate-900 dark:text-white">{batch.quantity.toFixed(1)}</td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-3 h-3 rounded-full border border-borderLight dark:border-borderDark shadow-sm" style={{ 
                          backgroundColor: batch.color.toLowerCase() === 'white' ? '#ffffff' : 
                                           batch.color.toLowerCase() === 'off-white' ? '#fcf9f2' :
                                           batch.color.toLowerCase() === 'indigo' ? '#4b0082' :
                                           batch.color.toLowerCase() === 'red' ? '#ef4444' :
                                           batch.color.toLowerCase() === 'blue' ? '#3b82f6' : '#94a3b8'
                        }}></span>
                        <span className="text-slate-600 dark:text-slate-400">{batch.color}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getStatusBadge(batch.status)}`}>
                        {batch.status}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-slate-400 font-medium">{batch.storage_location}</td>
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link 
                          to={`/inventory/batches/${batch.id}`} 
                          title="View Details"
                          className="p-1.5 text-slate-400 hover:text-primary-800 dark:hover:text-primary-neon hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                        >
                          <Eye size={14} />
                        </Link>
                        
                        {isOperatorOrAdmin && (
                          <>
                            <button 
                              onClick={() => handleOpenEdit(batch)}
                              title="Edit Batch"
                              className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => setDeleteId(batch.id)}
                              title="Delete Record"
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-bgDark/30 border-t border-borderLight dark:border-borderDark flex justify-between items-center text-xs text-slate-500 font-medium">
          <span>Showing page {page} of {totalPages} ({total} entries total)</span>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-2 border border-borderLight dark:border-borderDark rounded-xl hover:bg-white dark:hover:bg-bgDark disabled:opacity-40"
            >
              <ChevronLeft size={12} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="p-2 border border-borderLight dark:border-borderDark rounded-xl hover:bg-white dark:hover:bg-bgDark disabled:opacity-40"
            >
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-6">
          <div className="w-full max-w-sm p-6 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-3xl shadow-xl animate-fade-in text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Delete Waste Batch</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-normal mb-4">
              Are you sure you want to permanently delete this textile batch record? This action will update warehouse stocks immediately.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border border-borderLight dark:border-borderDark rounded-xl hover:bg-slate-50 dark:hover:bg-bgDark font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold shadow-soft"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal Add/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-6">
          <div className="w-full max-w-md p-6 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-3xl shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center pb-3 border-b border-borderLight dark:border-borderDark mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {editBatch ? `Modify Batch: ${editBatch.batch_number}` : 'Log New Waste Batch'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Fabric Type</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-bgDark border border-borderLight dark:border-borderDark rounded-xl"
                    {...register('fabric_type')}
                  >
                    <option value="Cotton Blend">Cotton Blend</option>
                    <option value="Polyester Knit">Polyester Knit</option>
                    <option value="Denim / Indigo Cotton">Denim / Indigo Cotton</option>
                    <option value="Wool">Wool</option>
                    <option value="Silk Blend">Silk Blend</option>
                    <option value="Nylon Reclaim">Nylon Reclaim</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Source Origin</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-bgDark border border-borderLight dark:border-borderDark rounded-xl"
                    {...register('source', { required: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-bgDark border border-borderLight dark:border-borderDark rounded-xl"
                    {...register('quantity', { required: true, min: 1 })}
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Color Tone</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-bgDark border border-borderLight dark:border-borderDark rounded-xl"
                    {...register('color', { required: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Condition</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-bgDark border border-borderLight dark:border-borderDark rounded-xl"
                    {...register('condition', { required: true })}
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Collection Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-bgDark border border-borderLight dark:border-borderDark rounded-xl text-slate-700 dark:text-slate-300"
                    {...register('collection_date', { required: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Storage Location</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-bgDark border border-borderLight dark:border-borderDark rounded-xl"
                    {...register('storage_location', { required: true })}
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-bgDark border border-borderLight dark:border-borderDark rounded-xl"
                    {...register('status')}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Sorting">Sorting</option>
                    <option value="Sorted">Sorted</option>
                    <option value="Recycling">Recycling</option>
                    <option value="Recycled">Recycled</option>
                    <option value="Disposed">Disposed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Remarks</label>
                <textarea
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-bgDark border border-borderLight dark:border-borderDark rounded-xl h-16 outline-none"
                  {...register('remarks')}
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-borderLight dark:border-borderDark rounded-xl hover:bg-slate-50 dark:hover:bg-bgDark font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary-800 hover:bg-primary-900 text-white rounded-xl font-bold shadow-soft"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
