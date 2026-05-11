import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Sparkles, X, BrainCircuit, Trophy, MapPin, TrendingUp } from 'lucide-react';
import { reportService } from '@/services/reportService';
import { motion, AnimatePresence } from 'framer-motion';

interface AIReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: any;
  module: string;
}

const ScoreBadge = ({ score }: { score: number }) => {
  const color =
    score >= 90 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
    score >= 75 ? 'bg-blue-50 text-blue-700 border-blue-200' :
    score >= 60 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-rose-50 text-rose-700 border-rose-200';
  const label =
    score >= 90 ? 'Exceptional' :
    score >= 75 ? 'Strong Match' :
    score >= 60 ? 'Good Match' : 'Partial';

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${color}`}>
      <TrendingUp className="w-3 h-3" />
      {score}% · {label}
    </div>
  );
};

export const AIReportModal: React.FC<AIReportModalProps> = ({ isOpen, onClose, reportData, module }) => {
  if (!reportData) return null;

  const handleDownload = () => {
    if (reportData.reportUrl) {
      reportService.downloadReport(reportData.reportUrl);
    }
  };

  const moduleName = module.charAt(0).toUpperCase() + module.slice(1);
  const recs: any[] = reportData.reportSnapshot?.recommendations || [];
  const aiHtml: string = reportData.reportSnapshot?.aiHtmlContent || '';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[860px] w-[95vw] max-h-[92vh] overflow-hidden flex flex-col p-0 rounded-3xl border-none shadow-2xl">

        {/* ── Header ── */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-6 flex-shrink-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/15 rounded-full blur-[100px] pointer-events-none -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none translate-y-1/3 -translate-x-1/3" />
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner flex-shrink-0">
                <BrainCircuit className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  {moduleName} Intelligence Report
                </DialogTitle>
                <DialogDescription className="text-white/50 font-medium text-sm mt-1">
                  AI-analyzed · Data-synchronized · {recs.length} matches ranked
                </DialogDescription>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-3 py-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">Scores Synchronized</span>
                  </div>
                  {recs[0] && (
                    <div className="text-[10px] font-bold text-white/40">
                      Top Match: {recs[0].name} · {recs[0].score}%
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto bg-slate-50">

          {/* Quick-Glance Score Row */}
          {recs.length > 0 && (
            <div className="px-6 pt-5 pb-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recs.slice(0, 3).map((r, i) => {
                  const rankIcon = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
                  const barColor =
                    r.score >= 90 ? 'bg-emerald-500' :
                    r.score >= 75 ? 'bg-blue-500' :
                    r.score >= 60 ? 'bg-amber-500' : 'bg-rose-500';
                  return (
                    <motion.div
                      key={r.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-lg">{rankIcon}</div>
                        <ScoreBadge score={r.score} />
                      </div>
                      <div className="font-black text-slate-900 text-sm leading-tight truncate">{r.name}</div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold mt-0.5 mb-3">
                        <MapPin className="w-3 h-3" /> {r.location}
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(100, r.score)}%` }} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Analysis */}
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">AI Analysis</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 prose prose-slate max-w-none">
              {aiHtml ? (
                <div dangerouslySetInnerHTML={{ __html: aiHtml }} />
              ) : (
                <p className="text-slate-500 text-sm font-medium">No AI analysis available for this report.</p>
              )}
            </div>
          </div>

          {/* All Matches */}
          {recs.length > 3 && (
            <div className="px-6 pb-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center">
                  <Trophy className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">All Ranked Matches</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              <div className="space-y-2.5">
                {recs.slice(3).map((r, i) => (
                  <div key={r.name} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="text-sm font-black text-slate-400 flex-shrink-0">#{i + 4}</div>
                      <div className="min-w-0">
                        <div className="font-black text-slate-900 text-sm truncate">{r.name}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">{r.location}</div>
                      </div>
                    </div>
                    <ScoreBadge score={r.score} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="p-5 bg-white border-t border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Powered by Multi-Model AI Pipeline
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold text-sm">
              Close
            </Button>
            <Button onClick={handleDownload} className="rounded-xl font-black gap-2 h-10 px-5 shadow-md shadow-primary/20">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
};
