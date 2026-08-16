import React from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, Legend, CartesianGrid 
} from 'recharts';

export default function ImpactChart({ co2Saved, waterSaved, energySaved }) {
  // Let's generate comparative reference parameters
  // Traditional manufacturing consumes:
  // - CO2: ~3.0x recycled
  // - Water: ~5.0x recycled
  // - Energy: ~2.0x recycled
  const data = [
    {
      name: 'Carbon (kg CO₂)',
      'Traditional Impact': Math.round(co2Saved * 3.0),
      'WeaveCycle Saved': Math.round(co2Saved),
    },
    {
      name: 'Water (kL x 10)',
      'Traditional Impact': Math.round((waterSaved / 100) * 5.0),
      'WeaveCycle Saved': Math.round(waterSaved / 100),
    },
    {
      name: 'Energy (kWh)',
      'Traditional Impact': Math.round(energySaved * 2.0),
      'WeaveCycle Saved': Math.round(energySaved),
    },
  ];

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
            axisLine={{ stroke: '#475569', opacity: 0.2 }}
          />
          <YAxis 
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            axisLine={{ stroke: '#475569', opacity: 0.2 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '16px',
              fontSize: '11px',
              color: '#f8fafc',
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
          />
          <Bar dataKey="Traditional Impact" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={28} />
          <Bar dataKey="WeaveCycle Saved" fill="#10b981" radius={[6, 6, 0, 0]} barSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
