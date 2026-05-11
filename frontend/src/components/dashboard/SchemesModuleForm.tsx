import React, { useMemo } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PAKISTAN_PROVINCES, PAKISTAN_CITIES } from "@/data/pakistan-data";

interface SchemesModuleFormProps {
  values: any;
  onChange: (updates: any) => void;
}

export const isSchemesFormValid = (values: any): boolean => {
  if (!values) return false;
  return !!(
    values.province && 
    values.city && 
    values.age !== undefined && 
    values.income !== undefined &&
    values.familySize !== undefined &&
    values.employmentStatus &&
    values.gender &&
    values.maritalStatus
  );
};

export const SchemesModuleForm: React.FC<SchemesModuleFormProps> = ({ values, onChange }) => {
  
  const handleUpdate = (field: string, value: any) => {
    onChange({ [field]: value });
  };

  const handleProvinceChange = (val: string) => {
    onChange({ province: val, city: "" }); // Reset city
  };

  const availableCities = useMemo(() => {
    if (!values.province) return [];
    return PAKISTAN_CITIES[values.province] || [];
  }, [values.province]);

  const toggleAssistanceType = (type: string) => {
    const current = Array.isArray(values.financialNeedType) ? values.financialNeedType : [];
    if (current.includes(type)) {
      handleUpdate("financialNeedType", current.filter(t => t !== type));
    } else {
      handleUpdate("financialNeedType", [...current, type]);
    }
  };

  const inputClass = "h-11 rounded-xl border-slate-200 bg-slate-50/50 font-bold focus-visible:ring-emerald-500 transition-all duration-200 hover:bg-slate-100/50";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* 1. Personal Details */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Personal Details</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
              Age <span className="text-rose-500">*</span>
            </Label>
            <Input 
              type="number"
              className={inputClass}
              placeholder="e.g. 25"
              value={values.age || ""}
              onChange={(e) => {
                const val = parseInt(e.target.value.replace(/[^0-9]/g, ''));
                handleUpdate("age", isNaN(val) ? "" : Math.min(val, 120));
              }}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
              Gender <span className="text-rose-500">*</span>
            </Label>
            <Select value={values.gender || ""} onValueChange={(v) => handleUpdate("gender", v)}>
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                {["Male", "Female", "Other"].map(opt => (
                  <SelectItem key={opt} value={opt} className="font-bold">{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
              Marital Status <span className="text-rose-500">*</span>
            </Label>
            <Select value={values.maritalStatus || ""} onValueChange={(v) => handleUpdate("maritalStatus", v)}>
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {["Single", "Married", "Widowed", "Divorced"].map(opt => (
                  <SelectItem key={opt} value={opt} className="font-bold">{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
              Province <span className="text-rose-500">*</span>
            </Label>
            <Select value={values.province || ""} onValueChange={handleProvinceChange}>
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select Province" />
              </SelectTrigger>
              <SelectContent>
                {PAKISTAN_PROVINCES.map(opt => (
                  <SelectItem key={opt} value={opt} className="font-bold">{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
              City <span className="text-rose-500">*</span>
            </Label>
            <Select value={values.city || ""} onValueChange={(v) => handleUpdate("city", v)} disabled={!values.province}>
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder={values.province ? "Select City" : "Select Province First"} />
              </SelectTrigger>
              <SelectContent>
                {availableCities.map(opt => (
                  <SelectItem key={opt} value={opt} className="font-bold">{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
              Family Size <span className="text-rose-500">*</span>
            </Label>
            <Input 
              type="number"
              className={inputClass}
              placeholder="e.g. 5"
              value={values.familySize || ""}
              onChange={(e) => {
                const val = parseInt(e.target.value.replace(/[^0-9]/g, ''));
                handleUpdate("familySize", isNaN(val) ? "" : Math.min(val, 50));
              }}
            />
          </div>
        </div>
      </div>

      {/* 2. Financial Details */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Financial Details</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
              Monthly Family Income (PKR) <span className="text-rose-500">*</span>
            </Label>
            <Input 
              type="number"
              className={inputClass}
              placeholder="e.g. 45000"
              value={values.income || ""}
              onChange={(e) => {
                const val = parseInt(e.target.value.replace(/[^0-9]/g, ''));
                handleUpdate("income", isNaN(val) ? "" : val);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
              Employment Status <span className="text-rose-500">*</span>
            </Label>
            <Select value={values.employmentStatus || ""} onValueChange={(v) => handleUpdate("employmentStatus", v)}>
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {["Student", "Unemployed", "Employed (Private)", "Employed (Govt)", "Self-Employed", "Daily Wager"].map(opt => (
                  <SelectItem key={opt} value={opt} className="font-bold">{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
              BISP Status
            </Label>
            <Select value={values.bispStatus || ""} onValueChange={(v) => handleUpdate("bispStatus", v)}>
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {["Beneficiary", "Not Registered", "Ineligible"].map(opt => (
                  <SelectItem key={opt} value={opt} className="font-bold">{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
            Preferred Assistance Type
          </Label>
          <div className="flex flex-wrap gap-2">
            {["Education", "Business", "Healthcare", "Agriculture", "Employment"].map((type) => {
              const isSelected = (values.financialNeedType || []).includes(type);
              return (
                <Badge
                  key={type}
                  variant="outline"
                  className={`cursor-pointer px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-white shadow-md border-emerald-500 hover:bg-emerald-600' 
                      : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-200 hover:bg-emerald-50'
                  }`}
                  onClick={() => toggleAssistanceType(type)}
                >
                  {type}
                </Badge>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Education & Support */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Education & Support</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
              Education Level
            </Label>
            <Select value={values.educationLevel || ""} onValueChange={(v) => handleUpdate("educationLevel", v)}>
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select Level" />
              </SelectTrigger>
              <SelectContent>
                {["None", "Primary", "Middle", "Matric", "Intermediate", "Bachelor", "Master"].map(opt => (
                  <SelectItem key={opt} value={opt} className="font-bold">{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
              Currently Studying?
            </Label>
            <Select value={values.studentStatus || ""} onValueChange={(v) => handleUpdate("studentStatus", v)}>
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {["Yes", "No"].map(opt => (
                  <SelectItem key={opt} value={opt} className="font-bold">{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
              Disability Status
            </Label>
            <Select value={values.disabilityStatus || ""} onValueChange={(v) => handleUpdate("disabilityStatus", v)}>
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {["No", "Physical", "Visual", "Hearing", "Other"].map(opt => (
                  <SelectItem key={opt} value={opt} className="font-bold">{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 4. Household & Digital */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Household & Digital</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
              Residence Type
            </Label>
            <Select value={values.houseOwnership || ""} onValueChange={(v) => handleUpdate("houseOwnership", v)}>
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {["Owned", "Rented", "Family/Shared", "Other"].map(opt => (
                  <SelectItem key={opt} value={opt} className="font-bold">{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
              Existing Govt Support
            </Label>
            <Select value={values.existingSupport || ""} onValueChange={(v) => handleUpdate("existingSupport", v)}>
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {["None", "Ehsaas", "Zakat", "Bait-ul-Mal", "Other"].map(opt => (
                  <SelectItem key={opt} value={opt} className="font-bold">{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
              Internet Access
            </Label>
            <Select value={values.internetAccess || ""} onValueChange={(v) => handleUpdate("internetAccess", v)}>
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {["Yes", "No"].map(opt => (
                  <SelectItem key={opt} value={opt} className="font-bold">{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
              Smartphone Access
            </Label>
            <Select value={values.deviceAccess || ""} onValueChange={(v) => handleUpdate("deviceAccess", v)}>
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {["Yes", "No"].map(opt => (
                  <SelectItem key={opt} value={opt} className="font-bold">{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};
