import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Database, Plus, Upload, Play, ChevronRight, X, 
  BarChart, Layers, RefreshCw, CheckCircle2, AlertCircle, FileArchive 
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DatasetModule() {
  const { user } = useAuth();

  if (user && user.role.name !== 'Administrator') {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 rounded-3xl text-xs font-semibold">
        Access Denied: Dataset directories can only be modified or viewed by Administrators.
      </div>
    );
  }
  
  // State
  const [datasets, setDatasets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Form Modals
  const [registerOpen, setRegisterOpen] = useState(false);
  const [uploadTargetId, setUploadTargetId] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const isAdminOrManager = user && ['Administrator', 'Sustainability Manager'].includes(user.role.name);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        api.get('/datasets/'),
        api.get('/datasets/summary/stats')
      ]);
      setDatasets(listRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dataset catalogs from registry database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const onRegisterSubmit = async (data) => {
    setError('');
    try {
      const res = await api.post('/datasets/register', {
        name: data.name,
        description: data.description,
        format: data.format,
        num_images: parseInt(data.num_images) || 0,
        size_bytes: parseInt(data.size_bytes) || 0
      });
      setSuccess(`Dataset ${res.data.name} registered successfully.`);
      setRegisterOpen(false);
      loadData();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to register dataset.');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadTargetId) return;
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      await api.post(`/datasets/upload/${uploadTargetId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Archive file uploaded and registered successfully.');
      setUploadTargetId(null);
      setUploadFile(null);
      loadData();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      setError('Dataset file upload failed. Ensure server disk space.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (dataset) => {
    setSelectedDataset(dataset);
    setPreviewLoading(true);
    setPreviewData(null);
    try {
      const res = await api.get(`/datasets/${dataset.id}/preview`);
      setPreviewData(res.data.preview_items);
    } catch (err) {
      console.error(err);
      setError('Could not download preview thumbnails.');
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">ML Datasets Registry</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Register, trace, and sample training image feedstocks</p>
        </div>

        {isAdminOrManager && (
          <button
            onClick={() => { reset(); setRegisterOpen(true); }}
            id="register-dataset-btn"
            className="flex items-center space-x-2 px-5 py-2.5 bg-primary-800 dark:bg-emerald-950 text-white dark:text-primary-neon border border-transparent dark:border-borderDark rounded-2xl text-xs font-bold shadow-soft dark:shadow-neon hover-scale"
          >
            <Plus size={14} />
            <span>Register Dataset</span>
          </button>
        )}
      </div>

      {/* Messages */}
      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-primary-neon text-xs rounded-2xl flex items-center space-x-2">
          <CheckCircle2 size={16} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-2xl flex items-center space-x-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-3xl shadow-soft flex items-center space-x-4 transition-all hover-glow-green">
            <div className="p-3 bg-primary-50 dark:bg-emerald-950/40 text-primary-800 dark:text-primary-neon rounded-2xl shadow-neon">
              <Database size={18} />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Datasets</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1 leading-none">{stats.total_datasets}</h3>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-3xl shadow-soft flex items-center space-x-4 transition-all hover-glow-green">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <Layers size={18} />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Images</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1 leading-none">{stats.total_images.toLocaleString()}</h3>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-3xl shadow-soft flex items-center space-x-4 transition-all hover-glow-cyan">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-accent-cyan rounded-2xl">
              <BarChart size={18} />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Data Volume</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1 leading-none">{formatBytes(stats.total_size_bytes)}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Main grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Listing (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="p-12 text-center text-slate-500 bg-white dark:bg-cardDark rounded-3xl border border-borderLight dark:border-borderDark">
              <RefreshCw size={24} className="animate-spin text-primary-neon mx-auto mb-2" />
              <span>Querying dataset catalog...</span>
            </div>
          ) : (
            datasets.map((dataset) => (
              <div 
                key={dataset.id}
                className={`p-6 bg-white dark:bg-cardDark border rounded-3xl shadow-soft transition-all ${
                  selectedDataset?.id === dataset.id 
                    ? 'border-primary-800 dark:border-primary-neon ring-2 ring-primary-50 dark:ring-emerald-950/30' 
                    : 'border-borderLight dark:border-borderDark'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-md font-bold text-slate-900 dark:text-white">{dataset.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-lg leading-relaxed font-medium">{dataset.description}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                    dataset.status === 'Ready' 
                      ? 'bg-green-500/10 text-primary-neon border-green-500/20 shadow-neon' 
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    {dataset.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-6 mt-6 pt-4 border-t border-borderLight dark:border-borderDark text-xs text-slate-500 font-medium">
                  <div>Format: <span className="font-bold text-slate-800 dark:text-white">{dataset.format}</span></div>
                  <div>Images: <span className="font-bold text-slate-800 dark:text-white">{dataset.num_images.toLocaleString()}</span></div>
                  <div>Size: <span className="font-bold text-slate-800 dark:text-white">{formatBytes(dataset.size_bytes)}</span></div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6">
                  {isAdminOrManager && (
                    <button
                      onClick={() => setUploadTargetId(dataset.id)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 border border-borderLight dark:border-borderDark rounded-xl hover:bg-slate-50 dark:hover:bg-bgDark/30 text-xs font-bold hover-scale shadow-soft"
                    >
                      <Upload size={12} />
                      <span>Upload ZIP</span>
                    </button>
                  )}
                  <button
                    onClick={() => handlePreview(dataset)}
                    className="flex items-center space-x-1.5 px-4 py-1.5 bg-primary-800 dark:bg-emerald-950 text-white dark:text-primary-neon border border-transparent dark:border-borderDark rounded-xl text-xs font-bold shadow-soft dark:shadow-neon hover-scale"
                  >
                    <Play size={12} />
                    <span>Preview Dataset</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Live Preview Panel (1 Col) */}
        <div className="lg:col-span-1">
          <div className="p-6 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-3xl shadow-soft sticky top-24 min-h-[300px]">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Metadata Inspector</h3>

            {previewLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <RefreshCw size={20} className="animate-spin text-primary-neon mb-2" />
                <span>Pulling sample vectors...</span>
              </div>
            ) : previewData ? (
              <div className="space-y-4">
                <div className="pb-3 border-b border-borderLight dark:border-borderDark flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                    {selectedDataset?.name}
                  </span>
                  <button onClick={() => setPreviewData(null)} className="text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-3">
                  {previewData.map((item) => (
                    <div key={item.id} className="p-3 bg-slate-50 dark:bg-bgDark/40 border border-borderLight dark:border-borderDark rounded-2xl text-xs space-y-1.5">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-800 dark:text-white truncate max-w-[120px]">{item.label}</span>
                        <span className="text-[10px] text-emerald-600 dark:text-primary-neon font-mono">{item.resolution}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                        <span>Split: {item.split}</span>
                        {item.category && <span>Category: {item.category}</span>}
                        {item.defect && <span>Defect: {item.defect}</span>}
                        {item.material && <span>Composition: {item.material}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-12 text-slate-400 text-xs">
                <Database size={36} className="text-slate-200 dark:text-slate-800/20 mb-3 shadow-neon" />
                <p className="font-medium max-w-[200px] leading-relaxed">Select a dataset preview button to inspect training metadata vectors.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Register Modal */}
      {registerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-6">
          <div className="w-full max-w-sm p-6 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-3xl shadow-2xl animate-fade-in text-xs font-medium">
            <div className="flex justify-between items-center pb-3 border-b border-borderLight dark:border-borderDark mb-4 font-bold text-sm">
              <h3 className="text-slate-900 dark:text-white">Register Dataset Catalog</h3>
              <button onClick={() => setRegisterOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onRegisterSubmit)} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dataset Name</label>
                <input
                  type="text"
                  placeholder="e.g. Fabric defect models"
                  className={`w-full px-3 py-2.5 bg-slate-50 dark:bg-bgDark border rounded-xl outline-none ${
                    errors.name ? 'border-red-300' : 'border-borderLight dark:border-borderDark focus:border-primary-800'
                  }`}
                  {...register('name', { required: 'Name is required' })}
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  placeholder="Summary details..."
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-bgDark border border-borderLight dark:border-borderDark rounded-xl outline-none h-16"
                  {...register('description')}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Format</label>
                  <select
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-bgDark border border-borderLight dark:border-borderDark rounded-xl outline-none"
                    {...register('format')}
                  >
                    <option value="ZIP">ZIP Archive</option>
                    <option value="CSV">CSV Metadata</option>
                    <option value="TAR">TAR Package</option>
                    <option value="JSON">JSON File</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Images</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-bgDark border border-borderLight dark:border-borderDark rounded-xl outline-none"
                    {...register('num_images')}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setRegisterOpen(false)}
                  className="px-4 py-2 border border-borderLight dark:border-borderDark rounded-xl hover:bg-slate-50 dark:hover:bg-bgDark font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary-800 hover:bg-primary-900 text-white rounded-xl font-bold shadow-soft"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {uploadTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-6">
          <div className="w-full max-w-sm p-6 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-3xl shadow-2xl animate-fade-in text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-borderLight dark:border-borderDark mb-4 font-bold text-sm">
              <h3 className="text-slate-900 dark:text-white">Upload Archive File</h3>
              <button onClick={() => { setUploadTargetId(null); setUploadFile(null); }} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-borderLight dark:border-borderDark rounded-3xl p-6 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-bgDark/50">
                <FileArchive className="text-slate-400 dark:text-slate-500 mb-2 shadow-neon" size={32} />
                <span className="text-slate-600 dark:text-slate-400 font-bold">Drop dataset zip pack here</span>
                <input
                  type="file"
                  required
                  accept=".zip,.tar,.gz,.tgz,.csv"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="mt-4 text-xs text-slate-500 w-full"
                />
              </div>

              {uploadFile && (
                <p className="text-[10px] text-emerald-600 dark:text-primary-neon font-bold">
                  File: {uploadFile.name} ({Math.round(uploadFile.size / 1024 / 1024 * 100) / 100} MB)
                </p>
              )}

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => { setUploadTargetId(null); setUploadFile(null); }}
                  className="px-4 py-2 border border-borderLight dark:border-borderDark rounded-xl hover:bg-slate-50 dark:hover:bg-bgDark font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadFile || loading}
                  className="px-5 py-2 bg-primary-800 hover:bg-primary-900 disabled:bg-primary-300 text-white rounded-xl font-bold shadow-soft"
                >
                  {loading ? 'Uploading...' : 'Start Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
