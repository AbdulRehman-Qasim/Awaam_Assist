import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap, Briefcase, MapPin, Building2, TrendingUp } from "lucide-react";
import { PAKISTAN_PROVINCES, PAKISTAN_CITIES } from "@/data/pakistan-data";

export const DEGREE_LEVELS = ["Matric / O-Levels", "Intermediate / A-Levels", "Bachelor", "Master", "PhD"];
export const ENTRANCE_TEST_STATUS = ["Not Taken", "Taken", "Planning to Take"];
export const UNIVERSITY_TYPES = ["Public", "Private", "Both"];
export const BUDGET_RANGES = ["Under 50k", "50k-100k", "100k-200k", "Above 200k"];
export const RELOCATION_PREFS = ["Yes", "No", "Open to nearby cities"];

// Typical programs
export const PREFERRED_PROGRAMS = [
  "Computer Science", "Software Engineering", "Artificial Intelligence", "Data Science", 
  "Information Technology", "Cybersecurity", "Medicine (MBBS)", "Dentistry (BDS)", 
  "Pharmacy", "Nursing", "Civil Engineering", "Mechanical Engineering", "Electrical Engineering", 
  "Mechatronics", "Business Administration (BBA)", "Accounting & Finance", "Economics", 
  "Psychology", "English Literature", "Law (LLB)"
].sort();

export const SPECIALIZATIONS = [
  "Artificial Intelligence", "Cybersecurity", "Data Science", "Web Development", 
  "App Development", "Robotics", "IoT", "Cardiology", "Neurology", "Surgery", 
  "Marketing", "Finance", "Human Resources", "Supply Chain", "Structural Engineering"
].sort();

export const CAREER_GOALS = [
  "Software Engineer", "Data Scientist", "Doctor", "Civil Engineer", "Financial Analyst", 
  "Manager", "Entrepreneur", "Researcher", "Teacher", "Lawyer", "Accountant"
].sort();

const triggerCls = "h-10 rounded-2xl border-slate-200 bg-slate-50/50 font-bold text-sm transition-all hover:bg-slate-100/50";
const inputCls   = "h-10 rounded-2xl border-slate-200 bg-slate-50/50 font-bold text-sm transition-all hover:bg-slate-100/50";
const contentCls = "z-[500] rounded-2xl border-slate-100 shadow-xl bg-white";
const itemCls    = "rounded-xl font-bold focus:bg-primary/5 focus:text-primary cursor-pointer";

const SectionHeader = ({ color, label, icon }: { color: string; label: string; icon: React.ReactNode }) => (
  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 mb-4">
    <div className={`w-1.5 h-4 ${color} rounded-full flex-shrink-0`} />
    <span className="text-slate-400 flex-shrink-0">{icon}</span>
    <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">{label}</h4>
  </div>
);

const FieldRow = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1 ml-0.5">
      {label}
      {required && <span className="text-rose-500">*</span>}
    </Label>
    {children}
  </div>
);

export const isEducationFormValid = (values: any): boolean => {
  if (!values) return false;
  
  const m = Number(values.marks);
  const em = values.expectedMerit !== undefined ? Number(values.expectedMerit) : -1;
  const validMarks = m > 0 && m <= 100;
  const validExpected = em === -1 || (em > 0 && em <= 100);

  return !!(
    values.degree && 
    validMarks && 
    validExpected &&
    values.preferredProgram &&
    values.province && 
    values.city
  );
};

interface EducationModuleFormProps {
  values: any;
  onChange: (updates: Record<string, any>) => void;
}

