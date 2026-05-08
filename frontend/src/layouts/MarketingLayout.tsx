import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import myLogo from '@/assets/mylogo.png';
import { Menu, X, ChevronRight, User, Shield } from 'lucide-react';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

type MarketingLayoutProps = { children: React.ReactNode };

const MarketingLayout = ({ children }: MarketingLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const NavLink = ({ to, label }: { to: string; label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={() => setMobileMenuOpen(false)}
        className={`text-sm font-bold transition-colors ${
          isActive ? 'text-primary' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="page-container">
          <div className="flex items-center justify-between h-16">

            {/* Logo — Real brand image */}
            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <img
                src={myLogo}
                alt="AwamAssist Logo"
                className="h-10 w-10 rounded-full object-cover shadow-sm ring-2 ring-slate-100 group-hover:ring-primary/30 transition-all"
              />
              <span className="text-base font-black text-slate-900 tracking-tight hidden sm:block">
                Awam<span className="text-primary">Assist</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map(n => <NavLink key={n.to} to={n.to} label={n.label} />)}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Admin Login — distinct secondary button */}
              <Link to="/admin/login">
                <button className="inline-flex items-center justify-center gap-1.5 px-4 h-9 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-100 border border-slate-200 transition-all">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  Admin
                </button>
              </Link>

              {/* Divider */}
              <div className="w-px h-5 bg-slate-200" />

              <Link to="/login">
                <button className="btn-ghost text-sm">
                  <User className="w-4 h-4" />
                  Sign In
                </button>
              </Link>
              <Link to="/register">
                <button className="btn-primary text-sm px-5 h-9">
                  Get Started
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 bg-white border-t border-slate-100 ${mobileMenuOpen ? 'max-h-96' : 'max-h-0'}`}>
          <div className="page-container py-4 flex flex-col gap-4">
            {NAV_LINKS.map(n => <NavLink key={n.to} to={n.to} label={n.label} />)}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <button className="btn-secondary w-full">
                  <User className="w-4 h-4" />
                  Citizen Sign In
                </button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <button className="btn-primary w-full">Get Started</button>
              </Link>
              <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full h-10 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
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
