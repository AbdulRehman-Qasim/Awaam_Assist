import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Building2,
  LogOut,
  Menu,
  X,
  Shield,
  Calendar,
} from 'lucide-react';

const HospitalAdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [admin, setAdmin] = useState(() => JSON.parse(localStorage.getItem('admin') || '{}'));

  useEffect(() => {
    const handleUpdate = () => {
      setAdmin(JSON.parse(localStorage.getItem('admin') || '{}'));
    };
    window.addEventListener('admin-update', handleUpdate);
    return () => window.removeEventListener('admin-update', handleUpdate);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminModule');
    navigate('/admin/login?module=hospital');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/hospital/dashboard' },
    { icon: Building2, label: 'Hospital Management', path: '/admin/hospital/hospitals' },
    { icon: Calendar, label: 'Appointments', path: '/admin/hospital/appointments' },
    { icon: Shield, label: 'Settings', path: '/admin/hospital/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">Hospital Admin</h1>
                <p className="text-xs text-gray-500">Hospitals Directory Portal</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{admin.name || 'Admin'}</p>
              <p className="text-xs text-gray-500">{admin.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-65px)]">
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={active ? 'secondary' : 'ghost'}
                    className={`w-full justify-start ${
                      active
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg">
              <Shield className="h-5 w-5 text-emerald-700" />
              <div>
                <p className="text-xs font-medium text-gray-900">Hospital Admin</p>
                <p className="text-xs text-gray-500">Role Access Enabled</p>
              </div>
            </div>
          </div>
        </aside>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
            <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900">Hospital Admin</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="p-4 space-y-1">
                {navItems.map((item) => {
                  const active = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} to={item.path} onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant={active ? 'secondary' : 'ghost'}
                        className={`w-full justify-start ${active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'}`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default HospitalAdminLayout;
