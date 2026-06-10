import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, HeartPulse, ShieldCheck, ChevronRight, ChevronLeft, Check, Info, GraduationCap, Briefcase, Home, Globe, UserCheck, Stethoscope } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useForm, Controller } from "react-hook-form";
import { PAKISTAN_PROVINCES, PAKISTAN_CITIES, ALL_CITIES } from "@/data/pakistan-data";
import { CITY_TEHSILS } from "@/data/healthcare-data";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronsUpDown, Search, MapPin, Loader2 } from "lucide-react";

// ─── REQUIRED FIELD DEFINITIONS (source of truth for completion checks) ───

const EDUCATION_REQUIRED_FIELDS = [
  "education.degree",
  "education.preferredProgram",
  "education.city",
  "education.province",
  "education.universityType",
  "education.feeRange",
] as const;

const SCHEMES_REQUIRED_FIELDS = [
  "schemes.income",
  "schemes.age",
  "schemes.employmentStatus",
  "schemes.province",
  "schemes.city",
  "schemes.educationLevel",
  "schemes.familySize",
  "schemes.bispStatus",
] as const;
// schemes.financialNeedType is checked separately (array must have length > 0)

const HEALTHCARE_REQUIRED_FIELDS = [
  "healthcare.city",
  "healthcare.tehsil",
  "healthcare.treatmentType",
  "healthcare.budgetRange",
] as const;

