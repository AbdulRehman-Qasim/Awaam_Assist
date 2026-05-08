import { X, Scale, TrendingUp, MapPin, Award, Phone, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { University } from "@/data/universities";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ComparePanelProps {
  universities: University[];
  onRemove: (id: string) => void;
  onClose: () => void;
}

export const ComparePanel = ({
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
