import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Building2, Stethoscope, ShieldCheck, Car } from "lucide-react";
import { PAKISTAN_PROVINCES, PAKISTAN_CITIES } from "@/data/pakistan-data";
import { CITY_TEHSILS, DEFAULT_TEHSILS } from "@/data/healthcare-data";

// ── Centralized Treatment Specialties ────────────────────────────────────────
export const TREATMENT_SPECIALTIES = [
  "Cardiology", "Neurology", "Orthopedics", "Oncology", "Pediatrics",
  "Gynecology & Obstetrics", "Dermatology", "Ophthalmology", "ENT (Ear, Nose & Throat)",
  "Urology", "Gastroenterology", "Pulmonology", "Nephrology", "Endocrinology",
  "Psychiatry & Mental Health", "Dental Care", "General Surgery", "Plastic Surgery",
  "Vascular Surgery", "Neurosurgery", "Orthopedic Surgery", "Spine Surgery",
  "ICU / Critical Care", "Emergency Medicine", "Anesthesiology", "Radiology & Imaging",
  "Pathology & Lab", "Physiotherapy & Rehabilitation", "Nutrition & Dietetics",
  "General Consultation", "Family Medicine", "Internal Medicine", "Geriatrics",
  "Neonatology", "Allergy & Immunology", "Rheumatology", "Hematology",
  "Infectious Diseases", "Palliative Care", "Sports Medicine", "Occupational Therapy",
  "Speech Therapy", "Diabetes Management", "Liver & Hepatology", "Transplant Surgery",
  "Burns & Plastic", "Pain Management", "Sexual Health", "Preventive Medicine",
];

const SUPPORT_REQUIREMENTS = [
  { key: "wheelchairSupport",    label: "Wheelchair",      icon: "♿" },
  { key: "emergencyWard",        label: "Emergency Ward",  icon: "🚨" },
  { key: "icuAccess",            label: "ICU Access",      icon: "🏥" },
  { key: "femaleStaff",          label: "Female Staff",    icon: "👩‍⚕️" },
  { key: "ambulanceAccess",      label: "Ambulance",       icon: "🚑" },
  { key: "pharmacyAvailability", label: "Pharmacy",        icon: "💊" },
];

// ── Shared class strings ──────────────────────────────────────────────────────
const triggerCls = "h-10 rounded-2xl border-slate-200 bg-slate-50/50 font-bold text-sm transition-all hover:bg-slate-100/50";
const inputCls   = "h-10 rounded-2xl border-slate-200 bg-slate-50/50 font-bold text-sm transition-all hover:bg-slate-100/50";
// z-[500] ensures the dropdown floats above the dialog modal overlay (z-50)
const contentCls = "z-[500] rounded-2xl border-slate-100 shadow-xl bg-white";
const itemCls    = "rounded-xl font-bold focus:bg-primary/5 focus:text-primary cursor-pointer";

// ── Sub-components ────────────────────────────────────────────────────────────
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

// ── Validation export ─────────────────────────────────────────────────────────
export const isHealthcareFormValid = (values: any): boolean => {
  if (!values) return false;
  return !!(values.province && values.city && values.hospitalCategory && values.treatmentType);
};

// ── Main Form Component ───────────────────────────────────────────────────────
interface HealthcareModuleFormProps {
  values: any;
  onChange: (updates: Record<string, any>) => void;
}

