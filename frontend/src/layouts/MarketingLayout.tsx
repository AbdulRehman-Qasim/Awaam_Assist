import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import myLogo from '@/assets/mylogo.png';
import { Menu, X, ChevronRight, User, Shield, Home, Info, Mail } from 'lucide-react';

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/about', label: 'About', icon: Info },
  { to: '/contact', label: 'Contact', icon: Mail },
];

type MarketingLayoutProps = { children: React.ReactNode };

const MarketingLayout = ({ children }: MarketingLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const NavLink = ({ to, label, icon: Icon }: { to: string; label: string; icon: any }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={() => setMobileMenuOpen(false)}
        className={`group relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold transition-all duration-300 ${
          isActive
            ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-600/25'
            : 'text-slate-600 hover:-translate-y-0.5 hover:bg-white hover:text-slate-950 hover:shadow-sm'
        }`}
      >
        <Icon className={`h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary'}`} />
        {label}
      </Link>
    );
  };

  const MobileNavLink = ({ to, label, icon: Icon }: { to: string; label: string; icon: any }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={() => setMobileMenuOpen(false)}
        className={`group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-black transition-all duration-200 max-[360px]:gap-2 max-[360px]:px-2.5 max-[360px]:py-2 max-[360px]:text-xs ${
          isActive
            ? 'bg-white text-blue-700 shadow-lg shadow-blue-950/10'
            : 'text-white/80 hover:bg-white/12 hover:text-white'
        }`}
      >
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all max-[360px]:h-8 max-[360px]:w-8 ${
          isActive
            ? 'bg-blue-50 text-blue-700'
            : 'bg-white/10 text-cyan-100 group-hover:bg-white/16'
        }`}>
          <Icon className="h-[18px] w-[18px] max-[360px]:h-4 max-[360px]:w-4" />
        </span>
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 border-b border-white/70 bg-white/80 shadow-[0_14px_40px_-30px_rgba(15,23,42,0.65)] backdrop-blur-2xl supports-[backdrop-filter]:bg-white/72">
        <div className="page-container">
          <div className="flex h-16 items-center justify-between">

            {/* Logo — Real brand image */}
            <Link to="/" className="group order-2 flex flex-shrink-0 items-center gap-3 rounded-full pl-3 transition-all duration-300 hover:bg-white/75 hover:shadow-sm lg:order-1 lg:pl-0 lg:pr-3">
              <span className="relative">
                <span className="absolute inset-0 rounded-full bg-primary/20 opacity-0 blur-md transition-opacity group-hover:opacity-100" />
                <img
                  src={myLogo}
                  alt="AwamAssist Logo"
                  className="relative h-12 w-12 rounded-full object-cover shadow-md ring-2 ring-white transition-all group-hover:scale-105 group-hover:ring-primary/30 lg:h-[52px] lg:w-[52px]"
                />
              </span>
              <span className="hidden leading-tight lg:block">
                <span className="block text-base font-black tracking-tight text-slate-950">
                  Awam<span className="text-primary">Assist</span>
                </span>
                <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Citizen AI
                </span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="order-2 hidden items-center gap-1 rounded-full border border-white/80 bg-white/55 p-1 shadow-inner shadow-slate-200/50 backdrop-blur-xl lg:flex">
              {NAV_LINKS.map(n => <NavLink key={n.to} to={n.to} label={n.label} icon={n.icon} />)}
            </nav>

            {/* Desktop Actions */}
            <div className="order-3 hidden lg:flex items-center gap-2.5">
              {/* Admin Login — distinct secondary button */}
              <Link to="/admin/login">
                <button className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-slate-200/80 bg-white/75 px-4 text-xs font-black text-slate-600 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:text-slate-950 hover:shadow-md">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  Admin
                </button>
              </Link>

              {/* Divider */}
              <div className="h-6 w-px bg-slate-200" />

              <Link to="/login">
                <button className="inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-extrabold text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-slate-950 hover:shadow-sm">
                  <User className="w-4 h-4" />
                  Sign In
                </button>
              </Link>
              <Link to="/register">
                <button className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-500 px-5 text-sm font-black text-white shadow-lg shadow-blue-600/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-500/25 active:scale-[0.98]">
                  Get Started
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              className="order-1 rounded-full border border-slate-200 bg-white/85 p-2 text-slate-600 shadow-sm backdrop-blur transition-all hover:bg-white lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

      </header>

      {/* ── MAIN CONTENT ── */}
      {/* Mobile Menu Slider */}
      <div
        className={`fixed inset-0 z-[70] overflow-hidden lg:hidden transition-all duration-300 ${
          mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        <button
          className={`absolute inset-0 bg-slate-950/55 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close navigation menu"
        />

        <aside
          className={`absolute left-0 top-0 box-border flex h-[100dvh] max-h-[100dvh] w-[min(88vw,360px)] max-w-[100vw] flex-col overflow-x-hidden overflow-y-auto overscroll-contain bg-[radial-gradient(circle_at_18%_12%,rgba(56,189,248,0.24),transparent_34%),radial-gradient(circle_at_88%_22%,rgba(16,185,129,0.18),transparent_30%),linear-gradient(160deg,#071a3f_0%,#1236a3_52%,#0891b2_100%)] pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-[env(safe-area-inset-top)] shadow-2xl shadow-slate-950/35 transition-[transform,opacity] duration-500 ease-out [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            mobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-[calc(100%+12px)] opacity-0'
          }`}
        >
          <div className="absolute inset-0 opacity-[0.08]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.55) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.55) 1px,transparent 1px)', backgroundSize: '38px 38px' }} />
          <div className="absolute right-0 top-16 h-48 w-48 rounded-full bg-cyan-200/20 blur-[70px]" />
          <div className="absolute bottom-0 left-8 h-44 w-44 rounded-full bg-emerald-200/14 blur-[70px]" />

          <div className="relative z-10 flex w-full shrink-0 items-center justify-between gap-2 border-b border-white/12 p-4 max-[360px]:p-3">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex min-w-0 items-center gap-2.5">
              <img
                src={myLogo}
                alt="AwamAssist Logo"
                className="h-10 w-10 shrink-0 rounded-full object-cover shadow-lg ring-2 ring-white/20 max-[360px]:h-9 max-[360px]:w-9"
              />
              <span className="min-w-0 overflow-hidden leading-tight">
                <span className="block truncate text-base font-black text-white max-[360px]:text-sm">AwamAssist</span>
                <span className="block truncate text-[9px] font-black uppercase tracking-[0.18em] text-cyan-100/80 max-[360px]:text-[8px]">Citizen AI</span>
              </span>
            </Link>
            <button
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/16 bg-white/10 text-white shadow-lg shadow-blue-950/10 transition-all hover:bg-white/18 max-[360px]:h-8 max-[360px]:w-8"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation menu"
            >
              <X className="h-[18px] w-[18px] max-[360px]:h-4 max-[360px]:w-4" />
            </button>
          </div>

          <nav className="relative z-10 min-h-0 flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden px-3 py-4 [scrollbar-width:none] max-[360px]:px-2.5 max-[360px]:py-3 [&::-webkit-scrollbar]:hidden">
            {NAV_LINKS.map(n => <MobileNavLink key={n.to} to={n.to} label={n.label} icon={n.icon} />)}
          </nav>

          <div className="relative z-10 shrink-0 space-y-3 border-t border-white/12 p-3 max-[360px]:space-y-2.5 max-[360px]:p-2.5">
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block">
              <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/16 bg-white/10 text-[13px] font-black text-white shadow-lg shadow-blue-950/10 backdrop-blur-md transition-all hover:bg-white/18 active:scale-[0.98] max-[360px]:h-9 max-[360px]:text-xs">
                <User className="w-4 h-4" />
                Citizen Sign In
              </button>
            </Link>
            <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block">
              <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-white text-[13px] font-black text-blue-700 shadow-xl shadow-blue-950/20 transition-all hover:bg-cyan-50 active:scale-[0.98] max-[360px]:h-9 max-[360px]:text-xs">
                Get Started
                <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
            <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)} className="block">
              <button className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/16 text-[13px] font-black text-cyan-50 transition-all hover:bg-white/12 active:scale-[0.98] max-[360px]:h-9 max-[360px]:text-xs">
                <Shield className="w-4 h-4" />
                Admin Login
              </button>
            </Link>
          </div>
        </aside>
      </div>

      <main className="flex-grow">{children}</main>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 text-white">
        <div className="page-container py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <img src={myLogo} alt="AwamAssist Logo" className="h-9 w-9 rounded-full object-cover ring-2 ring-white/10" />
                <span className="font-black text-white">Awam<span className="text-blue-400">Assist</span></span>
              </div>
              <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-xs">
                Pakistan's AI-powered citizen assistance platform for education, government schemes, and healthcare.
              </p>
            </div>

            {/* Platform Links */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Platform</h4>
              <ul className="space-y-2.5">
                {[
                  { to: '/about', label: 'About Us' },
                  { to: '/login', label: 'Student Portal' },
                  { to: '/admin/login', label: 'Admin Portal' },
                  { to: '/contact', label: 'Contact' },
                ].map(l => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm text-slate-400 hover:text-white font-medium transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Legal</h4>
              <ul className="space-y-2.5">
                {[
                  { to: '/privacy', label: 'Privacy Policy' },
                ].map(l => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm text-slate-400 hover:text-white font-medium transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-slate-500 font-medium">© 2025 AwamAssist. All rights reserved.</p>
            <p className="text-xs text-slate-600 font-medium">Simple · Private · Helpful</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketingLayout;
