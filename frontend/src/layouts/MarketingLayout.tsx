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
        className={`group relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold transition-all duration-200 ${
          isActive
            ? 'bg-primary text-white shadow-lg shadow-primary/20'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
        }`}
      >
        <Icon className={`h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary'}`} />
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 border-b border-white/70 bg-white/90 shadow-[0_10px_35px_-28px_rgba(15,23,42,0.55)] backdrop-blur-xl">
        <div className="page-container">
          <div className="flex items-center justify-between h-16">

            {/* Logo — Real brand image */}
            <Link to="/" className="group flex flex-shrink-0 items-center gap-3 rounded-full pr-3 transition-all hover:bg-slate-50">
              <span className="relative">
                <span className="absolute inset-0 rounded-full bg-primary/20 opacity-0 blur-md transition-opacity group-hover:opacity-100" />
                <img
                  src={myLogo}
                  alt="AwamAssist Logo"
                  className="relative h-11 w-11 rounded-full object-cover shadow-md ring-2 ring-white transition-all group-hover:ring-primary/30"
                />
              </span>
              <span className="hidden leading-tight sm:block">
                <span className="block text-base font-black tracking-tight text-slate-950">
                  Awam<span className="text-primary">Assist</span>
                </span>
                <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Citizen AI
                </span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden items-center gap-1 rounded-full border border-slate-200/80 bg-slate-50/80 p-1 lg:flex">
              {NAV_LINKS.map(n => <NavLink key={n.to} to={n.to} label={n.label} icon={n.icon} />)}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2.5">
              {/* Admin Login — distinct secondary button */}
              <Link to="/admin/login">
                <button className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:text-slate-950 hover:shadow-md">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  Admin
                </button>
              </Link>

              {/* Divider */}
              <div className="h-6 w-px bg-slate-200" />

              <Link to="/login">
                <button className="inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-extrabold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-950">
                  <User className="w-4 h-4" />
                  Sign In
                </button>
              </Link>
              <Link to="/register">
                <button className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-black text-white shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:bg-primary/95 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]">
                  Get Started
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition-all hover:bg-slate-50 lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`overflow-hidden border-t border-slate-100 bg-white/95 shadow-lg backdrop-blur-xl transition-all duration-300 lg:hidden ${mobileMenuOpen ? 'max-h-96' : 'max-h-0'}`}>
          <div className="page-container flex flex-col gap-3 py-4">
            <div className="grid gap-2">
              {NAV_LINKS.map(n => <NavLink key={n.to} to={n.to} label={n.label} icon={n.icon} />)}
            </div>
            <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white text-sm font-black text-slate-700 shadow-sm transition-all hover:bg-slate-50">
                  <User className="w-4 h-4" />
                  Citizen Sign In
                </button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-black text-white shadow-lg shadow-primary/25 transition-all active:scale-[0.98]">
                  Get Started
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
              <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)}>
                <button className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-200 text-sm font-black text-slate-600 transition-all hover:bg-slate-50">
                  <Shield className="w-4 h-4" />
                  Admin Login
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
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
