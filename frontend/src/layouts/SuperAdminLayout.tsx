import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LucideIcon } from "lucide-react";
import {
    BarChart3,
    Database,
    LayoutDashboard,
    LogOut,
    Menu,
    Settings,
    Shield,
    Users,
    X,
    Clock3,
    Bell,
    ChevronLeft,
    MessageSquare
} from "lucide-react";

type NavigationItem = {
    name: string;
    href?: string;
    icon: LucideIcon;
    danger?: boolean;
};

const SuperAdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const admin = JSON.parse(localStorage.getItem("admin") || "{}");

    const navigation: NavigationItem[] = [
        { name: "Dashboard", href: "/super-admin/dashboard", icon: LayoutDashboard },
        { name: "Manage Admins", href: "/super-admin/admins", icon: Users },
        { name: "Pending Approvals", href: "/super-admin/approvals", icon: Clock3 },
        { name: "All Data Overview", href: "/super-admin/data", icon: Database },
        { name: "Analytics", href: "/super-admin/analytics", icon: BarChart3 },
        { name: "Feedback Intelligence", href: "/super-admin/feedback", icon: MessageSquare },
        { name: "Settings", href: "/super-admin/settings", icon: Settings },
    ];

    const handleLogout = () => {
        localStorage.removeItem("admin");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminModule");
        navigate("/admin/login");
    };

    const activeItem = navigation.find((item) => item.href === location.pathname);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const NavItem = ({ item }: { item: NavigationItem }) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;

        return (
            <Link
                to={item.href || "#"}
                className={`group flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${isActive
                        ? "bg-primary-600 text-white shadow-lg shadow-primary-200"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    }`}
            >
                <Icon className={`h-5 w-5 transition-colors ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`} />
                <span className={`transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "md:opacity-0 md:w-0"}`}>
                    {item.name}
                </span>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* Desktop Sidebar */}
            <aside
                className={`hidden md:flex flex-col bg-white border-r border-slate-200 fixed inset-y-0 z-30 transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-64" : "w-20"
                    }`}
            >
                <div className="h-16 flex items-center px-6 border-b border-slate-100">
                    {/* Logo removed */}
                </div>

                <div className="flex-grow py-8 px-4 space-y-1">
                    {navigation.map((item) => (
                        <NavItem key={item.name} item={item} />
                    ))}
                </div>

                <div className="p-4 border-t border-slate-100 space-y-1">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 font-semibold"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-5 w-5" />
                        {isSidebarOpen && <span>Sign Out</span>}
                    </Button>

                    {isSidebarOpen && (
                        <div className="mt-4 p-4 rounded-2xl bg-slate-900 text-white relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 h-24 w-24 bg-primary-500/20 rounded-full blur-2xl group-hover:bg-primary-500/40 transition-colors" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">System Tier</p>
                            <p className="text-sm font-bold">Elite Super Admin</p>
                            <p className="text-[10px] text-slate-500 mt-2 font-medium">Full governance access</p>
                        </div>
                    )}
                </div>

                {/* Sidebar Toggle Button */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute -right-3 top-24 h-6 w-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-primary-600 shadow-sm transition-colors z-50"
                >
                    <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${!isSidebarOpen ? "rotate-180" : ""}`} />
                </button>
            </aside>

            {/* Mobile Sidebar / Drawer */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
                    <aside className="fixed inset-y-0 left-0 w-80 bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
                            {/* Logo removed */}
                            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                                <X className="h-6 w-6" />
                            </Button>
                        </div>
                        <div className="flex-grow py-8 px-4 space-y-1">
                            {navigation.map((item) => (
                                <NavItem key={item.name} item={item} />
                            ))}
                        </div>
                        <div className="p-6 border-t border-slate-100">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12 border-2 border-primary-100">
                                    <AvatarFallback className="bg-primary-50 text-primary-700 font-bold">
                                        {admin?.name?.[0] || "S"}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold text-slate-900">{admin?.name || "Super Admin"}</p>
                                    <p className="text-xs font-medium text-slate-400">{admin?.email}</p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            )}

            {/* Main Content Area */}
            <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "md:ml-64" : "md:ml-20"}`}>
                <header className="sticky top-0 z-20 h-16 glass border-b border-slate-200/50 flex items-center justify-between px-4 md:px-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
                            <Menu className="h-6 w-6" />
                        </Button>
                        <div className="hidden sm:block">
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest border-primary-200 text-primary-700 h-5 px-2">
                                    Live Registry
                                </Badge>
                                <span className="text-xs text-slate-400 font-semibold">/</span>
                                <span className="text-xs text-slate-400 font-bold hover:text-slate-600 cursor-pointer transition-colors">
                                    {activeItem?.name || "Governance"}
                                </span>
                            </div>
                            <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                                {activeItem?.name || "Super Admin Panel"}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border-2 border-white" />
                        </Button>

                        <div className="h-8 w-px bg-slate-200 mx-2" />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="p-1 rounded-full hover:bg-slate-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="text-right hidden lg:block">
                                            <p className="text-sm font-bold text-slate-900 leading-none mb-1">{admin?.name || "Super Admin"}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Level 10 Authority</p>
                                        </div>
                                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-200">
                                            <AvatarFallback className="bg-primary-50 text-primary-700 font-black">
                                                {admin?.name?.[0] || "S"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl border-none shadow-2xl">
                                <DropdownMenuLabel className="font-bold px-3 py-2 text-slate-500 text-xs uppercase tracking-widest">
                                    Account Profile
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-100" />
                                <DropdownMenuItem className="rounded-xl py-3 cursor-pointer group" onClick={() => navigate("/super-admin/settings")}>
                                    <Settings className="mr-3 h-4 w-4 text-slate-400 group-hover:text-primary-600 transition-colors" />
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900">System Settings</span>
                                        <span className="text-[10px] text-slate-400 font-medium">Privacy, security & logs</span>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl py-3 cursor-pointer group text-rose-500 hover:bg-rose-50" onClick={handleLogout}>
                                    <LogOut className="mr-3 h-4 w-4 transition-colors" />
                                    <div className="flex flex-col">
                                        <span className="font-bold">Terminate Session</span>
                                        <span className="text-[10px] text-rose-400 font-medium">Safe exit from governance</span>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default SuperAdminLayout;