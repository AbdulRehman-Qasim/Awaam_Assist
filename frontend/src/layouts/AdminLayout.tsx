
import { useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Building2,
    LogOut,
    Menu,
    X,
    Shield,
    GraduationCap,
    Settings,
} from "lucide-react";

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Get admin info from localStorage safely
    const admin = (() => {
        try {
            const saved = localStorage.getItem("admin");
            if (saved && saved !== "undefined") {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error("Error parsing admin data:", e);
        }
        return { name: "Admin", email: "admin@example.com" };
    })();

    const handleLogout = () => {
        localStorage.removeItem("admin");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminModule");
        navigate("/admin/login?module=education");
    };

    const isSuperAdmin = admin?.role === 'super_admin';

    const navItems = [
        {
            icon: LayoutDashboard,
            label: "Dashboard",
            path: "/admin/education/dashboard",
        },
        {
            icon: Building2,
            label: isSuperAdmin ? "University Management" : "University Profile",
            path: "/admin/education/companies",
        },
        {
            icon: Settings,
            label: "Settings",
            path: "/admin/education/settings",
        },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
                <div className="flex items-center justify-between px-4 py-3">
                    {/* Logo & Title */}
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </Button>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                                <GraduationCap className="h-6 w-6 text-white" />
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-lg font-bold text-gray-900">Education Admin</h1>
                                <p className="text-xs text-gray-500">Universities Directory Portal</p>
                            </div>
                        </div>
                    </div>

                    {/* Admin Info & Logout */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-medium text-gray-900">{admin.admin_name || admin.name || "Admin"}</p>
                            <p className="text-xs text-gray-500">{admin.admin_email || admin.email}</p>
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
                {/* Desktop Sidebar */}
                <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-65px)]">
                    <nav className="flex-1 p-4 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <Link key={item.path} to={item.path}>
                                    <Button
                                        variant={active ? "secondary" : "ghost"}
                                        className={`w-full justify-start ${active
                                                ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                                : "text-gray-700 hover:bg-gray-100"
                                            }`}
                                    >
                                        <Icon className="h-5 w-5 mr-3" />
                                        {item.label}
                                    </Button>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Admin Badge */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                            <Shield className="h-5 w-5 text-blue-700" />
                            <div>
                                <p className="text-xs font-medium text-gray-900">Education Admin</p>
                                <p className="text-xs text-gray-500">Full Access</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Mobile Sidebar */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-50 md:hidden">
                        <div
                            className="fixed inset-0 bg-black/50"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                                            <GraduationCap className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-bold text-gray-900">Education Admin</h2>
                                            <p className="text-xs text-gray-500">Portal</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>

                            <nav className="p-4 space-y-1">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.path);
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <Button
                                                variant={active ? "secondary" : "ghost"}
                                                className={`w-full justify-start ${active
                                                        ? "bg-blue-50 text-blue-700"
                                                        : "text-gray-700"
                                                    }`}
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

                {/* Main Content */}
                <main className="flex-1 p-6 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
