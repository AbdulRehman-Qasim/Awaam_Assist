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
    Loader2,
    Activity,
    Users,
    MessageSquare,
    CheckCircle2
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
                    <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
                    <p className="text-slate-500 font-medium text-sm">Loading intelligence data...</p>
                </div>
            </div>
        );
    }

    if (!analyticsData) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Analytics</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">
                        Deep dive into platform performance, user engagement, and growth trends.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-sm">
                        <Activity className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-600">Live Status</span>
                    </div>
                </div>
            </div>

            {/* High-level Metrics */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                    { label: "User Growth", value: analyticsData.metrics.growth, detail: "MoM Increase", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Review Efficiency", value: analyticsData.metrics.efficiency, detail: "Avg turnaround time", icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Recommendation Match", value: analyticsData.metrics.engagement, detail: "AI accuracy score", icon: Target, color: "text-emerald-600", bg: "bg-emerald-50" },
                ].map((item) => (
                    <Card key={item.label} className="border-slate-200 shadow-sm bg-white overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${item.bg} ${item.color}`}>
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{item.label}</p>
                                    <h3 className="text-2xl font-bold text-slate-900">{item.value}</h3>
                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{item.detail}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Volume Progression Chart */}
                <Card className="lg:col-span-2 border-slate-200 shadow-sm bg-white overflow-hidden">
                    <CardHeader className="border-b border-slate-50 pb-4">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-slate-900" />
                            <CardTitle className="text-lg font-bold">Platform Volume Progression</CardTitle>
                        </div>
                        <CardDescription>Monthly growth across all registry modules</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex h-64 items-end gap-4 md:gap-6 rounded-xl bg-slate-50/50 p-6 border border-slate-100">
                            {analyticsData.volumeProgression.map((point: any) => {
                                const maxValue = Math.max(...analyticsData.volumeProgression.map((p: any) => p.value));
                                const height = maxValue > 0 ? (point.value / maxValue) * 100 : 15;
                                
                                return (
                                    <div key={point.label} className="group flex flex-1 flex-col items-center gap-3 h-full justify-end">
                                        <div className="w-full flex items-end justify-center h-full">
                                            <div
                                                className="w-full max-w-[40px] rounded-t-md bg-slate-900 hover:bg-slate-700 transition-all duration-300 relative"
                                                style={{ height: `${Math.max(height, 5)}%` }}
                                            >
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white shadow-md rounded border border-slate-100 px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                    <span className="text-[10px] font-bold text-slate-900">{point.value}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{point.label}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* System Distribution (Horizontal Bars) */}
                <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                    <CardHeader className="border-b border-slate-50 pb-4">
                        <div className="flex items-center gap-2">
                            <PieChart className="h-4 w-4 text-slate-900" />
                            <CardTitle className="text-lg font-bold">Registry Distribution</CardTitle>
                        </div>
                        <CardDescription>Utilization across different sectors</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {analyticsData.usageStats.map((item: any) => (
                            <div key={item.label} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">{item.label}</p>
                                    <p className="text-sm font-bold text-slate-900">{item.value}</p>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-slate-900 transition-all duration-1000 ease-out" 
                                        style={{ width: item.value }} 
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium italic">{item.detail}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Additional Insights Section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                    <CardHeader className="border-b border-slate-50">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-slate-900" />
                            <CardTitle className="text-lg font-bold">Feedback Sentiment Overview</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {[
                                { label: "Highly Satisfied (5 Star)", value: "64%", color: "bg-emerald-500" },
                                { label: "Satisfied (4 Star)", value: "22%", color: "bg-blue-500" },
                                { label: "Neutral (3 Star)", value: "8%", color: "bg-slate-400" },
                                { label: "Unsatisfied (1-2 Star)", value: "6%", color: "bg-rose-500" },
                            ].map((item) => (
                                <div key={item.label} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs font-medium">
                                        <span className="text-slate-600">{item.label}</span>
                                        <span className="text-slate-900 font-bold">{item.value}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color}`} style={{ width: item.value }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                    <CardHeader className="border-b border-slate-50">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-slate-900" />
                            <CardTitle className="text-lg font-bold">Recommendation Success Metrics</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-around h-full py-4">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-emerald-600">92%</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Accuracy</p>
                            </div>
                            <div className="h-12 w-px bg-slate-100" />
                            <div className="text-center">
                                <p className="text-3xl font-bold text-blue-600">1.4s</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Avg Latency</p>
                            </div>
                            <div className="h-12 w-px bg-slate-100" />
                            <div className="text-center">
                                <p className="text-3xl font-bold text-slate-900">2.4k</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Matches</p>
                            </div>
                        </div>
                        <div className="mt-8 p-4 rounded-lg bg-slate-50 border border-slate-100">
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                The AI engine has shown a <span className="font-bold text-slate-900">12% improvement</span> in recommendation relevance over the last 30 days due to refined weighting algorithms.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Analytics;