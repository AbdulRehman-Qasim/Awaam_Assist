import { useState, useMemo, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModuleFeedback } from "@/components/shared/ModuleFeedback";
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
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  GraduationCap,
  Heart,
  Menu,
  X,
  Search,
  BookOpen,
  Users,
  Award,
  Calculator,
  ChevronDown,
  Sparkles,
  Filter,
  MapPin,
  Phone,
  Mail,
  Globe,
  ExternalLink,
  Scale,
  TrendingUp,
  Trash2,
  Calendar,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "https://awaam-assist.onrender.com";

const fetchJson = async (url: string) => {
  const response = await fetch(url);
  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    console.error("[HeroSection] API request failed:", { url, status: response.status });
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (!contentType.includes("application/json")) {
    console.error("[HeroSection] Expected JSON but received non-JSON response:", {
      url,
      status: response.status,
      contentType,
    });
    throw new Error("API returned non-JSON response");
  }

  return response.json();
};

// ==================== DATA TYPES ====================
export interface University {
  id: string;
  _id?: string;
  title: string;
  city: string;
  province: string;
  degree: string;
  discipline: string;
  fee: number;
  semesterFee?: number;
  feeType?: string;
  merit: number;
  ranking?: number;
  status: number;
  contact: string;
  info: string;
  web: string;
  url: string;
  logo: string;
  admissions: string;
  description?: string;
  map: {
    address: string;
    lat: number;
    long: number;
    location: string;
  };
  deadline: string;
  admission: string;
  meritHistory?: { year: number; merit: number }[];
}

interface LiveStats {
  totalUniversities: number;
  totalPrograms: number;
  totalCities: number;
  totalProvinces: number;
}

interface LiveFilters {
  cities: string[];
  disciplines: string[];
  provinces: string[];
}

