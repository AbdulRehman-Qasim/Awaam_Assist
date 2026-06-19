/**
 * HospitalComparePanel.tsx — Enhanced with AI-powered Reddit community comparison
 * Shows hospitals side-by-side with 6 category ratings sourced from Reddit.
 */

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Scale, X, MapPin, Building2, Activity, Search, Trash2,
    MessageCircle, Stethoscope, Sparkles, Clock, HandHeart,
    Banknote, Trophy, Loader2, AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { hospitalPublicAPI, HospitalReviewData, CategoryRatings } from "@/services/hospitalAPI";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Hospital {
    _id: string;
    "Hospital Name": string;
    City: string;
    Tehsil: string;
    Cateogry: string;
    SerialNum: number;
}

// ── Category config (matches backend) ────────────────────────────────────────

const CATEGORIES: {
    key: keyof CategoryRatings;
    label: string;
    emoji: string;
    description: string;
}[] = [
    { key: "doctorQuality",       label: "Doctor Quality",  emoji: "👨‍⚕️", description: "Expertise & attitude"       },
    { key: "cleanliness",         label: "Cleanliness",     emoji: "🧹", description: "Hygiene & sanitation"        },
    { key: "waitTime",            label: "Wait Time",       emoji: "⏱️", description: "Speed of service"           },
    { key: "staffBehavior",       label: "Staff Behavior",  emoji: "🤝", description: "Nurses & reception"         },
    { key: "facilitiesEquipment", label: "Facilities",      emoji: "🏥", description: "Equipment & infrastructure" },
    { key: "costValue",           label: "Cost & Value",    emoji: "💰", description: "Affordability & billing"    },
];

// ── Color helpers ─────────────────────────────────────────────────────────────

function getColor(val: number | null) {
    if (val === null) return { bar: "#e2e8f0", text: "#94a3b8", bg: "#f8fafc", label: "N/A" };
    if (val >= 8.5)  return { bar: "#10b981", text: "#059669", bg: "#ecfdf5", label: "Excellent"  };
    if (val >= 7)    return { bar: "#3b82f6", text: "#2563eb", bg: "#eff6ff", label: "Good"       };
    if (val >= 5)    return { bar: "#f59e0b", text: "#d97706", bg: "#fffbeb", label: "Average"    };
    if (val >= 3)    return { bar: "#f97316", text: "#ea580c", bg: "#fff7ed", label: "Below Avg"  };
    return                  { bar: "#ef4444", text: "#dc2626", bg: "#fef2f2", label: "Poor"       };
}

// ── Single comparison row for one category ────────────────────────────────────

