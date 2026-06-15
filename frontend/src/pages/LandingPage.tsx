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
  <div className="flex flex-col items-center gap-1.5 group">
    <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center group-hover:bg-white/20 transition-colors">
      <Icon className="w-5 h-5 text-white/80" />
    </div>
    <div className="text-2xl font-black text-white">{value}</div>
    <div className="text-[11px] font-bold text-white/60 uppercase tracking-wider">{label}</div>
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
      <section className="relative overflow-hidden hero-gradient min-h-[calc(100svh-4rem)] flex items-center">

        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="page-container relative z-10 py-10 sm:py-14 lg:py-16 w-full">
          <div className="max-w-4xl mx-auto text-center">

            {/* Label */}
            <div className="inline-flex items-center gap-2 glass-dark rounded-full px-4 py-2 mb-5 sm:mb-6">
              <Sparkles className="w-3.5 h-3.5 text-blue-300 animate-pulse" />
              <span className="text-[11px] font-black text-white/80 uppercase tracking-widest">
                Pakistan's Citizen Intelligence Platform
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-2 sm:mb-3 leading-none tracking-tight">
              AwamAssist
            </h1>

            {/* Animated sub-headline */}
            <div className="h-10 sm:h-12 flex items-center justify-center mb-4 sm:mb-5 overflow-hidden">
              <p key={tick} className="text-xl sm:text-2xl font-bold text-blue-300 animate-fade-in-up">
                {headlines[tick]}
              </p>
            </div>

            <p className="text-sm sm:text-lg text-white/70 font-medium max-w-2xl mx-auto mb-7 sm:mb-9 leading-relaxed">
              AI-powered personalized recommendations for universities, government schemes,
              and healthcare — built for every Pakistani citizen.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8 sm:mb-10 lg:mb-12">
              <Link to="/login">
                <button className="btn-primary text-sm px-8 h-12 shadow-lg shadow-primary/30">
                  Get Started Free
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
              <a href="#services">
                <button className="btn-secondary h-12 px-8 text-sm bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Explore Services
                </button>
              </a>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-8 max-w-2xl mx-auto border-t border-white/10 pt-6 sm:pt-8">
              <Stat icon={BookOpen}  value="200+" label="Universities" />
              <Stat icon={Building2} value="100+" label="Schemes" />
              <Stat icon={Users}     value="50K+"  label="Citizens" />
              <Stat icon={MapPin}    value="15+"   label="Cities" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section id="services" className="section bg-background scroll-mt-20">
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
      <section className="section bg-white">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: Features grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Feature
                icon={Sparkles}
                title="AI-Powered Ranking"
                description="Recommendations scored by location, marks, income, and interests — not generic lists."
              />
              <Feature
                icon={Shield}
                title="Eligibility Checked"
                description="Each result is pre-filtered to match your actual profile. No irrelevant results."
              />
              <Feature
                icon={Scale}
                title="Side-by-Side Compare"
                description="Compare multiple universities, schemes, or hospitals before making decisions."
              />
              <Feature
                icon={Award}
                title="Transparent Scoring"
                description="Every recommendation shows a match %, ranked factors, and why it was chosen."
              />
            </div>

            {/* Right: Headline */}
            <div className="space-y-6">
              <div className="section-label">
                <Star className="w-3.5 h-3.5" />
                Why AwamAssist
              </div>
              <h2 className="text-4xl font-black text-slate-900 leading-tight">
                Built for the average Pakistani citizen — not just tech users.
              </h2>
              <p className="text-slate-500 font-medium leading-relaxed">
                Most platforms overwhelm you with raw data. AwamAssist does the heavy lifting —
                analyzing your profile, running eligibility checks, and surfacing only what is
                genuinely relevant to you.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link to="/login">
                  <button className="btn-primary">
                    Try It Now
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link to="/about">
                  <button className="btn-secondary">
                    Learn More
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="section bg-background">
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

          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <Step number="1" color="bg-blue-600"
              title="Choose Your Category"
              description="Pick Education, Government Schemes, or Healthcare based on what you need today."
            />
            <Step number="2" color="bg-emerald-600"
              title="Build Your Profile"
              description="Enter your city, marks, income level, and interests. Takes under 2 minutes."
            />
            <Step number="3" color="bg-indigo-600"
              title="Receive AI Recommendations"
              description="Our engine scores and ranks opportunities against your exact profile context."
            />
            <Step number="4" color="bg-violet-600"
              title="Compare & Decide"
              description="Review match accuracy, eligibility reasons, and apply directly from the platform."
            />
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="hero-gradient relative overflow-hidden">
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
