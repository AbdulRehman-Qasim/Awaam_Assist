import React, { useEffect, useState } from 'react';
import { reportService, ReportRecord } from '@/services/reportService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Calendar, FileText, ChevronRight, Share2, Sparkles, History, HeartPulse, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

import { AIReportModal } from './AIReportModal';

export const ReportHistory: React.FC = () => {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const response = await reportService.getReportHistory();
      if (response.success) {
        setReports(response.data);
      }
    } catch (error) {
      console.error('History Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
          <History className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-slate-900 font-bold">No Reports Yet</h3>
        <p className="text-slate-500 text-sm max-w-[240px] mt-1">
          Generate your first AI-powered eligibility report to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.slice(0, 5).map((report, index) => {
        const config = {
          healthcare: { icon: HeartPulse, color: 'text-rose-500', bg: 'bg-rose-50', border: 'hover:border-rose-200' },
          education: { icon: GraduationCap, color: 'text-blue-500', bg: 'bg-blue-50', border: 'hover:border-blue-200' },
          schemes: { icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-50', border: 'hover:border-amber-200' }
        }[report.module];
        
        const Icon = config.icon;

        return (
          <motion.div
            key={report._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`group relative p-4 bg-slate-50/50 border border-slate-100 rounded-3xl transition-all duration-300 ${config.border} hover:bg-white hover:shadow-xl hover:shadow-slate-200/50`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl ${config.bg} flex items-center justify-center transition-transform group-hover:scale-110 duration-500`}>
                <Icon className={`w-7 h-7 ${config.color}`} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[13px] font-black text-slate-900 tracking-tight capitalize">
                      {report.module} Analysis Report
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(report.generatedAt), 'MMM dd, yyyy')}
                      </div>
                      <div className="w-1 h-1 rounded-full bg-slate-200" />
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest">
                        <Sparkles className="w-3 h-3" />
                        AI Verified
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-2xl bg-white shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300"
                    onClick={() => reportService.downloadReport(report.reportUrl)}
                  >
                    <Download className="w-4 h-4 text-slate-600" />
                  </Button>
                </div>
                
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1 h-9 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
                    onClick={() => {
                      setSelectedReport(report);
                      setIsModalOpen(true);
                    }}
                  >
                    View Insights
                    <ChevronRight className="ml-2 w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
      
      {reports.length > 5 && (
        <div className="pt-2 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            + {reports.length - 5} more reports in your history
          </p>
        </div>
      )}

      <AIReportModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        reportData={selectedReport} 
        module={selectedReport?.module || ''} 
      />
    </div>
  );
};
