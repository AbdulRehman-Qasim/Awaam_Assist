import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import myLogo from "@/assets/mylogo.png";
import {
  Eye, EyeOff, ArrowRight, ShieldCheck, BrainCircuit,
  Sparkles, GraduationCap, Building2, Heart, ChevronLeft
} from "lucide-react";

const GOOGLE_CLIENT_ID = "554055055478-rknhms5v8p9k3gcn7dmjo18r9tp1lqvi.apps.googleusercontent.com";

const MODULE_BADGES = [
  { icon: GraduationCap, label: "University Matching", color: "bg-blue-500/20 text-blue-300" },
  { icon: Building2, label: "Govt Schemes", color: "bg-emerald-500/20 text-emerald-300" },
  { icon: Heart, label: "Healthcare Access", color: "bg-rose-500/20 text-rose-300" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPasswordValid = password.length >= 6;
    setEmailError(isEmailValid || email.length === 0 ? "" : "Please enter a valid email address");
    setPasswordError(isPasswordValid || password.length === 0 ? "" : "Password must be at least 6 characters");
    setIsFormValid(isEmailValid && isPasswordValid);
  }, [email, password]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_email: email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Login failed", description: data.message || "Invalid credentials", variant: "destructive" });
      } else {
        localStorage.setItem("user", JSON.stringify({ userType: data.userType, token: data.token, data: data.data }));
        toast({ title: "Welcome back!", description: "Redirecting to your dashboard…" });
        data.data.onboardingCompleted ? navigate("/dashboard") : navigate("/complete-profile");
      }
    } catch {
      toast({ title: "Network error", description: "Could not reach the server.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credResp: any) => {
    setIsLoading(true);
    try {
      const decoded: any = jwtDecode(credResp.credential);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ google_token: credResp.credential, email: decoded.email, sub: decoded.sub }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Google login failed", description: data.message, variant: "destructive" });
      } else {
        localStorage.setItem("user", JSON.stringify({ userType: data.userType, token: data.token, data: data.data }));
        toast({ title: "Welcome!", description: "Signed in with Google." });
        data.data.onboardingCompleted ? navigate("/dashboard") : navigate("/complete-profile");
      }
    } catch {
      toast({ title: "Error", description: "Google sign-in failed.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen flex">

        {/* ════ LEFT PANEL ════ */}
        <div className="hidden lg:flex w-[45%] hero-gradient relative flex-col items-center justify-center p-14 overflow-hidden">
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
          {/* Glow */}
          <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-blue-500/25 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-indigo-400/20 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 max-w-md w-full space-y-10">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <img src={myLogo} alt="AwamAssist" className="h-12 w-12 rounded-full object-cover ring-2 ring-white/20 shadow-xl" />
              <div>
                <div className="text-white font-black text-xl tracking-tight">AwamAssist</div>
                <div className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Citizen Intelligence Platform</div>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white leading-tight tracking-tight">
                Your Future,<br />
                <span className="text-blue-300">Intelligently Guided.</span>
              </h2>
              <p className="text-white/60 font-medium leading-relaxed text-base">
                AI-powered recommendations tailored to your exact profile — from the right university to the right government benefit.
              </p>
            </div>

            {/* Module chips */}
            <div className="flex flex-wrap gap-2">
              {MODULE_BADGES.map(({ icon: Icon, label, color }) => (
                <div key={label} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border border-white/10 ${color}`}>
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </div>
              ))}
            </div>

            {/* Trust pills */}
            <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
              {[
                { icon: ShieldCheck, text: "End-to-end encrypted & private" },
                { icon: BrainCircuit, text: "AI matched to your exact profile" },
                { icon: Sparkles, text: "Free for every citizen" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-white/70" />
                  </div>
                  <span className="text-white/60 text-sm font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════ RIGHT PANEL ════ */}
        <div className="flex-1 flex flex-col bg-slate-50">
          {/* Top bar */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-white">
            <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-bold text-sm group">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to Home
            </Link>
            <div className="text-sm font-medium text-slate-400">
              No account?{" "}
              <Link to="/register" className="font-black text-primary hover:underline">Register free</Link>
            </div>
          </div>

          {/* Form area */}
          <div className="flex-1 flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-[420px] space-y-7 animate-fade-in-up">

              {/* Header */}
              <div className="text-center space-y-1.5">
                {/* Logo visible on mobile only */}
                <div className="flex lg:hidden justify-center mb-5">
                  <img src={myLogo} alt="AwamAssist" className="h-14 w-14 rounded-full object-cover shadow-lg ring-4 ring-white" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sign In</h1>
                <p className="text-slate-500 text-sm font-medium">Access your personalized dashboard</p>
              </div>

              {/* Card */}
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                <div className="p-7">
                  <form onSubmit={handleLogin} className="space-y-5">
                    {/* Email */}
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Email</Label>
                      <div className={`relative transition-all ${focusedField === 'email' ? 'ring-2 ring-primary/20 rounded-xl' : ''}`}>
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@example.com"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                          required
                          disabled={isLoading}
                          className={`h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-colors ${emailError ? 'border-red-400' : ''}`}
                        />
                      </div>
                      {emailError && <p className="text-red-500 text-[10px] font-bold">{emailError}</p>}
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Password</Label>
                        <Link to="/forgot-password" className="text-[10px] font-black text-primary hover:underline uppercase tracking-wider">
                          Forgot?
                        </Link>
                      </div>
                      <div className={`relative transition-all ${focusedField === 'password' ? 'ring-2 ring-primary/20 rounded-xl' : ''}`}>
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          onFocus={() => setFocusedField('password')}
                          onBlur={() => setFocusedField(null)}
                          required
                          disabled={isLoading}
                          className={`h-12 rounded-xl pr-12 border-slate-200 bg-slate-50/50 focus:bg-white transition-colors ${passwordError ? 'border-red-400' : ''}`}
                        />
                        <button
                          type="button"
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                      {passwordError && <p className="text-red-500 text-[10px] font-bold">{passwordError}</p>}
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={!isFormValid || isLoading}
                      className="w-full h-12 rounded-xl bg-primary text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      style={{ boxShadow: '0 6px 20px hsl(var(--primary) / 0.30)' }}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Signing in…
                        </div>
                      ) : (
                        <>Sign In to Platform <ArrowRight className="w-4 h-4" /></>
                      )}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100" /></div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">or continue with</span>
                    </div>
                  </div>

                  {/* Google */}
                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast({ title: "Google login failed", variant: "destructive" })}
                      shape="pill" theme="outline" size="large" width="340px"
                    />
                  </div>
                </div>

                {/* Card footer */}
                <div className="px-7 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center">
                  <p className="text-xs text-slate-400 font-medium text-center">
                    Don't have an account?{" "}
                    <Link to="/register" className="font-black text-primary hover:underline">Create one free</Link>
                  </p>
                </div>
              </div>

              {/* Admin link */}
              <div className="text-center">
                <Link to="/admin/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin / Staff Portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}