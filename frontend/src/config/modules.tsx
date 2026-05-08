import { GraduationCap, ShieldCheck, HeartPulse, MessageSquare, LayoutDashboard } from "lucide-react";

export interface ModuleInfo {
  id: string;
  label: string;
  route: string;
  icon: any;
  color: string;
  description: string;
}

export const MODULE_CONFIG: Record<string, ModuleInfo> = {
  education: {
    id: "education",
    label: "Search Universities",
    route: "/company/hero-section",
    icon: GraduationCap,
    color: "text-sky-500",
    description: "Universities, scholarships, and admissions."
  },
  schemes: {
    id: "schemes",
    label: "Search Schemes",
    route: "/company/schemes/dashboard",
    icon: ShieldCheck,
    color: "text-emerald-500",
    description: "Financial aid and welfare programs."
  },
  healthcare: {
    id: "healthcare",
    label: "Search Hospitals",
    route: "/company/healthcare",
    icon: HeartPulse,
    color: "text-rose-500",
    description: "Hospital networks and medical assistance."
  }
};

export const CORE_MODULES = {
  dashboard: {
    id: "dashboard",
    label: "Dashboard",
    route: "/company/dashboard",
    icon: LayoutDashboard,
    color: "text-slate-600"
  },
  chatbot: {
    id: "chatbot",
    label: "AI Chatbot",
    route: "/company/ai-chatbot",
    icon: MessageSquare,
    color: "text-blue-500"
  }
};
