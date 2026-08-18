import React from 'react';

const CircularityGauge = ({ score }) => {
  const targetScore = typeof score === 'number' ? score : 0;
  
  // SVG circular path math
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  
  // Semicircle gauge (from -180deg to 0deg, or standard 3/4 circle)
  // Let's make a modern 280-degree gauge centered at the top.
  const angleRange = 280;
  const arcLength = (angleRange / 360) * circumference;
  const strokeDashoffset = arcLength - (targetScore / 100) * arcLength;
  const rotationAngle = 90 + (360 - angleRange) / 2;

  // Determine recovery category name and color
  let categoryName = "Disposal Recommended";
  let colorClass = "text-red-500 stroke-red-500";
  
  if (targetScore >= 85) {
    categoryName = "Excellent Recovery Potential";
    colorClass = "text-emerald-600 stroke-emerald-600";
  } else if (targetScore >= 70) {
    categoryName = "High Recovery Potential";
    colorClass = "text-teal-600 stroke-teal-600";
  } else if (targetScore >= 55) {
    categoryName = "Moderate Recovery Potential";
    colorClass = "text-amber-500 stroke-amber-500";
  } else if (targetScore >= 35) {
    categoryName = "Limited Recovery Potential";
    colorClass = "text-orange-500 stroke-orange-500";
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full transform" style={{ transform: `rotate(${rotationAngle}deg)` }} viewBox="0 0 160 160">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="fill-none stroke-slate-100"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - arcLength}
            strokeLinecap="round"
          />
          {/* Active progress */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className={`fill-none transition-all duration-1000 ease-out ${colorClass.split(' ')[1]}`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        {/* Center label text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black text-slate-800 tracking-tight">{targetScore}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">SCORE</span>
        </div>
      </div>
      <div className="text-center mt-3">
        <span className={`text-xs font-extrabold ${colorClass.split(' ')[0]} bg-slate-50 border border-slate-150 rounded-full px-3.5 py-1.5 shadow-sm inline-block`}>
          {categoryName}
        </span>
      </div>
    </div>
  );
};

export default CircularityGauge;
