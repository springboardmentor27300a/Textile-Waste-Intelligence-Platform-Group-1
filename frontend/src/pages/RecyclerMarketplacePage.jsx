import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import inventoryService from '../services/inventoryService';
import recyclerService from '../services/recyclerService';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  Sparkles, 
  CheckCircle, 
  MapPin, 
  Mail, 
  Phone, 
  Star, 
  Layers, 
  ShieldCheck, 
  Plus, 
  X, 
  Search, 
  SlidersHorizontal,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Award,
  Copy,
  ExternalLink,
  Send
} from 'lucide-react';

const RecyclerMarketplacePage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialBatchId = searchParams.get('batch_id') || '';

  const [activeTab, setActiveTab] = useState(initialBatchId ? 'matching' : 'directory');

  // Inventory Batches List
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(initialBatchId);
  const [selectedBatchDetails, setSelectedBatchDetails] = useState(null);

  // Recyclers & Matches
  const [recyclers, setRecyclers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [loadingRecyclers, setLoadingRecyclers] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Modal State for Contact Facility
  const [contactModalRecycler, setContactModalRecycler] = useState(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Modal State for Add Recycler
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecycler, setNewRecycler] = useState({
    name: '',
    accepted_materials: 'Cotton, Polyester, Denim',
    accepted_conditions: 'Clean, Good, Fair',
    min_quantity: 50,
    max_contamination_level: 15,
    location: '',
    contact_email: '',
    phone_number: '',
    specialization: '',
    rating: 4.8
  });
  const [addLoading, setAddLoading] = useState(false);

  const canAddRecycler = true;

  useEffect(() => {
    fetchBatches();
    fetchRecyclers();
  }, []);

  useEffect(() => {
    if (selectedBatchId) {
      const b = batches.find(x => x.id === parseInt(selectedBatchId));
      if (b) setSelectedBatchDetails(b);
      fetchMatches(selectedBatchId);
    }
  }, [selectedBatchId, batches]);

  const fetchBatches = async () => {
    try {
      const data = await inventoryService.getInventory({ page: 1, size: 100 });
      const list = data.items || data || [];
      setBatches(list);
      if (list.length > 0 && !selectedBatchId) {
        setSelectedBatchId(list[0].id.toString());
        setSelectedBatchDetails(list[0]);
      }
    } catch (err) {
      console.error("Failed to load inventory batches:", err);
    }
  };

  const fetchRecyclers = async () => {
    setLoadingRecyclers(true);
    try {
      const data = await recyclerService.getAllRecyclers();
      setRecyclers(data);
    } catch (err) {
      console.error("Failed to load recyclers:", err);
    } finally {
      setLoadingRecyclers(false);
    }
  };

  const fetchMatches = async (batchId) => {
    if (!batchId) return;
    setLoadingMatches(true);
    setErrorMsg('');
    try {
      const data = await recyclerService.getBatchRecyclerMatches(batchId);
      setMatches(data);
    } catch (err) {
      console.error("Failed to load batch matches:", err);
      setErrorMsg("Unable to compute matches for this batch.");
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleCreateRecyclerSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        name: newRecycler.name,
        accepted_materials: newRecycler.accepted_materials.split(',').map(s => s.trim()),
        accepted_conditions: newRecycler.accepted_conditions.split(',').map(s => s.trim()),
        min_quantity: parseFloat(newRecycler.min_quantity) || 50,
        max_contamination_level: parseFloat(newRecycler.max_contamination_level) || 15,
        location: newRecycler.location || 'Surat, Gujarat',
        contact_email: newRecycler.contact_email,
        phone_number: newRecycler.phone_number || '+91 98765 43210',
        specialization: newRecycler.specialization || 'Textile Recycling',
        rating: parseFloat(newRecycler.rating) || 4.8
      };

      await recyclerService.createRecycler(payload);
      setShowAddModal(false);
      fetchRecyclers();
      if (selectedBatchId) fetchMatches(selectedBatchId);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to register recycler. Please verify fields.');
    } finally {
      setAddLoading(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    }
  };

  const generateDraftMessage = (recycler) => {
    if (!selectedBatchDetails) {
      return `Dear ${recycler.name} Sourcing Team,\n\nWe are reaching out from the Textile Waste Intelligence Platform to inquire about recycling partnership terms for our textile waste streams.\n\nPlease share your current material acceptance requirements and batch pricing.\n\nBest regards,\n${user?.full_name || 'Sustainability Manager'}`;
    }
    return `Dear ${recycler.name} Sourcing Team,\n\nWe would like to submit Waste Batch #${selectedBatchDetails.id} for recycling processing at your facility in ${recycler.location}.\n\nBatch Parameters:\n- Material: ${selectedBatchDetails.fabric_type}\n- Quantity: ${selectedBatchDetails.quantity} kg\n- Physical Condition: ${selectedBatchDetails.condition}\n- Waste Category: ${selectedBatchDetails.waste_category || 'Recyclable'}\n\nPlease confirm availability and logistics scheduling.\n\nBest regards,\n${user?.full_name || 'Sustainability Manager'}\nTextile Waste Intelligence Platform`;
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/10 backdrop-blur-3xl transform skew-x-12"></div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold">
            <Building2 className="h-3.5 w-3.5" />
            <span>Recycler Marketplace Engine</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Batch-to-Recycler Matching
          </h1>
          <p className="text-sm text-slate-300 font-medium leading-relaxed">
            Match classified textile waste batches with certified regional recycling facilities. Ranked by material compatibility, contamination limits, batch volume fit, and circularity metrics.
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-2.5 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('matching')}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-2xl text-xs font-extrabold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'matching'
                ? 'bg-primary-600 text-white shadow-sm shadow-primary-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Batch Matching Engine</span>
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-2xl text-xs font-extrabold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'directory'
                ? 'bg-primary-600 text-white shadow-sm shadow-primary-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Recycler Directory ({recyclers.length})</span>
          </button>
        </div>

        {canAddRecycler && (
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-2xl text-xs transition-all shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Register New Recycler</span>
          </button>
        )}
      </div>

      {/* TAB 1: BATCH MATCHING ENGINE */}
      {activeTab === 'matching' && (
        <div className="space-y-6">
          
          {/* Select Waste Batch Selector */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Select Classified Waste Batch</h3>
                <p className="text-xs text-slate-400 font-medium">Choose a batch to compute optimal recycling partners</p>
              </div>

              {/* Batch Selector Dropdown */}
              <div className="w-full sm:w-80">
                <select
                  value={selectedBatchId}
                  onChange={(e) => {
                    setSelectedBatchId(e.target.value);
                    const b = batches.find(x => x.id === parseInt(e.target.value));
                    if (b) setSelectedBatchDetails(b);
                  }}
                  className="w-full py-2.5 px-3.5 rounded-2xl border border-slate-200 text-xs font-bold bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-100 cursor-pointer"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      Batch #{b.id} — {b.fabric_type} ({b.quantity} kg, {b.condition})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Batch Metrics Telemetry */}
            {selectedBatchDetails && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Material Type</span>
                  <span className="text-xs font-black text-slate-800">{selectedBatchDetails.fabric_type}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Batch Quantity</span>
                  <span className="text-xs font-black text-emerald-700">{selectedBatchDetails.quantity} kg</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Physical Condition</span>
                  <span className="text-xs font-black text-indigo-700">{selectedBatchDetails.condition}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Waste Category</span>
                  <span className="text-xs font-black text-amber-700">{selectedBatchDetails.waste_category || 'Recyclable'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Loading Indicator */}
          {loadingMatches && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
              <div className="h-8 w-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-500 font-bold">Computing multi-parameter recycler match scores...</p>
            </div>
          )}

          {/* Matches List */}
          {!loadingMatches && matches.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-1">
                Top Matched Recycler Partners ({matches.length} Facilities Ranked)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {matches.map((match, idx) => {
                  const r = match.recycler;
                  return (
                    <div 
                      key={r.id} 
                      className={`bg-white rounded-3xl border p-6 shadow-sm space-y-5 transition-all relative overflow-hidden ${
                        idx === 0 ? 'border-emerald-300 ring-2 ring-emerald-100 shadow-md' : 'border-slate-200/80'
                      }`}
                    >
                      {/* Top Rank Badge & Fit Score */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900 text-white text-xs font-black">
                            #{idx + 1}
                          </span>
                          <div>
                            <h4 className="text-base font-extrabold text-slate-900">{r.name}</h4>
                            <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-semibold">
                              <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                              <span>{r.location}</span>
                            </div>
                          </div>
                        </div>

                        {/* Fit Score Pill */}
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                            match.fit_score >= 85 ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                            match.fit_score >= 70 ? 'bg-primary-50 text-primary-800 border-primary-300' :
                            'bg-amber-50 text-amber-800 border-amber-300'
                          }`}>
                            {match.fit_score}% Fit ({match.fit_category})
                          </span>
                        </div>
                      </div>

                      {/* Why Each Matched Rationale List */}
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          Why Matched Rationale:
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-700 font-semibold">
                          {match.why_matched.map((reason, rIdx) => (
                            <li key={rIdx} className="flex items-start space-x-2">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Recycler Spec Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-semibold">
                        <div className="p-2.5 bg-slate-50 rounded-xl">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">Min Batch Qty</span>
                          <span className="text-slate-800 font-extrabold">{r.min_quantity} kg</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">Max Contam Limit</span>
                          <span className="text-slate-800 font-extrabold">{r.max_contamination_level}%</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl col-span-2 sm:col-span-1">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">Facility Rating</span>
                          <span className="text-amber-700 font-extrabold flex items-center space-x-1">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span>{r.rating} / 5.0</span>
                          </span>
                        </div>
                      </div>

                      {/* Contact Footer */}
                      <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs font-semibold">
                        <div className="space-y-0.5">
                          <span className="text-slate-400 text-[10px] font-bold block">Contact Email</span>
                          <button 
                            type="button" 
                            onClick={() => setContactModalRecycler(r)}
                            className="text-primary-600 hover:text-primary-700 font-extrabold flex items-center space-x-1 cursor-pointer"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            <span>{r.contact_email}</span>
                          </button>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setContactModalRecycler(r)}
                          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-sm transition-all text-xs cursor-pointer flex items-center space-x-1.5"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>Contact Facility</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: RECYCLER DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recyclers.map((r) => (
            <div key={r.id} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-amber-700 flex items-center space-x-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{r.rating}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{r.name}</h3>
                  <p className="text-xs text-slate-500 font-semibold flex items-center space-x-1 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <span>{r.location}</span>
                  </p>
                </div>

                {r.specialization && (
                  <p className="text-xs text-slate-600 font-medium bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <strong>Specialization:</strong> {r.specialization}
                  </p>
                )}

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Accepted Materials</span>
                  <div className="flex flex-wrap gap-1">
                    {r.accepted_materials.map((m, idx) => (
                      <span key={idx} className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-2 text-center bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-xs font-bold">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Min Qty</span>
                    <span className="text-slate-800">{r.min_quantity} kg</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Max Contam</span>
                    <span className="text-slate-800">{r.max_contamination_level}%</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setContactModalRecycler(r)}
                  className="w-full flex items-center justify-center space-x-2 bg-slate-900 hover:bg-primary-600 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm cursor-pointer"
                >
                  <Mail className="h-4 w-4" />
                  <span>Contact Facility Details & Mail</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONTACT FACILITY EMAIL MODAL */}
      {contactModalRecycler && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Verified Recycling Facility
                </span>
                <h3 className="text-xl font-black text-slate-900">{contactModalRecycler.name}</h3>
                <p className="text-xs text-slate-500 font-semibold flex items-center space-x-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>{contactModalRecycler.location}</span>
                </p>
              </div>
              <button 
                onClick={() => setContactModalRecycler(null)} 
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Email Address Highlight Card */}
            <div className="p-5 bg-gradient-to-br from-slate-900 to-primary-950 text-white rounded-2xl space-y-3 shadow-md">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Official Facility Contact Email</span>
              <div className="flex items-center justify-between bg-white/10 p-3 rounded-xl border border-white/20">
                <div className="flex items-center space-x-2.5 font-mono text-sm font-bold text-emerald-300 truncate">
                  <Mail className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">{contactModalRecycler.contact_email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(contactModalRecycler.contact_email, 'email')}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs transition-all flex items-center space-x-1 cursor-pointer flex-shrink-0"
                >
                  {copiedEmail ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedEmail ? 'Copied!' : 'Copy Email'}</span>
                </button>
              </div>

              {contactModalRecycler.phone_number && (
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 pt-1">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>Phone: {contactModalRecycler.phone_number}</span>
                </div>
              )}
            </div>

            {/* Pre-formatted Inquiry Email Draft */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Pre-filled Sourcing Inquiry Draft</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(generateDraftMessage(contactModalRecycler), 'message')}
                  className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center space-x-1 cursor-pointer"
                >
                  {copiedMessage ? <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedMessage ? 'Draft Copied!' : 'Copy Message Draft'}</span>
                </button>
              </div>

              <textarea
                readOnly
                rows={7}
                value={generateDraftMessage(contactModalRecycler)}
                className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs font-mono bg-slate-50 text-slate-800 leading-relaxed focus:outline-none"
              />
            </div>

            {/* Launch Mail Client Button */}
            <div className="flex gap-3 pt-2">
              <a
                href={`mailto:${contactModalRecycler.contact_email}?subject=${encodeURIComponent(`Textile Waste Sourcing Inquiry ${selectedBatchDetails ? `- Batch #${selectedBatchDetails.id}` : ''}`)}&body=${encodeURIComponent(generateDraftMessage(contactModalRecycler))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center space-x-2 shadow-md shadow-primary-200 cursor-pointer"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Open Mail Client (Gmail / Outlook)</span>
              </a>
              <button
                type="button"
                onClick={() => setContactModalRecycler(null)}
                className="px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ADD RECYCLER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-8 space-y-6 relative">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">Register New Recycler</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecyclerSubmit} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Facility Name</label>
                <input
                  type="text"
                  required
                  value={newRecycler.name}
                  onChange={(e) => setNewRecycler({...newRecycler, name: e.target.value})}
                  placeholder="e.g. Surat Eco-Polymers Ltd."
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Accepted Materials (comma-separated)</label>
                <input
                  type="text"
                  required
                  value={newRecycler.accepted_materials}
                  onChange={(e) => setNewRecycler({...newRecycler, accepted_materials: e.target.value})}
                  placeholder="Cotton, Polyester, Denim, Wool"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Min Qty (kg)</label>
                  <input
                    type="number"
                    value={newRecycler.min_quantity}
                    onChange={(e) => setNewRecycler({...newRecycler, min_quantity: e.target.value})}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Max Contam (%)</label>
                  <input
                    type="number"
                    value={newRecycler.max_contamination_level}
                    onChange={(e) => setNewRecycler({...newRecycler, max_contamination_level: e.target.value})}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Location (City, State)</label>
                <input
                  type="text"
                  required
                  value={newRecycler.location}
                  onChange={(e) => setNewRecycler({...newRecycler, location: e.target.value})}
                  placeholder="Surat, Gujarat"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Contact Email</label>
                <input
                  type="email"
                  required
                  value={newRecycler.contact_email}
                  onChange={(e) => setNewRecycler({...newRecycler, contact_email: e.target.value})}
                  placeholder="sourcing@recycler.com"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Contact Phone Number</label>
                <input
                  type="text"
                  required
                  value={newRecycler.phone_number}
                  onChange={(e) => setNewRecycler({...newRecycler, phone_number: e.target.value})}
                  placeholder="+91 98250 11223"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={addLoading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all shadow-md mt-2 cursor-pointer"
              >
                {addLoading ? "Registering..." : "Submit Recycler Registration"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default RecyclerMarketplacePage;
