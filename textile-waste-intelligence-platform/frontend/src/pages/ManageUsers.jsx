import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { 
  Users, 
  Trash2, 
  Search, 
  Eye, 
  Edit3, 
  UserX, 
  UserCheck, 
  Key, 
  Shield, 
  Download,
  FileSpreadsheet,
  Calendar,
  Phone,
  Mail,
  Building,
  Activity,
  Package,
  Layers,
  X
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import Pagination from '../components/Pagination.jsx';
import { userService } from '../services/userService';
import { useDebounce } from '../hooks/useDebounce';
import { ALL_ROLES } from '../constants';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  
  // Debounce search
  const debouncedSearch = useDebounce(search, 400);

  // Selected User state for Modals
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailData, setUserDetailData] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  // Modal toggles
  const [activeModal, setActiveModal] = useState(null); // 'view' | 'edit' | 'delete' | 'reset_password' | 'change_role'
  
  // Form states
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', organization: '' });
  const [passwordForm, setPasswordForm] = useState({ password: '', confirmPassword: '' });
  const [roleValue, setRoleValue] = useState('');

  const fetchUsersList = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await userService.list({ 
        search: debouncedSearch || undefined, 
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        page, 
        limit 
      });
      if (res.success) {
        setUsers(res.users);
        setPagination(res.pagination);
      }
    } catch (error) {
      toast.error('Could not load registered users database');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, roleFilter, statusFilter, page, limit]);

  useEffect(() => {
    fetchUsersList();
  }, [fetchUsersList]);

  // Open Details view
  const handleOpenView = async (user) => {
    setSelectedUser(user);
    setActiveModal('view');
    setIsLoadingDetails(true);
    try {
      const res = await userService.getById(user.id);
      if (res.success) {
        setUserDetailData(res);
      }
    } catch (err) {
      toast.error("Could not fetch user profile details");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Open Edit form
  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      organization: user.organization || ''
    });
    setActiveModal('edit');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) return toast.error("Full name is required");
    
    try {
      const res = await userService.update(selectedUser.id, editForm);
      if (res.success) {
        toast.success("User account updated successfully");
        setActiveModal(null);
        fetchUsersList();
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save updates");
    }
  };

  // Status Toggle
  const handleToggleStatus = async (user) => {
    const nextStatus = !user.isActive;
    try {
      const res = await userService.updateStatus(user.id, nextStatus);
      if (res.success) {
        toast.success(`User status updated to ${nextStatus ? 'Active' : 'Inactive'}`);
        fetchUsersList();
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not change status");
    }
  };

  // Open Change Role
  const handleOpenRole = (user) => {
    setSelectedUser(user);
    setRoleValue(user.role);
    setActiveModal('change_role');
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await userService.updateRole(selectedUser.id, roleValue);
      if (res.success) {
        toast.success("User role updated successfully");
        setActiveModal(null);
        fetchUsersList();
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not modify role");
    }
  };

  // Open Reset Password
  const handleOpenResetPassword = (user) => {
    setSelectedUser(user);
    setPasswordForm({ password: '', confirmPassword: '' });
    setActiveModal('reset_password');
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.password.length < 6) return toast.error("Password must be at least 6 characters");
    if (passwordForm.password !== passwordForm.confirmPassword) return toast.error("Passwords do not match");

    try {
      const res = await userService.update(selectedUser.id, { password: passwordForm.password });
      if (res.success) {
        toast.success("Password reset successfully");
        setActiveModal(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not reset password");
    }
  };

  // Open Delete confirmation
  const handleOpenDelete = (user) => {
    setSelectedUser(user);
    setActiveModal('delete');
  };

  const handleDeleteSubmit = async () => {
    try {
      const res = await userService.remove(selectedUser.id);
      if (res.success) {
        toast.success("User deleted successfully");
        setActiveModal(null);
        fetchUsersList();
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not delete user account");
    }
  };

  // Export CSV
  const exportUsersCsv = () => {
    const headers = ["ID", "Name", "Email", "Phone", "Role", "Status", "Registration Date", "Last Login", "Total Inventory (kg)"];
    const rows = users.map(u => [
      u.id,
      u.name,
      u.email,
      u.phone,
      u.role,
      u.isActive ? "Active" : "Inactive",
      u.registrationDate ? new Date(u.registrationDate).toLocaleDateString() : "",
      u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "",
      u.totalInventory
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `registered_users_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printUsersReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center print:hidden">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">User Account Directory</h1>
          <p className="text-sm text-ink/60">Search registered organizations, edit settings, manage active statuses, or verify logs.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={printUsersReport} 
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 bg-white border border-slate-200"
          >
            <Download size={14} className="text-slate-500" /> Export PDF
          </button>
          <button 
            onClick={exportUsersCsv} 
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 bg-white border border-slate-200"
          >
            <FileSpreadsheet size={14} className="text-slate-500" /> Export CSV
          </button>
        </div>
      </div>

      {/* Search, Filter, Pagination Limit controls */}
      <div className="card space-y-4 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Search bar */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="input-field pl-9 text-xs"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input-field text-xs bg-white"
            >
              <option value="">All Roles</option>
              <option value="Administrator">Administrator</option>
              <option value="Textile Manufacturer">Textile Manufacturer</option>
              <option value="Recycling Facility Operator">Recycling Facility Operator</option>
              <option value="Sustainability Manager">Sustainability Manager</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field text-xs bg-white"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>

          {/* Pagination limit selector */}
          <div className="flex items-center justify-end gap-2 text-xs font-semibold text-slate-500">
            <span>Show:</span>
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="border rounded px-2 py-1.5 bg-white text-slate-700"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>

        </div>

        {/* Listing Grid */}
        {isLoading ? (
          <LoadingSpinner label="Retrieving registered user accounts..." />
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No registered users match these filters"
            description="Clear search descriptors or filter selections to audit registered users."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-3xs">
                    <th className="py-2.5">User Profile</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Total Inventory</th>
                    <th>Last Login</th>
                    <th className="text-right">Account Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700 font-light">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/40 transition">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 font-display font-extrabold flex items-center justify-center text-xs">
                            {u.name ? u.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U"}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 block">{u.name}</span>
                            <span className="text-3xs text-slate-400">{u.organization || "No org"}</span>
                          </div>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                      <td>
                        <span className="text-3xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`text-3xs font-bold px-2 py-0.5 rounded-full border transition flex items-center gap-1 ${
                            u.isActive 
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-100 hover:bg-emerald-100' 
                              : 'text-slate-400 bg-slate-50 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {u.isActive ? <UserCheck size={11} /> : <UserX size={11} />}
                          {u.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="font-bold text-slate-800">{u.totalInventory} kg</td>
                      <td className="text-slate-400 text-3xs">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() + " " + new Date(u.lastLogin).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Never'}
                      </td>
                      <td className="text-right">
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => handleOpenView(u)}
                            className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                            title="View Audit details"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit Account Profile"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleOpenRole(u)}
                            className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded"
                            title="Change Role"
                          >
                            <Shield size={13} />
                          </button>
                          <button
                            onClick={() => handleOpenResetPassword(u)}
                            className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded"
                            title="Reset Password"
                          >
                            <Key size={13} />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(u)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Delete Account"
                          >
                            <Trash2 size={13} />
                          </button>
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
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {/* =====================================================================
          MODALS SECTION
          ===================================================================== */}

      {/* Modal 1: User Audit Details */}
      <Modal 
        isOpen={activeModal === 'view'} 
        onClose={() => { setActiveModal(null); setUserDetailData(null); }} 
        title="Complete Profile & Audit Details" 
        maxWidth="max-w-3xl"
      >
        {isLoadingDetails || !userDetailData ? (
          <LoadingSpinner label="Downloading transaction statistics..." />
        ) : (
          <div className="space-y-6">
            
            {/* Header info */}
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 font-display font-extrabold flex items-center justify-center text-lg">
                {selectedUser.name ? selectedUser.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U"}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-800">{selectedUser.name}</h3>
                <span className="text-3xs font-semibold text-slate-400 uppercase tracking-wider">{selectedUser.role}</span>
              </div>
              <div className="text-right text-xs text-slate-500 font-light space-y-0.5">
                <p><strong>Status:</strong> {userDetailData.profile.isActive ? 'Active' : 'Inactive'}</p>
                <p><strong>Registered:</strong> {new Date(userDetailData.profile.registrationDate).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Profile fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="flex items-center gap-2 p-3 bg-white border border-slate-100 rounded-lg">
                <Mail size={16} className="text-slate-400" />
                <div>
                  <span className="text-3xs text-slate-400 block uppercase font-bold">Email Address</span>
                  <span className="font-medium text-slate-700">{selectedUser.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white border border-slate-100 rounded-lg">
                <Phone size={16} className="text-slate-400" />
                <div>
                  <span className="text-3xs text-slate-400 block uppercase font-bold">Phone Number</span>
                  <span className="font-medium text-slate-700">{selectedUser.phone}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white border border-slate-100 rounded-lg">
                <Building size={16} className="text-slate-400" />
                <div>
                  <span className="text-3xs text-slate-400 block uppercase font-bold">Organization</span>
                  <span className="font-medium text-slate-700">{selectedUser.organization}</span>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-emerald-50/20 border border-emerald-100 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center"><Package size={16} /></div>
                  <div className="text-left"><span className="text-3xs text-slate-400 block font-bold uppercase">Uploaded Batches</span><span className="font-display text-lg font-black text-slate-800">{userDetailData.stats.total_batches}</span></div>
                </div>
              </div>
              <div className="p-4 bg-blue-50/20 border border-blue-100 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center"><Layers size={16} /></div>
                  <div className="text-left"><span className="text-3xs text-slate-400 block font-bold uppercase">Total Waste Logged</span><span className="font-display text-lg font-black text-slate-800">{userDetailData.stats.total_quantity} kg</span></div>
                </div>
              </div>
            </div>

            {/* Submissions & Logs tabs layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* Inventory uploaded list */}
              <div className="space-y-2">
                <h4 className="font-display text-xs font-bold text-slate-800 border-b pb-1.5 flex items-center gap-1.5"><Package size={14} className="text-emerald-600" /> Uploaded Inventory</h4>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {userDetailData.inventory.length === 0 ? (
                    <p className="text-2xs text-slate-400 italic">No batches uploaded by this user.</p>
                  ) : (
                    userDetailData.inventory.map(item => (
                      <div key={item.id} className="p-2 border rounded-lg bg-slate-50/30 flex items-center justify-between text-2xs">
                        <div>
                          <span className="font-mono font-bold block">{item.batchId}</span>
                          <span className="text-3xs text-slate-400">{item.fabricType} · {item.quantity} kg</span>
                        </div>
                        <span className="text-3xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {item.processingStatus}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* User activity logs */}
              <div className="space-y-2">
                <h4 className="font-display text-xs font-bold text-slate-800 border-b pb-1.5 flex items-center gap-1.5"><Activity size={14} className="text-emerald-600" /> Activity History</h4>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {userDetailData.activity.length === 0 ? (
                    <p className="text-2xs text-slate-400 italic">No logged activity recorded.</p>
                  ) : (
                    userDetailData.activity.map(log => (
                      <div key={log.id} className="p-2 border rounded-lg bg-slate-50/30 text-2xs space-y-0.5">
                        <div className="flex justify-between font-semibold text-slate-700">
                          <span>{log.action}</span>
                          <span className="text-3xs text-slate-400">{new Date(log.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-3xs text-slate-400 font-light leading-snug">{log.detail}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-4 border-t">
              <button 
                onClick={() => { setActiveModal(null); setUserDetailData(null); }} 
                className="btn-secondary text-xs"
              >
                Close Audit Details
              </button>
            </div>

          </div>
        )}
      </Modal>

      {/* Modal 2: Edit User Profile */}
      <Modal isOpen={activeModal === 'edit'} onClose={() => setActiveModal(null)} title="Edit Account Profile" maxWidth="max-w-md">
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block text-slate-600 mb-1">Full Name</label>
            <input
              value={editForm.name}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1">Email Address</label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1">Phone Number</label>
            <input
              value={editForm.phone}
              onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1">Organization Company</label>
            <input
              value={editForm.organization}
              onChange={(e) => setEditForm(prev => ({ ...prev, organization: e.target.value }))}
              className="input-field"
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary text-xs">Cancel</button>
            <button type="submit" className="btn-primary text-xs">Save Account Updates</button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: Change User Role */}
      <Modal isOpen={activeModal === 'change_role'} onClose={() => setActiveModal(null)} title="Change Account Access Role" maxWidth="max-w-sm">
        <form onSubmit={handleRoleSubmit} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block text-slate-600 mb-2">Select User Role</label>
            <select
              value={roleValue}
              onChange={(e) => setRoleValue(e.target.value)}
              className="input-field bg-white"
            >
              {ALL_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary text-xs">Cancel</button>
            <button type="submit" className="btn-primary text-xs">Update Access Role</button>
          </div>
        </form>
      </Modal>

      {/* Modal 4: Reset Account Password */}
      <Modal isOpen={activeModal === 'reset_password'} onClose={() => setActiveModal(null)} title="Reset Account Password" maxWidth="max-w-sm">
        <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block text-slate-600 mb-1">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwordForm.password}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, password: e.target.value }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1">Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="input-field"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary text-xs">Cancel</button>
            <button type="submit" className="btn-primary text-xs">Reset Password</button>
          </div>
        </form>
      </Modal>

      {/* Modal 5: Delete User */}
      <Modal isOpen={activeModal === 'delete'} onClose={() => setActiveModal(null)} title="Delete user?" maxWidth="max-w-sm">
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed font-light">
            Are you sure you want to permanently delete <span className="font-semibold text-slate-800">{selectedUser?.name}</span>? 
            All logged textile inventories associated with this manufacturer will be removed automatically. This action is irreversible.
          </p>
          <div className="mt-6 flex justify-end gap-2 border-t pt-4">
            <button onClick={() => setActiveModal(null)} className="btn-secondary text-xs">Cancel</button>
            <button onClick={handleDeleteSubmit} className="btn-danger text-xs">Permanently Delete</button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default ManageUsers;
