import React, { useState, useEffect } from "react";
import { Filter, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import axios from 'axios';
import HospitalCard from "./HospitalCard";
import Loading from '@/components/ui/loading';

interface Hospital {
    _id: string;
    "Hospital Name": string;
    City: string;
    Tehsil: string;
    Cateogry: string;
    SerialNum: number;
}

interface Filters {
    city: string;
    category: string;
}

const defaultFilters: Filters = {
    city: "",
    category: "",
};

const HospitalSearch = () => {
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<Filters>(defaultFilters);
    const [showFilters, setShowFilters] = useState(false);
    const [availableCities, setAvailableCities] = useState<string[]>([]);
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);

    useEffect(() => {
        fetchFilters();
    }, []);

    useEffect(() => {
        fetchHospitals();
    }, [filters]);

    const fetchFilters = async () => {
        try {
            const response = await axios.get('http://localhost:5001/api/hospitals/filters');
            if (response.data.success) {
                setAvailableCities(response.data.data.cities);
                setAvailableCategories(response.data.data.categories);
            }
        } catch (error) {
            console.error("Error fetching filters:", error);
        }
    };

    const fetchHospitals = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.city && filters.city !== "All Cities") params.append('city', filters.city);
            if (filters.category && filters.category !== "All Categories") params.append('category', filters.category);

            const response = await axios.get(`http://localhost:5001/api/hospitals?${params.toString()}`);
            if (response.data.success) {
                setHospitals(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching hospitals:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateFilter = (key: keyof Filters, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const resetFilters = () => {
        setFilters(defaultFilters);
    };

    const activeFiltersCount = [
        filters.city,
        filters.category
    ].filter(Boolean).length;

    return (
        <div className="w-full h-full bg-white p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Hospital Search</h1>

            <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-foreground">
                            Hospitals
                        </h2>
                        <Badge variant="secondary" className="text-sm">
                            {hospitals.length} Results
                        </Badge>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="relative"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                            {activeFiltersCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Filter Panel */}
                <div
                    className={`overflow-hidden transition-all duration-300 ${showFilters ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"
                        }`}
                >
                    <div className="p-6 rounded-xl bg-card border border-border shadow-card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-foreground">Filter Options</h3>
                            <Button variant="ghost" size="sm" onClick={resetFilters}>
                                <X className="h-4 w-4 mr-1" />
                                Reset All
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* City Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">City</label>
                                <Select
                                    value={filters.city}
                                    onValueChange={(value) => updateFilter("city", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Cities" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All Cities">All Cities</SelectItem>
                                        {availableCities.map((city) => (
                                            <SelectItem key={city} value={city}>{city}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Category Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Category</label>
                                <Select
                                    value={filters.category}
                                    onValueChange={(value) => updateFilter("category", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All Categories">All Categories</SelectItem>
                                        <SelectItem value="Government">Government</SelectItem>
                                        <SelectItem value="Private">Private</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                {loading ? (
                    <Loading message="Loading hospitals..." />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                        {hospitals.map((hospital) => (
                            <HospitalCard key={hospital._id} hospital={hospital} />
                        ))}
                        {hospitals.length === 0 && (
                            <div className="col-span-full text-center py-12 text-muted-foreground">
                                No hospitals found matching your criteria.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HospitalSearch;
