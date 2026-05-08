import { useState } from "react";
import { Calculator, ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cities, disciplines } from "@/data/universities";

interface EligibilityCheckerProps {
  onCheck: (filters: {
    marks: number;
    maxFee: number;
    city: string;
    discipline: string;
  }) => void;
}

export const EligibilityChecker = ({ onCheck }: EligibilityCheckerProps) => {
  const [marks, setMarks] = useState("");
  const [maxFee, setMaxFee] = useState("");
  const [city, setCity] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);

  const handleCheck = () => {
    onCheck({
      marks: parseFloat(marks) || 0,
      maxFee: parseFloat(maxFee) || Infinity,
      city,
      discipline,
    });
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
            className={`h-5 w-5 transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </CardHeader>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? "max-h-[500px]" : "max-h-0"
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
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
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
                value={maxFee}
                onChange={(e) => setMaxFee(e.target.value)}
                min="0"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium">
                Preferred City
              </Label>
              <Select value={city} onValueChange={setCity}>
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
              <Select value={discipline} onValueChange={setDiscipline}>
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
            variant="hero"
            size="lg"
            className="w-full mt-6"
            onClick={handleCheck}
          >
            <Sparkles className="h-4 w-4" />
            Find Matching Universities
          </Button>
        </CardContent>
      </div>
    </Card>
  );
};
