import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Landmark,
    Search,
    Bell,
    Plus,
    Settings,
    LogOut,
    Menu,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";

const AdminLandingPage = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        incompleteProfiles: 245,
        satisfaction: 95
    });

    // Mock chart data
    const performanceData = [
        { name: "Jan", value: 30 },
        { name: "Feb", value: 25 },
        { name: "Mar", value: 35 },
        { name: "Apr", value: 32 },
        { name: "May", value: 40 },
        { name: "Jun", value: 45 },
        { name: "Jul", value: 38 },
        { name: "Aug", value: 42 },
        { name: "Sep", value: 48 },
    ];

    const taskStatusData = [
        { name: "Completed", value: 45, color: "#1e293b" },
        { name: "In Progress", value: 30, color: "#eab308" },
        { name: "Pending", value: 25, color: "#e2e8f0" },
    ];

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

                // Fetch dashboard data to get dynamic total users
                const response = await fetch(`${apiUrl}/admin/dashboard`, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.data) {
                        setStats(prev => ({
                            ...prev,
                            // Combining candidates and companies or just candidates based on "Users"
                            totalUsers: (data.data.totalCandidates || 0) + (data.data.totalCompanies || 0)
                        }));
                    }
                }
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            }
        };

        fetchStats();
    }, []);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleLogout = () => {
        // Clear all admin related items
        localStorage.removeItem('admin');
        localStorage.removeItem('adminToken');
        // Navigate to home page
        navigate('/');
    };

    const StatCard = ({ title, value, percentage, color }: any) => (
        <Card className={`border-none shadow-sm text-white ${color}`}>
            <CardContent className="p-6">
                <div>
                    <p className="text-sm font-medium opacity-90 mb-1">{title}</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-bold">{value.toLocaleString()}</h3>
                        {percentage && (
                            <span className="bg-white/20 px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">
                                +{percentage}%
                            </span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-64' : 'w-20'} 
                bg-[#1e293b] text-white transition-all duration-300 fixed h-full z-20 flex flex-col`}
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center px-4 border-b border-gray-700">
                    <img
                        src="/favicon.jpg"
                        alt="Logo"
                        className="h-10 w-10 rounded-full object-cover"
                    />
                    {isSidebarOpen && <span className="ml-3 font-bold text-lg">Awam Assist</span>}
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 space-y-2">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-white bg-[#eab308] hover:bg-[#ca9a06] hover:text-white"
                        onClick={() => navigate('/admin')}
                    >
                        <LayoutDashboard className="h-5 w-5 mr-3" />
                        {isSidebarOpen && "Dashboard"}
                    </Button>

                    <Button
                        variant="ghost"
                        className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                        onClick={() => navigate('/companies')}
                    >
                        <Users className="h-5 w-5 mr-3" />
                        {isSidebarOpen && "Users"}
                    </Button>

                    <Button
                        variant="ghost"
                        className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                        onClick={() => navigate('/admin/education/companies')}
                    >
                        <BookOpen className="h-5 w-5 mr-3" />
                        {isSidebarOpen && "Education"}
                    </Button>

                    <Button
                        variant="ghost"
                        className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
                        onClick={() => navigate('/admin/scheme/schemes')}
                    >
                        <Landmark className="h-5 w-5 mr-3" />
                        {isSidebarOpen && "Govt Schemes"}
                    </Button>
                </nav>

                {/* Add Education Button (Vertical Sidebar Area) */}
                <div className="p-4 border-t border-gray-700">
                    <Button
                        className={`w-full bg-blue-600 hover:bg-blue-700 text-white ${!isSidebarOpen && 'px-0'}`}
                        onClick={() => navigate('/admin/education/companies')}
                    >
                        <Plus className="h-5 w-5" />
                        {isSidebarOpen && <span className="ml-2">Add Education</span>}
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div className="flex items-center">
                        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-4">
                            <Menu className="h-6 w-6 text-gray-600" />
                        </Button>
                        <div className="relative hidden md:block w-96">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search..."
                                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5 text-gray-600" />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
                        </Button>
                        {/* User Profile Dropdown */}
                        <div className="flex items-center space-x-3 border-l pl-4 ml-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
                                        <div className="text-right hidden sm:block mr-3">
                                            <p className="text-sm font-semibold text-gray-900">Admin User</p>
                                            <p className="text-xs text-gray-500">Super Admin</p>
                                        </div>
                                        <Avatar>
                                            <AvatarFallback className="bg-blue-600 text-white">A</AvatarFallback>
                                        </Avatar>
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="p-6 space-y-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard
                            title="Total Registered Users"
                            value={stats.totalUsers}
                            percentage={8.5}
                            color="bg-blue-500"
                        />
                        <StatCard
                            title="Incomplete Profiles"
                            value={stats.incompleteProfiles}
                            percentage={12}
                            color="bg-amber-500"
                        />
                        <StatCard
                            title="Satisfaction"
                            value={`${stats.satisfaction}%`}
                            percentage={2.1}
                            color="bg-pink-500"
                        />
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Monthly Performance */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-6">Monthly Performance</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={performanceData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b' }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b' }}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            cursor={{ fill: '#f8fafc' }}
                                        />
                                        <Bar dataKey="value" fill="#1e293b" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Task Status */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-6">Task Status</h3>
                            <div className="h-64 flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={taskStatusData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={0}
                                            dataKey="value"
                                        >
                                            {taskStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            iconType="circle"
                                        />
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 space-y-2">
                                {taskStatusData.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                                            <span className="text-gray-600">{item.name}</span>
                                        </div>
                                        <span className="font-semibold">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLandingPage;
