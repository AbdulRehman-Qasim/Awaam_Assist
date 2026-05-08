import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import myLogo from "@/assets/mylogo.png";
import {
  Eye, EyeOff, ArrowRight, CheckCircle2, Sparkles,
  GraduationCap, Building2, Heart, ChevronLeft, UserPlus
} from "lucide-react";

const GOOGLE_CLIENT_ID = "554055055478-rknhms5v8p9k3gcn7dmjo18r9tp1lqvi.apps.googleusercontent.com";

const BENEFITS = [
  { icon: GraduationCap, title: "University Matching", desc: "AI-ranked list based on your marks & city." },
  { icon: Building2,    title: "Government Schemes",  desc: "Find grants and benefits you qualify for." },
  { icon: Heart,        title: "Healthcare Access",    desc: "Locate hospitals and clinics near you." },
];

export default function RegisterPage() {
  const [studentName, setStudentName]     = useState("");
  const [studentEmail, setStudentEmail]   = useState("");
  const [password, setPassword]           = useState("");
  const [showPassword, setShowPassword]   = useState(false);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [emailError, setEmailError]       = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isFormValid, setIsFormValid]     = useState(false);
  const [focusedField, setFocusedField]   = useState<string | null>(null);
  const { toast }  = useToast();
  const navigate   = useNavigate();

  useEffect(() => {
    const isEmailValid    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail);
    const isPasswordValid = password.length >= 6;
    const isNameValid     = studentName.trim().length > 0;
    setEmailError(isEmailValid || studentEmail.length === 0 ? "" : "Please enter a valid email address");
    setPasswordError(isPasswordValid || password.length === 0 ? "" : "Password must be at least 6 characters");
    setIsFormValid(isEmailValid && isPasswordValid && isNameValid);
  }, [studentName, studentEmail, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitting(true);
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_name: studentName, student_email: studentEmail, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Registration error", description: data.message || "Something went wrong", variant: "destructive" });
      } else {
        if (data.data) localStorage.setItem("user", JSON.stringify({ userType: "student", token: data.token, data: data.data }));
        toast({ title: "Account created!", description: "Welcome to AwamAssist." });
        data.data?.onboardingCompleted ? navigate("/dashboard") : navigate("/complete-profile");
      }
    } catch {
      toast({ title: "Network error", description: "Could not reach the server.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credResp: any) => {
    setIsSubmitting(true);
    try {
      const decoded: any = jwtDecode(credResp.credential);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/google-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ google_token: credResp.credential, email: decoded.email, name: decoded.name, picture: decoded.picture, sub: decoded.sub }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Google error", description: data.message, variant: "destructive" });
      } else {
        localStorage.setItem("user", JSON.stringify({ userType: data.userType, token: data.token, data: data.data }));
        toast({ title: data.isExistingUser ? "Welcome back!" : "Account created!", description: "Signed in with Google." });
        data.data.onboardingCompleted ? navigate("/dashboard") : navigate("/complete-profile");
      }
    } catch {
      toast({ title: "Error", description: "Google sign-up failed.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* Password strength */
  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ["", "Weak", "Fair", "Strong"];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-emerald-500"];

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen flex">

        {/* ════ LEFT PANEL ════ */}
        <div className="hidden lg:flex w-[45%] hero-gradient relative flex-col items-center justify-center p-14 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-emerald-500/15 rounded-full blur-[110px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/3 w-60 h-60 bg-blue-400/20 rounded-full blur-[90px] pointer-events-none" />

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
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1.5">
                <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">Free Registration</span>
              </div>
              <h2 className="text-4xl font-black text-white leading-tight tracking-tight">
                One Account.<br />
                <span className="text-emerald-300">All Opportunities.</span>
              </h2>
              <p className="text-white/60 font-medium leading-relaxed">
                Create your profile once and let our AI surface the most relevant universities, schemes, and healthcare options for you.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              {BENEFITS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3 group">
                  <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/15 transition-colors mt-0.5">
                    <Icon className="w-4 h-4 text-white/70" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">{title}</div>
                    <div className="text-white/50 text-xs font-medium">{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-white/10">
              <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span className="text-white/50 text-xs font-bold">Completely free for all Pakistani citizens</span>
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
              Have an account?{" "}
              <Link to="/login" className="font-black text-primary hover:underline">Sign in</Link>
            </div>
          </div>

          {/* Form area */}
          <div className="flex-1 flex items-center justify-center px-6 py-10">
            <div className="w-full max-w-[420px] space-y-6 animate-fade-in-up">

              {/* Header */}
              <div className="text-center space-y-1.5">
                <div className="flex lg:hidden justify-center mb-5">
                  <img src={myLogo} alt="AwamAssist" className="h-14 w-14 rounded-full object-cover shadow-lg ring-4 ring-white" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Account</h1>
                <p className="text-slate-500 text-sm font-medium">Join Pakistan's citizen assistance platform</p>
              </div>

              {/* Card */}
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                <div className="p-7">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Full Name</Label>
                      <Input
                        id="studentName"
                        type="text"
                        placeholder="e.g. Ahmed Ali"
                        value={studentName}
                        onChange={e => setStudentName(e.target.value)}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        required
                        disabled={isSubmitting}
                        className={`h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-colors ${focusedField === 'name' ? 'ring-2 ring-primary/20' : ''}`}
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Email Address</Label>
                      <Input
                        id="studentEmail"
                        type="email"
                        placeholder="name@example.com"
                        value={studentEmail}
                        onChange={e => setStudentEmail(e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        required
                        disabled={isSubmitting}
                        className={`h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-colors ${emailError ? 'border-red-400' : ''} ${focusedField === 'email' ? 'ring-2 ring-primary/20' : ''}`}
                      />
                      {emailError && <p className="text-red-500 text-[10px] font-bold">{emailError}</p>}
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          onFocus={() => setFocusedField('pw')}
                          onBlur={() => setFocusedField(null)}
                          required
                          disabled={isSubmitting}
                          className={`h-12 rounded-xl pr-12 border-slate-200 bg-slate-50/50 focus:bg-white transition-colors ${passwordError ? 'border-red-400' : ''} ${focusedField === 'pw' ? 'ring-2 ring-primary/20' : ''}`}
                        />
                        <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                      {/* Strength bar */}
                      {password.length > 0 && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex gap-1 flex-1">
                            {[1,2,3].map(n => (
                              <div key={n} className={`h-1 flex-1 rounded-full transition-all duration-300 ${n <= strength ? strengthColor[strength] : 'bg-slate-100'}`} />
                            ))}
                          </div>
                          <span className={`text-[10px] font-black ${strength === 1 ? 'text-red-500' : strength === 2 ? 'text-amber-500' : 'text-emerald-600'}`}>
                            {strengthLabel[strength]}
                          </span>
                        </div>
                      )}
                      {passwordError && <p className="text-red-500 text-[10px] font-bold">{passwordError}</p>}
                    </div>

                    {/* Submit */}
                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={!isFormValid || isSubmitting}
                        className="w-full h-12 rounded-xl bg-primary text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        style={{ boxShadow: '0 6px 20px hsl(var(--primary) / 0.28)' }}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Creating account…
                          </div>
                        ) : (
                          <>Complete Registration <ArrowRight className="w-4 h-4" /></>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Divider */}
                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100" /></div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">or sign up with</span>
                    </div>
                  </div>

                  {/* Google */}
                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast({ title: "Google sign-up failed", variant: "destructive" })}
                      shape="pill" theme="outline" size="large" width="340px"
                    />
                  </div>
                </div>

                {/* Card footer */}
                <div className="px-7 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <p className="text-xs text-slate-400 font-medium">
                    Free forever · No credit card needed · 100% private
                  </p>
                </div>
              </div>

              {/* Sign-in link */}
              <div className="text-center">
                <p className="text-xs text-slate-400 font-medium">
                  Already registered?{" "}
                  <Link to="/login" className="font-black text-primary hover:underline">Sign in here</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
