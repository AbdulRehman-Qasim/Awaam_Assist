import React, { useState, useEffect } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";


const cities = ["Karachi", "Lahore", "Islamabad", "Faisalabad"];
const disciplines = ["Engineering", "Medicine", "Business", "Arts & Humanities"];
const provinces = ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan"];

interface Filters {
  city: string;
  discipline: string;
  province: string;
  minMerit: number;
  maxMerit: number;
  minFee: number;
  maxFee: number;
  sortBy: string;
}


const defaultFilters: Filters = {
  city: "",
  discipline: "",
  province: "",
  minMerit: 0,
  maxMerit: 100,
  minFee: 0,
  maxFee: 1000000, // PKR 1 Million
  sortBy: "ranking",
};


const UniversitySearchFiltersPage = () => {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [totalResults, setTotalResults] = useState(500);
  const [showFilters, setShowFilters] = useState(false);

 
  const updateFilter = (key: keyof Filters, value: string | number | number[]) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

 
  const resetFilters = () => {
    setFilters(defaultFilters);
  
  };

 
  const activeFiltersCount = [
    filters.city,
    filters.discipline,
    filters.province,
   
    filters.minMerit > defaultFilters.minMerit,
    filters.maxMerit < defaultFilters.maxMerit,
    filters.minFee > defaultFilters.minFee,
    filters.maxFee < defaultFilters.maxFee,
 
    filters.sortBy !== defaultFilters.sortBy && filters.sortBy !== 'ranking', 
  ].filter(Boolean).length;
  
  
  useEffect(() => {
  
    console.log("Filters changed. Fetching new results for:", filters);

  
    const newResults = Math.floor(Math.random() * (500 - 100 + 1) + 100);
    setTotalResults(newResults); 
    
  
  }, [filters]); 

  return (
    <div className="w-full h-full bg-white p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">University Search & Filters</h1>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-foreground">
              Universities
            </h2>
            <Badge variant="secondary" className="text-sm">
              {totalResults} Results
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            {/* Sort Dropdown (Outside the panel for quick access) */}
            <Select
              value={filters.sortBy}
              onValueChange={(value) => updateFilter("sortBy", value)}
            >
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ranking">Top Ranked</SelectItem>
                <SelectItem value="merit-low">Merit (Low to High)</SelectItem>
                <SelectItem value="merit-high">Merit (High to Low)</SelectItem>
                <SelectItem value="fee-low">Fee (Low to High)</SelectItem>
                <SelectItem value="fee-high">Fee (High to Low)</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter Panel */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            showFilters ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <SelectItem value="">All Cities</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Discipline Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Discipline
                </label>
                <Select
                  value={filters.discipline}
                  onValueChange={(value) => updateFilter("discipline", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Disciplines" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Disciplines</SelectItem>
                    {disciplines.map((disc) => (
                      <SelectItem key={disc} value={disc}>
                        {disc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Province Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Province
                </label>
                <Select
                  value={filters.province}
                  onValueChange={(value) => updateFilter("province", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Provinces" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Provinces</SelectItem>
                    {provinces.map((prov) => (
                      <SelectItem key={prov} value={prov}>
                        {prov}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Note: The fourth column is intentionally left for padding/design 
                   or can be used for another filter. The Sort By dropdown is 
                   already placed outside the panel for better UX. */}
            </div>

            {/* Merit Range Slider */}
            <div className="mt-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    Merit Range
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {filters.minMerit}% - {filters.maxMerit}%
                  </span>
                </div>
                <Slider
                  value={[filters.minMerit, filters.maxMerit]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([min, max]) => {
                    updateFilter("minMerit", min);
                    updateFilter("maxMerit", max);
                  }}
                  className="w-full"
                />
              </div>

              {/* Fee Range Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    Fee Range (PKR)
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {filters.minFee.toLocaleString()} -{" "}
                    {filters.maxFee.toLocaleString()}
                  </span>
                </div>
                <Slider
                  value={[filters.minFee, filters.maxFee]}
                  min={0}
                  max={1000000}
                  step={10000}
                  onValueChange={([min, max]) => {
                    updateFilter("minFee", min);
                    updateFilter("maxFee", max);
                  }}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder for University List/Results */}
        <div className="mt-8 p-6 border rounded-xl bg-gray-50 shadow-sm">
          <h3 className="text-xl font-semibold mb-3 text-gray-900">University List</h3>
          <p className="text-gray-600">
            {totalResults} universities matching your criteria will be displayed here. 
          </p>
        </div>
      </div>
    </div>
  );
};

export default UniversitySearchFiltersPage;