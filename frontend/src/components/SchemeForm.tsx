import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { schemeAdminAPI } from "@/services/schemeAPI";
import { Plus, X, ChevronDown, ChevronUp } from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────────────
const SCHEME_CATEGORIES = [
    "Financial Assistance","Healthcare","Education","Housing","Agriculture",
    "Employment","Technology & Innovation","Fisheries","Livestock","Tourism",
    "Women Empowerment","Water & Sanitation","Orphan Support","Disabled Persons",
    "Transportation","Industrial Development","Environment","Elderly Care","Energy","Sports",
];
const TARGET_CATEGORIES = [
    "Below Poverty Line","Male","Female","Youth","Entrepreneur","Student","Farmer",
    "Disabled Persons","Widow","Senior Citizen","Low Income Family","Business Owner",
    "Freelancer","Skilled Worker","Laborer","Daily Wage Worker","Unemployed","Woman",
];
const EMPLOYMENT_OPTIONS = [
    "Unemployed","Employed","Self-Employed","Student","Freelancer","Business Owner","Farmer","Retired","Any","Daily Wage Worker",
];
const PROVINCE_OPTIONS = [
    "Federal","Punjab","Sindh","Khyber Pakhtunkhwa","Balochistan",
    "Gilgit-Baltistan","Azad Jammu & Kashmir","Islamabad Capital Territory",
];

// ── Schema ────────────────────────────────────────────────────────────────────
const schemeSchema = z.object({
    schemeId: z.string().min(1, "Scheme ID is required"),
    schemeName: z.string().min(3, "At least 3 characters"),
    shortName: z.string().min(2, "At least 2 characters"),
    category: z.string().min(1, "Category is required"),
    department: z.string().min(1, "Department is required"),
    province: z.string().min(1, "Province is required"),
    description: z.string().min(10, "At least 10 characters"),
    longDescription: z.string().optional(),
    status: z.string().default("Active"),
    benefits: z.object({
        financial: z.object({
            amount: z.coerce.number().min(0),
            frequency: z.string().min(1),
            currency: z.string().default("PKR"),
        }),
        nonFinancial: z.array(z.string()).default([]),
        duration: z.string().optional(),
    }),
    eligibility: z.object({
        income: z.object({ min: z.coerce.number().min(0), max: z.coerce.number().min(0) }),
        age: z.object({ min: z.coerce.number().min(0), max: z.coerce.number().min(0) }),
        categories: z.array(z.string()).default([]),
        employmentStatus: z.array(z.string()).default([]),
        gender: z.string().optional(),
        familySize: z.object({ min: z.coerce.number().min(0), max: z.coerce.number().min(0) }).optional(),
    }),
    application: z.object({
        method: z.string().min(1),
        website: z.string().url("Valid URL required"),
        steps: z.array(z.string()).default([]),
        requiredDocuments: z.array(z.string()).default([]),
        processingTime: z.string().optional(),
        isOpen: z.boolean().default(true),
    }),
    contact: z.object({
        helpline: z.string().optional(),
        email: z.string().optional(),
        website: z.string().optional(),
    }),
});

type SchemeFormValues = z.infer<typeof schemeSchema>;

const generateSchemeId = () => `PKS${Math.floor(100 + Math.random() * 900)}`;