const CategoryRow = ({
    category,
    hospitals,
    reviews,
}: {
    category: typeof CATEGORIES[number];
    hospitals: Hospital[];
    reviews: Record<string, HospitalReviewData | null>;
}) => {
    // Find the best score among all hospitals for this category
    const values = hospitals.map((h) => reviews[h._id]?.ratings?.[category.key] ?? null);
    const bestVal = Math.max(...values.filter((v): v is number => v !== null));

    return (
        <div className="grid gap-3" style={{ gridTemplateColumns: `180px repeat(${hospitals.length}, 1fr)` }}>
            {/* Category label */}
            <div className="flex items-center gap-2 py-3">
                <span className="text-base">{category.emoji}</span>
                <div>
                    <p className="text-xs font-black text-slate-700">{category.label}</p>
                    <p className="text-[10px] text-slate-400">{category.description}</p>
                </div>
            </div>

            {/* Score per hospital */}
            {hospitals.map((h) => {
                const val = reviews[h._id]?.ratings?.[category.key] ?? null;
                const color = getColor(val);
                const isBest = val !== null && val === bestVal && hospitals.length > 1;

                return (
                    <div key={h._id} className="py-3 flex flex-col items-center justify-center gap-1.5">
                        {/* Score circle */}
                        <div
                            className="relative w-14 h-14 rounded-full flex flex-col items-center justify-center border-2 transition-all"
                            style={{ borderColor: color.bar, background: color.bg }}
                        >
                            {val !== null ? (
                                <>
                                    <span className="text-base font-black leading-none" style={{ color: color.text }}>
                                        {val.toFixed(1)}
                                    </span>
                                    <span className="text-[8px] font-semibold" style={{ color: color.text }}>
                                        /10
                                    </span>
                                </>
                            ) : (
                                <span className="text-xs text-slate-400 font-bold">—</span>
                            )}
                            {/* Best badge */}
                            {isBest && (
                                <div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center shadow-sm">
                                    <Trophy className="w-2.5 h-2.5 text-white" />
                                </div>
                            )}
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                    width: val !== null ? `${(val / 10) * 100}%` : "0%",
                                    background: color.bar,
                                }}
                            />
                        </div>

                        {/* Label */}
                        <span
                            className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: color.bg, color: color.text }}
                        >
                            {color.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

// ── Main component ─────────────────────────────────────────────────────────────

const HospitalComparePanel = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const prefix = location.pathname.startsWith('/education') ? '/education' : '/company';
    const { toast } = useToast();
    const [hospitalsToCompare, setHospitalsToCompare] = useState<Hospital[]>([]);
    const [reviews, setReviews] = useState<Record<string, HospitalReviewData | null>>({});
    const [reviewsLoading, setReviewsLoading] = useState(false);

    // Load from localStorage
    useEffect(() => {
        const savedData = localStorage.getItem("hospital_compare_data");
        const savedIds  = localStorage.getItem("hospital_compare_list");
        if (savedData && savedIds) {
            const ids: string[]    = JSON.parse(savedIds);
            const all: Hospital[]  = JSON.parse(savedData);
            setHospitalsToCompare(all.filter((h) => ids.includes(h._id)));
        }
    }, []);

    // Fetch Reddit review data whenever hospitals change
    useEffect(() => {
        if (hospitalsToCompare.length === 0) return;
        const ids = hospitalsToCompare.map((h) => h._id);
        setReviewsLoading(true);
        hospitalPublicAPI
            .getCompareReviews(ids)
            .then(setReviews)
            .finally(() => setReviewsLoading(false));
    }, [hospitalsToCompare]);

    const removeFromCompare = (id: string) => {
        const newList = hospitalsToCompare.filter((h) => h._id !== id);
        setHospitalsToCompare(newList);
        localStorage.setItem("hospital_compare_list", JSON.stringify(newList.map((h) => h._id)));
        localStorage.setItem("hospital_compare_data", JSON.stringify(newList));
        toast({ title: "Hospital Removed", description: "Hospital removed from comparison." });
    };

    const clearAll = () => {
        setHospitalsToCompare([]);
        localStorage.setItem("hospital_compare_list", JSON.stringify([]));
        localStorage.setItem("hospital_compare_data", JSON.stringify([]));
        toast({ title: "Comparison Cleared", description: "All hospitals removed from comparison." });
    };

    // ── Empty state ────────────────────────────────────────────────────────────
    if (hospitalsToCompare.length === 0) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center py-24 text-center px-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 mb-4">
                    <Scale className="h-8 w-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Hospitals to Compare</h3>
                <p className="text-gray-500 mb-6 max-w-sm">
                    Search for hospitals and click the compare icon (⚖) on any card to add them here.
                </p>
                <Button
                    onClick={() => navigate(`${prefix}/hospital-search`)}
                    className="gap-2 bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                    <Search className="h-4 w-4" />
                    Search Hospitals
                </Button>
            </div>
        );
    }

    // ── Overall ratings helper ─────────────────────────────────────────────────
    const getOverall = (id: string) => reviews[id]?.overallRating ?? null;

    return (
        <div className="w-full bg-white p-6 md:p-8 space-y-8">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-400 text-white shadow-md">
                        <Scale className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Compare Hospitals</h1>
                        <p className="text-sm text-gray-500">Side-by-side comparison with Reddit community ratings</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAll}
                    className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
                >
                    <Trash2 className="h-4 w-4" />
                    Clear All
                </Button>
            </div>

            {/* ── Hospital cards header row ────────────────────────────────── */}
            <div
                className="grid gap-4"
                style={{ gridTemplateColumns: `180px repeat(${hospitalsToCompare.length}, 1fr)` }}
            >
                {/* empty label column */}
                <div />

                {hospitalsToCompare.map((hospital) => {
                    const overall     = getOverall(hospital._id);
                    const overallColor = getColor(overall);
                    const reviewDoc   = reviews[hospital._id];
                    const mentions    = reviewDoc?.totalMentions ?? 0;

                    return (
                        <Card key={hospital._id} className="border-cyan-200 border-2 relative">
                            <button
                                onClick={() => removeFromCompare(hospital._id)}
                                className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>

                            <CardHeader className="pb-2 pr-8">
                                <Badge
                                    variant={hospital.Cateogry === "Private" ? "secondary" : "default"}
                                    className="w-fit mb-2"
                                >
                                    <Activity className="h-3 w-3 mr-1" />
                                    {hospital.Cateogry}
                                </Badge>
                                <CardTitle className="text-sm font-bold text-gray-900 line-clamp-2">
                                    {hospital["Hospital Name"]}
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-2 pb-4">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin className="h-3.5 w-3.5 text-cyan-500 flex-shrink-0" />
                                    <span className="text-xs">{hospital.City}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Building2 className="h-3.5 w-3.5 text-cyan-500 flex-shrink-0" />
                                    <span className="text-xs">{hospital.Tehsil}</span>
                                </div>

                                {/* Overall community rating */}
                                {overall !== null && (
                                    <div
                                        className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl"
                                        style={{ background: overallColor.bg }}
                                    >
                                        <MessageCircle className="h-3.5 w-3.5 flex-shrink-0" style={{ color: overallColor.text }} />
                                        <div>
                                            <p className="text-[9px] font-black uppercase" style={{ color: overallColor.text }}>
                                                Community Overall
                                            </p>
                                            <p className="text-base font-black leading-none" style={{ color: overallColor.text }}>
                                                {overall.toFixed(1)}<span className="text-[10px] font-semibold"> /10</span>
                                            </p>
                                        </div>
                                        {mentions > 0 && (
                                            <span className="ml-auto text-[9px] text-slate-400">
                                                {mentions} posts
                                            </span>
                                        )}
                                    </div>
                                )}

                                {reviewsLoading && overall === null && (
                                    <div className="mt-2 flex items-center gap-1.5 text-slate-400 text-[10px]">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Loading ratings…
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}

                {/* Add another slot */}
                {hospitalsToCompare.length < 3 && (
                    <Card
                        className="border-dashed border-2 border-gray-200 flex items-center justify-center cursor-pointer hover:border-cyan-300 hover:bg-cyan-50 transition-all"
                        onClick={() => navigate(`${prefix}/hospital-search`)}
                        style={{ minHeight: 160 }}
                    >
                        <div className="text-center p-6">
                            <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">Add another hospital</p>
                        </div>
                    </Card>
                )}
            </div>

            {/* ── Community Ratings Comparison ─────────────────────────────── */}
            <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                {/* Section header */}
                <div
                    className="px-6 py-4 flex items-center gap-3"
                    style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}
                >
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 text-orange-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white">Community Ratings</h2>
                        <p className="text-[11px] text-white/60">
                            AI-analyzed from Reddit discussions · auto-updated weekly
                        </p>
                    </div>
                    {reviewsLoading && (
                        <Loader2 className="h-4 w-4 text-white/40 animate-spin ml-auto" />
                    )}
                </div>

                {/* Column headers */}
                <div
                    className="grid gap-3 px-6 py-3 bg-slate-50 border-b border-slate-100"
                    style={{ gridTemplateColumns: `180px repeat(${hospitalsToCompare.length}, 1fr)` }}
                >
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Category</div>
                    {hospitalsToCompare.map((h) => (
                        <div key={h._id} className="text-center text-[10px] font-black text-slate-600 uppercase tracking-wider truncate">
                            {h["Hospital Name"]}
                        </div>
                    ))}
                </div>

                {/* Category rows */}
                <div className="px-6 divide-y divide-slate-50">
                    {CATEGORIES.map((cat) => (
                        <CategoryRow
                            key={cat.key}
                            category={cat}
                            hospitals={hospitalsToCompare}
                            reviews={reviews}
                        />
                    ))}
                </div>

                {/* Summary footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                    <div
                        className="grid gap-3"
                        style={{ gridTemplateColumns: `180px repeat(${hospitalsToCompare.length}, 1fr)` }}
                    >
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center">
                            AI Summary
                        </div>
                        {hospitalsToCompare.map((h) => {
                            const reviewDoc = reviews[h._id];
                            return (
                                <div key={h._id} className="text-center">
                                    {reviewDoc?.summary ? (
                                        <p className="text-[10px] text-slate-500 italic leading-relaxed">
                                            "{reviewDoc.summary}"
                                        </p>
                                    ) : reviewDoc?.status === "no_data" ? (
                                        <div className="flex items-center justify-center gap-1 text-slate-300">
                                            <AlertCircle className="h-3 w-3" />
                                            <span className="text-[10px]">No Reddit data</span>
                                        </div>
                                    ) : reviewsLoading ? (
                                        <div className="flex items-center justify-center gap-1 text-slate-300">
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            <span className="text-[10px]">Analyzing…</span>
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Basic info table ──────────────────────────────────────────── */}
            <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                    <h2 className="text-sm font-black text-slate-700">Hospital Details</h2>
                </div>
                {[
                    { label: "City",       fn: (h: Hospital) => h.City       },
                    { label: "Tehsil",     fn: (h: Hospital) => h.Tehsil     },
                    { label: "Category",   fn: (h: Hospital) => h.Cateogry   },
                    { label: "Serial No.", fn: (h: Hospital) => `#${h.SerialNum}` },
                ].map(({ label, fn }, i) => (
                    <div
                        key={label}
                        className="grid gap-3 px-6 py-3 border-b border-slate-50"
                        style={{
                            gridTemplateColumns: `180px repeat(${hospitalsToCompare.length}, 1fr)`,
                            background: i % 2 === 0 ? "#fff" : "#f8fafc",
                        }}
                    >
                        <span className="text-xs font-black text-slate-500">{label}</span>
                        {hospitalsToCompare.map((h) => (
                            <span key={h._id} className="text-xs text-slate-700 font-semibold text-center">
                                {fn(h)}
                            </span>
                        ))}
                    </div>
                ))}
            </div>

            {/* attribution */}
            <p className="text-[10px] text-slate-300 text-center pb-4">
                Community ratings are auto-generated from Reddit discussions using AI analysis · Not entered by hospital administrators
            </p>
        </div>
    );
};

export default HospitalComparePanel;
