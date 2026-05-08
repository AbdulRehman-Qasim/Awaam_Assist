import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
    Home,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    Building2,
    Heart,
    Scale
} from 'lucide-react';
import Loading from '@/components/ui/loading';

const SchemeLayout = () => {
    // Sidebar closed by default on mobile, open on desktop
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
    const [userName, setUserName] = useState('');
    const [userRole, setUserRole] = useState('Citizen');
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Load basic user info from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                const userData = parsed.data || {};

                const name =
                    userData.student_name ||
                    userData.name ||
                    'Citizen';
                setUserName(name);

                const roleFromData = userData.role || parsed.userType || 'Citizen';
                setUserRole(roleFromData);
            } catch (error) {
                console.error('Error reading stored user:', error);
                setUserName('Citizen');
            }
        } else {
            setUserName('Citizen');
        }
        setLoading(false);
    }, []);

    // Handle window resize for sidebar responsiveness
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navigation = [
        { name: 'Home', href: '/schemes/dashboard', icon: Home },
        { name: 'Favorites', href: '/schemes/favorites', icon: Heart },
        { name: 'Compare', href: '/schemes/compare', icon: Scale },
        { name: 'Applications', href: '/schemes/applications', icon: FileText },
        { name: 'Settings', href: '/schemes/settings', icon: Settings },
    ];

    const { toast } = useToast();

    const handleLogout = () => {
        localStorage.removeItem('user');
        toast({
            title: 'Logout Successful',
            description: 'You have been logged out successfully.'
        });
        navigate('/schemes/login');
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    if (loading) {
        return <Loading message="Loading..." />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar for desktop */}
            <div className={`${isSidebarOpen ? 'block' : 'hidden'
                } w-64 bg-white border-r border-gray-200 fixed inset-y-0 z-10 flex-col hidden md:flex`}>
                <div className="flex items-center justify-center h-16 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#a855f7]">
                            <Building2 className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-[#7c3aed] text-lg font-bold">Schemes</span>
                    </div>
                </div>

                <div className="flex-grow p-4">
                    <nav className="space-y-1">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href ||
                                (item.name === 'Home' && location.pathname.startsWith('/schemes/dashboard'));

                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`${isActive
                                        ? 'bg-[#7c3aed]/10 text-[#7c3aed]'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        } group flex items-center px-3 py-2 text-sm font-medium rounded-md`}
                                >
                                    <item.icon
                                        className={`${isActive ? 'text-[#7c3aed]' : 'text-gray-400 group-hover:text-gray-600'
                                            } mr-3 flex-shrink-0 h-5 w-5`}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Back to Home Button */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <Button
                            variant="outline"
                            className="w-full justify-start text-sm"
                            onClick={handleBackToHome}
                        >
                            <Home className="mr-2 h-4 w-4" />
                            Back to Home
                        </Button>
                    </div>
                </div>

                {/* User menu */}
                <div className="flex items-center p-4 border-t border-gray-200">
                    <div className="flex-shrink-0">
                        <Avatar>
                            <AvatarFallback className="bg-[#7c3aed] text-white">
                                {userName ? userName.charAt(0).toUpperCase() : 'C'}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{userName || 'Citizen'}</p>
                        <p className="text-xs font-medium text-gray-500">{userRole}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto"
                        onClick={handleLogout}
                        aria-label="Log out"
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Mobile sidebar (off-canvas) */}
            {isSidebarOpen && (
                <div className="md:hidden fixed inset-0 z-40 flex">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-gray-600 bg-opacity-75"
                        onClick={() => setIsSidebarOpen(false)}
                    ></div>

                    {/* Sidebar panel */}
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsSidebarOpen(false)}
                                className="h-10 w-10 rounded-full flex items-center justify-center text-white"
                            >
                                <span className="sr-only">Close sidebar</span>
                                <X className="h-6 w-6" aria-hidden="true" />
                            </Button>
                        </div>

                        <div className="flex-1 h-0 overflow-y-auto">
                            <div className="flex items-center justify-center h-16 border-b border-gray-200">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#a855f7]">
                                        <Building2 className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-[#7c3aed] text-lg font-bold">Government Schemes</span>
                                </div>
                            </div>
                            <nav className="mt-5 px-2 space-y-1">
                                {navigation.map((item) => {
                                    const isActive = location.pathname === item.href;

                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className={`${isActive
                                                ? 'bg-[#7c3aed]/10 text-[#7c3aed]'
                                                : 'text-gray-700 hover:bg-gray-100'
                                                } group flex items-center px-3 py-2 text-sm font-medium rounded-md`}
                                            onClick={() => setIsSidebarOpen(false)}
                                        >
                                            <item.icon
                                                className={`${isActive ? 'text-[#7c3aed]' : 'text-gray-400 group-hover:text-gray-600'
                                                    } mr-3 flex-shrink-0 h-5 w-5`}
                                                aria-hidden="true"
                                            />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </nav>

                            {/* Back to Home Button - Mobile */}
                            <div className="mt-6 px-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-sm"
                                    onClick={handleBackToHome}
                                >
                                    <Home className="mr-2 h-4 w-4" />
                                    Back to Home
                                </Button>
                            </div>
                        </div>

                        {/* Mobile user menu */}
                        <div className="flex items-center p-4 border-t border-gray-200">
                            <div className="flex-shrink-0">
                                <Avatar>
                                    <AvatarFallback className="bg-[#7c3aed] text-white">
                                        {userName ? userName.charAt(0).toUpperCase() : 'C'}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{userName || 'Citizen'}</p>
                                <p className="text-xs font-medium text-gray-500">{userRole}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="ml-auto"
                                onClick={handleLogout}
                                aria-label="Log out"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Content area */}
            <div className={`flex-1 ${isSidebarOpen ? 'md:ml-64' : ''}`}>
                {/* Top header */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="flex items-center justify-between px-4 py-3 sm:px-6">
                        <div className="flex items-center flex-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleSidebar}
                                className="md:hidden mr-2"
                                aria-label="Open sidebar"
                            >
                                <Menu className="h-6 w-6" aria-hidden="true" />
                            </Button>
                            <div className="flex items-center gap-2">
                                <Building2 className="h-6 w-6 text-[#7c3aed]" />
                                <h1 className="text-lg font-medium">Government Schemes</h1>
                            </div>
                        </div>

                        {/* Right side header content */}
                        <div className="flex items-center space-x-4">
                            {/* User dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative" size="icon">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-[#7c3aed] text-white">
                                                {userName ? userName.charAt(0).toUpperCase() : 'C'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>{userName || 'Citizen'}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <main className="p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default SchemeLayout;
