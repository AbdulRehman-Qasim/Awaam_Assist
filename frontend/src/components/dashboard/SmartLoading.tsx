import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, Search, Database, Cpu } from 'lucide-react';

const LOADING_MESSAGES = [
  "Analyzing your academic profile...",
  "Matching universities in your city...",
  "Checking government scheme eligibility...",
  "Scanning regional healthcare facilities...",
  "Building personalized career paths...",
  "Optimizing results based on your marks...",
  "Identifying local opportunities...",
  "Finalizing your intelligence dashboard..."
];

export const SmartLoading: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700">
      {/* AI Status Header */}
      <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
          <div className="relative bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <Bot className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-bounce" />
          </div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1 -right-1"
          >
            <Sparkles className="w-5 h-5 text-amber-500" />
          </motion.div>
        </div>
        
        <div className="h-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-lg font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            >
              {LOADING_MESSAGES[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
          Our Intelligence Engine is processing real-time data to find the best matches for you.
        </p>
      </div>

      {/* Skeleton Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
            
            <div className="flex justify-between items-start">
              <div className="h-6 w-24 bg-slate-100 dark:bg-slate-800 rounded-full" />
              <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            </div>
            
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-lg" />
              <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-800 rounded-lg" />
            </div>
            
            <div className="flex gap-2 py-2">
              <div className="h-6 w-16 bg-slate-100 dark:bg-slate-800 rounded-full" />
              <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded-full" />
            </div>
            
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="h-10 w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ModuleSkeleton: React.FC<{ title: string }> = ({ title }) => (
  <div className="space-y-4 animate-in fade-in duration-500">
    <div className="flex justify-between items-center">
      <div className="h-8 w-48 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
      <div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded-full" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-64 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-50/50 dark:via-white/5 to-transparent -translate-x-full animate-shimmer" />
        </div>
      ))}
    </div>
  </div>
);
