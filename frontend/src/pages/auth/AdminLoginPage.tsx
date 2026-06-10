import React, { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, GraduationCap, Building2, HeartPulse,
  Mail, Lock, ArrowRight, Loader2, BrainCircuit, Sparkles,
} from 'lucide-react';

type AdminModule = 'education' | 'scheme' | 'hospital';
type AdminRole = 'super_admin' | 'education_admin' | 'scheme_admin' | 'hospital_admin';

// ─── unchanged logic ──────────────────────────────────────────────────────
const AdminLoginPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    admin_email: '',
    password: '',
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const getDefaultModule = (): AdminModule => {
    const moduleFromQuery = searchParams.get('module');
    if (moduleFromQuery === 'scheme') return 'scheme';
    if (moduleFromQuery === 'hospital') return 'hospital';
    if (moduleFromQuery === 'education') return 'education';
    if (location.pathname.includes('/admin/scheme/')) return 'scheme';
    if (location.pathname.includes('/admin/hospital/')) return 'hospital';
    return 'education';
  };

  const [selectedModule, setSelectedModule] = useState<AdminModule>(getDefaultModule());

  const moduleMeta = {
    education: {
      label: 'University',
      role: 'education_admin',
      dashboardPath: '/admin/education/dashboard',
    },
    scheme: {
      label: 'Scheme',
      role: 'scheme_admin',
      dashboardPath: '/admin/scheme/dashboard',
    },
    hospital: {
      label: 'Hospital',
      role: 'hospital_admin',
      dashboardPath: '/admin/hospital/dashboard',
    },
  } as const;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const loginUrl = `${apiUrl}/admin/login`;

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_email: formData.admin_email,
          password: formData.password,
          requiredRole: moduleMeta[selectedModule].role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data?.token && data?.admin) {
          const adminRole = data.admin.role as AdminRole | undefined;
          const moduleByRole: Record<AdminRole, string> = {
            super_admin: 'super_admin',
            education_admin: 'education',
            scheme_admin: 'scheme',
            hospital_admin: 'hospital',
          };

          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('admin', JSON.stringify(data.admin));
          localStorage.setItem('adminModule', adminRole ? moduleByRole[adminRole] : selectedModule);

          toast({
            title: 'Login successful',
            description: `Welcome to ${moduleMeta[selectedModule].label} admin dashboard.`,
          });

          if (adminRole === 'super_admin') { navigate('/super-admin/dashboard'); return; }
          if (adminRole === 'scheme_admin') { navigate('/admin/scheme/dashboard'); return; }
          if (adminRole === 'hospital_admin') { navigate('/admin/hospital/dashboard'); return; }
          navigate('/admin/education/dashboard');
          return;
        }

        toast({
          variant: 'destructive',
          title: 'Login failed',
          description: 'Login response was missing admin session data.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Login failed',
          description: data.message || 'Invalid email or password. Please try again.',
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: 'An error occurred during login. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── module selector config ─────────────────────────────────────────────
  const modules: { value: AdminModule; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
    {
      value: 'education',
      label: 'University',
      icon: <GraduationCap className="w-4 h-4" />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      value: 'scheme',
      label: 'Scheme',
      icon: <Building2 className="w-4 h-4" />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      value: 'hospital',
      label: 'Hospital',
      icon: <HeartPulse className="w-4 h-4" />,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
  ];

  const activeModule = modules.find(m => m.value === selectedModule)!;

  // ─── JSX ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-slate-950 overflow-hidden">

      {/* ── Left panel — decorative ── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-14 overflow-hidden">
        {/* Gradient layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950" />
        {/* Orb glows */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)', backgroundSize: '48px 48px' }}
        />

        {/* Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-white font-black text-lg tracking-tight">AwamAssist</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 ml-0.5">Administration Portal</p>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Secure Admin Gateway</span>
          </div>
          <h1 className="text-5xl font-black text-white leading-[1.05] tracking-tight">
            Intelligence<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              Administration
            </span>
          </h1>
          <p className="text-slate-400 font-medium text-sm leading-relaxed max-w-xs">
            Manage your platform modules — Education, Healthcare & Schemes — from one unified, intelligent control centre.
          </p>

          {/* Feature chips */}
          <div className="flex flex-wrap gap-2">
            {['Role-Based Access', 'Real-Time Analytics', 'AI-Powered Insights', 'Secure & Encrypted'].map(f => (
              <span key={f} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/50 uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom disclaimer */}
        <div className="relative z-10 text-[10px] font-bold text-white/20 uppercase tracking-widest">
          AwamAssist Platform · v3.5 · Restricted Access
        </div>
      </div>

      {/* ── Right panel — login form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        {/* Subtle bg glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 lg:from-slate-900/60 lg:via-slate-900/40 lg:to-slate-900/60" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Card */}
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/40">

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center lg:hidden">
                  <BrainCircuit className="w-5 h-5 text-blue-400" />
                </div>
                <div className="lg:hidden">
                  <div className="text-white font-black text-sm">AwamAssist</div>
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Administration Portal</div>
                </div>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Welcome back</h2>
              <p className="text-sm font-medium text-white/40 mt-1.5">
                Sign in to access your admin dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Module selector */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                  Portal Type
                </label>
                <RadioGroup
                  value={selectedModule}
                  onValueChange={(v) => setSelectedModule(v as AdminModule)}
                  className="grid grid-cols-3 gap-2.5"
                >
                  {modules.map((mod) => {
                    const isActive = selectedModule === mod.value;
                    return (
                      <label
                        key={mod.value}
                        htmlFor={`module-${mod.value}`}
                        className={`
                          flex flex-col items-center gap-2 p-3.5 rounded-2xl border cursor-pointer
                          transition-all duration-200
                          ${isActive
                            ? 'bg-white/10 border-white/25 shadow-lg'
                            : 'bg-white/[0.03] border-white/8 hover:bg-white/[0.06] hover:border-white/15'}
                        `}
                      >
                        <RadioGroupItem value={mod.value} id={`module-${mod.value}`} className="sr-only" />
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all
                          ${isActive ? `${mod.bg} ${mod.color}` : 'bg-white/10 text-white/40'}`}>
                          {mod.icon}
                        </div>
                        <span className={`text-[11px] font-black transition-colors
                          ${isActive ? 'text-white' : 'text-white/40'}`}>
                          {mod.label}
                        </span>
                      </label>
                    );
                  })}
                </RadioGroup>
              </div>

              {/* Email field */}
              <div className="space-y-2">
                <label htmlFor="admin_email" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                  <Input
                    id="admin_email"
                    name="admin_email"
                    type="email"
                    placeholder="admin@example.com"
                    value={formData.admin_email}
                    onChange={handleChange}
                    required
                    className="pl-10 h-11 bg-white/[0.05] border-white/10 text-white placeholder:text-white/20
                      focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:border-white/30
                      rounded-xl font-medium transition-all"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                    Password
                  </label>
                  <a
                    href="/admin/forgot-password"
                    className="text-[10px] font-black text-white/30 hover:text-white/60 uppercase tracking-widest transition-colors"
                  >
                    Forgot?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-10 h-11 bg-white/[0.05] border-white/10 text-white placeholder:text-white/20
                      focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:border-white/30
                      rounded-xl font-medium transition-all"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5
                  bg-gradient-to-r from-blue-600 to-blue-500
                  hover:from-blue-500 hover:to-blue-400
                  disabled:opacity-60 disabled:cursor-not-allowed
                  shadow-lg shadow-blue-500/20
                  text-white transition-all duration-200 active:scale-[0.98]"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isSubmitting ? (
                    <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Authenticating...
                    </motion.span>
                  ) : (
                    <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Sign In to {activeModule.label} Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

            </form>

            {/* Footer links */}
            <div className="mt-7 pt-6 border-t border-white/8 flex flex-col items-center gap-3">
              <p className="text-sm text-white/30 font-medium">
                Institutional partner?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/admin/register')}
                  className="text-white/60 hover:text-white font-black underline underline-offset-2 transition-colors"
                >
                  Register Your Entity
                </button>
              </p>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
                  256-bit Encrypted · Secure Admin Gateway
                </span>
              </div>
            </div>
          </div>

          {/* Bottom AI badge */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <Sparkles className="w-3.5 h-3.5 text-white/20" />
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
              Powered by AwamAssist Intelligence Engine v3.5
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLoginPage;