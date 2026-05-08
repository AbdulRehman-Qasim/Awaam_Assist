import {
  MapPin,
  GraduationCap,
  Award,
  Heart,
  ExternalLink,
  Phone,
  Scale,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { University } from "@/data/universities";
import { cn } from "@/lib/utils";

interface UniversityCardProps {
  university: University;
  isFavorite: boolean;
  isSelected: boolean;
  onToggleFavorite: () => void;
  onToggleCompare: () => void;
  onViewDetails: () => void;
}

export const UniversityCard = ({
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
          <Badge variant={rankingBadge.variant}>
            <Award className="h-3 w-3 mr-1" />
            {rankingBadge.label}
          </Badge>
          {university.admission === "Open" && (
            <Badge variant="success">Admissions Open</Badge>
          )}
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-2">
          <Button
            variant="glass"
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
            <div className="text-xs text-muted-foreground mb-1">
              {university.semesterFee ? "Fee/Semester" : "Fee/Year"}
            </div>
            <div className="font-bold text-foreground">
              {(university.semesterFee || university.fee || 0).toLocaleString()}
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
