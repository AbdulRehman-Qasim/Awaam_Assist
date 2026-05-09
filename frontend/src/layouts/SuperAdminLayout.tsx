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
    MessageSquare,
    CheckSquare
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
        { name: "Approvals Queue", href: "/super-admin/approvals", icon: CheckSquare },
        { name: "Data Registry", href: "/super-admin/data", icon: Database },
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
                className={`group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
            >
                <Icon className={`h-4 w-4 transition-colors ${isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"}`} />
                <span className={`transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "md:hidden"}`}>
                    {item.name}
                </span>
                {isActive && isSidebarOpen && (
                    <div className="ml-auto w-1 h-4 bg-slate-900 rounded-full" />
                )}
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50/50 flex font-sans text-slate-900">
            {/* Desktop Sidebar */}
            <aside
                className={`hidden md:flex flex-col bg-white border-r border-slate-200 fixed inset-y-0 z-30 transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-64" : "w-20"
                    }`}
            >
                <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
                    <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center">
                        <Shield className="h-5 w-5 text-white" />
                    </div>
                    {isSidebarOpen && (
                        <span className="font-bold tracking-tight text-lg">Awaam Assist</span>
                    )}
                </div>

                <div className="flex-grow py-6 px-4 space-y-1">
                    {navigation.map((item) => (
                        <NavItem key={item.name} item={item} />
                    ))}
                </div>

                <div className="p-4 border-t border-slate-100 space-y-2">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium text-sm"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-4 w-4" />
                        {isSidebarOpen && <span>Sign Out</span>}
                    </Button>

                    {isSidebarOpen && (
                        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Session Info</p>
                            <p className="text-xs font-bold text-slate-700">Super Admin Access</p>
                            <p className="text-[10px] text-slate-500 mt-1">Full system control active</p>
                        </div>
                    )}
                </div>

                {/* Sidebar Toggle Button */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute -right-3 top-20 h-6 w-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm transition-colors z-50"
                >
                    <ChevronLeft className={`h-3 w-3 transition-transform duration-300 ${!isSidebarOpen ? "rotate-180" : ""}`} />
                </button>
            </aside>

            {/* Mobile Sidebar / Drawer */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
                    <aside className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center">
                                    <Shield className="h-5 w-5 text-white" />
                                </div>
                                <span className="font-bold tracking-tight">Awaam Assist</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="flex-grow py-6 px-4 space-y-1">
                            {navigation.map((item) => (
                                <NavItem key={item.name} item={item} />
                            ))}
                        </div>
                        <div className="p-6 border-t border-slate-100">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border border-slate-200">
                                    <AvatarFallback className="bg-slate-100 text-slate-700 font-bold text-xs">
                                        {admin?.name?.[0] || "S"}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold text-sm text-slate-900">{admin?.name || "Super Admin"}</p>
                                    <p className="text-xs text-slate-500">{admin?.email}</p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            )}

            {/* Main Content Area */}
            <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "md:ml-64" : "md:ml-20"}`}>
                <header className="sticky top-0 z-20 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div className="hidden sm:block">
                            <h1 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                <span className="text-slate-400 font-normal">Super Admin /</span>
                                {activeItem?.name || "Dashboard"}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 bg-slate-900 rounded-full border border-white" />
                        </Button>

                        <div className="h-6 w-px bg-slate-200 mx-1" />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="p-1 rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="text-right hidden lg:block">
                                            <p className="text-sm font-semibold text-slate-900 leading-none">{admin?.name || "Super Admin"}</p>
                                        </div>
                                        <Avatar className="h-8 w-8 border border-slate-200 shadow-sm">
                                            <AvatarFallback className="bg-slate-50 text-slate-700 font-bold text-xs">
                                                {admin?.name?.[0] || "S"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 p-1 rounded-xl border-slate-200 shadow-xl">
                                <DropdownMenuLabel className="font-semibold px-2 py-1.5 text-slate-500 text-xs uppercase tracking-wider">
                                    Management
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="rounded-lg py-2 cursor-pointer" onClick={() => navigate("/super-admin/settings")}>
                                    <Settings className="mr-2 h-4 w-4 text-slate-400" />
                                    <span className="text-sm font-medium">Account Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg py-2 cursor-pointer text-rose-600 hover:bg-rose-50" onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span className="text-sm font-medium">Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default SuperAdminLayout;