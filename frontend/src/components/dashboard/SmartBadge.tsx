import React from 'react';
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  MapPin, 
  Trophy, 
  ShieldCheck, 
  HeartPulse, 
  Coins,
  CheckCircle2,
  TrendingUp,
  Award
} from "lucide-react";

interface SmartBadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'premium';
}

export const SmartBadge: React.FC<SmartBadgeProps> = ({ label, variant = 'default' }) => {
  const getStyle = () => {
    switch (label.toLowerCase()) {
      case 'near you':
      case 'local':
        return { color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: <MapPin className="w-3 h-3" /> };
      case 'merit compatible':
      case 'top match':
        return { color: 'text-blue-600 bg-blue-50 border-blue-100', icon: <Trophy className="w-3 h-3" /> };
      case 'federal':
      case 'govt funded':
      case 'govt supported':
        return { color: 'text-primary bg-primary/5 border-primary/10', icon: <ShieldCheck className="w-3 h-3" /> };
      case 'affordable':
      case 'financially suitable':
        return { color: 'text-amber-600 bg-amber-50 border-amber-100', icon: <Coins className="w-3 h-3" /> };
      case 'high confidence':
      case 'highly relevant':
        return { color: 'text-indigo-600 bg-indigo-50 border-indigo-100', icon: <Sparkles className="w-3 h-3" /> };
      case '24/7 emergency':
      case 'emergency':
        return { color: 'text-rose-600 bg-rose-50 border-rose-100', icon: <HeartPulse className="w-3 h-3" /> };
      case 'verified':
        return { color: 'text-teal-600 bg-teal-50 border-teal-100', icon: <CheckCircle2 className="w-3 h-3" /> };
      case 'trending':
        return { color: 'text-orange-600 bg-orange-50 border-orange-100', icon: <TrendingUp className="w-3 h-3" /> };
      default:
        return { color: 'text-slate-500 bg-slate-50 border-slate-100', icon: <Award className="w-3 h-3" /> };
    }
  };

  const { color, icon } = getStyle();

  return (
    <Badge className={`flex items-center gap-1 px-2 py-0 rounded-full border font-black text-[9px] uppercase tracking-widest transition-all cursor-default ${color}`}>
      {icon}
      {label}
    </Badge>
  );
};