export const EducationModuleForm = ({ values, onChange }: EducationModuleFormProps) => {
  const v = values || {};

  const provinceCities: string[] = v.province ? (PAKISTAN_CITIES[v.province] || []) : [];

  const handleProvinceChange = (province: string) => {
    onChange({
      province: province,
      city: ""
    });
  };

  const handleMarksChange = (field: string, val: string) => {
    const sanitized = val.replace(/[^0-9.]/g, "");
    if (sanitized === "") {
      onChange({ [field]: "" });
      return;
    }
    const num = parseFloat(sanitized);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      onChange({ [field]: num });
    }
  };

  return (
    <div className="space-y-8">
      {/* ── SECTION 1: CORE ACADEMIC DETAILS ── */}
      <div>
        <SectionHeader color="bg-blue-500" label="Core Academic Details" icon={<GraduationCap className="w-3.5 h-3.5" />} />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <FieldRow label="Current Level" required>
            <Select value={v.degree || ""} onValueChange={(val) => onChange({ degree: val })}>
              <SelectTrigger className={triggerCls}>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent className={contentCls} position="popper" sideOffset={4}>
                {DEGREE_LEVELS.map((p) => (
                  <SelectItem key={p} value={p} className={itemCls}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>

          <FieldRow label="Recent Marks (%)" required>
            <Input
              type="text"
              inputMode="decimal"
              value={v.marks !== undefined && v.marks !== null ? String(v.marks) : ""}
              placeholder="e.g. 85.5"
              className={inputCls}
              onChange={(e) => handleMarksChange("marks", e.target.value)}
            />
          </FieldRow>

          <FieldRow label="Expected Merit (%)">
            <Input
              type="text"
              inputMode="decimal"
              value={v.expectedMerit !== undefined && v.expectedMerit !== null ? String(v.expectedMerit) : ""}
              placeholder="e.g. 82.0"
              className={inputCls}
              onChange={(e) => handleMarksChange("expectedMerit", e.target.value)}
            />
          </FieldRow>

          <FieldRow label="Entrance Test Status">
            <Select value={v.entranceTest || ""} onValueChange={(val) => onChange({ entranceTest: val })}>
              <SelectTrigger className={triggerCls}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className={contentCls} position="popper" sideOffset={4}>
                {ENTRANCE_TEST_STATUS.map((p) => (
                  <SelectItem key={p} value={p} className={itemCls}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
        </div>
      </div>

      {/* ── SECTION 2: PROGRAM & CAREER GOALS ── */}
      <div>
        <SectionHeader color="bg-violet-500" label="Program & Career Goals" icon={<Briefcase className="w-3.5 h-3.5" />} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FieldRow label="Preferred Program" required>
            <Select value={v.preferredProgram || ""} onValueChange={(val) => onChange({ preferredProgram: val })}>
              <SelectTrigger className={triggerCls}>
                <SelectValue placeholder="Select program" />
              </SelectTrigger>
              <SelectContent className={contentCls} position="popper" sideOffset={4}>
                {PREFERRED_PROGRAMS.map((p) => (
                  <SelectItem key={p} value={p} className={itemCls}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>

          <FieldRow label="Preferred Specialization">
            <Select value={v.preferredSpecialization || ""} onValueChange={(val) => onChange({ preferredSpecialization: val })}>
              <SelectTrigger className={triggerCls}>
                <SelectValue placeholder="Select specialization" />
              </SelectTrigger>
              <SelectContent className={contentCls} position="popper" sideOffset={4}>
                {SPECIALIZATIONS.map((p) => (
                  <SelectItem key={p} value={p} className={itemCls}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>

          <FieldRow label="Career Goal">
            <Select value={v.careerGoal || ""} onValueChange={(val) => onChange({ careerGoal: val })}>
              <SelectTrigger className={triggerCls}>
                <SelectValue placeholder="Select career goal" />
              </SelectTrigger>
              <SelectContent className={contentCls} position="popper" sideOffset={4}>
                {CAREER_GOALS.map((p) => (
                  <SelectItem key={p} value={p} className={itemCls}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
        </div>
      </div>

      {/* ── SECTION 3: LOCATION & PREFERENCES ── */}
      <div>
        <SectionHeader color="bg-emerald-500" label="Location & Preferences" icon={<MapPin className="w-3.5 h-3.5" />} />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <FieldRow label="Preferred Province" required>
            <Select value={v.province || ""} onValueChange={handleProvinceChange}>
              <SelectTrigger className={triggerCls}>
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent className={contentCls} position="popper" sideOffset={4}>
                {PAKISTAN_PROVINCES.map((p) => (
                  <SelectItem key={p} value={p} className={itemCls}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>

          <FieldRow label="Preferred Study City" required>
            <Select value={v.city || ""} onValueChange={(val) => onChange({ city: val })} disabled={!v.province}>
              <SelectTrigger className={triggerCls}>
                <SelectValue placeholder={v.province ? "Select city" : "Select province first"} />
              </SelectTrigger>
              <SelectContent className={contentCls} position="popper" sideOffset={4}>
                {provinceCities.map((c) => (
                  <SelectItem key={c} value={c} className={itemCls}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>

          <FieldRow label="University Type">
            <Select value={v.universityType || ""} onValueChange={(val) => onChange({ universityType: val })}>
              <SelectTrigger className={triggerCls}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className={contentCls} position="popper" sideOffset={4}>
                {UNIVERSITY_TYPES.map((p) => (
                  <SelectItem key={p} value={p} className={itemCls}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>

          <FieldRow label="Budget Range">
            <Select value={v.feeRange || ""} onValueChange={(val) => onChange({ feeRange: val })}>
              <SelectTrigger className={triggerCls}>
                <SelectValue placeholder="Select budget" />
              </SelectTrigger>
              <SelectContent className={contentCls} position="popper" sideOffset={4}>
                {BUDGET_RANGES.map((p) => (
                  <SelectItem key={p} value={p} className={itemCls}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
        </div>
      </div>

      {/* ── SECTION 4: ADMISSION FLEXIBILITY ── */}
      <div>
        <SectionHeader color="bg-rose-500" label="Admission Flexibility" icon={<TrendingUp className="w-3.5 h-3.5" />} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldRow label="Relocation Preference">
            <Select value={v.relocation || ""} onValueChange={(val) => onChange({ relocation: val })}>
              <SelectTrigger className={triggerCls}>
                <SelectValue placeholder="Select preference" />
              </SelectTrigger>
              <SelectContent className={contentCls} position="popper" sideOffset={4}>
                {RELOCATION_PREFS.map((p) => (
                  <SelectItem key={p} value={p} className={itemCls}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
        </div>
      </div>
    </div>
  );
};
