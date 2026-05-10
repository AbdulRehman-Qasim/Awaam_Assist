import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2, Sparkles, Share2 } from 'lucide-react';
import { reportService } from '@/services/reportService';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface GenerateReportButtonProps {
  module: 'healthcare' | 'education' | 'schemes';
  recommendations?: any[];
  insights?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
}

export const GenerateReportButton: React.FC<GenerateReportButtonProps> = ({
  module,
  recommendations = [],
  insights = "",
  variant = 'default',
  size = 'default',
  className = '',
  showIcon = true
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await reportService.generateReport(module, recommendations, insights);
      if (response.success) {
        toast.success('AI Report generated successfully!');
        // Automatically open the report
        reportService.downloadReport(response.data.reportUrl);
      } else {
        toast.error('Failed to generate report');
      }
    } catch (error) {
      console.error('Report Error:', error);
      toast.error('An error occurred while generating the report');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleGenerate}
      disabled={isGenerating}
      className={`relative overflow-hidden group transition-all active:scale-[0.98] ${className}`}
    >
      <AnimatePresence mode="wait">
        {isGenerating ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Analyzing Data...</span>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2"
          >
            {showIcon && <Sparkles className="w-4 h-4 text-amber-400" />}
            <span>Generate AI Report</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Glossy overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    </Button>
  );
};
