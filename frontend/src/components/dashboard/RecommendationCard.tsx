import React, { useState } from 'react';
import {
  Sparkles, CheckCircle2, ArrowUpRight, Trophy,
  ChevronDown, ChevronUp, BrainCircuit, MapPin,
  Star, X, Ban, Zap, Medal, ThumbsUp, ThumbsDown, Check
} from "lucide-react";
import { FeedbackService } from "@/services/feedbackService";
import { EngagementManager } from "@/intelligence/engagement/engagementManager";
import { toast } from "sonner";
import { RecommendationResult } from "@/intelligence/types";
import { motion, AnimatePresence } from "framer-motion";
import { SmartBadge } from "./SmartBadge";

interface RecommendationCardProps {
  recommendation: RecommendationResult;
  icon: React.ReactNode;
  index?: number;
  onAction?: () => void;
}

/* ─── Match % Ring (SVG arc) ─── */
const MatchRing = ({ pct, color }: { pct: number; color: string }) => {
  const r = 22, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#f1f5f9" strokeWidth="4" />
        <motion.circle
          cx="28" cy="28" r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          whileInView={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          viewport={{ once: true }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px] font-black text-slate-900 leading-none">{pct}%</span>
        <span className="text-[7px] font-black text-slate-400 uppercase tracking-wider leading-none mt-0.5">Match</span>
      </div>
    </div>
  );
};

/* ─── Priority Label ─── */
const getPriorityConfig = (priorityLevel: string, relevanceLevel: string, dynamicLabel?: string) => {
  if (dynamicLabel) return { label: dynamicLabel, bg: 'bg-indigo-600', text: 'text-white', dot: 'bg-indigo-300' };
  if (priorityLevel === 'Local')   return { label: 'Top Priority',  bg: 'bg-blue-600', text: 'text-white', dot: 'bg-blue-300' };
  if (priorityLevel === 'Nearby')  return { label: 'Regional',      bg: 'bg-violet-600', text: 'text-white', dot: 'bg-violet-300' };
  if (relevanceLevel === 'High')   return { label: 'High Match',    bg: 'bg-emerald-600', text: 'text-white', dot: 'bg-emerald-300' };
  if (relevanceLevel === 'Medium') return { label: 'Medium Match',  bg: 'bg-amber-500', text: 'text-white', dot: 'bg-amber-200' };
  return                                  { label: 'Match Found',   bg: 'bg-slate-700', text: 'text-white', dot: 'bg-slate-400' };
};

const getRingColor = (pct: number) => {
  if (pct >= 85) return '#10b981'; // emerald
  if (pct >= 60) return '#f59e0b'; // amber
  return '#94a3b8'; // slate
};

