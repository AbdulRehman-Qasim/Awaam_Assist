import React, { useState, useEffect } from 'react';
import { StarRating } from './StarRating';
import { FeedbackService } from '@/services/feedbackService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, CheckCircle2, Sparkles,
  Pencil, Lock, RotateCcw, Star,
} from 'lucide-react';
import { toast } from 'sonner';

interface ModuleFeedbackProps {
  moduleName: 'education' | 'schemes' | 'healthcare';
  className?: string;
}

type ViewState = 'loading' | 'form' | 'already_submitted' | 'editing' | 'success';

const MODULE_LABELS: Record<string, string> = {
  education: 'Education',
  schemes: 'Schemes',
  healthcare: 'Healthcare',
};

/** Small star display (read-only) */
const StarDisplay = ({ value }: { value: number }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`w-5 h-5 ${s <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
      />
    ))}
  </div>
);

export const ModuleFeedback: React.FC<ModuleFeedbackProps> = ({ moduleName, className = '' }) => {
  const [view, setView] = useState<ViewState>('loading');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [existingRating, setExistingRating] = useState(0);
  const [existingComment, setExistingComment] = useState('');
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Load existing rating on mount ──────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const myRatings = await FeedbackService.getMyRatings();
        if (cancelled) return;

        const existing = myRatings[moduleName];
        if (existing) {
          setExistingRating(existing.rating);
          setExistingComment(existing.comment);
          setSubmittedAt(existing.submittedAt);
          // Pre-fill the edit form too
          setRating(existing.rating);
          setComment(existing.comment);
          setView('already_submitted');
        } else {
          setView('form');
        }
      } catch {
        setView('form'); // fail open — show the form
      }
    })();
    return () => { cancelled = true; };
  }, [moduleName]);

  // ── Submit / Update handler ─────────────────────────────────────────────
  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating before submitting.');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await FeedbackService.submitModuleRating({ moduleName, rating, comment });
      setExistingRating(rating);
      setExistingComment(comment);
      setSubmittedAt(new Date().toISOString());

      if (view === 'editing') {
        toast.success('Your rating has been updated!');
        setView('already_submitted');
      } else {
        setView('success');
      }
    } catch {
      // error toast already shown by service
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = () => {
    setRating(existingRating);
    setComment(existingComment);
    setView('editing');
  };

  const cancelEditing = () => {
    setRating(existingRating);
    setComment(existingComment);
    setView('already_submitted');
  };

  // ── Shared form JSX ────────────────────────────────────────────────────
  const renderForm = (isEdit = false) => (
    <motion.div
      key="form"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="relative z-10 space-y-6"
    >
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
          <MessageSquare className="w-4 h-4" />
          {isEdit ? 'Update Your Feedback' : 'Your Feedback'}
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">
          {isEdit ? 'Edit Your Rating' : 'Rate Your Experience'}
        </h3>
        <p className="text-sm text-slate-500 font-medium">
          {isEdit
            ? `Update your rating for the ${MODULE_LABELS[moduleName]} module.`
            : `Tell us how we can improve the ${MODULE_LABELS[moduleName]} experience for you.`}
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <div className="space-y-3">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Rating</div>
          <StarRating value={rating} onChange={setRating} size={32} />
        </div>

        <div className="space-y-3">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Message (Optional)</div>
          <Textarea
            placeholder="Tell us how we can improve..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="rounded-2xl border-slate-100 bg-slate-50/50 min-h-[90px] font-bold focus-visible:ring-primary"
          />
        </div>

        <div className="flex gap-3">
          {isEdit && (
            <Button
              variant="outline"
              onClick={cancelEditing}
              className="h-12 rounded-2xl font-black border-slate-200 hover:bg-slate-50 flex-shrink-0"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="flex-1 h-12 rounded-2xl font-black gap-2 bg-slate-900 shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-all"
          >
            {isSubmitting ? (
              'Submitting...'
            ) : (
              <>
                {isEdit ? 'Update Rating' : 'Submit Feedback'}
                <Send className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm p-8 ${className}`}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <AnimatePresence mode="wait">

        {/* ── Loading skeleton ── */}
        {view === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 space-y-4 animate-pulse"
          >
            <div className="h-4 w-24 bg-slate-100 rounded-full" />
            <div className="h-7 w-48 bg-slate-100 rounded-full" />
            <div className="flex gap-2 mt-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-8 h-8 bg-slate-100 rounded-full" />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Fresh form ── */}
        {view === 'form' && renderForm(false)}

        {/* ── Edit mode ── */}
        {view === 'editing' && renderForm(true)}

        {/* ── Already submitted — locked state with edit option ── */}
        {view === 'already_submitted' && (
          <motion.div
            key="already_submitted"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="relative z-10 space-y-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest">
                  <CheckCircle2 className="w-4 h-4" />
                  Rating Recorded
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {MODULE_LABELS[moduleName]} Feedback
                </h3>
                {submittedAt && (
                  <p className="text-xs text-slate-400 font-semibold">
                    Submitted {new Date(submittedAt).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
            </div>

            {/* Existing rating display */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Your Rating</div>
              <StarDisplay value={existingRating} />
              {existingComment && (
                <p className="text-sm text-slate-600 font-medium italic leading-relaxed pt-1">
                  "{existingComment}"
                </p>
              )}
            </div>

            {/* Info notice */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
              <Lock className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-600 font-semibold leading-relaxed">
                You've already submitted feedback for the <strong>{MODULE_LABELS[moduleName]}</strong> module.
                You can update your rating, but only one submission is allowed per module.
              </p>
            </div>

            {/* Edit button */}
            <Button
              variant="outline"
              onClick={startEditing}
              className="w-full h-11 rounded-2xl font-black border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all gap-2"
            >
              <Pencil className="w-4 h-4" />
              Update My Rating
            </Button>
          </motion.div>
        )}

        {/* ── Fresh submission success ── */}
        {view === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-10 text-center space-y-4"
          >
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Feedback Received!</h3>
              <p className="text-sm text-slate-500 font-bold max-w-xs mx-auto">
                Thank you for helping us make AwamAssist better. Your input has been synchronized with our engine.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/10 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">AI Profile Updated</span>
            </div>
            <Button
              variant="ghost"
              onClick={() => setView('already_submitted')}
              className="text-xs font-black text-slate-400 hover:text-slate-600 mt-2"
            >
              View My Submission
            </Button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
