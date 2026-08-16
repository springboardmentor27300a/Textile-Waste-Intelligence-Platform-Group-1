import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, ResponsiveContainer 
} from 'recharts';

export default function CircularityGauge({ circularity }) {
  const {
    circularity_score = 75,
    reuse_potential = 80,
    recovery_efficiency = 70,
    material_retention = 90,
    lifecycle_extension = 75,
  } = circularity;

  // Format data for Radar Chart
  const radarData = [
    { subject: 'Circularity', value: circularity_score, fullMark: 100 },
    { subject: 'Reuse Potential', value: reuse_potential, fullMark: 100 },
    { subject: 'Recovery Eff.', value: recovery_efficiency, fullMark: 100 },
    { subject: 'Retention', value: material_retention, fullMark: 100 },
    { subject: 'Longevity', value: lifecycle_extension, fullMark: 100 },
  ];

  // Dial calculations
  const radius = 55;
  const circumference = 2 * Math.PI * radius; // 345.57
  const dashoffset = circumference - (circularity_score / 100) * circumference;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
      {/* Dial Gauge */}
      <div className="flex flex-col items-center justify-center py-4">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              className="stroke-slate-100 dark:stroke-slate-800"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Value dial with primary/neon gradient */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              className="stroke-primary-500 dark:stroke-primary-neon transition-all duration-1000 ease-out"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              {circularity_score.toFixed(0)}
            </span>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Circular Index</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 font-medium mt-3 text-center">
          Material loop rating: <span className="text-primary-600 dark:text-primary-neon font-bold">{circularity.classification}</span>
        </p>
      </div>

      {/* Radar Metrics Grid */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid stroke="#475569" opacity={0.2} />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 600 }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 8 }} />
            <Radar
              name="Metrics"
              dataKey="value"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
