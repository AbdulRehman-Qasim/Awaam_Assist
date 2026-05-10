import { useEffect, useMemo, useRef, useState } from "react";
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

const PersonalizedDashboard = () => {
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileVersion, setProfileVersion] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [localDraft, setLocalDraft] = useState<any>(null);
  const [pendingModuleAdd, setPendingModuleAdd] = useState<CoreModuleId[]>([]);
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
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
    } catch {
      // ignore localStorage parse issues
    }
  };

  const handleUpdateProfile = async (
    updatedData: { selectedModules?: string[]; profile?: any },
    options: { closeOnSuccess?: boolean } = {}
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
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Update Failed");
      }
      await fetchProfile();
      setProfileVersion(v => v + 1);
      persistUserLocalStorage(nextSelectedModules);
      toast.success("Recommendations updated", {
        description: "Intelligence Engine has adapted to your new profile."
      });
      if (options.closeOnSuccess !== false) setIsEditModalOpen(false);
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
  }, [profile?._id]);

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

  const selectedModules = rawModules.filter((mod: string) => {
    if (mod === 'education') return !!(details.education?.degree || details.education?.marks);
    if (mod === 'schemes') return !!(details.schemes?.income);
    if (mod === 'healthcare') return !!(details.healthcare?.hospitalCategory || details.healthcare?.city);
    return true;
  });


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
    if (!localDraft) return;
    const isNumber = field.type === "number";
    const value = isNumber ? (rawValue === "" ? "" : Number(rawValue)) : rawValue;
    const next = {
      ...localDraft,
      profile: setByPath(localDraft.profile, field.path, value),
    };
    setLocalDraft(next);
    scheduleAutosave(next);
  };

  const metrics = {
    universities: recommendations?.universities?.length || 0,
    schemes: recommendations?.schemes?.length || 0,
    hospitals: recommendations?.hospitals?.length || 0,
    confidence: Number(recommendations?.overallConfidence) || 0
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-32 animate-in fade-in slide-in-from-bottom-2 duration-700">

      {/* ═══════════════════════════════════
           1. HERO WELCOME BANNER
      ═══════════════════════════════════ */}
      <div className="relative rounded-3xl overflow-hidden hero-gradient p-8 lg:p-10 shadow-xl"
        style={{ boxShadow: '0 20px 60px hsl(var(--primary) / 0.25)' }}>
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            {/* Status pill */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3.5 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">Intelligence Engine Active</span>
              {!hasNoMatches && (
                <>
                  <span className="text-white/30">·</span>
                  <span className="text-[10px] font-black text-white/60">{metrics.confidence}% Match Accuracy</span>
                </>
              )}
            </div>

            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              {greeting}, <span className="text-blue-200">{firstName}!</span>
            </h1>
            <p className="text-white/60 font-medium text-sm max-w-lg leading-relaxed">
              {hasNoMatches
                ? "Our AI is ready to find opportunities for you. Complete your profile to unlock precision matching."
                : `We found high-confidence matches in ${recommendations?.profileNarrative && recommendations.profileNarrative.includes('in ') ? (recommendations.profileNarrative.split('in ')[1]?.split(' for')[0]?.split('.')[0] || 'your region') : 'your region'}. Your personalized intelligence is ready.`
              }
            </p>
          </div>

          {/* Avatar + Update Profile */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white text-xl font-black flex-shrink-0 backdrop-blur-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <div className="text-white font-black text-sm leading-tight">{displayName}</div>
                <div className="text-white/50 text-[11px] font-medium">{displayEmail}</div>
              </div>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 h-10 bg-white/15 border border-white/20 text-white font-black text-xs rounded-xl hover:bg-white/25 transition-all backdrop-blur-sm active:scale-[0.98]"
            >
              <Settings className="w-3.5 h-3.5" />
              Update Profile
            </button>
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        {/* Profile Info Card */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm h-full overflow-hidden">
            {/* Card header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/40">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-lg font-black shadow-lg">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-lg border-2 border-white flex items-center justify-center">
                    <ShieldCheck className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-sm">{displayName}</h2>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-primary" />
                    {displayEmail}
                  </div>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-primary/5 border border-primary/10 rounded-full px-3 py-1">
                <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                <span className="text-[9px] font-black text-primary uppercase tracking-widest">Your Profile</span>
              </div>
            </div>

            {/* Profile details grid - Vertical & Premium */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 h-full min-h-[220px]">
              {[
                {
                  label: "Education Level",
                  value: details?.education?.degree || "Not Set",
                  icon: GraduationCap,
                  gradient: "from-blue-500/10 to-indigo-500/10",
                  iconColor: "text-blue-600",
                  iconBg: "bg-blue-100",
                },
                {
                  label: "Your City",
                  value: details?.education?.city || "Not Set",
                  icon: MapPin,
                  gradient: "from-emerald-500/10 to-teal-500/10",
                  iconColor: "text-emerald-600",
                  iconBg: "bg-emerald-100",
                },
                {
                  label: "Discipline",
                  value: details?.education?.discipline || (details?.education?.preferredProgram ? `Interested in ${details.education.preferredProgram}` : "Not Set"),
                  icon: Zap,
                  gradient: "from-violet-500/10 to-purple-500/10",
                  iconColor: "text-violet-600",
                  iconBg: "bg-violet-100",
                },
              ].map(({ label, value, icon: Icon, iconColor, iconBg, gradient }) => (
                <div 
                  key={label} 
                  className={`relative flex flex-col items-center justify-center text-center p-6 rounded-[2rem] bg-gradient-to-br ${gradient} border border-white shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all duration-500`}
                >
                  {/* Decorative background circle */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-white/40 transition-colors" />
                  
                  <div className={`w-16 h-16 rounded-2xl ${iconBg} flex items-center justify-center mb-4 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className={`w-8 h-8 ${iconColor}`} />
                  </div>
                  
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{label}</div>
                    <div className="text-lg font-black text-slate-900 leading-tight">{value}</div>
                  </div>

                  {/* Bottom indicator */}
                  <div className="mt-4 w-12 h-1 rounded-full bg-white/50 overflow-hidden">
                    <div className={`h-full w-2/3 ${iconBg.replace('bg-', 'bg-').replace('100', '500')} rounded-full`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Report History Card */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm h-full flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <History className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">Report History</h3>
              </div>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto max-h-[320px] scrollbar-hide">
              <ReportHistory />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════
           4. MY APPOINTMENTS
      ═══════════════════════════════════ */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-primary" />
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">My Appointments</h2>
        </div>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
            <MyAppointments />
        </div>
      </div>

      {/* ═══════════════════════════════════
           4. AI SMART TIPS
      ═══════════════════════════════════ */}
      {!hasNoMatches && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Smart Tips</h2>
          </div>
          <AIInsights insights={recommendations?.insights || []} />
        </div>
      )}

      {/* ═══════════════════════════════════
           5. RECOMMENDATION FEED
      ═══════════════════════════════════ */}
      <div className="pt-4 border-t border-slate-100">
        <DashboardFeed
          key={`${profile?.profile?.education?.city || ''}_${profile?.profile?.education?.degree || ''}`}
          recommendations={recommendations}
          loading={loadingIntelligence}
          selectedModules={selectedModules}
        />
      </div>

      {/* ═══════════════════════════════════
           PROFILE & MODULE MANAGER (Dynamic)
      ═══════════════════════════════════ */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[980px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="hero-gradient p-7 relative overflow-hidden">
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

          <div className="p-7 bg-white">
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
                                  className={`text-left p-4 rounded-2xl border-2 transition-all ${
                                    isSelected
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
                              }, { closeOnSuccess: false });
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
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {fields.map((f) => {
                              const v = getByPath(valuesRoot, f.path);
                              const id = `profile-${moduleId}-${f.path}`;

                              const commonClass =
                                "h-11 rounded-2xl border-slate-200 bg-slate-50/50 font-bold focus-visible:ring-primary";

                              return (
                                <div key={f.path} className="space-y-2">
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500" htmlFor={id}>
                                    {f.label}
                                  </Label>

                                  {f.type === "select" ? (
                                    <Select
                                      value={(v ?? "") as string}
                                      onValueChange={(next) => updateField(f, next)}
                                    >
                                      <SelectTrigger className={commonClass}>
                                        <SelectValue placeholder={f.placeholder || "Select"} />
                                      </SelectTrigger>
                                      <SelectContent className="rounded-2xl">
                                        {(f.options || []).map((opt) => (
                                          <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : f.type === "textarea" ? (
                                    <Textarea
                                      id={id}
                                      value={(v ?? "") as string}
                                      placeholder={f.placeholder}
                                      className="min-h-[120px] rounded-2xl border-slate-200 bg-slate-50/50 font-bold focus-visible:ring-primary"
                                      onChange={(e) => updateField(f, e.target.value)}
                                    />
                                  ) : (
                                    <Input
                                      id={id}
                                      type={f.type === "number" ? "number" : "text"}
                                      value={v ?? ""}
                                      placeholder={f.placeholder}
                                      className={commonClass}
                                      onChange={(e) => updateField(f, e.target.value)}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between gap-4">
                            <div className="text-[11px] font-bold text-slate-500">
                              Tip: edits are saved automatically. You can close this dialog anytime.
                            </div>
                            <Button
                              variant="outline"
                              className="rounded-2xl font-black"
                              onClick={() => setIsEditModalOpen(false)}
                            >
                              Done
                            </Button>
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
      <div className="pt-16 border-t border-slate-100 text-center pb-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-0.5 bg-slate-100 rounded-full" />
          <p className="text-slate-400 font-black text-xs tracking-[0.4em] flex items-center gap-3">
            <BrainCircuit className="w-5 h-5 text-primary" />
            AwamAssist Intelligence
          </p>
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
            Simple · Private · Helpful
          </p>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedDashboard;
