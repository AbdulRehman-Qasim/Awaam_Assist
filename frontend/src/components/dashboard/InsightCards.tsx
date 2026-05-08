import React from 'react';
import {
  GraduationCap, ShieldCheck, HeartPulse, BrainCircuit,
  TrendingUp, ArrowUpRight, LucideIcon, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

interface InsightCardProps {
  title: string;
  count: any;
  subtitle: string;
  icon: LucideIcon;
  gradient: string;
  iconColor: string;
  iconBg: string;
  accentColor: string;
  delay?: number;
}

const InsightCard: React.FC<InsightCardProps> = ({
  title, count, subtitle, icon: Icon, gradient, iconColor, iconBg, accentColor, delay = 0
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, ease: "easeOut" }}
    className="h-full"
  >
    <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden h-full">
      {/* Top accent bar */}
      <div className={`h-1 w-full ${gradient}`} />

      <div className="p-5 flex flex-col h-full">
        {/* Icon + badge row */}
        <div className="flex items-center justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center group-hover:scale-105 transition-transform`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          {Number(count) > 0 || count === '0%' ? null : (
            <div className="flex items-center gap-1 text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </div>
          )}
        </div>

        {/* Count */}
        <div className="space-y-1 flex-grow">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-black tracking-tight ${accentColor}`}>{count}</span>
            {(typeof count === 'number' ? count > 0 : true) && (
              <span className="text-[9px] font-black text-emerald-500 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> Ready
              </span>
            )}
          </div>
          <p className="text-[10px] font-bold text-slate-400 leading-tight">{subtitle}</p>
        </div>
      </div>
    </div>
  </motion.div>
);

interface InsightCardsProps {
  metrics: { universities: number; schemes: number; hospitals: number; confidence: number; };
  selectedModules: string[];
}

export const InsightCards: React.FC<InsightCardsProps> = ({ metrics, selectedModules }) => {
  const hasModules = selectedModules.length > 0;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {selectedModules.includes('education') && (
        <InsightCard
          title="Universities"
          count={metrics.universities}
          subtitle="Matched by marks, city & discipline"
          icon={GraduationCap}
          gradient="bg-gradient-to-r from-blue-400 to-blue-600"
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          accentColor="text-blue-700"
          delay={0.05}
        />
      )}
      {selectedModules.includes('schemes') && (
        <InsightCard
          title="Gov Schemes"
          count={metrics.schemes}
          subtitle="Eligible government benefits for you"
          icon={ShieldCheck}
          gradient="bg-gradient-to-r from-emerald-400 to-emerald-600"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          accentColor="text-emerald-700"
          delay={0.1}
        />
      )}
      {selectedModules.includes('healthcare') && (
        <InsightCard
          title="Hospitals"
          count={metrics.hospitals}
          subtitle="Nearby facilities ranked for you"
          icon={HeartPulse}
          gradient="bg-gradient-to-r from-rose-400 to-rose-600"
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
          accentColor="text-rose-700"
          delay={0.15}
        />
      )}
      {hasModules && (
        <InsightCard
          title="Match Accuracy"
          count={`${metrics.confidence}%`}
          subtitle="Overall AI confidence score"
          icon={BrainCircuit}
          gradient="bg-gradient-to-r from-violet-400 to-primary"
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          accentColor="text-primary"
          delay={0.2}
        />
      )}
    </div>
  );
};
