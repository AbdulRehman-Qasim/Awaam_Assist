import React from 'react';
import { GraduationCap, ShieldCheck, HeartPulse, ArrowRight, BrainCircuit } from "lucide-react";
import { Link } from "react-router-dom";
import { RecommendationCard } from "./RecommendationCard";
import { RecommendationEngineOutput } from "@/intelligence/engine/recommendationEngine";
import { ModuleSkeleton } from './SmartLoading';
import { Button } from "@/components/ui/button";

interface DashboardFeedProps {
  recommendations: RecommendationEngineOutput | null;
  loading: boolean;
  selectedModules: string[];
}

/* ─── Section Config ─── */
const SECTION_CONFIG = {
  education: {
    title: "University Matches",
    icon: GraduationCap,
    gradient: "from-blue-500 to-blue-700",
    iconBg: "bg-blue-600",
    accentBg: "bg-blue-50",
    accentText: "text-blue-700",
    seeAllHref: "/company/hero-section",
    empty: "No high-confidence university matches for your current profile.",
  },
  schemes: {
    title: "Eligible Schemes",
    icon: ShieldCheck,
    gradient: "from-emerald-500 to-emerald-700",
    iconBg: "bg-emerald-600",
    accentBg: "bg-emerald-50",
    accentText: "text-emerald-700",
    seeAllHref: "/company/schemes",
    empty: "No eligible government schemes found for your profile.",
  },
  healthcare: {
    title: "Health Facilities",
    icon: HeartPulse,
    gradient: "from-rose-500 to-rose-700",
    iconBg: "bg-rose-600",
    accentBg: "bg-rose-50",
    accentText: "text-rose-700",
    seeAllHref: "/company/healthcare",
    empty: "No healthcare facilities matching your category or location.",
  },
};

import { GenerateReportButton } from '../shared/GenerateReportButton';

/* ─── Section Header ─── */
const SectionHeader = ({ cfg, count, moduleKey, items, insights }: { 
  cfg: typeof SECTION_CONFIG[keyof typeof SECTION_CONFIG]; 
  count: number; 
  moduleKey: string;
  items: any[];
  insights?: string;
}) => {
  const Icon = cfg.icon;
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Icon with gradient background */}
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shadow-sm`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">{cfg.title}</h2>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {count} result{count !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Generate Report Button */}
        <GenerateReportButton 
          module={moduleKey as any} 
          recommendations={items}
          insights={insights}
          variant="outline" 
          size="sm" 
          className="h-8 rounded-xl text-[10px] font-black uppercase tracking-widest"
        />

        {/* See All link */}
        <Link
          to={cfg.seeAllHref}
          className={`inline-flex items-center gap-1.5 px-3 h-8 rounded-xl text-[10px] font-black uppercase tracking-widest ${cfg.accentBg} ${cfg.accentText} border border-current/10 hover:brightness-95 transition-all`}
        >
          See All
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};

/* ─── Empty State ─── */
const EmptyState = ({ icon: Icon, message, href }: { icon: any; message: string; href: string }) => (
  <div className="col-span-full py-14 px-6 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center gap-4">
    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-300">
      <Icon className="w-7 h-7" />
    </div>
    <div className="space-y-1">
      <p className="text-slate-800 font-black text-sm">Insufficient Data for Matching</p>
      <p className="text-slate-500 font-bold text-xs max-w-xs mx-auto">{message}</p>
    </div>
    <Link
      to="/complete-profile"
      className="inline-flex items-center gap-2 px-5 h-9 rounded-xl border border-slate-200 text-slate-600 font-black text-xs hover:bg-white hover:shadow-sm transition-all"
    >
      <BrainCircuit className="w-3.5 h-3.5 text-primary" />
      Optimize Recommendations
    </Link>
  </div>
);

export const DashboardFeed: React.FC<DashboardFeedProps> = ({
  recommendations, loading, selectedModules
}) => {

  const renderSection = (
    moduleKey: keyof typeof SECTION_CONFIG,
    items: any[]
  ) => {
    const cfg = SECTION_CONFIG[moduleKey];
    const Icon = cfg.icon;

    if (loading) return <ModuleSkeleton title={cfg.title} />;

    return (
      <section className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-700">
        <SectionHeader 
          cfg={cfg} 
          count={items.length} 
          moduleKey={moduleKey} 
          items={items}
          insights={recommendations?.insights?.map(i => i.message).join(' • ')} 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
          {items.map((rec, index) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              icon={<Icon />}
              index={index}
              onAction={() => {
                const url = rec.details.web || rec.details.url || rec.details.application?.website || rec.details.website;
                if (url) window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
              }}
            />
          ))}
          {items.length === 0 && (
            <EmptyState icon={Icon} message={cfg.empty} href={cfg.seeAllHref} />
          )}
        </div>
      </section>
    );
  };

  return (
    <div className="space-y-14">
      {selectedModules.includes('education') && renderSection('education', recommendations?.universities || [])}
      {selectedModules.includes('schemes')   && renderSection('schemes',   recommendations?.schemes     || [])}
      {selectedModules.includes('healthcare')&& renderSection('healthcare',recommendations?.hospitals   || [])}
    </div>
  );
};
