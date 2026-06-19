/**
 * HospitalCategoryRatings.tsx
 * Renders 6 AI-analyzed community rating categories as animated progress bars.
 * AUTO-POLLS every 25 seconds while scraping is in progress — no infinite loading.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Stethoscope, Sparkles, Clock, HandHeart, Building2, Banknote, MessageCircle, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { hospitalPublicAPI, HospitalReviewData, CategoryRatings } from '@/services/hospitalAPI';

// ── Category config ───────────────────────────────────────────────────────────

interface CategoryDef {
  key: keyof CategoryRatings;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  emoji: string;
}

const CATEGORIES: CategoryDef[] = [
  { key: 'doctorQuality',       label: 'Doctor Quality',  description: 'Expertise, bedside manner & diagnosis', icon: Stethoscope, emoji: '👨‍⚕️' },
  { key: 'cleanliness',         label: 'Cleanliness',     description: 'Hygiene, wards & sanitation',           icon: Sparkles,    emoji: '🧹'  },
  { key: 'waitTime',            label: 'Wait Time',       description: '10 = very fast · 0 = extremely slow',  icon: Clock,       emoji: '⏱️' },
  { key: 'staffBehavior',       label: 'Staff Behavior',  description: 'Nurses, reception & support staff',     icon: HandHeart,   emoji: '🤝'  },
  { key: 'facilitiesEquipment', label: 'Facilities',      description: 'Equipment, infrastructure & wards',     icon: Building2,   emoji: '🏥'  },
  { key: 'costValue',           label: 'Cost & Value',    description: '10 = very affordable & transparent',   icon: Banknote,    emoji: '💰'  },
];

const POLL_INTERVAL_MS = 25000; // poll every 25 s while scraping

// ── Color mapping ─────────────────────────────────────────────────────────────

function getRatingColor(val: number): { bar: string; text: string; bg: string; label: string } {
  if (val >= 8.5) return { bar: '#10b981', text: '#059669', bg: '#ecfdf5', label: 'Excellent'  };
  if (val >= 7)   return { bar: '#3b82f6', text: '#2563eb', bg: '#eff6ff', label: 'Good'       };
  if (val >= 5)   return { bar: '#f59e0b', text: '#d97706', bg: '#fffbeb', label: 'Average'    };
  if (val >= 3)   return { bar: '#f97316', text: '#ea580c', bg: '#fff7ed', label: 'Below Avg'  };
  return              { bar: '#ef4444', text: '#dc2626', bg: '#fef2f2', label: 'Poor'      };
}

// ── Single rating bar ─────────────────────────────────────────────────────────

const RatingBar: React.FC<{ category: CategoryDef; value: number | null; animate: boolean }> = ({
  category, value, animate,
}) => {
  const [width, setWidth] = useState(0);
  const Icon = category.icon;

  useEffect(() => {
    if (value === null || value === undefined) return;
    const t = setTimeout(() => setWidth((value / 10) * 100), 120);
    return () => clearTimeout(t);
  }, [value, animate]);

  const color = value !== null ? getRatingColor(value) : null;

  return (
    <div className="flex items-center gap-3 group">
      <div
        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm"
        style={{ background: color?.bg || '#f1f5f9' }}
      >
        <Icon className="w-4 h-4" style={{ color: color?.bar || '#94a3b8' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-slate-700 truncate">{category.label}</span>
          {value !== null ? (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-xs font-black" style={{ color: color?.text }}>{value.toFixed(1)}</span>
              <span className="text-[9px] font-semibold text-slate-400">/10</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: color?.bg, color: color?.text }}>
                {color?.label}
              </span>
            </div>
          ) : (
            <span className="text-[9px] text-slate-400 font-semibold">No data</span>
          )}
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: value !== null ? `${width}%` : '0%', background: color?.bar || 'transparent', opacity: value !== null ? 1 : 0 }}
          />
        </div>
        <p className="text-[9px] text-slate-400 mt-0.5 leading-tight opacity-0 group-hover:opacity-100 transition-opacity">
          {category.description}
        </p>
      </div>
    </div>
  );
};

// ── Loading skeleton ──────────────────────────────────────────────────────────

const SkeletonBar = () => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-lg bg-slate-100 animate-pulse flex-shrink-0" />
    <div className="flex-1">
      <div className="flex justify-between mb-1.5">
        <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
        <div className="h-3 w-12 bg-slate-100 rounded animate-pulse" />
      </div>
      <div className="h-2 bg-slate-100 rounded-full animate-pulse" />
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  hospitalId: string;
  compact?: boolean;
}

export const HospitalCategoryRatings: React.FC<Props> = ({ hospitalId, compact = false }) => {
  const [data,    setData]    = useState<HospitalReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [animate, setAnimate] = useState(false);
  const [pollCount, setPollCount] = useState(0);   // how many times we've polled
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const isDone = (d: HospitalReviewData | null) =>
    d?.status === 'analyzed' || d?.status === 'no_data' || d?.status === 'error';

  useEffect(() => {
    let cancelled = false;
    stopPolling();
    setLoading(true);
    setAnimate(false);
    setPollCount(0);

    const fetch = async () => {
      const result = await hospitalPublicAPI.getHospitalReviews(hospitalId);
      if (cancelled) return;
      setData(result);
      setLoading(false);

      if (isDone(result)) {
        setTimeout(() => !cancelled && setAnimate(true), 50);
        return;
      }

      // Still scraping — start polling
      pollRef.current = setInterval(async () => {
        if (cancelled) return;
        setPollCount((c) => c + 1);
        const updated = await hospitalPublicAPI.getHospitalReviews(hospitalId);
        if (cancelled) return;
        setData(updated);
        if (isDone(updated)) {
          stopPolling();
          setTimeout(() => !cancelled && setAnimate(true), 50);
        }
      }, POLL_INTERVAL_MS);
    };

    fetch();
    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [hospitalId]);

  // ── Loading skeleton (first fetch only) ───────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
        {!compact && (
          <div className="flex items-center gap-2 mb-4">
            <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />
            <span className="text-xs font-bold text-slate-500">Loading community reviews…</span>
          </div>
        )}
        {[...Array(6)].map((_, i) => <SkeletonBar key={i} />)}
      </div>
    );
  }

  // ── Scraping / pending — shows live polling countdown ─────────────────────
  if (!data || data.status === 'scraping' || data.status === 'pending') {
    return (
      <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-100 space-y-3">
        <div className="flex items-start gap-3">
          <Loader2 className="w-4 h-4 text-cyan-500 animate-spin flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-cyan-700">Gathering Community Reviews</p>
            <p className="text-[11px] text-cyan-600 mt-0.5">
              Searching Reddit for discussions about this hospital. This may take a few minutes.
            </p>
          </div>
        </div>
        {pollCount > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] text-cyan-500">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Checking for results… ({pollCount} {pollCount === 1 ? 'check' : 'checks'} so far)
          </div>
        )}
        {/* Greyed-out skeleton bars so the layout doesn't jump when data arrives */}
        <div className="space-y-2.5 opacity-30 pointer-events-none">
          {[...Array(6)].map((_, i) => <SkeletonBar key={i} />)}
        </div>
      </div>
    );
  }

  // ── No Reddit discussions found ────────────────────────────────────────────
  if (data.status === 'no_data' || data.totalMentions === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-slate-500">No Community Data Yet</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            No Reddit discussions found for this hospital. Ratings will appear once community discussions are discovered.
          </p>
        </div>
      </div>
    );
  }

  // ── Results ────────────────────────────────────────────────────────────────
  const { ratings, overallRating, summary, totalMentions } = data;
  const overallColor = getRatingColor(overallRating);

  return (
    <div className="space-y-3">
      {!compact && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center">
              <MessageCircle className="w-3.5 h-3.5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-700 uppercase tracking-wide">Community Ratings</p>
              <p className="text-[10px] text-slate-400">Reddit · {totalMentions} discussion{totalMentions !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex flex-col items-center px-3 py-1.5 rounded-xl" style={{ background: overallColor.bg }}>
            <span className="text-lg font-black leading-tight" style={{ color: overallColor.text }}>{overallRating.toFixed(1)}</span>
            <span className="text-[9px] font-bold" style={{ color: overallColor.text }}>/10 overall</span>
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        {CATEGORIES.map((cat) => (
          <RatingBar key={cat.key} category={cat} value={ratings?.[cat.key] ?? null} animate={animate} />
        ))}
      </div>

      {summary && !compact && (
        <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-cyan-50 border border-cyan-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Community Summary</p>
          <p className="text-xs text-slate-600 leading-relaxed italic">"{summary}"</p>
        </div>
      )}

      {!compact && (
        <p className="text-[9px] text-slate-300 text-center pt-1">
          Ratings auto-generated from Reddit community discussions · AI-analyzed
        </p>
      )}
    </div>
  );
};

export default HospitalCategoryRatings;