const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder = "Search...",
  emptyMessage = "No results found."
}: any) => {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-11 bg-white border-slate-200 font-normal hover:bg-slate-50 transition-colors"
        >
          <span className="truncate">{value ? options.find((opt: string) => opt === value) : placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-y-auto">
              {options.map((opt: string) => (
                <CommandItem
                  key={opt}
                  value={opt}
                  onSelect={(currentValue) => {
                    // Workaround for CommandItem returning lowercase
                    const matched = options.find((o: string) => o.toLowerCase() === currentValue.toLowerCase());
                    onChange(matched || opt);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === opt ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {opt}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const OnboardingPage = () => {
  const [step, setStep] = useState(1);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
    education: {
        degree: "",
        preferredProgram: "",
        preferredSpecialization: "",
        city: "",
        province: "",
        marks: "",
        expectedMerit: "",
        feeRange: "",
        feePreference: "Annual",
        universityType: "Both",
        hostelRequired: "No",
        scholarshipRequired: "No",
        relocation: "No",
        distanceTolerance: "Same City",
        studyMode: "Regular",
        entranceTestStatus: "Not Taken",
        careerGoal: "",
        technicalBackground: "None",
      },
      schemes: {
        income: "",
        age: "",
        employmentStatus: "",
        province: "",
        city: "",
        educationLevel: "",
        studentStatus: "Yes",
        familySize: "",
        houseOwnership: "Owned",
        bispStatus: "None",
        disabilityStatus: "No",
        internetAccess: "Yes",
        deviceAccess: "Yes",
        financialNeedType: [] as string[],
      },
      healthcare: {
        city: "",
        tehsil: "",
        travelPreference: "Same City Only",
        hospitalCategory: "Both",
        urgencyLevel: "Normal",
        budgetRange: "",
        treatmentType: "",
        medicalSupport: [] as string[],
        transportAvailability: "Personal Transport",
        distanceTolerance: "Under 20 KM",
        medicalInsurance: "No",
        financialAssistance: "No",
      },
    }
  });

  const [isLocating, setIsLocating] = useState(false);
  const [eduOptions, setEduOptions] = useState<{
    programs: string[];
    specializations: string[];
    careerGoals: string[];
  }>({
    programs: [],
    specializations: [],
    careerGoals: []
  });

  const fetchEduOptions = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/education/options`);
      const data = await res.json();
      if (data.success) {
        setEduOptions(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch education options", err);
    }
  };

  const [healthcareOptions, setHealthcareOptions] = useState<{
    treatments: string[];
  }>({
    treatments: []
  });

  const fetchHealthcareOptions = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/healthcare/options`);
      const data = await res.json();
      if (data.success) {
        setHealthcareOptions(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch healthcare options", err);
    }
  };

  useEffect(() => {
    fetchEduOptions();
    fetchHealthcareOptions();
  }, []);

  const handleLocationClick = () => {
    if (!navigator.geolocation) {
      toast({ title: "Not Supported", description: "Geolocation is not supported by your browser", variant: "destructive" });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          toast({ title: "Location Detected", description: "Successfully fetched your current coordinates." });
          setValue("healthcare.city", "Lahore", { shouldValidate: true });
          setValue("education.city", "Lahore", { shouldValidate: true });
          setValue("education.province", "Punjab", { shouldValidate: true });
          setValue("schemes.province", "Punjab", { shouldValidate: true });
        } catch (err) {
          toast({ title: "Detection Failed", description: "Could not resolve city from coordinates.", variant: "destructive" });
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        toast({ title: "Permission Denied", description: "Please enable location access in your browser.", variant: "destructive" });
      }
    );
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user?.token;

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
    if (user?.data?.onboardingCompleted) {
      navigate("/dashboard");
    }
  }, [token, navigate, user]);

  // ─── WATCH INDIVIDUAL REQUIRED FIELDS for true reactivity ───
  // Watching the entire sub-object can cause stale references with useMemo.
  // By watching each required field individually, React re-renders whenever any changes.
  const watchedEducation = {
    degree: watch("education.degree"),
    preferredProgram: watch("education.preferredProgram"),
    city: watch("education.city"),
    province: watch("education.province"),
    universityType: watch("education.universityType"),
    feeRange: watch("education.feeRange"),
  };

  // Province-City dependency for Education
  const selectedProvince = watch("education.province");
  const filteredCities = useMemo(() => {
    if (!selectedProvince) return [];
    return PAKISTAN_CITIES[selectedProvince] || [];
  }, [selectedProvince]);

  // Reset city when province changes for Education
  useEffect(() => {
    if (selectedProvince) {
      const currentCity = getValues("education.city");
      if (currentCity && !PAKISTAN_CITIES[selectedProvince]?.includes(currentCity)) {
        setValue("education.city", "");
      }
    }
  }, [selectedProvince, setValue, getValues]);

  // Province-City dependency for Schemes
  const selectedProvinceSchemes = watch("schemes.province");
  const filteredCitiesSchemes = useMemo(() => {
    if (!selectedProvinceSchemes) return [];
    return PAKISTAN_CITIES[selectedProvinceSchemes] || [];
  }, [selectedProvinceSchemes]);

  // Reset city when province changes for Schemes
  useEffect(() => {
    if (selectedProvinceSchemes) {
      const currentCity = getValues("schemes.city");
      if (currentCity && !PAKISTAN_CITIES[selectedProvinceSchemes]?.includes(currentCity)) {
        setValue("schemes.city", "");
      }
    }
  }, [selectedProvinceSchemes, setValue, getValues]);

  // City-Tehsil dependency for Healthcare
  const selectedCityHealthcare = watch("healthcare.city");
  const filteredTehsils = useMemo(() => {
    if (!selectedCityHealthcare) return [];
    return CITY_TEHSILS[selectedCityHealthcare] || ["Central", "Cantt", "City Center"];
  }, [selectedCityHealthcare]);

  // Reset tehsil when city changes for Healthcare
  useEffect(() => {
    if (selectedCityHealthcare) {
      const currentTehsil = getValues("healthcare.tehsil");
      if (currentTehsil && !CITY_TEHSILS[selectedCityHealthcare]?.includes(currentTehsil)) {
        setValue("healthcare.tehsil", "");
      }
    }
  }, [selectedCityHealthcare, setValue, getValues]);

  const watchedSchemes = {
    income: watch("schemes.income"),
    age: watch("schemes.age"),
    province: watch("schemes.province"),
    city: watch("schemes.city"),
    employmentStatus: watch("schemes.employmentStatus"),
    educationLevel: watch("schemes.educationLevel"),
    familySize: watch("schemes.familySize"),
    bispStatus: watch("schemes.bispStatus"),
    financialNeedType: watch("schemes.financialNeedType"),
  };

  const watchedHealthcare = {
    city: watch("healthcare.city"),
    tehsil: watch("healthcare.tehsil"),
    treatmentType: watch("healthcare.treatmentType"),
    budgetRange: watch("healthcare.budgetRange"),
    hospitalCategory: watch("healthcare.hospitalCategory"),
  };

  // ─── MODULE COMPLETION CHECKS (direct, no stale refs) ───
  const isEducationDone = !!(
    watchedEducation.degree &&
    watchedEducation.preferredProgram &&
    watchedEducation.city &&
    watchedEducation.province &&
    watchedEducation.universityType &&
    watchedEducation.feeRange
  );

  const isSchemesDone = !!(
    watchedSchemes.income &&
    watchedSchemes.age &&
    watchedSchemes.province &&
    watchedSchemes.city &&
    watchedSchemes.employmentStatus &&
    watchedSchemes.educationLevel &&
    watchedSchemes.familySize &&
    watchedSchemes.bispStatus &&
    watchedSchemes.financialNeedType &&
    (watchedSchemes.financialNeedType as string[]).length > 0
  );

  const isHealthcareDone = !!(
    watchedHealthcare.city &&
    watchedHealthcare.tehsil &&
    watchedHealthcare.treatmentType &&
    watchedHealthcare.budgetRange &&
    watchedHealthcare.hospitalCategory
  );

  // ─── OVERALL COMPLETION (only checks selected modules) ───
  const isOnboardingComplete = useMemo(() => {
    if (selectedModules.length === 0) return false;
    return (
      (!selectedModules.includes("education") || isEducationDone) &&
      (!selectedModules.includes("schemes") || isSchemesDone) &&
      (!selectedModules.includes("healthcare") || isHealthcareDone)
    );
  }, [selectedModules, isEducationDone, isSchemesDone, isHealthcareDone]);

  // ─── STEP VALIDATION (uses direct checks, no Zod trigger) ───
  const isStepValid = () => {
    if (step === 1) return selectedModules.length > 0;
    const mod = selectedModules[step - 2];
    if (mod === "education") return isEducationDone;
    if (mod === "schemes") return isSchemesDone;
    if (mod === "healthcare") return isHealthcareDone;
    return false;
  };

  const toggleModule = (module: string) => {
    setSelectedModules((prev) =>
      prev.includes(module) ? prev.filter((m) => m !== module) : [...prev, module]
    );
  };

  const handleNextStep = () => {
    if (step === 1 && selectedModules.length === 0) {
      toast({ title: "Selection Required", description: "Please select at least one module to continue.", variant: "destructive" });
      return;
    }
    if (!isStepValid()) {
      toast({ title: "Incomplete Details", description: "Please fill all required fields before continuing.", variant: "destructive" });
      return;
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const onFinalSubmit = async () => {
    if (!isOnboardingComplete) {
      toast({ title: "Incomplete", description: "Please complete all required fields.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const formData = getValues();
      const payload = {
        selectedModules,
        profile: {
          education: selectedModules.includes("education") ? {
            ...formData.education,
            marks: formData.education.marks ? Number(formData.education.marks) : 0,
            expectedMerit: formData.education.expectedMerit ? Number(formData.education.expectedMerit) : 0
          } : null,
          schemes: selectedModules.includes("schemes") ? {
            ...formData.schemes,
            income: Number(formData.schemes.income),
            age: Number(formData.schemes.age),
            familySize: formData.schemes.familySize ? Number(formData.schemes.familySize) : undefined
          } : null,
          healthcare: selectedModules.includes("healthcare") ? {
            ...formData.healthcare,
            budgetRange: Number(formData.healthcare.budgetRange)
          } : null,
        }
      };

      console.log("Submitting Onboarding Payload:", payload);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/complete-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        const updatedUser = { ...user };
        updatedUser.data.onboardingCompleted = true;
        updatedUser.data.selectedModules = selectedModules;
        localStorage.setItem("user", JSON.stringify(updatedUser));

        toast({
          title: "Profile setup complete!",
          description: "Welcome to your personalized dashboard.",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to save profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = selectedModules.length + 1;
  const progress = ((step - 1) / totalSteps) * 100;

  const getActiveModule = () => {
    if (step === 1) return "interests";
    return selectedModules[step - 2];
  };

  const activeModule = getActiveModule();

  const isCurrentModuleComplete = useMemo(() => {
    if (step === 1) return selectedModules.length > 0;
    if (activeModule === "education") return isEducationDone;
    if (activeModule === "schemes") return isSchemesDone;
    if (activeModule === "healthcare") return isHealthcareDone;
    return false;
  }, [step, activeModule, selectedModules, isEducationDone, isSchemesDone, isHealthcareDone]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl">
        <div className="mb-8 space-y-3 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="section-label mb-4">Awam Assist Profile</div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
              {step === 1 ? "Personalize Your Experience" : "Please Complete Your Profile"}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto mt-3">
              {step === 1
                ? "Choose the services that match your needs. You can update these preferences anytime later."
                : "Help us tailor our recommendations by providing a few more details."}
            </p>
          </motion.div>
        </div>

        <div className="mb-8 max-w-3xl mx-auto bg-card border border-border/70 rounded-2xl shadow-sm p-5">
          <div className="flex justify-between items-end mb-3 px-1">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Onboarding Progress</span>
              <div className="text-foreground font-bold">
                Step {step} <span className="text-muted-foreground font-medium">of {totalSteps}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-foreground">{Math.round(progress)}%</span>
            </div>
          </div>
          <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full hero-gradient-ai"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {[
                {
                  id: "education",
                  title: "Education",
                  description: "Universities, scholarships, and admissions.",
                  icon: <BookOpen className="w-6 h-6" />,
                  isValid: isEducationDone,
                  accent: "primary",
                  ring: "border-t-primary",
                },
                {
                  id: "schemes",
                  title: "Govt Schemes",
                  description: "Financial aid and welfare programs.",
                  icon: <ShieldCheck className="w-6 h-6" />,
                  isValid: isSchemesDone,
                  accent: "purple",
                  ring: "border-t-violet-600",
                },
                {
                  id: "healthcare",
                  title: "Healthcare",
                  description: "Hospital networks and medical assistance.",
                  icon: <HeartPulse className="w-6 h-6" />,
                  isValid: isHealthcareDone,
                  accent: "cyan",
                  ring: "border-t-cyan-600",
                },
              ].map((module) => {
                const isSelected = selectedModules.includes(module.id);
                const isCompleted = module.isValid;

                return (
                  <Card
                    key={module.id}
                    className={`group cursor-pointer transition-all duration-300 relative overflow-hidden border border-t-[3px] ${module.ring} rounded-2xl h-full flex flex-col ${isSelected
                      ? "border-primary/40 bg-card shadow-lg shadow-primary/10 ring-4 ring-primary/5"
                      : "border-border/70 bg-card shadow-sm hover:border-primary/25 hover:shadow-lg"
                      }`}
                    onClick={() => toggleModule(module.id)}
                  >
                    <div className="relative p-6 flex flex-col h-full z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${isSelected ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-accent text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                          }`}>
                          {module.icon}
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`p-1.5 rounded-full ${isCompleted ? "bg-cyan-600" : "bg-primary"} text-white`}
                          >
                            {isCompleted ? <Check className="w-3 h-3" /> : <div className="w-3 h-3" />}
                          </motion.div>
                        )}
                      </div>
                      <CardTitle className="text-lg font-black text-foreground mb-2">{module.title}</CardTitle>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-6">{module.description}</p>
                      <div className="mt-auto pt-4 flex items-center gap-2">
                        <div className={`w-full h-1.5 rounded-full bg-muted overflow-hidden`}>
                          <div className={`h-full transition-all duration-500 ${isCompleted ? "w-full bg-cyan-600" : "w-0"}`} />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-tight ${isCompleted ? "text-cyan-700" : "text-muted-foreground"}`}>
                          {isCompleted ? "Done" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </motion.div>
          )}

          {activeModule === "education" && (
            <motion.div
              key="education"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border border-border/70"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300", isEducationDone ? "bg-cyan-50 text-cyan-700" : "bg-accent text-primary")}>
                    {isEducationDone ? <Check className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-foreground">Academic Intelligence</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{isEducationDone ? "All required fields completed" : "Fill in the required fields below"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isEducationDone && (
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-bold border border-cyan-200">
                      <Check className="w-3 h-3" /> Complete
                    </span>
                  )}
                  <Button variant="outline" size="sm" onClick={handleLocationClick} disabled={isLocating} className="rounded-xl">
                    {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                    Use My Location
                  </Button>
                </div>
              </div>
              {/* Module completion progress bar */}
              <div className="mb-8">
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-700 ease-out", isEducationDone ? "w-full bg-cyan-600" : "w-1/3 bg-primary/40")} />
                </div>
              </div>

              <Accordion type="single" collapsible defaultValue="basic" className="w-full space-y-4">
                <AccordionItem value="basic" className="border border-border/70 bg-muted/35 rounded-2xl px-5">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <span className="font-bold text-slate-700">Core Academic Details</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-xs font-bold uppercase">Current Level</Label>
                        <Controller
                          name="education.degree"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className={cn("h-11 bg-white border-slate-200", errors.education?.degree && "border-red-500")}>
                                <SelectValue placeholder="Current Degree" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Matric">Matric / O-Levels</SelectItem>
                                <SelectItem value="Intermediate">Intermediate / A-Levels</SelectItem>
                                <SelectItem value="Bachelor">Bachelor</SelectItem>
                                <SelectItem value="Master">Master</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-xs font-bold uppercase">Recent Marks (%)</Label>
                        <Controller
                          name="education.marks"
                          control={control}
                          rules={{ required: true, min: 0, max: 100 }}
                          render={({ field }) => (
                            <div className="space-y-1">
                              <Input 
                                {...field} 
                                type="number" 
                                className={cn("h-11 bg-white", (errors.education as any)?.marks && "border-red-500")} 
                                placeholder="e.g. 85" 
                                min="0"
                                max="100"
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  if (isNaN(val)) field.onChange("");
                                  else if (val >= 0 && val <= 100) field.onChange(val);
                                }}
                              />
                              {(errors.education as any)?.marks && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight">Please enter a valid percentage (0-100)</p>}
                            </div>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-xs font-bold uppercase">Expected Merit (%)</Label>
                        <Controller
                          name="education.expectedMerit"
                          control={control}
                          rules={{ required: true, min: 0, max: 100 }}
                          render={({ field }) => (
                            <div className="space-y-1">
                              <Input 
                                {...field} 
                                type="number" 
                                className={cn("h-11 bg-white", (errors.education as any)?.expectedMerit && "border-red-500")} 
                                placeholder="e.g. 80"
                                min="0"
                                max="100"
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  if (isNaN(val)) field.onChange("");
                                  else if (val >= 0 && val <= 100) field.onChange(val);
                                }}
                              />
                              {(errors.education as any)?.expectedMerit && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight">Please enter a valid percentage (0-100)</p>}
                            </div>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-xs font-bold uppercase">Entrance Test Status</Label>
                        <Controller
                          name="education.entranceTestStatus"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-11 bg-white">
                                <SelectValue placeholder="Test Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Not Taken">Not Taken Yet</SelectItem>
                                <SelectItem value="Taken (Result Awaited)">Taken (Awaited)</SelectItem>
                                <SelectItem value="Result Declared">Result Declared</SelectItem>
                                <SelectItem value="Exempted">Exempted</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="interest" className="border border-border/70 bg-muted/35 rounded-2xl px-5">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <span className="font-bold text-slate-700">Program & Career Goals</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-xs font-bold uppercase">Preferred Program</Label>
                        <p className="text-[10px] text-slate-400 -mt-1">Select your desired degree program</p>
                        <Controller
                          name="education.preferredProgram"
                          control={control}
                          render={({ field }) => (
                            <SearchableSelect 
                              options={eduOptions.programs} 
                              value={field.value} 
                              onChange={field.onChange} 
                              placeholder="Search Program (e.g. Software Engineering)" 
                              emptyMessage="No matching programs found."
                            />
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-slate-600 text-xs font-bold uppercase">Preferred Specialization</Label>
                          <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400 font-bold">OPTIONAL</span>
                        </div>
                        <p className="text-[10px] text-slate-400 -mt-1">e.g. AI, Cybersecurity, Data Science</p>
                        <Controller
                          name="education.preferredSpecialization"
                          control={control}
                          render={({ field }) => (
                            <SearchableSelect 
                              options={eduOptions.specializations} 
                              value={field.value} 
                              onChange={field.onChange} 
                              placeholder="Search Specialization" 
                              emptyMessage="No matching specializations found."
                            />
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-slate-600 text-xs font-bold uppercase">Career Goal</Label>
                          <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400 font-bold">OPTIONAL</span>
                        </div>
                        <p className="text-[10px] text-slate-400 -mt-1">e.g. Software Engineer, Doctor, Entrepreneur</p>
                        <Controller
                          name="education.careerGoal"
                          control={control}
                          render={({ field }) => (
                            <SearchableSelect 
                              options={eduOptions.careerGoals} 
                              value={field.value} 
                              onChange={field.onChange} 
                              placeholder="Search Career Goal" 
                              emptyMessage="No matching career goals found."
                            />
                          )}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="preferences" className="border border-border/70 bg-muted/35 rounded-2xl px-5">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <span className="font-bold text-slate-700">Location & Preferences</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-xs font-bold uppercase">Preferred Province</Label>
                        <Controller
                          name="education.province"
                          control={control}
                          render={({ field }) => (
                            <SearchableSelect options={PAKISTAN_PROVINCES} value={field.value} onChange={field.onChange} placeholder="Select Province" />
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-xs font-bold uppercase">Preferred Study City</Label>
                        <Controller
                          name="education.city"
                          control={control}
                          render={({ field }) => (
                            <SearchableSelect 
                              options={filteredCities} 
                              value={field.value} 
                              onChange={field.onChange} 
                              placeholder={selectedProvince ? "Search City" : "Select Province First"} 
                              emptyMessage={selectedProvince ? "No cities found in this province." : "Please select a province first."}
                            />
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-xs font-bold uppercase">University Type</Label>
                        <Controller
                          name="education.universityType"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-11 bg-white"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Public">Public Only</SelectItem>
                                <SelectItem value="Private">Private Only</SelectItem>
                                <SelectItem value="Both">Both</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-xs font-bold uppercase">Budget Range</Label>
                        <Controller
                          name="education.feeRange"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-11 bg-white"><SelectValue placeholder="Budget" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Under 50k">Under 50k</SelectItem>
                                <SelectItem value="50k-100k">50k-100k</SelectItem>
                                <SelectItem value="100k-200k">100k-200k</SelectItem>
                                <SelectItem value="Above 200k">Above 200k</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="flexibility" className="border border-border/70 bg-muted/35 rounded-2xl px-5">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <span className="font-bold text-slate-700">Admission Flexibility</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-xs font-bold uppercase">Relocation?</Label>
                        <Controller
                          name="education.relocation"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-11 bg-white"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          )}

          {activeModule === "schemes" && (
            <motion.div
              key="schemes"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border border-border/70"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300", isSchemesDone ? "bg-cyan-50 text-cyan-700" : "bg-accent text-primary")}>
                    {isSchemesDone ? <Check className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-foreground">Scheme Eligibility Intelligence</h2>
                    <p className="text-sm text-muted-foreground">{isSchemesDone ? "All required fields completed" : "Deep demographic profiling for accurate scheme matching."}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isSchemesDone && (
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-bold border border-cyan-200">
                      <Check className="w-3 h-3" /> Complete
                    </span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLocationClick}
                    disabled={isLocating}
                    className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 gap-2"
                  >
                    {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                    <span className="hidden sm:inline">Use My Location</span>
                  </Button>
                </div>
              </div>
              {/* Module completion progress bar */}
              <div className="mb-8">
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-700 ease-out", isSchemesDone ? "w-full bg-cyan-600" : "w-1/3 bg-primary/40")} />
                </div>
              </div>

              <Accordion type="single" collapsible defaultValue="eligibility" className="w-full space-y-4">
                {/* Section 1: Personal & Financial Eligibility */}
                <AccordionItem value="eligibility" className="border border-border/70 bg-muted/35 rounded-2xl px-5">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <UserCheck className="w-5 h-5 text-primary" />
                      <span className="font-bold text-slate-700">Personal & Financial Eligibility</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-xs font-bold uppercase">Applicant Age</Label>
                        <Controller
                          name="schemes.age"
                          control={control}
                          rules={{ required: true, min: 1, max: 120 }}
                          render={({ field }) => (
                            <div className="space-y-1">
                              <Input 
                                {...field} 
                                type="number" 
                                className={cn("h-11 bg-white", (errors.schemes as any)?.age && "border-red-500")} 
                                placeholder="e.g. 25"
                                min="1"
                                max="120"
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (isNaN(val)) field.onChange("");
                                  else if (val >= 0) field.onChange(val);
                                }}
                              />
                              {(errors.schemes as any)?.age && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight">Please enter a valid age (1-120)</p>}
                            </div>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-xs font-bold uppercase">Monthly Family Income (PKR)</Label>
                        <Controller
                          name="schemes.income"
                          control={control}
                          rules={{ required: true, min: 0 }}
                          render={({ field }) => (
                            <div className="space-y-1">
                              <Input 
                                {...field} 
                                type="number" 
                                className={cn("h-11 bg-white", (errors.schemes as any)?.income && "border-red-500")} 
                                placeholder="e.g. 45000"
                                min="0"
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (isNaN(val)) field.onChange("");
                                  else if (val >= 0) field.onChange(val);
                                }}
                              />
                              {(errors.schemes as any)?.income && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight">Income cannot be negative</p>}
                            </div>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-xs font-bold uppercase">Employment Status</Label>
                        <Controller
                          name="schemes.employmentStatus"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-11 bg-white">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Student">Student</SelectItem>
                                <SelectItem value="Unemployed">Unemployed</SelectItem>
                                <SelectItem value="Employed">Employed</SelectItem>
                                <SelectItem value="Self-Employed">Self-Employed</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-xs font-bold uppercase">Province (Domicile)</Label>
                        <Controller
                          name="schemes.province"
                          control={control}
                          render={({ field }) => (
                            <SearchableSelect options={PAKISTAN_PROVINCES} value={field.value} onChange={field.onChange} placeholder="Select Province" />
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-xs font-bold uppercase">City (Domicile)</Label>
                        <Controller
                          name="schemes.city"
                          control={control}
                          render={({ field }) => (
                            <SearchableSelect 
                              options={filteredCitiesSchemes} 
                              value={field.value} 
                              onChange={field.onChange} 
                              placeholder={selectedProvinceSchemes ? "Search City" : "Select Province First"} 
                              emptyMessage={selectedProvinceSchemes ? "No cities found in this province." : "Please select a province first."}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Section 2: Education & Status */}
                <AccordionItem value="education" className="border border-border/70 bg-muted/35 rounded-2xl px-5">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      <span className="font-bold text-slate-700">Education & Status</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-xs font-bold uppercase">Current Education Level</Label>
                        <Controller
                          name="schemes.educationLevel"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-11 bg-white">
                                <SelectValue placeholder="Select Level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Metric">Matric</SelectItem>
                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                <SelectItem value="Bachelor">Bachelor</SelectItem>
                                <SelectItem value="Master">Master</SelectItem>
                                <SelectItem value="PhD">PhD</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-xs font-bold uppercase">Currently Studying?</Label>
                        <Controller
                          name="schemes.studentStatus"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-11 bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes, I am a student</SelectItem>
                                <SelectItem value="No">No, I am not a student</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Section 3: Household & Support */}
                <AccordionItem value="household" className="border border-border/70 bg-muted/35 rounded-2xl px-5">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <Home className="w-5 h-5 text-primary" />
                      <span className="font-bold text-slate-700">Household & Support</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-xs font-bold uppercase">Family Size</Label>
                        <Controller
                          name="schemes.familySize"
                          control={control}
                          rules={{ required: true, min: 1 }}
                          render={({ field }) => (
                            <div className="space-y-1">
                              <Input 
                                {...field} 
                                type="number" 
                                className={cn("h-11 bg-white", (errors.schemes as any)?.familySize && "border-red-500")} 
                                placeholder="Total members" 
                                min="1"
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (isNaN(val)) field.onChange("");
                                  else if (val >= 0) field.onChange(val);
                                }}
                              />
                              {(errors.schemes as any)?.familySize && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight">Family size must be at least 1</p>}
                            </div>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-xs font-bold uppercase">Residence Type</Label>
                        <Controller
                          name="schemes.houseOwnership"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-11 bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Owned">Owned House</SelectItem>
                                <SelectItem value="Rented">Rented House</SelectItem>
                                <SelectItem value="Government Housing">Government Housing</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-xs font-bold uppercase">Existing Govt Support</Label>
                        <Controller
                          name="schemes.bispStatus"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-11 bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="None">None</SelectItem>
                                <SelectItem value="BISP">BISP Participation</SelectItem>
                                <SelectItem value="Ehsaas">Ehsaas Program</SelectItem>
                                <SelectItem value="Both">Both BISP & Ehsaas</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Section 4: Special Status & Needs */}
                <AccordionItem value="special" className="border border-border/70 bg-muted/35 rounded-2xl px-5">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-primary" />
                      <span className="font-bold text-slate-700">Special Status & Needs</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <div className="space-y-6 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-slate-600 text-xs font-bold uppercase">Disability Status</Label>
                          <Controller
                            name="schemes.disabilityStatus"
                            control={control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="h-11 bg-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="No">No</SelectItem>
                                  <SelectItem value="Yes">Yes (Person with Disability)</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        <div className="space-y-4">
                          <Label className="text-slate-600 text-xs font-bold uppercase">Digital Access</Label>
                          <div className="flex gap-6">
                            <div className="flex items-center space-x-2">
                              <Controller
                                name="schemes.internetAccess"
                                control={control}
                                render={({ field }) => (
                                  <input
                                    type="checkbox"
                                    checked={field.value === "Yes"}
                                    onChange={(e) => field.onChange(e.target.checked ? "Yes" : "No")}
                                    className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                                  />
                                )}
                              />
                              <Label className="text-sm text-slate-700">Internet Access</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Controller
                                name="schemes.deviceAccess"
                                control={control}
                                render={({ field }) => (
                                  <input
                                    type="checkbox"
                                    checked={field.value === "Yes"}
                                    onChange={(e) => field.onChange(e.target.checked ? "Yes" : "No")}
                                    className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                                  />
                                )}
                              />
                              <Label className="text-sm text-slate-700">Smartphone Access</Label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label className="text-slate-600 text-xs font-bold uppercase">Financial Assistance Need Type</Label>
                          {errors.schemes?.financialNeedType && <span className="text-[10px] text-red-500 font-bold">Required</span>}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {["Education", "Business", "Healthcare", "Agriculture", "Employment"].map((type) => (
                            <Controller
                              key={type}
                              name="schemes.financialNeedType"
                              control={control}
                              render={({ field }) => {
                                const isSelected = field.value?.includes(type);
                                return (
                                  <div
                                    onClick={() => {
                                      const newVal = isSelected
                                        ? field.value.filter((t: string) => t !== type)
                                        : [...(field.value || []), type];
                                      field.onChange(newVal);
                                    }}
                                    className={cn(
                                      "cursor-pointer p-3 rounded-xl border-2 text-center transition-all",
                                      isSelected
                                        ? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
                                        : "border-slate-100 bg-white text-slate-500 hover:border-slate-300"
                                    )}
                                  >
                                    <span className="text-xs">{type}</span>
                                  </div>
                                );
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          )}

          {activeModule === "healthcare" && (
            <motion.div
              key="healthcare"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border border-border/70"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300", isHealthcareDone ? "bg-cyan-50 text-cyan-700" : "bg-accent text-primary")}>
                    {isHealthcareDone ? <Check className="w-6 h-6" /> : <HeartPulse className="w-6 h-6" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-foreground">Healthcare Accessibility Intelligence</h2>
                    <p className="text-sm text-muted-foreground">{isHealthcareDone ? "All required fields completed" : "Medical preference mapping for hospital matching."}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isHealthcareDone && (
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-bold border border-cyan-200">
                      <Check className="w-3 h-3" /> Complete
                    </span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLocationClick}
                    disabled={isLocating}
                    className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 gap-2"
                  >
                    {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                    <span className="hidden sm:inline">Use My Location</span>
                  </Button>
                </div>
              </div>
              {/* Module completion progress bar */}
              <div className="mb-8">
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-700 ease-out", isHealthcareDone ? "w-full bg-cyan-600" : "w-1/3 bg-primary/40")} />
                </div>
              </div>

              <Accordion type="single" collapsible defaultValue="location" className="w-full space-y-4">
                {/* Section 1: Location & Accessibility */}
                <AccordionItem value="location" className="border border-border/70 bg-muted/35 rounded-2xl px-5">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span className="font-bold text-slate-700">Location & Accessibility</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-xs font-bold uppercase">Current City</Label>
                        <Controller
                          name="healthcare.city"
                          control={control}
                          render={({ field }) => (
                            <SearchableSelect options={ALL_CITIES} value={field.value} onChange={field.onChange} placeholder="Search City" />
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-xs font-bold uppercase">Current Tehsil / Region</Label>
                        <Controller
                          name="healthcare.tehsil"
                          control={control}
                          render={({ field }) => (
                            <SearchableSelect 
                              options={filteredTehsils} 
                              value={field.value} 
                              onChange={field.onChange} 
                              placeholder={selectedCityHealthcare ? "Select Tehsil" : "Select City First"} 
                              emptyMessage={selectedCityHealthcare ? "No tehsils found for this city." : "Please select a city first."}
                            />
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-xs font-bold uppercase">Travel Preference</Label>
                        <Controller
                          name="healthcare.travelPreference"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-11 bg-white"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Same City Only">Same City Only</SelectItem>
                                <SelectItem value="Nearby Cities">Nearby Cities</SelectItem>
                                <SelectItem value="Same Province">Same Province</SelectItem>
                                <SelectItem value="Nationwide">Nationwide</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Section 2: Hospital Preference */}
                <AccordionItem value="preference" className="border border-border/70 bg-muted/35 rounded-2xl px-5">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <Stethoscope className="w-5 h-5 text-primary" />
                      <span className="font-bold text-slate-700">Hospital & Financial Preference</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-xs font-bold uppercase">Preferred Hospital Type</Label>
                        <Controller
                          name="healthcare.hospitalCategory"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-11 bg-white"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Public">Government Only</SelectItem>
                                <SelectItem value="Private">Private Only</SelectItem>
                                <SelectItem value="Both">Both Public & Private</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-xs font-bold uppercase">Urgency Level</Label>
                        <Controller
                          name="healthcare.urgencyLevel"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-11 bg-white"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Emergency">Emergency / Acute</SelectItem>
                                <SelectItem value="Normal">Normal Consultation</SelectItem>
                                <SelectItem value="Scheduled">Scheduled Treatment</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-xs font-bold uppercase">Max Treatment Budget (PKR)</Label>
                        <Controller
                          name="healthcare.budgetRange"
                          control={control}
                          rules={{ required: true, min: 0 }}
                          render={({ field }) => (
                            <div className="space-y-1">
                              <Input 
                                {...field} 
                                type="number" 
                                className={cn("h-11 bg-white", (errors.healthcare as any)?.budgetRange && "border-red-500")} 
                                placeholder="e.g. 50000"
                                min="0"
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (isNaN(val)) field.onChange("");
                                  else if (val >= 0) field.onChange(val);
                                }}
                              />
                              {(errors.healthcare as any)?.budgetRange && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight">Budget cannot be negative</p>}
                            </div>
                          )}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Section 3: Medical Needs & Support */}
                <AccordionItem value="needs" className="border border-border/70 bg-muted/35 rounded-2xl px-5">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <HeartPulse className="w-5 h-5 text-primary" />
                      <span className="font-bold text-slate-700">Medical Needs & Support</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <div className="space-y-6 pt-2">
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-xs font-bold uppercase">Required Treatment Type</Label>
                        <Controller
                          name="healthcare.treatmentType"
                          control={control}
                          render={({ field }) => (
                            <SearchableSelect 
                              options={healthcareOptions.treatments} 
                              value={field.value} 
                              onChange={field.onChange} 
                              placeholder="Search Treatment (e.g. Cardiology, Surgery)" 
                              emptyMessage="No matching treatments found."
                            />
                          )}
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-slate-600 text-xs font-bold uppercase">Specific Support Requirements</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {["Wheelchair Support", "Emergency Ward", "ICU Access", "Female Staff Preference"].map((req) => (
                            <div key={req} className="flex items-center space-x-2 bg-white p-3 rounded-xl border border-slate-100">
                              <Controller
                                name="healthcare.medicalSupport"
                                control={control}
                                render={({ field }) => (
                                  <input
                                    type="checkbox"
                                    checked={field.value?.includes(req)}
                                    onChange={(e) => {
                                      const newVal = e.target.checked
                                        ? [...(field.value || []), req]
                                        : field.value.filter((v: string) => v !== req);
                                      field.onChange(newVal);
                                    }}
                                    className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                                  />
                                )}
                              />
                              <Label className="text-sm text-slate-700">{req}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Section 4: Transport & Coverage */}
                <AccordionItem value="transport" className="border border-border/70 bg-muted/35 rounded-2xl px-5">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                      <span className="font-bold text-slate-700">Transport & Coverage</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-xs font-bold uppercase">Transport Availability</Label>
                        <Controller
                          name="healthcare.transportAvailability"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-11 bg-white"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Personal Transport">Personal Transport</SelectItem>
                                <SelectItem value="Public Transport">Public Transport</SelectItem>
                                <SelectItem value="Ambulance Dependence">Ambulance Dependence</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-xs font-bold uppercase">Max Distance Tolerance</Label>
                        <Controller
                          name="healthcare.distanceTolerance"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-11 bg-white"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Under 5 KM">Under 5 KM</SelectItem>
                                <SelectItem value="Under 20 KM">Under 20 KM</SelectItem>
                                <SelectItem value="Same City">Same City Only</SelectItem>
                                <SelectItem value="Any Distance">Any Distance</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-xs font-bold uppercase">Medical Insurance?</Label>
                        <Controller
                          name="healthcare.medicalInsurance"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-11 bg-white"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-600 text-xs font-bold uppercase">Financial Assistance Needed?</Label>
                        <Controller
                          name="healthcare.financialAssistance"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-11 bg-white"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex justify-between items-center max-w-3xl mx-auto">
          {step > 1 && (
            <Button variant="ghost" onClick={handlePrevStep} className="text-slate-500 hover:text-slate-900 transition-colors gap-2">
              <ChevronLeft className="w-5 h-5" />
              Back
            </Button>
          )}
          <div className="ml-auto flex gap-4">
            {step < totalSteps ? (
              <Button
                onClick={handleNextStep}
                disabled={!isCurrentModuleComplete}
                className={cn(
                  "px-8 h-11 rounded-xl shadow-sm transition-all gap-2",
                  isCurrentModuleComplete ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20" : "bg-muted text-muted-foreground cursor-not-allowed shadow-none"
                )}
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                onClick={onFinalSubmit}
                disabled={loading || !isOnboardingComplete}
                className={cn(
                  "px-10 h-11 rounded-xl shadow-sm transition-all duration-300 gap-2",
                  isOnboardingComplete
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20 hover:shadow-primary/25 hover:scale-[1.02]"
                    : "bg-muted text-muted-foreground cursor-not-allowed shadow-none"
                )}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                {loading ? "Saving..." : isOnboardingComplete ? "Complete Setup" : "Complete All Steps"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
