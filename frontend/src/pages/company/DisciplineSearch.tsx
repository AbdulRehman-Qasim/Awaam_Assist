import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap,
  BookOpen,
  Award,
  MapPin,
  TrendingUp,
  ArrowLeft,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { University } from "@/types/university";

const DisciplineSearch = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDiscipline, setSelectedDiscipline] = useState("");

  // Load disciplines from optimized API endpoint
  useEffect(() => {
    const loadDisciplinesData = async () => {
      try {
        // Load disciplines separately for faster initial load
        const disciplinesResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/disciplines`);
        const disciplinesResult = await disciplinesResponse.json();

        if (disciplinesResult.success) {
          setDisciplines(disciplinesResult.data);
          console.log(`Loaded ${disciplinesResult.data.length} disciplines from optimized endpoint`);
        } else {
          console.error("Disciplines API Error:", disciplinesResult.error);
        }

        // Load universities only when discipline is selected
        if (selectedDiscipline) {
          const universitiesResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/universities/discipline/${selectedDiscipline}`);
          const universitiesResult = await universitiesResponse.json();

          if (universitiesResult.success) {
            setUniversities(universitiesResult.data);
            console.log(`Loaded ${universitiesResult.data.length} universities for discipline: ${selectedDiscipline}`);
          } else {
            console.error("Universities API Error:", universitiesResult.error);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDisciplinesData();
  }, [selectedDiscipline]);

  // Filter universities by discipline from MongoDB Atlas data
  const filteredUniversities = useMemo(() => {
    if (!selectedDiscipline) return [];
    return universities
      .filter((u) => u.discipline === selectedDiscipline)
      .sort((a, b) => (a.ranking || 999) - (b.ranking || 999));
  }, [universities, selectedDiscipline]);

  const getRankingBadge = (ranking: number) => {
    if (ranking <= 5) return { variant: "secondary" as const, label: "Top 5" };
    if (ranking <= 10) return { variant: "secondary" as const, label: "Top 10" };
    if (ranking <= 25) return { variant: "outline" as const, label: "Top 25" };
    return { variant: "muted" as const, label: `#${ranking}` };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="h-12 w-12 mx-auto mb-4 text-secondary animate-pulse" />
          <p className="text-muted-foreground">Loading disciplines...</p>
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
            <span className="text-xl font-bold text-foreground ">
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
            <BookOpen className="h-4 w-4" />
            <span>Browse by Discipline</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Find Universities by <span className="text-gradient">Discipline</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Select your field of interest to discover all universities offering programs in that discipline
          </p>
        </div>

        {/* Discipline Selector */}
        <div className="max-w-md mx-auto mb-12">
          <Select value={selectedDiscipline} onValueChange={setSelectedDiscipline}>
            <SelectTrigger className="h-14 text-base rounded-2xl border-2 border-border bg-card shadow-card focus:border-secondary focus:shadow-card-hover transition-all">
              <SelectValue placeholder="Select a Discipline" />
            </SelectTrigger>
            <SelectContent>
              {disciplines.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        {selectedDiscipline && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {selectedDiscipline} Universities
              </h2>
              <Badge variant="secondary" className="text-sm">
                {filteredUniversities.length} Found
              </Badge>
            </div>

            {filteredUniversities.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUniversities.map((university, index) => {
                  const rankingBadge = getRankingBadge(university.ranking);
                  return (
                    <Card
                      key={university.id}
                      className="group overflow-hidden h-full animate-fade-in border hover:shadow-lg transition-shadow"
                      style={{ animationDelay: `${index * 0.05}s` }}
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          {/* <Badge variant={rankingBadge.variant}>{rankingBadge.label}</Badge> */}
                          {university.admission === "Open" && (
                            <Badge variant="secondary">Admissions Open</Badge>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <CardContent className="p-5">
                        <h3 className="font-semibold text-foreground line-clamp-2 mb-3 min-h-[3rem]">
                          {university.title}
                        </h3>

                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                          <MapPin className="h-4 w-4" />
                          <span>{university.city}</span>
                          <span className="text-border">•</span>
                          <span>{university.province}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-muted/50 text-center">
                            <p className="text-xs text-muted-foreground">Merit</p>
                            <p className="font-semibold text-foreground">{university.merit}%</p>
                          </div>
                          <div className="p-2 rounded-lg bg-muted/50 text-center">
                            <p className="text-xs text-muted-foreground">Fee/Year</p>
                            <p className="font-semibold text-foreground">
                              {(university.fee / 1000).toFixed(0)}K
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{university.discipline}</Badge>
                          <Badge variant="outline">{university.degree}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Universities Found
                </h3>
                <p className="text-muted-foreground">
                  No universities found for {selectedDiscipline}
                </p>
              </Card>
            )}
          </div>
        )}

        {!selectedDiscipline && (
          <Card className="p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Select a Discipline
            </h3>
            <p className="text-muted-foreground">
              Choose a discipline from the dropdown above to see universities
            </p>
          </Card>
        )}
      </main>
    </div>
  );
};

export default DisciplineSearch;
