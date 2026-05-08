import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, AlertCircle, MapPin, GraduationCap, ShieldCheck,
  HeartPulse, CheckCircle2, ChevronRight, BrainCircuit,
  ArrowUpRight, LayoutDashboard, Settings, User, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIntelligence } from "@/hooks/useIntelligence";
import { InsightCards } from "./InsightCards";
import { DashboardFeed } from "./DashboardFeed";
import { AIInsights } from "./AIInsights";
import { SmartLoading } from "./SmartLoading";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const PersonalizedDashboard = () => {
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileVersion, setProfileVersion] = useState(0);

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

  const handleUpdateProfile = async (updatedData: any) => {
    if (!token || !profile) return;
    setIsUpdating(true);
    try {
      const mergedProfile = {
        education: { ...profile.profile?.education, ...updatedData.education },
        schemes: { ...profile.profile?.schemes, ...updatedData.schemes },
        healthcare: { ...profile.profile?.healthcare, ...updatedData.healthcare }
      };
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/complete-profile`, {
        method: 'POST',
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ selectedModules: profile.selectedModules, profile: mergedProfile })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Update Failed");
      }
      await fetchProfile();
      setProfileVersion(v => v + 1);
      toast.success("Recommendations updated", {
        description: "Intelligence Engine has adapted to your new profile."
      });
      setIsEditModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Profile update failed");
    } finally {
      setIsUpdating(false);
    }
  };

  const { loading: loadingIntelligence, data: recommendations, error: intelligenceError } =
    useIntelligence(profile, userBasics, profileVersion);

  const readiness = useMemo(() => {
    const missing: string[] = [];
    if (!userBasics?.data?.student_name) missing.push("Full Name");
    if (!profile) {
      if (!loadingProfile) missing.push("Complete Onboarding");
      return { isComplete: false, missing };
    }
    const { selectedModules, profile: details } = profile;
    if (!selectedModules?.length) missing.push("Interests/Modules");
    if (selectedModules?.includes("education") && !details?.education?.degree) missing.push("Education Level");
    if (selectedModules?.includes("schemes") && !details?.schemes?.income) missing.push("Income Detail");
    return { isComplete: missing.length === 0, missing };
  }, [profile, userBasics, loadingProfile]);

  const isInitialLoad = loadingProfile || (loadingIntelligence && !recommendations);
  const hasNoMatches = !loadingIntelligence && recommendations &&
    recommendations.universities.length === 0 &&
    recommendations.schemes.length === 0 &&
    recommendations.hospitals.length === 0;

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

  const displayName = userBasics?.data?.student_name || "Guest User";
  const displayEmail = profile?.userId?.student_email || userBasics?.data?.student_email || "Verified Citizen";
  const firstName = displayName.split(' ')[0];

  const rawModules = profile?.selectedModules || [];
  const details = profile?.profile || {};
  const selectedModules = rawModules.filter((mod: string) => {
    if (mod === 'education') return !!(details.education?.degree || details.education?.marks);
    if (mod === 'schemes') return !!(details.schemes?.income);
    if (mod === 'healthcare') return !!(details.healthcare?.hospitalCategory || details.healthcare?.city);
    return true;
  });

  const metrics = {
    universities: recommendations?.universities?.length || 0,
    schemes: recommendations?.schemes?.length || 0,
    hospitals: recommendations?.hospitals?.length || 0,
    confidence: recommendations?.overallConfidence || 0
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
                : `We found high-confidence matches in ${recommendations?.profileNarrative?.includes('in ') ? recommendations.profileNarrative.split('in ')[1]?.split(' ')[0] : 'your region'}. Your personalized intelligence is ready.`
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

            {/* Profile details grid */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  label: "Education Level",
                  value: details?.education?.degree || "Not Set",
                  icon: GraduationCap,
                  iconColor: "text-blue-600",
                  iconBg: "bg-blue-50",
                },
                {
                  label: "Your City",
                  value: details?.education?.city || "Not Set",
                  icon: MapPin,
                  iconColor: "text-emerald-600",
                  iconBg: "bg-emerald-50",
                },
                {
                  label: "Discipline",
                  value: details?.education?.discipline || "Not Set",
                  icon: Zap,
                  iconColor: "text-violet-600",
                  iconBg: "bg-violet-50",
                },
              ].map(({ label, value, icon: Icon, iconColor, iconBg }) => (
                <div key={label} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 group hover:border-slate-200 transition-all">
                  <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                  </div>
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</div>
                    <div className="text-sm font-black text-slate-900 mt-0.5">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Readiness Card */}
        <div className="lg:col-span-4">
          <div className={`relative h-full rounded-2xl overflow-hidden p-6 flex flex-col shadow-lg ${readiness.isComplete
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
            : 'bg-gradient-to-br from-amber-500 to-orange-500'
            }`}>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <BrainCircuit className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                {readiness.isComplete
                  ? <CheckCircle2 className="w-6 h-6 text-white" />
                  : <AlertCircle className="w-6 h-6 text-white" />}
              </div>
              <h3 className="text-lg font-black text-white tracking-tight mb-1.5">
                {readiness.isComplete ? "Profile Ready" : "Context Needed"}
              </h3>
              <p className="text-white/70 text-xs font-bold leading-relaxed mb-4">
                {readiness.isComplete
                  ? "Your profile is optimized for precision matching."
                  : "Add more context for higher-confidence results."}
              </p>
              {!readiness.isComplete && (
                <div className="space-y-2 flex-grow">
                  {readiness.missing.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 bg-black/15 border border-white/10 p-2.5 rounded-xl">
                      <ArrowUpRight className="w-3.5 h-3.5 text-white/60 flex-shrink-0" />
                      <span className="text-[11px] font-black text-white/90">{item}</span>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="mt-4 w-full h-9 rounded-xl bg-white/20 border border-white/20 text-white font-black text-xs hover:bg-white/30 transition-all flex items-center justify-center gap-1.5"
              >
                Update Profile <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
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
           UPDATE PROFILE DIALOG
      ═══════════════════════════════════ */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          {/* Dialog header */}
          <div className="hero-gradient p-7 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Settings className="w-24 h-24 rotate-12" />
            </div>
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-3">
                <BrainCircuit className="w-5 h-5 text-white" />
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight text-white">Update Profile</DialogTitle>
              <DialogDescription className="text-white/50 font-bold text-sm mt-1">
                Adjust your context to refresh AI recommendations instantly.
              </DialogDescription>
            </div>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            handleUpdateProfile({
              education: {
                degree: fd.get('degree'),
                city: fd.get('city'),
                marks: Number(fd.get('marks')),
                discipline: fd.get('discipline'),
              },
              schemes: {
                income: Number(fd.get('income')),
                province: profile?.profile?.schemes?.province || 'Federal',
              }
            });
          }} className="p-7 space-y-5 bg-white">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Education Level</Label>
                <Select name="degree" defaultValue={profile?.profile?.education?.degree}>
                  <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/50 font-bold">
                    <SelectValue placeholder="Select Degree" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl">
                    <SelectItem value="Matric">Matric</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Bachelor">Bachelor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Marks %</Label>
                <Input name="marks" type="number" defaultValue={profile?.profile?.education?.marks}
                  className="h-11 rounded-xl border-slate-200 bg-slate-50/50 font-bold" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">City</Label>
                <Input name="city" defaultValue={profile?.profile?.education?.city}
                  placeholder="e.g. Lahore"
                  className="h-11 rounded-xl border-slate-200 bg-slate-50/50 font-bold" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Monthly Income</Label>
                <Input name="income" type="number" defaultValue={profile?.profile?.schemes?.income}
                  placeholder="PKR"
                  className="h-11 rounded-xl border-slate-200 bg-slate-50/50 font-bold" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Discipline / Interest</Label>
              <Input name="discipline" defaultValue={profile?.profile?.education?.discipline}
                placeholder="Engineering, Medical, Commerce…"
                className="h-11 rounded-xl border-slate-200 bg-slate-50/50 font-bold" />
            </div>

            <DialogFooter className="pt-2">
              <button
                type="submit"
                disabled={isUpdating}
                className="w-full h-12 rounded-xl bg-primary text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-60 shadow-lg"
                style={{ boxShadow: '0 6px 20px hsl(var(--primary) / 0.28)' }}
              >
                {isUpdating ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Optimizing…</>
                ) : (
                  <>Save & Adapt Intelligence <Sparkles className="w-4 h-4" /></>
                )}
              </button>
            </DialogFooter>
          </form>
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
