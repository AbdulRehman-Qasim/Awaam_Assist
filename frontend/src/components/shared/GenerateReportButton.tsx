import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2, Sparkles, Share2 } from 'lucide-react';
import { reportService } from '@/services/reportService';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { AIReportModal } from './AIReportModal';

interface GenerateReportButtonProps {
  module: 'healthcare' | 'education' | 'schemes';
  recommendations?: any[];
  insights?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
  disabled?: boolean;
}

export const GenerateReportButton: React.FC<GenerateReportButtonProps> = ({
  module,
  recommendations = [],
  insights = "",
  variant = 'default',
  size = 'default',
  className = '',
  showIcon = true,
  disabled = false
}) => {
  const [loadingState, setLoadingState] = useState<'idle' | 'analyzing' | 'generating' | 'done'>('idle');
  const [reportData, setReportData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const loadingMessages = [
    "Analyzing recommendation intelligence...",
    "Evaluating compatibility patterns...",
    "Generating personalized AI insights..."
  ];

  useEffect(() => {
    let interval: any;
    if (loadingState === 'analyzing' || loadingState === 'generating') {
      interval = setInterval(() => {
        setLoadingTextIndex(prev => (prev + 1) % loadingMessages.length);
      }, 2000);
    } else {
      setLoadingTextIndex(0);
    }
    return () => clearInterval(interval);
  }, [loadingState]);

  const handleGenerate = async () => {
    setLoadingState('analyzing');
    try {
      const response = await reportService.generateReport(module, recommendations, insights);
      if (response.success) {
        setReportData(response.data);
        setIsModalOpen(true);
        setLoadingState('idle'); // Reset for next time
      } else {
        toast.error('Failed to generate report');
        setLoadingState('idle');
      }
    } catch (error) {
      console.error('Report Error:', error);
      toast.error('An error occurred while generating the report');
      setLoadingState('idle');
    }
  };

  const getLoadingText = () => {
    if (loadingState !== 'idle') return loadingMessages[loadingTextIndex];
    return "";
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleGenerate}
        disabled={disabled || loadingState !== 'idle'}
        className={`relative overflow-hidden group transition-all active:scale-[0.98] ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <AnimatePresence mode="wait">
          {loadingState !== 'idle' ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>{getLoadingText()}</span>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              {showIcon && <Sparkles className="w-4 h-4 text-amber-500" />}
              <span>Generate AI Report</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Glossy overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </Button>

      <AIReportModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        reportData={reportData} 
        module={module} 
      />
    </>
  );
};
