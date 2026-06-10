
import React, { useState, useEffect } from "react";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface UniversityFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    university?: any;
    isSuperAdmin?: boolean;
}

const disciplines = [
    "Medical",
    "Engineering",
    "Computer Science",
    "Business",
    "Law",
    "Arts",
    "Sciences",
    "Social Sciences",
    "Agriculture",
    "Pharmacy",
    "Architecture",
    "Economics",
    "Education",
    "Environmental Science",
    "Data Science",
    "Artificial Intelligence",
    "Cyber Security",
    "Information Technology",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biotechnology",
    "Nursing",
    "Dentistry",
    "Media Studies",
    "Fine Arts",
    "Psychology",
    "Accounting and Finance",
];

const universitySchema = z.object({
    title: z.string().min(1, "University name is required"),
    city: z.string().min(1, "City is required"),
    province: z.string().min(1, "Province is required"),
    discipline: z.string().min(1, "Discipline is required"),
    degree: z.string().min(1, "Degree level is required"),
    contact: z.string().min(11, "Contact number must be at least 11 characters long"),
    merit: z.number().min(0, "Merit cannot be negative").max(100, "Merit cannot exceed 100%"),
    info: z.string().optional(),
    web: z.string().url("Invalid website URL").or(z.literal("")).optional(),
    deadline: z.string().optional(),
});

