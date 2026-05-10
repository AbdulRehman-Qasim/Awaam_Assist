import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { useToast } from '@/hooks/use-toast';
import { hospitalAdminAPI, HospitalAdminRecord } from '@/services/hospitalAPI';
import {
    Building2, Edit, MapPin, Tags, Plus, Trash2, Search, Globe, Eye,
    ChevronsUpDown, Check, Loader2, Stethoscope, Clock, ShieldAlert,
    UserCircle2, Settings2, FileText, Calendar
} from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';
import AppointmentManager from './AppointmentManager';

const initialForm: Partial<HospitalAdminRecord> = {
    SerialNum: 0,
    City: '',
    Tehsil: '',
    hospitalName: '',
    category: '',
    website: '',
    treatmentCost: 0,
    availability: 'Available',
    info: '',
    // Standardized fields
    treatmentSpecialty: '',
    treatmentName: '',
    description: '',
    supportFeatures: [],
    waitingTime: 'Immediate',
    severitySupport: 'Basic',
    appointmentRequired: true,
};

const SearchableSelect = ({
    options,
    value,
    onChange,
    placeholder,
    searchPlaceholder = "Search treatment types...",
    emptyMessage = "No treatments found."
}: any) => {
    const [open, setOpen] = useState(false);
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-10 border-slate-200 font-medium hover:bg-slate-50 transition-colors"
                >
                    <span className="truncate">{value ? options.find((opt: string) => opt === value) : placeholder}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 shadow-2xl border-slate-200" align="start">
                <Command className="rounded-xl">
                    <CommandInput placeholder={searchPlaceholder} className="h-10 border-none focus:ring-0" />
                    <CommandList>
                        <CommandEmpty className="py-6 text-sm text-slate-500 text-center">{emptyMessage}</CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-y-auto p-1">
                            {options.map((opt: string) => (
                                <CommandItem
                                    key={opt}
                                    value={opt}
                                    onSelect={(currentValue) => {
                                        const matched = options.find((o: string) => o.toLowerCase() === currentValue.toLowerCase());
                                        onChange(matched || opt);
                                        setOpen(false);
                                    }}
                                    className="rounded-lg py-2.5 px-3 aria-selected:bg-emerald-50 aria-selected:text-emerald-900 cursor-pointer"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4 text-emerald-600",
                                            value === opt ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <span className="text-sm font-medium">{opt}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

const SUPPORT_FEATURES = [
    "Wheelchair Support",
    "Emergency Ward",
    "ICU Access",
    "Female Staff Preference",
    "Ambulance Service",
    "Pharmacy",
    "Laboratory",
    "Blood Bank"
];

const HospitalManagementPage = () => {
    const { toast } = useToast();

    const [hospitals, setHospitals] = useState<HospitalAdminRecord[]>([]);
    const [filteredHospitals, setFilteredHospitals] = useState<HospitalAdminRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHospital, setEditingHospital] = useState<HospitalAdminRecord | null>(null);
    const [formData, setFormData] = useState<Partial<HospitalAdminRecord>>(initialForm);
    const [saving, setSaving] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedHospital, setSelectedHospital] = useState<any>(null);
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        description: '',
        onConfirm: () => { },
    });

    const [treatmentOptions, setTreatmentOptions] = useState<string[]>([]);
    const [isLoadingOptions, setIsLoadingOptions] = useState(false);

    const fetchTreatmentOptions = async () => {
        setIsLoadingOptions(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/healthcare/options`);
            const data = await res.json();
            if (data.success) {
                setTreatmentOptions(data.data.treatments || []);
            }
        } catch (err) {
            console.error("Failed to fetch treatment options", err);
        } finally {
            setIsLoadingOptions(false);
        }
    };

    const loadHospitals = async () => {
        setLoading(true);
        try {
            const response = await hospitalAdminAPI.getAllHospitals();
            if (response.success) {
                setHospitals(response.data || []);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load hospitals',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHospitals();
        fetchTreatmentOptions();
    }, []);

    useEffect(() => {
        const filtered = hospitals.filter(h =>
            h.hospitalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.treatmentSpecialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.treatmentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.City?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.category?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredHospitals(filtered);
    }, [hospitals, searchQuery]);

    const openAddModal = () => {
        setEditingHospital(null);
        const adminRaw = localStorage.getItem("admin");
        const admin = adminRaw ? JSON.parse(adminRaw) : null;
        const isHospitalAdmin = admin?.role === 'hospital_admin';

        if (isHospitalAdmin && admin) {
            setFormData({
                ...initialForm,
                hospitalName: admin.entity_name || '',
                City: admin.entity_address?.split(',')[0]?.trim() || '',
                Tehsil: admin.entity_address?.split(',')[1]?.trim() || '',
            });
        } else {
            setFormData(initialForm);
        }
        setIsModalOpen(true);
    };

    const openEditModal = (hospital: HospitalAdminRecord) => {
        setEditingHospital(hospital);
        setFormData({
            ...hospital,
            supportFeatures: hospital.supportFeatures || [],
        });
        setIsModalOpen(true);
    };

    const handleToggleStatus = async (hospital: any) => {
        try {
            const newStatus = hospital.status === 1 ? 0 : 1;
            await hospitalAdminAPI.updateHospital(hospital._id, { status: newStatus });
            toast({ title: "Status Updated", description: `${hospital.hospitalName} is now ${newStatus === 1 ? 'Active' : 'Inactive'}` });
            loadHospitals();
        } catch (error) {
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
        }
    };

    const getStatusBadge = (hospital: any) => {
        const isActive = hospital.status === 1 || hospital.status === 'Active' || hospital.status === 'approved';
        return (
            <Badge className={`cursor-pointer transition-colors ${isActive ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}`} onClick={() => handleToggleStatus(hospital)}>
                {isActive ? "Active" : "Inactive"}
            </Badge>
        );
    };

    const handleDelete = async (id: string, name: string) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Delete Treatment',
            description: `Are you sure you want to delete this treatment entry for "${name}"?`,
            onConfirm: async () => {
                try {
                    await hospitalAdminAPI.deleteHospital(id);
                    toast({ title: 'Success', description: 'Entry deleted successfully' });
                    loadHospitals();
                } catch (error) {
                    toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
                }
                setConfirmDialog(prev => ({ ...prev, isOpen: false }));
            },
        });
    };

    const handleSave = async () => {
        if (!formData.treatmentSpecialty || !formData.hospitalName || !formData.category) {
            toast({ title: 'Validation error', description: 'Please select a Treatment Specialty', variant: 'destructive' });
            return;
        }

        if (Number(formData.treatmentCost) < 0) {
            toast({ title: 'Validation error', description: 'Treatment cost cannot be negative', variant: 'destructive' });
            return;
        }

        setSaving(true);
        try {
            // Trace the payload before submission
            const finalPayload = {
                ...formData,
                status: editingHospital ? formData.status : 1,
                // Ensure treatmentSpecialty is synced
                treatmentSpecialty: formData.treatmentSpecialty || formData.treatmentName
            };
            console.log("CLIENT DEBUG [handleSave] Submitting payload:", finalPayload);

            if (editingHospital) {
                await hospitalAdminAPI.updateHospital(editingHospital._id, finalPayload);
                toast({ title: 'Success', description: 'Treatment updated successfully' });
            } else {
                await hospitalAdminAPI.createHospital(finalPayload);
                toast({ title: 'Success', description: 'Treatment added successfully' });
            }
            setIsModalOpen(false);
            setFormData(initialForm);
            await loadHospitals();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to save', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const adminRaw = localStorage.getItem("admin");
    const admin = adminRaw ? JSON.parse(adminRaw) : null;
    const isHospitalAdmin = admin?.role === 'hospital_admin';

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                        {isHospitalAdmin ? "Manage Your Treatments" : "Hospital Management"}
                    </h1>
                    <p className="text-slate-500 text-xs md:text-sm font-medium mt-1">
                        {isHospitalAdmin
                            ? `Managing ${admin?.entity_name}`
                            : "Administrative control of healthcare entities"}
                    </p>
                </div>
                <Button
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100 rounded-xl h-11 px-6 font-bold transition-all hover:translate-y-[-1px]"
                    onClick={openAddModal}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    {isHospitalAdmin ? "Add Treatment" : "Add Hospital"}
                </Button>
            </div>


            <div className="grid grid-cols-1 gap-4">
                <Card className="border-slate-200/60 shadow-sm overflow-hidden">
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input placeholder="Search records by name, city, or category..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus-visible:ring-emerald-500 transition-all" />
                        </div>
                    </CardContent>
                </Card>

                {loading ? (
                    <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-100">
                        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mx-auto mb-4" />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Records...</p>
                    </div>
                ) : filteredHospitals.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                        <Stethoscope className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold text-lg">No records matched your search.</p>
                        <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or add a new entry.</p>
                        <Button variant="link" className="text-emerald-600 font-bold mt-4" onClick={openAddModal}>
                            <Plus className="h-4 w-4 mr-1" /> Add New Entry
                        </Button>
                    </div>
                ) : (
                    filteredHospitals.map((hospital) => (
                        <Card key={hospital._id} className="overflow-hidden border-slate-200/60 shadow-sm hover:shadow-md transition-all group bg-white">
                            {/* ... (existing hospital card content) */}
                            <CardContent className="p-0">
                                <div className="p-4 sm:p-5">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        <div className="flex items-start gap-3.5">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                                                <Building2 className="h-5 w-5 text-emerald-700" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2.5 flex-wrap">
                                                    <h3 className="text-lg font-bold text-slate-900 leading-none">
                                                        {hospital.treatmentSpecialty || hospital.treatmentName || "Unnamed Specialty Entry"}
                                                    </h3>
                                                    {getStatusBadge(hospital)}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-100 rounded-md text-[10px] font-bold">
                                                        <Building2 className="h-2.5 w-2.5" />
                                                        {hospital.hospitalName}
                                                    </div>
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                                        ID #{hospital.SerialNum || 'NEW'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2.5 text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                                                    <span className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 rounded-md">
                                                        <Tags className="h-2.5 w-2.5" /> {hospital.category}
                                                    </span>
                                                    <span className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 rounded-md">
                                                        <MapPin className="h-2.5 w-2.5" /> {hospital.City}
                                                    </span>
                                                    {hospital.availability && (
                                                        <span className={cn(
                                                            "flex items-center gap-1 px-1.5 py-0.5 rounded-md",
                                                            hospital.availability === 'Available' ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"
                                                        )}>
                                                            <Clock className="h-2.5 w-2.5" /> {hospital.availability}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 line-clamp-1 max-w-xl italic opacity-80">
                                                    {hospital.description || hospital.info || "No detailed clinical description provided."}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 self-end lg:self-center">
                                            <div className="text-right sm:block mr-2">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-left sm:text-right">Est. Cost</p>
                                                <p className="text-sm sm:text-base font-bold text-emerald-600 leading-none">
                                                    PKR {hospital.treatmentCost?.toLocaleString() || '0'}
                                                </p>
                                            </div>
                                            <div className="flex gap-1.5">
                                                <Button variant="outline" size="icon" className="h-9 w-9 sm:h-8 sm:w-8 rounded-lg border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 group/btn" onClick={() => { setSelectedHospital(hospital); setIsDetailModalOpen(true); }}>
                                                    <Eye className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-slate-400 group-hover/btn:text-emerald-600" />
                                                </Button>
                                                <Button variant="outline" size="icon" className="h-9 w-9 sm:h-8 sm:w-8 rounded-lg border-slate-200 hover:border-blue-200 hover:bg-blue-50 group/btn" onClick={() => openEditModal(hospital)}>
                                                    <Edit className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-slate-400 group-hover/btn:text-blue-600" />
                                                </Button>
                                                <Button variant="outline" size="icon" className="h-9 w-9 sm:h-8 sm:w-8 rounded-lg border-slate-200 hover:border-rose-200 hover:bg-rose-50 group/btn" onClick={() => handleDelete(hospital._id, hospital.hospitalName)}>
                                                    <Trash2 className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-slate-400 group-hover/btn:text-rose-600" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl w-[95vw] h-[90vh] md:h-[85vh] p-0 border-none shadow-2xl rounded-2xl flex flex-col overflow-hidden">
                    <DialogHeader className="p-6 bg-slate-900 text-white shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                <Plus className="h-6 w-6 text-emerald-400" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold">
                                    {editingHospital ? 'Edit Management Entry' : 'New Healthcare Entry'}
                                </DialogTitle>
                                <p className="text-slate-400 text-xs font-medium mt-0.5">Configure treatment parameters and intelligence metadata.</p>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 custom-scrollbar">
                        {/* Section 1: Core Entity */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <UserCircle2 className="h-4 w-4 text-emerald-600" />
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Entity & Provider</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <Label htmlFor="hospitalName" className="text-xs font-bold text-slate-700">Hospital Name</Label>
                                    <Input id="hospitalName" readOnly={isHospitalAdmin} value={formData.hospitalName || ''} onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })} className="h-11 bg-slate-50 font-semibold" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="category" className="text-xs font-bold text-slate-700">Service Category</Label>
                                    <Select value={formData.category || ''} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                                        <SelectTrigger id="category" className="h-11">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Government">Government Service</SelectItem>
                                            <SelectItem value="Private">Private Provider</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-700">Location (City)</Label>
                                    <Input readOnly={isHospitalAdmin} value={formData.City || ''} className="h-11 bg-slate-50 font-medium" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-slate-700">Tehsil</Label>
                                    <Input readOnly={isHospitalAdmin} value={formData.Tehsil || ''} className="h-11 bg-slate-50 font-medium" />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Treatment Configuration */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Settings2 className="h-4 w-4 text-emerald-600" />
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Treatment Parameters</h4>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-700">Treatment Specialty</Label>
                                {isLoadingOptions ? (
                                    <div className="h-11 w-full bg-slate-50 animate-pulse rounded-lg border border-slate-200" />
                                ) : (
                                    <SearchableSelect
                                        options={treatmentOptions}
                                        value={formData.treatmentSpecialty}
                                        onChange={(val: string) => setFormData({ ...formData, treatmentSpecialty: val })}
                                        placeholder="Select clinical specialization..."
                                    />
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <Label htmlFor="treatmentCost" className="text-xs font-bold text-slate-700">Estimated Cost (PKR)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rs.</span>
                                        <Input id="treatmentCost" type="number" min="0" value={formData.treatmentCost || ''} onChange={(e) => setFormData({ ...formData, treatmentCost: Number(e.target.value) })} className="h-11 pl-10 font-bold text-emerald-600" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="availability" className="text-xs font-bold text-slate-700">Slot Availability</Label>
                                    <Select value={formData.availability || 'Available'} onValueChange={(v) => setFormData({ ...formData, availability: v })}>
                                        <SelectTrigger id="availability" className="h-11 font-medium">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Available">Instant Available</SelectItem>
                                            <SelectItem value="Limited">Limited Capacity</SelectItem>
                                            <SelectItem value="Unavailable">Fully Booked</SelectItem>
                                            <SelectItem value="By Appointment">Manual Confirmation</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="description" className="text-xs font-bold text-slate-700">Clinical Overview & Requirements</Label>
                                <Textarea id="description" placeholder="Describe the clinical procedure, necessary prep, and patient eligibility..." value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="min-h-[100px] resize-none" />
                            </div>
                        </div>

                        {/* Section 3: Intelligence Metadata */}
                        <div className="space-y-6 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-4 w-4 text-emerald-600" />
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Urgency & Support</h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Label className="text-xs font-bold text-slate-700">Patient Support Features</Label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {SUPPORT_FEATURES.map((feature) => (
                                            <div key={feature} className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer">
                                                <Checkbox
                                                    id={`feat-${feature}`}
                                                    checked={(formData.supportFeatures || []).includes(feature)}
                                                    onCheckedChange={(checked) => {
                                                        const current = formData.supportFeatures || [];
                                                        if (checked) {
                                                            setFormData({ ...formData, supportFeatures: [...current, feature] });
                                                        } else {
                                                            setFormData({ ...formData, supportFeatures: current.filter(f => f !== feature) });
                                                        }
                                                    }}
                                                    className="border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                                />
                                                <label htmlFor={`feat-${feature}`} className="text-sm font-semibold text-slate-700 cursor-pointer flex-1">{feature}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-700">Est. Waiting Time</Label>
                                        <Select value={formData.waitingTime || 'Immediate'} onValueChange={(v) => setFormData({ ...formData, waitingTime: v })}>
                                            <SelectTrigger className="h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Immediate">Immediate / Walk-in</SelectItem>
                                                <SelectItem value="Within 24 Hours">Within 24 Hours</SelectItem>
                                                <SelectItem value="2-3 Days">2-3 Working Days</SelectItem>
                                                <SelectItem value="1 Week">Within 1 Week</SelectItem>
                                                <SelectItem value="By Appointment">Strictly by Appt.</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-700">Clinical Severity Support</Label>
                                        <Select value={formData.severitySupport || 'Basic'} onValueChange={(v: any) => setFormData({ ...formData, severitySupport: v })}>
                                            <SelectTrigger className="h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Basic">Basic Outpatient</SelectItem>
                                                <SelectItem value="Moderate">Moderate Inpatient</SelectItem>
                                                <SelectItem value="Critical">Critical ICU Care</SelectItem>
                                                <SelectItem value="Emergency">Emergency Trauma</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-bold">Appointment Required</p>
                                            <p className="text-[10px] text-slate-400">Enforce booking before visit</p>
                                        </div>
                                        <Switch
                                            checked={formData.appointmentRequired}
                                            onCheckedChange={(checked) => setFormData({ ...formData, appointmentRequired: checked })}
                                            className="data-[state=checked]:bg-emerald-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                            <Button variant="ghost" className="flex-1 h-12 rounded-xl font-bold text-slate-500" onClick={() => setIsModalOpen(false)} disabled={saving}>Cancel</Button>
                            <Button className="flex-[2] h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-100" onClick={handleSave} disabled={saving}>
                                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : (editingHospital ? 'Update Clinical Entry' : 'Publish Treatment Entry')}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmDialog isOpen={confirmDialog.isOpen} onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))} onConfirm={confirmDialog.onConfirm} title={confirmDialog.title} description={confirmDialog.description} variant="danger" confirmText="Delete Entry" />

            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none shadow-2xl rounded-2xl overflow-hidden">
                    {selectedHospital && (
                        <>
                            <div className="bg-slate-900 p-8 text-white">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center">
                                        <Building2 className="h-8 w-8 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">{selectedHospital.treatmentSpecialty || selectedHospital.treatmentName || selectedHospital.hospitalName}</h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            {getStatusBadge(selectedHospital)}
                                            <span className="text-slate-400 text-xs font-bold">SERIAL #{selectedHospital.SerialNum}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cost</p>
                                        <p className="text-lg font-black text-emerald-400">Rs. {selectedHospital.treatmentCost?.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Wait Time</p>
                                        <p className="text-sm font-bold">{selectedHospital.waitingTime || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Severity</p>
                                        <p className="text-sm font-bold">{selectedHospital.severitySupport || 'Basic'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Booking</p>
                                        <p className="text-sm font-bold">{selectedHospital.appointmentRequired ? 'Required' : 'Walk-in'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-emerald-600" />
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Clinical Description</h4>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 italic text-slate-600 text-sm leading-relaxed">
                                        {selectedHospital.description || selectedHospital.info || "No clinical description provided."}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <ShieldAlert className="h-4 w-4 text-emerald-600" />
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Included Support Features</h4>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {selectedHospital.supportFeatures && selectedHospital.supportFeatures.length > 0 ? (
                                            selectedHospital.supportFeatures.map((feat: string) => (
                                                <div key={feat} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                                                    <Check className="h-4 w-4 text-emerald-600" />
                                                    <span className="text-sm font-semibold text-slate-700">{feat}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-slate-400 font-medium italic col-span-2">No specific support features listed.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <MapPin className="h-4 w-4 text-slate-400" />
                                        <p className="text-sm font-bold text-slate-600">{selectedHospital.Tehsil}, {selectedHospital.City}</p>
                                    </div>
                                    {selectedHospital.website && (
                                        <Button variant="link" className="text-emerald-600 font-bold" asChild>
                                            <a href={selectedHospital.website} target="_blank" rel="noreferrer">Official Portal</a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default HospitalManagementPage;
