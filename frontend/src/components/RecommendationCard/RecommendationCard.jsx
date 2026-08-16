import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, ShieldCheck, Cpu, Briefcase, ChevronDown, ChevronUp, Star,
  CircleDollarSign, Clock, Leaf, Play
} from 'lucide-react';

const PRIORITY_BADGES = {
  Critical: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 shadow-red-500/10',
  High: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 shadow-orange-500/10',
  Medium: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-blue-500/10',
  Low: 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20',
};

const DIFFICULTY_BADGES = {
  Easy: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  Medium: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  Hard: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
};

export default function RecommendationCard({ recommendation, index }) {
  const [expanded, setExpanded] = useState(false);

  const method = recommendation.method || recommendation.recovery_method || 'General Recovery';
  const priority = recommendation.priority || recommendation.recovery_priority || 'Medium';
  const difficulty = recommendation.difficulty || recommendation.difficulty_level || 'Medium';
  const success_rate = recommendation.success_rate || (recommendation.estimated_success != null ? `${recommendation.estimated_success.toFixed(0)}%` : '75%');
  const reason = recommendation.reason || 'Chosen based on material composition and condition parameters.';
  const required_processing = recommendation.processing_description || recommendation.required_processing || 'General circular reclamation processing.';
  const industry_application = recommendation.industry_application || recommendation.industry_applications || recommendation.industry_use_cases || 'Utility markets';
  const expected_output = recommendation.expected_output_material || recommendation.expected_output || 'Secondary raw material';
  const environmental_benefit = recommendation.environmental_benefit || 'Reduces landfill waste and virgin material processing carbon footprint.';
  const estimated_cost = recommendation.estimated_cost || recommendation.cost_estimate || 'Low';
  const estimated_time = recommendation.estimated_time || recommendation.time_estimate || '2–4 Days';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="glass-card rounded-3xl overflow-hidden hover:border-primary-400 dark:hover:border-primary-neon/30 transition-all duration-300 shadow-soft"
    >
      <div 
        onClick={() => setExpanded(!expanded)}
        className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-cardDark/30 transition-colors"
      >
        <div className="flex items-center space-x-4">
          {/* Circular Indicator Dial */}
          <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl bg-primary-50 dark:bg-emerald-950/20 text-primary-800 dark:text-primary-neon border border-borderLight dark:border-borderDark shadow-inner">
            <Wrench size={18} />
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white">{method}</h4>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${PRIORITY_BADGES[priority] || PRIORITY_BADGES.Medium}`}>
                {priority} Priority
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${DIFFICULTY_BADGES[difficulty] || DIFFICULTY_BADGES.Medium}`}>
                {difficulty} Difficulty
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-right hidden sm:block">
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Success rate</p>
            <p className="text-xs font-black text-primary-600 dark:text-primary-neon">{success_rate}</p>
          </div>
          <div className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-borderLight dark:border-borderDark bg-slate-50/50 dark:bg-bgDark/20 overflow-hidden"
          >
            <div className="p-5 space-y-4 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
              
              {/* Reason */}
              <div className="space-y-1.5">
                <p className="font-bold text-slate-700 dark:text-white flex items-center space-x-1.5">
                  <Star size={12} className="text-primary-500 animate-pulse" />
                  <span>Reason for Strategy:</span>
                </p>
                <p className="pl-4">{reason}</p>
              </div>

              {/* Detailed Processing */}
              <div className="space-y-1.5">
                <p className="font-bold text-slate-700 dark:text-white flex items-center space-x-1.5">
                  <Cpu size={12} className="text-primary-500" />
                  <span>Required Processing Steps:</span>
                </p>
                <p className="pl-4">{required_processing}</p>
              </div>

              {/* Industry Use cases */}
              <div className="space-y-1.5">
                <p className="font-bold text-slate-700 dark:text-white flex items-center space-x-1.5">
                  <Briefcase size={12} className="text-accent-cyan" />
                  <span>Industry Application:</span>
                </p>
                <p className="pl-4">{industry_application}</p>
              </div>

              {/* Output Yield */}
              <div className="space-y-1.5">
                <p className="font-bold text-slate-700 dark:text-white flex items-center space-x-1.5">
                  <ShieldCheck size={12} className="text-primary-neon" />
                  <span>Expected Output Material:</span>
                </p>
                <p className="pl-4 font-mono text-primary-600 dark:text-primary-neon">{expected_output}</p>
              </div>

              {/* Environmental Benefit */}
              <div className="space-y-1.5">
                <p className="font-bold text-slate-700 dark:text-white flex items-center space-x-1.5">
                  <Leaf size={12} className="text-emerald-500" />
                  <span>Environmental Benefit:</span>
                </p>
                <p className="pl-4 text-emerald-600 dark:text-emerald-400 font-semibold">{environmental_benefit}</p>
              </div>

              {/* Cost & Time Metrics Row */}
              <div className="grid grid-cols-2 gap-4 border-t border-borderLight dark:border-borderDark pt-4">
                <div className="flex items-center space-x-2">
                  <CircleDollarSign size={14} className="text-yellow-500" />
                  <div>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Estimated Cost</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{estimated_cost}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock size={14} className="text-blue-500" />
                  <div>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Estimated Time</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{estimated_time}</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-2 border-t border-borderLight dark:border-borderDark mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(`Initiating recovery workflow for: ${method}`);
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-primary-800 dark:bg-emerald-950 hover:bg-primary-900 dark:hover:bg-emerald-900 text-white dark:text-primary-neon font-bold text-[10px] rounded-xl transition-all duration-200 hover-scale shadow-neon"
                >
                  <Play size={10} fill="currentColor" className="text-primary-neon" />
                  <span>Execute Strategy</span>
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
