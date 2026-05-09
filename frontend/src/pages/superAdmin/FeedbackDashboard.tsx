import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    MessageSquare, 
    Star, 
    Search, 
    ThumbsUp, 
    ThumbsDown, 
    Calendar,
    ArrowUpRight,
    Heart,
    GraduationCap,
    LayoutGrid,
    Activity,
    RefreshCw
} from "lucide-react";
import { FeedbackService } from "@/services/feedbackService";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

const FeedbackDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    const loadData = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        else setRefreshing(true);
        try {
            const feedbackRes = await FeedbackService.getAllFeedback();
            if (feedbackRes.success) {
                setFeedbacks(feedbackRes.data);
            }
        } catch (error) {
            console.error("Error loading feedback data:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
        // Setup polling every 30 seconds for "real-time" experience
        const interval = setInterval(() => loadData(false), 30000);
        return () => clearInterval(interval);
    }, []);

    const filteredFeedbacks = useMemo(() => {
        return feedbacks.filter(fb => {
            const matchesTab = activeTab === "all" || 
                              (activeTab === "recommendation" ? fb.type === "recommendation_feedback" : fb.module === activeTab);
            
            const matchesSearch = !searchQuery || 
                                 fb.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 fb.userId?.student_name?.toLowerCase().includes(searchQuery.toLowerCase());
            
            return matchesTab && matchesSearch;
        });
    }, [feedbacks, activeTab, searchQuery]);

    // Compute dynamic stats based on CURRENTLY filtered data
    const stats = useMemo(() => {
        const ratingItems = filteredFeedbacks.filter(f => f.type === 'rating');
        const avgRating = ratingItems.length > 0 
            ? ratingItems.reduce((acc, curr) => acc + curr.rating, 0) / ratingItems.length 
            : 0;

        const recItems = filteredFeedbacks.filter(f => f.type === 'recommendation_feedback');
        const helpfulCount = recItems.filter(r => r.reaction === 'helpful').length;
        const notHelpfulCount = recItems.filter(r => r.reaction === 'not_helpful' || r.reaction === 'not_relevant').length;

        return {
            avgRating,
            totalReviews: filteredFeedbacks.length,
            helpfulCount,
            notHelpfulCount,
            ratingCount: ratingItems.length
        };
    }, [filteredFeedbacks]);

    const getModuleColor = (module: string) => {
        switch(module) {
            case 'healthcare': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'education': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'schemes': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'platform': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getModuleIcon = (module: string) => {
        switch(module) {
            case 'healthcare': return <Heart className="h-4 w-4" />;
            case 'education': return <GraduationCap className="h-4 w-4" />;
            case 'schemes': return <LayoutGrid className="h-4 w-4" />;
            default: return <MessageSquare className="h-4 w-4" />;
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                        key={star} 
                        className={`h-4 w-4 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} 
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">
                        Feedback <span className="text-primary-600">Intelligence</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Centralized satisfaction metrics and multi-module sentiment analysis
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        className="rounded-xl border-slate-200 bg-white/50 backdrop-blur-md"
                        onClick={() => loadData(false)}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Syncing...' : 'Sync Now'}
                    </Button>
                    <Button className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-200">
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Analytics Summary - NOW DYNAMICALLY FILTERED */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-none shadow-sm bg-white/80 backdrop-blur-xl">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-primary-50 rounded-lg">
                                <Activity className="h-5 w-5 text-primary-600" />
                            </div>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 uppercase text-[9px] font-black tracking-widest">
                                {activeTab === 'all' ? 'System Wide' : `${activeTab} stats`}
                            </Badge>
                        </div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Avg Sentiment</p>
                        <h3 className="text-3xl font-black text-slate-900 mt-1">
                            {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "N/A"}
                            {stats.avgRating > 0 && <span className="text-sm text-slate-400 font-bold ml-1">/ 5.0</span>}
                        </h3>
                        <Progress value={stats.avgRating * 20} className="h-1.5 mt-4" />
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white/80 backdrop-blur-xl">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-emerald-50 rounded-lg">
                                <ThumbsUp className="h-5 w-5 text-emerald-600" />
                            </div>
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 uppercase text-[9px] font-black tracking-widest">
                                Positive
                            </Badge>
                        </div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Helpful Recs</p>
                        <h3 className="text-3xl font-black text-slate-900 mt-1">
                            {stats.helpfulCount}
                        </h3>
                        <p className="text-xs text-slate-400 mt-4 font-semibold italic">User-verified accuracy</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white/80 backdrop-blur-xl">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-rose-50 rounded-lg">
                                <ThumbsDown className="h-5 w-5 text-rose-600" />
                            </div>
                            <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-100 uppercase text-[9px] font-black tracking-widest">
                                Issues
                            </Badge>
                        </div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Not Relevant</p>
                        <h3 className="text-3xl font-black text-slate-900 mt-1">
                            {stats.notHelpfulCount}
                        </h3>
                        <p className="text-xs text-slate-400 mt-4 font-semibold italic">Needs engine tuning</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white/80 backdrop-blur-xl">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-amber-50 rounded-lg">
                                <MessageSquare className="h-5 w-5 text-amber-600" />
                            </div>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100 uppercase text-[9px] font-black tracking-widest">
                                Volume
                            </Badge>
                        </div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Reviews</p>
                        <h3 className="text-3xl font-black text-slate-900 mt-1">{stats.totalReviews}</h3>
                        <p className="text-xs text-slate-400 mt-4 font-semibold italic">Live interaction stream</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <TabsList className="bg-white/50 backdrop-blur-md border border-slate-200 p-1 h-12 rounded-xl">
                        <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 font-bold uppercase text-xs tracking-wider">
                            All Feedback
                        </TabsTrigger>
                        <TabsTrigger value="healthcare" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 font-bold uppercase text-xs tracking-wider">
                            Healthcare
                        </TabsTrigger>
                        <TabsTrigger value="education" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 font-bold uppercase text-xs tracking-wider">
                            Education
                        </TabsTrigger>
                        <TabsTrigger value="schemes" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 font-bold uppercase text-xs tracking-wider">
                            Schemes
                        </TabsTrigger>
                        <TabsTrigger value="recommendation" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 font-bold uppercase text-xs tracking-wider">
                            AI Engine
                        </TabsTrigger>
                        <TabsTrigger value="platform" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 font-bold uppercase text-xs tracking-wider">
                            Platform
                        </TabsTrigger>
                    </TabsList>

                    <div className="relative w-full lg:w-72 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-primary-500 transition-colors" />
                        <Input 
                            placeholder="Search feedback content..." 
                            className="pl-10 h-12 rounded-xl border-slate-200 bg-white/50 focus:bg-white transition-all shadow-sm focus:shadow-md"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <TabsContent value={activeTab} className="mt-0">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1,2,3,4,5,6].map(i => (
                                <div key={i} className="h-64 rounded-3xl bg-slate-100 animate-pulse border border-slate-200/50" />
                            ))}
                        </div>
                    ) : filteredFeedbacks.length === 0 ? (
                        <Card className="border-2 border-dashed border-slate-200 bg-transparent py-24 rounded-3xl">
                            <CardContent className="flex flex-col items-center justify-center text-center">
                                <div className="p-4 bg-slate-100 rounded-full mb-4">
                                    <MessageSquare className="h-10 w-10 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 uppercase">No {activeTab} Data</h3>
                                <p className="text-slate-500 max-w-sm mt-2 font-medium">
                                    There are currently no feedback entries for the selected category. User interactions will appear here in real-time.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredFeedbacks.map((fb) => (
                                <Card key={fb._id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-slate-100">
                                    <CardContent className="p-6">
                                        {/* Entry Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-700 font-black border border-primary-100 uppercase">
                                                    {fb.userId?.student_name?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 text-sm leading-none mb-1">
                                                        {fb.userId?.student_name || 'Anonymous User'}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        {fb.createdAt ? format(new Date(fb.createdAt), 'MMM dd, yyyy') : 'Recently'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className={`${getModuleColor(fb.module)} border capitalize font-black h-6 px-3 rounded-lg text-[10px] tracking-widest`}>
                                                {fb.module}
                                            </Badge>
                                        </div>

                                        {/* Entry Content */}
                                        <div className="min-h-[80px]">
                                            {fb.type === 'rating' && (
                                                <div className="mb-3">
                                                    {renderStars(fb.rating)}
                                                </div>
                                            )}
                                            
                                            {fb.type === 'recommendation_feedback' && (
                                                <div className="mb-3 flex items-center gap-2">
                                                    {fb.reaction === 'helpful' ? (
                                                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black text-[9px] py-1 uppercase tracking-widest">
                                                            <ThumbsUp className="h-3 w-3 mr-1" /> Accurate Rec
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-rose-50 text-rose-700 border-rose-100 font-black text-[9px] py-1 uppercase tracking-widest">
                                                            <ThumbsDown className="h-3 w-3 mr-1" /> Not Relevant
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}

                                            <p className="text-slate-600 text-sm font-bold leading-relaxed italic line-clamp-3 group-hover:line-clamp-none transition-all">
                                                "{fb.comment || (fb.type === 'recommendation_feedback' ? 'User reaction captured for AI engine.' : 'No written review provided.')}"
                                            </p>
                                        </div>

                                        {/* Entry Footer */}
                                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                                {getModuleIcon(fb.module)}
                                                {fb.type.replace('_', ' ')}
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 rounded-lg">
                                                <ArrowUpRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default FeedbackDashboard;