// ==================== LIVE DATA HOOK ====================
const useLiveData = () => {
  const [stats, setStats] = useState<LiveStats>({
    totalUniversities: 0,
    totalPrograms: 0,
    totalCities: 0,
    totalProvinces: 0,
  });
  const [filterOptions, setFilterOptions] = useState<LiveFilters>({
    cities: [],
    disciplines: [],
    provinces: [],
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const data = await fetchJson(`${API_URL}/api/universities/live-stats`);
        if (data.success) {
          setStats(data.stats);
          setFilterOptions(data.filters);
        }
      } catch (err) {
        console.error('[HeroSection] Failed to load live stats:', err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchLiveStats();
  }, []);

  return { stats, filterOptions, statsLoading };
};

// ==================== API FETCH HOOK ====================
interface FetchParams {
  search?: string;
  marks?: string;
  maxFee?: string;
  minFee?: string;
  city?: string;
  discipline?: string;
  province?: string;
  sortBy?: string;
}

const useUniversities = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false); // has user triggered a search?

  const fetchUniversities = async (params: FetchParams) => {
    setLoading(true);
    setSearched(true);
    try {
      const qs = new URLSearchParams();
      if (params.search)      qs.set('search',     params.search);
      if (params.marks)       qs.set('marks',      params.marks);
      if (params.maxFee)      qs.set('maxFee',     params.maxFee);
      if (params.city && params.city !== 'all')             qs.set('city',       params.city);
      if (params.discipline && params.discipline !== 'all') qs.set('discipline', params.discipline);
      if (params.province && params.province !== 'all')     qs.set('province',   params.province);
      if (params.sortBy)      qs.set('sortBy',     params.sortBy);

      console.log('[HeroSection] Fetching universities with params:', params);
      const url = `${API_URL}/api/universities?${qs.toString()}&t=${Date.now()}`;
      const data = await fetchJson(url);
      if (data.success) {
        setUniversities(
          (data.data as any[]).map((u) => ({
            id:          u.id || u._id || '',
            _id:         u._id,
            title:       u.title,
            city:        u.city,
            province:    u.province,
            degree:      u.degree,
            discipline:  u.discipline,
            fee:         u.fee ?? u.semesterFee ?? 0,
            semesterFee: u.semesterFee,
            feeType:     u.feeType,
            merit:       u.merit,
            ranking:     u.ranking,
            status:      u.status,
            contact:     u.contact,
            info:        u.info,
            web:         u.web,
            url:         u.url,
            logo:        u.logo,
            admissions:  u.admissions,
            description: u.description,
            map: {
              address:  u.map?.address || u['map.address'] || '',
              lat:      u.map?.lat     || u['map.lat']     || 0,
              long:     u.map?.long    || u['map.long']    || 0,
              location: u.map?.location || u.city,
            },
            deadline:  u.deadline,
            admission: u.admission,
          }))
        );
      } else {
        toast({
          title: "Search Error",
          description: data.error || "Failed to fetch universities. Please try again.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('[HeroSection] University fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { universities, loading, searched, fetchUniversities };
};


// ==================== HEADER COMPONENT ====================
interface HeaderProps {
  favoritesCount: number;
  onShowFavorites: () => void;
}

const Header = ({ favoritesCount, onShowFavorites }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    </header>
  );
};

// ==================== HERO SECTION COMPONENT ====================
interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
  stats: { totalUniversities: number; totalPrograms: number; totalCities: number; totalProvinces: number };
  statsLoading: boolean;
  loading?: boolean;
}

const StatItem = ({
  icon: Icon,
  value,
  label,
  loading,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
  loading?: boolean;
}) => (
  <div className="text-center">
    <div className="text-2xl font-black text-white">
      {loading ? <span className="inline-block w-12 h-8 bg-white/20 animate-pulse rounded" /> : value}
    </div>
    <div className="text-xs font-semibold text-white/60 uppercase tracking-wider">{label}</div>
  </div>
);

const HeroSection = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  stats,
  statsLoading,
  loading,
}: HeroSectionProps) => {
  return (
    <section
      id="home"
      className="module-hero hero-gradient-education"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, rgba(255,255,255,0.3) 0%, transparent 60%)' }} />
      <div className="absolute top-6 right-8 w-32 h-32 rounded-full bg-white/5 animate-float" />
      <div className="absolute bottom-8 left-10 w-20 h-20 rounded-2xl bg-white/5 animate-float delay-200" />

      <div className="container relative z-10 px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold animate-fade-in" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}>
            <Award className="h-4 w-4" />
            <span>Pakistan's #1 University Search Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight animate-slide-up">
            Find Your{" "}
            <span style={{ color: '#93c5fd' }}>Perfect University</span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            Discover top universities across Pakistan based on your marks, budget,
            and preferences. Compare, shortlist, and make informed decisions.
          </p>

          {/* Search Bar */}
          <div
            className="max-w-2xl mx-auto animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search universities, programs, or cities..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') onSearchSubmit(); }}
                className="h-14 pl-12 pr-4 text-base rounded-2xl border-2 border-white/25 bg-white/15 text-white placeholder:text-white/50 focus:border-white/50 focus:bg-white/20 backdrop-blur-sm transition-all"
              />
              <Button
                variant="default"
                size="lg"
                className="absolute right-2 rounded-xl"
                onClick={onSearchSubmit}
                disabled={loading}
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Search"
                )}
              </Button>
            </div>
          </div>

          {/* Live Stats */}
          <div
            className="flex flex-wrap items-center justify-center gap-8 max-w-3xl mx-auto mt-10 animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            <StatItem icon={BookOpen} value={`${stats.totalUniversities}+`}  label="Universities" loading={statsLoading} />
            <StatItem icon={Award}    value={`${stats.totalPrograms}+`}       label="Programs" loading={statsLoading} />
            <StatItem icon={Search}   value={`${stats.totalCities}+`}         label="Cities" loading={statsLoading} />
          </div>
        </div>
      </div>
    </section>
  );
};

// ==================== ELIGIBILITY CHECKER COMPONENT ====================
interface EligibilityCheckerProps {
  onCheck: (filters: {
    marks: number;
    maxFee: number;
    city: string;
    discipline: string;
  }) => void;
  searchFields: {
    marks: string;
    maxFee: string;
    city: string;
    discipline: string;
  };
  onSearchFieldsChange: (fields: {
    marks: string;
    maxFee: string;
    city: string;
    discipline: string;
  }) => void;
  filterOptions: { cities: string[]; disciplines: string[]; provinces: string[] };
  searching: boolean;
}

