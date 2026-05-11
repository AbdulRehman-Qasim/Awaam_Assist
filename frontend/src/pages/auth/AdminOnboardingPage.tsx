import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Circle, FileText, Building2, ShieldCheck, Upload, X, BrainCircuit, ArrowRight, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { State, City } from 'country-state-city';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from 'framer-motion';

const onboardingSchema = z.object({
    entity_name: z.string()
        .min(3, "Name must be at least 3 characters")
        .regex(/^[a-zA-Z\s]+$/, "Only letters and spaces are allowed"),
    entity_type: z.string(),
    entity_address: z.string().min(5, "Address must be at least 5 characters"),
    entity_contact: z.string()
        .min(10, "Contact must be at least 10 digits")
        .regex(/^[0-9+\-\s]+$/, "Only numbers, +, -, and spaces are allowed"),
    entity_description: z.string().min(20, "Description must be at least 20 characters"),
    established_year: z.string().min(4, "Established year is required (4 digits)"),
    official_website: z.string().url("A valid official website URL is required"),
    scale: z.string().min(1, "Scale is required"),
    scheme_province: z.string().min(1, "Province selection is required"),
    scheme_cities: z.string().min(1, "At least one city must be selected"),
    scheme_department: z.string().min(3, "Supervising department is required"),
    scheme_scope: z.string().min(1, "Scope is required"),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

const AdminOnboardingPage = () => {
    const [searchParams] = useSearchParams();
    const adminId = searchParams.get('adminId');
    const navigate = useNavigate();
    const { toast } = useToast();
    
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [files, setFiles] = useState<FileList | null>(null);

    const form = useForm<OnboardingValues>({
        resolver: zodResolver(onboardingSchema),
        defaultValues: {
            entity_name: '',
            entity_type: searchParams.get('type') || 'university',
            entity_address: '',
            entity_contact: '',
            entity_description: '',
            established_year: '',
            official_website: '',
            scale: 'Medium',
            scheme_province: '',
            scheme_cities: '',
            scheme_department: '',
            scheme_scope: 'Province',
        }
    });

    const formData = form.watch();
    const pakistanStates = State.getStatesOfCountry('PK');

    const isSchemeFlow = formData.entity_type === 'scheme';

    const getEntityLabel = () => {
        if (formData.entity_type === 'university') return 'University';
        if (formData.entity_type === 'scheme') return 'Scheme Administration';
        if (formData.entity_type === 'hospital') return 'Hospital';
        return 'Institution';
    };

    const getDynamicLabel = (type: string) => {
        const labels: Record<string, any> = {
            university: { name: 'University Name', about: 'About the University', address: 'Campus Address' },
            scheme: { name: 'Head Office / Unit Name', about: 'Administration Overview', address: 'Office Address' },
            hospital: { name: 'Hospital Name', about: 'Medical Services Overview', address: 'Hospital Address' },
            default: { name: 'Institution Name', about: 'About the Institution', address: 'Office Address' }
        };
        return labels[formData.entity_type] || labels.default;
    };

    useEffect(() => {
        if (!adminId) {
            toast({
                variant: "destructive",
                title: "Invalid Access",
                description: "Please register first to continue onboarding.",
            });
            navigate('/admin/register');
        }
    }, [adminId, navigate, toast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(e.target.files);
        }
    };

    const nextStep = async () => {
        let fieldsToValidate: any[] = [];
        if (step === 1) {
            fieldsToValidate = ['entity_name'];
            if (isSchemeFlow) {
                fieldsToValidate.push('scheme_department');
            } else {
                fieldsToValidate.push('scale');
            }
        } else if (step === 2) {
            fieldsToValidate = ['entity_contact', 'official_website', 'entity_address', 'scheme_province'];
            if (isSchemeFlow) {
                fieldsToValidate.push('scheme_scope', 'scheme_cities');
            }
        } else if (step === 3) {
            fieldsToValidate = ['entity_description'];
            if (!isSchemeFlow) fieldsToValidate.push('established_year');
        } else if (step === 4) {
            // For Universities/Hospitals, validate documents
            if (!isSchemeFlow) {
                if (!files || files.length === 0) {
                    toast({
                        variant: "destructive",
                        title: "Documents Required",
                        description: "Please upload your verification documents before proceeding to review.",
                    });
                    return;
                }
                // No zod fields to validate on step 4, so we proceed if files exist
                setStep(prev => prev + 1);
                return;
            }
        }

        const isValid = await form.trigger(fieldsToValidate as any);
        if (isValid) setStep(prev => prev + 1);
        else {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Please fix the errors in this step before continuing.",
            });
        }
    };

    const prevStep = () => setStep(prev => prev - 1);

    const totalSteps = isSchemeFlow ? 4 : 5;
    
    const handleAddCity = (cityName: string) => {
        const currentCities = formData.scheme_cities ? formData.scheme_cities.split(", ").filter(Boolean) : [];
        if (!currentCities.includes(cityName)) {
            form.setValue('scheme_cities', [...currentCities, cityName].join(", "));
        }
    };

    const handleRemoveCity = (cityName: string) => {
        const currentCities = formData.scheme_cities ? formData.scheme_cities.split(", ").filter(Boolean) : [];
        form.setValue('scheme_cities', currentCities.filter(c => c !== cityName).join(", "));
    };

    const getCurrentStateCities = () => {
        const state = pakistanStates.find(s => s.name === formData.scheme_province);
        return state ? City.getCitiesOfState('PK', state.isoCode) : [];
    };

    const handleSubmit = async () => {
        if (!adminId) return;

        // Only validate fields relevant to the current flow
        const fieldsToValidate = [
            'entity_name', 
            'entity_address', 
            'entity_contact', 
            'entity_description', 
            'official_website', 
            'scheme_province'
        ];
        
        if (isSchemeFlow) {
            fieldsToValidate.push('scheme_department', 'scheme_scope', 'scheme_cities');
        } else {
            fieldsToValidate.push('scale', 'established_year');
        }

        const isValid = await form.trigger(fieldsToValidate as any);
        if (!isValid) {
            toast({
                variant: "destructive",
                title: "Incomplete Form",
                description: "Please review all steps and fix errors before submitting.",
            });
            return;
        }
        
        setIsSubmitting(true);
        const data = new FormData();
        
        // Append all form data
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value);
        });
        
        data.append('onboarding_step', step.toString());
        
        if (step === totalSteps) {
            data.append('is_onboarded', 'true');
        }

        // Append files
        if (!isSchemeFlow && files) {
            for (let i = 0; i < files.length; i++) {
                data.append('docs', files[i]);
            }
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/onboarding/${adminId}`, {
                method: "PUT",
                body: data,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to update onboarding info");
            }

            if (step < totalSteps) {
                nextStep();
            } else {
                toast({
                    title: "Application Submitted",
                    description: "Your institution profile is now under review by Super Admin.",
                });
                navigate('/admin/login');
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const steps = isSchemeFlow
        ? [
            { id: 1, title: 'Head Profile', icon: Building2 },
            { id: 2, title: 'Jurisdiction', icon: ShieldCheck },
            { id: 3, title: 'Admin Details', icon: Circle },
            { id: 4, title: 'Review', icon: CheckCircle2 },
        ]
        : [
            { id: 1, title: 'Identity', icon: Building2 },
            { id: 2, title: 'Contact', icon: ShieldCheck },
            { id: 3, title: 'Details', icon: Circle },
            { id: 4, title: 'Documents', icon: FileText },
            { id: 5, title: 'Review', icon: CheckCircle2 },
        ];

    const labels = getDynamicLabel(formData.entity_type);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 py-10 relative overflow-hidden">
            {/* Background orbs */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-600/8 rounded-full blur-[140px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-600/8 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

            {/* Brand bar */}
            <div className="relative z-10 flex items-center gap-3 mb-8">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                    <BrainCircuit className="w-4.5 h-4.5 text-blue-400" />
                </div>
                <div>
                    <div className="text-white font-black text-sm tracking-tight">AwamAssist</div>
                    <div className="text-[9px] font-black uppercase tracking-[0.22em] text-white/30">{getEntityLabel()} Onboarding</div>
                </div>
            </div>

            {/* Step tracker */}
            <div className="relative z-10 w-full max-w-2xl mb-8">
                <div className="flex justify-between items-center relative">
                    {/* connector line */}
                    <div className="absolute top-5 left-0 w-full h-px bg-white/10 -z-10" />
                    <div
                        className="absolute top-5 left-0 h-px bg-gradient-to-r from-blue-500 to-blue-400 -z-10 transition-all duration-500"
                        style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
                    />
                    {steps.map((s) => {
                        const done = step > s.id;
                        const active = step === s.id;
                        return (
                            <div key={s.id} className="flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border
                                    ${done ? 'bg-blue-500 border-blue-500 shadow-lg shadow-blue-500/30' :
                                      active ? 'bg-white/10 border-blue-400 shadow-lg shadow-blue-400/20' :
                                               'bg-white/5 border-white/10'}`}>
                                    {done
                                        ? <CheckCircle2 className="w-5 h-5 text-white" />
                                        : <s.icon className={`w-4 h-4 ${active ? 'text-blue-400' : 'text-white/25'}`} />
                                    }
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-wider ${done || active ? 'text-white/70' : 'text-white/25'}`}>
                                    {s.title}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main card */}
            <motion.div
                key={step}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 w-full max-w-2xl"
            >
                <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/40">
                    {/* Top accent bar */}
                    <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-emerald-400" />

                    {/* Header */}
                    <div className="px-8 pt-8 pb-6 border-b border-white/8">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/15 border border-blue-500/30 rounded-full">
                                <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em]">Step {step} of {totalSteps}</span>
                            </div>
                            <span className="text-[9px] font-black text-white/25 uppercase tracking-widest">{getEntityLabel()} Portal</span>
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight">
                            {step === 1 && (isSchemeFlow ? 'Register Scheme Head Office' : `Register Your ${getEntityLabel()}`)}
                            {step === 2 && (isSchemeFlow ? 'Province Jurisdiction' : 'Communication Channels')}
                            {step === 3 && (isSchemeFlow ? 'Administration Profile' : 'Institutional Profile')}
                            {step === 4 && (isSchemeFlow ? 'Final Authorization' : 'Verification Documents')}
                            {step === 5 && 'Final Authorization'}
                        </h2>
                        <p className="text-sm font-medium text-white/40 mt-1.5">
                            {step === 1 && (isSchemeFlow ? 'Register the province/city scheme administration office (not individual schemes).' : `Start by providing the official name of your ${getEntityLabel().toLowerCase()}.`)}
                            {step === 2 && (isSchemeFlow ? 'Define which province/cities this head can manage.' : 'How can citizens and administrators reach your entity?')}
                            {step === 3 && (isSchemeFlow ? 'Add governance details. After approval, this head can add unlimited schemes later.' : 'Help us understand the scale and history of your operations.')}
                            {step === 4 && (isSchemeFlow ? 'Verify all information before final submission to the registry.' : 'Upload legal documentation to verify your institutional status.')}
                            {step === 5 && 'Verify all information before final submission to the registry.'}
                        </p>
                    </div>

                    {/* Form body */}
                    <div className="px-8 py-7 space-y-5">
                        {/* shared styled classes */}
                        {(() => {
                            const ic = "h-13 bg-white/[0.05] border-white/10 text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-white/25 focus-visible:border-white/25 rounded-xl font-medium transition-all";
                            const lc = "text-[10px] font-black uppercase tracking-[0.18em] text-white/40 block mb-2";
                            const ec = "text-rose-400 text-[10px] font-bold uppercase tracking-wide mt-1.5";
                            const selTrigger = "h-13 bg-white/[0.05] border-white/10 text-white rounded-xl font-medium focus:ring-white/25";

                            return (
                                <>
                                    {/* â”€â”€ STEP 1 â”€â”€ */}
                                    {step === 1 && (
                                        <div className="space-y-5">
                                            <div>
                                                <label htmlFor="entity_name" className={lc}>{labels.name}</label>
                                                <Input id="entity_name" {...form.register("entity_name")}
                                                    onChange={(e) => { const f = e.target.value.replace(/[^a-zA-Z\s]/g,""); form.setValue("entity_name", f); }}
                                                    placeholder={`Full legal name of the ${getEntityLabel().toLowerCase()}`}
                                                    className={ic} />
                                                {form.formState.errors.entity_name && <p className={ec}>{form.formState.errors.entity_name.message}</p>}
                                            </div>
                                            <div>
                                                {isSchemeFlow ? (
                                                    <>
                                                        <label htmlFor="scheme_department" className={lc}>Supervising Department</label>
                                                        <Input id="scheme_department" {...form.register("scheme_department")}
                                                            onChange={(e) => { const f = e.target.value.replace(/[^a-zA-Z\s]/g,""); form.setValue("scheme_department", f); }}
                                                            placeholder="e.g. Social Welfare Dept Punjab" className={ic} />
                                                        {form.formState.errors.scheme_department && <p className={ec}>{form.formState.errors.scheme_department.message}</p>}
                                                    </>
                                                ) : (
                                                    <>
                                                        <label htmlFor="scale" className={lc}>Operational Scale</label>
                                                        <select id="scale" {...form.register("scale")}
                                                            className="flex h-[52px] w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-white/25 transition-all">
                                                            <option value="Small" className="bg-slate-800">Small (Local Coverage)</option>
                                                            <option value="Medium" className="bg-slate-800">Medium (Regional / City Level)</option>
                                                            <option value="Large" className="bg-slate-800">Large (Provincial / National)</option>
                                                        </select>
                                                        {form.formState.errors.scale && <p className={ec}>{form.formState.errors.scale.message}</p>}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* â”€â”€ STEP 2 â”€â”€ */}
                                    {step === 2 && (
                                        <div className="space-y-5">
                                            <div>
                                                <label htmlFor="entity_contact" className={lc}>Official Contact</label>
                                                <Input id="entity_contact" {...form.register("entity_contact")}
                                                    onChange={(e) => { const f = e.target.value.replace(/[^0-9+\-\s]/g,""); form.setValue("entity_contact", f); }}
                                                    placeholder="+92 XXX XXXXXXX" className={ic} />
                                                {form.formState.errors.entity_contact && <p className={ec}>{form.formState.errors.entity_contact.message}</p>}
                                            </div>
                                            <div>
                                                <label htmlFor="official_website" className={lc}>Website URL</label>
                                                <Input id="official_website" {...form.register("official_website")} placeholder="https://www.example.com" className={ic} />
                                                {form.formState.errors.official_website && <p className={ec}>{form.formState.errors.official_website.message}</p>}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className={lc}>Province</label>
                                                    <Select value={formData.scheme_province} onValueChange={(v) => { form.setValue('scheme_province', v); if (isSchemeFlow) form.setValue('scheme_cities', ""); else form.setValue('entity_address', v); }}>
                                                        <SelectTrigger className={selTrigger}><SelectValue placeholder="Select Province" /></SelectTrigger>
                                                        <SelectContent className="bg-slate-800 border-white/10 text-white">
                                                            {pakistanStates.map(state => (<SelectItem key={state.isoCode} value={state.name} className="focus:bg-white/10">{state.name}</SelectItem>))}
                                                        </SelectContent>
                                                    </Select>
                                                    {form.formState.errors.scheme_province && <p className={ec}>{form.formState.errors.scheme_province.message}</p>}
                                                </div>
                                                {!isSchemeFlow ? (
                                                    <div>
                                                        <label className={lc}>City</label>
                                                        <Select disabled={!formData.scheme_province} value={formData.entity_address && formData.entity_address.includes(',') ? formData.entity_address.split(',')[0] : ""} onValueChange={(v) => form.setValue('entity_address', `${v}, ${formData.scheme_province}`)}>
                                                            <SelectTrigger className={selTrigger}><SelectValue placeholder={formData.scheme_province ? "Select City" : "Select Province first"} /></SelectTrigger>
                                                            <SelectContent className="max-h-[200px] bg-slate-800 border-white/10 text-white">
                                                                {getCurrentStateCities().length > 0 ? getCurrentStateCities().map(city => (<SelectItem key={city.name} value={city.name} className="focus:bg-white/10">{city.name}</SelectItem>)) : (<div className="p-2 text-xs text-white/40">No cities found</div>)}
                                                            </SelectContent>
                                                        </Select>
                                                        {form.formState.errors.entity_address && <p className={ec}>{form.formState.errors.entity_address.message}</p>}
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <label htmlFor="scheme_scope" className={lc}>Coverage Scope</label>
                                                        <select id="scheme_scope" {...form.register("scheme_scope")}
                                                            className="flex h-[52px] w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-white/25">
                                                            <option value="Province" className="bg-slate-800">Province-wide</option>
                                                            <option value="City" className="bg-slate-800">City-specific</option>
                                                            <option value="District" className="bg-slate-800">District-specific</option>
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                            {isSchemeFlow && (
                                                <div>
                                                    <label className={lc}>Covered Cities</label>
                                                    <div className="flex flex-wrap gap-2 mb-2 p-3 border border-white/10 rounded-xl bg-white/[0.03] min-h-[52px]">
                                                        {formData.scheme_cities ? formData.scheme_cities.split(", ").map(city => (
                                                            <Badge key={city} className="flex items-center gap-1 bg-white/10 border border-white/15 text-white/70 hover:bg-white/15">
                                                                {city}<X className="h-3 w-3 cursor-pointer hover:text-rose-400" onClick={() => handleRemoveCity(city)} />
                                                            </Badge>
                                                        )) : (<span className="text-xs text-white/25 py-1">No cities selected</span>)}
                                                    </div>
                                                    <Select onValueChange={handleAddCity}>
                                                        <SelectTrigger className={selTrigger}><SelectValue placeholder="Add a city..." /></SelectTrigger>
                                                        <SelectContent className="max-h-[200px] bg-slate-800 border-white/10 text-white">
                                                            {getCurrentStateCities().map(city => (<SelectItem key={city.name} value={city.name} className="focus:bg-white/10">{city.name}</SelectItem>))}
                                                        </SelectContent>
                                                    </Select>
                                                    {form.formState.errors.scheme_cities && <p className={ec}>{form.formState.errors.scheme_cities.message}</p>}
                                                </div>
                                            )}
                                            {isSchemeFlow && (
                                                <div>
                                                    <label htmlFor="entity_address" className={lc}>Head Office Address</label>
                                                    <Input id="entity_address" {...form.register("entity_address")} placeholder="Office street, building, area" className={ic} />
                                                    {form.formState.errors.entity_address && <p className={ec}>{form.formState.errors.entity_address.message}</p>}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* â”€â”€ STEP 3 â”€â”€ */}
                                    {step === 3 && (
                                        <div className="space-y-5">
                                            {!isSchemeFlow && (
                                                <div>
                                                    <label htmlFor="established_year" className={lc}>Year Established</label>
                                                    <Input id="established_year" {...form.register("established_year")} placeholder="e.g. 1995" type="number" className={`${ic} w-1/2`} />
                                                    {form.formState.errors.established_year && <p className={ec}>{form.formState.errors.established_year.message}</p>}
                                                </div>
                                            )}
                                            <div>
                                                <label htmlFor="entity_description" className={lc}>{labels.about}</label>
                                                <Textarea id="entity_description" {...form.register("entity_description")}
                                                    placeholder={`Briefly explain the purpose and services of your ${getEntityLabel().toLowerCase()}...`}
                                                    rows={5}
                                                    className="bg-white/[0.05] border-white/10 text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-white/25 rounded-xl font-medium transition-all resize-none" />
                                                {form.formState.errors.entity_description && <p className={ec}>{form.formState.errors.entity_description.message}</p>}
                                            </div>
                                        </div>
                                    )}

                                    {/* â”€â”€ STEP 4 â€” Documents (non-scheme) â”€â”€ */}
                                    {step === 4 && !isSchemeFlow && (
                                        <div className="space-y-5">
                                            <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 text-center hover:border-blue-400/40 hover:bg-white/[0.03] transition-all cursor-pointer relative group">
                                                <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
                                                <div className="w-16 h-16 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500/15 group-hover:border-blue-400/30 transition-all">
                                                    <Upload className="w-7 h-7 text-white/30 group-hover:text-blue-400" />
                                                </div>
                                                <h3 className="text-lg font-black text-white">Official Certification</h3>
                                                <p className="text-white/40 text-sm mt-1.5 max-w-sm mx-auto">Upload registration documents, NOCs, or operational licenses for verification.</p>
                                                <div className="mt-4 flex justify-center gap-3">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/25 px-3 py-1 bg-white/5 border border-white/10 rounded-full">PDF</span>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/25 px-3 py-1 bg-white/5 border border-white/10 rounded-full">JPG / PNG</span>
                                                </div>
                                            </div>
                                            {files && files.length > 0 && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {Array.from(files).map((f, i) => (
                                                        <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.04] border border-white/10 rounded-xl">
                                                            <div className="bg-blue-500/15 border border-blue-400/20 p-2 rounded-lg">
                                                                <FileText className="w-4 h-4 text-blue-400" />
                                                            </div>
                                                            <div className="overflow-hidden">
                                                                <p className="text-xs font-bold text-white/80 truncate">{f.name}</p>
                                                                <p className="text-[10px] text-white/30 font-bold uppercase">{(f.size/1024/1024).toFixed(2)} MB</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* â”€â”€ REVIEW STEP â”€â”€ */}
                                    {((isSchemeFlow && step === 4) || (!isSchemeFlow && step === 5)) && (
                                        <div className="space-y-5">
                                            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 space-y-6">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-1">Entity Name</span>
                                                        <h4 className="text-xl font-black text-white tracking-tight">{formData.entity_name}</h4>
                                                    </div>
                                                    <span className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-[10px] font-black text-blue-300 uppercase tracking-wider">{formData.entity_type}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-5 border-t border-white/8 pt-5">
                                                    {[
                                                        { label: 'Operational Area', value: formData.entity_address },
                                                        { label: 'Contact Node', value: formData.entity_contact },
                                                        { label: isSchemeFlow ? 'Department' : 'Scale', value: isSchemeFlow ? (formData.scheme_department || 'N/A') : formData.scale },
                                                        { label: isSchemeFlow ? 'Province' : 'Established', value: isSchemeFlow ? (formData.scheme_province || 'N/A') : formData.established_year },
                                                    ].map(({ label, value }) => (
                                                        <div key={label}>
                                                            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-1">{label}</span>
                                                            <p className="text-sm font-bold text-white/70">{value}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                {!isSchemeFlow && (
                                                    <div className="border-t border-white/8 pt-4">
                                                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-2">Attached Proofs</span>
                                                        <div className="flex flex-wrap gap-2">
                                                            {files && files.length > 0 ? Array.from(files).map((f, i) => (
                                                                <span key={i} className="text-[9px] font-black uppercase px-2.5 py-1 bg-white/[0.06] border border-white/10 rounded-full text-white/40">{f.name.split('.').pop()} FILE</span>
                                                            )) : <span className="text-xs text-white/25">No documents attached.</span>}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="bg-blue-500/10 border border-blue-400/20 rounded-2xl p-5 flex gap-4">
                                                <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-black text-white/80">{isSchemeFlow ? 'Scheme Head Authorization' : 'Registry Agreement'}</p>
                                                    <p className="text-xs text-white/40 leading-relaxed mt-1">
                                                        {isSchemeFlow
                                                            ? 'You are registering management authority for a jurisdiction. Schemes will be added after approval from your admin dashboard.'
                                                            : 'By submitting, you certify that all information is accurate. False claims may lead to permanent suspension and legal oversight.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>

                    {/* Footer nav */}
                    <div className="flex justify-between items-center border-t border-white/8 px-8 py-6">
                        <button
                            type="button"
                            onClick={step > 1 ? prevStep : () => navigate('/admin/register')}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 h-11 px-6 rounded-xl bg-white/[0.05] border border-white/10
                                hover:bg-white/[0.09] hover:border-white/20 text-white/60 hover:text-white/90
                                text-sm font-black transition-all disabled:opacity-40"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                        <button
                            type="button"
                            onClick={step === totalSteps ? handleSubmit : nextStep}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 h-11 px-8 rounded-xl
                                bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400
                                text-white text-sm font-black shadow-lg shadow-blue-500/20
                                transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                {isSubmitting ? (
                                    <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Syncing...
                                    </motion.span>
                                ) : (
                                    <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                                        {step === totalSteps ? 'Authorize & Submit' : 'Continue'}
                                        <ArrowRight className="w-4 h-4" />
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>
                </div>

                {/* AI badge */}
                <div className="flex items-center justify-center gap-2 mt-6">
                    <Sparkles className="w-3.5 h-3.5 text-white/20" />
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                        Powered by AwamAssist Intelligence Engine v3.5
                    </span>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminOnboardingPage;

