import {
  X,
  MapPin,
  Phone,
  Mail,
  Globe,
  Award,
  TrendingUp,
  Calendar,
  GraduationCap,
  ExternalLink,
  Heart,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { University } from "@/types/university";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

interface UniversityDetailModalProps {
  university: University | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export const UniversityDetailModal = ({
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
            variant="glass"
            size="icon"
            className="absolute top-4 right-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          <Button
            variant="glass"
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
              <Badge variant="accent">
                <Award className="h-3 w-3 mr-1" />
                Rank #{university.ranking}
              </Badge>
              <Badge
                variant={university.admission === "Open" ? "success" : "muted"}
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
            <StatCard
              icon={TrendingUp}
              label="Merit Required"
              value={`${university.merit}%`}
            />
            <StatCard
              icon={GraduationCap}
              label={university.semesterFee ? "Semester Fee" : "Annual Fee"}
              value={`PKR ${(university.semesterFee || university.fee || 0).toLocaleString()}`}
            />
            <StatCard
              icon={MapPin}
              label="Location"
              value={university.city}
            />
            <StatCard
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
              variant="hero"
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

const StatCard = ({
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