const EligibilityChecker = ({ onCheck, searchFields, onSearchFieldsChange, filterOptions, searching }: EligibilityCheckerProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleCheck = () => {
    onCheck({
      marks:     parseFloat(searchFields.marks)  || 0,
      maxFee:    parseFloat(searchFields.maxFee) || 0,
      city:      searchFields.city,
      discipline:searchFields.discipline,
    });
  };

  const updateField = (field: keyof typeof searchFields, value: string) => {
    onSearchFieldsChange({ ...searchFields, [field]: value });
  };

  return (
    <Card className="border-2 overflow-hidden shadow-lg" style={{ borderColor: 'rgba(43,80,232,0.2)' }}>
      <CardHeader
        className="text-white cursor-pointer"
        style={{ background: 'linear-gradient(135deg, #1e3a5f, #2b50e8)' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <Calculator className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white flex items-center gap-2 text-lg font-bold">
                Check Your Eligibility
                <Sparkles className="h-4 w-4 text-blue-200" />
              </CardTitle>
              <p className="text-sm text-white/75 mt-0.5">
                Enter your details to find matching universities
              </p>
            </div>
          </div>
          <ChevronDown
            className={`h-5 w-5 text-white transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </CardHeader>

      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[520px]' : 'max-h-0'}`}>
        <CardContent className="pt-6 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <div className="space-y-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" /> Your Marks (%)
              </label>
              <Input
                id="marks"
                type="number"
                placeholder="e.g., 85"
                value={searchFields.marks}
                onChange={(e) => updateField('marks', e.target.value)}
                min="0" max="100"
                className="h-11 rounded-xl border-border/70 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="h-3.5 w-3.5" /> Max Fee Budget (PKR)
              </label>
              <Input
                id="maxFee"
                type="number"
                placeholder="e.g., 200000"
                value={searchFields.maxFee}
                onChange={(e) => updateField('maxFee', e.target.value)}
                min="0"
                className="h-11 rounded-xl border-border/70 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Preferred City
              </label>
              <Select value={searchFields.city} onValueChange={(v) => updateField('city', v)}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {filterOptions.cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> Discipline
              </label>
              <Select value={searchFields.discipline} onValueChange={(v) => updateField('discipline', v)}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="All Disciplines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Disciplines</SelectItem>
                  {filterOptions.disciplines.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full mt-6 text-white font-bold rounded-xl shadow-lg"
            style={{ background: 'linear-gradient(135deg, #2b50e8, #00b4d8)' }}
            onClick={handleCheck}
            disabled={searching}
          >
            {searching ? (
              <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Searching...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" />Find Matching Universities</>
            )}
          </Button>
        </CardContent>
      </div>
    </Card>
  );
};

// ==================== UNIVERSITY FILTERS COMPONENT ====================
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

interface UniversityFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  totalResults: number;
  filterOptions: { cities: string[]; disciplines: string[]; provinces: string[] };
}

const UniversityFilters = ({
  filters,
  onFiltersChange,
  totalResults,
  filterOptions,
}: UniversityFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = (key: keyof Filters, value: string | number) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange({
      city: "",
      discipline: "",
      province: "",
      minMerit: 0,
      maxMerit: 100,
      minFee: 0,
      maxFee: 1000000,
      sortBy: "ranking",
    });
  };

  const activeFiltersCount = [
    filters.city,
    filters.discipline,
    filters.province,
    filters.minMerit > 0,
    filters.maxMerit < 100,
    filters.minFee > 0,
    filters.maxFee < 1000000,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-extrabold text-foreground">Universities</h2>
          <Badge
            className="text-sm font-bold px-3 py-1 rounded-full"
            style={{ background: 'hsl(234 89% 54% / 0.1)', color: 'hsl(234 89% 50%)', border: '1px solid hsl(234 89% 54% / 0.2)' }}
          >
            {totalResults} Results
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
            >
              <X className="h-3.5 w-3.5 mr-1" />Clear filters
            </Button>
          )}
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="relative rounded-xl font-semibold"
          >
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white">
                {activeFiltersCount}
              </span>
            )}
          </Button>

        </div>
      </div>

      {/* Filter Panel */}
      <div className={`overflow-hidden transition-all duration-300 ${showFilters ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="filter-panel">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              Filter Options
            </h3>
            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs rounded-xl">
              <X className="h-4 w-4 mr-1" />Reset All
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-wider">City</label>
              <Select value={filters.city} onValueChange={(v) => updateFilter('city', v)}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="All Cities" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {filterOptions.cities.map((city) => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-wider">Discipline</label>
              <Select value={filters.discipline} onValueChange={(v) => updateFilter('discipline', v)}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="All Disciplines" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Disciplines</SelectItem>
                  {filterOptions.disciplines.map((disc) => <SelectItem key={disc} value={disc}>{disc}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-wider">Province</label>
              <Select value={filters.province} onValueChange={(v) => updateFilter('province', v)}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="All Provinces" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Provinces</SelectItem>
                  {filterOptions.provinces.map((prov) => <SelectItem key={prov} value={prov}>{prov}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Merit & Fee Sliders */}
          <div className="mt-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-wider">Merit Range</label>
                <span className="text-sm font-semibold text-foreground">{filters.minMerit}% – {filters.maxMerit}%</span>
              </div>
              <Slider
                value={[filters.minMerit, filters.maxMerit]}
                min={0} max={100} step={1}
                onValueChange={([min, max]) => onFiltersChange({ ...filters, minMerit: min, maxMerit: max })}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-wider">Fee Range (PKR)</label>
                <span className="text-sm font-semibold text-foreground">{filters.minFee.toLocaleString()} – {filters.maxFee.toLocaleString()}</span>
              </div>
              <Slider
                value={[filters.minFee, filters.maxFee]}
                min={0} max={1000000} step={10000}
                onValueChange={([min, max]) => onFiltersChange({ ...filters, minFee: min, maxFee: max })}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// ==================== UNIVERSITY CARD COMPONENT ====================
interface UniversityCardProps {
  university: University;
  isFavorite: boolean;
  isSelected: boolean;
  onToggleFavorite: () => void;
  onToggleCompare: () => void;
  onViewDetails: () => void;
}

/** Resolve the best available image URL with a fallback chain */
const resolveImage = (u: University): string => {
  const apiUrl = API_URL;
  
  // Try url field first, then logo
  const candidates = [u.url, u.logo].filter(s => !!s);

  for (const s of candidates) {
    if (!s) continue;
    // base64
    if (s.startsWith('data:')) return s;
    // Absolute URL
    if (s.startsWith('http')) return s;
    // Local server path
    if (s.startsWith('/') || s.includes('uploads/')) {
      const path = s.startsWith('/') ? s : `/${s}`;
      return `${apiUrl}${path}`;
    }
  }

  return `https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=60`;
};

const UniversityCard = ({
  university,
  isFavorite,
  isSelected,
  onToggleFavorite,
  onToggleCompare,
  onViewDetails,
}: UniversityCardProps) => {
  const [imgSrc, setImgSrc] = useState(resolveImage(university));

  // Ensure image updates when university data changes (e.g. search results refresh)
  useEffect(() => {
    setImgSrc(resolveImage(university));
  }, [university.url, university.logo, university.id]);

  const rankingLabel = null;

  const feeDisplay = university.fee > 0
    ? `PKR ${university.fee.toLocaleString()}${university.feeType === 'Semester Fee' ? '/sem' : '/yr'}`
    : university.semesterFee && university.semesterFee > 0
    ? `PKR ${university.semesterFee.toLocaleString()}/sem`
    : 'N/A';

  return (
    <Card
      variant="interactive"
      className={cn(
        "group flex flex-col overflow-hidden h-full transition-all duration-300",
        "hover:shadow-xl hover:-translate-y-1",
        isSelected && "ring-2 ring-secondary shadow-lg"
      )}
    >
      {/* ── Image Banner ── */}
      <div className="relative h-44 overflow-hidden bg-muted flex-shrink-0">
        <img
          src={imgSrc}
          alt={university.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() =>
            setImgSrc(
              `https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=60`
            )
          }
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Top-left badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {university.admission === 'Open' && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500 text-white shadow">
              Admissions Open
            </span>
          )}
          {rankingLabel && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground shadow">
              {rankingLabel}
            </span>
          )}
        </div>

        {/* Favourite button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className={cn(
            "absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-full",
            "bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-colors",
            isFavorite && "text-red-400"
          )}
        >
          <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
        </button>

        {/* City / Province label at bottom of image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 text-white/90">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="text-xs font-medium truncate">
            {university.city}{university.province ? `, ${university.province}` : ''}
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* University name */}
        <h3
          className="font-bold text-base text-foreground line-clamp-2 leading-snug group-hover:text-secondary transition-colors cursor-pointer"
          onClick={onViewDetails}
        >
          {university.title}
        </h3>

        {/* Discipline + Degree chips */}
        <div className="flex flex-wrap gap-1.5">
          {university.discipline && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-secondary/10 text-secondary font-medium border border-secondary/20">
              {university.discipline}
            </span>
          )}
          {university.degree && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground border border-border">
              {university.degree}
            </span>
          )}
        </div>

        {/* Merit & Fee stats */}
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <div className="rounded-lg bg-muted/60 p-2.5">
            <div className="text-xs text-muted-foreground mb-0.5">Min. Merit</div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-secondary" />
              <span className="font-bold text-sm text-foreground">
                {university.merit > 0 ? `${university.merit}%` : 'N/A'}
              </span>
            </div>
          </div>
          <div className="rounded-lg bg-muted/60 p-2.5">
            <div className="text-xs text-muted-foreground mb-0.5">Fee</div>
            <div className="font-bold text-sm text-foreground leading-tight">
              {feeDisplay}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={(e) => { e.stopPropagation(); onToggleCompare(); }}
          >
            <Scale className="h-3.5 w-3.5 mr-1" />
            {isSelected ? 'Remove' : 'Compare'}
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
          >
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
};


// ==================== COMPARE PANEL COMPONENT ====================
interface ComparePanelProps {
  universities: University[];
  onRemove: (id: string) => void;
  onClose: () => void;
}

const CompareRow = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
}) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-muted-foreground flex items-center gap-1.5">
      {Icon && <Icon className="h-3 w-3" />}
      {label}
    </span>
    <span className="font-medium text-foreground text-right max-w-[60%] truncate">
      {value}
    </span>
  </div>
);

const ComparePanel = ({
  universities,
  onRemove,
  onClose,
}: ComparePanelProps) => {
  if (universities.length === 0) return null;

  // Prepare merit history data for chart
  const meritChartData = universities[0]?.meritHistory?.map((_, index) => {
    const dataPoint: Record<string, number | string> = {
      year: universities[0].meritHistory![index].year,
    };
    universities.forEach((uni, uniIndex) => {
      if (uni.meritHistory?.[index]) {
        dataPoint[`uni${uniIndex}`] = uni.meritHistory[index].merit;
      }
    });
    return dataPoint;
  });

  const chartColors = ["hsl(180, 70%, 35%)", "hsl(217, 91%, 25%)", "hsl(38, 92%, 50%)"];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 animate-slide-up">
      <Card variant="elevated" className="rounded-b-none border-b-0 shadow-2xl">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-accent">
                <Scale className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  Compare Universities ({universities.length}/3)
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select up to 3 universities to compare
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 pb-8 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {universities.map((uni, index) => (
              <div
                key={uni.id}
                className="relative p-4 rounded-xl border border-border bg-card"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => onRemove(uni.id)}
                >
                  <X className="h-4 w-4" />
                </Button>

                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: chartColors[index] }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground line-clamp-2 text-sm">
                      {uni.title}
                    </h4>
                    <div className="flex items-center gap-1 mt-1 text-muted-foreground text-xs">
                      <MapPin className="h-3 w-3" />
                      {uni.city}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <CompareRow
                    label="Ranking"
                    value={`#${uni.ranking}`}
                    icon={Award}
                  />
                  <CompareRow
                    label="Merit"
                    value={`${uni.merit}%`}
                    icon={TrendingUp}
                  />
                  <CompareRow
                    label="Fee/Year"
                    value={`PKR ${uni.fee.toLocaleString()}`}
                  />
                  <CompareRow label="Degree" value={uni.degree} />
                  <CompareRow label="Discipline" value={uni.discipline} />
                  <CompareRow
                    label="Contact"
                    value={uni.contact}
                    icon={Phone}
                  />
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <Badge
                    variant={uni.admission === "Open" ? "success" : "muted"}
                    className="w-full justify-center"
                  >
                    Admissions {uni.admission}
                  </Badge>
                </div>
              </div>
            ))}

            {universities.length < 3 && (
              <div className="flex items-center justify-center min-h-[300px] p-4 rounded-xl border-2 border-dashed border-border bg-muted/30">
                <p className="text-sm text-muted-foreground text-center">
                  Select {3 - universities.length} more{" "}
                  {universities.length === 2 ? "university" : "universities"} to
                  compare
                </p>
              </div>
            )}
          </div>

          {/* Merit Trend Chart */}
          {universities.length >= 2 && meritChartData && (
            <div className="mt-8 p-4 rounded-xl border border-border bg-card">
              <h4 className="font-semibold text-foreground mb-4">
                Merit Trend (Last 5 Years)
              </h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={meritChartData}>
                    <XAxis
                      dataKey="year"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <YAxis
                      domain={[50, 100]}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    {universities.map((uni, index) => (
                      <Line
                        key={uni.id}
                        type="monotone"
                        dataKey={`uni${index}`}
                        name={uni.title.substring(0, 20) + "..."}
                        stroke={chartColors[index]}
                        strokeWidth={2}
                        dot={{ fill: chartColors[index], r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ==================== UNIVERSITY DETAIL MODAL COMPONENT ====================
interface UniversityDetailModalProps {
  university: University | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const DetailStatCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
    <Icon className="h-5 w-5 mx-auto mb-2 text-secondary" />
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className="font-semibold text-foreground text-sm">{value}</p>
  </div>
);

const ContactRow = ({
  icon: Icon,
  label,
  value,
  isLink,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  isLink?: boolean;
}) => (
  <div className="flex items-center gap-3 text-sm">
    <Icon className="h-4 w-4 text-secondary" />
    {isLink ? (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="text-secondary hover:underline truncate"
      >
        {value}
      </a>
    ) : (
      <span className="text-foreground truncate">{value}</span>
    )}
  </div>
);

const UniversityDetailModal = ({
  university,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
}: UniversityDetailModalProps) => {
  if (!university) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* Hero Image */}
        <div className="relative h-64 w-full">
          <img
            src={resolveImage(university)}
            alt={university.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src =
                "https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-4 right-16",
              isFavorite && "text-destructive"
            )}
            onClick={onToggleFavorite}
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
          </Button>

          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="secondary">
                <Award className="h-3 w-3 mr-1" />
                Rank #{university.ranking}
              </Badge>
              <Badge
                variant={university.admission === "Open" ? "secondary" : "outline"}
              >
                Admissions {university.admission}
              </Badge>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              {university.title}
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <DetailStatCard
              icon={TrendingUp}
              label="Merit Required"
              value={`${university.merit}%`}
            />
            <DetailStatCard
              icon={GraduationCap}
              label="Annual Fee"
              value={`PKR ${university.fee.toLocaleString()}`}
            />
            <DetailStatCard
              icon={MapPin}
              label="Location"
              value={university.city}
            />
            <DetailStatCard
              icon={Calendar}
              label="Deadline"
              value={university.deadline || "TBA"}
            />
          </div>

          {/* Program Info */}
          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <h3 className="font-semibold text-foreground mb-3">Program Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Degree</span>
                <p className="font-medium text-foreground">{university.degree}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Discipline</span>
                <p className="font-medium text-foreground">
                  {university.discipline}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Province</span>
                <p className="font-medium text-foreground">
                  {university.province}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Status</span>
                <p className="font-medium text-foreground">
                  {university.status === 1 ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
          </div>

          {/* Merit History Chart */}
          {university.meritHistory && (
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <h3 className="font-semibold text-foreground mb-4">
                Merit Trend (Last 5 Years)
              </h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={university.meritHistory}>
                    <XAxis
                      dataKey="year"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <YAxis
                      domain={["dataMin - 5", "dataMax + 5"]}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => [`${value}%`, "Merit"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="merit"
                      stroke="hsl(180, 70%, 35%)"
                      strokeWidth={3}
                      dot={{ fill: "hsl(180, 70%, 35%)", r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Contact & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
              <h3 className="font-semibold text-foreground">Contact Information</h3>
              <ContactRow icon={Phone} label="Phone" value={university.contact} />
              <ContactRow icon={Mail} label="Email" value={university.info} />
              <ContactRow
                icon={Globe}
                label="Website"
                value={university.web}
                isLink
              />
            </div>

            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <h3 className="font-semibold text-foreground mb-3">Address</h3>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-secondary" />
                <span>{university.map.address}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="default"
              size="lg"
              className="flex-1"
              onClick={() => window.open(university.web, "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
              Visit Website
            </Button>
            <Button
              variant="outline"
              size="lg"
              className={cn(
                "flex-1",
                isFavorite && "border-destructive text-destructive"
              )}
              onClick={onToggleFavorite}
            >
              <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
              {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ==================== FAVORITES PANEL COMPONENT ====================
interface FavoritesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: University[];
  onRemove: (id: string) => void;
  onViewDetails: (university: University) => void;
}

const FavoritesPanel = ({
  isOpen,
  onClose,
  favorites,
  onRemove,
  onViewDetails,
}: FavoritesPanelProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg p-0">
        <SheetHeader className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
              <Heart className="h-5 w-5 text-destructive fill-destructive" />
            </div>
            <div>
              <SheetTitle>Your Favorites</SheetTitle>
              <p className="text-sm text-muted-foreground">
                {favorites.length} universities saved
              </p>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)]">
          <div className="p-6 space-y-4">
            {favorites.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="font-semibold text-foreground mb-2">
                  No favorites yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Click the heart icon on universities to add them here
                </p>
              </div>
            ) : (
              favorites.map((uni) => (
                <div
                  key={uni.id}
                  className="group flex gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-card transition-all"
                >
                  <img
                    src={resolveImage(uni)}
                    alt={uni.title}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        "https://images.unsplash.com/photo-1562774053-701939374585?w=200&auto=format&fit=crop";
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground line-clamp-2 text-sm mb-2">
                      {uni.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs">
                        <Award className="h-3 w-3 mr-1" />Program Detail
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        {uni.city}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => onViewDetails(uni)}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                        onClick={() => onRemove(uni.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

// ==================== MAIN INDEX COMPONENT ====================
const Index = () => {
  const { toast } = useToast();
  const universitiesRef = useRef<HTMLDivElement>(null);

  // Live Data Hooks
  const { stats, filterOptions, statsLoading } = useLiveData();
  const { universities: liveUniversities, loading, searched, fetchUniversities } = useUniversities();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFields, setSearchFields] = useState({
    marks: "",
    maxFee: "",
    city: "",
    discipline: ""
  });
  const [filters, setFilters] = useState({
    city: "",
    discipline: "",
    province: "",
    minMerit: 0,
    maxMerit: 100,
    minFee: 0,
    maxFee: 1000000,
    sortBy: "name",
  });

  // UI State
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('campusfinder_favorites');
      return new Set(saved ? JSON.parse(saved) : []);
    } catch {
      return new Set();
    }
  });
  const [compareIds, setCompareIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('campusfinder_compare');
      return new Set(saved ? JSON.parse(saved) : []);
    } catch {
      return new Set();
    }
  });
  const [showFavorites, setShowFavorites] = useState(false);
  const [showCompare, setShowCompare] = useState(() => {
    try {
      const saved = localStorage.getItem('campusfinder_compare');
      const ids = saved ? JSON.parse(saved) : [];
      return ids.length > 0;
    } catch {
      return false;
    }
  });
  const [selectedUniversity, setSelectedUniversity] =
    useState<University | null>(null);

  // Persist favorites to localStorage
  useEffect(() => {
    localStorage.setItem('campusfinder_favorites', JSON.stringify(Array.from(favoriteIds)));
  }, [favoriteIds]);

  // Persist compare to localStorage
  useEffect(() => {
    localStorage.setItem('campusfinder_compare', JSON.stringify(Array.from(compareIds)));
  }, [compareIds]);

  // Fetch initial universities (optional - user can also trigger manually)
  useEffect(() => {
    fetchUniversities({ sortBy: filters.sortBy });
  }, []);

  // Debounced real-time search — fires 400ms after user stops typing
  useEffect(() => {
    // We want this to run even if empty, so user gets all results back when clearing
    const timer = setTimeout(() => {
      fetchUniversities({
        search: searchQuery,
        sortBy: filters.sortBy
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);


  // Handlers
  const handleToggleFavorite = (id: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast({
          title: "Removed from favorites",
          description: "University removed from your favorites list",
        });
      } else {
        next.add(id);
        toast({
          title: "Added to favorites",
          description: "University added to your favorites list",
        });
      }
      return next;
    });
  };

  const handleToggleCompare = (id: string) => {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 3) {
        next.add(id);
        setShowCompare(true);
      } else {
        toast({
          title: "Maximum reached",
          description: "You can compare up to 3 universities at a time",
          variant: "destructive",
        });
        return prev;
      }
      return next;
    });
  };

  const handleSearchSubmit = () => {
    fetchUniversities({
      search: searchQuery,
      sortBy: filters.sortBy
    });
    universitiesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleEligibilityCheck = (eligibility: {
    marks: number;
    maxFee: number;
    city: string;
    discipline: string;
  }) => {
    fetchUniversities({
      marks: eligibility.marks > 0 ? eligibility.marks.toString() : undefined,
      maxFee: eligibility.maxFee > 0 ? eligibility.maxFee.toString() : undefined,
      city: eligibility.city === "all" ? undefined : eligibility.city,
      discipline: eligibility.discipline === "all" ? undefined : eligibility.discipline,
      sortBy: filters.sortBy
    });

    universitiesRef.current?.scrollIntoView({ behavior: "smooth" });

    toast({
      title: "Checking Eligibility",
      description: "Fetching matching universities from database...",
    });
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    // Trigger re-fetch on filter change
    fetchUniversities({
      search: searchQuery || undefined,
      marks: searchFields.marks || undefined,
      maxFee: newFilters.maxFee ? newFilters.maxFee.toString() : undefined,
      minFee: newFilters.minFee ? newFilters.minFee.toString() : undefined,
      city: newFilters.city === "all" ? undefined : newFilters.city,
      discipline: newFilters.discipline === "all" ? undefined : newFilters.discipline,
      province: newFilters.province === "all" ? undefined : newFilters.province,
      sortBy: newFilters.sortBy
    });
  };

  const handleSearchFieldsChange = (fields: {
    marks: string;
    maxFee: string;
    city: string;
    discipline: string;
  }) => {
    setSearchFields(fields);
  };

  // Get favorite and compare universities from the live set
  const favoriteUniversities = useMemo(
    () => liveUniversities.filter((u) => favoriteIds.has(u.id)),
    [liveUniversities, favoriteIds]
  );

  const compareUniversities = useMemo(
    () => liveUniversities.filter((u) => compareIds.has(u.id)),
    [liveUniversities, compareIds]
  );

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Hero Section ── */}
      <HeroSection
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        stats={stats}
        statsLoading={statsLoading}
        loading={loading}
      />

      {/* ── Eligibility Checker ── */}
      <EligibilityChecker
        onCheck={handleEligibilityCheck}
        searchFields={searchFields}
        onSearchFieldsChange={handleSearchFieldsChange}
        filterOptions={filterOptions}
        searching={loading}
      />

      {/* ── Universities Section ── */}
      <div id="universities" ref={universitiesRef} className="space-y-5">
        <UniversityFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          totalResults={liveUniversities.length}
          filterOptions={filterOptions}
        />

        {/* University Grid */}
        <div>
          {loading && liveUniversities.length === 0 ? (
            /* Skeleton grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border/60 bg-card overflow-hidden"
                  style={{ borderTop: '3px solid hsl(234 89% 54% / 0.25)', opacity: 1 - i * 0.08 }}
                >
                  <div className="h-44 skeleton" />
                  <div className="p-5 space-y-3">
                    <div className="flex gap-2">
                      <div className="h-5 w-16 rounded-full skeleton" />
                      <div className="h-5 w-12 rounded-full skeleton" />
                    </div>
                    <div className="h-5 w-full rounded-lg skeleton" />
                    <div className="h-5 w-3/4 rounded-lg skeleton" />
                    <div className="flex gap-2 mt-2">
                      <div className="h-4 w-20 rounded skeleton" />
                      <div className="h-4 w-16 rounded skeleton" />
                    </div>
                    <div className="pt-3 border-t border-border/40">
                      <div className="h-9 w-full rounded-xl skeleton" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : liveUniversities.length === 0 && searched ? (
            <div className="empty-state">
              <div className="empty-state-icon" style={{ background: 'hsl(234 89% 54% / 0.08)' }}>
                <Search className="h-8 w-8" style={{ color: 'hsl(234 89% 54%)' }} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">No Results Found</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We couldn't find any universities matching your criteria. Try broadening your search or adjusting filters.
                </p>
              </div>
            </div>
          ) : liveUniversities.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon" style={{ background: 'hsl(234 89% 54% / 0.08)' }}>
                <GraduationCap className="h-8 w-8" style={{ color: 'hsl(234 89% 54%)' }} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Start Your Search</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Use the search bar or eligibility checker above to find your perfect university.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveUniversities.map((university, index) => (
                <div
                  key={university.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${Math.min(index * 50, 400)}ms`, animationFillMode: 'both' }}
                >
                  <UniversityCard
                    university={university}
                    isFavorite={favoriteIds.has(university.id)}
                    isSelected={compareIds.has(university.id)}
                    onToggleFavorite={() => handleToggleFavorite(university.id)}
                    onToggleCompare={() => handleToggleCompare(university.id)}
                    onViewDetails={() => setSelectedUniversity(university)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Compare Panel */}
      {showCompare && compareUniversities.length > 0 && (
        <ComparePanel
          universities={compareUniversities}
          onRemove={(id) => handleToggleCompare(id)}
          onClose={() => setShowCompare(false)}
        />
      )}

      {/* Module Feedback Section */}
      <div className="container max-w-4xl mx-auto px-4 pb-20">
        <ModuleFeedback moduleName="education" />
      </div>

      {/* University Detail Modal */}
      <UniversityDetailModal
        university={selectedUniversity}
        isOpen={!!selectedUniversity}
        onClose={() => setSelectedUniversity(null)}
        isFavorite={
          selectedUniversity ? favoriteIds.has(selectedUniversity.id) : false
        }
        onToggleFavorite={() =>
          selectedUniversity && handleToggleFavorite(selectedUniversity.id)
        }
      />

      {/* Favorites Panel */}
      <FavoritesPanel
        isOpen={showFavorites}
        onClose={() => setShowFavorites(false)}
        favorites={favoriteUniversities}
        onRemove={handleToggleFavorite}
        onViewDetails={(uni) => {
          setShowFavorites(false);
          setSelectedUniversity(uni);
        }}
      />
    </div>
  );
};

export default Index;
