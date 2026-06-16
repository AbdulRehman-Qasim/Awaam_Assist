import React from 'react';
import { Link } from 'react-router-dom';
import MarketingLayout from '@/layouts/MarketingLayout';
import {
  ArrowRight,
  Award,
  BrainCircuit,
  Building2,
  CheckCircle2,
  Eye,
  GraduationCap,
  Heart,
  MapPin,
  Scale,
  Shield,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';

const modules = [
  {
    icon: GraduationCap,
    title: 'Education Guidance',
    description: 'University matching, eligibility guidance, and practical comparisons for students.',
  },
  {
    icon: Building2,
    title: 'Government Benefits',
    description: 'Scheme discovery filtered by income, province, and citizen profile details.',
  },
  {
    icon: Heart,
    title: 'Healthcare Access',
    description: 'Hospital and service discovery by specialty, location, and category.',
  },
];

const values = [
  {
    icon: Users,
    title: 'Accessible by design',
    text: 'The experience is written and structured for everyday citizens, not only technical users.',
  },
  {
    icon: Shield,
    title: 'Trust before noise',
    text: 'AwamAssist prioritizes clear context, privacy-conscious flows, and relevant results.',
  },
  {
    icon: Scale,
    title: 'Transparent choices',
    text: 'Citizens can compare options and understand why something is recommended.',
  },
];

const stats = [
  ['200+', 'Universities'],
  ['100+', 'Schemes'],
  ['50K+', 'Citizens'],
  ['15+', 'Cities'],
];

const AboutPage = () => {
  return (
    <MarketingLayout>
      <section className="relative overflow-hidden bg-[#f6f9fc]">
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-blue-50 to-transparent" />
        <div className="page-container relative py-14 sm:py-20">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">About AwamAssist</span>
              </div>
              <h1 className="max-w-3xl text-4xl font-black leading-tight text-slate-950 sm:text-6xl">
                We turn public information into useful citizen guidance.
              </h1>
              <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-600 sm:text-lg">
                AwamAssist is built for Pakistanis who need a simpler way to understand education options, public schemes, and healthcare access without digging through scattered information.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link to="/login">
                  <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 text-sm font-black text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 active:scale-[0.98]">
                    Start Exploring
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link to="/contact">
                  <button className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-black text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:text-blue-700 active:scale-[0.98]">
                    Contact Us
                  </button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-blue-100 via-cyan-50 to-emerald-50 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white bg-white p-5 shadow-2xl shadow-blue-100/70">
                <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Platform focus</p>
                    <h2 className="text-xl font-black text-slate-950">Citizen Intelligence</h2>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                    <BrainCircuit className="h-6 w-6" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {stats.map(([value, label]) => (
                    <div key={label} className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-2xl font-black text-blue-700">{value}</div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-4 text-white">
                  <p className="text-sm font-bold leading-relaxed">
                    Built to reduce confusion and help citizens move from search to decision faster.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="page-container">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="section-label">
                <Target className="h-3.5 w-3.5" />
                Why it exists
              </div>
              <h2 className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
                The problem is not lack of data. It is lack of clarity.
              </h2>
            </div>

            <div className="space-y-4 border-l border-slate-200 pl-6">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <h3 className="font-black text-slate-950">Our Mission</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
                  To democratize access to education, public assistance, and healthcare information so every citizen can make confident, informed decisions.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <h3 className="font-black text-slate-950">Our Vision</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
                  A Pakistan where opportunity is easier to find, eligibility is easier to understand, and helpful services are easier to access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f3f7fb] py-16 sm:py-20">
        <div className="page-container">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="section-label">
                <MapPin className="h-3.5 w-3.5" />
                What it covers
              </div>
              <h2 className="text-3xl font-black text-slate-950">Practical help across daily decisions.</h2>
            </div>
            <p className="max-w-xl text-sm font-medium leading-relaxed text-slate-500">
              The platform connects three public-service areas through one citizen profile and one recommendation experience.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {modules.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-2xl border border-white bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100/60">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-black text-slate-950">{title}</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="page-container">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-2xl shadow-slate-300/60">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <Award className="h-6 w-6 text-cyan-200" />
              </div>
              <h2 className="text-3xl font-black leading-tight">Designed around citizen dignity.</h2>
              <p className="mt-4 text-sm font-medium leading-relaxed text-white/65">
                AwamAssist should feel calm, respectful, and useful. The goal is not to overwhelm people with lists, but to help them understand what fits their profile.
              </p>
            </div>

            <div className="space-y-4">
              {values.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-950">{title}</h3>
                    <p className="mt-1 text-sm font-medium leading-relaxed text-slate-500">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f6f9fc] py-14">
        <div className="page-container">
          <div className="rounded-[2rem] border border-white bg-white p-6 shadow-xl shadow-blue-100/50 sm:p-8">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Made for Pakistan
                </div>
                <h2 className="text-2xl font-black text-slate-950">Find what fits your life, not just what exists online.</h2>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-slate-500">
                  Start with your profile and let AwamAssist surface the opportunities, benefits, and services that matter.
                </p>
              </div>
              <Link to="/login">
                <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 text-sm font-black text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 active:scale-[0.98]">
                  Start Exploring
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default AboutPage;
