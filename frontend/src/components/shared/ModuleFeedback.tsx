import React, { useState } from 'react';
import { StarRating } from './StarRating';
import { FeedbackService } from '@/services/feedbackService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface ModuleFeedbackProps {
  moduleName: 'education' | 'schemes' | 'healthcare';
  className?: string;
}

export const ModuleFeedback: React.FC<ModuleFeedbackProps> = ({ moduleName, className = "" }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      await FeedbackService.submitModuleRating({
        moduleName,
        rating,
        comment
      });
      setSubmitted(true);
      toast.success("Thank you for your feedback!");
    } catch (error) {
      // Error handled in service
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm p-8 ${className}`}>
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative z-10 space-y-6"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
                <MessageSquare className="w-4 h-4" />
                Your Feedback
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Rate Your Experience
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                Tell us how we can improve the {moduleName} experience for you.
              </p>
            </div>

            <div className="flex flex-col gap-6">
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
                  className="rounded-2xl border-slate-100 bg-slate-50/50 min-h-[100px] font-bold focus-visible:ring-primary"
                />
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || rating === 0}
                className="w-full h-12 rounded-2xl font-black gap-2 bg-slate-900 shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-all"
              >
                {isSubmitting ? "Submitting..." : (
                  <>
                    Submit Feedback
                    <Send className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        ) : (
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
