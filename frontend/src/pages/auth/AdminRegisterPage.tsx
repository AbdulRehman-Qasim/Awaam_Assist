import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GraduationCap, Landmark, Hospital, MapPin, LocateFixed, BrainCircuit, ShieldCheck, User, Mail, Lock, ArrowRight, Loader2, Sparkles, Building2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from 'framer-motion';

// ─── Schema (unchanged) ────────────────────────────────────────────────────
const registerSchema = z.object({
  admin_name: z.string()
    .min(3, "Full Name must be at least 3 characters")
    .regex(/^[a-zA-Z\s]+$/, "Only letters and spaces are allowed"),
  admin_email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.string(),
  current_location: z.string().min(3, "Location is required"),
  current_location_lat: z.string().optional(),
  current_location_lng: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterValues = z.infer<typeof registerSchema>;

// ─── Component ─────────────────────────────────────────────────────────────
const AdminRegisterPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      admin_name: '',
      admin_email: '',
      password: '',
      confirmPassword: '',
      role: 'education_admin',
      current_location: '',
      current_location_lat: '',
      current_location_lng: '',
    },
  });

  const handleRoleChange = (value: string) => {
    form.setValue('role', value);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({ variant: "destructive", title: "Location not supported", description: "Your browser does not support geolocation." });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
          const data = await response.json();
          if (data && data.display_name) {
            const address = data.address;
            const city = address.city || address.town || address.village || address.suburb || "";
            const state = address.state || "";
            const country = address.country || "";
            const readableAddress = [city, state, country].filter(Boolean).join(", ");
            form.setValue('current_location', readableAddress || data.display_name);
          } else {
            form.setValue('current_location', `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          }
          form.setValue('current_location_lat', String(lat));
          form.setValue('current_location_lng', String(lng));
          toast({ title: "Location captured", description: "Current address detected successfully." });
        } catch (error) {
          form.setValue('current_location', `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          form.setValue('current_location_lat', String(lat));
          form.setValue('current_location_lng', String(lng));
          toast({ title: "Location captured", description: "Coordinates added (address lookup failed)." });
        }
      },
      () => {
        toast({ variant: "destructive", title: "Location access denied", description: "Please allow location access or enter it manually." });
      }
    );
  };

  const getEntityType = (role: string) => {
    if (role === 'education_admin') return 'university';
    if (role === 'scheme_admin') return 'scheme';
    if (role === 'hospital_admin') return 'hospital';
    return 'university';
  };

  const onSubmit = async (values: RegisterValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin_name: values.admin_name,
          admin_email: values.admin_email,
          password: values.password,
          role: values.role,
          current_location: values.current_location,
          current_location_lat: values.current_location_lat,
          current_location_lng: values.current_location_lng,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast({ variant: "destructive", title: "Registration error", description: data.message || "Something went wrong" });
      } else {
        toast({ title: "Account Created", description: "Step 1 complete. Now tell us about your institution." });
        const entityType = getEntityType(values.role);
        navigate(`/admin/onboarding?adminId=${data.data._id}&type=${entityType}`);
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Registration error", description: "An error occurred during registration." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Role config ───────────────────────────────────────────────────────
  const roles = [
    { value: 'education_admin', label: 'University', icon: <GraduationCap className="w-5 h-5" />, color: 'text-blue-400', activeBg: 'bg-blue-500/15 border-blue-500/40' },
    { value: 'scheme_admin',    label: 'Scheme',     icon: <Landmark className="w-5 h-5" />,       color: 'text-emerald-400', activeBg: 'bg-emerald-500/15 border-emerald-500/40' },
    { value: 'hospital_admin',  label: 'Hospital',   icon: <Hospital className="w-5 h-5" />,        color: 'text-rose-400', activeBg: 'bg-rose-500/15 border-rose-500/40' },
  ];

  const watchedRole = form.watch('role');
  const errors = form.formState.errors;

  // ─── Shared input class ────────────────────────────────────────────────
  const inputClass = "h-11 bg-white/[0.05] border-white/10 text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:border-white/30 rounded-xl font-medium transition-all";
  const labelClass = "text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block mb-2";
  const errorClass = "text-rose-400 text-[10px] font-bold uppercase tracking-wide mt-1.5 flex items-center gap-1";

  // ─── JSX ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-slate-950 overflow-hidden">

      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-[44%] relative flex-col justify-between p-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)', backgroundSize: '48px 48px' }}
        />

        {/* Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-white font-black text-lg tracking-tight">AwamAssist</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 ml-0.5">Institution Registration</p>
        </div>

        {/* Hero */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Institutional Partner Portal</span>
          </div>
          <h1 className="text-4xl font-black text-white leading-[1.08] tracking-tight">
            Join the<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
              Intelligence
            </span><br />
            Ecosystem
          </h1>
          <p className="text-slate-400 font-medium text-sm leading-relaxed max-w-xs">
            Register your institution on AwamAssist to connect with thousands of students, patients, and citizens through AI-powered recommendations.
          </p>
          {/* Steps */}
          <div className="space-y-3">
            {[
              { step: '01', label: 'Create your admin account' },
              { step: '02', label: 'Set up your institution profile' },
              { step: '03', label: 'Go live on the AI platform' },
            ].map(({ step, label }) => (
              <div key={step} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white/30">
                  {step}
                </div>
                <span className="text-sm font-semibold text-white/40">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-[10px] font-bold text-white/20 uppercase tracking-widest">
          AwamAssist Platform · v3.5 · Institutional Partner
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 relative overflow-y-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 lg:from-slate-900/60 lg:via-slate-900/40 lg:to-slate-900/60" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-xl py-6"
        >
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/40">

            {/* Header */}
            <div className="mb-7">
              <div className="flex items-center gap-3 mb-5 lg:hidden">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                  <BrainCircuit className="w-4.5 h-4.5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-white font-black text-sm">AwamAssist</div>
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Institution Registration</div>
                </div>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Create Admin Account</h2>
              <p className="text-sm font-medium text-white/40 mt-1.5">
                Join as an institutional partner — one account per institution.
              </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* Entity type selector */}
              <div>
                <label className={labelClass}>Entity Type</label>
                <RadioGroup
                  defaultValue="education_admin"
                  onValueChange={handleRoleChange}
                  className="grid grid-cols-3 gap-3"
                >
                  {roles.map((r) => {
                    const isActive = watchedRole === r.value;
                    return (
                      <label
                        key={r.value}
                        htmlFor={r.value}
                        className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border cursor-pointer transition-all duration-200
                          ${isActive ? `${r.activeBg}` : 'bg-white/[0.03] border-white/8 hover:bg-white/[0.06] hover:border-white/15'}`}
                      >
                        <RadioGroupItem value={r.value} id={r.value} className="sr-only" />
                        <div className={`transition-colors ${isActive ? r.color : 'text-white/30'}`}>
                          {r.icon}
                        </div>
                        <span className={`text-[11px] font-black uppercase tracking-wider transition-colors
                          ${isActive ? 'text-white' : 'text-white/30'}`}>
                          {r.label}
                        </span>
                      </label>
                    );
                  })}
                </RadioGroup>
              </div>

              {/* Name + Email row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="admin_name" className={labelClass}>Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                    <Input
                      id="admin_name"
                      {...form.register("admin_name")}
                      onChange={(e) => {
                        const filtered = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                        form.setValue("admin_name", filtered);
                      }}
                      placeholder="Official Representative"
                      className={`pl-10 ${inputClass}`}
                    />
                  </div>
                  {errors.admin_name && <p className={errorClass}>{errors.admin_name.message}</p>}
                </div>
                <div>
                  <label htmlFor="admin_email" className={labelClass}>Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                    <Input
                      id="admin_email"
                      {...form.register("admin_email")}
                      placeholder="admin@institution.com"
                      type="email"
                      className={`pl-10 ${inputClass}`}
                    />
                  </div>
                  {errors.admin_email && <p className={errorClass}>{errors.admin_email.message}</p>}
                </div>
              </div>

              {/* Password row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className={labelClass}>Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                    <Input
                      id="password"
                      {...form.register("password")}
                      type="password"
                      placeholder="••••••••"
                      className={`pl-10 ${inputClass}`}
                    />
                  </div>
                  {errors.password && <p className={errorClass}>{errors.password.message}</p>}
                </div>
                <div>
                  <label htmlFor="confirmPassword" className={labelClass}>Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                    <Input
                      id="confirmPassword"
                      {...form.register("confirmPassword")}
                      type="password"
                      placeholder="••••••••"
                      className={`pl-10 ${inputClass}`}
                    />
                  </div>
                  {errors.confirmPassword && <p className={errorClass}>{errors.confirmPassword.message}</p>}
                </div>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="current_location" className={labelClass}>Institution Location</label>
                <div className="flex gap-2.5">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                    <Input
                      id="current_location"
                      {...form.register("current_location")}
                      placeholder="City, Province or GPS coordinates"
                      className={`pl-10 ${inputClass}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="flex-shrink-0 h-11 px-4 rounded-xl bg-white/[0.06] border border-white/10
                      hover:bg-white/10 hover:border-white/20 text-white/50 hover:text-white/80
                      text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2"
                  >
                    <LocateFixed className="w-3.5 h-3.5" />
                    Detect
                  </button>
                </div>
                {errors.current_location && <p className={errorClass}>{errors.current_location.message}</p>}
                <p className="text-[10px] text-white/25 font-semibold flex items-center gap-1.5 mt-2">
                  <MapPin className="w-3 h-3" />
                  Required for all institutional registrations
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5
                  bg-gradient-to-r from-emerald-600 to-emerald-500
                  hover:from-emerald-500 hover:to-emerald-400
                  disabled:opacity-60 disabled:cursor-not-allowed
                  shadow-lg shadow-emerald-500/20
                  text-white transition-all duration-200 active:scale-[0.98]"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isSubmitting ? (
                    <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Account...
                    </motion.span>
                  ) : (
                    <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Continue to Institution Setup
                      <ArrowRight className="w-4 h-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </form>

            {/* Footer */}
            <div className="mt-7 pt-6 border-t border-white/8 flex flex-col items-center gap-3">
              <p className="text-sm text-white/30 font-medium">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/admin/login')}
                  className="text-white/60 hover:text-white font-black underline underline-offset-2 transition-colors"
                >
                  Sign in
                </button>
              </p>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
                  256-bit Encrypted · Secure Institutional Gateway
                </span>
              </div>
            </div>
          </div>

          {/* AI badge */}
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

export default AdminRegisterPage;