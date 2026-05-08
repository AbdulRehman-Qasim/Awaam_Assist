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

// ==================== DATA ====================
export interface University {
  id: string;
  title: string;
  city: string;
  province: string;
  degree: string;
  discipline: string;
  fee: number;
  merit: number;
  // ranking: number;
  status: number;
  contact: string;
  info: string;
  web: string;
  url: string;
  logo: string;
  admissions: string;
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

let universities: University[] = [];
let cities: string[] = [];
let disciplines: string[] = [];
let provinces: string[] = [];

// Load universities from MongoDB API
const loadUniversitiesData = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/universities`);
    const result = await response.json();

    if (result.success && result.data) {
      // Transform the data to match University interface
      universities = result.data.map((uni: any) => ({
        id: uni.id || `pk${uni.key}`,
        title: uni.title,
        city: uni.city,
        province: uni.province,
        degree: uni.degree,
        discipline: uni.discipline,
        fee: uni.fee,
        merit: uni.merit,
        status: uni.status,
        contact: uni.contact,
        info: uni.info,
        web: uni.web,
        url: uni.url,
        logo: uni.logo,
        admissions: uni.admissions,
        map: {
          address: uni.map?.address || uni['map.address'] || '',
          lat: uni.map?.lat || uni['map.lat'] || 0,
          long: uni.map?.long || uni['map.long'] || 0,
          location: uni.map?.location || uni['map.location'] || uni.city,
        },
        deadline: uni.deadline,
        admission: uni.admission,
      }));

      // Extract unique cities, disciplines, and provinces
      cities = [...new Set(universities.map((u) => u.city))];
      disciplines = [...new Set(universities.map((u) => u.discipline))];
      provinces = [...new Set(universities.map((u) => u.province))];

      console.log(`Loaded ${universities.length} universities from MongoDB API`);
    } else {
      console.error("API Error:", result.error || "No data received");
    }
  } catch (error) {
    console.error("Error loading universities from API:", error);
  }
};

// Load data immediately
loadUniversitiesData();

// ==================== HEADER COMPONENT ====================
interface HeaderProps {
  favoritesCount: number;
  onShowFavorites: () => void;
}

const Header = ({ favoritesCount, onShowFavorites }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* <div className="container flex h-16 items-center justify-between"> */}
      {/* <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-hero">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">
            Campus<span className="text-secondary">Finder</span>
          </span>
        </div> */}


      {/* <nav className="hidden md:flex items-center gap-8">
          <a
            href="#home"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </a>
          <a
            href="#universities"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Universities
          </a>
          <a
            href="#compare"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Compare
          </a>
          <a
            href="#about"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </a>
        </nav> */}

      {/* <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="relative"
            onClick={onShowFavorites}
          >
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Favorites</span>
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                {favoritesCount}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div> */}
      {/* </div> */}

      {/* Mobile Navigation */}
      {/* <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 border-t border-border/40",
          mobileMenuOpen ? "max-h-64" : "max-h-0"
        )}
      >
        <nav className="container py-4 flex flex-col gap-3">
          <a
            href="#home"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </a>
          <a
            href="#universities"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Universities
          </a>
          <a
            href="#compare"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Compare
          </a>
          <a
            href="#about"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </a>
        </nav>
      </div> */}
    </header>
  );
};

// ==================== HERO SECTION COMPONENT ====================
interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onScrollToUniversities: () => void;
}

const StatItem = ({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
}) => (
  <div className="text-center group">
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/10 text-secondary mb-3 group-hover:scale-110 transition-transform">
      <Icon className="h-5 w-5" />
    </div>
    <div className="text-2xl md:text-3xl font-bold text-foreground">{value}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </div>
);

const HeroSection = ({
  searchQuery,
  onSearchChange,
  onScrollToUniversities,
}: HeroSectionProps) => {
  return (
    <section
      id="home"
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 gradient-hero opacity-[0.03]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(var(--secondary)/0.15),transparent)]" />

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 rounded-2xl gradient-accent opacity-20 animate-float" />
      <div
        className="absolute bottom-32 right-20 w-16 h-16 rounded-full gradient-hero opacity-20 animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute top-40 right-32 w-12 h-12 rounded-xl bg-secondary/20 animate-float"
        style={{ animationDelay: "4s" }}
      />

      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium mb-6 animate-fade-in">
            <Award className="h-4 w-4" />
            <span>Pakistan's #1 University Search Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-slide-up">
            Find Your{" "}
            <span className="text-gradient">Perfect University</span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            Discover top universities across Pakistan based on your marks, budget,
            and preferences. Compare, shortlist, and make informed decisions.
          </p>

          {/* Search Bar */}
          <div
            className="max-w-2xl mx-auto mb-12 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search universities, programs, or cities..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-14 pl-12 pr-4 text-base rounded-2xl border-2 border-border bg-card shadow-card focus:border-secondary focus:shadow-card-hover transition-all"
              />
              <Button
                variant="default"
                size="lg"
                className="absolute right-2 rounded-xl"
                onClick={onScrollToUniversities}
              >
                Search
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            <StatItem icon={BookOpen} value="200+" label="Universities" />
            <StatItem icon={Users} value="50K+" label="Students Helped" />
            <StatItem icon={Award} value="100+" label="Programs" />
            <StatItem icon={Search} value="15+" label="Cities" />
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
}

const EligibilityChecker = ({ onCheck, searchFields, onSearchFieldsChange }: EligibilityCheckerProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showError, setShowError] = useState(false);

  const handleCheck = () => {
    // Check if all fields are filled
    if (!searchFields.marks || !searchFields.maxFee || !searchFields.city || !searchFields.discipline) {
      setShowError(true);
      // Hide error after 3 seconds
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setShowError(false);
    onCheck({
      marks: parseFloat(searchFields.marks) || 0,
      maxFee: parseFloat(searchFields.maxFee) || Infinity,
      city: searchFields.city,
      discipline: searchFields.discipline,
    });
  };

  const updateField = (field: keyof typeof searchFields, value: string) => {
    onSearchFieldsChange({ ...searchFields, [field]: value });
  };

  return (
    <Card variant="elevated" className="border-2 border-secondary/20 overflow-hidden">
      <CardHeader
        className="gradient-hero text-primary-foreground cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/20">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-primary-foreground flex items-center gap-2">
                Check Your Eligibility
                <Sparkles className="h-4 w-4" />
              </CardTitle>
              <p className="text-sm text-primary-foreground/80 mt-1">
                Enter your details to find matching universities
              </p>
            </div>
          </div>
          <ChevronDown
            className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""
              }`}
          />
        </div>
      </CardHeader>

      <div
        className={`overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-[500px]" : "max-h-0"
          }`}
      >
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marks" className="text-sm font-medium">
                Your Marks (%)
              </Label>
              <Input
                id="marks"
                type="number"
                placeholder="e.g., 85"
                value={searchFields.marks}
                onChange={(e) => updateField("marks", e.target.value)}
                min="0"
                max="100"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxFee" className="text-sm font-medium">
                Max Fee Budget (PKR)
              </Label>
              <Input
                id="maxFee"
                type="number"
                placeholder="e.g., 200000"
                value={searchFields.maxFee}
                onChange={(e) => updateField("maxFee", e.target.value)}
                min="0"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium">
                Preferred City
              </Label>
              <Select value={searchFields.city} onValueChange={(value) => updateField("city", value)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discipline" className="text-sm font-medium">
                Discipline
              </Label>
              <Select value={searchFields.discipline} onValueChange={(value) => updateField("discipline", value)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="All Disciplines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Disciplines</SelectItem>
                  {disciplines.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            variant="default"
            size="lg"
            className="w-full mt-6"
            onClick={handleCheck}
          >
            <Sparkles className="h-4 w-4" />
            Find Matching Universities
          </Button>

          {showError && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center animate-fade-in">
              All fields are required to search for universities
            </div>
          )}
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
}

const UniversityFilters = ({
  filters,
  onFiltersChange,
  totalResults,
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
          <h2 className="text-2xl font-bold text-foreground">
            Universities
          </h2>
          <Badge variant="secondary" className="text-sm">
            {totalResults} Results
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          {/* <Button
            variant="ghost"
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
          </Button> */}

          <Select
            value={filters.sortBy}
            onValueChange={(value) => updateFilter("sortBy", value)}
          >
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ranking">Apply Filters</SelectItem>
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
        className={`overflow-hidden transition-all duration-300 ${showFilters ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
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
                  <SelectItem value="all">All Cities</SelectItem>
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
                  <SelectItem value="all">All Disciplines</SelectItem>
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
                  <SelectItem value="all">All Provinces</SelectItem>
                  {provinces.map((prov) => (
                    <SelectItem key={prov} value={prov}>
                      {prov}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Sort By
              </label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => updateFilter("sortBy", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ranking">Top Ranked</SelectItem>
                  <SelectItem value="merit-low">Merit (Low to High)</SelectItem>
                  <SelectItem value="merit-high">Merit (High to Low)</SelectItem>
                  <SelectItem value="fee-low">Fee (Low to High)</SelectItem>
                  <SelectItem value="fee-high">Fee (High to Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                  onFiltersChange({
                    ...filters,
                    minMerit: min,
                    maxMerit: max,
                  });
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
                  onFiltersChange({
                    ...filters,
                    minFee: min,
                    maxFee: max,
                  });
                }}
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

const UniversityCard = ({
  university,
  isFavorite,
  isSelected,
  onToggleFavorite,
  onToggleCompare,
  onViewDetails,
}: UniversityCardProps) => {
  const getRankingBadge = (ranking: number) => {
    if (ranking <= 5) return { variant: "accent" as const, label: "Top 5" };
    if (ranking <= 10) return { variant: "success" as const, label: "Top 10" };
    if (ranking <= 25) return { variant: "info" as const, label: "Top 25" };
    return { variant: "muted" as const, label: `#${ranking}` };
  };

  const rankingBadge = getRankingBadge(university.ranking);

  return (
    <Card
      variant="interactive"
      className={cn(
        "group overflow-hidden h-full",
        isSelected && "ring-2 ring-secondary"
      )}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={university.url}
          alt={university.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src =
              "https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />

        {/* Top Actions */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {/* <Badge variant={rankingBadge.variant}>
            <Award className="h-3 w-3 mr-1" />
            {rankingBadge.label}
          </Badge> */}
          {university.admission === "Open" && (
            <Badge variant="secondary">Admissions Open</Badge>
          )}
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 bg-card/80 hover:bg-card",
              isFavorite && "text-destructive"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
          >
            <Heart
              className={cn("h-4 w-4", isFavorite && "fill-current")}
            />
          </Button>
        </div>

        {/* Bottom Info Overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-2 text-primary-foreground/90">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm font-medium truncate">
              {university.city}, {university.province}
            </span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <CardHeader className="pb-2">
        <h3 className="font-bold text-lg text-foreground line-clamp-2 min-h-[3.5rem] group-hover:text-secondary transition-colors">
          {university.title}
        </h3>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Degree & Discipline */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            <GraduationCap className="h-3 w-3 mr-1" />
            {university.degree}
          </Badge>
          <Badge variant="outline">{university.discipline}</Badge>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground mb-1">Merit</div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-secondary" />
              <span className="font-bold text-foreground">
                {university.merit}%
              </span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground mb-1">Fee/Year</div>
            <div className="font-bold text-foreground">
              {university.fee.toLocaleString()}
              <span className="text-xs font-normal text-muted-foreground ml-1">
                PKR
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare();
            }}
          >
            <Scale className="h-4 w-4" />
            {isSelected ? "Remove" : "Compare"}
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
          >
            View Details
          </Button>
        </div>
      </CardContent>
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
            src={university.url}
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
                    src={uni.url}
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
                        <Award className="h-3 w-3 mr-1" />#{uni.ranking}
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

// ==================== FOOTER COMPONENT ====================
const SocialLink = ({
  icon: Icon,
  href,
}: {
  icon: React.ElementType;
  href: string;
}) => (
  <a
    href={href}
    className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
  >
    <Icon className="h-4 w-4" />
  </a>
);

const FooterLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <li>
    <a
      href={href}
      className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
    >
      {children}
    </a>
  </li>
);

const Footer = () => {
  return (
    <footer id="about" className="bg-primary text-primary-foreground">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/20">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">
                Campus<span className="text-secondary">Finder</span>
              </span>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Pakistan's leading platform to discover, compare, and shortlist
              universities based on your academic profile and preferences.
            </p>
            <div className="flex items-center gap-3">
              <SocialLink icon={Facebook} href="#" />
              <SocialLink icon={Twitter} href="#" />
              <SocialLink icon={Instagram} href="#" />
              <SocialLink icon={Linkedin} href="#" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Quick Links</h4>
            <ul className="space-y-2">
              <FooterLink href="#home">Home</FooterLink>
              <FooterLink href="#universities">Universities</FooterLink>
              <FooterLink href="#compare">Compare</FooterLink>
              <FooterLink href="#">Programs</FooterLink>
              <FooterLink href="#">Rankings</FooterLink>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Resources</h4>
            <ul className="space-y-2">
              <FooterLink href="#">Admission Guide</FooterLink>
              <FooterLink href="#">Scholarship Info</FooterLink>
              <FooterLink href="#">Merit Calculator</FooterLink>
              <FooterLink href="#">Blog</FooterLink>
              <FooterLink href="#">FAQs</FooterLink>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-primary-foreground/80">
                <Mail className="h-4 w-4" />
                info@UniversityFinder.pk
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/80">
                <Phone className="h-4 w-4" />
                +92 (51) 123-4567
              </li>
              <li className="flex items-start gap-3 text-sm text-primary-foreground/80">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>Blue Area, Islamabad, Pakistan</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-primary-foreground/60">
              © 2024 UniversityFinder. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ==================== MAIN INDEX COMPONENT ====================
const Index = () => {
  const { toast } = useToast();
  const universitiesRef = useRef<HTMLDivElement>(null);

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
    sortBy: "ranking",
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

  // Check if all search fields are filled
  const allFieldsFilled = useMemo(() => {
    return searchFields.marks !== "" &&
      searchFields.maxFee !== "" &&
      searchFields.city !== "" &&
      searchFields.discipline !== "";
  }, [searchFields]);

  // Filter universities
  const filteredUniversities = useMemo(() => {
    // Only show universities if all fields are filled
    if (!allFieldsFilled) {
      return [];
    }

    let result = [...universities];

    // Apply filters based on search fields
    if (searchFields.marks) {
      const marks = parseFloat(searchFields.marks) || 0;
      result = result.filter((u) => u.merit <= marks);
    }
    if (searchFields.maxFee) {
      const maxFee = parseFloat(searchFields.maxFee) || Infinity;
      result = result.filter((u) => u.fee <= maxFee);
    }
    if (searchFields.city && searchFields.city !== "all") {
      result = result.filter((u) => u.city === searchFields.city);
    }
    if (searchFields.discipline && searchFields.discipline !== "all") {
      result = result.filter((u) => u.discipline === searchFields.discipline);
    }

    // Also apply additional filters if they exist
    if (filters.city && filters.city !== "all") {
      result = result.filter((u) => u.city === filters.city);
    }
    if (filters.discipline && filters.discipline !== "all") {
      result = result.filter((u) => u.discipline === filters.discipline);
    }
    if (filters.province && filters.province !== "all") {
      result = result.filter((u) => u.province === filters.province);
    }
    result = result.filter(
      (u) => u.merit >= filters.minMerit && u.merit <= filters.maxMerit
    );
    result = result.filter(
      (u) => u.fee >= filters.minFee && u.fee <= filters.maxFee
    );

    // Sort
    switch (filters.sortBy) {
      case "ranking":
        result.sort((a, b) => a.ranking - b.ranking);
        break;
      case "merit-low":
        result.sort((a, b) => a.merit - b.merit);
        break;
      case "merit-high":
        result.sort((a, b) => b.merit - a.merit);
        break;
      case "fee-low":
        result.sort((a, b) => a.fee - b.fee);
        break;
      case "fee-high":
        result.sort((a, b) => b.fee - a.fee);
        break;
      case "name":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return result;
  }, [allFieldsFilled, searchFields, filters]);

  // Get favorite and compare universities
  const favoriteUniversities = useMemo(
    () => universities.filter((u) => favoriteIds.has(u.id)),
    [favoriteIds]
  );

  const compareUniversities = useMemo(
    () => universities.filter((u) => compareIds.has(u.id)),
    [compareIds]
  );

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

  const handleEligibilityCheck = (eligibility: {
    marks: number;
    maxFee: number;
    city: string;
    discipline: string;
  }) => {
    setFilters((prev) => ({
      ...prev,
      minMerit: 0,
      maxMerit: eligibility.marks > 0 ? eligibility.marks : 100,
      minFee: 0,
      maxFee: eligibility.maxFee > 0 ? eligibility.maxFee : 1000000,
      city: eligibility.city === "all" ? "" : eligibility.city,
      discipline:
        eligibility.discipline === "all" ? "" : eligibility.discipline,
    }));

    // Scroll to universities
    universitiesRef.current?.scrollIntoView({ behavior: "smooth" });

    toast({
      title: "Filters applied",
      description: "Showing universities matching your eligibility",
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

  const scrollToUniversities = () => {
    universitiesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        favoritesCount={favoriteIds.size}
        onShowFavorites={() => setShowFavorites(true)}
      />

      <main>
        {/* Hero Section */}
        <HeroSection
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onScrollToUniversities={scrollToUniversities}
        />

        {/* Eligibility Checker */}
        <section className="container py-8">
          <EligibilityChecker
            onCheck={handleEligibilityCheck}
            searchFields={searchFields}
            onSearchFieldsChange={handleSearchFieldsChange}
          />
        </section>

        {/* Universities Section */}
        <section
          id="universities"
          ref={universitiesRef}
          className="container py-12"
        >
          <UniversityFilters
            filters={filters}
            onFiltersChange={setFilters}
            totalResults={filteredUniversities.length}
          />

          {/* University Grid */}
          <div className="mt-8">
            {!allFieldsFilled ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-4">
                  <Search className="h-8 w-8 text-secondary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Search University</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Enter your marks, fee budget, preferred city, and discipline to find matching universities
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUniversities.map((university, index) => (
                  <div
                    key={university.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
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

          {allFieldsFilled && filteredUniversities.length === 0 && (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">
                No universities found matching your criteria
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </section>
      </main>

      {/* <Footer /> */}

      {/* Compare Panel */}
      {showCompare && compareUniversities.length > 0 && (
        <ComparePanel
          universities={compareUniversities}
          onRemove={(id) => handleToggleCompare(id)}
          onClose={() => setShowCompare(false)}
        />
      )}

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