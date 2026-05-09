import { HeartPulse, ShieldCheck, GraduationCap } from "lucide-react";

export type CoreModuleId = "education" | "schemes" | "healthcare";

export type FieldType = "text" | "number" | "select" | "textarea";

export type ProfileFieldDef = {
  /** Dot-path under Profile.profile, e.g. "education.degree" */
  path: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  description?: string;
  options?: Array<{ label: string; value: string }>;
};

export type ProfileModuleDef = {
  id: CoreModuleId;
  title: string;
  subtitle: string;
  icon: any;
  accentClass: string;
  fields: ProfileFieldDef[];
};

export const CORE_MODULES: ProfileModuleDef[] = [
  {
    id: "education",
    title: "Education Information",
    subtitle: "Your academic goals and preferences",
    icon: GraduationCap,
    accentClass: "from-blue-500/10 to-indigo-500/10",
    fields: [
      { path: "education.degree", label: "Degree Level", type: "select", options: [
        { label: "Matric / O-Levels", value: "Matric" },
        { label: "Intermediate / A-Levels", value: "Intermediate" },
        { label: "Bachelor", value: "Bachelor" },
        { label: "Master", value: "Master" },
      ]},
      { path: "education.preferredProgram", label: "Preferred Program", type: "text", placeholder: "e.g. Software Engineering, MBBS" },
      { path: "education.preferredSpecialization", label: "Preferred Specialization", type: "text", placeholder: "e.g. AI, Cardiology" },
      { path: "education.city", label: "Preferred City", type: "text", placeholder: "e.g. Lahore" },
      { path: "education.marks", label: "Marks (%)", type: "number", placeholder: "e.g. 85" },
      { path: "education.feeRange", label: "Budget Range", type: "select", options: [
        { label: "Under 50k", value: "Under 50k" },
        { label: "50k-100k", value: "50k-100k" },
        { label: "100k-200k", value: "100k-200k" },
        { label: "Above 200k", value: "Above 200k" },
      ]},
      { path: "education.careerGoal", label: "Career Goal", type: "text", placeholder: "e.g. Doctor, Engineer" },
    ],
  },
  {
    id: "schemes",
    title: "Scheme Eligibility",
    subtitle: "Demographics used for welfare program matching",
    icon: ShieldCheck,
    accentClass: "from-emerald-500/10 to-teal-500/10",
    fields: [
      { path: "schemes.income", label: "Monthly Income (PKR)", type: "number", placeholder: "e.g. 45000" },
      { path: "schemes.age", label: "Age", type: "number", placeholder: "e.g. 25" },
      { path: "schemes.employmentStatus", label: "Employment Status", type: "select", options: [
        { label: "Student", value: "Student" },
        { label: "Unemployed", value: "Unemployed" },
        { label: "Employed", value: "Employed" },
        { label: "Self-Employed", value: "Self-Employed" },
      ]},
      { path: "schemes.province", label: "Province", type: "text", placeholder: "e.g. Punjab" },
      { path: "schemes.educationLevel", label: "Education Level", type: "text", placeholder: "e.g. Intermediate" },
      { path: "schemes.familySize", label: "Family Size", type: "number", placeholder: "e.g. 6" },
      { path: "schemes.disabilityStatus", label: "Disability Status", type: "select", options: [
        { label: "No", value: "No" },
        { label: "Yes", value: "Yes" },
      ]},
      { path: "schemes.bispStatus", label: "BISP Status", type: "text", placeholder: "e.g. Eligible / Not Eligible" },
    ],
  },
  {
    id: "healthcare",
    title: "Hospital Preferences",
    subtitle: "Healthcare context for hospital recommendations",
    icon: HeartPulse,
    accentClass: "from-rose-500/10 to-orange-500/10",
    fields: [
      { path: "healthcare.city", label: "City", type: "text", placeholder: "e.g. Karachi" },
      { path: "healthcare.tehsil", label: "Tehsil / Area", type: "text", placeholder: "e.g. Gulberg" },
      { path: "healthcare.hospitalCategory", label: "Preferred Hospital Type", type: "select", options: [
        { label: "Public", value: "Public" },
        { label: "Private", value: "Private" },
        { label: "Both", value: "Both" },
      ]},
      { path: "healthcare.emergencyRequirement", label: "Emergency Requirement", type: "select", options: [
        { label: "No", value: "No" },
        { label: "Yes", value: "Yes" },
      ]},
      { path: "healthcare.genderPreference", label: "Gender Preference", type: "select", options: [
        { label: "None", value: "None" },
        { label: "Female Staff", value: "Female Staff" },
        { label: "Male Staff", value: "Male Staff" },
      ]},
      { path: "healthcare.chronicIllness", label: "Chronic Illness", type: "text", placeholder: "Optional" },
    ],
  },
];

export const CORE_MODULE_IDS: CoreModuleId[] = ["education", "schemes", "healthcare"];

