import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Trash2, Scale, MapPin, Building2, Activity, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Hospital {
    _id: string;
    "Hospital Name": string;
    City: string;
    Tehsil: string;
    Cateogry: string;
    SerialNum: number;
}

const HospitalFavoritesPanel = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [favoriteHospitals, setFavoriteHospitals] = useState<Hospital[]>([]);
    const [compareList, setCompareList] = useState<string[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem("hospital_favorites");
        if (saved) {
            setFavoriteHospitals(JSON.parse(saved));
        }
        const savedCompare = localStorage.getItem("hospital_compare_list");
        if (savedCompare) {
            setCompareList(JSON.parse(savedCompare));
        }
    }, []);

    const removeFavorite = (id: string) => {
        const updated = favoriteHospitals.filter((h) => h._id !== id);
        setFavoriteHospitals(updated);
        localStorage.setItem("hospital_favorites", JSON.stringify(updated));
        toast({ title: "Removed from Favorites", description: "Hospital removed from your favorites." });
    };

    const clearAllFavorites = () => {
        setFavoriteHospitals([]);
        localStorage.setItem("hospital_favorites", JSON.stringify([]));
        toast({ title: "Favorites Cleared", description: "All hospitals removed from favorites." });
    };

    const addToCompare = (hospital: Hospital) => {
        if (compareList.includes(hospital._id)) {
            toast({ title: "Already in Comparison", description: "This hospital is already in your comparison list.", variant: "destructive" });
            return;
        }
        if (compareList.length >= 3) {
            toast({ title: "Comparison Limit Reached", description: "You can compare up to 3 hospitals at a time.", variant: "destructive" });
            return;
        }
        const newList = [...compareList, hospital._id];
        setCompareList(newList);
        localStorage.setItem("hospital_compare_list", JSON.stringify(newList));

        // Store full hospital objects for compare panel
        const savedHospitals: Hospital[] = JSON.parse(localStorage.getItem("hospital_compare_data") || "[]");
        const updated = [...savedHospitals.filter((h) => h._id !== hospital._id), hospital];
        localStorage.setItem("hospital_compare_data", JSON.stringify(updated));

        toast({ title: "Added to Comparison", description: "Hospital added to comparison list." });
    };

    return (
        <div className="w-full h-full bg-white p-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-400 text-white shadow-md">
                        <Heart className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Hospital Favorites</h1>
                        <p className="text-sm text-gray-500">Your saved hospitals</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {compareList.length > 0 && (
                        <Button variant="outline" size="sm" onClick={() => navigate("/company/hospital-compare")} className="gap-2">
                            <Scale className="h-4 w-4" />
                            Compare ({compareList.length})
                        </Button>
                    )}
                    {favoriteHospitals.length > 0 && (
                        <Button variant="outline" size="sm" onClick={clearAllFavorites} className="gap-2 text-red-600 border-red-200 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                            Clear All
                        </Button>
                    )}
                </div>
            </div>

            {favoriteHospitals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 mb-4">
                        <Heart className="h-8 w-8 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Favorites Yet</h3>
                    <p className="text-gray-500 mb-6 max-w-sm">
                        Browse hospitals and click the heart icon to save them here for quick access.
                    </p>
                    <Button onClick={() => navigate("/company/hospital-search")} className="gap-2 bg-cyan-500 hover:bg-cyan-600 text-white">
                        <Search className="h-4 w-4" />
                        Search Hospitals
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteHospitals.map((hospital) => (
                        <Card key={hospital._id} className="hover:shadow-lg transition-all duration-300 border-border/50">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start gap-2 mb-2">
                                    <Badge variant={hospital.Cateogry === "Private" ? "secondary" : "default"} className="font-medium">
                                        <Activity className="h-3 w-3 mr-1" />
                                        {hospital.Cateogry}
                                    </Badge>
                                </div>
                                <CardTitle className="text-base font-bold text-gray-900 line-clamp-2">
                                    {hospital["Hospital Name"]}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin className="h-4 w-4 text-cyan-500 flex-shrink-0" />
                                    <span className="text-sm">{hospital.City}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Building2 className="h-4 w-4 text-cyan-500 flex-shrink-0" />
                                    <span className="text-sm">Tehsil: {hospital.Tehsil}</span>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 gap-1 text-cyan-600 border-cyan-200 hover:bg-cyan-50"
                                        onClick={() => addToCompare(hospital)}
                                        disabled={compareList.includes(hospital._id)}
                                    >
                                        <Scale className="h-3.5 w-3.5" />
                                        {compareList.includes(hospital._id) ? "In Compare" : "Compare"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 gap-1 text-red-500 border-red-200 hover:bg-red-50"
                                        onClick={() => removeFavorite(hospital._id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Remove
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HospitalFavoritesPanel;