// ── Section wrapper ───────────────────────────────────────────────────────────
const Section = ({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border rounded-xl overflow-hidden">
            <button type="button" onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
                <span className="font-semibold text-gray-800">{title}</span>
                {open ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
            </button>
            {open && <div className="p-5 space-y-4">{children}</div>}
        </div>
    );
};

// ── Multi-select chip component ───────────────────────────────────────────────
const ChipSelect = ({ label, options, value, onChange }: {
    label: string; options: string[]; value: string[]; onChange: (v: string[]) => void;
}) => {
    const toggle = (opt: string) => {
        onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt]);
    };
    return (
        <div className="space-y-2">
            <p className="text-sm font-bold text-gray-700">{label}</p>
            <div className="flex flex-wrap gap-2">
                {options.map(opt => (
                    <button key={opt} type="button" onClick={() => toggle(opt)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                            value.includes(opt)
                                ? "bg-purple-600 text-white border-purple-600"
                                : "bg-white text-gray-600 border-gray-300 hover:border-purple-400"
                        }`}>
                        {value.includes(opt) && <X className="inline h-3 w-3 mr-1" />}{opt}
                    </button>
                ))}
            </div>
            {value.length > 0 && (
                <p className="text-xs text-purple-600">{value.length} selected</p>
            )}
        </div>
    );
};

// ── Dynamic list component ────────────────────────────────────────────────────
const DynamicList = ({ label, placeholder, value, onChange }: {
    label: string; placeholder: string; value: string[]; onChange: (v: string[]) => void;
}) => {
    const [input, setInput] = useState("");
    const add = () => {
        const trimmed = input.trim();
        if (trimmed && !value.includes(trimmed)) {
            onChange([...value, trimmed]);
            setInput("");
        }
    };
    const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
    return (
        <div className="space-y-2">
            <p className="text-sm font-bold text-gray-700">{label}</p>
            <div className="flex gap-2">
                <Input value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
                    placeholder={placeholder} className="bg-gray-50 focus:bg-white" />
                <Button type="button" onClick={add} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white shrink-0">
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            {value.length > 0 && (
                <div className="space-y-1">
                    {value.map((item, i) => (
                        <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                            <span className="text-gray-700"><span className="text-purple-600 font-bold mr-2">{i + 1}.</span>{item}</span>
                            <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600 ml-2">
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── Main Form ─────────────────────────────────────────────────────────────────
const SchemeForm = ({ isOpen, onClose, onSuccess, scheme }: {
    isOpen: boolean; onClose: () => void; onSuccess: () => void; scheme?: any;
}) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const defaultVals: SchemeFormValues = {
        schemeId: "", schemeName: "", shortName: "", category: "", department: "",
        province: "Federal", description: "", longDescription: "", status: "Active",
        benefits: { financial: { amount: 0, frequency: "One-time", currency: "PKR" }, nonFinancial: [], duration: "" },
        eligibility: { income: { min: 0, max: 100000 }, age: { min: 18, max: 100 }, categories: [], employmentStatus: [], gender: "Any" },
        application: { method: "Online", website: "", steps: [], requiredDocuments: [], processingTime: "", isOpen: true },
        contact: { helpline: "", email: "", website: "" },
    };

    const form = useForm<SchemeFormValues>({ resolver: zodResolver(schemeSchema), defaultValues: defaultVals });

    useEffect(() => {
        if (!isOpen) return;
        if (scheme) {
            form.reset({
                schemeId: scheme.schemeId || "",
                schemeName: scheme.schemeName || "",
                shortName: scheme.shortName || "",
                category: scheme.category || "",
                department: scheme.department || "",
                province: scheme.province || "Federal",
                description: scheme.description || "",
                longDescription: scheme.longDescription || "",
                status: scheme.status || "Active",
                benefits: {
                    financial: { amount: scheme.benefits?.financial?.amount || 0, frequency: scheme.benefits?.financial?.frequency || "One-time", currency: "PKR" },
                    nonFinancial: scheme.benefits?.nonFinancial || [],
                    duration: scheme.benefits?.duration || "",
                },
                eligibility: {
                    income: { min: scheme.eligibility?.income?.min || 0, max: scheme.eligibility?.income?.max || 100000 },
                    age: { min: scheme.eligibility?.age?.min || 18, max: scheme.eligibility?.age?.max || 100 },
                    categories: scheme.eligibility?.categories || [],
                    employmentStatus: scheme.eligibility?.employmentStatus || [],
                    gender: scheme.eligibility?.gender || "Any",
                    familySize: scheme.eligibility?.familySize,
                },
                application: {
                    method: scheme.application?.method || "Online",
                    website: scheme.application?.website || "",
                    steps: scheme.application?.steps || [],
                    requiredDocuments: scheme.application?.requiredDocuments || [],
                    processingTime: scheme.application?.processingTime || "",
                    isOpen: scheme.application?.isOpen !== false,
                },
                contact: { helpline: scheme.contact?.helpline?.[0] || "", email: scheme.contact?.email?.[0] || "", website: scheme.contact?.website || "" },
            });
        } else {
            form.reset({ ...defaultVals, schemeId: generateSchemeId() });
        }
    }, [scheme, isOpen]);

    const onSubmit = async (values: SchemeFormValues) => {
        setLoading(true);
        const payload = {
            ...values,
            contact: { ...values.contact, helpline: values.contact.helpline ? [values.contact.helpline] : [], email: values.contact.email ? [values.contact.email] : [] },
        };
        try {
            if (scheme) { await schemeAdminAPI.updateScheme(scheme._id, payload); toast({ title: "Scheme updated" }); }
            else { await schemeAdminAPI.createScheme(payload); toast({ title: "Scheme created" }); }
            onSuccess(); onClose();
        } catch (error: any) {
            toast({ title: "Error", description: error.response?.data?.error || "Failed to save scheme", variant: "destructive" });
        } finally { setLoading(false); }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto bg-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                        {scheme ? "Edit Scheme" : "Add New Scheme"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        {/* ── Basic Info ── */}
                        <Section title="📋 Basic Information">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="schemeId" render={({ field }) => (
                                    <FormItem><FormLabel className="font-bold">Scheme ID *</FormLabel>
                                        <FormControl><Input {...field} disabled className="bg-gray-100 font-mono text-blue-600 cursor-not-allowed" /></FormControl>
                                        <FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="shortName" render={({ field }) => (
                                    <FormItem><FormLabel className="font-bold">Short Name *</FormLabel>
                                        <FormControl><Input {...field} placeholder="e.g., Ehsaas Cash" className="bg-gray-50" /></FormControl>
                                        <FormMessage /></FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="schemeName" render={({ field }) => (
                                <FormItem><FormLabel className="font-bold">Scheme Name *</FormLabel>
                                    <FormControl><Input {...field} placeholder="Full scheme name" className="bg-gray-50" /></FormControl>
                                    <FormMessage /></FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="category" render={({ field }) => (
                                    <FormItem><FormLabel className="font-bold">Category *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger className="bg-gray-50"><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                                            <SelectContent>{SCHEME_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                        </Select><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="province" render={({ field }) => (
                                    <FormItem><FormLabel className="font-bold">Province *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger className="bg-gray-50"><SelectValue placeholder="Select province" /></SelectTrigger></FormControl>
                                            <SelectContent>{PROVINCE_OPTIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                                        </Select><FormMessage /></FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="department" render={({ field }) => (
                                <FormItem><FormLabel className="font-bold">Department *</FormLabel>
                                    <FormControl><Input {...field} placeholder="e.g., Ministry of Social Welfare" className="bg-gray-50" /></FormControl>
                                    <FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem><FormLabel className="font-bold">Short Description *</FormLabel>
                                    <FormControl><Textarea {...field} rows={2} placeholder="Brief summary" className="bg-gray-50" /></FormControl>
                                    <FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="longDescription" render={({ field }) => (
                                <FormItem><FormLabel className="font-bold">Detailed Description</FormLabel>
                                    <FormControl><Textarea {...field} rows={4} placeholder="Full description of the scheme..." className="bg-gray-50" /></FormControl>
                                    <FormMessage /></FormItem>
                            )} />
                        </Section>

                        {/* ── Benefits ── */}
                        <Section title="💰 Benefits">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="benefits.financial.amount" render={({ field }) => (
                                    <FormItem><FormLabel className="font-bold">Financial Amount (PKR) *</FormLabel>
                                        <FormControl><Input type="number" {...field} className="bg-gray-50" /></FormControl>
                                        <FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="benefits.financial.frequency" render={({ field }) => (
                                    <FormItem><FormLabel className="font-bold">Frequency *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger className="bg-gray-50"><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {["One-time","Monthly","Quarterly","Bi-Annual","Annually","One-time Loan"].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                                            </SelectContent>
                                        </Select><FormMessage /></FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="benefits.duration" render={({ field }) => (
                                <FormItem><FormLabel className="font-bold">Duration</FormLabel>
                                    <FormControl><Input {...field} placeholder="e.g., Loan repayment over 5 years" className="bg-gray-50" /></FormControl>
                                    <FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="benefits.nonFinancial" render={({ field }) => (
                                <FormItem>
                                    <DynamicList label="Additional Benefits" placeholder="e.g., Free training, Mentorship..." value={field.value} onChange={field.onChange} />
                                    <FormMessage /></FormItem>
                            )} />
                        </Section>

                        {/* ── Eligibility ── */}
                        <Section title="✅ Eligibility Criteria">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="eligibility.income.min" render={({ field }) => (
                                    <FormItem><FormLabel className="font-bold">Min Income (PKR)</FormLabel>
                                        <FormControl><Input type="number" {...field} placeholder="0" className="bg-gray-50" /></FormControl>
                                        <FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="eligibility.income.max" render={({ field }) => (
                                    <FormItem><FormLabel className="font-bold">Max Income (PKR) *</FormLabel>
                                        <FormControl><Input type="number" {...field} placeholder="50000" className="bg-gray-50" /></FormControl>
                                        <FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="eligibility.age.min" render={({ field }) => (
                                    <FormItem><FormLabel className="font-bold">Min Age</FormLabel>
                                        <FormControl><Input type="number" {...field} placeholder="18" className="bg-gray-50" /></FormControl>
                                        <FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="eligibility.age.max" render={({ field }) => (
                                    <FormItem><FormLabel className="font-bold">Max Age</FormLabel>
                                        <FormControl><Input type="number" {...field} placeholder="100" className="bg-gray-50" /></FormControl>
                                        <FormMessage /></FormItem>
                                )} />
                            </div>

                            <FormField control={form.control} name="eligibility.gender" render={({ field }) => (
                                <FormItem><FormLabel className="font-bold">Gender Eligibility</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || "Any"}>
                                        <FormControl><SelectTrigger className="bg-gray-50"><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Any">Any (All Genders)</SelectItem>
                                            <SelectItem value="Male">Male Only</SelectItem>
                                            <SelectItem value="Female">Female Only</SelectItem>
                                        </SelectContent>
                                    </Select><FormMessage /></FormItem>
                            )} />

                            <FormField control={form.control} name="eligibility.categories" render={({ field }) => (
                                <FormItem>
                                    <ChipSelect label="Target Beneficiary Categories" options={TARGET_CATEGORIES} value={field.value} onChange={field.onChange} />
                                    <FormMessage /></FormItem>
                            )} />

                            <FormField control={form.control} name="eligibility.employmentStatus" render={({ field }) => (
                                <FormItem>
                                    <ChipSelect label="Employment Status Eligibility" options={EMPLOYMENT_OPTIONS} value={field.value} onChange={field.onChange} />
                                    <FormMessage /></FormItem>
                            )} />
                        </Section>

                        {/* ── Application ── */}
                        <Section title="📝 Application Process" defaultOpen={false}>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="application.method" render={({ field }) => (
                                    <FormItem><FormLabel className="font-bold">Application Method *</FormLabel>
                                        <FormControl><Input {...field} placeholder="e.g., Online, In-Person, SMS" className="bg-gray-50" /></FormControl>
                                        <FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="application.processingTime" render={({ field }) => (
                                    <FormItem><FormLabel className="font-bold">Processing Time</FormLabel>
                                        <FormControl><Input {...field} placeholder="e.g., 7-14 business days" className="bg-gray-50" /></FormControl>
                                        <FormMessage /></FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="application.website" render={({ field }) => (
                                <FormItem><FormLabel className="font-bold">Application Website *</FormLabel>
                                    <FormControl><Input {...field} placeholder="https://example.gov.pk" className="bg-gray-50" /></FormControl>
                                    <FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="application.steps" render={({ field }) => (
                                <FormItem>
                                    <DynamicList label="Application Steps (Step-by-Step)" placeholder="e.g., Register on the portal..." value={field.value} onChange={field.onChange} />
                                    <FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="application.requiredDocuments" render={({ field }) => (
                                <FormItem>
                                    <DynamicList label="Required Documents" placeholder="e.g., CNIC, Utility Bills..." value={field.value} onChange={field.onChange} />
                                    <FormMessage /></FormItem>
                            )} />
                        </Section>

                        {/* ── Contact ── */}
                        <Section title="📞 Contact Information" defaultOpen={false}>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="contact.helpline" render={({ field }) => (
                                    <FormItem><FormLabel className="font-bold">Helpline</FormLabel>
                                        <FormControl><Input {...field} placeholder="e.g., 051-9245100" className="bg-gray-50" /></FormControl>
                                        <FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="contact.email" render={({ field }) => (
                                    <FormItem><FormLabel className="font-bold">Email</FormLabel>
                                        <FormControl><Input type="email" {...field} placeholder="info@example.gov.pk" className="bg-gray-50" /></FormControl>
                                        <FormMessage /></FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="contact.website" render={({ field }) => (
                                <FormItem><FormLabel className="font-bold">Contact Website</FormLabel>
                                    <FormControl><Input {...field} placeholder="https://example.gov.pk" className="bg-gray-50" /></FormControl>
                                    <FormMessage /></FormItem>
                            )} />
                        </Section>

                        {/* ── Status ── */}
                        <Section title="⚙️ Status" defaultOpen={false}>
                            <FormField control={form.control} name="status" render={({ field }) => (
                                <FormItem><FormLabel className="font-bold">Scheme Status</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger className="bg-gray-50 w-48"><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {["Active","Inactive","Suspended","Closed"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                        </SelectContent>
                                    </Select><FormMessage /></FormItem>
                            )} />
                        </Section>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                            <Button type="submit"
                                className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white min-w-[140px]"
                                disabled={loading}>
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                        Saving...
                                    </span>
                                ) : scheme ? "Update Scheme" : "Create Scheme"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default SchemeForm;
