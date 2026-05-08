import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Circle, FileText, Building2, ShieldCheck, Upload, X } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { State, City } from 'country-state-city';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 py-12">
            <div className="w-full max-w-3xl mb-8">
                <div className="flex justify-between items-center relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 transform -translate-y-1/2"></div>
                    {steps.map((s) => (
                        <div key={s.id} className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                step >= s.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 scale-110' : 'bg-white text-slate-400 border-2 border-slate-200'
                            }`}>
                                {step > s.id ? <CheckCircle2 className="w-6 h-6" /> : <s.icon className="w-5 h-5" />}
                            </div>
                            <span className={`text-[10px] mt-2 font-bold uppercase tracking-wider ${step >= s.id ? 'text-primary-600' : 'text-slate-400'}`}>
                                {s.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <Card className="w-full max-w-3xl shadow-2xl border-none rounded-3xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary-500 to-indigo-600" />
                <CardHeader className="p-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="text-primary-600 border-primary-200 font-bold uppercase tracking-widest text-[10px] px-3 py-1">
                            Step {step} of {totalSteps}
                        </Badge>
                        <span className="text-slate-300">|</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{getEntityLabel()} Portal</span>
                    </div>
                    <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">
                        {step === 1 && (isSchemeFlow ? 'Register Scheme Head Office' : `Register Your ${getEntityLabel()}`)}
                        {step === 2 && (isSchemeFlow ? 'Province Jurisdiction' : 'Communication Channels')}
                        {step === 3 && (isSchemeFlow ? 'Administration Profile' : 'Institutional Profile')}
                        {step === 4 && (isSchemeFlow ? 'Final Authorization' : 'Verification Documents')}
                        {step === 5 && 'Final Authorization'}
                    </CardTitle>
                    <CardDescription className="text-slate-500 font-medium">
                        {step === 1 && (isSchemeFlow
                            ? 'Register the province/city scheme administration office (not individual schemes).'
                            : `Start by providing the official name of your ${getEntityLabel().toLowerCase()}.`)}
                        {step === 2 && (isSchemeFlow
                            ? 'Define which province/cities this head can manage.'
                            : 'How can citizens and administrators reach your entity?')}
                        {step === 3 && (isSchemeFlow
                            ? 'Add governance details. After approval, this head can add unlimited schemes later.'
                            : 'Help us understand the scale and history of your operations.')}
                        {step === 4 && (isSchemeFlow
                            ? 'Verify all information before final submission to the registry.'
                            : 'Upload legal documentation to verify your institutional status.')}
                        {step === 5 && 'Verify all information before final submission to the registry.'}
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-8 pb-8 space-y-6">
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-2">
                                <Label htmlFor="entity_name" className="text-xs font-bold uppercase tracking-widest text-slate-500 pl-1">{labels.name}</Label>
                                    <Input 
                                        id="entity_name" 
                                        {...form.register("entity_name")}
                                        onChange={(e) => {
                                            const filtered = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                                            form.setValue("entity_name", filtered);
                                        }}
                                        placeholder={`Full legal name of the ${getEntityLabel().toLowerCase()}`}
                                        className="h-14 rounded-xl border-slate-100 bg-slate-50 focus:ring-primary-500 font-semibold"
                                    />
                                    {form.formState.errors.entity_name && (
                                        <p className="text-red-500 text-[10px] font-bold mt-1 pl-1 uppercase">{form.formState.errors.entity_name.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {isSchemeFlow ? (
                                        <>
                                            <Label htmlFor="scheme_department" className="text-xs font-bold uppercase tracking-widest text-slate-500 pl-1">Supervising Department</Label>
                                            <Input
                                                id="scheme_department"
                                                {...form.register("scheme_department")}
                                                onChange={(e) => {
                                                    const filtered = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                                                    form.setValue("scheme_department", filtered);
                                                }}
                                                placeholder="e.g. Social Welfare Dept Punjab"
                                                className="h-14 rounded-xl border-slate-100 bg-slate-50 font-semibold"
                                            />
                                            {form.formState.errors.scheme_department && (
                                                <p className="text-red-500 text-[10px] font-bold mt-1 pl-1 uppercase">{form.formState.errors.scheme_department.message}</p>
                                            )}
                                        </>
                                ) : (
                                    <>
                                        <Label htmlFor="scale" className="text-xs font-bold uppercase tracking-widest text-slate-500 pl-1">Operational Scale</Label>
                                            <select 
                                                id="scale" 
                                                {...form.register("scale")}
                                                className="flex h-14 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            >
                                            <option value="Small">Small (Local Coverage)</option>
                                            <option value="Medium">Medium (Regional / City Level)</option>
                                            <option value="Large">Large (Provincial / National)</option>
                                        </select>
                                        {form.formState.errors.scale && (
                                            <p className="text-red-500 text-[10px] font-bold mt-1 pl-1 uppercase">{form.formState.errors.scale.message}</p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-2">
                                <Label htmlFor="entity_contact" className="text-xs font-bold uppercase tracking-widest text-slate-500 pl-1">Official Contact</Label>
                                <Input 
                                    id="entity_contact" 
                                    {...form.register("entity_contact")}
                                    onChange={(e) => {
                                        const filtered = e.target.value.replace(/[^0-9+\-\s]/g, "");
                                        form.setValue("entity_contact", filtered);
                                    }}
                                    placeholder="+92 XXX XXXXXXX"
                                    className="h-14 rounded-xl border-slate-100 bg-slate-50 font-semibold"
                                />
                                {form.formState.errors.entity_contact && (
                                    <p className="text-red-500 text-[10px] font-bold mt-1 pl-1 uppercase">{form.formState.errors.entity_contact.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="official_website" className="text-xs font-bold uppercase tracking-widest text-slate-500 pl-1">Website URL</Label>
                                <Input 
                                    id="official_website" 
                                    {...form.register("official_website")}
                                    placeholder="https://www.example.com"
                                    className="h-14 rounded-xl border-slate-100 bg-slate-50 font-semibold"
                                />
                                {form.formState.errors.official_website && (
                                    <p className="text-red-500 text-[10px] font-bold mt-1 pl-1 uppercase">{form.formState.errors.official_website.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 pl-1">Province</Label>
                                    <Select 
                                        value={formData.scheme_province} 
                                        onValueChange={(v) => {
                                            form.setValue('scheme_province', v);
                                            if (isSchemeFlow) form.setValue('scheme_cities', "");
                                            else form.setValue('entity_address', v);
                                        }}
                                    >
                                        <SelectTrigger className="h-14 rounded-xl border-slate-100 bg-slate-50 font-semibold">
                                            <SelectValue placeholder="Select Province" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pakistanStates.map(state => (
                                                <SelectItem key={state.isoCode} value={state.name}>
                                                    {state.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {form.formState.errors.scheme_province && (
                                        <p className="text-red-500 text-[10px] font-bold mt-1 pl-1 uppercase">{form.formState.errors.scheme_province.message}</p>
                                    )}
                                </div>

                                {!isSchemeFlow ? (
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 pl-1">City</Label>
                                                <Select 
                                                    disabled={!formData.scheme_province}
                                                    value={formData.entity_address && formData.entity_address.includes(',') ? formData.entity_address.split(',')[0] : ""} 
                                                    onValueChange={(v) => form.setValue('entity_address', `${v}, ${formData.scheme_province}`)}
                                                >
                                                    <SelectTrigger className="h-14 rounded-xl border-slate-100 bg-slate-50 font-semibold">
                                                        <SelectValue placeholder={formData.scheme_province ? "Select City" : "Select Province first"} />
                                                    </SelectTrigger>
                                                    <SelectContent className="max-h-[200px] bg-white z-[9999]">
                                                        {getCurrentStateCities().length > 0 ? getCurrentStateCities().map(city => (
                                                            <SelectItem key={city.name} value={city.name}>
                                                                {city.name}
                                                            </SelectItem>
                                                        )) : (
                                                            <div className="p-2 text-xs text-slate-500">No cities found</div>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                {form.formState.errors.entity_address && (
                                                    <p className="text-red-500 text-[10px] font-bold mt-1 pl-1 uppercase">{form.formState.errors.entity_address.message}</p>
                                                )}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label htmlFor="scheme_scope" className="text-xs font-bold uppercase tracking-widest text-slate-500 pl-1">Coverage Scope</Label>
                                        <select
                                            id="scheme_scope"
                                            {...form.register("scheme_scope")}
                                            className="flex h-14 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="Province">Province-wide</option>
                                            <option value="City">City-specific</option>
                                            <option value="District">District-specific</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            {isSchemeFlow && (
                                <div className="space-y-2">
                                    <Label htmlFor="scheme_cities" className="text-xs font-bold uppercase tracking-widest text-slate-500 pl-1">Covered Cities</Label>
                                    <div className="flex flex-wrap gap-2 mb-2 p-3 border border-slate-100 rounded-xl bg-slate-50 min-h-[56px]">
                                        {formData.scheme_cities ? formData.scheme_cities.split(", ").map(city => (
                                            <Badge key={city} className="flex items-center gap-1 bg-white border text-slate-700 hover:bg-slate-50">
                                                {city}
                                                <X 
                                                    className="h-3 w-3 cursor-pointer hover:text-red-500" 
                                                    onClick={() => handleRemoveCity(city)}
                                                />
                                            </Badge>
                                        )) : (
                                            <span className="text-xs text-slate-400 py-1">No cities selected</span>
                                        )}
                                    </div>
                                    <Select onValueChange={handleAddCity}>
                                        <SelectTrigger className="h-14 rounded-xl border-slate-100 bg-white font-semibold">
                                            <SelectValue placeholder="Add a city..." />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[200px]">
                                            {getCurrentStateCities().map(city => (
                                                <SelectItem key={city.name} value={city.name}>
                                                    {city.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {form.formState.errors.scheme_cities && (
                                        <p className="text-red-500 text-[10px] font-bold mt-1 pl-1 uppercase">{form.formState.errors.scheme_cities.message}</p>
                                    )}
                                </div>
                            )}

                            {isSchemeFlow && (
                                <div className="space-y-2">
                                    <Label htmlFor="entity_address" className="text-xs font-bold uppercase tracking-widest text-slate-500 pl-1">Head Office Address</Label>
                                    <Input 
                                        id="entity_address" 
                                        {...form.register("entity_address")}
                                        placeholder="Office street, building, area"
                                        className="h-14 rounded-xl border-slate-100 bg-slate-50 font-semibold"
                                    />
                                    {form.formState.errors.entity_address && (
                                        <p className="text-red-500 text-[10px] font-bold mt-1 pl-1 uppercase">{form.formState.errors.entity_address.message}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            {!isSchemeFlow && (
                                <div className="space-y-2">
                                    <Label htmlFor="established_year" className="text-xs font-bold uppercase tracking-widest text-slate-500 pl-1">Year Established</Label>
                                    <Input 
                                        id="established_year" 
                                        {...form.register("established_year")}
                                        placeholder="e.g. 1995"
                                        type="number"
                                        className="h-14 rounded-xl border-slate-100 bg-slate-50 font-semibold w-1/2"
                                    />
                                    {form.formState.errors.established_year && (
                                        <p className="text-red-500 text-[10px] font-bold mt-1 pl-1 uppercase">{form.formState.errors.established_year.message}</p>
                                    )}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="entity_description" className="text-xs font-bold uppercase tracking-widest text-slate-500 pl-1">{labels.about}</Label>
                                <Textarea 
                                    id="entity_description" 
                                    {...form.register("entity_description")}
                                    placeholder={`Briefly explain the purpose and services of your ${getEntityLabel().toLowerCase()}...`}
                                    rows={5}
                                    className="rounded-xl border-slate-100 bg-slate-50 font-semibold focus:ring-primary-500"
                                />
                                {form.formState.errors.entity_description && (
                                    <p className="text-red-500 text-[10px] font-bold mt-1 pl-1 uppercase">{form.formState.errors.entity_description.message}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 4 && !isSchemeFlow && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center hover:border-primary-400 hover:bg-slate-50 transition-all cursor-pointer relative group">
                                <input 
                                    type="file" 
                                    multiple 
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    onChange={handleFileChange}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                />
                                <div className="bg-slate-100 h-20 w-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-primary-50 transition-all duration-300">
                                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-primary-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Official Certification</h3>
                                <p className="text-slate-500 mt-2 max-w-sm mx-auto">Upload registration documents, NOCs, or operational licenses for verification.</p>
                                <div className="mt-6 flex justify-center gap-4">
                                    <Badge variant="secondary" className="rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100">PDF</Badge>
                                    <Badge variant="secondary" className="rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100">JPG / PNG</Badge>
                                </div>
                            </div>

                            {files && files.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                    {Array.from(files).map((f, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                            <div className="bg-primary-50 p-2 rounded-lg">
                                                <FileText className="w-4 h-4 text-primary-500" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-xs font-bold text-slate-700 truncate">{f.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {((isSchemeFlow && step === 4) || (!isSchemeFlow && step === 5)) && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 space-y-8">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Entity Name</span>
                                        <h4 className="text-xl font-black text-slate-900 tracking-tight">{formData.entity_name}</h4>
                                    </div>
                                    <Badge className="bg-primary-600 text-white font-black px-4 py-1 uppercase tracking-tighter text-[10px]">
                                        {formData.entity_type}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-8 border-t border-slate-200 pt-8">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Operational Area</span>
                                        <p className="text-sm font-bold text-slate-700">{formData.entity_address}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Contact Node</span>
                                        <p className="text-sm font-bold text-slate-700">{formData.entity_contact}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                                            {isSchemeFlow ? "Department" : "Scale"}
                                        </span>
                                        <p className="text-sm font-bold text-slate-700">
                                            {isSchemeFlow ? (formData.scheme_department || "N/A") : formData.scale}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                                            {isSchemeFlow ? "Province" : "Established"}
                                        </span>
                                        <p className="text-sm font-bold text-slate-700">
                                            {isSchemeFlow ? (formData.scheme_province || "N/A") : formData.established_year}
                                        </p>
                                    </div>
                                </div>

                                {!isSchemeFlow && (
                                    <div className="bg-white rounded-2xl p-4 border border-slate-100">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Attached Proofs</span>
                                        <div className="flex flex-wrap gap-2">
                                            {files && files.length > 0 ? Array.from(files).map((f, i) => (
                                                <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-600 font-bold text-[9px] uppercase">
                                                    {f.name.split('.').pop()} FILE
                                                </Badge>
                                            )) : <span className="text-xs text-slate-400">No documents attached.</span>}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="bg-primary-50 rounded-2xl p-5 border border-primary-100">
                                <div className="flex gap-4">
                                    <ShieldCheck className="w-6 h-6 text-primary-600 shrink-0" />
                                    <div>
                                        <p className="text-sm text-primary-900 font-bold">
                                            {isSchemeFlow ? "Scheme Head Authorization" : "Registry Agreement"}
                                        </p>
                                        <p className="text-xs text-primary-700 leading-relaxed mt-1">
                                            {isSchemeFlow
                                                ? "You are registering management authority for a jurisdiction. Schemes will be added after approval from your admin dashboard."
                                                : "By submitting, you certify that all information is accurate. False claims may lead to permanent suspension and legal oversight."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex justify-between border-t border-slate-100 p-8 pt-6">
                    <Button 
                        variant="outline" 
                        onClick={step > 1 ? prevStep : () => navigate('/admin/register')} 
                        disabled={isSubmitting}
                        className="h-12 px-8 rounded-xl border-slate-200 text-slate-600 font-bold"
                    >
                        Back
                    </Button>
                    <Button 
                        className="ml-auto h-12 px-10 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-200" 
                        onClick={step === totalSteps ? handleSubmit : nextStep}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <Circle className="w-4 h-4 animate-pulse fill-white" />
                                Syncing...
                            </span>
                        ) : step === totalSteps ? 'Authorize & Submit' : 'Continue'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default AdminOnboardingPage;
