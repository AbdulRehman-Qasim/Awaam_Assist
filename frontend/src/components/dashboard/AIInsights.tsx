import React from 'react';
import { motion } from "framer-motion";
import { BrainCircuit, Info, Lightbulb, Zap, ChevronRight } from "lucide-react";

interface AIInsight {
  type: 'academic' | 'financial' | 'location' | 'profile';
  message: string;
  action?: { label: string; link: string };
}

interface AIInsightsProps {
  insights: AIInsight[];
}

const TYPE_CONFIG = {
  academic:  { icon: Lightbulb, bg: 'bg-blue-50/50',   text: 'text-blue-600',   badge: 'text-blue-700 bg-blue-50',   label: 'Academic'  },
  financial: { icon: Zap,       bg: 'bg-emerald-50/50', text: 'text-emerald-600', badge: 'text-emerald-700 bg-emerald-50', label: 'Financial' },
  location:  { icon: Info,      bg: 'bg-rose-50/50',    text: 'text-rose-600',   badge: 'text-rose-700 bg-rose-50',   label: 'Location'  },
  profile:   { icon: BrainCircuit, bg: 'bg-violet-50/50', text: 'text-violet-600', badge: 'text-violet-700 bg-violet-50', label: 'Profile' },
};

export const AIInsights: React.FC<AIInsightsProps> = ({ insights }) => {
  if (!insights.length) return null;

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar -mx-1 px-1">
      {insights.map((insight, i) => {
        const cfg = TYPE_CONFIG[insight.type] || TYPE_CONFIG.profile;
        const Icon = cfg.icon;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, ease: "easeOut" }}
            className="flex-shrink-0 w-[280px]"
          >
            <div className={`rounded-2xl p-4 transition-all duration-300 h-full group ${cfg.bg} hover:bg-white hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] border border-transparent hover:border-slate-100/60`}>
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-3.5 h-3.5 ${cfg.text}`} />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-md ${cfg.badge}`}>
                  {cfg.label}
                </span>
              </div>

              {/* Message */}
              <p className="text-[11px] font-bold text-slate-600 leading-relaxed mt-2.5 mb-3 line-clamp-3">
                {insight.message}
              </p>

              {/* Action */}
              {insight.action && (
                <a
                  href={insight.action.link}
                  className={`inline-flex items-center gap-1 text-[10px] font-black ${cfg.text} group/link`}
                >
                  {insight.action.label}
                  <ChevronRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                </a>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
