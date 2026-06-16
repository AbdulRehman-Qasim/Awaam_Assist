import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MarketingLayout from '@/layouts/MarketingLayout';
import {
  GraduationCap,
  Building2,
  Heart,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Shield,
  Scale,
  BookOpen,
  Users,
  Award,
  BrainCircuit,
  MapPin,
  ChevronRight,
  Star,
} from 'lucide-react';

/* ─── HERO STAT ─── */
const Stat = ({ icon: Icon, value, label }: { icon: any; value: string; label: string }) => (
  <div className="flex flex-col items-center gap-1 group sm:gap-1.5">
    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/12 border border-white/20 flex items-center justify-center shadow-lg shadow-blue-950/10 group-hover:bg-white/20 transition-colors">
      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-100" />
    </div>
    <div className="text-xl sm:text-2xl font-black text-white">{value}</div>
    <div className="text-[9px] sm:text-[11px] font-bold text-white/60 uppercase tracking-wider">{label}</div>
  </div>
);

/* ─── SERVICE CARD ─── */
const ServiceCard = ({
  icon: Icon,
  iconBg,
  iconColor,
  badge,
  badgeColor,
  title,
  description,
  features,
  ctaText,
  ctaTo,
  ctaColor,
}: any) => (
  <div className="ds-card-hover group flex flex-col h-full">
    <div className="flex items-start justify-between mb-5">
      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${badgeColor}`}>
        {badge}
      </span>
    </div>

    <h3 className="text-lg font-black text-slate-900 mb-1.5">{title}</h3>
    <p className="text-sm text-slate-500 font-medium mb-5 leading-relaxed">{description}</p>

    <ul className="space-y-2.5 mb-6 flex-1">
      {features.map((f: string) => (
        <li key={f} className="flex items-center gap-2.5">
          <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${iconColor}`} />
          <span className="text-xs text-slate-600 font-medium">{f}</span>
        </li>
      ))}
    </ul>

    <Link to={ctaTo}>
      <button className={`w-full h-10 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm ${ctaColor}`}>
        {ctaText}
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </Link>
  </div>
);

/* ─── FEATURE TILE ─── */
const Feature = ({ icon: Icon, title, description }: any) => (
  <div className="flex gap-4 group">
    <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors mt-0.5">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <div>
      <h4 className="font-black text-slate-900 mb-1">{title}</h4>
      <p className="text-sm text-slate-500 font-medium leading-relaxed">{description}</p>
    </div>
  </div>
);

const PremiumFeature = ({ icon: Icon, title, description, accent = "bg-gradient-to-br from-blue-600 to-cyan-500" }: any) => (
  <div className="group relative overflow-hidden rounded-2xl border border-white/70 bg-white p-5 shadow-lg shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-100/70">
    <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
    <div className="flex items-start gap-4">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${accent} text-white shadow-lg transition-transform duration-300 group-hover:scale-105`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h4 className="mb-1.5 text-base font-black text-slate-950">{title}</h4>
        <p className="text-sm font-medium leading-relaxed text-slate-500">{description}</p>
      </div>
    </div>
  </div>
);

/* ─── STEP ─── */
const Step = ({ number, color, title, description }: any) => (
  <div className="flex gap-4">
    <div className={`w-10 h-10 rounded-xl ${color} text-white font-black text-base flex items-center justify-center flex-shrink-0 shadow-md`}>
      {number}
    </div>
    <div>
      <h4 className="font-black text-slate-900 mb-1">{title}</h4>
      <p className="text-sm text-slate-500 font-medium leading-relaxed">{description}</p>
    </div>
  </div>
);

const ProcessStep = ({ icon: Icon, title, description, accent, showArrow = false }: any) => (
  <div className="group relative rounded-3xl border border-white/70 bg-white p-5 shadow-lg shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-100/80">
    {showArrow && (
      <>
        <div className="pointer-events-none absolute -right-5 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-200/80 lg:flex">
          <ArrowRight className="h-4 w-4" />
        </div>
        <div className="pointer-events-none absolute -bottom-5 left-1/2 z-20 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-white bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-200/80 md:hidden">
          <ArrowRight className="h-4 w-4 rotate-90" />
        </div>
      </>
    )}
    <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${accent} text-white shadow-lg transition-transform duration-300 group-hover:scale-105`}>
      <Icon className="h-5 w-5" />
    </div>
    <h4 className="mb-2 text-lg font-black text-slate-950">{title}</h4>
    <p className="text-sm font-medium leading-relaxed text-slate-500">{description}</p>
  </div>
);

