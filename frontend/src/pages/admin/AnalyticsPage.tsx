import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    BarChart3,
    TrendingUp,
    Users,
    DollarSign,
    Download,
    Calendar,
    PieChart,
    Activity,
    Star,
    ThumbsUp,
    ThumbsDown,
    MessageSquare,
} from "lucide-react";
import { useState, useEffect } from "react";
import { FeedbackService } from "@/services/feedbackService";
import { Progress } from "@/components/ui/progress";

const AnalyticsPage = () => {
    const [timeRange, setTimeRange] = useState("month");
    const [feedbackData, setFeedbackData] = useState<any>(null);
    const [loadingFeedback, setLoadingFeedback] = useState(true);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const res = await FeedbackService.getFeedbackAnalytics();
                if (res.success) setFeedbackData(res.data);
            } catch (err) {
                console.error("Failed to fetch feedback analytics:", err);
            } finally {
                setLoadingFeedback(false);
            }
        };
        fetchFeedback();
    }, []);

    const stats = [
        {
            title: "Total Disbursement",
            value: "PKR 125.5B",
            change: "+12.5%",
            trend: "up",
            icon: DollarSign,
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            title: "Active Beneficiaries",
            value: "2.1M",
            change: "+8.2%",
            trend: "up",
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Schemes Performance",
            value: "87.5%",
            change: "+3.1%",
            trend: "up",
            icon: TrendingUp,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
        },
        {
            title: "Application Rate",
            value: "15,234",
            change: "-2.4%",
            trend: "down",
            icon: Activity,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
        },
    ];

    const categoryData = [
        { name: "Financial Assistance", schemes: 25, beneficiaries: "850K", amount: "PKR 45B" },
        { name: "Healthcare", schemes: 18, beneficiaries: "620K", amount: "PKR 32B" },
        { name: "Education", schemes: 15, beneficiaries: "450K", amount: "PKR 28B" },
        { name: "Housing", schemes: 8, beneficiaries: "180K", amount: "PKR 15B" },
        { name: "Agriculture", schemes: 3, beneficiaries: "50K", amount: "PKR 5.5B" },
    ];

    const provinceData = [
        { name: "Punjab", schemes: 28, beneficiaries: "1.2M", percentage: 45 },
        { name: "Sindh", schemes: 22, beneficiaries: "850K", percentage: 32 },
        { name: "KPK", schemes: 12, beneficiaries: "380K", percentage: 14 },
        { name: "Balochistan", schemes: 7, beneficiaries: "220K", percentage: 9 },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-gray-600 mt-1">Comprehensive insights and performance metrics</p>
                </div>
                <div className="flex gap-3">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">Last Week</SelectItem>
                            <SelectItem value="month">Last Month</SelectItem>
                            <SelectItem value="quarter">Last Quarter</SelectItem>
                            <SelectItem value="year">Last Year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button className="bg-[#7c3aed] hover:bg-[#6d28d9]">
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                                        <Icon className={`h-6 w-6 ${stat.color}`} />
                                    </div>
                                    <span
                                        className={`text-sm font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"
                                            }`}
                                    >
                                        {stat.change}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Category Performance */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Category Performance</CardTitle>
                            <CardDescription>Breakdown by scheme categories</CardDescription>
                        </div>
                        <PieChart className="h-5 w-5 text-gray-400" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {categoryData.map((category, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{category.name}</h4>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                        <span>{category.schemes} schemes</span>
                                        <span>•</span>
                                        <span>{category.beneficiaries} beneficiaries</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-[#7c3aed]">{category.amount}</p>
                                    <p className="text-sm text-gray-600">Total disbursed</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Province Distribution */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Province Distribution</CardTitle>
                            <CardDescription>Geographic coverage and reach</CardDescription>
                        </div>
                        <BarChart3 className="h-5 w-5 text-gray-400" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {provinceData.map((province, index) => (
                            <div key={index}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <h4 className="font-semibold text-gray-900">{province.name}</h4>
                                        <span className="text-sm text-gray-600">
                                            {province.schemes} schemes • {province.beneficiaries} beneficiaries
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{province.percentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-gradient-to-r from-[#7c3aed] to-[#a855f7] h-3 rounded-full transition-all"
                                        style={{ width: `${province.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Trend Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Trends</CardTitle>
                        <CardDescription>Application and approval trends</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
                            <div className="text-center">
                                <BarChart3 className="h-16 w-16 text-[#7c3aed] mx-auto mb-4" />
                                <p className="text-gray-600">Chart visualization would appear here</p>
                                <p className="text-sm text-gray-500 mt-2">Integration with charting library required</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* User Satisfaction Intelligence */}
            <Card className="border-2 border-purple-100 shadow-xl shadow-purple-500/5">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-purple-600" />
                                User Satisfaction Intelligence
                            </CardTitle>
                            <CardDescription>Real-time feedback and recommendation performance</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-black uppercase tracking-widest">
                            Live Feed
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {loadingFeedback ? (
                        <div className="h-40 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Module Ratings */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Module Satisfaction</h3>
                                <div className="space-y-4">
                                    {feedbackData?.moduleRatings?.map((item: any) => (
                                        <div key={item._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-purple-200 transition-all group">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-black text-slate-900 uppercase tracking-wider text-xs">{item._id}</span>
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                                                    <span className="text-sm font-black">{item.avgRating.toFixed(1)}</span>
                                                </div>
                                            </div>
                                            <Progress value={item.avgRating * 20} className="h-1.5 bg-slate-200" />
                                            <div className="mt-2 text-[10px] font-bold text-slate-400">
                                                Based on {item.count} user ratings
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recommendation Reactions */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">AI Match Accuracy</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 text-center space-y-2">
                                        <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto mb-3">
                                            <ThumbsUp className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="text-3xl font-black text-emerald-700">
                                            {feedbackData?.recommendationReactions?.find((r: any) => r._id === 'helpful')?.count || 0}
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60">Helpful Matches</div>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-rose-50 border border-rose-100 text-center space-y-2">
                                        <div className="w-10 h-10 rounded-2xl bg-rose-500 flex items-center justify-center mx-auto mb-3">
                                            <ThumbsDown className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="text-3xl font-black text-rose-700">
                                            {feedbackData?.recommendationReactions?.find((r: any) => r._id === 'not_relevant')?.count || 0}
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-rose-600/60">Not Relevant</div>
                                    </div>
                                </div>
                                <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4 text-purple-400" />
                                        <span className="text-xs font-black uppercase tracking-widest">Platform Feedback</span>
                                    </div>
                                    <div className="text-sm font-medium text-slate-300 italic">
                                        "Collects general suggestions and improves system-wide logic."
                                    </div>
                                    <Button variant="outline" className="w-full h-10 rounded-xl border-white/20 hover:bg-white/10 text-white font-bold text-xs">
                                        View All Comments
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AnalyticsPage;