export const HealthcareModuleForm = ({ values, onChange }: HealthcareModuleFormProps) => {
  const v = values || {};

  const provinceCities: string[] = v.province ? (PAKISTAN_CITIES[v.province] || []) : [];
  const cityTehsils: string[]    = v.city     ? (CITY_TEHSILS[v.city]     || DEFAULT_TEHSILS) : [];
  const supportList: string[]    = Array.isArray(v.supportRequirements) ? v.supportRequirements : [];

  const handleProvinceChange = (province: string) => {
    onChange({
      province: province,
      city: "",
      tehsil: ""
    });
  };

  const handleCityChange = (city: string) => {
    onChange({
      city: city,
      tehsil: ""
    });
  };

  const toggleSupport = (key: string) => {
    const next = supportList.includes(key)
      ? supportList.filter((k) => k !== key)
      : [...supportList, key];
    onChange({ supportRequirements: next });
  };

  return (
    <div className="space-y-8">

      {/* ── SECTION 1: LOCATION ── */}
      <div>
        <SectionHeader color="bg-blue-500" label="Location & Accessibility" icon={<MapPin className="w-3.5 h-3.5" />} />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

          {/* Province */}
          <FieldRow label="Province" required>
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

          {/* City — linked to province */}
          <FieldRow label="City" required>
            <Select value={v.city || ""} onValueChange={handleCityChange} disabled={!v.province}>
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

          {/* Tehsil — linked to city */}
          <FieldRow label="Tehsil / Area">
            <Select value={v.tehsil || ""} onValueChange={(val) => onChange({ tehsil: val })} disabled={!v.city}>
              <SelectTrigger className={triggerCls}>
                <SelectValue placeholder={v.city ? "Select area" : "Select city first"} />
              </SelectTrigger>
              <SelectContent className={contentCls} position="popper" sideOffset={4}>
                {cityTehsils.map((t) => (
                  <SelectItem key={t} value={t} className={itemCls}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>

          {/* Travel Preference */}
          <FieldRow label="Travel Preference">
            <Select value={v.travelPreference || ""} onValueChange={(val) => onChange({ travelPreference: val })}>
              <SelectTrigger className={triggerCls}>
                <SelectValue placeholder="Select preference" />
              </SelectTrigger>
              <SelectContent className={contentCls} position="popper" sideOffset={4}>
                {["Same City Only", "Nearby Cities", "Anywhere in Province", "Nationwide"].map((opt) => (
                  <SelectItem key={opt} value={opt} className={itemCls}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>

          {/* Max Distance */}
          <FieldRow label="Max Distance">
            <Select value={v.maxDistance || ""} onValueChange={(val) => onChange({ maxDistance: val })}>
              <SelectTrigger className={triggerCls}>
                <SelectValue placeholder="Distance tolerance" />
              </SelectTrigger>
              <SelectContent className={contentCls} position="popper" sideOffset={4}>
                {["Under 5 KM", "Under 10 KM", "Under 20 KM", "Under 50 KM", "No Limit"].map((opt) => (
                  <SelectItem key={opt} value={opt} className={itemCls}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
        </div>
      </div>

      {/* ── SECTION 2: HOSPITAL & FINANCIAL ── */}
      <div>
        <SectionHeader color="bg-rose-500" label="Hospital & Financial Preferences" icon={<Building2 className="w-3.5 h-3.5" />} />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

          <FieldRow label="Preferred Hospital Type" required>
            <Select value={v.hospitalCategory || ""} onValueChange={(val) => onChange({ hospitalCategory: val })}>
              <SelectTrigger className={triggerCls}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className={contentCls} position="popper" sideOffset={4}>
                <SelectItem value="Government" className={itemCls}>Government / Public</SelectItem>
                <SelectItem value="Private"    className={itemCls}>Private</SelectItem>
                <SelectItem value="Both"       className={itemCls}>Both Public & Private</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>

          <FieldRow label="Urgency Level">
            <Select value={v.urgencyLevel || ""} onValueChange={(val) => onChange({ urgencyLevel: val })}>
              <SelectTrigger className={triggerCls}>
                <SelectValue placeholder="Select urgency" />
              </SelectTrigger>
              <SelectContent className={contentCls} position="popper" sideOffset={4}>
                {["Emergency", "Urgent", "Normal Consultation", "Routine Checkup"].map((opt) => (
                  <SelectItem key={opt} value={opt} className={itemCls}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>

          <FieldRow label="Max Treatment Budget (PKR)">
            <Input
              type="text"
              inputMode="numeric"
              value={v.maxBudget !== undefined && v.maxBudget !== null ? String(v.maxBudget) : ""}
              placeholder="e.g. 50000"
              className={inputCls}
              onChange={(e) => {
                const sanitized = String(e.target.value).replace(/[^0-9]/g, "");
                onChange({ maxBudget: sanitized === "" ? "" : Math.min(Number(sanitized), 100_000_000) });
              }}
              onKeyDown={(e) => { 
                // Allow backspace, delete, tab, escape, enter, and numbers
                if (["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
                if (!/[0-9]/.test(e.key)) e.preventDefault();
              }}
            />
          </FieldRow>

          <FieldRow label="Medical Insurance">
            <Select value={v.hasInsurance || ""} onValueChange={(val) => onChange({ hasInsurance: val })}>
              <SelectTrigger className={triggerCls}>
                <SelectValue placeholder="Do you have insurance?" />
              </SelectTrigger>
              <SelectContent className={contentCls} position="popper" sideOffset={4}>
                <SelectItem value="Yes" className={itemCls}>Yes, I have insurance</SelectItem>
                <SelectItem value="No"  className={itemCls}>No insurance</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>

          <FieldRow label="Financial Assistance Needed">
            <Select value={v.financialAssistance || ""} onValueChange={(val) => onChange({ financialAssistance: val })}>
              <SelectTrigger className={triggerCls}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className={contentCls} position="popper" sideOffset={4}>
                <SelectItem value="Yes" className={itemCls}>Yes, I need assistance</SelectItem>
                <SelectItem value="No"  className={itemCls}>No assistance needed</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
        </div>
      </div>

      {/* ── SECTION 3: MEDICAL NEEDS ── */}
      <div>
        <SectionHeader color="bg-violet-500" label="Medical Needs & Treatment" icon={<Stethoscope className="w-3.5 h-3.5" />} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <FieldRow label="Required Treatment Type" required>
            <Select value={v.treatmentType || ""} onValueChange={(val) => onChange({ treatmentType: val })}>
              <SelectTrigger className={triggerCls}>
                <SelectValue placeholder="Select specialty" />
              </SelectTrigger>
              <SelectContent className={contentCls} position="popper" sideOffset={4}>
                {TREATMENT_SPECIALTIES.map((t) => (
                  <SelectItem key={t} value={t} className={itemCls}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>

          <FieldRow label="Gender Preference">
            <Select value={v.genderPreference || ""} onValueChange={(val) => onChange({ genderPreference: val })}>
              <SelectTrigger className={triggerCls}>
                <SelectValue placeholder="No preference" />
              </SelectTrigger>
              <SelectContent className={contentCls} position="popper" sideOffset={4}>
                {["No Preference", "Female Staff", "Male Staff"].map((opt) => (
                  <SelectItem key={opt} value={opt} className={itemCls}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>

          <FieldRow label="Chronic Illness (optional)">
            <Input
              type="text"
              value={v.chronicIllness || ""}
              placeholder="e.g. Diabetes, Hypertension"
              className={inputCls}
              onChange={(e) => onChange({ chronicIllness: e.target.value })}
            />
          </FieldRow>
        </div>
      </div>

      {/* ── SECTION 4: SUPPORT REQUIREMENTS ── */}
      <div>
        <SectionHeader color="bg-amber-500" label="Support Requirements" icon={<ShieldCheck className="w-3.5 h-3.5" />} />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SUPPORT_REQUIREMENTS.map(({ key, label, icon }) => {
            const active = supportList.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleSupport(key)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border-2 text-left transition-all duration-200 ${
                  active
                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                    : "border-slate-100 bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="text-base leading-none">{icon}</span>
                <span className="text-xs font-black leading-tight">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 5: TRANSPORT ── */}
      <div>
        <SectionHeader color="bg-teal-500" label="Transport & Coverage" icon={<Car className="w-3.5 h-3.5" />} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldRow label="Transport Availability">
            <Select value={v.transport || ""} onValueChange={(val) => onChange({ transport: val })}>
              <SelectTrigger className={triggerCls}>
                <SelectValue placeholder="Select transport" />
              </SelectTrigger>
              <SelectContent className={contentCls} position="popper" sideOffset={4}>
                {["Personal Transport", "Public Transport", "Ride Services", "No Transport"].map((opt) => (
                  <SelectItem key={opt} value={opt} className={itemCls}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
        </div>
      </div>

    </div>
  );
};
