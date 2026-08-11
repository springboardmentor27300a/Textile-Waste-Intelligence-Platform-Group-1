import React, { useState, useEffect } from 'react';
import inventoryService from '../services/inventoryService';
import { Database, Leaf, ShieldAlert, Sparkles, CheckCircle2, Info } from 'lucide-react';

const DatasetCatalogPage = () => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const data = await inventoryService.getDatasets();
        setDatasets(data);
      } catch (err) {
        console.error('Error fetching datasets:', err);
        setError('Could not retrieve datasets. Please ensure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchDatasets();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
          <p className="text-slate-400 text-sm font-semibold">Loading dataset intelligence...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    if (status.includes('Seeded') || status.includes('Ready')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">AI & Machine Learning Datasets</h1>
        <p className="text-sm text-slate-400 font-semibold mt-1">
          Explore integrated image datasets, categories, and circular fabric libraries linked to TWIP.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Info notice about Dataset Catalog status */}
      <div className="p-5 bg-gradient-to-r from-primary-900 to-emerald-950 text-white rounded-3xl flex items-start space-x-4 shadow-sm">
        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
          <Info className="h-5 w-5 text-primary-200" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold">Textile Dataset Integration</h4>
          <p className="text-xs text-primary-100 font-medium leading-relaxed">
            The machine learning datasets listed below are mapped into the TWIP metadata catalog. They set the mathematical classification labels, categories, and composition baselines that the Computer Vision sorting models deploy.
          </p>
        </div>
      </div>

      {/* Grid of Datasets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {datasets.map((dataset) => (
          <div 
            key={dataset.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-primary-200 transition-all group"
          >
            <div className="space-y-4">
              
              {/* Header: Icon + Name + Status */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-11 w-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all">
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">{dataset.name}</h3>
                    <span className="text-[10px] text-slate-400 font-bold">{dataset.size}</span>
                  </div>
                </div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(dataset.status)}`}>
                  {dataset.status}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {dataset.description}
              </p>

              {/* Purpose */}
              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Platform Purpose</span>
                <p className="text-slate-700 font-semibold">{dataset.purpose}</p>
              </div>

              {/* Classes list */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Classes ({dataset.classes.length})</span>
                <div className="flex flex-wrap gap-1.5">
                  {dataset.classes.map((cls, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-semibold border border-slate-200/30"
                    >
                      {cls}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Simulated Action */}
            <div className="border-t border-slate-100 pt-4 mt-6 flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-primary-500" />
                <span>Ready for training run</span>
              </span>
              <span className="text-primary-600 font-bold cursor-default hover:underline">Inference Ready</span>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

export default DatasetCatalogPage;
