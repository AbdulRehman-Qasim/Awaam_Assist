import { useState, useEffect, useMemo } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
  Home,
  FileText,
  Users,
  Calendar,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Activity,
  MessageSquare,
  LayoutDashboard
} from 'lucide-react';
import Loading from '@/components/ui/loading';
import ChatWidget from '@/components/ChatWidget';
import { MODULE_CONFIG, CORE_MODULES } from '@/config/modules';

const CompanyLayout = () => {
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('Citizen');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const userData = parsed.data || {};

        setUserName(userData.student_name || userData.name || 'Citizen');
        setUserRole(userData.role || parsed.userType || 'Citizen');

        // Load selected modules from user data
        setSelectedModules(userData.selectedModules || []);
      } catch (error) {
        console.error('Error reading stored user:', error);
      }
    }
    setLoading(false);
  }, []);

  // DYNAMIC NAVIGATION: Filter based on user selection
  const dynamicNavigation = useMemo(() => {
    const nav = [
      { ...CORE_MODULES.dashboard }
    ];

    // Add selected modules from MODULE_CONFIG
    selectedModules.forEach(moduleId => {
      const config = MODULE_CONFIG[moduleId];
      if (config) {
        nav.push({
          id: config.id,
          label: config.label,
          route: config.route,
          icon: config.icon,
          color: config.color
        });
      }
    });

    // Always add chatbot at the end
    nav.push({ ...CORE_MODULES.chatbot });

    return nav;
  }, [selectedModules]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast({
      title: 'Logout Successful',
      description: 'You have been logged out successfully.'
    });
    navigate('/login');
  };

  if (loading) {
    return <Loading message="Loading your workspace..." />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top horizontal navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 w-full shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side: Logo */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <Link to="/company/dashboard" className="flex items-center gap-2">
                <img src="/favicon.jpg" alt="Logo" className="h-9 w-9 rounded-full shadow-sm" />
                <span className="text-xl font-bold text-slate-900 tracking-tight hidden sm:block">
                  <span className="text-primary">AwamAssist</span>
                </span>
              </Link>
            </div>

            {/* Middle: Dynamic Navigation (Desktop Only) */}
            <nav className="hidden lg:flex items-center space-x-1">
              {dynamicNavigation.map((item) => {
                const isActive = 
                  location.pathname === item.route || 
                  (item.id === 'dashboard' && location.pathname === '/company');
                return (
                  <Link
                    key={item.id}
                    to={item.route}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                  >
                    <item.icon className={`h-4 w-4 ${isActive ? 'text-primary' : item.color}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right side: User Profile */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex flex-col items-end mr-1 text-right">
                <span className="text-sm font-bold text-slate-900 leading-none">{userName}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{userRole}</span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:ring-4 hover:ring-slate-50 transition-all">
                    <Avatar className="h-10 w-10 border border-slate-200 shadow-sm">
                      <AvatarFallback className="bg-primary text-white font-bold">
                        {userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl p-2 shadow-xl border-slate-100">
                  <DropdownMenuLabel className="p-3">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold text-slate-900">{userName}</p>
                      <p className="text-xs text-slate-500">{userRole}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer p-3">
                    <Link to="/company/settings" className="flex items-center w-full">
                      <Settings className="mr-3 h-4 w-4 text-slate-400" />
                      <span className="font-medium">Account Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="rounded-xl cursor-pointer p-3 text-rose-600 focus:bg-rose-50 focus:text-rose-600"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="font-medium">Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar (Mobile Only) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
          <aside className="fixed top-0 left-0 bottom-0 w-80 bg-white shadow-2xl p-6 flex flex-col animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-2">
                <img src="/favicon.jpg" alt="Logo" className="h-10 w-10 rounded-full" />
                <span className="text-xl font-bold text-slate-900">AwamAssist</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="rounded-full">
                <X className="h-5 w-5 text-slate-400" />
              </Button>
            </div>

            <nav className="space-y-2 flex-grow">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-4">Main Menu</div>
              {dynamicNavigation.map((item) => {
                const isActive = 
                  location.pathname === item.route || 
                  (item.id === 'dashboard' && location.pathname === '/company');
                return (
                  <Link
                    key={item.id}
                    to={item.route}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-bold transition-all ${isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : item.color}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-slate-100 pt-6">
              <Button onClick={handleLogout} variant="ghost" className="w-full justify-start gap-4 text-rose-600 hover:bg-rose-50 h-14 rounded-2xl font-bold px-4">
                <LogOut className="h-5 w-5" />
                Sign Out
              </Button>
            </div>
          </aside>
        </div>
      )}

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