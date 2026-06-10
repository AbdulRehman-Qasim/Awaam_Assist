import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, AlertCircle, MapPin, GraduationCap, ShieldCheck,
  HeartPulse, CheckCircle2, ChevronRight, BrainCircuit,
  LayoutDashboard, Settings, Zap, Plus, History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIntelligence } from "@/hooks/useIntelligence";
import { InsightCards } from "./InsightCards";
import { DashboardFeed } from "./DashboardFeed";
import { AIInsights } from "./AIInsights";
import { SmartLoading } from "./SmartLoading";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CORE_MODULES, CORE_MODULE_IDS, type CoreModuleId, type ProfileFieldDef } from "@/config/profileModules";
import { ReportHistory } from "../shared/ReportHistory";
import MyAppointments from "./MyAppointments";
import { Calendar as CalendarIcon } from "lucide-react";
import { HealthcareModuleForm, isHealthcareFormValid } from "./HealthcareModuleForm";
import { EducationModuleForm, isEducationFormValid } from "./EducationModuleForm";
import { SchemesModuleForm, isSchemesFormValid } from "./SchemesModuleForm";
const FieldRenderer = ({ field, value, moduleId, updateField }: {
  field: ProfileFieldDef,
  value: any,
  moduleId: string,
  updateField: (f: ProfileFieldDef, v: any) => void
}) => {
  const id = `profile-${moduleId}-${field.path}`;
  const commonClass = "h-11 rounded-2xl border-slate-200 bg-slate-50/50 font-bold focus-visible:ring-primary transition-all duration-200 hover:bg-slate-100/50";

  return (
    <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-1 ml-1" htmlFor={id}>
        {field.label}
        {["income", "age", "province", "employmentStatus", "educationLevel", "familySize", "bispStatus"].some(p => field.path.endsWith(p)) && (
          <span className="text-rose-500">*</span>
        )}
      </Label>

      {field.type === "select" ? (
        <Select
          value={(value ?? "") as string}
          onValueChange={(next) => updateField(field, next)}
        >
          <SelectTrigger className={commonClass}>
            <SelectValue placeholder={field.placeholder || "Select"} />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
            {(field.options || []).map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="rounded-xl focus:bg-primary/5 focus:text-primary font-bold">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : field.type === "textarea" ? (
        <Textarea
          id={id}
          value={(value ?? "") as string}
          placeholder={field.placeholder}
          className="min-h-[120px] rounded-2xl border-slate-200 bg-slate-50/50 font-bold focus-visible:ring-primary transition-all hover:bg-slate-100/50"
          onChange={(e) => updateField(field, e.target.value)}
        />
      ) : (
        <Input
          id={id}
          type={field.type === "number" ? "number" : "text"}
          value={value ?? ""}
          placeholder={field.placeholder}
          className={commonClass}
          onChange={(e) => updateField(field, e.target.value)}
          onKeyDown={(e) => {
            // Prevent e, +, - in number inputs (Part 2)
            if (field.type === "number" && ["e", "E", "+", "-"].includes(e.key)) {
              e.preventDefault();
            }
          }}
        />
      )}
    </div>
  );
};

const PersonalizedDashboard = () => {
  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://awaam-assist.onrender.com";
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileVersion, setProfileVersion] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [localDraft, setLocalDraft] = useState<any>(null);
  const [pendingModuleAdd, setPendingModuleAdd] = useState<CoreModuleId[]>([]);
  // Used to force localDraft to re-sync when profile refreshes after save
  const [syncTimestamp, setSyncTimestamp] = useState(0);
  const debouncedSaveTimer = useRef<number | null>(null);

  const userBasics = useMemo(() => {
    const userStr = localStorage.getItem("user");
    try { return userStr ? JSON.parse(userStr) : { data: {} }; }
    catch { return { data: {} }; }
  }, []);

  const token = userBasics?.token;

  const fetchProfile = async () => {
    if (!token) { setLoadingProfile(false); return; }
    setLoadingProfile(true);
    setProfileError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/api/user/profile`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`Profile Fetch Failed: ${response.status}`);
      const result = await response.json();
      if (result.success) setProfile(result.data);
      else setProfileError(result.message || "Failed to fetch profile");
    } catch (err: any) {
      setProfileError(err.message);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => { fetchProfile(); }, [token]);

  const persistUserLocalStorage = (nextSelectedModules?: string[]) => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const parsed = JSON.parse(userStr);
      const next = {
        ...parsed,
        data: {
          ...(parsed.data || {}),
          onboardingCompleted: true,
          ...(nextSelectedModules ? { selectedModules: nextSelectedModules } : {}),
        },
      };
      localStorage.setItem("user", JSON.stringify(next));
      // Notify CompanyLayout navbar to refresh its module list
      window.dispatchEvent(new Event("modulesUpdated"));
    } catch {
      // ignore localStorage parse issues
    }
  };

  const handleUpdateProfile = async (
    updatedData: { selectedModules?: string[]; profile?: any },
    options: { closeOnSuccess?: boolean; successMessage?: string } = {}
  ) => {
    if (!token || !profile) return;
    setIsUpdating(true);
    try {
      const nextSelectedModules = updatedData.selectedModules || profile.selectedModules;
      const mergedProfile = updatedData.profile || {
        education: { ...profile.profile?.education },
        schemes: { ...profile.profile?.schemes },
        healthcare: { ...profile.profile?.healthcare },
      };
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/complete-profile`, {
        method: 'POST',
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ selectedModules: nextSelectedModules, profile: mergedProfile })
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Update Failed");
      }

      // Always re-fetch from server to get authoritative, fresh profile data
      await fetchProfile();

      // Bump version to force recommendation re-fetch and feed re-render
      setProfileVersion(v => v + 1);
      // Bump syncTimestamp so localDraft useEffect re-runs from fresh profile
      setSyncTimestamp(t => t + 1);
      persistUserLocalStorage(nextSelectedModules);

      toast.success(options.successMessage || "Intelligence Engine Updated", {
        description: "Your personalized dashboard has been synchronized."
      });

      if (options.closeOnSuccess === true) setIsEditModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Profile update failed");
    } finally {
      setIsUpdating(false);
    }
  };

  const { loading: loadingIntelligence, data: recommendations, error: intelligenceError } =
    useIntelligence(profile, userBasics, profileVersion);

  const rawModules = profile?.selectedModules || [];
  const details = profile?.profile || {};

  const availableToAdd = useMemo(() => {
    const current = new Set<string>(rawModules || []);
    return CORE_MODULE_IDS.filter((m) => !current.has(m));
  }, [rawModules]);

  // Re-sync localDraft whenever profile refreshes (after save or initial load)
  useEffect(() => {
    if (!profile) return;
    setLocalDraft({
      selectedModules: profile.selectedModules || [],
      profile: {
        education: { ...(profile.profile?.education || {}) },
        schemes: { ...(profile.profile?.schemes || {}) },
        healthcare: { ...(profile.profile?.healthcare || {}) },
      },
    });
  }, [profile?._id, syncTimestamp]);

  const isInitialLoad = loadingProfile || (loadingIntelligence && !recommendations);
  const hasNoMatches = !loadingIntelligence && recommendations &&
    (recommendations.universities?.length || 0) === 0 &&
    (recommendations.schemes?.length || 0) === 0 &&
    (recommendations.hospitals?.length || 0) === 0;

  /* ── ERROR STATES ── */
  if (profileError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <div className="w-20 h-20 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-rose-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Profile Access Error</h2>
        <p className="text-slate-500 font-medium max-w-sm">{profileError}</p>
        <Button onClick={() => window.location.reload()} className="rounded-xl">Retry Connection</Button>
      </div>
    );
  }

  if (intelligenceError && !recommendations) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 space-y-4">
        <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center border border-amber-100 shadow-sm">
          <BrainCircuit className="w-10 h-10 text-amber-500 animate-pulse" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Intelligence Sync Error</h2>
        <p className="text-slate-500 font-bold max-w-sm">
          Our recommendation engine encountered a temporary problem while analyzing your profile.
        </p>
        <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 font-mono text-[10px] text-slate-400">
          ERR_CODE: {intelligenceError}
        </div>
        <Button onClick={() => window.location.reload()} className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-black">
          Restart Engine
        </Button>
      </div>
    );
  }

  if (isInitialLoad) {
    return <div className="max-w-7xl mx-auto pt-20"><SmartLoading /></div>;
  }

  const displayName = String(userBasics?.data?.student_name || "Guest User");
  const displayEmail = String(profile?.userId?.student_email || userBasics?.data?.student_email || "Verified Citizen");
  const firstName = displayName.split(' ')[0] || "Guest";

  // Authoritative active modules — use profile directly so we always reflect server state
  const activeModules: string[] = profile?.selectedModules || [];

  // selectedModules are modules that are active AND have at least some data configured
  const selectedModules = activeModules.filter((mod: string) => {
    if (mod === 'education') return !!(details.education?.degree || details.education?.marks);
    if (mod === 'schemes') return isSchemesFormValid(details.schemes);
    if (mod === 'healthcare') return !!(details.healthcare && Object.keys(details.healthcare).length > 0);
    return true;
  });

  const isHealthcareActive = activeModules.includes('healthcare');


  const getByPath = (obj: any, path: string) => {
    const parts = path.split(".");
    let cur = obj;
    for (const p of parts) cur = cur?.[p];
    return cur;
  };

  const setByPath = (obj: any, path: string, value: any) => {
    const parts = path.split(".");
    const next = { ...(obj || {}) };
    let cur = next;
    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i];
      cur[key] = { ...(cur[key] || {}) };
      cur = cur[key];
    }
    cur[parts[parts.length - 1]] = value;
    return next;
  };

  const ensureModuleDefaults = (draft: any, moduleId: CoreModuleId) => {
    const next = { ...(draft || {}) };
    next.profile = next.profile || {};
    if (moduleId === "education") next.profile.education = next.profile.education || {};
    if (moduleId === "schemes") next.profile.schemes = next.profile.schemes || {};
    if (moduleId === "healthcare") next.profile.healthcare = next.profile.healthcare || {};
    return next;
  };

  const scheduleAutosave = (nextDraft: any) => {
    if (debouncedSaveTimer.current) window.clearTimeout(debouncedSaveTimer.current);
    debouncedSaveTimer.current = window.setTimeout(async () => {
      if (!profile) return;
      await handleUpdateProfile({
        selectedModules: nextDraft.selectedModules,
        profile: nextDraft.profile,
      }, { closeOnSuccess: false });
    }, 800);
  };

  const updateField = (field: ProfileFieldDef, rawValue: any) => {
    const isNumber = field.type === "number";
    let value = rawValue;

    if (isNumber) {
      if (rawValue === "") {
        value = "";
      } else {
        const sanitized = String(rawValue).replace(/[^0-9]/g, "");
        value = sanitized === "" ? "" : Number(sanitized);
        if (field.path.includes("age") && value > 120) value = 120;
        if (field.path.includes("income") && value > 10000000) value = 10000000;
        if (field.path.includes("familySize") && value > 50) value = 50;
      }
    }

    setLocalDraft(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        profile: setByPath(prev.profile, field.path, value),
      };
    });
  };

  const isModuleFormValid = (moduleId: string) => {
    if (!localDraft) return false;
    const values = localDraft.profile?.[moduleId] || {};

    if (moduleId === "healthcare") return isHealthcareFormValid(values);

    if (moduleId === "schemes") {
      const required = ["income", "age", "province", "employmentStatus", "educationLevel", "familySize", "bispStatus"];
      const hasAllRequired = required.every(key =>
        values[key] !== undefined && values[key] !== null && values[key] !== ""
      );
      const income = Number(values.income);
      const age = Number(values.age);
      const familySize = Number(values.familySize);
      const numericValid =
        !isNaN(income) && income >= 0 &&
        !isNaN(age) && age > 0 && age < 120 &&
        !isNaN(familySize) && familySize > 0 && familySize < 50;
      return hasAllRequired && numericValid;
    }

    if (moduleId === "education") {
      return isEducationFormValid(values);
    }

    return true;
  };

  // Helper: update healthcare fields inside localDraft (supports single field or multiple)
  const updateHealthcareFields = (updates: Record<string, any>) => {
    setLocalDraft(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        profile: {
          ...prev.profile,
          healthcare: {
            ...(prev.profile?.healthcare || {}),
            ...updates,
          },
        },
      };
    });
  };

  const metrics = {
    universities: recommendations?.universities?.length || 0,
    schemes: recommendations?.schemes?.length || 0,
    hospitals: recommendations?.hospitals?.length || 0,
    confidence: Number(recommendations?.overallConfidence) || 0,
    breakdown: recommendations?.moduleBreakdown || {}
  };

  const getIntelligenceLabel = (score: number) => {
    if (score >= 85) return "Excellent Match Intelligence";
    if (score >= 70) return "Good Match Intelligence";
    return "Moderate Match Intelligence";
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-32">

      {/* ═══════════════════════════════════
           1. HERO WELCOME BANNER
      ═══════════════════════════════════ */}
      <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 lg:p-10 shadow-2xl border border-slate-800/50"
        style={{ boxShadow: '0 20px 60px -15px rgba(0,0,0,0.5)' }}>
        {/* Subtle grid & Glow orb */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
              {greeting}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">{firstName}!</span>
            </h1>
            <p className="text-slate-300 font-medium text-sm leading-relaxed max-w-lg">
              {hasNoMatches
                ? "Our AI is ready to find opportunities for you. Complete your profile to unlock precision matching."
                : `We found high-confidence matches in ${recommendations?.profileNarrative && recommendations.profileNarrative.includes('in ') ? (recommendations.profileNarrative.split('in ')[1]?.split(' for')[0]?.split('.')[0] || 'your region') : 'your region'}. Your personalized intelligence is ready.`
              }
            </p>

            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 h-10 bg-white/10 border border-white/20 text-white font-bold text-[11px] uppercase tracking-widest rounded-xl hover:bg-white/20 transition-all backdrop-blur-md active:scale-[0.98]"
              >
                <Settings className="w-3.5 h-3.5" />
                Update Profile
              </button>
            </div>
          </div>

          {/* Right Side: Score Ring & Profile Minimal */}
          <div className="flex flex-col sm:flex-row items-center gap-6 lg:gap-8 flex-shrink-0">
            {!hasNoMatches && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="flex items-center gap-5 bg-white/5 backdrop-blur-md border border-white/10 p-4 pr-6 rounded-[1.5rem] shadow-xl"
              >
                {/* Left: Circular progress */}
                <div className="relative w-[76px] h-[76px] flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10" />
                    <motion.circle
                      cx="50" cy="50" r="42"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 42}
                      initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                      animate={{ strokeDashoffset: (2 * Math.PI * 42) - ((metrics.confidence || 0) / 100) * (2 * Math.PI * 42) }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                      strokeLinecap="round"
                      className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[18px] font-black text-white leading-none tracking-tight">{metrics.confidence || 0}<span className="text-[12px]">%</span></span>
                  </div>
                </div>

                {/* Right: Text aligned center-left */}
                <div className="flex flex-col justify-center gap-1.5 text-left">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-max">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-400">Engine Active</span>
                  </div>
                  <div className="text-[15px] font-black text-white tracking-tight leading-tight">
                    {getIntelligenceLabel(metrics.confidence || 0)}
                  </div>
                  <div className="text-[11px] font-medium text-white/50">
                    Based on your preferences
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-blue-500 to-violet-600 border border-white/20 flex items-center justify-center text-white text-lg font-black shadow-lg backdrop-blur-sm hover:scale-105 transition-transform cursor-pointer">
                {displayName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════
           2. METRIC CARDS
      ═══════════════════════════════════ */}
      <InsightCards metrics={metrics} selectedModules={selectedModules} />

      {/* ═══════════════════════════════════
           3. PROFILE + READINESS ROW
      ═══════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

        {/* Profile Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-8"
        >
          <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] h-full overflow-hidden flex flex-col hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.1)] transition-all duration-300">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center text-white text-base font-black shadow-md">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-sm tracking-tight">{displayName}</h2>
                  <div className="text-[11px] font-semibold text-slate-400 mt-0.5">{displayEmail}</div>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.18em]">Verified</span>
              </div>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
              {[
                { label: "Education Level", value: details?.education?.degree || "Not Set", icon: GraduationCap, bg: "bg-blue-50", color: "text-blue-600" },
                { label: "Your City", value: details?.education?.city || "Not Set", icon: MapPin, bg: "bg-emerald-50", color: "text-emerald-600" },
                { label: "Preferred Program", value: details?.education?.preferredProgram || "Not Set", icon: Zap, bg: "bg-violet-50", color: "text-violet-600" },
              ].map(({ label, value, icon: Icon, bg, color }) => (
                <div key={label} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all duration-300 group cursor-default">
                  <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 mb-1">{label}</div>
                  <div className="text-[13px] font-black text-slate-800 leading-tight">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Report History Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-4"
        >
          <div className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] h-full flex flex-col overflow-hidden hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.1)] transition-all duration-300">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
                <History className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-[13px] font-black text-slate-900 tracking-tight">Report History</h3>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Generated intelligence reports</p>
              </div>
            </div>

            <div className="p-5 flex-1 overflow-y-auto max-h-[280px] scrollbar-hide">
              <ReportHistory />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════
           4. MY APPOINTMENTS (Healthcare Only)
      ═══════════════════════════════════ */}
      {isHealthcareActive && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">My Appointments</h2>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-slate-100 to-transparent" />
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] p-6 sm:p-8">
            <MyAppointments />
          </div>
        </motion.div>
      )}

      {/* ═══════════════════════════════════
           5. AI SMART TIPS
      ═══════════════════════════════════ */}
      {!hasNoMatches && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-500" />
            </div>
            <div>
              <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Smart Tips</h2>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-slate-100 to-transparent" />
          </div>
          <AIInsights insights={recommendations?.insights || []} />
        </motion.div>
      )}

      {/* ═══════════════════════════════════
           6. RECOMMENDATION FEED
      ═══════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-3"
      >
        <div className="flex items-center gap-3 pb-2">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Personalized Intelligence Feed</h2>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-slate-100 to-transparent" />
        </div>
        <DashboardFeed
          key={`feed-v${profileVersion}`}
          recommendations={recommendations}
          loading={loadingIntelligence}
          selectedModules={selectedModules}
        />
      </motion.div>

      {/* ═══════════════════════════════════
           PROFILE & MODULE MANAGER (Dynamic)
      ═══════════════════════════════════ */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent
          className="sm:max-w-[980px] w-[95vw] rounded-3xl border-none shadow-2xl p-0 overflow-hidden flex flex-col max-h-[92vh]"
          onPointerDownOutside={(e) => {
            // Prevent Dialog from closing when user clicks inside a Radix Select/Popover portal
            const target = e.target as Element;
            if (
              target.closest('[data-radix-select-content]') ||
              target.closest('[data-radix-popper-content-wrapper]') ||
              target.closest('[role="listbox"]') ||
              target.closest('[role="option"]')
            ) {
              e.preventDefault();
            }
          }}
          onInteractOutside={(e) => {
            const target = e.target as Element;
            if (
              target.closest('[data-radix-select-content]') ||
              target.closest('[data-radix-popper-content-wrapper]') ||
              target.closest('[role="listbox"]') ||
              target.closest('[role="option"]')
            ) {
              e.preventDefault();
            }
          }}
        >
          <div className="hero-gradient p-7 relative overflow-hidden flex-shrink-0">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Settings className="w-24 h-24 rotate-12" />
            </div>
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-3">
                <BrainCircuit className="w-5 h-5 text-white" />
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight text-white">Profile & Modules</DialogTitle>
              <DialogDescription className="text-white/50 font-bold text-sm mt-1">
                Edit preferences per module. Changes auto-sync and re-rank recommendations in real time.
              </DialogDescription>
            </div>
          </div>

          <div className="p-7 pb-20 bg-white overflow-y-auto flex-1 scrollbar-hide md:scrollbar-default">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <TabsList className="rounded-2xl bg-slate-50 p-1.5 border border-slate-100">
                  <TabsTrigger value="overview" className="rounded-xl font-black text-xs uppercase tracking-widest px-4">
                    Overview
                  </TabsTrigger>
                  {(localDraft?.selectedModules || rawModules || [])
                    .filter((m: string) => CORE_MODULE_IDS.includes(m as CoreModuleId))
                    .map((m: string) => (
                      <TabsTrigger
                        key={m}
                        value={m}
                        className="rounded-xl font-black text-xs uppercase tracking-widest px-4"
                      >
                        {m === "healthcare" ? "Hospitals" : m === "schemes" ? "Schemes" : "Education"}
                      </TabsTrigger>
                    ))}
                </TabsList>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className="rounded-2xl font-black"
                    onClick={() => setActiveTab("overview")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Module
                  </Button>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {isUpdating ? "Syncing…" : "Synced"}
                  </div>
                </div>
              </div>

              <TabsContent value="overview" className="m-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/40">
                      <h3 className="text-sm font-black text-slate-900 tracking-tight">Active Modules</h3>
                      <p className="text-xs font-bold text-slate-400 mt-1">
                        Manage what the Intelligence Engine personalizes for you.
                      </p>
                    </div>
                    <div className="p-6 space-y-3">
                      {(localDraft?.selectedModules || rawModules || []).length === 0 ? (
                        <div className="text-sm font-bold text-slate-500">No modules active.</div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {(localDraft?.selectedModules || rawModules || []).map((m: string) => (
                            <span
                              key={m}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-[11px] font-black text-primary"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              {m}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/40">
                      <h3 className="text-sm font-black text-slate-900 tracking-tight">Add Module Preferences</h3>
                      <p className="text-xs font-bold text-slate-400 mt-1">
                        Activate new modules and start generating recommendations instantly.
                      </p>
                    </div>
                    <div className="p-6 space-y-4">
                      {availableToAdd.length === 0 ? (
                        <div className="text-sm font-bold text-slate-500">
                          You already have all core modules enabled.
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {availableToAdd.map((m) => {
                              const def = CORE_MODULES.find((d) => d.id === m)!;
                              const Icon = def.icon;
                              const isSelected = pendingModuleAdd.includes(m);
                              return (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() =>
                                    setPendingModuleAdd((prev) =>
                                      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
                                    )
                                  }
                                  className={`text-left p-4 rounded-2xl border-2 transition-all ${isSelected
                                      ? "border-primary bg-primary/5 shadow-sm"
                                      : "border-slate-100 bg-white hover:border-slate-200"
                                    }`}
                                >
                                  <div className={`rounded-2xl p-3 bg-gradient-to-br ${def.accentClass} inline-flex`}>
                                    <Icon className="w-5 h-5 text-slate-900/70" />
                                  </div>
                                  <div className="mt-3">
                                    <div className="text-sm font-black text-slate-900">{def.title}</div>
                                    <div className="text-xs font-bold text-slate-400 mt-0.5">{def.subtitle}</div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          <Button
                            disabled={pendingModuleAdd.length === 0 || isUpdating}
                            className="w-full h-12 rounded-2xl font-black"
                            onClick={async () => {
                              if (!localDraft) return;
                              const nextSelected = Array.from(
                                new Set<string>([...(localDraft.selectedModules || []), ...pendingModuleAdd])
                              );
                              let nextDraft = { ...localDraft, selectedModules: nextSelected };
                              pendingModuleAdd.forEach((m) => {
                                nextDraft = ensureModuleDefaults(nextDraft, m);
                              });
                              setLocalDraft(nextDraft);
                              await handleUpdateProfile({
                                selectedModules: nextSelected,
                                profile: nextDraft.profile,
                              }, { closeOnSuccess: false, successMessage: `${pendingModuleAdd.join(', ')} module activated. Fill in your details below.` });
                              // Navigate to first newly added module tab after modal stays open
                              const jumpTo = pendingModuleAdd[0] || "overview";
                              setPendingModuleAdd([]);
                              setActiveTab(jumpTo);
                            }}
                            style={{ boxShadow: "0 10px 30px hsl(var(--primary) / 0.18)" }}
                          >
                            {isUpdating ? "Activating…" : "Save & Update Profile"}
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {(localDraft?.selectedModules || rawModules || [])
                .filter((m: string) => CORE_MODULE_IDS.includes(m as CoreModuleId))
                .map((moduleId: string) => {
                  const def = CORE_MODULES.find((d) => d.id === (moduleId as CoreModuleId));
                  if (!def) return null;
                  const Icon = def.icon;
                  const fields = def.fields;
                  const valuesRoot = localDraft?.profile || profile?.profile || {};

                  return (
                    <TabsContent key={moduleId} value={moduleId} className="m-0">
                      <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                        <div className={`p-6 border-b border-slate-100 bg-gradient-to-br ${def.accentClass}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-white/60 border border-white/40 flex items-center justify-center">
                                <Icon className="w-6 h-6 text-slate-900/70" />
                              </div>
                              <div>
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">{def.title}</h3>
                                <p className="text-xs font-bold text-slate-600/70 mt-1">{def.subtitle}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                {isUpdating ? "Syncing…" : "Live Sync"}
                              </div>
                              <div className="text-[11px] font-bold text-slate-500 mt-1">
                                Updates adapt recommendations automatically
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="space-y-8">
                            {moduleId === "schemes" ? (
                              <SchemesModuleForm
                                values={localDraft?.profile?.schemes || {}}
                                onChange={(updates) => {
                                  const s = localDraft?.profile?.schemes || {};
                                  setLocalDraft({
                                    ...localDraft,
                                    profile: {
                                      ...localDraft.profile,
                                      schemes: { ...s, ...updates }
                                    }
                                  });
                                }}
                              />
                            ) : moduleId === "healthcare" ? (
                              <HealthcareModuleForm
                                values={localDraft?.profile?.healthcare || {}}
                                onChange={updateHealthcareFields}
                              />
                            ) : moduleId === "education" ? (
                              <EducationModuleForm
                                values={localDraft?.profile?.education || {}}
                                onChange={(updates) => {
                                  const e = localDraft?.profile?.education || {};
                                  setLocalDraft({
                                    ...localDraft,
                                    profile: {
                                      ...localDraft.profile,
                                      education: { ...e, ...updates }
                                    }
                                  });
                                }}
                              />
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {fields.map((f) => (
                                  <FieldRenderer key={f.path} field={f} value={getByPath(valuesRoot, f.path)} moduleId={moduleId} updateField={updateField} />
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${isModuleFormValid(moduleId) ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                              <div className="text-[11px] font-bold text-slate-500">
                                {isModuleFormValid(moduleId)
                                  ? "Form complete and valid. Ready to sync."
                                  : "Please complete all required fields with valid data."}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                              <Button
                                variant="outline"
                                className="rounded-2xl font-black flex-1 sm:flex-none h-11"
                                onClick={() => setIsEditModalOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                disabled={!isModuleFormValid(moduleId) || isUpdating}
                                className="rounded-2xl font-black flex-1 sm:flex-none h-11 min-w-[200px] shadow-lg shadow-primary/20"
                                onClick={async () => {
                                  if (!localDraft) return;
                                  await handleUpdateProfile({
                                    selectedModules: localDraft.selectedModules,
                                    profile: localDraft.profile,
                                  }, { closeOnSuccess: true });
                                }}
                              >
                                {isUpdating ? (
                                  <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Syncing...
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Sync & Update Recommendations
                                  </span>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  );
                })}
            </Tabs>

            <DialogFooter className="pt-0" />
          </div>
        </DialogContent>
      </Dialog>

      {/* FOOTER */}
      <div className="pt-16 border-t border-slate-100/60 text-center pb-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center shadow-md">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <p className="text-slate-700 font-black text-xs tracking-[0.3em] uppercase">AwamAssist Intelligence</p>
          <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">Simple · Private · Helpful</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-slate-400 font-bold">All systems operational</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedDashboard;
