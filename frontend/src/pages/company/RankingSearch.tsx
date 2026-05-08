import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Search,
  Award,
  MapPin,
  TrendingUp,
  ArrowLeft,
  Trophy,
  Medal,
} from "lucide-react";
import { University } from "@/types/university";

const RankingSearch = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedUniversity, setSearchedUniversity] = useState<University | null>(null);
  const [searchResults, setSearchResults] = useState<University[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Load top 5 universities from optimized API endpoint
  useEffect(() => {
    const loadUniversitiesData = async () => {
      try {
        // Use optimized top universities endpoint
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/universities/top`);
        const result = await response.json();

        if (result.success) {
          setUniversities(result.data);
          console.log(`Loaded ${result.data.length} top universities from optimized endpoint`);
        } else {
          console.error("API Error:", result.error);
        }
      } catch (error) {
        console.error("Error loading universities from MongoDB:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUniversitiesData();
  }, []);

  // Top 5 universities by ranking (1, 2, 3, ...).
  // Ignore invalid/negative rankings, then sort by ranking asc, merit desc.
  const topRankUniversities = useMemo(() => {
    return universities
      .filter((u) => typeof u.ranking === "number" && u.ranking >= 1)
      .sort((a, b) => {
        if (a.ranking !== b.ranking) return a.ranking - b.ranking;
        return (b.merit || 0) - (a.merit || 0);
      })
      .slice(0, 5);
  }, [universities]);

  // Search for university in MongoDB Atlas
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      // Search directly from MongoDB Atlas via API - get all results
      const searchUrl = `${import.meta.env.VITE_API_URL}/api/universities/search?query=${encodeURIComponent(searchQuery)}&limit=20`;
      console.log('Searching MongoDB Atlas for:', searchQuery);

      const response = await fetch(searchUrl);
      const result = await response.json();

      console.log('MongoDB Atlas search result:', result);

      if (result.success && result.data.length > 0) {
        // Store all search results
        setSearchResults(result.data);
        setSearchedUniversity(result.data[0]); // Keep first for display
        console.log(`Found ${result.data.length} results:`, result.data.map(u => u.title));
      } else {
        setSearchResults([]);
        setSearchedUniversity(null);
        console.log('No university found in MongoDB Atlas');
      }
    } catch (error) {
      console.error("Error searching MongoDB Atlas:", error);
      setSearchResults([]);
      setSearchedUniversity(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return <Award className="h-5 w-5 text-secondary" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="h-12 w-12 mx-auto mb-4 text-secondary animate-pulse" />
          <p className="text-muted-foreground">Loading rankings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-hero">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              University<span>Finder</span>
            </span>
          </Link>

          <Link to="/">
            {/* <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button> */}
          </Link>
        </div>
      </header>

      <main className="container py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium mb-4">
            <Trophy className="h-4 w-4" />
            <span>University Rankings</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Search University <span className="text-gradient">Ranking</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Enter a university name to find its ranking in Pakistan
          </p>
        </div>

        {/* Search Box */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter university name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="h-14 pl-12 pr-4 text-base rounded-2xl border-2 border-border bg-card shadow-card focus:border-secondary focus:shadow-card-hover transition-all"
              />
            </div>
            <Button
              variant="default"
              size="lg"
              className="h-14 px-8 rounded-xl"
              onClick={handleSearch}
            >
              <Search className="h-5 w-5 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Search Result */}
        {hasSearched && (
          <div className="max-w-4xl mx-auto mb-12">
            {searchResults.length > 0 ? (
              <div>
                <Card className="border-2 border-secondary/30 mb-6">
                  <CardHeader className="gradient-hero text-primary-foreground rounded-t-xl">
                    <CardTitle className="flex items-center gap-3">
                      <Search className="h-5 w-5" />
                      <span>Search Results ({searchResults.length})</span>
                    </CardTitle>
                  </CardHeader>
                </Card>

                <div className="space-y-4">
                  {searchResults.map((uni, index) => (
                    <Card
                      key={uni.id}
                      className="overflow-hidden border hover:shadow-lg transition-shadow"
                    >
                      <CardContent className="p-0">
                        <div className="flex items-center gap-4 p-4">
                          {/* Rank */}
                          <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold text-xl">
                            #{uni.ranking}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground line-clamp-1 mb-1">
                              {uni.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge variant="secondary">
                                <MapPin className="h-3 w-3 mr-1" />
                                {uni.city}
                              </Badge>
                              <Badge variant="outline">{uni.discipline}</Badge>
                              <Badge variant="secondary">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Merit: {uni.merit}%
                              </Badge>
                            </div>
                            <p className="text-muted-foreground text-sm">
                              Fee: PKR {uni.fee.toLocaleString()}/year
                            </p>
                          </div>

                          {/* Trophy Icon */}
                          <div className="flex-shrink-0">
                            {getRankIcon(uni.ranking)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Card className="border-2 border-destructive/30">
                <CardContent className="p-8 text-center">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    University Not Found
                  </h3>
                  <p className="text-muted-foreground">
                    No university found matching "{searchQuery}"
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Top 5 Universities */}
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-accent">
              <Trophy className="h-5 w-5 text-accent-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Top 5 Universities
            </h2>
          </div>

          <div className="space-y-4">
            {topRankUniversities.map((uni, index) => (
              <Card
                key={uni.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 p-4">
                    {/* Rank */}
                    <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold text-xl">
                      #{uni.ranking}
                    </div>

                    {/* Image */}
                    <div className="hidden sm:block flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden">
                      <img
                        src={uni.url}
                        alt={uni.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            "https://images.unsplash.com/photo-1562774053-701939374585?w=200&auto=format&fit=crop";
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground line-clamp-1 mb-1">
                        {uni.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {uni.city}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {uni.discipline}
                        </Badge>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden md:flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Merit</p>
                        <p className="font-bold text-foreground">{uni.merit}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Fee</p>
                        <p className="font-bold text-foreground">
                          {(uni.fee / 1000).toFixed(0)}K
                        </p>
                      </div>
                    </div>

                    {/* Trophy Icon */}
                    <div className="flex-shrink-0">
                      {getRankIcon(uni.ranking)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RankingSearch;
