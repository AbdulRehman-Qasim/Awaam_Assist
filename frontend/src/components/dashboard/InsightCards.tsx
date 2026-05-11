import React, { useEffect, useState } from 'react';
import {
  GraduationCap, ShieldCheck, HeartPulse, BrainCircuit,
  TrendingUp, LucideIcon
} from "lucide-react";
import { motion } from "framer-motion";

const AnimatedNumber = ({ value }: { value: string | number }) => {
  const isNumber = typeof value === 'number';
  const numericValue = isNumber ? value : parseFloat(value.toString());
  const hasPercentage = typeof value === 'string' && value.includes('%');

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    const duration = 1500;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - percentage, 4);
      setDisplayValue(numericValue * easeOut);

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(numericValue);
      }
    };

    requestAnimationFrame(animate);
  }, [numericValue]);

  if (isNaN(numericValue)) return <span>{value}</span>;

  const isFloat = numericValue % 1 !== 0;
  const formatted = isFloat ? displayValue.toFixed(1) : Math.round(displayValue);

  return <span>{formatted}{hasPercentage ? '%' : ''}</span>;
};

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
    initial={{ opacity: 0, y: 24, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    className="h-full"
  >
    <div className="group relative bg-white rounded-2xl border border-slate-100/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden h-full">
      {/* Gradient accent bar */}
      <div className={`absolute top-0 left-0 w-full h-[3px] ${gradient}`} />
      {/* Subtle background glow on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${iconBg} rounded-2xl`} style={{ opacity: 0 }} />
      <div className="relative p-5 flex flex-col h-full pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-11 h-11 rounded-xl ${iconBg} border border-white/60 shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all duration-300`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </div>
        </div>
        <div className="flex-grow space-y-1">
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">{title}</div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className={`text-[22px] font-black tracking-tight leading-none ${accentColor}`}>
              <AnimatedNumber value={count} />
            </span>
            <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
              <TrendingUp className="w-2.5 h-2.5" /> +Active
            </span>
          </div>
          <p className="text-[10px] font-semibold text-slate-400 leading-relaxed mt-2">{subtitle}</p>
        </div>
      </div>
    </div>
  </motion.div>
);

interface InsightCardsProps {
  metrics: { 
    universities: number; 
    schemes: number; 
    hospitals: number; 
    confidence: number;
    breakdown?: Record<string, number>;
  };
  selectedModules: string[];
}

export const InsightCards: React.FC<InsightCardsProps> = ({ metrics, selectedModules }) => {
  const hasModules = selectedModules.length > 0;
  
  const getIntelligenceLabel = (score: number) => {
    if (score >= 85) return "Excellent Match Intelligence";
    if (score >= 70) return "Good Match Intelligence";
    return "Moderate Match Intelligence";
  };

  const breakdownItems = [];
  if (metrics.breakdown?.education) breakdownItems.push(`Edu: ${metrics.breakdown.education}%`);
  if (metrics.breakdown?.schemes) breakdownItems.push(`Gov: ${metrics.breakdown.schemes}%`);
  if (metrics.breakdown?.healthcare) breakdownItems.push(`Hosp: ${metrics.breakdown.healthcare}%`);

  const breakdownText = breakdownItems.length > 0 
    ? `Based on: ${breakdownItems.join(' | ')}`
    : "Overall AI confidence score";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {selectedModules.includes('education') && (
        <InsightCard
          title="Universities"
          count={metrics.universities}
          subtitle="Matched by marks, city & discipline"
          icon={GraduationCap}
          gradient="bg-gradient-to-r from-blue-400 to-blue-600"
          iconBg="bg-blue-50/80"
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
          iconBg="bg-emerald-50/80"
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
          iconBg="bg-rose-50/80"
          iconColor="text-rose-600"
          accentColor="text-rose-700"
          delay={0.15}
        />
      )}
      {hasModules && (
        <InsightCard
          title="Match Accuracy"
          count={`${metrics.confidence}%`}
          subtitle={breakdownText}
          icon={BrainCircuit}
          gradient="bg-gradient-to-r from-violet-400 to-primary"
          iconBg="bg-violet-50/80"
          iconColor="text-violet-600"
          accentColor="text-primary"
          delay={0.2}
        />
      )}
    </div>
  );
};
