import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { schemeAdminAPI } from "@/services/schemeAPI";

const schemeSchema = z.object({
    schemeId: z.string().min(1, "Scheme ID is required"),
    schemeName: z.string()
        .min(3, "Scheme Name must be at least 3 characters")
        .regex(/^[a-zA-Z\s]+$/, "Scheme Name can only contain letters and spaces"),
    shortName: z.string()
        .min(2, "Short Name must be at least 2 characters")
        .regex(/^[a-zA-Z\s]+$/, "Short Name can only contain letters and spaces"),
    category: z.string().min(1, "Category is required"),
    department: z.string()
        .min(1, "Department is required")
        .regex(/^[a-zA-Z\s]+$/, "Department can only contain letters and spaces"),
    province: z.string().min(1, "Province is required"),
    description: z.string().min(10, "Short description must be at least 10 characters"),
    longDescription: z.string().optional().refine(
        (val) => !val || val.trim().split(/\s+/).filter(word => word.length > 0).length >= 50,
        "Long description must be at least 50 words"
    ),
    status: z.string().default("Active"),
    benefits: z.object({
        financial: z.object({
            amount: z.coerce.number().min(0, "Amount must be positive"),
            frequency: z.string().min(1, "Frequency is required"),
            currency: z.string().default("PKR"),
        }),
        nonFinancial: z.array(z.string()).default([]),
        duration: z.string().optional(),
    }),
    eligibility: z.object({
        income: z.object({
            min: z.coerce.number().min(0, "Minimum income must be at least 0"),
            max: z.coerce.number().min(0, "Maximum income must be at least 0"),
        }),
        age: z.object({
            min: z.coerce.number().min(0, "Minimum age must be at least 0"),
            max: z.coerce.number().min(0, "Maximum age must be at least 0"),
        }),
        categories: z.array(z.string()).default([]),
        employmentStatus: z.array(z.string()).default([]),
    }),
    application: z.object({
        method: z.string()
            .min(1, "Application method is required")
            .regex(/^[a-zA-Z\s]+$/, "Application method can only contain letters and spaces"),
        website: z.string().url("A valid application website URL is required"),
        steps: z.array(z.string()).default([]),
        requiredDocuments: z.array(z.string()).default([]),
        processingTime: z.string().optional(),
        isOpen: z.boolean().default(true),
    }),
    contact: z.object({
        helpline: z.string().optional().refine(
            (val) => !val || /^[0-9+\-\s]*$/.test(val),
            "Helpline can only contain numbers, +, -, and spaces"
        ),
        email: z.string().email("Invalid email").optional().or(z.literal("")),
        offices: z.array(z.string()).default([]),
        website: z.string().optional(),
    }),
});

type SchemeFormValues = z.infer<typeof schemeSchema>;

interface SchemeFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    scheme?: any;
}

const generateSchemeId = () => {
    return `PKS${Math.floor(100 + Math.random() * 900)}`;
};

