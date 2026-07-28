import React from 'react';
import { Recycle, Star, TrendingUp } from 'lucide-react';

const WASTE_COLORS = {
  Recyclable: { bg: 'bg-green-100 dark:bg-green-950/30', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500' },
  Reusable: { bg: 'bg-blue-100 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  Repairable: { bg: 'bg-yellow-100 dark:bg-yellow-950/30', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500' },
  Upcyclable: { bg: 'bg-purple-100 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' },
  Compostable: { bg: 'bg-lime-100 dark:bg-lime-950/30', text: 'text-lime-700 dark:text-lime-400', dot: 'bg-lime-500' },
  'Hazardous Textile Waste': { bg: 'bg-red-100 dark:bg-red-950/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
};

const RATING_COLORS = {
  Excellent: 'text-green-500',
  Good: 'text-blue-500',
  Fair: 'text-yellow-500',
  Poor: 'text-red-500',
};

export default function PredictionCard({ prediction, onClick, compact = false }) {
  if (!prediction) return null;

  const {
    material, confidence, waste_category, recyclability_score,
    recovery_difficulty, overall_rating, status, created_at,
    material_confidence, waste_confidence,
  } = prediction;

  const conf = confidence ?? material_confidence ?? 0;
  const recyclability = recyclability_score ?? 0;
  const wasteStyle = WASTE_COLORS[waste_category] || WASTE_COLORS.Recyclable;
  const ratingColor = RATING_COLORS[overall_rating] || 'text-slate-500';

  return (
    <div
      onClick={onClick}
      className={`
        glass-card rounded-3xl overflow-hidden transition-all duration-300
        ${onClick ? 'cursor-pointer hover:shadow-neon hover:-translate-y-0.5' : ''}
        ${compact ? 'p-4' : 'p-0'}
      `}
    >
      {!compact && (
        /* Gradient Header */
        <div className="h-2 bg-gradient-to-r from-primary-500 via-emerald-400 to-accent-cyan" />
      )}

      <div className={compact ? '' : 'p-5'}>
        {/* Status + Time */}
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${wasteStyle.bg} ${wasteStyle.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${wasteStyle.dot}`} />
            <span>{waste_category}</span>
          </span>
          {created_at && (
            <span className="text-[9px] text-slate-400 font-mono">
              {new Date(created_at).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Material */}
        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">{material}</h3>

        {/* Confidence Meter */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-slate-400">AI Confidence</span>
            <span className="text-xs font-bold text-primary-600 dark:text-primary-neon">{conf.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-accent-cyan rounded-full transition-all duration-1000"
              style={{ width: `${conf}%` }}
            />
          </div>
        </div>

        {!compact && (
          <>
            {/* Recyclability */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                  <Recycle size={10} />
                  <span>Recyclability</span>
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{recyclability.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-1000"
                  style={{ width: `${recyclability}%` }}
                />
              </div>
            </div>

            {/* Recovery + Rating Row */}
            <div className="flex items-center justify-between pt-2 border-t border-borderLight dark:border-borderDark">
              <div className="flex items-center space-x-1.5">
                <TrendingUp size={12} className="text-slate-400" />
                <span className="text-[10px] text-slate-500">{recovery_difficulty} Recovery</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star size={10} className={ratingColor} fill="currentColor" />
                <span className={`text-[10px] font-semibold ${ratingColor}`}>{overall_rating}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
