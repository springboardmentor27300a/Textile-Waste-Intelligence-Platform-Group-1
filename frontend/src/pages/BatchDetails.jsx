import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Tag, MapPin, Scale, RefreshCw, AlertCircle, Clock, FileText } from 'lucide-react';
import api from '../services/api';

export default function BatchDetails() {
  const { id } = useParams();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBatchDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/inventory/batches/${id}`);
      setBatch(res.data);
    } catch (err) {
      console.error(err);
      setError('Could not locate specified waste batch details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatchDetails();
  }, [id]);

  const steps = ['Pending', 'Sorting', 'Sorted', 'Recycling', 'Recycled'];
  const getStepIndex = (status) => steps.indexOf(status);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <RefreshCw size={24} className="animate-spin text-primary-neon shadow-neon mb-2" />
        <span>Loading batch specifications...</span>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="max-w-xl mx-auto py-12 px-6">
        <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 rounded-3xl flex flex-col items-center text-center space-y-4 shadow-soft">
          <AlertCircle size={40} className="text-red-500" />
          <h2 className="text-lg font-bold">Error Loading Details</h2>
          <p className="text-xs">{error || 'Requested waste batch does not exist.'}</p>
          <Link to="/inventory" className="px-4 py-2 bg-primary-800 text-white rounded-xl text-xs font-semibold">
            Return to Inventory
          </Link>
        </div>
      </div>
    );
  }

  const activeStep = getStepIndex(batch.status);

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        to="/inventory"
        className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-primary-800 dark:hover:text-primary-neon transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Back to Inventory Database</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Batch {batch.batch_number}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-primary-50 text-primary-800 border border-primary-100 dark:bg-emerald-950/20 dark:text-primary-neon dark:border-emerald-900/30 shadow-neon">
              {batch.status}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-2">Database Record Identifier: {batch.id}</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side (Specs and Timeline) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Specs Card */}
          <div className="p-6 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-3xl shadow-soft">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-6 flex items-center space-x-2">
              <FileText size={14} className="text-primary-800 dark:text-primary-neon" />
              <span>Material Specifications</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-medium">
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-borderLight dark:border-borderDark">
                  <span className="text-slate-400 flex items-center space-x-2">
                    <Tag size={13} />
                    <span>Fabric Composition</span>
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{batch.fabric_type}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-borderLight dark:border-borderDark">
                  <span className="text-slate-400 flex items-center space-x-2">
                    <Scale size={13} />
                    <span>Total Weight</span>
                  </span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{batch.quantity} kg</span>
                </div>

                <div className="flex justify-between py-2 border-b border-borderLight dark:border-borderDark">
                  <span className="text-slate-400 flex items-center space-x-2">
                    <MapPin size={13} />
                    <span>Storage Location</span>
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{batch.storage_location}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-borderLight dark:border-borderDark">
                  <span className="text-slate-400 flex items-center space-x-2">
                    <Calendar size={13} />
                    <span>Collection Date</span>
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{batch.collection_date}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-borderLight dark:border-borderDark">
                  <span className="text-slate-400 flex items-center space-x-2">
                    <User size={13} />
                    <span>Source Origin</span>
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">{batch.source}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-borderLight dark:border-borderDark">
                  <span className="text-slate-400 flex items-center space-x-2">
                    <Clock size={13} />
                    <span>Audit Time</span>
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {batch.updated_at ? new Date(batch.updated_at).toLocaleString() : new Date(batch.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {batch.remarks && (
              <div className="mt-6 p-4 bg-slate-50 dark:bg-bgDark/40 rounded-2xl border border-borderLight dark:border-borderDark">
                <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Remarks</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{batch.remarks}</p>
              </div>
            )}
          </div>

          {/* Timeline Card */}
          <div className="p-6 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-3xl shadow-soft">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-8">Processing Stage Progress</h3>
            
            <div className="relative flex flex-col md:flex-row justify-between items-center md:items-start gap-8 md:gap-0 pl-6 md:pl-0">
              
              {/* Line connector for large screens */}
              <div className="hidden md:block absolute left-[8%] right-[8%] top-4 h-0.5 bg-slate-100 dark:bg-slate-900 -z-10"></div>
              
              {/* Line connector for mobile */}
              <div className="md:hidden absolute left-4 top-2 bottom-8 w-0.5 bg-slate-100 dark:bg-slate-900 -z-10"></div>

              {steps.map((step, idx) => {
                const isCompleted = idx <= activeStep;
                const isActive = idx === activeStep;
                return (
                  <div key={step} className="flex md:flex-col items-center w-full md:text-center relative gap-4 md:gap-0 animate-fade-in">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white dark:border-cardDark shadow-md transition-all ${
                      isCompleted 
                        ? 'bg-primary-800 dark:bg-emerald-950 text-white dark:text-primary-neon border-primary-50 dark:border-borderDark shadow-neon' 
                        : 'bg-slate-50 text-slate-400 border-slate-50 dark:border-bgDark'
                    }`}>
                      <span className="text-[10px] font-bold">{idx + 1}</span>
                    </div>
                    
                    <div className="mt-0 md:mt-3 text-left md:text-center">
                      <p className={`text-xs font-bold ${
                        isActive ? 'text-primary-800 dark:text-primary-neon' : 
                        isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                      }`}>
                        {step}
                      </p>
                      <p className="text-[9px] text-slate-400 mt-0.5 font-medium">
                        {isActive ? 'Current Phase' : isCompleted ? 'Completed' : 'Upcoming'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side (Visual placeholders & breakdown stats) */}
        <div className="space-y-6">
          {/* Captures Mock */}
          <div className="p-6 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-3xl shadow-soft">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Batch Visual Capture</h3>
            
            <div className="aspect-video w-full rounded-2xl border border-dashed border-borderLight dark:border-borderDark bg-slate-50 dark:bg-bgDark/50 flex flex-col items-center justify-center text-center p-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full mb-3">
                <Clock size={20} className="animate-pulse" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Capture Feed Pending</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 max-w-[180px] font-medium leading-normal">
                Computer vision camera capture is a Milestone 2 feature.
              </span>
            </div>
          </div>

          {/* Composition Gauges */}
          <div className="p-6 bg-white dark:bg-cardDark border border-borderLight dark:border-borderDark rounded-3xl shadow-soft">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-6">Material Analysis</h3>
            
            <div className="space-y-4 text-xs font-medium">
              <div>
                <div className="flex justify-between mb-1.5 text-slate-700 dark:text-slate-300">
                  <span>Natural Fiber (Cotton/Wool)</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">75%</span>
                </div>
                <div className="w-full h-2 bg-slate-50 dark:bg-slate-900 border border-borderLight dark:border-borderDark rounded-full overflow-hidden">
                  <div className="h-full bg-primary-800 dark:bg-primary-neon rounded-full shadow-neon" style={{ width: '75%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5 text-slate-700 dark:text-slate-300">
                  <span>Synthetic Fiber (Polyester)</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">20%</span>
                </div>
                <div className="w-full h-2 bg-slate-50 dark:bg-slate-900 border border-borderLight dark:border-borderDark rounded-full overflow-hidden">
                  <div className="h-full bg-accent-cyan rounded-full shadow-neon-cyan" style={{ width: '20%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5 text-slate-700 dark:text-slate-300">
                  <span>Impurities / Blend Traces</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">5%</span>
                </div>
                <div className="w-full h-2 bg-slate-50 dark:bg-slate-900 border border-borderLight dark:border-borderDark rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '5%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
