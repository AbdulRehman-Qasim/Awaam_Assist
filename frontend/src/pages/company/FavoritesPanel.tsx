import { useState, useEffect } from "react";
import {
  Heart,
  Trash2,
  ExternalLink,
  Award,
  MapPin,
  X,
  Phone,
  Mail,
  Globe,
  TrendingUp,
  GraduationCap,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface University {
  id: string;
  title: string;
  city: string;
  province: string;
  degree: string;
  discipline: string;
  fee: number;
  merit: number;
  ranking: number;
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

let allUniversities: University[] = [];

// Load universities from JSON
const loadUniversitiesData = async () => {
  try {
    const response = await fetch('/campusfinder_cleaned.json');
    const data = await response.json();
    
    // Transform the data to match University interface
    allUniversities = data.map((uni: any) => ({
      id: `pk${uni.key}`,
      title: uni.title,
      city: uni.city,
      province: uni.province,
      degree: uni.degree,
      discipline: uni.discipline,
      fee: uni.fee,
      merit: uni.merit,
      ranking: uni.ranking,
      status: uni.status,
      contact: uni.contact,
      info: uni.info,
      web: uni.web,
      url: uni.url,
      logo: uni.logo,
      admissions: uni.admissions,
      map: {
        address: uni['map.address'] || '',
        lat: uni['map.lat'] || 0,
        long: uni['map.long'] || 0,
        location: uni['map.location'] || uni.city,
      },
      deadline: uni.deadline,
      admission: uni.admission,
    }));
  } catch (error) {
    console.error("Error loading universities:", error);
  }
};

// Load data immediately
loadUniversitiesData();

export default function FavoritesPage() {
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<University[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('campusfinder_favorites');
      const favoriteIds = saved ? JSON.parse(saved) : [];
      const favoriteUniversities = allUniversities.filter((uni) =>
        favoriteIds.includes(uni.id)
      );
      setFavorites(favoriteUniversities);
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  }, []);

  const handleRemove = (id: string) => {
    try {
      const saved = localStorage.getItem('campusfinder_favorites');
      const favoriteIds = saved ? JSON.parse(saved) : [];
      const updated = favoriteIds.filter((fid: string) => fid !== id);
      localStorage.setItem('campusfinder_favorites', JSON.stringify(updated));
      setFavorites(favorites.filter((uni) => uni.id !== id));
      toast({
        title: "Removed from favorites",
        description: "University removed from your favorites list",
      });
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const handleViewDetails = (uni: University) => {
    setSelectedUniversity(uni);
  };

  const handleToggleFavorite = (id: string) => {
    try {
      const saved = localStorage.getItem('campusfinder_favorites');
      const favoriteIds = saved ? JSON.parse(saved) : [];
      const updated = favoriteIds.filter((fid: string) => fid !== id);
      localStorage.setItem('campusfinder_favorites', JSON.stringify(updated));
      setFavorites(favorites.filter((uni) => uni.id !== id));
      if (selectedUniversity?.id === id) {
        setSelectedUniversity(null);
      }
      toast({
        title: "Removed from favorites",
        description: "University removed from your favorites list",
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 max-w-3xl mx-auto">
      <header className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
          <Heart className="h-6 w-6 text-destructive fill-destructive" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Your Favorites</h1>
          <p className="text-sm text-muted-foreground">{favorites.length} universities saved</p>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-150px)]">
        <div className="space-y-4">
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No favorites yet</h3>
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
                      onClick={() => handleViewDetails(uni)}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Details
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                      onClick={() => handleRemove(uni.id)}
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

      {/* University Detail Modal */}
      {selectedUniversity && (
        <UniversityDetailModal
          university={selectedUniversity}
          isOpen={!!selectedUniversity}
          onClose={() => setSelectedUniversity(null)}
          isFavorite={true}
          onToggleFavorite={() => handleToggleFavorite(selectedUniversity.id)}
        />
      )}
    </div>
  );
}

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
  <div className="p-4 rounded-lg bg-muted/50 border border-border text-center">
    <Icon className="h-5 w-5 mx-auto mb-2 text-secondary" />
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className="font-semibold text-foreground">{value}</p>
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
            className="absolute top-4 right-4 bg-black/20 hover:bg-black/40"
            onClick={onClose}
          >
            <X className="h-4 w-4 text-white" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-16 bg-black/20 hover:bg-black/40"
            onClick={onToggleFavorite}
          >
            <Heart className={cn("h-4 w-4 text-white", isFavorite && "fill-current text-destructive")} />
          </Button>

          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="secondary">
                <Award className="h-3 w-3 mr-1" />
                Rank #{university.ranking}
              </Badge>
              <Badge variant="outline">
                Admissions {university.admission || "nan"}
              </Badge>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              {university.title}
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <div>
                <span className="text-sm text-muted-foreground">Deadline</span>
                <p className="font-medium text-foreground">
                  {university.deadline || "TBA"}
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
              size="lg"
              className="flex-1"
              onClick={() => window.open(university.web, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
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
              <Heart className={cn("h-4 w-4 mr-2", isFavorite && "fill-current")} />
              {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
