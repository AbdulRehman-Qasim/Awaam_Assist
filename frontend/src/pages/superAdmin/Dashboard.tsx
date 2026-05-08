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
    ArrowUpRight, 
    Activity,
    CheckCircle2,
    AlertCircle,
    ClipboardList,
    TrendingUp,
    Zap,
    Globe,
    ShieldAlert,
    Cpu,
    ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import superAdminAPI, { type SuperAdminDashboardSummary } from "@/services/superAdminAPI";

const Dashboard = () => {
    const { toast } = useToast();
    const [summary, setSummary] = useState<SuperAdminDashboardSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const pendingTotal = (summary?.pending?.admins ?? 0) + (summary?.pending?.universities ?? 0) + (summary?.pending?.schemes ?? 0) + (summary?.pending?.hospitals ?? 0);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const response = await superAdminAPI.getDashboardStats();
                setSummary(response.data);
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "System Synchronization Error",
                    description: "Unable to retrieve real-time governance metrics.",
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboard();
    }, [toast]);

    const metrics = [
        { title: "Governance Nodes", value: summary?.totals?.admins ?? 0, note: `${summary?.pending?.admins ?? 0} await review`, tone: "text-blue-600 bg-blue-50", icon: Users },
        { title: "Academic Hubs", value: summary?.totals?.universities ?? 0, note: `${summary?.pending?.universities ?? 0} submissions`, tone: "text-indigo-600 bg-indigo-50", icon: GraduationCap },
        { title: "Welfare Schemes", value: summary?.totals?.schemes ?? 0, note: `${summary?.pending?.schemes ?? 0} draft status`, tone: "text-violet-600 bg-violet-50", icon: ShieldCheck },
        { title: "Medical Centers", value: summary?.totals?.hospitals ?? 0, note: `${summary?.pending?.hospitals ?? 0} pending audit`, tone: "text-emerald-600 bg-emerald-50", icon: Building2 },
        { title: "Critical Tasks", value: pendingTotal, note: "Items requiring action", tone: "text-amber-600 bg-amber-50", icon: ClipboardList },
    ];

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between border-b border-slate-100 pb-6 md:pb-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-primary-600 text-white border-none px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-200">System Root</Badge>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Cluster Online</span>
                        </div>
                    </div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter text-slate-900 uppercase leading-none">
                        Executive <span className="text-primary-600 italic">Command</span>
                    </h1>
                    <p className="text-slate-500 text-base md:text-lg font-medium max-w-3xl leading-snug">
                        Real-time oversight of the national welfare infrastructure. Synchronized across all high-availability production clusters.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/super-admin/approvals">
                        <Button className="h-12 px-6 rounded-xl bg-slate-900 hover:bg-primary-600 text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-2xl shadow-slate-200 gap-2">
                            <ShieldAlert className="h-4 w-4" />
                            Audit Queue
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {metrics.map((metric) => {
                    const Icon = metric.icon;

                    return (
                        <Card key={metric.title} className="group relative overflow-hidden border-none shadow-xl rounded-2xl bg-white hover:shadow-primary-100 transition-all duration-500">
                            <div className={`absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                            <CardContent className="p-6">
                                <div className="flex flex-col gap-6">
                                    <div className={`h-10 w-10 rounded-xl ${metric.tone} shadow-inner flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-700`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{metric.title}</p>
                                        <p className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 group-hover:text-primary-600 transition-colors duration-500">
                                            {isLoading ? <span className="animate-pulse">--</span> : metric.value}
                                        </p>
                                        <div className="flex items-center gap-1.5 pt-1.5">
                                            <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">{metric.note}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 gap-6 md:gap-8 xl:grid-cols-3">
                <Card className="xl:col-span-2 border-none shadow-xl rounded-2xl overflow-hidden bg-white">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-3.5 w-3.5 text-primary-500" />
                                    <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">Live Diagnostics</span>
                                </div>
                                <CardTitle className="text-xl md:text-2xl font-black tracking-tight text-slate-900 uppercase">Platform Integrity</CardTitle>
                                <CardDescription className="font-bold text-slate-400 text-xs">Cluster performance and synchronization audit</CardDescription>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-white shadow-xl shadow-slate-100 flex items-center justify-center border border-slate-50">
                                <Activity className="h-5 w-5 text-primary-500 animate-pulse" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 grid gap-4 md:gap-6 sm:grid-cols-3">
                        {[
                            { label: "Cluster Readiness", value: "99.4%", icon: Cpu, color: "text-emerald-500", detail: "Across all nodes" },
                            { label: "Global Latency", value: "24ms", icon: Globe, color: "text-blue-500", detail: "Edge distribution" },
                            { label: "Data Integrity", value: "Shielded", icon: ShieldCheck, color: "text-indigo-500", detail: "Encrypted at rest" },
                        ].map((item) => (
                            <div key={item.label} className="group p-5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500">
                                <div className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center mb-4 ring-1 ring-slate-100 group-hover:scale-110 transition-transform">
                                    <item.icon className={`h-5 w-5 ${item.color}`} />
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                                <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-1">{item.value}</p>
                                <p className="text-[10px] font-bold text-slate-400 italic">{item.detail}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl rounded-2xl overflow-hidden bg-slate-900 text-white relative group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent)] pointer-events-none" />
                    <CardHeader className="border-b border-white/5 px-6 py-6">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/10 shadow-2xl">
                                <AlertCircle className="h-5 w-5 text-amber-400" />
                            </div>
                            <div>
                                <CardTitle className="text-lg md:text-xl font-black uppercase tracking-tight">Governance</CardTitle>
                                <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-0.5">Pending Priority Notes</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        {[
                            { text: "Priority audit required for NUST university records.", priority: "Critical", color: "bg-rose-500" },
                            { text: "Re-verify Sindh regional healthcare clinics registry.", priority: "Urgent", color: "bg-amber-500" },
                            { text: "Update BISP scheme benefit metrics for FY25.", priority: "Policy", color: "bg-blue-500" },
                        ].map((note, idx) => (
                            <div key={idx} className="group p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:translate-x-1 transition-all duration-500 cursor-pointer">
                                <div className="flex items-center justify-between mb-2">
                                    <Badge className={`${note.color} text-white text-[10px] font-black border-none uppercase tracking-widest px-2 py-0.5`}>{note.priority}</Badge>
                                    <ArrowRight className="h-3 w-3 text-white/20 group-hover:text-white/100 transition-colors" />
                                </div>
                                <p className="text-xs font-bold text-slate-300 leading-relaxed italic">
                                    "{note.text}"
                                </p>
                            </div>
                        ))}
                        <Button variant="ghost" className="w-full h-12 rounded-xl border border-white/10 text-white/50 hover:text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px]">
                            View All Governance Logs
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;