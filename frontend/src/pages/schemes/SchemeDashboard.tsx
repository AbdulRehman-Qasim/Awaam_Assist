import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Search,
    Building2,
    Heart,
    Scale,
    Calculator,
    ChevronDown,
    Sparkles,
    Filter,
    MapPin,
    Phone,
    Mail,
    Globe,
    ExternalLink,
    CheckCircle2,
    XCircle,
    Award,
    TrendingUp,
    Users,
    DollarSign,
} from "lucide-react";
import { ModuleFeedback } from "@/components/shared/ModuleFeedback";
import { checkSchemeEligibility, getSchemeCategories, getSchemeProvinces, type Scheme } from "@/data/schemes";
import { schemeAPI } from "@/services/schemeAPI";
import { useEffect } from "react";


const SchemeDashboard = () => {
    const { toast } = useToast();

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedProvince, setSelectedProvince] = useState("all");
    const [sortBy, setSortBy] = useState("relevance");

    // Eligibility checker state
    const [isEligibilityExpanded, setIsEligibilityExpanded] = useState(true);
    const [eligibilityFilters, setEligibilityFilters] = useState({
        income: "",
        age: "",
        province: "all",
        city: "",
        category: "all",
        employmentStatus: "all",
        familySize: "",
        gender: "all",
        educationLevel: "all",
    });
    const [showEligibilityResults, setShowEligibilityResults] = useState(false);

    // Detail modal state
    const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Schemes data from API
    const [schemes, setSchemes] = useState<Scheme[]>([]);
    const [loading, setLoading] = useState(true);

    // Favorites state (localStorage)
    const [favorites, setFavorites] = useState<string[]>(() => {
        const saved = localStorage.getItem("scheme_favorites");
        return saved ? JSON.parse(saved) : [];
    });

    // Compare state (localStorage)
    const [compareList, setCompareList] = useState<string[]>(() => {
        const saved = localStorage.getItem("scheme_compare_list");
        return saved ? JSON.parse(saved) : [];
    });

    // Fetch schemes from API
    useEffect(() => {
        const fetchSchemes = async () => {
            try {
                setLoading(true);
                const response = await schemeAPI.getAllSchemes();
                if (response.success && response.data) {
                    setSchemes(response.data);
                }
            } catch (error) {
                console.error("Error fetching schemes:", error);
                toast({
                    title: "Error Loading Schemes",
                    description: "Failed to load schemes from server",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchSchemes();
    }, []);

    // Categories and provinces
    const categories = getSchemeCategories();
    const provinces = getSchemeProvinces();

    // ═══════════════════════════════════════════════════════════════════════════
    // ELIGIBILITY FILTER PIPELINE  (order matters — applied sequentially)
    // ═══════════════════════════════════════════════════════════════════════════
    const filteredSchemes = useMemo(() => {
        let result = [...schemes];

        // ── 0. Full-text search ────────────────────────────────────────────────
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(s =>
                s.schemeName.toLowerCase().includes(q) ||
                s.description.toLowerCase().includes(q) ||
                s.department.toLowerCase().includes(q) ||
                s.category.toLowerCase().includes(q)
            );
        }

        // ── RESOLVE ACTIVE FILTERS ─────────────────────────────────────────────
        // Eligibility checker values take priority over filter bar values
        const activeProvince =
            eligibilityFilters.province !== "all" ? eligibilityFilters.province :
            selectedProvince    !== "all"          ? selectedProvince            : null;

        const activeCategory =
            eligibilityFilters.category !== "all" ? eligibilityFilters.category :
            selectedCategory    !== "all"          ? selectedCategory            : null;

        const userIncome      = showEligibilityResults ? (parseFloat(eligibilityFilters.income) || 0) : null;
        const userAge         = showEligibilityResults ? (parseInt(eligibilityFilters.age)       || 0) : null;
        const userEmployment  = showEligibilityResults && eligibilityFilters.employmentStatus !== "all"
                                ? eligibilityFilters.employmentStatus : null;
        // 'gender' field now used as Target Beneficiary Category
        const userBeneficiary = showEligibilityResults && eligibilityFilters.gender !== "all"
                                ? eligibilityFilters.gender : null;

        // ── STEP 1: PROVINCE ───────────────────────────────────────────────────
        // STRICT equality — Federal NOT included unless explicitly selected
        if (activeProvince) {
            result = result.filter(s => s.province === activeProvince);
            console.log(`[Pipeline:Province] "${activeProvince}" → ${result.length} schemes`);
        }

        // ── STEP 2: SCHEME CATEGORY ────────────────────────────────────────────
        if (activeCategory) {
            const needle = activeCategory.toLowerCase().trim();
            result = result.filter(s => s.category.toLowerCase().trim() === needle);
            console.log(`[Pipeline:Category] "${activeCategory}" → ${result.length} schemes`);
        }

        // ── STEP 3: INCOME ─────────────────────────────────────────────────────
        if (userIncome !== null) {
            result = result.filter(s => {
                const min = s.eligibility?.income?.min ?? 0;
                const max = s.eligibility?.income?.max ?? Infinity;
                return userIncome >= min && userIncome <= max;
            });
            console.log(`[Pipeline:Income] PKR ${userIncome} → ${result.length} schemes`);
        }

        // ── STEP 4: AGE ────────────────────────────────────────────────────────
        if (userAge !== null) {
            result = result.filter(s => {
                const min = s.eligibility?.age?.min ?? 0;
                const max = s.eligibility?.age?.max ?? 150;
                return userAge >= min && userAge <= max;
            });
            console.log(`[Pipeline:Age] Age ${userAge} → ${result.length} schemes`);
        }

        // ── STEP 5: EMPLOYMENT STATUS (STRICT) ────────────────────────────────
        // RULES:
        //   • empty array  → scheme NOT eligible (scheme has restrictions, user must match)
        //   • includes "Any" → pass all
        //   • else          → EXACT match required (no fuzzy, no includes())
        if (userEmployment) {
            result = result.filter(s => {
                const empList: string[] = s.eligibility?.employmentStatus || [];
                if (empList.length === 0) return false;         // STRICT: empty = has restriction, no match
                if (empList.includes("Any")) return true;       // scheme accepts any employment status
                return empList.includes(userEmployment);        // EXACT match required
            });
            console.log(`[Pipeline:Employment] "${userEmployment}" → ${result.length} schemes`);
        }

        // ── STEP 6: TARGET BENEFICIARY CATEGORY ────────────────────────────────
        // Uses scheme.eligibility.categories[] (e.g. ["Youth", "Low Income Family"])
        // RULES:
        //   • empty array  → scheme has no restriction, pass all
        //   • else          → EXACT match: userBeneficiary MUST be in the array
        if (userBeneficiary) {
            result = result.filter(s => {
                const cats: string[] = s.eligibility?.categories || [];
                if (cats.length === 0) return true;             // no beneficiary restriction
                return cats.includes(userBeneficiary);          // EXACT match required
            });
            console.log(`[Pipeline:Beneficiary] "${userBeneficiary}" → ${result.length} schemes`);
        }

        // ── STEP 7: SORT ───────────────────────────────────────────────────────
        if (showEligibilityResults) {
            // When eligibility check is active: sort by benefit amount desc (most valuable first)
            result.sort((a, b) => (b.benefits?.financial?.amount || 0) - (a.benefits?.financial?.amount || 0));
        } else if (sortBy === "name") {
            result.sort((a, b) => a.schemeName.localeCompare(b.schemeName));
        } else if (sortBy === "benefit-high") {
            result.sort((a, b) => (b.benefits?.financial?.amount || 0) - (a.benefits?.financial?.amount || 0));
        } else if (sortBy === "benefit-low") {
            result.sort((a, b) => (a.benefits?.financial?.amount || 0) - (b.benefits?.financial?.amount || 0));
        }

        console.log(`[Pipeline:Final] ${result.length} schemes | province:${activeProvince||"all"} category:${activeCategory||"all"} income:${userIncome??"–"} age:${userAge??"–"} employment:${userEmployment||"–"} beneficiary:${userBeneficiary||"–"}`);
        return result;

    }, [schemes, searchQuery, selectedCategory, selectedProvince, sortBy, showEligibilityResults, eligibilityFilters]);








    // Handle eligibility check
    const handleEligibilityCheck = () => {
        if (!eligibilityFilters.income || !eligibilityFilters.age) {
            toast({
                title: "Incomplete Information",
                description: "Please fill in at least Income and Age to check eligibility.",
                variant: "destructive",
            });
            return;
        }

        setShowEligibilityResults(true);
        toast({
            title: "Eligibility Check Complete",
            description: `Found ${filteredSchemes.length} matching schemes for your profile.`,
        });
    };

    // Toggle favorite
    const toggleFavorite = (schemeId: string) => {
        const newFavorites = favorites.includes(schemeId)
            ? favorites.filter((id) => id !== schemeId)
            : [...favorites, schemeId];

        setFavorites(newFavorites);
        localStorage.setItem("scheme_favorites", JSON.stringify(newFavorites));

        toast({
            title: favorites.includes(schemeId) ? "Removed from Favorites" : "Added to Favorites",
            description: favorites.includes(schemeId)
                ? "Scheme removed from your favorites"
                : "Scheme added to your favorites",
        });
    };

    // Toggle compare
    const toggleCompare = (e: React.MouseEvent, scheme: Scheme) => {
        e.stopPropagation();
        const isInCompare = compareList.includes(scheme.schemeId);
        const savedData: Scheme[] = JSON.parse(localStorage.getItem("scheme_compare_data") || "[]");
        if (isInCompare) {
            const newList = compareList.filter((id) => id !== scheme.schemeId);
            const newData = savedData.filter((s) => s.schemeId !== scheme.schemeId);
            setCompareList(newList);
            localStorage.setItem("scheme_compare_list", JSON.stringify(newList));
            localStorage.setItem("scheme_compare_data", JSON.stringify(newData));
            toast({ title: "Removed from Compare", description: "Scheme removed from comparison list." });
        } else {
            if (compareList.length >= 3) {
                toast({ title: "Comparison Limit Reached", description: "You can compare up to 3 schemes at a time.", variant: "destructive" });
                return;
            }
            const newList = [...compareList, scheme.schemeId];
            const newData = [...savedData.filter((s) => s.schemeId !== scheme.schemeId), scheme];
            setCompareList(newList);
            localStorage.setItem("scheme_compare_list", JSON.stringify(newList));
            localStorage.setItem("scheme_compare_data", JSON.stringify(newData));
            toast({ title: "Added to Compare", description: "Scheme added to comparison list." });
        }
    };

    // Open scheme details
    const openSchemeDetails = (scheme: Scheme) => {
        setSelectedScheme(scheme);
        setIsDetailModalOpen(true);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* ── All static content renders immediately, no loader gate ── */}
            <>
                {/* Hero Section */}
                    <section className="module-hero hero-gradient-schemes">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, rgba(255,255,255,0.3) 0%, transparent 60%)' }} />
                        <div className="absolute top-6 right-8 w-32 h-32 rounded-full bg-white/5 animate-float" />
                        <div className="absolute bottom-8 left-10 w-20 h-20 rounded-2xl bg-white/5 animate-float delay-300" />

                        <div className="container relative z-10 px-4 py-12">
                            <div className="max-w-4xl mx-auto text-center">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}>
                                    <Award className="h-4 w-4" />
                                    <span>Government Schemes & Citizen Benefits</span>
                                </div>

                                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
                                    Discover{" "}<span style={{ color: '#c4b5fd' }}>Government Schemes</span>
                                </h1>

                                <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10">
                                    Find government programs and benefits you're eligible for. Check eligibility, compare schemes, and apply with confidence.
                                </p>

                                {/* Search Bar */}
                                <div className="max-w-2xl mx-auto">
                                    <div className="relative flex items-center">
                                        <Search className="absolute left-4 h-5 w-5 text-white/60" />
                                        <Input
                                            type="text"
                                            placeholder="Search schemes by name, category, or department..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="h-14 pl-12 pr-4 text-base rounded-2xl border-2 border-white/25 bg-white/15 text-white placeholder:text-white/50 focus:border-white/50 focus:bg-white/20 backdrop-blur-sm transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex flex-wrap items-center justify-center gap-8 mt-10">
                                    {[
                                        { icon: Building2,  value: `${schemes.length}+`,      label: 'Active Schemes' },
                                        { icon: TrendingUp, value: `20`,    label: 'Categories' },
                                    ].map(({ icon: Icon, value, label }) => (
                                        <div key={label} className="text-center">
                                            <div className="text-2xl font-black text-white">{value}</div>
                                            <div className="text-xs font-semibold text-white/60 uppercase tracking-wider">{label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Eligibility Checker */}
                    <Card className="border-2 overflow-hidden shadow-lg" style={{ borderColor: 'rgba(124,58,237,0.2)' }}>
                        <CardHeader
                            className="text-white cursor-pointer"
                            style={{ background: 'linear-gradient(135deg, #1e1b4b, #7c3aed)' }}
                            onClick={() => setIsEligibilityExpanded(!isEligibilityExpanded)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                                        <Calculator className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-white flex items-center gap-2">
                                            Check Your Eligibility
                                            <Sparkles className="h-4 w-4" />
                                        </CardTitle>
                                        <p className="text-sm text-white/80 mt-1">
                                            Enter your details to find matching schemes
                                        </p>
                                    </div>
                                </div>
                                <ChevronDown
                                    className={`h-5 w-5 transition-transform duration-300 ${isEligibilityExpanded ? "rotate-180" : ""
                                        }`}
                                />
                            </div>
                        </CardHeader>

                        <div
                            className={`overflow-hidden transition-all duration-300 ${isEligibilityExpanded ? "max-h-[1000px]" : "max-h-0"
                                }`}
                        >
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="income" className="text-sm font-medium">
                                            Monthly Income (PKR) *
                                        </Label>
                                        <Input
                                            id="income"
                                            type="number"
                                            placeholder="e.g., 25000"
                                            value={eligibilityFilters.income}
                                            onChange={(e) =>
                                                setEligibilityFilters({ ...eligibilityFilters, income: e.target.value })
                                            }
                                            min="0"
                                            className="h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="age" className="text-sm font-medium">
                                            Your Age *
                                        </Label>
                                        <Input
                                            id="age"
                                            type="number"
                                            placeholder="e.g., 25"
                                            value={eligibilityFilters.age}
                                            onChange={(e) =>
                                                setEligibilityFilters({ ...eligibilityFilters, age: e.target.value })
                                            }
                                            min="0"
                                            max="100"
                                            className="h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="province" className="text-sm font-medium">
                                            Province
                                        </Label>
                                        <Select
                                            value={eligibilityFilters.province}
                                            onValueChange={(value) =>
                                                setEligibilityFilters({ ...eligibilityFilters, province: value })
                                            }
                                        >
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Select Province" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Provinces</SelectItem>
                                                <SelectItem value="Punjab">Punjab</SelectItem>
                                                <SelectItem value="Sindh">Sindh</SelectItem>
                                                <SelectItem value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</SelectItem>
                                                <SelectItem value="Balochistan">Balochistan</SelectItem>
                                                <SelectItem value="Gilgit-Baltistan">Gilgit-Baltistan</SelectItem>
                                                <SelectItem value="Azad Jammu & Kashmir">Azad Jammu & Kashmir</SelectItem>
                                                <SelectItem value="Islamabad Capital Territory">Islamabad Capital Territory</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="category" className="text-sm font-medium">
                                            Category
                                        </Label>
                                        <Select
                                            value={eligibilityFilters.category}
                                            onValueChange={(value) =>
                                                setEligibilityFilters({ ...eligibilityFilters, category: value })
                                            }
                                        >
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Financial Assistance">Financial Assistance</SelectItem>
                                                <SelectItem value="Healthcare">Healthcare</SelectItem>
                                                <SelectItem value="Education">Education</SelectItem>
                                                <SelectItem value="Housing">Housing</SelectItem>
                                                <SelectItem value="Agriculture">Agriculture</SelectItem>
                                                <SelectItem value="Employment">Employment</SelectItem>
                                                <SelectItem value="Technology & Innovation">Technology &amp; Innovation</SelectItem>
                                                <SelectItem value="Fisheries">Fisheries</SelectItem>
                                                <SelectItem value="Livestock">Livestock</SelectItem>
                                                <SelectItem value="Tourism">Tourism</SelectItem>
                                                <SelectItem value="Women Empowerment">Women Empowerment</SelectItem>
                                                <SelectItem value="Water & Sanitation">Water &amp; Sanitation</SelectItem>
                                                <SelectItem value="Orphan Support">Orphan Support</SelectItem>
                                                <SelectItem value="Disabled Persons">Disabled Persons</SelectItem>
                                                <SelectItem value="Transportation">Transportation</SelectItem>
                                                <SelectItem value="Industrial Development">Industrial Development</SelectItem>
                                                <SelectItem value="Environment">Environment</SelectItem>
                                                <SelectItem value="Elderly Care">Elderly Care</SelectItem>
                                                <SelectItem value="Energy">Energy</SelectItem>
                                                <SelectItem value="Sports">Sports</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="employmentStatus" className="text-sm font-medium">
                                            Employment Status
                                        </Label>
                                        <Select
                                            value={eligibilityFilters.employmentStatus}
                                            onValueChange={(value) =>
                                                setEligibilityFilters({ ...eligibilityFilters, employmentStatus: value })
                                            }
                                        >
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Select Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Any</SelectItem>
                                                <SelectItem value="Employed">Employed</SelectItem>
                                                <SelectItem value="Unemployed">Unemployed</SelectItem>
                                                <SelectItem value="Self-Employed">Self-Employed</SelectItem>
                                                <SelectItem value="Student">Student</SelectItem>
                                                <SelectItem value="Freelancer">Freelancer</SelectItem>
                                                <SelectItem value="Business Owner">Business Owner</SelectItem>
                                                <SelectItem value="Farmer">Farmer</SelectItem>
                                                <SelectItem value="Daily Wage Worker">Daily Wage Worker</SelectItem>
                                                <SelectItem value="Retired">Retired</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="familySize" className="text-sm font-medium">
                                            Family Size
                                        </Label>
                                        <Input
                                            id="familySize"
                                            type="number"
                                            placeholder="e.g., 4"
                                            value={eligibilityFilters.familySize}
                                            onChange={(e) =>
                                                setEligibilityFilters({ ...eligibilityFilters, familySize: e.target.value })
                                            }
                                            min="1"
                                            max="20"
                                            className="h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="beneficiary" className="text-sm font-medium">
                                            Target Beneficiary
                                        </Label>
                                        <Select
                                            value={eligibilityFilters.gender}
                                            onValueChange={(value) =>
                                                setEligibilityFilters({ ...eligibilityFilters, gender: value })
                                            }
                                        >
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Select beneficiary type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Any</SelectItem>
                                                <SelectItem value="Below Poverty Line">Below Poverty Line</SelectItem>
                                                <SelectItem value="Male">Male</SelectItem>
                                                <SelectItem value="Female">Female</SelectItem>
                                                <SelectItem value="Youth">Youth</SelectItem>
                                                <SelectItem value="Entrepreneur">Entrepreneur</SelectItem>
                                                <SelectItem value="Student">Student</SelectItem>
                                                <SelectItem value="Farmer">Farmer</SelectItem>
                                                <SelectItem value="Disabled Persons">Disabled Persons</SelectItem>
                                                <SelectItem value="Widow">Widow</SelectItem>
                                                <SelectItem value="Senior Citizen">Senior Citizen</SelectItem>
                                                <SelectItem value="Low Income Family">Low Income Family</SelectItem>
                                                <SelectItem value="Business Owner">Business Owner</SelectItem>
                                                <SelectItem value="Freelancer">Freelancer</SelectItem>
                                                <SelectItem value="Skilled Worker">Skilled Worker</SelectItem>
                                                <SelectItem value="Laborer">Laborer</SelectItem>
                                                <SelectItem value="Daily Wage Worker">Daily Wage Worker</SelectItem>
                                                <SelectItem value="Unemployed">Unemployed</SelectItem>
                                                <SelectItem value="Woman">Woman</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="educationLevel" className="text-sm font-medium">
                                            Education Level
                                        </Label>
                                        <Select
                                            value={eligibilityFilters.educationLevel}
                                            onValueChange={(value) =>
                                                setEligibilityFilters({ ...eligibilityFilters, educationLevel: value })
                                            }
                                        >
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Select Education" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Any</SelectItem>
                                                <SelectItem value="No Formal Education">No Formal Education</SelectItem>
                                                <SelectItem value="Primary">Primary</SelectItem>
                                                <SelectItem value="Secondary">Secondary</SelectItem>
                                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                                <SelectItem value="Bachelor's">Bachelor's</SelectItem>
                                                <SelectItem value="Master's">Master's</SelectItem>
                                                <SelectItem value="PhD">PhD</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Button
                                    size="lg"
                                    className="w-full mt-6 text-white shadow-lg"
                                    style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
                                    onClick={handleEligibilityCheck}
                                >
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Find Matching Schemes
                                </Button>

                                {showEligibilityResults && (
                                    <div className="mt-4 p-4 rounded-xl border" style={{ background: filteredSchemes.length > 0 ? 'rgba(124,58,237,0.08)' : 'rgba(239,68,68,0.06)', borderColor: filteredSchemes.length > 0 ? 'rgba(124,58,237,0.2)' : 'rgba(239,68,68,0.2)' }}>
                                        <p className="text-sm text-center font-semibold" style={{ color: filteredSchemes.length > 0 ? '#7c3aed' : '#dc2626' }}>
                                            {filteredSchemes.length > 0 ? (
                                                <>
                                                    <CheckCircle2 className="inline h-4 w-4 mr-1" />
                                                    {`Showing ${filteredSchemes.length} highly relevant${eligibilityFilters.category !== "all" ? ` ${eligibilityFilters.category.toLowerCase()}` : ""} scheme${filteredSchemes.length !== 1 ? "s" : ""} matching your profile`}
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="inline h-4 w-4 mr-1" />
                                                    No schemes matched your exact criteria — try adjusting your income, age, or category
                                                </>
                                            )}
                                        </p>
                                    </div>
                                )}

                            </CardContent>
                        </div>
                    </Card>

                    {/* Filters and Results */}
                    <div className="space-y-4">
                        {/* Filter Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-extrabold text-foreground">Available Schemes</h2>
                                {!loading && (
                                    <Badge className="text-sm font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.2)' }}>
                                        {filteredSchemes.length} Results
                                    </Badge>
                                )}
                                {loading && (
                                    <div className="h-6 w-20 rounded-full skeleton" />
                                )}
                            </div>

                            <div className="flex items-center gap-3 flex-wrap">
                            </div>
                        </div>

                        {/* Scheme Cards Grid — skeleton while loading, real cards after */}
                        {loading ? (
                            // ── SKELETON LOADERS ──
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="rounded-2xl border border-border/60 bg-card overflow-hidden"
                                        style={{
                                            borderTop: '3px solid rgba(124,58,237,0.25)',
                                            opacity: 1 - i * 0.08,
                                            animationDelay: `${i * 80}ms`
                                        }}
                                    >
                                        {/* Card header skeleton */}
                                        <div className="p-5 pb-3 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div className="h-5 w-20 rounded-full skeleton" />
                                                <div className="flex gap-1.5">
                                                    <div className="h-7 w-7 rounded-full skeleton" />
                                                    <div className="h-7 w-7 rounded-full skeleton" />
                                                </div>
                                            </div>
                                            {/* Title lines */}
                                            <div className="h-5 w-full rounded-lg skeleton" />
                                            <div className="h-5 w-3/4 rounded-lg skeleton" />
                                            {/* Dept label */}
                                            <div className="h-3 w-28 rounded skeleton" />
                                            {/* Description lines */}
                                            <div className="h-3.5 w-full rounded skeleton" />
                                            <div className="h-3.5 w-5/6 rounded skeleton" />
                                        </div>
                                        {/* Divider */}
                                        <div className="mx-5 border-t border-border/40" />
                                        {/* Card content skeleton */}
                                        <div className="p-5 pt-4 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 rounded-full skeleton flex-shrink-0" />
                                                <div className="h-4 w-32 rounded skeleton" />
                                                <div className="h-3.5 w-20 rounded skeleton" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 rounded-full skeleton flex-shrink-0" />
                                                <div className="h-3.5 w-24 rounded skeleton" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 rounded-full skeleton flex-shrink-0" />
                                                <div className="h-3.5 w-36 rounded skeleton" />
                                            </div>
                                            <div className="pt-3 border-t border-border/40">
                                                <div className="h-9 w-full rounded-xl skeleton" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredSchemes.length === 0 ? (
                            // ── EMPTY STATE ──
                            <div className="empty-state">
                                <div className="empty-state-icon" style={{ background: 'rgba(124,58,237,0.1)' }}>
                                    <Search className="h-8 w-8" style={{ color: '#7c3aed' }} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground mb-2">No Schemes Found</h3>
                                    <p className="text-muted-foreground">Try adjusting your filters or search criteria.</p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="rounded-xl"
                                    onClick={() => { setSearchQuery(""); setSelectedCategory("all"); setSelectedProvince("all"); setShowEligibilityResults(false); }}
                                >
                                    Clear All Filters
                                </Button>
                            </div>
                        ) : (
                            // ── REAL CARDS (fade in after load) ──
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredSchemes.map((scheme, idx) => (
                                    <Card
                                        key={scheme.schemeId}
                                        className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-in-up"
                                        style={{ borderTop: '3px solid #7c3aed', animationDelay: `${Math.min(idx * 50, 400)}ms`, animationFillMode: 'both' }}
                                        onClick={() => openSchemeDetails(scheme)}
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 opacity-5 rounded-bl-[100px]" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }} />

                                        <CardHeader className="pb-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <Badge className="text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full" style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.2)' }}>
                                                    {scheme.category}
                                                </Badge>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={`h-8 w-8 ${compareList.includes(scheme.schemeId) ? "bg-purple-50" : "text-slate-300 hover:bg-purple-50"}`}
                                                        style={{ color: compareList.includes(scheme.schemeId) ? '#7c3aed' : undefined }}
                                                        onClick={(e) => toggleCompare(e, scheme)}
                                                        title={compareList.includes(scheme.schemeId) ? "Remove from Compare" : "Add to Compare"}
                                                    >
                                                        <Scale className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleFavorite(scheme.schemeId);
                                                        }}
                                                    >
                                                        <Heart
                                                            className={`h-5 w-5 ${favorites.includes(scheme.schemeId)
                                                                ? "fill-red-500 text-red-500"
                                                                : "text-gray-400"
                                                                }`}
                                                        />
                                                    </Button>
                                                </div>
                                            </div>

                                            <CardTitle className="text-base font-bold text-foreground mb-2 line-clamp-2 group-hover:text-purple-700 transition-colors">
                                                {scheme.schemeName}
                                            </CardTitle>
                                            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{scheme.department}</p>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{scheme.description}</p>
                                        </CardHeader>

                                        <CardContent className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <DollarSign className="h-4 w-4 flex-shrink-0" style={{ color: '#7c3aed' }} />
                                                <span className="font-bold text-foreground">
                                                    PKR {scheme.benefits.financial.amount.toLocaleString()}
                                                </span>
                                                <span className="text-muted-foreground text-xs">({scheme.benefits.financial.frequency})</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: '#7c3aed' }} />
                                                <span>{scheme.province}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm">
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                <span className="text-gray-700">
                                                    {scheme.application.isOpen ? "Applications Open" : "Applications Closed"}
                                                </span>
                                            </div>

                                            <div className="pt-3 border-t border-border/50">
                                                <Button
                                                    size="sm"
                                                    className="w-full text-white rounded-xl font-semibold"
                                                    style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openSchemeDetails(scheme);
                                                    }}
                                                >
                                                    View Details
                                                    <ExternalLink className="ml-2 h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Scheme Detail Modal */}
                    <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            {selectedScheme && (
                                <>
                                    <DialogHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                                                    {selectedScheme.schemeName}
                                                </DialogTitle>
                                                <p className="text-sm text-gray-600">{selectedScheme.department}</p>
                                            </div>
                                            <Badge className="text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full" style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.2)' }}>
                                                {selectedScheme.category}
                                            </Badge>
                                        </div>
                                    </DialogHeader>

                                    <div className="space-y-6 mt-4">
                                        {/* Overview */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Overview</h3>
                                            <p className="text-gray-700">{selectedScheme.longDescription}</p>
                                        </div>

                                        {/* Benefits */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h3>
                                            <div className="bg-[#7c3aed]/5 p-4 rounded-lg space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="h-5 w-5 text-[#7c3aed]" />
                                                    <span className="font-semibold text-gray-900">
                                                        PKR {selectedScheme.benefits.financial.amount.toLocaleString()}
                                                    </span>
                                                    <span className="text-gray-600">
                                                        ({selectedScheme.benefits.financial.frequency})
                                                    </span>
                                                </div>
                                                {selectedScheme.benefits.nonFinancial.length > 0 && (
                                                    <div className="mt-3">
                                                        <p className="text-sm font-medium text-gray-700 mb-2">Additional Benefits:</p>
                                                        <ul className="list-disc list-inside space-y-1">
                                                            {selectedScheme.benefits.nonFinancial.map((benefit, idx) => (
                                                                <li key={idx} className="text-sm text-gray-600">{benefit}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Eligibility */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Eligibility Criteria</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <p className="text-sm font-medium text-gray-700 mb-1">Income Range</p>
                                                    <p className="text-sm text-gray-900">
                                                        PKR {selectedScheme.eligibility.income.min.toLocaleString()} - PKR{" "}
                                                        {selectedScheme.eligibility.income.max.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <p className="text-sm font-medium text-gray-700 mb-1">Age Range</p>
                                                    <p className="text-sm text-gray-900">
                                                        {selectedScheme.eligibility.age.min} - {selectedScheme.eligibility.age.max} years
                                                    </p>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <p className="text-sm font-medium text-gray-700 mb-1">Categories</p>
                                                    <p className="text-sm text-gray-900">
                                                        {selectedScheme.eligibility.categories.join(", ")}
                                                    </p>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <p className="text-sm font-medium text-gray-700 mb-1">Employment Status</p>
                                                    <p className="text-sm text-gray-900">
                                                        {selectedScheme.eligibility.employmentStatus.join(", ")}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Application Process */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">How to Apply</h3>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Badge variant="outline">{selectedScheme.application.method}</Badge>
                                                    <span className="text-gray-600">
                                                        Processing Time: {selectedScheme.application.processingTime}
                                                    </span>
                                                </div>
                                                <div className="space-y-2">
                                                    {selectedScheme.application.steps.map((step, idx) => (
                                                        <div key={idx} className="flex items-start gap-3">
                                                            <div className="flex-shrink-0 w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-black" style={{ background: '#7c3aed' }}>
                                                                {idx + 1}
                                                            </div>
                                                            <p className="text-sm text-gray-700 flex-1">{step}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-4">
                                                    <p className="text-sm font-medium text-gray-700 mb-2">Required Documents:</p>
                                                    <ul className="list-disc list-inside space-y-1">
                                                        {selectedScheme.application.requiredDocuments.map((doc, idx) => (
                                                            <li key={idx} className="text-sm text-gray-600">{doc}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contact Information */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="h-4 w-4 text-[#7c3aed]" />
                                                    <span className="text-gray-700">
                                                        {selectedScheme.contact.helpline.join(", ")}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Mail className="h-4 w-4 text-[#7c3aed]" />
                                                    <span className="text-gray-700">
                                                        {selectedScheme.contact.email.join(", ")}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Globe className="h-4 w-4 text-[#7c3aed]" />
                                                    <a
                                                        href={selectedScheme.contact.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[#7c3aed] hover:underline"
                                                    >
                                                        {selectedScheme.contact.website}
                                                    </a>
                                                </div>
                                            </div>
                                        </div>

                                        {/* FAQs */}
                                        {selectedScheme.faqs && selectedScheme.faqs.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                                    Frequently Asked Questions
                                                </h3>
                                                <div className="space-y-3">
                                                    {selectedScheme.faqs.map((faq, idx) => (
                                                        <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                                                            <p className="text-sm font-medium text-gray-900 mb-1">
                                                                Q: {faq.question}
                                                            </p>
                                                            <p className="text-sm text-gray-700">A: {faq.answer}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-3 pt-4 border-t border-border">
                                            <Button
                                                className="flex-1 text-white rounded-xl font-semibold"
                                                style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
                                                onClick={() => window.open(selectedScheme.application.website, "_blank")}
                                            >
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                Visit Official Website
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => toggleFavorite(selectedScheme.schemeId)}
                                            >
                                                <Heart
                                                    className={`h-4 w-4 ${favorites.includes(selectedScheme.schemeId)
                                                        ? "fill-red-500 text-red-500"
                                                        : ""
                                                        }`}
                                                />
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </DialogContent>
                    </Dialog>
                </>

            {/* Module Feedback Section */}
            <div className="container max-w-4xl mx-auto pt-10 pb-20">
                <ModuleFeedback moduleName="schemes" />
            </div>
        </div>
    );
};

export default SchemeDashboard;
