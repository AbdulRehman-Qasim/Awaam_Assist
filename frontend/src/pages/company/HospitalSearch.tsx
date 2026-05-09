import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search, Heart as HeartPulse, MapPin, Building2,
  Star, ShieldCheck, Zap, Stethoscope, BadgeCheck,
  RefreshCw, Sparkles, ChevronDown, SlidersHorizontal, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import HospitalCard from "./HospitalCard";
import { hospitalPublicAPI, HospitalRecord, HospitalFilters, HospitalQueryParams } from "@/services/hospitalAPI";
import { ModuleFeedback } from "@/components/shared/ModuleFeedback";

// ── Filter state shape ────────────────────────────────────────────────────────

interface ActiveFilters {
  search: string;
  city: string;
  category: string;
  availability: string;
  specialization: string;
  maxCost: number;
  emergencyOnly: boolean;
  verifiedOnly: boolean;
  topRated: boolean;
}

const DEFAULT_FILTERS: ActiveFilters = {
  search: "", city: "", category: "", availability: "",
  specialization: "", maxCost: 0,
  emergencyOnly: false, verifiedOnly: false, topRated: false,
};

// ── Main component ──────────────────────────────────────────────────────────



const HospitalSearch = () => {
  const [hospitals, setHospitals] = useState<HospitalRecord[]>([]);
  const [filterOptions, setFilterOptions] = useState<HospitalFilters>({ cities: [], categories: [], specializations: [] });
  const [loading, setLoading] = useState(true);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [filters, setFilters] = useState<ActiveFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(true);

  // ── Fetch dynamic filter options from DB ──────────────────────────────────
  useEffect(() => {
    setFiltersLoading(true);
    hospitalPublicAPI.getFilters()
      .then(data => setFilterOptions(data))
      .catch(err => console.error("Error fetching filters:", err))
      .finally(() => setFiltersLoading(false));
  }, []);

  // ── Fetch hospitals when server-side filters change ───────────────────────
  const fetchHospitals = useCallback(async () => {
    setLoading(true);
    try {
      const params: HospitalQueryParams = {
        city: filters.city || undefined,
        category: filters.category || undefined,
        q: filters.search || undefined,
        availability: filters.availability || undefined,
        maxCost: filters.maxCost > 0 ? String(filters.maxCost) : undefined,
        treatmentType: filters.specialization || undefined,
      };
      const data = await hospitalPublicAPI.getAll(params);
      setHospitals(data);
    } catch (err) {
      console.error("Error fetching hospitals:", err);
    } finally {
      setLoading(false);
    }
  }, [filters.city, filters.category, filters.search, filters.availability, filters.maxCost, filters.specialization]);

  useEffect(() => {
    const t = setTimeout(fetchHospitals, 300);
    return () => clearTimeout(t);
  }, [fetchHospitals]);

  // ── Client-side quick filters (emergency, verified, top-rated) ───────────
  const visibleHospitals = useMemo(() => {
    let result = [...hospitals];
    if (filters.emergencyOnly) result = result.filter(h => h.emergencyServices);
    if (filters.verifiedOnly)  result = result.filter(h => h.isVerified);
    if (filters.topRated)      result = result.filter(h => (h.rating || 0) >= 4);
    return result;
  }, [hospitals, filters.emergencyOnly, filters.verifiedOnly, filters.topRated]);

  const set = (key: keyof ActiveFilters, value: ActiveFilters[keyof ActiveFilters]) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  // ── Active filter chips ───────────────────────────────────────────────────
  const activeChips: { label: string; reset: () => void }[] = [];
  if (filters.city)           activeChips.push({ label: `City: ${filters.city}`,          reset: () => set('city', '') });
  if (filters.category)       activeChips.push({ label: `Category: ${filters.category}`,  reset: () => set('category', '') });
  if (filters.availability)   activeChips.push({ label: `Status: ${filters.availability}`,reset: () => set('availability', '') });
  if (filters.specialization) activeChips.push({ label: `Spec: ${filters.specialization}`,reset: () => set('specialization', '') });
  if (filters.maxCost > 0)    activeChips.push({ label: `Budget ≤ PKR ${filters.maxCost.toLocaleString()}`, reset: () => set('maxCost', 0) });
  if (filters.emergencyOnly)  activeChips.push({ label: 'Emergency Only',                 reset: () => set('emergencyOnly', false) });
  if (filters.verifiedOnly)   activeChips.push({ label: 'Verified Only',                  reset: () => set('verifiedOnly', false) });
  if (filters.topRated)       activeChips.push({ label: 'Top Rated (4★+)',                reset: () => set('topRated', false) });

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="module-hero hero-gradient-healthcare">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, rgba(255,255,255,0.3) 0%, transparent 60%)' }} />
        <div className="absolute top-6 right-8 w-32 h-32 rounded-full bg-white/5 animate-float" />
        <div className="absolute bottom-8 left-10 w-20 h-20 rounded-2xl bg-white/5 animate-float delay-300" />

        <div className="relative z-10 container px-4 py-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}>
            <HeartPulse className="h-4 w-4" />
            <span>Pakistan Healthcare Network</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-5 tracking-tight">
            Find <span className="text-cyan-300">Healthcare</span> Facilities
          </h1>

          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Discover hospitals by city, category, treatment, and budget. Powered by live admin data.
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-white/60 z-10" />
              <Input
                type="text"
                placeholder="Search hospitals, treatments, cities..."
                value={filters.search}
                onChange={e => set('search', e.target.value)}
                className="h-14 pl-12 pr-4 text-base rounded-2xl border-2 border-white/25 bg-white/15 text-white placeholder:text-white/50 focus:border-white/50 focus:bg-white/20 backdrop-blur-sm transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-8 mt-8">
            {[
              { label: 'Hospitals', value: `${hospitals.length}+` },
              { label: 'Cities', value: `${filterOptions.cities.length}+` },
              { label: 'Categories', value: `${filterOptions.categories.length}` },
              { label: 'Specializations', value: `${filterOptions.specializations.length}+` },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-xs font-semibold text-white/60 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick-Filter Toggles ──────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'emergencyOnly' as const, icon: Zap,         label: 'Emergency Services', color: 'text-rose-600 bg-rose-50 border-rose-200'   },
          { key: 'verifiedOnly'  as const, icon: BadgeCheck,  label: 'Verified Hospitals',  color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
          { key: 'topRated'      as const, icon: Star,        label: 'Top Rated (4★+)',      color: 'text-amber-600 bg-amber-50 border-amber-200' },
        ].map(({ key, icon: Icon, label, color }) => (
          <button
            key={key}
            onClick={() => set(key, !filters[key])}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
              filters[key] ? color : 'text-muted-foreground bg-card border-border hover:border-primary/30'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Filter Card — matches Schemes Dashboard style ─────────────── */}
      <Card className="border-2 overflow-hidden shadow-lg" style={{ borderColor: 'rgba(8,145,178,0.2)' }}>
        <CardHeader
          className="text-white cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #042f4a, #0e7490)' }}
          onClick={() => setShowFilters(!showFilters)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  Filter Hospitals
                  <Sparkles className="h-4 w-4" />
                  {activeChips.length > 0 && (
                    <span className="ml-1 text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full">
                      {activeChips.length} active
                    </span>
                  )}
                  {filtersLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin opacity-60" />}
                </CardTitle>
                <p className="text-sm text-white/80 mt-1">
                  Narrow results by city, category, specialization, and budget
                </p>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
          </div>
        </CardHeader>

        <div className={`overflow-hidden transition-all duration-300 ${showFilters ? 'max-h-[1000px]' : 'max-h-0'}`}>
          <CardContent className="pt-6 space-y-6">

            {/* Row 1 — Primary 4-column filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="filter-city" className="text-sm font-medium flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-cyan-600" /> City
                </Label>
                <Select value={filters.city || 'all'} onValueChange={v => set('city', v === 'all' ? '' : v)}>
                  <SelectTrigger id="filter-city" className="h-11">
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {filterOptions.cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="filter-category" className="text-sm font-medium flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-cyan-600" /> Category
                </Label>
                <Select value={filters.category || 'all'} onValueChange={v => set('category', v === 'all' ? '' : v)}>
                  <SelectTrigger id="filter-category" className="h-11">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {filterOptions.categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Availability */}
              <div className="space-y-2">
                <Label htmlFor="filter-avail" className="text-sm font-medium flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-cyan-600" /> Availability
                </Label>
                <Select value={filters.availability || 'all'} onValueChange={v => set('availability', v === 'all' ? '' : v)}>
                  <SelectTrigger id="filter-avail" className="h-11">
                    <SelectValue placeholder="Any Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Status</SelectItem>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Limited">Limited</SelectItem>
                    <SelectItem value="By Appointment">By Appointment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Specialization — DB-driven */}
              <div className="space-y-2">
                <Label htmlFor="filter-spec" className="text-sm font-medium flex items-center gap-1.5">
                  <Stethoscope className="h-3.5 w-3.5 text-cyan-600" /> Specialization
                </Label>
                <Select value={filters.specialization || 'all'} onValueChange={v => set('specialization', v === 'all' ? '' : v)}>
                  <SelectTrigger id="filter-spec" className="h-11">
                    <SelectValue placeholder="All Specializations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specializations</SelectItem>
                    {filterOptions.specializations.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2 — Budget slider */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center justify-between">
                <span>Max Treatment Budget (PKR)</span>
                <span className="font-black" style={{ color: '#0e7490' }}>
                  {filters.maxCost > 0 ? `PKR ${filters.maxCost.toLocaleString()}` : 'Any'}
                </span>
              </Label>
              <Slider
                value={[filters.maxCost]}
                min={0}
                max={200000}
                step={5000}
                onValueChange={([v]) => set('maxCost', v)}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                <span>Free / Any</span>
                <span>PKR 200,000</span>
              </div>
            </div>

            {/* Row 3 — Quality toggles */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Quality Filters</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {([
                  { key: 'emergencyOnly' as const, icon: Zap,         label: 'Emergency Services Available' },
                  { key: 'verifiedOnly'  as const, icon: ShieldCheck,  label: 'Verified Hospitals Only' },
                  { key: 'topRated'      as const, icon: Star,         label: 'Top Rated (4★ and above)' },
                ] as const).map(({ key, icon: Icon, label }) => (
                  <label key={key}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all select-none ${
                      filters[key]
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                        : 'border-border hover:border-cyan-200 bg-background'
                    }`}
                    onClick={() => set(key, !filters[key])}
                  >
                    <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      filters[key] ? 'bg-cyan-600 border-cyan-600' : 'border-muted-foreground/40'
                    }`}>
                      {filters[key] && <span className="text-white text-[10px] font-black">✓</span>}
                    </div>
                    <Icon className={`h-4 w-4 flex-shrink-0 ${filters[key] ? 'text-cyan-600' : 'text-muted-foreground'}`} />
                    <span className="text-sm font-semibold">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* CTA */}
            <Button
              size="lg"
              className="w-full text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg, #0e7490, #06b6d4)' }}
              onClick={fetchHospitals}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Find Matching Hospitals
            </Button>

            {/* Active filter chips */}
            {activeChips.length > 0 && (
              <div className="pt-2 border-t border-border/50">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black text-muted-foreground uppercase tracking-wider">Active:</span>
                  {activeChips.map(chip => (
                    <span key={chip.label}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                      {chip.label}
                      <button onClick={chip.reset} className="hover:text-red-500 transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <button onClick={resetFilters}
                    className="text-xs font-bold text-rose-500 hover:text-rose-600 underline-offset-2 hover:underline ml-1">
                    Clear All
                  </button>
                </div>
              </div>
            )}

          </CardContent>
        </div>
      </Card>

      {/* ── Results Header ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-extrabold text-foreground">Hospitals</h2>
          <Badge variant="secondary" className="text-sm font-bold px-3 py-1 rounded-full"
            style={{ background: 'hsl(194 100% 43% / 0.1)', color: 'hsl(194 100% 35%)' }}>
            {visibleHospitals.length} Results
          </Badge>
        </div>
      </div>


        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/50 overflow-hidden animate-pulse">
                <div className="h-1 w-full bg-cyan-200/40" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-20 bg-muted rounded-full" />
                  <div className="h-5 w-3/4 bg-muted rounded-lg" />
                  <div className="h-4 w-1/2 bg-muted rounded-lg" />
                  <div className="h-4 w-2/3 bg-muted rounded-lg" />
                  <div className="h-9 w-full bg-muted rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : visibleHospitals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ background: 'hsl(194 100% 43% / 0.1)' }}>
              <HeartPulse className="h-8 w-8" style={{ color: 'hsl(194 100% 35%)' }} />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">No Hospitals Found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
            <Button variant="outline" onClick={resetFilters} className="rounded-xl mt-3">
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {visibleHospitals.map((hospital, idx) => (
              <div key={hospital._id} className="animate-fade-in-up"
                style={{ animationDelay: `${Math.min(idx * 40, 400)}ms`, animationFillMode: 'both' }}>
                <HospitalCard hospital={hospital} />
              </div>
            ))}
          </div>
        )}

      {/* Module Feedback Section */}
      <div className="container max-w-4xl mx-auto pt-10 pb-20">
        <ModuleFeedback moduleName="healthcare" />
      </div>
    </div>
  );
};

export default HospitalSearch;