/* ─── TRUST BADGE ─── */
const TrustBadge = ({ icon: Icon, text }: any) => (
  <div className="flex items-center gap-2 text-white/70">
    <Icon className="w-4 h-4 text-white/50" />
    <span className="text-xs font-bold">{text}</span>
  </div>
);

/* ═══════════════════════════════════════════
   LANDING PAGE
═══════════════════════════════════════════ */
const LandingPage = () => {
  const [tick, setTick] = useState(0);
  const headlines = [
    "Find Your University",
    "Discover Government Aid",
    "Access Healthcare",
  ];

  useEffect(() => {
    const t = setInterval(() => setTick(p => (p + 1) % headlines.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <MarketingLayout>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden min-h-[calc(100svh-4rem)] flex items-center bg-[radial-gradient(circle_at_18%_20%,rgba(56,189,248,0.28),transparent_28%),radial-gradient(circle_at_82%_30%,rgba(16,185,129,0.22),transparent_26%),linear-gradient(135deg,#071a3f_0%,#1236a3_42%,#2563eb_72%,#0891b2_100%)]">

        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.55) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.55) 1px,transparent 1px)', backgroundSize: '52px 52px' }} />

        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-cyan-300/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-emerald-300/16 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 h-40 w-[42rem] -translate-x-1/2 bg-blue-300/10 blur-[90px] pointer-events-none" />

        <div className="page-container relative z-10 py-5 sm:py-10 lg:py-16 w-full">
          <div className="max-w-4xl mx-auto text-center">

            {/* Label */}
            <div className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-cyan-100/25 bg-white/12 px-3 py-1.5 mb-3 sm:mb-6 shadow-lg shadow-blue-950/10 backdrop-blur-md">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-200 animate-pulse" />
              <span className="text-[9px] sm:text-[11px] font-black text-white/80 uppercase tracking-wider sm:tracking-widest">
                Pakistan's Citizen Intelligence Platform
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-1.5 sm:mb-3 leading-none tracking-tight drop-shadow-[0_14px_34px_rgba(7,26,63,0.28)]">
              AwamAssist
            </h1>

            {/* Animated sub-headline */}
            <div className="h-8 sm:h-12 flex items-center justify-center mb-3 sm:mb-5 overflow-hidden">
              <p key={tick} className="text-lg sm:text-2xl font-bold text-cyan-100 animate-fade-in-up">
                {headlines[tick]}
              </p>
            </div>

            <p className="text-sm sm:text-lg text-white font-semibold max-w-2xl mx-auto mb-5 sm:mb-9 leading-relaxed">
              AI-powered personalized recommendations for universities, government schemes,
              and healthcare — built for every Pakistani citizen.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center mb-5 sm:mb-10 lg:mb-12">
              <Link to="/login">
                <button className="inline-flex h-11 sm:h-12 items-center justify-center gap-2 rounded-xl bg-white px-7 sm:px-8 text-sm font-black text-blue-700 shadow-xl shadow-blue-950/20 transition-all hover:-translate-y-0.5 hover:bg-cyan-50 active:scale-[0.98]">
                  Get Started Free
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
              <a href="#services">
                <button className="inline-flex h-11 sm:h-12 items-center justify-center gap-2 rounded-xl border border-cyan-100/25 bg-white/10 px-7 sm:px-8 text-sm font-black text-white shadow-lg shadow-blue-950/10 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/18 active:scale-[0.98]">
                  Explore Services
                </button>
              </a>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-2 sm:gap-8 max-w-2xl mx-auto rounded-2xl sm:rounded-3xl border border-white/12 bg-white/8 px-3 py-3 sm:px-5 sm:py-5 shadow-xl shadow-blue-950/10 backdrop-blur-md">
              <Stat icon={BookOpen}  value="200+" label="Universities" />
              <Stat icon={Building2} value="100+" label="Schemes" />
              <Stat icon={Users}     value="50K+"  label="Citizens" />
              <Stat icon={MapPin}    value="15+"   label="Cities" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section id="services" className="section scroll-mt-20 bg-[radial-gradient(circle_at_12%_8%,rgba(37,99,235,0.08),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(6,182,212,0.1),transparent_24%),#f3f5fa]">
        <div className="page-container">
          <div className="text-center mb-14">
            <div className="section-label">
              <BrainCircuit className="w-3.5 h-3.5" />
              Intelligence Modules
            </div>
            <h2 className="section-title">Your Assistance, Categorized</h2>
            <p className="section-subtitle">
              Three specialized modules powered by AI — each designed to deliver precise, actionable information.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ServiceCard
              icon={GraduationCap}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              badge="Education"
              badgeColor="text-blue-700 bg-blue-50 border-blue-100"
              title="University Matching"
              description="AI ranks universities based on your marks, city, and discipline — so you apply to the right place."
              features={[
                "Merit-based university search",
                "Eligibility checker (marks / budget)",
                "Compare up to 3 institutions",
              ]}
              ctaText="Explore Universities"
              ctaTo="/login"
              ctaColor="bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
            />

            <ServiceCard
              icon={Building2}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              badge="Government"
              badgeColor="text-emerald-700 bg-emerald-50 border-emerald-100"
              title="Citizen Benefits"
              description="Discover government schemes and grants you're actually eligible for — income checked, province filtered."
              features={[
                "Income-based eligibility filter",
                "Province-wise scheme discovery",
                "Compare schemes side-by-side",
              ]}
              ctaText="Find Schemes"
              ctaTo="/login"
              ctaColor="bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200"
            />

            <ServiceCard
              icon={Heart}
              iconBg="bg-rose-50"
              iconColor="text-rose-600"
              badge="Healthcare"
              badgeColor="text-rose-700 bg-rose-50 border-rose-100"
              title="Healthcare Access"
              description="Find and compare hospitals and clinics near you — sorted by specialty, category, and availability."
              features={[
                "Search hospitals by specialty",
                "Filter by public / private / NGO",
                "Location-aware medical mapping",
              ]}
              ctaText="Search Hospitals"
              ctaTo="/login"
              ctaColor="bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200"
            />
          </div>
        </div>
      </section>

      {/* ─── WHY AWAMASSIST ─── */}
      <section className="section relative overflow-hidden bg-[radial-gradient(circle_at_12%_18%,rgba(37,99,235,0.08),transparent_30%),radial-gradient(circle_at_88%_30%,rgba(6,182,212,0.1),transparent_28%),#ffffff]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">

            {/* Left: Features grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
              <PremiumFeature
                icon={Sparkles}
                title="AI-Powered Ranking"
                description="Recommendations scored by location, marks, income, and interests — not generic lists."
              />
              <PremiumFeature
                icon={Shield}
                title="Eligibility Checked"
                description="Each result is pre-filtered to match your actual profile. No irrelevant results."
              />
              <PremiumFeature
                icon={Scale}
                title="Side-by-Side Compare"
                description="Compare multiple universities, schemes, or hospitals before making decisions."
              />
              <PremiumFeature
                icon={Award}
                title="Transparent Scoring"
                description="Every recommendation shows a match %, ranked factors, and why it was chosen."
              />
            </div>

            {/* Right: Headline */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-blue-100/70 via-cyan-50/60 to-emerald-50/70 blur-2xl" />
              <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/85 p-6 sm:p-8 shadow-2xl shadow-blue-100/70 backdrop-blur">
                <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-gradient-to-br from-blue-500/12 to-cyan-400/12" />
              <div className="section-label">
                <Star className="w-3.5 h-3.5" />
                Why AwamAssist
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 leading-tight">
                Built for the average Pakistani citizen — not just tech users.
              </h2>
              <p className="mt-5 text-slate-600 font-medium leading-relaxed">
                Most platforms overwhelm you with raw data. AwamAssist does the heavy lifting —
                analyzing your profile, running eligibility checks, and surfacing only what is
                genuinely relevant to you.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3 border-y border-slate-100 py-4">
                <div>
                  <div className="text-lg font-black text-blue-700">Smart</div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Matching</div>
                </div>
                <div>
                  <div className="text-lg font-black text-cyan-700">Clear</div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Reasons</div>
                </div>
                <div>
                  <div className="text-lg font-black text-emerald-700">Useful</div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Results</div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <Link to="/login">
                  <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 text-sm font-black text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-400/25 active:scale-[0.98]">
                    Try It Now
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link to="/about">
                  <button className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-black text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 hover:shadow-md active:scale-[0.98]">
                    Learn More
                  </button>
                </Link>
              </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="section relative overflow-hidden bg-[radial-gradient(circle_at_10%_10%,rgba(16,185,129,0.08),transparent_28%),radial-gradient(circle_at_90%_20%,rgba(37,99,235,0.1),transparent_30%),#f3f5fa]">
        <div className="absolute inset-x-0 top-1/2 hidden h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent lg:block" />
        <div className="page-container">
          <div className="text-center mb-14">
            <div className="section-label">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Process
            </div>
            <h2 className="section-title">Up and running in 4 steps</h2>
            <p className="section-subtitle">
              No complicated onboarding. Just your city, marks, and interests.
            </p>
          </div>

          <div className="relative mx-auto max-w-6xl">
            <div className="absolute left-1/2 top-12 hidden h-[calc(100%-6rem)] w-px -translate-x-1/2 bg-gradient-to-b from-blue-200 via-cyan-200 to-emerald-200 lg:block" />
            <div className="grid grid-cols-1 gap-7 md:grid-cols-2 md:gap-5 lg:grid-cols-4">
              <ProcessStep
              icon={GraduationCap}
              title="Choose Your Category"
              description="Pick Education, Government Schemes, or Healthcare based on what you need today."
              accent="bg-gradient-to-br from-blue-600 to-cyan-500"
              showArrow
            />
              <ProcessStep
              icon={Users}
              title="Build Your Profile"
              description="Enter your city, marks, income level, and interests. Takes under 2 minutes."
              accent="bg-gradient-to-br from-emerald-500 to-cyan-500"
              showArrow
            />
              <ProcessStep
              icon={BrainCircuit}
              title="Receive AI Recommendations"
              description="Our engine scores and ranks opportunities against your exact profile context."
              accent="bg-gradient-to-br from-indigo-600 to-blue-500"
              showArrow
            />
              <ProcessStep
              icon={Scale}
              title="Compare & Decide"
              description="Review match accuracy, eligibility reasons, and apply directly from the platform."
              accent="bg-gradient-to-br from-violet-600 to-blue-500"
            />
            </div>
            <div className="mt-8 rounded-3xl border border-white/70 bg-white/70 p-4 text-center shadow-lg shadow-blue-100/50 backdrop-blur">
              <p className="text-sm font-bold text-slate-600">
                From profile to practical options in minutes, with every recommendation explained clearly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.24),transparent_26%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.18),transparent_28%),linear-gradient(135deg,#071a3f_0%,#1236a3_48%,#0891b2_100%)]">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.8) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="page-container py-20 relative z-10">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 glass-dark rounded-full px-4 py-2">
              <BrainCircuit className="w-4 h-4 text-blue-300" />
              <span className="text-[11px] font-black text-white/80 uppercase tracking-widest">Free for All Citizens</span>
            </div>
            <h2 className="text-4xl font-black text-white leading-tight">
              Your opportunities are waiting. Let's find them.
            </h2>
            <p className="text-white/60 font-medium">
              Join thousands of Pakistanis who use AwamAssist to make smarter decisions about education, government benefits, and healthcare.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link to="/login">
                <button className="btn-primary bg-white !text-primary hover:bg-slate-50 shadow-xl">
                  Start For Free
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
              <Link to="/login">
                <button className="glass-dark btn-secondary border-white/20 !text-white hover:bg-white/20">
                  Find Opportunities
                </button>
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap justify-center gap-6 pt-6 border-t border-white/10">
              <TrustBadge icon={Shield}       text="Privacy Protected" />
              <TrustBadge icon={CheckCircle2} text="No Registration Required to Browse" />
              <TrustBadge icon={Sparkles}     text="AI-Powered Matching" />
            </div>
          </div>
        </div>
      </section>

    </MarketingLayout>
  );
};

export default LandingPage;
