import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2, Activity, Info, Heart, Scale, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/schemeAPI";

interface Hospital {
    _id: string;
    "Hospital Name": string;
    City: string;
    Tehsil: string;
    Cateogry: string;
    SerialNum: number;
    treatmentCost?: number;
    availability?: string;
    info?: string;
    hospitalLink?: string;
}

interface HospitalCardProps {
    hospital: Hospital;
}

export const HospitalCard: React.FC<HospitalCardProps> = ({ hospital }) => {
    const { toast } = useToast();
    const [isFavorite, setIsFavorite] = useState(false);
    const [inCompare, setInCompare] = useState(false);
    const [isOpeningWebsite, setIsOpeningWebsite] = useState(false);

    useEffect(() => {
        const favs: Hospital[] = JSON.parse(localStorage.getItem("hospital_favorites") || "[]");
        setIsFavorite(favs.some((h) => h._id === hospital._id));
        const compareIds: string[] = JSON.parse(localStorage.getItem("hospital_compare_list") || "[]");
        setInCompare(compareIds.includes(hospital._id));
    }, [hospital._id]);

    const toggleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation();
        const favs: Hospital[] = JSON.parse(localStorage.getItem("hospital_favorites") || "[]");
        if (isFavorite) {
            const updated = favs.filter((h) => h._id !== hospital._id);
            localStorage.setItem("hospital_favorites", JSON.stringify(updated));
            setIsFavorite(false);
            toast({ title: "Removed from Favorites", description: "Hospital removed from your favorites." });
        } else {
            localStorage.setItem("hospital_favorites", JSON.stringify([...favs, hospital]));
            setIsFavorite(true);
            toast({ title: "Added to Favorites", description: "Hospital saved to your favorites." });
        }
    };

    const toggleCompare = (e: React.MouseEvent) => {
        e.stopPropagation();
        const compareIds: string[] = JSON.parse(localStorage.getItem("hospital_compare_list") || "[]");
        const compareData: Hospital[] = JSON.parse(localStorage.getItem("hospital_compare_data") || "[]");
        if (inCompare) {
            const newIds = compareIds.filter((id) => id !== hospital._id);
            const newData = compareData.filter((h) => h._id !== hospital._id);
            localStorage.setItem("hospital_compare_list", JSON.stringify(newIds));
            localStorage.setItem("hospital_compare_data", JSON.stringify(newData));
            setInCompare(false);
            toast({ title: "Removed from Compare", description: "Hospital removed from comparison list." });
        } else {
            if (compareIds.length >= 3) {
                toast({ title: "Comparison Limit Reached", description: "You can compare up to 3 hospitals at a time.", variant: "destructive" });
                return;
            }
            localStorage.setItem("hospital_compare_list", JSON.stringify([...compareIds, hospital._id]));
            localStorage.setItem("hospital_compare_data", JSON.stringify([...compareData.filter((h) => h._id !== hospital._id), hospital]));
            setInCompare(true);
            toast({ title: "Added to Compare", description: "Hospital added to comparison list." });
        }
    };

    const openHospitalLink = async (e: React.MouseEvent) => {
        e.stopPropagation();

        try {
            setIsOpeningWebsite(true);
            const response = await api.get(`/api/hospitals/${hospital._id}/website`);
            const website = response.data?.data?.website;

            if (!website) {
                throw new Error('No website returned');
            }

            window.open(website, "_blank", "noopener,noreferrer");
        } catch (error) {
            toast({
                title: "Website open failed",
                description: "Hospital website resolve nahin ho saki.",
                variant: "destructive",
            });
        } finally {
            setIsOpeningWebsite(false);
        }
    };

    return (
        <Card className="h-full hover:shadow-lg transition-all duration-300 group overflow-hidden border-border/50">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2 mb-2">
                    <Badge variant={hospital.Cateogry === 'Private' ? 'secondary' : 'default'} className="font-medium">
                        <Activity className="h-3 w-3 mr-1" />
                        {hospital.Cateogry}
                    </Badge>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={toggleCompare}
                            title={inCompare ? "Remove from Compare" : "Add to Compare"}
                            className={`p-1.5 rounded-full transition-colors ${inCompare ? 'text-cyan-600 bg-cyan-50' : 'text-gray-400 hover:text-cyan-500 hover:bg-cyan-50'}`}
                        >
                            <Scale className="h-4 w-4" />
                        </button>
                        <button
                            onClick={toggleFavorite}
                            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                            className={`p-1.5 rounded-full transition-colors ${isFavorite ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-400 hover:bg-red-50'}`}
                        >
                            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                </div>
                <h3 className="font-bold text-lg text-foreground line-clamp-2 min-h-[3.5rem] group-hover:text-primary transition-colors">
                    {hospital["Hospital Name"]}
                </h3>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span className="text-sm font-medium">
                        {hospital.City}
                    </span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span className="text-sm">
                        Tehsil: {hospital.Tehsil}
                    </span>
                </div>

                <div className="mt-4">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                <Info className="h-4 w-4 mr-2" />
                                View Details
                            </Button>
                        </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586773860418-d3b9785132d9?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center opacity-30 mix-blend-overlay" />
                            <div className="relative z-10 text-center p-6">
                                <Badge variant="secondary" className="mb-3 px-3 py-1 text-sm font-semibold tracking-wide">
                                    {hospital.Cateogry} Hospital
                                </Badge>
                                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight drop-shadow-sm">
                                    {hospital["Hospital Name"]}
                                </h1>
                            </div>
                        </div>

                        <div className="p-8 space-y-8 bg-card">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2 p-4 rounded-xl bg-muted/50 border border-border/50 transition-colors hover:bg-muted">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Location</p>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-primary" />
                                        <p className="text-base font-semibold text-foreground">{hospital.City}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 p-4 rounded-xl bg-muted/50 border border-border/50 transition-colors hover:bg-muted">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tehsil</p>
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-primary" />
                                        <p className="text-base font-semibold text-foreground">{hospital.Tehsil}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 p-4 rounded-xl bg-muted/50 border border-border/50 transition-colors hover:bg-muted">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</p>
                                    <div className="flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-primary" />
                                        <p className="text-base font-semibold text-foreground">{hospital.Cateogry}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 p-4 rounded-xl bg-muted/50 border border-border/50 transition-colors hover:bg-muted">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Serial Number</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-primary">#{hospital.SerialNum}</span>
                                    </div>
                                </div>
                                <div className="space-y-2 p-4 rounded-xl bg-muted/50 border border-border/50 transition-colors hover:bg-muted col-span-2">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Treatment Details</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Estimated Cost</p>
                                            <p className="text-lg font-bold text-emerald-600">PKR {hospital.treatmentCost?.toLocaleString() || '0'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Availability</p>
                                            <p className="text-lg font-semibold text-foreground">{hospital.availability || 'Available'}</p>
                                        </div>
                                    </div>
                                    {hospital.info && (
                                        <div className="mt-3 p-3 bg-white/50 rounded-lg border text-sm text-gray-700">
                                            {hospital.info}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 p-4 rounded-xl bg-muted/50 border border-border/50 transition-colors hover:bg-muted col-span-2">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Website</p>
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-sm font-medium text-foreground">
                                            Open the hospital website in a new tab.
                                        </p>
                                        <Button variant="outline" className="sm:w-auto w-full" onClick={openHospitalLink} disabled={isOpeningWebsite}>
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            {isOpeningWebsite ? 'Opening...' : 'Visit Website'}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="px-8 rounded-full">Close Information</Button>
                                </DialogTrigger>
                            </div>
                        </div>
                    </DialogContent>
                    </Dialog>
                </div>
            </CardContent>
        </Card>
    );
};

export default HospitalCard;