const getGradientBar = (pct: number) => {
  if (pct >= 85) return 'from-emerald-400 to-teal-500';
  if (pct >= 60) return 'from-amber-400 to-orange-500';
  return 'from-slate-300 to-slate-400';
};

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation, icon, index, onAction
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(
    EngagementManager.getProfile().savedItems.includes(recommendation.id)
  );
  const [isHidden, setIsHidden] = useState(false);
  const [feedback, setFeedback] = useState<'helpful' | 'not_relevant' | null>(null);

  const {
    id         = '',
    type       = 'university',
    matchPercentage = 0,
    relevanceLevel  = 'Low',
    reasons    = [],
    tags       = [],
    title      = 'Untitled',
    explanation = '',
    priorityLevel  = 'National',
    details    = {}
  } = recommendation || {};

  const city    = details.city || details.City || details.location || "";
  const dynamicLabel = tags && tags.length > 0 ? tags[0] : undefined;
  const priority = getPriorityConfig(priorityLevel, relevanceLevel, dynamicLabel);
  const ringColor = getRingColor(matchPercentage);

  // We already used tags[0] for the priority pill, so don't show it twice
  const displayTags = tags.slice(1);

  if (isHidden) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      viewport={{ once: true }}
      className="self-start h-full"
    >
      <div className="group relative bg-white/80 backdrop-blur-md rounded-[1.5rem] border border-slate-100/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">

        {/* ── Top gradient accent bar ── */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${getGradientBar(matchPercentage)} opacity-90`} />

        {/* ── Priority + Rank row ── */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <div className="flex items-center gap-2">
            {/* Priority pill */}
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${priority.bg} ${priority.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priority.dot} animate-pulse`} />
              {priority.label}
            </div>
            {/* Rank badge */}
            {index !== undefined && (
              <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                <Medal className="w-2.5 h-2.5" /> #{index + 1}
              </div>
            )}
          </div>

          {/* Engagement actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={e => {
                e.stopPropagation();
                const next = !isSaved;
                setIsSaved(next);
                EngagementManager.recordInteraction(id, next ? 'save' : 'unsave', type);
                toast.success(next ? "Saved to preferences" : "Removed from saves", {
                  description: "This improves your future recommendations.",
                  duration: 2000,
                });
              }}
              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                isSaved ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-300 hover:bg-amber-50 hover:text-amber-500'
              }`}
              title="Save"
            >
              <Star className={`w-3 h-3 ${isSaved ? 'fill-amber-600' : ''}`} />
            </button>
            <button
              onClick={e => {
                e.stopPropagation();
                EngagementManager.recordInteraction(id, 'hide', type);
                setIsHidden(true);
                toast.info("Item hidden", { description: "We'll show fewer like this.", duration: 2000 });
              }}
              className="w-6 h-6 rounded-lg flex items-center justify-center bg-slate-50 text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all"
              title="Hide"
            >
              <X className="w-3 h-3" />
            </button>
            <button
              onClick={e => {
                e.stopPropagation();
                EngagementManager.recordInteraction(id, 'not-interested', type);
                setIsHidden(true);
                toast.warning("Category muted", { description: "Reducing weight for this category.", duration: 2000 });
              }}
              className="w-6 h-6 rounded-lg flex items-center justify-center bg-slate-50 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
              title="Not interested"
            >
              <Ban className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* ── Title row: icon + name + ring ── */}
        <div className="flex items-start gap-4 px-5 pt-4 pb-3">
          {/* Module icon */}
          <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/10 transition-colors flex-shrink-0 mt-0.5">
            {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
          </div>

          {/* Name + location + tags */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <h3 className="text-sm font-black text-slate-900 leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {title}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5">
              {city && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg">
                  <MapPin className="w-3 h-3 text-primary" />
                  {city}
                </div>
              )}
              {displayTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {displayTags.map((tag: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100/50 text-slate-600 text-[9px] font-bold tracking-wide uppercase border border-slate-200/50">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Match ring */}
          <MatchRing pct={matchPercentage} color={ringColor} />
        </div>

        {/* ── Programs List (if university has nested programs) ── */}
        {details.programs && details.programs.length > 0 && type === 'university' && (
          <div className="px-5 pb-3">
            <div className="flex flex-col gap-1.5 mt-1 border-t border-slate-100 pt-3">
              {details.programs.slice(0, 3).map((prog: any, i: number) => (
                <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-100/60 rounded-lg p-2 transition-colors hover:border-slate-200">
                  <div className="flex flex-col min-w-0 pr-3">
                    <span className="text-[11px] font-black text-slate-800 leading-tight truncate">
                      {prog.discipline}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">
                      {prog.degree}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-right flex-shrink-0">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-primary leading-none">{prog.programScore}%</span>
                      <span className="text-[8px] font-bold text-slate-400">Merit {prog.merit}%</span>
                    </div>
                    {prog.fee > 0 || prog.semesterFee > 0 ? (
                      <div className="flex flex-col items-end border-l border-slate-200 pl-3">
                        <span className="text-[10px] font-black text-slate-700 leading-none">Rs. {(prog.fee || prog.semesterFee).toLocaleString()}</span>
                        <span className="text-[8px] font-bold text-slate-400">{prog.fee ? 'Annual' : 'Semester'}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
              {details.programs.length > 3 && (
                <div className="text-center mt-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    + {details.programs.length - 3} more programs available
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Divider ── */}
        <div className="mx-5 border-t border-slate-50" />

        <div className="px-5 py-4 flex-1 flex flex-col gap-4">
          {/* AI Explanation */}
          {explanation && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gradient-to-br from-slate-50 to-slate-50/30 border border-slate-100">
              <BrainCircuit className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-slate-600 font-bold leading-relaxed italic line-clamp-2 group-hover:line-clamp-none transition-all">
                {explanation}
              </p>
            </div>
          )}

          {/* Why this matched — expandable */}
          <div>
            <button
              onClick={e => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
              className="flex items-center justify-between w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"
            >
              Why this matched
              {isExpanded
                ? <ChevronUp className="w-3.5 h-3.5" />
                : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-1.5 overflow-hidden mt-2"
                >
                  {reasons.map((reason, i) => (
                    <div key={i} className="flex items-start gap-2.5 py-1.5 px-3 rounded-xl bg-emerald-50/50 border border-emerald-100/60">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-[11px] text-slate-600 font-bold leading-tight">{reason}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Recommendation Feedback ── */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (feedback === 'helpful') return;
                setFeedback('helpful');
                try {
                  await FeedbackService.submitRecommendationFeedback({
                    recommendationId: id,
                    moduleType: type as any,
                    reaction: 'helpful',
                    metadata: { matchPercentage, priorityLevel }
                  });
                } catch {}
              }}
              className={`flex-1 h-9 rounded-xl border flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                feedback === 'helpful' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                  : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500 hover:border-emerald-100'
              }`}
            >
              {feedback === 'helpful' ? <Check className="w-3 h-3" /> : <ThumbsUp className="w-3 h-3" />}
              Helpful
            </button>
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (feedback === 'not_relevant') return;
                setFeedback('not_relevant');
                try {
                  await FeedbackService.submitRecommendationFeedback({
                    recommendationId: id,
                    moduleType: type as any,
                    reaction: 'not_relevant',
                    metadata: { matchPercentage, priorityLevel }
                  });
                } catch {}
              }}
              className={`flex-1 h-9 rounded-xl border flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                feedback === 'not_relevant' 
                  ? 'bg-rose-50 border-rose-200 text-rose-600' 
                  : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100'
              }`}
            >
              {feedback === 'not_relevant' ? <X className="w-3 h-3" /> : <ThumbsDown className="w-3 h-3" />}
              Not Relevant
            </button>
          </div>

          {/* View Details CTA */}
          <button
            onClick={onAction}
            className="w-full h-11 mt-1 rounded-xl text-white font-black text-[11px] uppercase tracking-[0.1em] flex items-center justify-center gap-2.5 group/btn transition-all duration-300 active:scale-[0.98] hover:shadow-xl"
            style={{
              background: matchPercentage >= 85
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : matchPercentage >= 60
                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                : 'linear-gradient(135deg, #1e293b, #334155)',
              boxShadow: matchPercentage >= 85
                ? '0 4px 14px rgba(16,185,129,0.30)'
                : matchPercentage >= 60
                ? '0 4px 14px rgba(245,158,11,0.30)'
                : '0 4px 14px rgba(15,23,42,0.20)',
            }}
          >
            <span>View Details</span>
            <div className="bg-white/20 rounded-md p-0.5 group-hover/btn:bg-white/30 transition-all duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
