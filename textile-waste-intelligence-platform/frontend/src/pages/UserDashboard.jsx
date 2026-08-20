import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { wasteService } from '../services/wasteService';
import { authService } from '../services/authService';
import {
  LayoutDashboard,
  PlusCircle,
  List,
  User,
  LogOut,
  Leaf,
  Weight,
  FileText,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  Info,
  X,
  Upload
} from 'lucide-react';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const { user, logoutUser, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = useState({ total_submissions: 0, total_weight: 0, recent_submission: null });
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'view' | 'edit' | 'delete'
  const [selectedSub, setSelectedSub] = useState(null);

  // Form states
  const [submitForm, setSubmitForm] = useState({
    organization: user?.organization || '',
    contact_person: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    waste_type: 'Fabric Scraps',
    fabric_type: 'Cotton',
    weight: '',
    color: '',
    condition: 'Reusable',
    source: 'Pre-Consumer/Industrial',
    description: '',
    image_data: null
  });
  
  const [editForm, setEditForm] = useState({});
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    organization: user?.organization || '',
    phone: user?.phone || '',
    password: ''
  });

  const [submitErrors, setSubmitErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [profileErrors, setProfileErrors] = useState({});

  // Sync profile form when user context changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        organization: user.organization || '',
        phone: user.phone || '',
        password: ''
      });
      setSubmitForm(prev => ({
        ...prev,
        organization: user.organization || '',
        contact_person: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  // Fetch Dashboard Stats and Submissions on mount or view change
  const fetchData = async () => {
    setLoading(true);
    try {
      const statsRes = await wasteService.stats();
      if (statsRes.success) {
        setStats(statsRes.stats);
      }
      
      const listRes = await wasteService.listMySubmissions();
      if (listRes.success) {
        setSubmissions(listRes.submissions);
      }
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [location.pathname]);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  // Convert uploaded image file to Base64 for database storage
  const handleImageUpload = (e, type = 'submit') => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024 * 2) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'submit') {
        setSubmitForm(prev => ({ ...prev, image_data: reader.result }));
      } else {
        setEditForm(prev => ({ ...prev, image_data: reader.result }));
      }
      toast.success('Image loaded successfully');
    };
    reader.readAsDataURL(file);
  };

  // User waste submission form submission
  const handleSubmitWaste = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!submitForm.organization.trim()) nextErrors.organization = 'Organization is required';
    if (!submitForm.contact_person.trim()) nextErrors.contact_person = 'Contact person is required';
    if (!submitForm.email.trim()) nextErrors.email = 'Email is required';
    if (!submitForm.phone.trim()) nextErrors.phone = 'Phone number is required';
    if (!submitForm.weight || parseFloat(submitForm.weight) <= 0) nextErrors.weight = 'Provide a valid positive weight';
    if (!submitForm.color.trim()) nextErrors.color = 'Color is required';

    if (Object.keys(nextErrors).length > 0) {
      setSubmitErrors(nextErrors);
      return;
    }
    setSubmitErrors({});

    try {
      const payload = {
        ...submitForm,
        weight: parseFloat(submitForm.weight)
      };
      const res = await wasteService.submit(payload);
      if (res.success) {
        toast.success('Textile waste submitted successfully!');
        setSubmitForm({
          organization: user?.organization || '',
          contact_person: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          waste_type: 'Fabric Scraps',
          fabric_type: 'Cotton',
          weight: '',
          color: '',
          condition: 'Reusable',
          source: 'Pre-Consumer/Industrial',
          description: '',
          image_data: null
        });
        navigate('/dashboard/submissions');
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Submission failed.');
    }
  };

  // User waste edit submission
  const handleEditSubmission = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!editForm.organization.trim()) nextErrors.organization = 'Organization is required';
    if (!editForm.contact_person.trim()) nextErrors.contact_person = 'Contact person is required';
    if (!editForm.email.trim()) nextErrors.email = 'Email is required';
    if (!editForm.phone.trim()) nextErrors.phone = 'Phone is required';
    if (!editForm.weight || parseFloat(editForm.weight) <= 0) nextErrors.weight = 'Weight must be positive';
    if (!editForm.color.trim()) nextErrors.color = 'Color is required';

    if (Object.keys(nextErrors).length > 0) {
      setEditErrors(nextErrors);
      return;
    }
    setEditErrors({});

    try {
      const payload = {
        ...editForm,
        weight: parseFloat(editForm.weight)
      };
      const res = await wasteService.update(selectedSub.id, payload);
      if (res.success) {
        toast.success('Submission updated successfully!');
        setActiveModal(null);
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to update submission');
    }
  };

  // User waste delete submission
  const handleDeleteSubmission = async () => {
    try {
      const res = await wasteService.delete(selectedSub.id);
      if (res.success) {
        toast.success('Submission deleted successfully');
        setActiveModal(null);
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to delete submission');
    }
  };

  // Profile update submit
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!profileForm.name.trim()) nextErrors.name = 'Name is required';
    if (!profileForm.organization.trim()) nextErrors.organization = 'Organization is required';
    if (!profileForm.phone.trim()) nextErrors.phone = 'Phone number is required';
    
    if (Object.keys(nextErrors).length > 0) {
      setProfileErrors(nextErrors);
      return;
    }
    setProfileErrors({});

    try {
      const payload = { ...profileForm };
      if (!payload.password.strip()) {
        delete payload.password;
      }
      const res = await authService.updateProfile(payload);
      if (res.success) {
        updateUser(res.user);
        setProfileForm(prev => ({ ...prev, password: '' }));
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update profile');
    }
  };

  const openViewModal = (sub) => {
    setSelectedSub(sub);
    setActiveModal('view');
  };

  const openEditModal = (sub) => {
    setSelectedSub(sub);
    setEditForm({ ...sub });
    setActiveModal('edit');
  };

  const openDeleteModal = (sub) => {
    setSelectedSub(sub);
    setActiveModal('delete');
  };

  // Nav styles helper
  const navLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
      isActive
        ? 'bg-emerald-600 text-white shadow-md'
        : 'text-slate-300 hover:bg-emerald-800 hover:text-white'
    }`;
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-emerald-950 text-slate-100 flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-emerald-900 flex items-center space-x-2">
          <Leaf className="h-6 w-6 text-emerald-400" />
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
            User Workspace
          </span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link to="/dashboard" className={navLinkClass('/dashboard')}>
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link to="/dashboard/submit" className={navLinkClass('/dashboard/submit')}>
            <PlusCircle className="h-5 w-5" />
            <span>Submit Waste</span>
          </Link>
          <Link to="/dashboard/submissions" className={navLinkClass('/dashboard/submissions')}>
            <List className="h-5 w-5" />
            <span>My Submissions</span>
          </Link>
          <Link to="/dashboard/profile" className={navLinkClass('/dashboard/profile')}>
            <User className="h-5 w-5" />
            <span>Profile</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-emerald-900">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold text-rose-300 hover:bg-rose-950 hover:text-rose-200 transition"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 px-8 flex justify-between items-center shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Welcome back</span>
            <span className="font-bold text-slate-800 text-sm">{user?.name} ({user?.organization})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Dynamic Route/Tab rendering */}
        <div className="flex-1 p-8 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-emerald-600 font-semibold">
              <span className="animate-pulse">Loading platform workspace...</span>
            </div>
          ) : (
            <>
              {/* VIEW: DASHBOARD HOME */}
              {location.pathname === '/dashboard' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-900">Platform Analytics Overview</h1>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center space-x-5">
                      <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
                        <FileText className="h-8 w-8" />
                      </div>
                      <div>
                        <span className="text-sm text-slate-500 font-medium block">Total Waste Submissions</span>
                        <span className="text-3xl font-extrabold text-slate-900 mt-1 block">{stats.total_submissions}</span>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center space-x-5">
                      <div className="p-4 bg-teal-50 text-teal-600 rounded-xl">
                        <Weight className="h-8 w-8" />
                      </div>
                      <div>
                        <span className="text-sm text-slate-500 font-medium block">Total Weight Logged</span>
                        <span className="text-3xl font-extrabold text-slate-900 mt-1 block">{stats.total_weight} Kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Submission Panel */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                    <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-4 mb-4">
                      Recent Submission Details
                    </h3>
                    {stats.recent_submission ? (
                      <div className="grid md:grid-cols-3 gap-6 items-center">
                        <div className="space-y-3 col-span-2">
                          <div className="flex items-center space-x-3 text-xs text-slate-400">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                              {stats.recent_submission.submission_id}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              {new Date(stats.recent_submission.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                              <span className="text-xs text-slate-500 font-medium block">Fabric Type</span>
                              <span className="text-sm font-semibold text-slate-800">{stats.recent_submission.fabric_type}</span>
                            </div>
                            <div>
                              <span className="text-xs text-slate-500 font-medium block">Weight</span>
                              <span className="text-sm font-semibold text-slate-800">{stats.recent_submission.weight} Kg</span>
                            </div>
                            <div>
                              <span className="text-xs text-slate-500 font-medium block">Color</span>
                              <span className="text-sm font-semibold text-slate-800">{stats.recent_submission.color}</span>
                            </div>
                            <div>
                              <span className="text-xs text-slate-500 font-medium block">Source</span>
                              <span className="text-sm font-semibold text-slate-800">{stats.recent_submission.source}</span>
                            </div>
                          </div>
                        </div>

                        {/* AI Classification Sidebar */}
                        <div className="bg-emerald-50/50 border border-emerald-200 p-5 rounded-xl space-y-4">
                          <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
                            <Sparkles className="h-4 w-4 text-emerald-600 animate-spin" />
                            <span>AI Classification</span>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Predicted Material:</span>
                              <span className="font-semibold text-slate-800">{stats.recent_submission.ai_prediction?.material}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Recycling Stream:</span>
                              <span className="font-semibold text-emerald-700">{stats.recent_submission.ai_prediction?.recommendation}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Confidence Score:</span>
                              <span className="font-semibold text-slate-800">{stats.recent_submission.ai_prediction?.confidence}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10 text-slate-400">
                        <Info className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-sm">No textile waste batches registered yet. Go submit one!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* VIEW: SUBMIT WASTE PAGE */}
              {location.pathname === '/dashboard/submit' && (
                <div className="max-w-3xl mx-auto bg-white border border-slate-200 shadow-sm rounded-xl p-8">
                  <div className="flex items-center space-x-2 border-b border-slate-100 pb-5 mb-6">
                    <PlusCircle className="h-6 w-6 text-emerald-600" />
                    <h1 className="text-xl font-bold text-slate-900">Register Textile Waste</h1>
                  </div>

                  <form onSubmit={handleSubmitWaste} className="space-y-6" noValidate>
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Organization</label>
                        <input
                          type="text"
                          disabled
                          className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-100 rounded-lg text-sm text-slate-500 focus:outline-none"
                          value={submitForm.organization}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
                        <input
                          type="text"
                          disabled
                          className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-100 rounded-lg text-sm text-slate-500 focus:outline-none"
                          value={submitForm.contact_person}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          disabled
                          className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-100 rounded-lg text-sm text-slate-500 focus:outline-none"
                          value={submitForm.email}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                        <input
                          type="text"
                          disabled
                          className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-100 rounded-lg text-sm text-slate-500 focus:outline-none"
                          value={submitForm.phone}
                        />
                      </div>
                    </div>

                    <hr className="border-slate-100" />

                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Waste Category Type</label>
                        <select
                          className="w-full px-3.5 py-2.5 border border-slate-300 bg-slate-50 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          value={submitForm.waste_type}
                          onChange={(e) => setSubmitForm(prev => ({ ...prev, waste_type: e.target.value }))}
                        >
                          <option>Fabric Scraps</option>
                          <option>Yarn Waste</option>
                          <option>Cut Pieces</option>
                          <option>Garment Samples</option>
                          <option>Defective Stock</option>
                          <option>Other</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Fabric Material Type</label>
                        <select
                          className="w-full px-3.5 py-2.5 border border-slate-300 bg-slate-50 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          value={submitForm.fabric_type}
                          onChange={(e) => setSubmitForm(prev => ({ ...prev, fabric_type: e.target.value }))}
                        >
                          <option>Cotton</option>
                          <option>Polyester</option>
                          <option>Wool</option>
                          <option>Nylon</option>
                          <option>Denim</option>
                          <option>Silk</option>
                          <option>Linen</option>
                          <option>Blended</option>
                          <option>Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Weight (Kg)</label>
                        <input
                          type="number"
                          step="0.01"
                          className={`w-full px-3.5 py-2.5 border rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm ${
                            submitErrors.weight ? 'border-red-300 ring-red-100 ring-4' : 'border-slate-300'
                          }`}
                          placeholder="0.00"
                          value={submitForm.weight}
                          onChange={(e) => setSubmitForm(prev => ({ ...prev, weight: e.target.value }))}
                        />
                        {submitErrors.weight && <p className="mt-1 text-2xs text-red-600">{submitErrors.weight}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Color</label>
                        <input
                          type="text"
                          className={`w-full px-3.5 py-2.5 border rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm ${
                            submitErrors.color ? 'border-red-300 ring-red-100 ring-4' : 'border-slate-300'
                          }`}
                          placeholder="e.g., Indigo Blue"
                          value={submitForm.color}
                          onChange={(e) => setSubmitForm(prev => ({ ...prev, color: e.target.value }))}
                        />
                        {submitErrors.color && <p className="mt-1 text-2xs text-red-600">{submitErrors.color}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Condition</label>
                        <select
                          className="w-full px-3.5 py-2.5 border border-slate-300 bg-slate-50 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          value={submitForm.condition}
                          onChange={(e) => setSubmitForm(prev => ({ ...prev, condition: e.target.value }))}
                        >
                          <option>Reusable</option>
                          <option>Recyclable</option>
                          <option>Damaged</option>
                          <option>Contaminated</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Source Stream</label>
                        <select
                          className="w-full px-3.5 py-2.5 border border-slate-300 bg-slate-50 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          value={submitForm.source}
                          onChange={(e) => setSubmitForm(prev => ({ ...prev, source: e.target.value }))}
                        >
                          <option>Pre-Consumer/Industrial</option>
                          <option>Post-Consumer</option>
                          <option>Post-Industrial</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Notes</label>
                      <textarea
                        rows="3"
                        className="w-full px-3.5 py-2.5 border border-slate-300 bg-slate-50 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Add secondary comments regarding weave, density, or source details..."
                        value={submitForm.description}
                        onChange={(e) => setSubmitForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>

                    {/* Image Upload Block */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Upload Fabric Thumbnail</label>
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition relative">
                        {submitForm.image_data ? (
                          <div className="text-center space-y-2">
                            <img src={submitForm.image_data} alt="Thumbnail preview" className="h-32 mx-auto rounded object-cover shadow border border-slate-200" />
                            <button
                              type="button"
                              onClick={() => setSubmitForm(prev => ({ ...prev, image_data: null }))}
                              className="text-xs text-red-500 font-semibold hover:underline"
                            >
                              Remove Image
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center text-slate-500 hover:text-slate-700 text-sm">
                            <Upload className="h-8 w-8 text-slate-400 mb-2" />
                            <span className="font-semibold">Click to choose image</span>
                            <span className="text-2xs text-slate-400 mt-1">PNG, JPG up to 2MB</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(e, 'submit')}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm hover:shadow transition text-sm"
                    >
                      Register Batch & Run AI Prediction
                    </button>
                  </form>
                </div>
              )}

              {/* VIEW: MY SUBMISSIONS */}
              {location.pathname === '/dashboard/submissions' && (
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="font-bold text-slate-900 text-lg">My Submissions Catalog</h2>
                    <Link
                      to="/dashboard/submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>Log New Batch</span>
                    </Link>
                  </div>

                  {submissions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 text-xs uppercase">
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Fabric Type</th>
                            <th className="px-6 py-4">Weight</th>
                            <th className="px-6 py-4">Color</th>
                            <th className="px-6 py-4">AI Rec</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150 text-slate-700">
                          {submissions.map((sub) => (
                            <tr key={sub.id} className="hover:bg-slate-50 transition">
                              <td className="px-6 py-4 font-semibold text-slate-900 text-xs">
                                {sub.submission_id}
                              </td>
                              <td className="px-6 py-4 text-xs">
                                {new Date(sub.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 font-medium">{sub.fabric_type}</td>
                              <td className="px-6 py-4">{sub.weight} Kg</td>
                              <td className="px-6 py-4 text-xs">{sub.color}</td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  {sub.ai_prediction?.recommendation}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end space-x-2">
                                  <button
                                    onClick={() => openViewModal(sub)}
                                    className="p-1.5 text-slate-500 hover:bg-slate-100 rounded transition"
                                    title="View Details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => openEditModal(sub)}
                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition"
                                    title="Edit Entry"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => openDeleteModal(sub)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded transition"
                                    title="Delete Entry"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-20 text-slate-400">
                      <Info className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                      <p className="text-sm font-medium">You have not submitted any textile waste yet.</p>
                      <Link to="/dashboard/submit" className="text-xs text-emerald-600 font-semibold hover:underline mt-1 block">
                        Register your first batch now
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW: PROFILE PAGE */}
              {location.pathname === '/dashboard/profile' && (
                <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-xl shadow-sm p-8">
                  <div className="flex items-center space-x-2 border-b border-slate-100 pb-5 mb-6">
                    <User className="h-6 w-6 text-emerald-600" />
                    <h1 className="text-xl font-bold text-slate-900">Manage Profile</h1>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-5" noValidate>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        className={`w-full px-3.5 py-2.5 border rounded-lg bg-slate-50 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm ${
                          profileErrors.name ? 'border-red-300 ring-red-100 ring-4' : 'border-slate-300'
                        }`}
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                      {profileErrors.name && <p className="mt-1 text-2xs text-red-600">{profileErrors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        disabled
                        className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-150 rounded-lg text-sm text-slate-500 focus:outline-none cursor-not-allowed"
                        value={user?.email || ''}
                      />
                      <p className="text-3xs text-slate-400 mt-1">Email address cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Organization</label>
                      <input
                        type="text"
                        className={`w-full px-3.5 py-2.5 border rounded-lg bg-slate-50 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm ${
                          profileErrors.organization ? 'border-red-300 ring-red-100 ring-4' : 'border-slate-300'
                        }`}
                        value={profileForm.organization}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, organization: e.target.value }))}
                      />
                      {profileErrors.organization && <p className="mt-1 text-2xs text-red-600">{profileErrors.organization}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        className={`w-full px-3.5 py-2.5 border rounded-lg bg-slate-50 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm ${
                          profileErrors.phone ? 'border-red-300 ring-red-100 ring-4' : 'border-slate-300'
                        }`}
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                      {profileErrors.phone && <p className="mt-1 text-2xs text-red-600">{profileErrors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Change Password (Optional)</label>
                      <input
                        type="password"
                        className="w-full px-3.5 py-2.5 border border-slate-300 bg-slate-50 rounded-lg text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="•••••••• (leave blank to keep current)"
                        value={profileForm.password}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, password: e.target.value }))}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm hover:shadow transition text-sm"
                    >
                      Update Profile Details
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ================= MODALS SECTION ================= */}
      
      {/* 1. VIEW MODAL */}
      {activeModal === 'view' && selectedSub && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-2 border-b border-slate-100 pb-4 mb-5">
              <Leaf className="h-5 w-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-lg">Waste Batch Details</h3>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-2xs font-semibold">
                {selectedSub.submission_id}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Image & AI Predictions */}
              <div className="space-y-4">
                {selectedSub.image_data ? (
                  <img
                    src={selectedSub.image_data}
                    alt="Fabric batch"
                    className="w-full h-40 object-cover rounded-xl border border-slate-200 shadow-inner"
                  />
                ) : (
                  <div className="w-full h-40 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200">
                    <span className="text-xs">No image provided</span>
                  </div>
                )}

                {/* AI classification panel */}
                <div className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-xl space-y-2">
                  <div className="flex items-center space-x-1.5 text-emerald-900 font-bold text-xs">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600 animate-spin" />
                    <span>AI Model Analysis</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Material classification:</span>
                      <span className="font-bold text-slate-800">{selectedSub.ai_prediction?.material}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Recyclability index:</span>
                      <span className="font-bold text-slate-800">{selectedSub.ai_prediction?.waste_category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Optimal recycling stream:</span>
                      <span className="font-bold text-emerald-700">{selectedSub.ai_prediction?.recommendation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Prediction Confidence:</span>
                      <span className="font-bold text-slate-800">{selectedSub.ai_prediction?.confidence}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fabric Specs */}
              <div className="space-y-4 text-sm">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2.5">
                  <div>
                    <span className="text-slate-400 text-3xs font-bold uppercase tracking-wider block">Submission Timestamp</span>
                    <span className="text-slate-800 font-semibold text-xs">
                      {new Date(selectedSub.date).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-3xs font-bold uppercase tracking-wider block">Logged By</span>
                    <span className="text-slate-800 font-semibold text-xs">{selectedSub.created_by}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-3xs font-bold uppercase tracking-wider block">Fabric Type</span>
                    <span className="text-slate-800 font-semibold text-xs">{selectedSub.fabric_type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-3xs font-bold uppercase tracking-wider block">Weight</span>
                    <span className="text-slate-800 font-semibold text-xs">{selectedSub.weight} Kg</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-3xs font-bold uppercase tracking-wider block">Color</span>
                    <span className="text-slate-800 font-semibold text-xs">{selectedSub.color}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-3xs font-bold uppercase tracking-wider block">Condition</span>
                    <span className="text-slate-800 font-semibold text-xs">{selectedSub.condition}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-3xs font-bold uppercase tracking-wider block">Stream Source</span>
                    <span className="text-slate-800 font-semibold text-xs">{selectedSub.source}</span>
                  </div>
                </div>
              </div>
            </div>

            {selectedSub.description && (
              <div className="mt-5 bg-slate-50 p-4 rounded-xl border border-slate-150 text-sm">
                <span className="text-slate-400 text-3xs font-bold uppercase tracking-wider block mb-1">Batch Description</span>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-xs">{selectedSub.description}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. EDIT MODAL */}
      {activeModal === 'edit' && selectedSub && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-2 border-b border-slate-100 pb-4 mb-5">
              <Edit2 className="h-5 w-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-lg">Modify Batch Entry</h3>
            </div>

            <form onSubmit={handleEditSubmission} className="space-y-4" noValidate>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Organization</label>
                  <input
                    type="text"
                    className={`w-full px-3.5 py-2.5 border rounded-lg bg-slate-50 text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${
                      editErrors.organization ? 'border-red-300 ring-red-100' : 'border-slate-350'
                    }`}
                    value={editForm.organization}
                    onChange={(e) => setEditForm(prev => ({ ...prev, organization: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    className={`w-full px-3.5 py-2.5 border rounded-lg bg-slate-50 text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${
                      editErrors.contact_person ? 'border-red-300 ring-red-100' : 'border-slate-350'
                    }`}
                    value={editForm.contact_person}
                    onChange={(e) => setEditForm(prev => ({ ...prev, contact_person: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    className={`w-full px-3.5 py-2.5 border rounded-lg bg-slate-50 text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${
                      editErrors.email ? 'border-red-300 ring-red-100' : 'border-slate-350'
                    }`}
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    className={`w-full px-3.5 py-2.5 border rounded-lg bg-slate-50 text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${
                      editErrors.phone ? 'border-red-300 ring-red-100' : 'border-slate-350'
                    }`}
                    value={editForm.phone}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fabric Type</label>
                  <select
                    className="w-full px-3.5 py-2.5 border border-slate-300 bg-slate-50 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={editForm.fabric_type}
                    onChange={(e) => setEditForm(prev => ({ ...prev, fabric_type: e.target.value }))}
                  >
                    <option>Cotton</option>
                    <option>Polyester</option>
                    <option>Wool</option>
                    <option>Nylon</option>
                    <option>Denim</option>
                    <option>Silk</option>
                    <option>Linen</option>
                    <option>Blended</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Weight (Kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    className={`w-full px-3.5 py-2.5 border rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${
                      editErrors.weight ? 'border-red-300 ring-red-100' : 'border-slate-350'
                    }`}
                    value={editForm.weight}
                    onChange={(e) => setEditForm(prev => ({ ...prev, weight: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Color</label>
                  <input
                    type="text"
                    className={`w-full px-3.5 py-2.5 border rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm ${
                      editErrors.color ? 'border-red-300 ring-red-100' : 'border-slate-350'
                    }`}
                    value={editForm.color}
                    onChange={(e) => setEditForm(prev => ({ ...prev, color: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Condition</label>
                  <select
                    className="w-full px-3.5 py-2.5 border border-slate-300 bg-slate-50 rounded-lg text-sm text-slate-900 focus:outline-none"
                    value={editForm.condition}
                    onChange={(e) => setEditForm(prev => ({ ...prev, condition: e.target.value }))}
                  >
                    <option>Reusable</option>
                    <option>Recyclable</option>
                    <option>Damaged</option>
                    <option>Contaminated</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  className="w-full px-3.5 py-2.5 border border-slate-300 bg-slate-50 rounded-lg text-sm text-slate-950 focus:outline-none"
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* Image upload in edit */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Update Thumbnail</label>
                <div className="flex items-center space-x-4">
                  {editForm.image_data && (
                    <img src={editForm.image_data} alt="Edit preview" className="h-16 w-16 object-cover rounded border border-slate-200" />
                  )}
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3 py-2 rounded text-xs font-semibold">
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'edit')}
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow transition"
                >
                  Save Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. DELETE CONFIRM MODAL */}
      {activeModal === 'delete' && selectedSub && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full shadow-2xl p-6 relative">
            <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3 mb-4">
              Delete Entry Confirmation
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Are you sure you want to permanently delete submission <strong className="text-slate-800 font-bold">{selectedSub.submission_id}</strong>? This action will remove the record and cannot be undone.
            </p>
            <div className="flex justify-end space-x-3 mt-6 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubmission}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold shadow transition"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