const UniversityForm: React.FC<UniversityFormProps> = ({
    isOpen,
    onClose,
    onSuccess,
    university,
    isSuperAdmin = false,
}) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Get current admin info for pre-filling university details
    const adminRaw = localStorage.getItem("admin");
    const admin = adminRaw ? JSON.parse(adminRaw) : null;

    const [formData, setFormData] = useState({
        title: "",
        city: "",
        province: "Punjab",
        discipline: "Computer Science",
        degree: "Bachelor",
        feeType: "Annual Fee" as "Annual Fee" | "Semester Fee",
        fee: 0,
        semesterFee: 0,
        merit: 0,
        info: "",
        contact: "",
        web: "",
        deadline: "",
    });

    useEffect(() => {
        if (!isOpen) return; // Only run when modal is opened

        if (university) {
            setFormData({
                title: university.title || "",
                city: university.city || "",
                province: university.province || "Punjab",
                discipline: university.discipline || "Computer Science",
                degree: university.degree || "Bachelor",
                feeType: university.semesterFee ? "Semester Fee" : "Annual Fee",
                fee: university.fee || 0,
                semesterFee: university.semesterFee || 0,
                merit: university.merit || 0,
                info: university.info || "",
                contact: university.contact || "",
                web: university.web || "",
                deadline: university.deadline || "",
            });
        } else if (!isSuperAdmin && admin) {
            // For Uni Admin, pre-fill university name/city/province from their registration
            setFormData(prev => ({
                ...prev,
                title: admin.entity_name || "",
                city: admin.entity_address?.split(',')[0]?.trim() || "",
                province: admin.entity_address?.split(',')[1]?.trim() || "Punjab",
            }));
        } else {
            // Reset for new entry
            setFormData({
                title: "",
                city: "",
                province: "Punjab",
                discipline: "Computer Science",
                degree: "Bachelor",
                feeType: "Annual Fee",
                fee: 0,
                semesterFee: 0,
                merit: 0,
                info: "",
                contact: "",
                web: "",
                deadline: "",
            });
        }
    }, [isOpen, university]); // Only depend on isOpen and university

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Zod Validation
        const result = universitySchema.safeParse(formData);
        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.errors.forEach((err) => {
                if (err.path[0]) {
                    newErrors[err.path[0].toString()] = err.message;
                }
            });
            setErrors(newErrors);
            toast({
                title: "Validation Error",
                description: result.error.errors[0].message,
                variant: "destructive",
            });
            return;
        }

        const selectedFee = formData.feeType === "Annual Fee" ? formData.fee : formData.semesterFee;
        if (!selectedFee || selectedFee <= 0) {
            setErrors(prev => ({ ...prev, feeAmount: `Please enter a valid ${formData.feeType === "Annual Fee" ? "annual" : "semester"} fee amount` }));
            toast({
                title: "Validation Error",
                description: `Please enter a valid ${formData.feeType === "Annual Fee" ? "annual" : "semester"} fee amount`,
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem("adminToken");
            const apiUrl = import.meta.env.VITE_API_URL || "http://awaam-assist.onrender.com";

            const isEditMode = Boolean(university && (university._id || university.id));
            const method = isEditMode ? "PUT" : "POST";
            const url = isEditMode
                ? `${apiUrl}/admin/companies/${university._id || university.id}`
                : `${apiUrl}/admin/companies`;

            // If adding new, generate a temporary ID if required by schema
            const payload = {
                ...formData,
                fee: formData.feeType === "Annual Fee" ? formData.fee : null,
                semesterFee: formData.feeType === "Semester Fee" ? formData.semesterFee : null,
                id: university?.id || `UNI-${Date.now()}`,
                status: university?.status !== undefined ? university.status : 1,
            };

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "Success",
                    description: isEditMode ? "Program updated successfully" : "New program added successfully",
                });
                onSuccess();
                onClose();
            } else {
                throw new Error(data.error || data.message || "Failed to save");
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {university ? "Edit Program" : (isSuperAdmin ? "Add New University Program" : "Add New Discipline/Program")}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">University Name <span className="text-destructive">*</span></Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value.replace(/[^a-zA-Z\s]/g, "") })}
                                placeholder="e.g. NUST"
                                required
                                disabled={!isSuperAdmin} // Only super admin can change university name
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="discipline">Discipline / Program <span className="text-destructive">*</span></Label>
                            <Select
                                value={formData.discipline}
                                onValueChange={(v) => setFormData({ ...formData, discipline: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select discipline" />
                                </SelectTrigger>
                                <SelectContent>
                                    {disciplines.map(d => (
                                        <SelectItem key={d} value={d}>{d}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="degree">Degree Level <span className="text-destructive">*</span></Label>
                            <Select
                                value={formData.degree}
                                onValueChange={(v) => setFormData({ ...formData, degree: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select degree" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Bachelor">Bachelor</SelectItem>
                                    <SelectItem value="Master">Master</SelectItem>
                                    <SelectItem value="PhD">PhD</SelectItem>
                                    <SelectItem value="Diploma">Diploma</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="feeType">Fee Type</Label>
                            <Select
                                value={formData.feeType}
                                onValueChange={(v: "Annual Fee" | "Semester Fee") =>
                                    setFormData({
                                        ...formData,
                                        feeType: v,
                                        fee: v === "Annual Fee" ? formData.fee : 0,
                                        semesterFee: v === "Semester Fee" ? formData.semesterFee : 0,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select fee type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Annual Fee">Annual Fee</SelectItem>
                                    <SelectItem value="Semester Fee">Semester Fee</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="feeAmount">
                                {formData.feeType === "Annual Fee" ? "Annual Fee (PKR)" : "Semester Fee (PKR)"} <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="feeAmount"
                                type="number"
                                min={0}
                                value={formData.feeType === "Annual Fee" ? formData.fee : formData.semesterFee}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        fee: formData.feeType === "Annual Fee" ? Number(e.target.value) : 0,
                                        semesterFee:
                                            formData.feeType === "Semester Fee" ? Number(e.target.value) : 0,
                                    })
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="merit">Minimum Merit Score (%) <span className="text-destructive">*</span></Label>
                            <Input
                                id="merit"
                                type="number"
                                value={formData.merit}
                                onChange={(e) => setFormData({ ...formData, merit: Number(e.target.value) })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
                            <Input
                                id="city"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value.replace(/[^a-zA-Z\s]/g, "") })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="province">Province <span className="text-destructive">*</span></Label>
                            <Select
                                value={formData.province}
                                onValueChange={(v) => setFormData({ ...formData, province: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select province" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Punjab">Punjab</SelectItem>
                                    <SelectItem value="Sindh">Sindh</SelectItem>
                                    <SelectItem value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</SelectItem>
                                    <SelectItem value="Balochistan">Balochistan</SelectItem>
                                    <SelectItem value="Gilgit-Baltistan">Gilgit-Baltistan</SelectItem>
                                    <SelectItem value="Azad Jammu & Kashmir">Azad Jammu & Kashmir</SelectItem>
                                    <SelectItem value="Islamabad Capital Territory">Islamabad Capital Territory</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="deadline">Application Deadline</Label>
                            <Input
                                id="deadline"
                                type="text"
                                value={formData.deadline}
                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                placeholder="e.g. 15th Aug 2024"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="info">Description / Requirements</Label>
                        <Textarea
                            id="info"
                            value={formData.info}
                            onChange={(e) => setFormData({ ...formData, info: e.target.value })}
                            placeholder="Add admission requirements, program details, etc."
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="contact" className={errors.contact ? "text-destructive" : ""}>Contact Information <span className="text-destructive">*</span></Label>
                            <Input
                                id="contact"
                                value={formData.contact}
                                onChange={(e) => {
                                    setFormData({ ...formData, contact: e.target.value.replace(/[^0-9+\-\s]/g, "") });
                                    if (errors.contact) setErrors(prev => ({ ...prev, contact: "" }));
                                }}
                                placeholder="Phone or email"
                                className={errors.contact ? "border-destructive" : ""}
                            />
                            {errors.contact && (
                                <p className="text-xs text-destructive">{errors.contact}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="web">Website URL</Label>
                            <Input
                                id="web"
                                value={formData.web}
                                onChange={(e) => setFormData({ ...formData, web: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                            {loading ? "Saving..." : (university && (university._id || university.id) ? "Update Program" : "Add Program")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default UniversityForm;
