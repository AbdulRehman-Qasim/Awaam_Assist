import { useState, useEffect, useMemo } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import Loading from '@/components/ui/loading';
import ChatWidget from '@/components/ChatWidget';
import { MODULE_CONFIG, CORE_MODULES } from '@/config/modules';
import myLogo from '@/assets/mylogo.png';

const CompanyLayout = () => {
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('Citizen');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const readModulesFromStorage = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const userData = parsed.data || {};
        setUserName(userData.student_name || userData.name || 'Citizen');
        const role = userData.role || parsed.userType || 'Citizen';
        setUserRole(role === 'student' ? 'Verified User' : role);
        setSelectedModules(userData.selectedModules || []);
      } catch (error) {
        console.error('Error reading stored user:', error);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    readModulesFromStorage();

    // Re-sync whenever dashboard saves new modules to localStorage
    const handleModulesUpdated = () => readModulesFromStorage();
    window.addEventListener('modulesUpdated', handleModulesUpdated);
    window.addEventListener('storage', handleModulesUpdated);

    return () => {
      window.removeEventListener('modulesUpdated', handleModulesUpdated);
      window.removeEventListener('storage', handleModulesUpdated);
    };
  }, []);

  /* Build navigation dynamically based on selected modules */
  const dynamicNavigation = useMemo(() => {
    const nav = [{ ...CORE_MODULES.dashboard }];
    selectedModules.forEach(moduleId => {
      const config = MODULE_CONFIG[moduleId];
      if (config) nav.push({ id: config.id, label: config.label, route: config.route, icon: config.icon, color: config.color });
    });
    nav.push({ ...CORE_MODULES.chatbot });
    return nav;
  }, [selectedModules]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast({ title: 'Logged out', description: 'You have been logged out successfully.' });
    navigate('/login');
  };

  if (loading) return <Loading message="Loading your workspace..." />;

  const initials = userName ? userName.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 30%, #f5f3ff 60%, #fdf4ff 100%)' }}>

      {/* ── TOP NAVBAR ─────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-border/70 shadow-[0_2px_20px_rgba(0,0,0,0.06)]'
            : 'bg-white/90 backdrop-blur-sm border-b border-border/40'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* LEFT: Logo */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-xl text-slate-500 hover:text-primary hover:bg-primary/8"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              <Link to="/company/dashboard" className="flex items-center gap-2.5 group">
                <div className="relative">
                  <img
                    src={myLogo}
                    alt="AwamAssist Logo"
                    className="h-10 w-10 rounded-full object-cover shadow-sm ring-2 ring-white transition-all group-hover:ring-primary/30"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-400 rounded-full border-2 border-white" />
                </div>
                <span className="text-xl font-black text-foreground tracking-tight hidden sm:block">
                  Awam<span className="text-primary">Assist</span>
                </span>
              </Link>
            </div>

            {/* CENTER: Navigation (Desktop) */}
            <nav className="hidden lg:flex items-center gap-1">
              {dynamicNavigation.map(item => {
                const isActive =
                  location.pathname === item.route ||
                  (item.id === 'dashboard' && location.pathname === '/company');
                return (
                  <Link
                    key={item.id}
                    to={item.route}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <item.icon
                      className={`h-4 w-4 ${isActive ? 'text-primary' : item.color}`}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* RIGHT: User */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end text-right">
                <span className="text-sm font-bold text-foreground leading-none">{userName}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
                  {userRole}
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full p-0 hover:ring-2 hover:ring-primary/20 transition-all"
                  >
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarFallback
                        className="font-black text-white text-sm"
                        style={{ background: 'linear-gradient(135deg, hsl(234 89% 54%), hsl(194 100% 43%))' }}
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-56 mt-2 rounded-2xl p-2 shadow-xl border border-border/50"
                >
                  <DropdownMenuLabel className="p-3 rounded-xl bg-primary/5">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-bold text-foreground">{userName}</p>
                      <p className="text-xs text-muted-foreground">{userRole}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer p-3 hover:bg-primary/8">
                    <Link to="/company/settings" className="flex items-center w-full gap-3">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-sm">Account Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="rounded-xl cursor-pointer p-3 text-rose-600 focus:bg-rose-50 focus:text-rose-600 gap-3"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="font-semibold text-sm">Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* ── MOBILE SIDEBAR ─────────────────────────────────────── */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside className="fixed top-0 left-0 bottom-0 w-80 bg-white shadow-2xl flex flex-col animate-slide-right">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <div className="flex items-center gap-3">
                <img
                  src={myLogo}
                  alt="AwamAssist Logo"
                  className="h-10 w-10 rounded-full object-cover shadow-sm ring-2 ring-slate-100"
                />
                <span className="text-xl font-black text-foreground">
                  Awam<span className="text-primary">Assist</span>
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(false)}
                className="rounded-xl hover:bg-slate-50"
              >
                <X className="h-5 w-5 text-slate-400" />
              </Button>
            </div>

            {/* User info */}
            <div className="mx-4 my-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-black text-sm"
                  style={{ background: 'linear-gradient(135deg, hsl(234 89% 54%), hsl(194 100% 43%))' }}>
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userRole}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] px-3 mb-3">
                Main Menu
              </p>
              {dynamicNavigation.map(item => {
                const isActive =
                  location.pathname === item.route ||
                  (item.id === 'dashboard' && location.pathname === '/company');
                return (
                  <Link
                    key={item.id}
                    to={item.route}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                      isActive
                        ? 'text-white shadow-lg shadow-primary/25'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    style={isActive ? { background: 'linear-gradient(135deg, hsl(234 89% 54%), hsl(234 89% 48%))' } : {}}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : item.color}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-border/50">
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full justify-start gap-3 text-rose-600 hover:bg-rose-50 hover:text-rose-700 h-12 rounded-2xl font-bold px-4"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* ── MAIN CONTENT ───────────────────────────────────────── */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      <ChatWidget />
    </div>
  );
};

export default CompanyLayout;
