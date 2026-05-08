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

    // Filter and sort schemes
    const filteredSchemes = useMemo(() => {
        let filtered = schemes;

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(
                (scheme) =>
                    scheme.schemeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    scheme.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    scheme.department.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Category filter
        if (selectedCategory !== "all") {
            filtered = filtered.filter((scheme) => scheme.category === selectedCategory);
        }

        // Province filter - Show only schemes from selected province OR Federal schemes
        if (selectedProvince !== "all") {
            filtered = filtered.filter((scheme) => {
                // Always include Federal schemes (available to all provinces)
                if (scheme.province === "Federal") return true;
                // Include schemes that exactly match the selected province
                return scheme.province === selectedProvince;
            });
        }

        // Eligibility filter (if eligibility check was performed)
        if (showEligibilityResults && eligibilityFilters.income && eligibilityFilters.age) {
            const userProfile = {
                income: parseFloat(eligibilityFilters.income) || 0,
                age: parseInt(eligibilityFilters.age) || 0,
                province: eligibilityFilters.province === "all" ? "Punjab" : eligibilityFilters.province,
                city: eligibilityFilters.city || "Lahore",
                category: eligibilityFilters.category === "all" ? "Student" : eligibilityFilters.category,
                employmentStatus: eligibilityFilters.employmentStatus === "all" ? "Student" : eligibilityFilters.employmentStatus,
                familySize: parseInt(eligibilityFilters.familySize) || 4,
                gender: eligibilityFilters.gender === "all" ? undefined : eligibilityFilters.gender,
                educationLevel: eligibilityFilters.educationLevel === "all" ? undefined : eligibilityFilters.educationLevel,
            };

            filtered = filtered
                .map((scheme) => ({
                    scheme,
                    eligibility: checkSchemeEligibility(scheme, userProfile),
                }))
                .filter((item) => item.eligibility.isEligible)
                .map((item) => item.scheme);
        }

        // Sort
        if (sortBy === "name") {
            filtered.sort((a, b) => a.schemeName.localeCompare(b.schemeName));
        } else if (sortBy === "benefit-high") {
            filtered.sort((a, b) => b.benefits.financial.amount - a.benefits.financial.amount);
        } else if (sortBy === "benefit-low") {
            filtered.sort((a, b) => a.benefits.financial.amount - b.benefits.financial.amount);
        }

        return filtered;
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
        <div className="space-y-8">
            {loading ? (
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#7c3aed] mx-auto mb-4"></div>
                        <p className="text-lg text-gray-600">Loading schemes...</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Hero Section */}
                    <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#7c3aed]/10 to-[#a855f7]/10 rounded-2xl">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(124,58,237,0.15),transparent)]" />

                        <div className="container relative z-10 px-4 py-12">
                            <div className="max-w-4xl mx-auto text-center">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7c3aed]/10 border border-[#7c3aed]/20 text-[#7c3aed] text-sm font-medium mb-6">
                                    <Award className="h-4 w-4" />
                                    <span>Government Schemes & Citizen Benefits</span>
                                </div>

                                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                                    Discover <span className="text-gradient bg-gradient-to-r from-[#7c3aed] to-[#a855f7] bg-clip-text text-transparent">Government Schemes</span>
                                </h1>

                                <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
                                    Find government programs and benefits you're eligible for. Check eligibility, compare schemes, and apply with confidence.
                                </p>

                                {/* Search Bar */}
                                <div className="max-w-2xl mx-auto">
                                    <div className="relative flex items-center">
                                        <Search className="absolute left-4 h-5 w-5 text-gray-400" />
                                        <Input
                                            type="text"
                                            placeholder="Search schemes by name, category, or department..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="h-14 pl-12 pr-4 text-base rounded-2xl border-2 border-gray-200 bg-white shadow-sm focus:border-[#7c3aed] focus:shadow-md transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mt-12">
                                    <div className="text-center group">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#7c3aed]/10 text-[#7c3aed] mb-3 group-hover:scale-110 transition-transform">
                                            <Building2 className="h-5 w-5" />
                                        </div>
                                        <div className="text-2xl md:text-3xl font-bold text-gray-900">{schemes.length}</div>
                                        <div className="text-sm text-gray-600">Active Schemes</div>
                                    </div>
                                    <div className="text-center group">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#7c3aed]/10 text-[#7c3aed] mb-3 group-hover:scale-110 transition-transform">
                                            <Users className="h-5 w-5" />
                                        </div>
                                        <div className="text-2xl md:text-3xl font-bold text-gray-900">30M+</div>
                                        <div className="text-sm text-gray-600">Beneficiaries</div>
                                    </div>
                                    <div className="text-center group">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#7c3aed]/10 text-[#7c3aed] mb-3 group-hover:scale-110 transition-transform">
                                            <DollarSign className="h-5 w-5" />
                                        </div>
                                        <div className="text-2xl md:text-3xl font-bold text-gray-900">1T+</div>
                                        <div className="text-sm text-gray-600">PKR Allocated</div>
                                    </div>
                                    <div className="text-center group">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#7c3aed]/10 text-[#7c3aed] mb-3 group-hover:scale-110 transition-transform">
                                            <TrendingUp className="h-5 w-5" />
                                        </div>
                                        <div className="text-2xl md:text-3xl font-bold text-gray-900">{categories.length}</div>
                                        <div className="text-sm text-gray-600">Categories</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Eligibility Checker */}
                    <Card className="border-2 border-[#7c3aed]/20 overflow-hidden shadow-lg">
                        <CardHeader
                            className="bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white cursor-pointer"
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
                                                <SelectItem value="KPK">Khyber Pakhtunkhwa</SelectItem>
                                                <SelectItem value="Balochistan">Balochistan</SelectItem>
                                                <SelectItem value="GB">Gilgit-Baltistan</SelectItem>
                                                <SelectItem value="AJK">Azad Jammu & Kashmir</SelectItem>
                                                <SelectItem value="ICT">Islamabad Capital Territory</SelectItem>
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
                                                <SelectItem value="all">All Categories</SelectItem>
                                                <SelectItem value="Student">Student</SelectItem>
                                                <SelectItem value="Youth">Youth</SelectItem>
                                                <SelectItem value="Farmer">Farmer</SelectItem>
                                                <SelectItem value="Business Owner">Business Owner</SelectItem>
                                                <SelectItem value="Entrepreneur">Entrepreneur</SelectItem>
                                                <SelectItem value="Low Income Family">Low Income Family</SelectItem>
                                                <SelectItem value="Daily Wage Worker">Daily Wage Worker</SelectItem>
                                                <SelectItem value="Unemployed">Unemployed</SelectItem>
                                                <SelectItem value="Woman">Woman</SelectItem>
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
                                                <SelectItem value="Daily Wage Worker">Daily Wage Worker</SelectItem>
                                                <SelectItem value="Business Owner">Business Owner</SelectItem>
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
                                        <Label htmlFor="gender" className="text-sm font-medium">
                                            Gender
                                        </Label>
                                        <Select
                                            value={eligibilityFilters.gender}
                                            onValueChange={(value) =>
                                                setEligibilityFilters({ ...eligibilityFilters, gender: value })
                                            }
                                        >
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Select Gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Any</SelectItem>
                                                <SelectItem value="Male">Male</SelectItem>
                                                <SelectItem value="Female">Female</SelectItem>
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
                                    className="w-full mt-6 bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:from-[#6d28d9] hover:to-[#9333ea] text-white shadow-lg"
                                    onClick={handleEligibilityCheck}
                                >
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Find Matching Schemes
                                </Button>

                                {showEligibilityResults && (
                                    <div className="mt-4 p-4 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/20">
                                        <p className="text-sm text-center text-[#7c3aed] font-medium">
                                            <CheckCircle2 className="inline h-4 w-4 mr-1" />
                                            Showing {filteredSchemes.length} schemes matching your eligibility criteria
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
                                <h2 className="text-2xl font-bold text-gray-900">Available Schemes</h2>
                                <Badge className="bg-[#7c3aed] text-white">
                                    {filteredSchemes.length} Results
                                </Badge>
                            </div>

                            <div className="flex items-center gap-3 flex-wrap">
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="w-[180px] h-9">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                                    <SelectTrigger className="w-[180px] h-9">
                                        <SelectValue placeholder="Province" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Provinces</SelectItem>
                                        {provinces.map((prov) => (
                                            <SelectItem key={prov} value={prov}>
                                                {prov}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-[180px] h-9">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="relevance">Relevance</SelectItem>
                                        <SelectItem value="name">Name (A-Z)</SelectItem>
                                        <SelectItem value="benefit-high">Benefit (High to Low)</SelectItem>
                                        <SelectItem value="benefit-low">Benefit (Low to High)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Scheme Cards Grid */}
                        {filteredSchemes.length === 0 ? (
                            <Card className="p-12 text-center">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                                        <Search className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Schemes Found</h3>
                                        <p className="text-gray-600">
                                            Try adjusting your filters or search criteria to find more schemes.
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearchQuery("");
                                            setSelectedCategory("all");
                                            setSelectedProvince("all");
                                            setShowEligibilityResults(false);
                                        }}
                                    >
                                        Clear All Filters
                                    </Button>
                                </div>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredSchemes.map((scheme) => (
                                    <Card
                                        key={scheme.schemeId}
                                        className="group relative overflow-hidden border-2 border-gray-200 hover:border-[#7c3aed] transition-all duration-300 hover:shadow-xl cursor-pointer"
                                        onClick={() => openSchemeDetails(scheme)}
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#7c3aed] to-[#a855f7] opacity-10 rounded-bl-[100px]" />

                                        <CardHeader className="pb-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <Badge className="bg-[#7c3aed] text-white">
                                                    {scheme.category}
                                                </Badge>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={`h-8 w-8 ${compareList.includes(scheme.schemeId) ? "text-[#7c3aed] bg-[#7c3aed]/10" : "text-gray-400 hover:text-[#7c3aed]"}`}
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

                                            <CardTitle className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                                {scheme.schemeName}
                                            </CardTitle>
                                            <p className="text-sm text-gray-600 mb-2">{scheme.department}</p>
                                            <p className="text-sm text-gray-700 line-clamp-2">{scheme.description}</p>
                                        </CardHeader>

                                        <CardContent className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <DollarSign className="h-4 w-4 text-[#7c3aed]" />
                                                <span className="font-semibold text-gray-900">
                                                    PKR {scheme.benefits.financial.amount.toLocaleString()}
                                                </span>
                                                <span className="text-gray-600">({scheme.benefits.financial.frequency})</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <MapPin className="h-4 w-4 text-[#7c3aed]" />
                                                <span>{scheme.province}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm">
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                <span className="text-gray-700">
                                                    {scheme.application.isOpen ? "Applications Open" : "Applications Closed"}
                                                </span>
                                            </div>

                                            <div className="pt-3 border-t border-gray-200">
                                                <Button
                                                    size="sm"
                                                    className="w-full bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:from-[#6d28d9] hover:to-[#9333ea] text-white"
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
                                            <Badge className="bg-[#7c3aed] text-white">
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
                                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#7c3aed] text-white flex items-center justify-center text-xs font-bold">
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
                                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                                            <Button
                                                className="flex-1 bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:from-[#6d28d9] hover:to-[#9333ea] text-white"
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
            )}
        </div>
    );
};

export default SchemeDashboard;