const SchemeForm = ({ isOpen, onClose, onSuccess, scheme }: SchemeFormProps) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const form = useForm<SchemeFormValues>({
        resolver: zodResolver(schemeSchema),
        defaultValues: {
            schemeId: "",
            schemeName: "",
            shortName: "",
            category: "",
            department: "",
            province: "",
            description: "",
            longDescription: "",
            status: "Active",
            benefits: {
                financial: {
                    amount: 0,
                    frequency: "One-time",
                    currency: "PKR"
                },
                nonFinancial: [],
                duration: ""
            },
            eligibility: {
                income: { min: 0, max: 100000 },
                age: { min: 18, max: 100 },
                categories: [],
                employmentStatus: []
            },
            application: {
                method: "Online",
                website: "",
                steps: [],
                requiredDocuments: [],
                processingTime: "",
                isOpen: true
            },
            contact: {
                helpline: "",
                email: "",
                offices: [],
                website: ""
            }
        },
    });

    useEffect(() => {
        if (scheme && isOpen) {
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
                    financial: {
                        amount: scheme.benefits?.financial?.amount || 0,
                        frequency: scheme.benefits?.financial?.frequency || "One-time",
                        currency: "PKR"
                    },
                    nonFinancial: scheme.benefits?.nonFinancial || [],
                    duration: scheme.benefits?.duration || ""
                },
                eligibility: {
                    income: {
                        min: scheme.eligibility?.income?.min || 0,
                        max: scheme.eligibility?.income?.max || 100000
                    },
                    age: {
                        min: scheme.eligibility?.age?.min || 18,
                        max: scheme.eligibility?.age?.max || 100
                    },
                    categories: scheme.eligibility?.categories || [],
                    employmentStatus: scheme.eligibility?.employmentStatus || []
                },
                application: {
                    method: scheme.application?.method || "Online",
                    website: scheme.application?.website || "",
                    steps: scheme.application?.steps || [],
                    requiredDocuments: scheme.application?.requiredDocuments || [],
                    processingTime: scheme.application?.processingTime || "",
                    isOpen: scheme.application?.isOpen !== false
                },
                contact: {
                    helpline: scheme.contact?.helpline?.[0] || "",
                    email: scheme.contact?.email?.[0] || "",
                    offices: scheme.contact?.offices || [],
                    website: scheme.contact?.website || ""
                }
            });
        } else if (!scheme && isOpen) {
            form.reset({
                schemeId: generateSchemeId(),
                schemeName: "",
                shortName: "",
                category: "",
                department: "",
                province: "Federal",
                description: "",
                longDescription: "",
                status: "Active",
                benefits: {
                    financial: { amount: 0, frequency: "One-time", currency: "PKR" },
                    nonFinancial: [],
                    duration: ""
                },
                eligibility: {
                    income: { min: 0, max: 100000 },
                    age: { min: 18, max: 100 },
                    categories: [],
                    employmentStatus: []
                },
                application: {
                    method: "Online",
                    website: "",
                    steps: [],
                    requiredDocuments: [],
                    processingTime: "",
                    isOpen: true
                },
                contact: { helpline: "", email: "", offices: [], website: "" }
            });
        }
    }, [scheme, isOpen, form]);

    const onSubmit = async (values: SchemeFormValues) => {
        setLoading(true);

        // Convert contact fields back to arrays for API
        const formattedData = {
            ...values,
            contact: {
                ...values.contact,
                helpline: values.contact.helpline ? [values.contact.helpline] : [],
                email: values.contact.email ? [values.contact.email] : []
            }
        };

        try {
            if (scheme) {
                await schemeAdminAPI.updateScheme(scheme._id, formattedData);
                toast({
                    title: "Success",
                    description: "Scheme updated successfully",
                });
            } else {
                await schemeAdminAPI.createScheme(formattedData);
                toast({
                    title: "Success",
                    description: "Scheme created successfully",
                });
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Form submission error:", error);
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to save scheme",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                        {scheme ? "Edit Scheme" : "Add New Scheme"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="schemeId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Scheme ID *</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    {...field} 
                                                    disabled={true} 
                                                    placeholder="PKS001" 
                                                    className="bg-gray-100 cursor-not-allowed font-mono font-bold text-blue-600" 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="shortName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Short Name *</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    {...field} 
                                                    placeholder="e.g., Ehsaas Cash" 
                                                    className="bg-gray-50 focus:bg-white transition-colors" 
                                                    onChange={(e) => field.onChange(e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="schemeName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold">Scheme Name *</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    {...field} 
                                                    placeholder="e.g., Ehsaas Emergency Cash Program" 
                                                    className="bg-gray-50 focus:bg-white transition-colors" 
                                                    onChange={(e) => field.onChange(e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                                                />
                                            </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold">Short Description *</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} rows={2} placeholder="Brief description of the scheme" className="bg-gray-50 focus:bg-white transition-colors" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="longDescription"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold">Long Description</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} rows={3} placeholder="Detailed description (optional)" className="bg-gray-50 focus:bg-white transition-colors" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Category *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-gray-50">
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Financial Assistance">Financial Assistance</SelectItem>
                                                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                                                    <SelectItem value="Education">Education</SelectItem>
                                                    <SelectItem value="Housing">Housing</SelectItem>
                                                    <SelectItem value="Agriculture">Agriculture</SelectItem>
                                                    <SelectItem value="Employment">Employment</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="department"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Department *</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    {...field} 
                                                    placeholder="e.g., Social Welfare" 
                                                    className="bg-gray-50 focus:bg-white transition-colors" 
                                                    onChange={(e) => field.onChange(e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Benefits */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Benefits</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="benefits.financial.amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Financial Amount (PKR) *</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} className="bg-gray-50 focus:bg-white transition-colors" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="benefits.financial.frequency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Frequency *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-gray-50">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="One-time">One-time</SelectItem>
                                                    <SelectItem value="Monthly">Monthly</SelectItem>
                                                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                                                    <SelectItem value="Annually">Annually</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Eligibility */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Eligibility Criteria</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="eligibility.age.min"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Min Age</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} placeholder="18" className="bg-gray-50 focus:bg-white transition-colors" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="eligibility.age.max"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Max Age</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} placeholder="100" className="bg-gray-50 focus:bg-white transition-colors" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="eligibility.income.min"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Min Income (PKR)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} placeholder="0" className="bg-gray-50 focus:bg-white transition-colors" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="eligibility.income.max"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Max Income (PKR) *</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} placeholder="e.g., 30000" className="bg-gray-50 focus:bg-white transition-colors" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Application Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Application Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="application.method"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Application Method *</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    {...field} 
                                                    placeholder="e.g., Online" 
                                                    className="bg-gray-50 focus:bg-white transition-colors" 
                                                    onChange={(e) => field.onChange(e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="application.website"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Application Website *</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="https://example.gov.pk" className="bg-gray-50 focus:bg-white transition-colors" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Contact Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="contact.helpline"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Helpline</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    {...field} 
                                                    placeholder="e.g., 051-9245100" 
                                                    className="bg-gray-50 focus:bg-white transition-colors" 
                                                    onChange={(e) => field.onChange(e.target.value.replace(/[^0-9+\-\s]/g, ""))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="contact.email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" {...field} placeholder="info@example.gov.pk" className="bg-gray-50 focus:bg-white transition-colors" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t">
                            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:from-[#6d28d9] hover:to-[#9333ea] text-white min-w-[140px]"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
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
