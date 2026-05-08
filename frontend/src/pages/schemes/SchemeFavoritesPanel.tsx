import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Heart,
    ArrowLeft,
    Trash2,
    Scale,
    ExternalLink,
    DollarSign,
    MapPin,
    CheckCircle2,
    Phone,
    Mail,
    Globe,
    FileText,
} from "lucide-react";
import { sampleSchemes, type Scheme } from "@/data/schemes";
import { useToast } from "@/hooks/use-toast";

const SchemeFavoritesPanel = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [favorites, setFavorites] = useState<string[]>([]);
    const [favoriteSchemes, setFavoriteSchemes] = useState<Scheme[]>([]);
    const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [compareList, setCompareList] = useState<string[]>([]);

    useEffect(() => {
        // Load favorites from localStorage
        const savedFavorites = localStorage.getItem("scheme_favorites");
        if (savedFavorites) {
            const ids = JSON.parse(savedFavorites);
            setFavorites(ids);

            // Load full scheme data
            const schemes = sampleSchemes.filter((s) => ids.includes(s.schemeId));
            setFavoriteSchemes(schemes);
        }

        // Load compare list
        const savedCompare = localStorage.getItem("scheme_compare_list");
        if (savedCompare) {
            setCompareList(JSON.parse(savedCompare));
        }
    }, []);

    const removeFavorite = (schemeId: string) => {
        const newFavorites = favorites.filter((id) => id !== schemeId);
        setFavorites(newFavorites);
        localStorage.setItem("scheme_favorites", JSON.stringify(newFavorites));

        const newSchemes = favoriteSchemes.filter((s) => s.schemeId !== schemeId);
        setFavoriteSchemes(newSchemes);

        toast({
            title: "Removed from Favorites",
            description: "Scheme removed from your favorites",
        });
    };

    const clearAllFavorites = () => {
        setFavorites([]);
        setFavoriteSchemes([]);
        localStorage.setItem("scheme_favorites", JSON.stringify([]));

        toast({
            title: "Favorites Cleared",
            description: "All schemes removed from favorites",
        });
    };

    const addToCompare = (schemeId: string) => {
        if (compareList.includes(schemeId)) {
            toast({
                title: "Already in Comparison",
                description: "This scheme is already in your comparison list",
                variant: "destructive",
            });
            return;
        }

        if (compareList.length >= 3) {
            toast({
                title: "Comparison Limit Reached",
                description: "You can compare up to 3 schemes at a time",
                variant: "destructive",
            });
            return;
        }

        const newCompareList = [...compareList, schemeId];
        setCompareList(newCompareList);
        localStorage.setItem("scheme_compare_list", JSON.stringify(newCompareList));

        toast({
            title: "Added to Comparison",
            description: "Scheme added to comparison list",
        });
    };

    const goToCompare = () => {
        if (compareList.length < 2) {
            toast({
                title: "Need More Schemes",
                description: "Add at least 2 schemes to compare",
                variant: "destructive",
            });
            return;
        }
        navigate("/schemes/compare");
    };

    const openSchemeDetails = (scheme: Scheme) => {
        setSelectedScheme(scheme);
        setIsDetailModalOpen(true);
    };

    if (favoriteSchemes.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate("/schemes/dashboard")}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Favorite Schemes</h1>
                            <p className="text-gray-600 mt-1">Your saved government schemes</p>
                        </div>
                    </div>
                </div>

                <Card className="p-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-[#7c3aed]/10 flex items-center justify-center">
                            <Heart className="h-8 w-8 text-[#7c3aed]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Favorite Schemes</h3>
                            <p className="text-gray-600 mb-4">
                                Start adding schemes to your favorites to access them quickly later.
                            </p>
                        </div>
                        <Button
                            className="bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:from-[#6d28d9] hover:to-[#9333ea] text-white"
                            onClick={() => navigate("/schemes/dashboard")}
                        >
                            Browse Schemes
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/schemes/dashboard")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Favorite Schemes</h1>
                        <p className="text-gray-600 mt-1">
                            {favoriteSchemes.length} saved scheme{favoriteSchemes.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {compareList.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToCompare}
                            className="border-[#7c3aed] text-[#7c3aed]"
                        >
                            <Scale className="h-4 w-4 mr-2" />
                            Compare ({compareList.length})
                        </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={clearAllFavorites}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All
                    </Button>
                </div>
            </div>

            {/* Favorites Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteSchemes.map((scheme) => (
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
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFavorite(scheme.schemeId);
                                    }}
                                >
                                    <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                                </Button>
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

                            <div className="pt-3 border-t border-gray-200 flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addToCompare(scheme.schemeId);
                                    }}
                                    disabled={compareList.includes(scheme.schemeId)}
                                >
                                    <Scale className="h-4 w-4 mr-1" />
                                    {compareList.includes(scheme.schemeId) ? "Added" : "Compare"}
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex-1 bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:from-[#6d28d9] hover:to-[#9333ea] text-white"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openSchemeDetails(scheme);
                                    }}
                                >
                                    View Details
                                    <ExternalLink className="ml-1 h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <Card className="bg-gradient-to-r from-[#7c3aed]/5 to-[#a855f7]/5 border-2 border-[#7c3aed]/20">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                Ready to Compare?
                            </h3>
                            <p className="text-sm text-gray-600">
                                Select schemes and compare them side-by-side to make the best decision.
                            </p>
                        </div>
                        <Button
                            className="bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:from-[#6d28d9] hover:to-[#9333ea] text-white"
                            onClick={goToCompare}
                            disabled={compareList.length < 2}
                        >
                            <Scale className="h-4 w-4 mr-2" />
                            Compare Schemes ({compareList.length})
                        </Button>
                    </div>
                </CardContent>
            </Card>

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
                                        onClick={() => removeFavorite(selectedScheme.schemeId)}
                                    >
                                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SchemeFavoritesPanel;
