import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Activity, Compass } from 'lucide-react';

export default function SustainabilityCard({ 
  title, 
  score, 
  subtitle, 
  colorClass = "text-primary-500 dark:text-primary-neon", 
  progressColor = "bg-primary-500 dark:bg-primary-neon",
  icon = "award"
}) {
  const icons = {
    award: <Award className="w-5 h-5" />,
    trending: <TrendingUp className="w-5 h-5" />,
    activity: <Activity className="w-5 h-5" />,
    compass: <Compass className="w-5 h-5" />
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-3xl p-6 relative overflow-hidden group hover:border-primary-400 dark:hover:border-primary-neon/40 transition-all duration-300 shadow-soft"
    >
      {/* Decorative backdrop glow */}
      <div className={`absolute -right-10 -top-10 w-24 h-24 rounded-full filter blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-300 ${progressColor}`} />

      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{title}</p>
          <h3 className={`text-3xl font-black tracking-tight leading-none ${colorClass}`}>
            {score}
          </h3>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">{subtitle}</p>
        </div>
        <div className={`p-3 bg-slate-50 dark:bg-cardDark/50 rounded-2xl ${colorClass} shadow-inner`}>
          {icons[icon] || icons.award}
        </div>
      </div>

      {/* Progress Bar */}
      {typeof score === 'number' && (
        <div className="mt-4 space-y-1">
          <div className="flex justify-between text-[9px] font-mono text-slate-400">
            <span>Progress Index</span>
            <span>{score.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${progressColor}`}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
