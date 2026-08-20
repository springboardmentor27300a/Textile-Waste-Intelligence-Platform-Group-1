import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Plus, Pencil, Trash2, Filter, Boxes, Eye, Download, Printer, ArrowUpDown, X, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Pagination from '../components/Pagination.jsx';
import Modal from '../components/Modal.jsx';
import { wasteService } from '../services/wasteService';
import { useDebounce } from '../hooks/useDebounce';
import { useAuth } from '../hooks/useAuth';
import { FABRIC_TYPES, CONDITIONS, PROCESSING_STATUSES, CONDITION_STYLES, STATUS_STYLES, ROLES } from '../constants';

const Inventory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [fabricType, setFabricType] = useState('');
  const [condition, setCondition] = useState('');
  const [processingStatus, setProcessingStatus] = useState('');
  
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // View Details Modal State
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  // Sorting State
  const [sortField, setSortField] = useState('collectionDate');
  const [sortOrder, setSortOrder] = useState('desc');

  const debouncedSearch = useDebounce(searchInput, 400);
  const page = parseInt(searchParams.get('page') || '1', 10);

  const canAdd = user?.role === ROLES.MANUFACTURER;
  const canDeleteRecord = (record) => (
    user?.role === ROLES.MANUFACTURER &&
    String(record?.createdBy?.id) === String(user?.id)
  );
  const canEditRecord = (record) => (
    user?.role === ROLES.MANUFACTURER
      ? String(record?.createdBy?.id) === String(user?.id)
      : user?.role === ROLES.RECYCLER
  );

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await wasteService.list({
        search: debouncedSearch || undefined,
        fabricType: fabricType || undefined,
        condition: condition || undefined,
        processingStatus: processingStatus || undefined,
        page,
        limit: 10,
      });
      
      // Perform local client-side sorting to ensure perfect responsiveness
      let sortedRecords = [...res.records];
      sortedRecords.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        
        if (sortField === 'createdBy') {
          valA = a.createdBy?.name || '';
          valB = b.createdBy?.name || '';
        }
        
        if (typeof valA === 'string') {
          return sortOrder === 'asc' 
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        } else {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }
      });

      setRecords(sortedRecords);
      setPagination(res.pagination);
    } catch (error) {
      toast.error('Could not load textile inventory');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, fabricType, condition, processingStatus, page, sortField, sortOrder]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handlePageChange = (nextPage) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(nextPage));
      return next;
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;
    setIsDeleting(true);
    try {
      await wasteService.remove(recordToDelete._id);
      toast.success('Waste batch deleted successfully');
      setRecordToDelete(null);
      fetchRecords();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Could not delete batch');
    } finally {
      setIsDeleting(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Batch ID', 'Fabric Type', 'Source', 'Quantity (kg)', 'Color', 'Condition', 'Status', 'Collection Date', 'Added By'];
    const rows = records.map(r => [
      r.batchId,
      r.fabricType,
      r.source,
      r.quantity,
      r.color,
      r.condition,
      r.processingStatus,
      r.collectionDate ? new Date(r.collectionDate).toLocaleDateString() : '',
      r.createdBy?.name || 'admin'
    ]);
    const content = [headers, ...rows].map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `waste_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
    toast.success('Inventory exported to CSV');
  };

  const exportPDF = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Textile Waste Inventory Report</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 25px; color: #12211B; }
            h1 { color: #1F7A54; margin-bottom: 5px; }
            h2 { font-size: 14px; color: #12211B77; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #D2E8DC; padding: 10px 14px; text-align: left; font-size: 11px; }
            th { background-color: #EBF5EF; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Textile Waste Inventory Report</h1>
          <h2>Generated on: ${new Date().toLocaleString()}</h2>
          <table>
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Fabric Type</th>
                <th>Source</th>
                <th>Quantity</th>
                <th>Color</th>
                <th>Condition</th>
                <th>Status</th>
                <th>Collection Date</th>
                <th>Added By</th>
              </tr>
            </thead>
            <tbody>
              ${records.map(r => `
                <tr>
                  <td><b>${r.batchId}</b></td>
                  <td>${r.fabricType}</td>
                  <td>${r.source}</td>
                  <td>${r.quantity} kg</td>
                  <td>${r.color}</td>
                  <td>${r.condition}</td>
                  <td>${r.processingStatus}</td>
                  <td>${new Date(r.collectionDate).toLocaleDateString()}</td>
                  <td>${r.createdBy?.name || 'admin'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    toast.success('Print options initialized for PDF export');
  };

  return (
    <div className="space-y-5">
      {/* Header section */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Textile Inventory</h1>
          <p className="text-sm text-ink/60">Browse, audit, search, and manage registered waste batches.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-1.5">
            <Download size={15} /> Export CSV
          </button>
          <button onClick={exportPDF} className="btn-secondary flex items-center gap-1.5">
            <Printer size={15} /> Export PDF
          </button>
          {canAdd && (
            <Link to="/inventory/add" className="btn-primary">
              <Plus size={16} /> Add Waste
            </Link>
          )}
        </div>
      </div>

      {/* Main card */}
      <div className="card">
        {/* Filters */}
        <div className="flex flex-col gap-3 border-b border-forest-100 pb-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search batch ID, source, or color…"
              className="input-field pl-10"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Filter size={15} className="text-ink/40" />
            <select value={fabricType} onChange={(e) => setFabricType(e.target.value)} className="input-field w-auto">
              <option value="">All fabrics</option>
              {FABRIC_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <select value={condition} onChange={(e) => setCondition(e.target.value)} className="input-field w-auto">
              <option value="">All conditions</option>
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={processingStatus} onChange={(e) => setProcessingStatus(e.target.value)} className="input-field w-auto">
              <option value="">All statuses</option>
              {PROCESSING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Data Table */}
        {isLoading ? (
          <LoadingSpinner label="Loading inventory batches…" />
        ) : records.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="No inventory records found."
            description="Try adjusting your filters or add a new batch to start tracking."
            action={canAdd && (
              <Link to="/inventory/add" className="btn-primary mt-1">
                <Plus size={16} /> Add New Inventory
              </Link>
            )}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-forest-100 text-xs uppercase tracking-wide text-ink/40">
                    <th onClick={() => handleSort('batchId')} className="cursor-pointer py-3 pr-4 font-semibold hover:text-forest-600 transition-colors">
                      <span className="flex items-center gap-1">Batch ID <ArrowUpDown size={12} /></span>
                    </th>
                    <th onClick={() => handleSort('fabricType')} className="cursor-pointer py-3 pr-4 font-semibold hover:text-forest-600 transition-colors">
                      <span className="flex items-center gap-1">Fabric Type <ArrowUpDown size={12} /></span>
                    </th>
                    <th onClick={() => handleSort('source')} className="cursor-pointer py-3 pr-4 font-semibold hover:text-forest-600 transition-colors">
                      <span className="flex items-center gap-1">Source <ArrowUpDown size={12} /></span>
                    </th>
                    <th onClick={() => handleSort('quantity')} className="cursor-pointer py-3 pr-4 font-semibold hover:text-forest-600 transition-colors">
                      <span className="flex items-center gap-1">Quantity <ArrowUpDown size={12} /></span>
                    </th>
                    <th onClick={() => handleSort('color')} className="cursor-pointer py-3 pr-4 font-semibold hover:text-forest-600 transition-colors">
                      <span className="flex items-center gap-1">Color <ArrowUpDown size={12} /></span>
                    </th>
                    <th onClick={() => handleSort('condition')} className="cursor-pointer py-3 pr-4 font-semibold hover:text-forest-600 transition-colors">
                      <span className="flex items-center gap-1">Condition <ArrowUpDown size={12} /></span>
                    </th>
                    <th onClick={() => handleSort('collectionDate')} className="cursor-pointer py-3 pr-4 font-semibold hover:text-forest-600 transition-colors">
                      <span className="flex items-center gap-1">Collection Date <ArrowUpDown size={12} /></span>
                    </th>
                    <th onClick={() => handleSort('processingStatus')} className="cursor-pointer py-3 pr-4 font-semibold hover:text-forest-600 transition-colors">
                      <span className="flex items-center gap-1">Status <ArrowUpDown size={12} /></span>
                    </th>
                    <th onClick={() => handleSort('createdBy')} className="cursor-pointer py-3 pr-4 font-semibold hover:text-forest-600 transition-colors">
                      <span className="flex items-center gap-1">Created By <ArrowUpDown size={12} /></span>
                    </th>
                    <th className="py-3 pl-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record._id} className="border-b border-forest-55 last:border-0 hover:bg-forest-50/40 transition-colors">
                      <td className="py-3 pr-4 font-mono text-xs font-semibold text-ink">{record.batchId}</td>
                      <td className="py-3 pr-4 text-ink/80">{record.fabricType}</td>
                      <td className="py-3 pr-4 text-ink/75">{record.source}</td>
                      <td className="py-3 pr-4 font-semibold text-ink">{record.quantity} kg</td>
                      <td className="py-3 pr-4 text-ink/70">{record.color}</td>
                      <td className="py-3 pr-4"><StatusBadge label={record.condition} styleMap={CONDITION_STYLES} /></td>
                      <td className="py-3 pr-4 text-ink/60">{new Date(record.collectionDate).toLocaleDateString()}</td>
                      <td className="py-3 pr-4"><StatusBadge label={record.processingStatus} styleMap={STATUS_STYLES} /></td>
                      <td className="py-3 pr-4 text-ink/65">{record.createdBy?.name || 'admin'}</td>
                      <td className="py-3 pl-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedRecord(record)}
                            className="rounded-lg p-1.5 text-ink/50 hover:bg-forest-50 hover:text-forest-700 transition"
                            title="View details"
                          >
                            <Eye size={15} />
                          </button>
                                      {canEditRecord(record) && (
                            <button
                              onClick={() => navigate(`/inventory/edit/${record._id}`)}
                              className="rounded-lg p-1.5 text-ink/50 hover:bg-ledger-50 hover:text-ledger-600 transition"
                              title="Edit batch"
                            >
                              <Pencil size={15} />
                            </button>
                          )}
                          {canDeleteRecord(record) && (
                            <button
                              onClick={() => setRecordToDelete(record)}
                              className="rounded-lg p-1.5 text-ink/50 hover:bg-red-50 hover:text-red-600 transition"
                              title="Delete batch"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={pagination.page}
              pages={pagination.pages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!recordToDelete} onClose={() => setRecordToDelete(null)} title="Delete waste batch?" maxWidth="max-w-sm">
        <p className="text-sm text-ink/70">
          This will permanently remove batch{' '}
          <span className="font-mono font-semibold text-ink">{recordToDelete?.batchId}</span> from the
          inventory. This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={() => setRecordToDelete(null)} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} disabled={isDeleting} className="btn-danger">
            {isDeleting ? 'Deleting…' : 'Delete batch'}
          </button>
        </div>
      </Modal>

      {/* View Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-card border border-forest-100 max-w-md w-full p-6 relative">
            <button
              onClick={() => setSelectedRecord(null)}
              className="absolute top-4 right-4 text-ink/50 hover:text-ink transition"
            >
              <X size={18} />
            </button>
            
            <div className="flex items-center gap-2 border-b border-forest-100 pb-3 mb-4">
              <Boxes className="text-forest-600" size={20} />
              <h3 className="font-display text-lg font-bold text-ink">Textile Waste Record</h3>
              <span className="font-mono bg-forest-50 text-forest-700 px-2 py-0.5 rounded text-xs font-semibold">
                {selectedRecord.batchId}
              </span>
            </div>

            <div className="space-y-4 text-sm text-ink/80">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-ink/40 font-bold block uppercase tracking-wider">Fabric Type</span>
                  <span className="font-semibold">{selectedRecord.fabricType}</span>
                </div>
                <div>
                  <span className="text-xs text-ink/40 font-bold block uppercase tracking-wider">Quantity</span>
                  <span className="font-semibold text-forest-700">{selectedRecord.quantity} kg</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-ink/40 font-bold block uppercase tracking-wider">Color</span>
                  <span className="font-semibold">{selectedRecord.color}</span>
                </div>
                <div>
                  <span className="text-xs text-ink/40 font-bold block uppercase tracking-wider">Condition</span>
                  <div className="mt-1"><StatusBadge label={selectedRecord.condition} styleMap={CONDITION_STYLES} /></div>
                </div>
              </div>

              <div>
                <span className="text-xs text-ink/40 font-bold block uppercase tracking-wider">Generation Source</span>
                <span className="font-semibold">{selectedRecord.source}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-ink/40 font-bold block uppercase tracking-wider">Collected On</span>
                  <span className="font-semibold flex items-center gap-1">
                    <Calendar size={13} />
                    {new Date(selectedRecord.collectionDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-ink/40 font-bold block uppercase tracking-wider">Processing Status</span>
                  <div className="mt-1"><StatusBadge label={selectedRecord.processingStatus} styleMap={STATUS_STYLES} /></div>
                </div>
              </div>

              <div className="border-t border-forest-50 pt-3">
                <span className="text-xs text-ink/40 font-bold block uppercase tracking-wider">Log Created By</span>
                <span className="font-semibold block">{selectedRecord.createdBy?.name || 'System Administrator'}</span>
                <span className="text-xs text-ink/50">{selectedRecord.createdBy?.email || 'admin@twip.org'}</span>
              </div>

              {selectedRecord.description && (
                <div className="border-t border-forest-50 pt-3">
                  <span className="text-xs text-ink/40 font-bold block uppercase tracking-wider">Description</span>
                  <p className="text-xs text-ink/75 mt-0.5 whitespace-pre-wrap">{selectedRecord.description}</p>
                </div>
              )}

              {selectedRecord.image && (
                <div className="border-t border-forest-50 pt-3">
                  <span className="text-xs text-ink/40 font-bold block uppercase tracking-wider">Textile Image</span>
                  <div className="mt-2 h-36 w-full overflow-hidden rounded-xl border border-forest-100">
                    <img src={selectedRecord.image} alt="Textile Batch" className="h-full w-full object-cover" />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-forest-50 flex justify-end">
              <button onClick={() => setSelectedRecord(null)} className="btn-secondary">Close Details</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
