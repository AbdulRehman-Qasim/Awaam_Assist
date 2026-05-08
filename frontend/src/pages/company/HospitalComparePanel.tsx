import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Scale, X, MapPin, Building2, Activity, Search, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Hospital {
    _id: string;
    "Hospital Name": string;
    City: string;
    Tehsil: string;
    Cateogry: string;
    SerialNum: number;
}

const HospitalComparePanel = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [hospitalsToCompare, setHospitalsToCompare] = useState<Hospital[]>([]);

    useEffect(() => {
        const savedData = localStorage.getItem("hospital_compare_data");
        const savedIds = localStorage.getItem("hospital_compare_list");
        if (savedData && savedIds) {
            const ids: string[] = JSON.parse(savedIds);
            const all: Hospital[] = JSON.parse(savedData);
            setHospitalsToCompare(all.filter((h) => ids.includes(h._id)));
        }
    }, []);

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

    return (
        <div className="w-full h-full bg-white p-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-400 text-white shadow-md">
                        <Scale className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Compare Hospitals</h1>
                        <p className="text-sm text-gray-500">Compare up to 3 hospitals side by side</p>
                    </div>
                </div>
                {hospitalsToCompare.length > 0 && (
                    <Button variant="outline" size="sm" onClick={clearAll} className="gap-2 text-red-600 border-red-200 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                        Clear All
                    </Button>
                )}
            </div>

            {hospitalsToCompare.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 mb-4">
                        <Scale className="h-8 w-8 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Hospitals to Compare</h3>
                    <p className="text-gray-500 mb-6 max-w-sm">
                        Search for hospitals and click "Compare" to add them here for side-by-side comparison.
                    </p>
                    <Button onClick={() => navigate("/company/hospital-search")} className="gap-2 bg-cyan-500 hover:bg-cyan-600 text-white">
                        <Search className="h-4 w-4" />
                        Search Hospitals
                    </Button>
                </div>
            ) : (
                <>
                    {/* Cards on top */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {hospitalsToCompare.map((hospital) => (
                            <Card key={hospital._id} className="border-cyan-200 border-2 relative">
                                <button
                                    onClick={() => removeFromCompare(hospital._id)}
                                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                                <CardHeader className="pb-2 pr-8">
                                    <Badge variant={hospital.Cateogry === "Private" ? "secondary" : "default"} className="w-fit mb-2">
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
                                </CardContent>
                            </Card>
                        ))}
                        {hospitalsToCompare.length < 3 && (
                            <Card
                                className="border-dashed border-2 border-gray-200 flex items-center justify-center cursor-pointer hover:border-cyan-300 hover:bg-cyan-50 transition-all"
                                onClick={() => navigate("/company/hospital-search")}
                                style={{ minHeight: 160 }}
                            >
                                <div className="text-center p-6">
                                    <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400">Add another hospital</p>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Comparison Table */}
                    <div className="rounded-xl border border-gray-200 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead className="w-40 font-semibold text-gray-700">Feature</TableHead>
                                    {hospitalsToCompare.map((h) => (
                                        <TableHead key={h._id} className="font-semibold text-gray-700 text-center">
                                            {h["Hospital Name"]}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium text-gray-700">City</TableCell>
                                    {hospitalsToCompare.map((h) => (
                                        <TableCell key={h._id} className="text-center">{h.City}</TableCell>
                                    ))}
                                </TableRow>
                                <TableRow className="bg-gray-50">
                                    <TableCell className="font-medium text-gray-700">Tehsil</TableCell>
                                    {hospitalsToCompare.map((h) => (
                                        <TableCell key={h._id} className="text-center">{h.Tehsil}</TableCell>
                                    ))}
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium text-gray-700">Category</TableCell>
                                    {hospitalsToCompare.map((h) => (
                                        <TableCell key={h._id} className="text-center">
                                            <Badge variant={h.Cateogry === "Private" ? "secondary" : "default"}>
                                                {h.Cateogry}
                                            </Badge>
                                        </TableCell>
                                    ))}
                                </TableRow>
                                <TableRow className="bg-gray-50">
                                    <TableCell className="font-medium text-gray-700">Serial No.</TableCell>
                                    {hospitalsToCompare.map((h) => (
                                        <TableCell key={h._id} className="text-center">{h.SerialNum}</TableCell>
                                    ))}
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </>
            )}
        </div>
    );
};

export default HospitalComparePanel;
