import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    Building2, 
    Clock3, 
    GraduationCap, 
    ShieldCheck, 
    Users, 
    MessageSquare,
    Activity,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    ExternalLink,
    Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import superAdminAPI, { type SuperAdminDashboardSummary } from "@/services/superAdminAPI";

const Dashboard = () => {
    const { toast } = useToast();
    const [summary, setSummary] = useState<SuperAdminDashboardSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const pendingTotal = (summary?.pending?.admins ?? 0) + 
                         (summary?.pending?.universities ?? 0) + 
                         (summary?.pending?.schemes ?? 0) + 
                         (summary?.pending?.hospitals ?? 0);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const response = await superAdminAPI.getDashboardStats();
                setSummary(response.data);
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Connection Error",
                    description: "Unable to retrieve dashboard metrics.",
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboard();
    }, [toast]);

    const stats = [
        { 
            title: "Total Administrators", 
            value: summary?.totals?.admins ?? 0, 
            description: `${summary?.pending?.admins ?? 0} pending review`, 
            icon: Users,
            color: "text-blue-600"
        },
        { 
            title: "Active Modules", 
            value: 4, 
            description: "Education, Schemes, Healthcare, Feedback", 
            icon: Zap,
            color: "text-amber-600"
        },
        { 
            title: "Pending Approvals", 
            value: pendingTotal, 
            description: "Requires immediate attention", 
            icon: Clock3,
            color: "text-rose-600"
        },
        { 
            title: "Total Feedbacks", 
            value: 124, // In a real app, this would come from the API
            description: "Customer satisfaction data", 
            icon: MessageSquare,
            color: "text-emerald-600"
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Overview</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">
                        Monitor system performance and manage administrative tasks across the platform.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/super-admin/approvals">
                        <Button className="rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-sm gap-2 text-xs h-9">
                            <Clock3 className="h-4 w-4" />
                            View Approvals
                        </Button>
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="border-slate-200 shadow-sm overflow-hidden bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-2 rounded-lg bg-slate-50 ${stat.color}`}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                {isLoading ? (
                                    <div className="h-4 w-12 bg-slate-100 animate-pulse rounded" />
                                ) : (
                                    <Badge variant="outline" className="text-[10px] font-medium border-slate-200 text-slate-500">
                                        Live
                                    </Badge>
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.title}</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
                                        {isLoading ? "--" : stat.value}
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-400 font-medium">{stat.description}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* System Health Card */}
                <Card className="lg:col-span-2 border-slate-200 shadow-sm bg-white overflow-hidden">
                    <CardHeader className="border-b border-slate-50 pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-emerald-500" />
                                <CardTitle className="text-lg font-bold">System Integrity</CardTitle>
                            </div>
                            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-none px-2 py-0.5 text-[10px] font-bold">
                                Healthy
                            </Badge>
                        </div>
                        <CardDescription>Real-time status of critical infrastructure components</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: "Database Cluster", status: "Operational", detail: "Latency: 12ms", icon: CheckCircle2, color: "text-emerald-500" },
                                { label: "API Gateway", status: "Operational", detail: "Requests: 1.2k/min", icon: CheckCircle2, color: "text-emerald-500" },
                                { label: "Auth Services", status: "Operational", detail: "Uptime: 99.99%", icon: CheckCircle2, color: "text-emerald-500" },
                            ].map((item) => (
                                <div key={item.label} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                                    <div className={`p-2 rounded-full bg-white shadow-sm mb-3 ${item.color}`}>
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-900">{item.label}</p>
                                    <p className="text-xs font-medium text-emerald-600 mt-0.5">{item.status}</p>
                                    <p className="text-[10px] text-slate-400 mt-2 font-medium">{item.detail}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions / Recent Activity Placeholder */}
                <Card className="border-slate-200 shadow-sm bg-slate-900 text-white overflow-hidden">
                    <CardHeader className="border-b border-white/10 pb-4">
                        <CardTitle className="text-lg font-bold">Important Notes</CardTitle>
                        <CardDescription className="text-slate-400">Items requiring administrative focus</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        {[
                            { text: "Update regional healthcare criteria for FY26.", priority: "Policy" },
                            { text: "Verify pending university accreditation documents.", priority: "Action" },
                            { text: "Review user feedback on recommendation engine.", priority: "Review" },
                        ].map((note, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                                <div className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-medium text-slate-200">{note.text}</p>
                                    <Badge variant="outline" className="mt-2 text-[9px] h-4 border-white/20 text-slate-400 px-1 font-bold">
                                        {note.priority}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                        <Button variant="ghost" className="w-full text-white/50 hover:text-white hover:bg-white/5 text-[10px] font-bold uppercase tracking-widest mt-2 h-9">
                            All Registry Logs
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;