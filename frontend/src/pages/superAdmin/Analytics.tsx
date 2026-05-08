import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    TrendingUp, 
    Zap, 
    Target, 
    BarChart3, 
    PieChart, 
    ArrowUpRight,
    Search,
    Loader2
} from "lucide-react";
import superAdminAPI from "@/services/superAdminAPI";

const Analytics = () => {
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await superAdminAPI.getAnalyticsStats();
                if (response.success) {
                    setAnalyticsData(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing Intelligence Hub...</p>
                </div>
            </div>
        );
    }

    if (!analyticsData) return null;

    const metrics = [
        { label: "Global Growth", value: analyticsData.metrics.growth, detail: "Across all registries", icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
        { label: "Audit Efficiency", value: analyticsData.metrics.efficiency, detail: "Avg review turnaround", icon: Zap, color: "text-primary-600 bg-primary-50" },
        { label: "Platform Engagement", value: analyticsData.metrics.engagement, detail: "Admin approval ratio", icon: Target, color: "text-violet-600 bg-violet-50" },
    ];

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between border-b border-slate-100 pb-6 md:pb-8">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 px-3 py-0.5 text-[9px] font-black uppercase tracking-widest">Intelligence Hub</Badge>
                        <span className="text-slate-300 font-bold">/</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Growth Metrics</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 uppercase">
                        Insights & <span className="text-primary-600 italic">Data</span>
                    </h1>
                    <p className="text-slate-500 text-base font-medium max-w-2xl leading-snug">
                        Comprehensive analysis of platform expansion, administrative efficiency, and regional distribution.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-sm">
                        <Search className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-xs font-bold text-slate-600 italic">Live Intelligence</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-3">
                {metrics.map((item) => (
                    <Card key={item.label} className="group border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                            <p className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 mb-1">{item.value}</p>
                            <p className="text-[10px] font-bold text-slate-400 italic">{item.detail}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 md:gap-8 xl:grid-cols-3">
                <Card className="xl:col-span-2 border-none shadow-xl rounded-xl overflow-hidden bg-white">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-primary-500" />
                                    Volume Progression
                                </CardTitle>
                                <CardDescription className="font-bold text-slate-400 text-xs italic">Growth trajectory across all active modules</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex h-64 items-end gap-4 md:gap-6 rounded-xl bg-slate-50/50 p-6 border border-slate-100">
                            {analyticsData.volumeProgression.map((point: any) => {
                                const maxValue = Math.max(...analyticsData.volumeProgression.map((p: any) => p.value));
                                const height = maxValue > 0 ? (point.value / maxValue) * 100 : 15;
                                
                                return (
                                    <div key={point.label} className="group flex flex-1 flex-col items-center gap-3">
                                        <div className="flex h-48 w-full items-end">
                                            <div
                                                className="w-full rounded-lg bg-slate-900 group-hover:bg-primary-600 shadow-sm transition-all duration-500 relative"
                                                style={{ height: `${Math.max(height, 5)}%` }}
                                            >
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white shadow-xl rounded-lg px-2 py-1 border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    <span className="text-[10px] font-black text-slate-900">{point.value}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{point.label}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl rounded-xl overflow-hidden bg-white">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-6">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                                <PieChart className="h-4 w-4 text-violet-500" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold tracking-tight">System Distribution</CardTitle>
                                <CardDescription className="text-slate-400 font-medium text-xs">Registry utilization metrics</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-5">
                        {analyticsData.usageStats.map((item: any) => (
                            <div key={item.label} className="group relative">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{item.label}</p>
                                    <p className="text-sm font-black text-primary-600">{item.value}</p>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-slate-900 group-hover:bg-primary-500 transition-all duration-1000 ease-out" 
                                        style={{ width: item.value }} 
                                    />
                                </div>
                                <p className="mt-2 text-[10px] font-bold text-slate-400 italic">{item.detail}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Analytics;