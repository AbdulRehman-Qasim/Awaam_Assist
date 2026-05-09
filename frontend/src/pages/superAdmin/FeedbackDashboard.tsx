import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
    MessageSquare, 
    Star, 
    Search, 
    ThumbsUp, 
    ThumbsDown, 
    Calendar,
    ChevronDown,
    ChevronUp,
    Filter,
    RefreshCw,
    MoreHorizontal
} from "lucide-react";
import { FeedbackService } from "@/services/feedbackService";
import { format } from "date-fns";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const FeedbackDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    
    // Filters
    const [moduleFilter, setModuleFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [ratingFilter, setRatingFilter] = useState("all");

    const loadData = async () => {
        setLoading(true);
        try {
            const feedbackRes = await FeedbackService.getAllFeedback();
            if (feedbackRes.success) {
                setFeedbacks(feedbackRes.data);
            }
        } catch (error) {
            console.error("Error loading feedback data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredFeedbacks = useMemo(() => {
        return feedbacks.filter(fb => {
            const matchesModule = moduleFilter === "all" || fb.module === moduleFilter;
            const matchesType = typeFilter === "all" || fb.type === typeFilter;
            const matchesRating = ratingFilter === "all" || (fb.rating && fb.rating.toString() === ratingFilter);
            
            const matchesSearch = !searchQuery || 
                                 fb.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 fb.userId?.student_name?.toLowerCase().includes(searchQuery.toLowerCase());
            
            return matchesModule && matchesType && matchesRating && matchesSearch;
        });
    }, [feedbacks, moduleFilter, typeFilter, ratingFilter, searchQuery]);

    const toggleRow = (id: string) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const getModuleBadge = (module: string) => {
        const styles: Record<string, string> = {
            healthcare: "bg-rose-50 text-rose-700 border-rose-100",
            education: "bg-indigo-50 text-indigo-700 border-indigo-100",
            schemes: "bg-emerald-50 text-emerald-700 border-emerald-100",
            platform: "bg-amber-50 text-amber-700 border-amber-100"
        };
        return (
            <Badge variant="outline" className={`${styles[module] || "bg-slate-50 text-slate-700 border-slate-100"} capitalize font-medium text-[10px]`}>
                {module}
            </Badge>
        );
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                        key={star} 
                        className={`h-3 w-3 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} 
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Feedback Intelligence</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">
                        Analyze user satisfaction and sentiment across all platform modules.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm"
                        className="rounded-lg h-9"
                        onClick={loadData}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button size="sm" className="rounded-lg h-9 bg-slate-900">
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input 
                                placeholder="Search by user or content..." 
                                className="pl-9 h-10 border-slate-200 rounded-lg text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-500">Module:</span>
                                <Select value={moduleFilter} onValueChange={setModuleFilter}>
                                    <SelectTrigger className="w-[130px] h-9 border-slate-200 rounded-lg text-xs">
                                        <SelectValue placeholder="All Modules" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Modules</SelectItem>
                                        <SelectItem value="education">Education</SelectItem>
                                        <SelectItem value="schemes">Schemes</SelectItem>
                                        <SelectItem value="healthcare">Healthcare</SelectItem>
                                        <SelectItem value="platform">Platform</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-500">Type:</span>
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-[130px] h-9 border-slate-200 rounded-lg text-xs">
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="rating">Rating</SelectItem>
                                        <SelectItem value="recommendation_feedback">AI Engine</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-500">Rating:</span>
                                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                                    <SelectTrigger className="w-[110px] h-9 border-slate-200 rounded-lg text-xs">
                                        <SelectValue placeholder="All" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Ratings</SelectItem>
                                        <SelectItem value="5">5 Stars</SelectItem>
                                        <SelectItem value="4">4 Stars</SelectItem>
                                        <SelectItem value="3">3 Stars</SelectItem>
                                        <SelectItem value="2">2 Stars</SelectItem>
                                        <SelectItem value="1">1 Star</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table Area */}
            <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Module</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Metric</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-4">
                                            <div className="h-10 bg-slate-50 rounded-lg w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredFeedbacks.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <MessageSquare className="h-8 w-8 text-slate-200 mb-3" />
                                            <p className="text-sm font-medium text-slate-500">No feedback entries found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredFeedbacks.map((fb) => (
                                    <React.Fragment key={fb._id}>
                                        <tr 
                                            className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${expandedRow === fb._id ? 'bg-slate-50/80' : ''}`}
                                            onClick={() => toggleRow(fb._id)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold">
                                                        {fb.userId?.student_name?.[0] || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {fb.userId?.student_name || 'Anonymous User'}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-medium">{fb.userId?.email || 'No email'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getModuleBadge(fb.module)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-medium text-slate-600 capitalize">
                                                    {fb.type.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {fb.type === 'rating' ? (
                                                    renderStars(fb.rating)
                                                ) : (
                                                    <div className="flex items-center gap-1.5">
                                                        {fb.reaction === 'helpful' ? (
                                                            <ThumbsUp className="h-3 w-3 text-emerald-500" />
                                                        ) : (
                                                            <ThumbsDown className="h-3 w-3 text-rose-500" />
                                                        )}
                                                        <span className="text-xs font-medium text-slate-700 capitalize">{fb.reaction}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                                                {fb.createdAt ? format(new Date(fb.createdAt), 'MMM dd, yyyy') : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400">
                                                    {expandedRow === fb._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </Button>
                                            </td>
                                        </tr>
                                        {expandedRow === fb._id && (
                                            <tr className="bg-slate-50/30">
                                                <td colSpan={6} className="px-6 py-4 border-l-2 border-slate-900">
                                                    <div className="py-2">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Comment / Details</p>
                                                        <p className="text-sm text-slate-700 leading-relaxed italic">
                                                            "{fb.comment || (fb.type === 'recommendation_feedback' ? 'User reaction captured for AI engine evaluation.' : 'No additional comments provided.')}"
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

import React from "react";
export default FeedbackDashboard;
