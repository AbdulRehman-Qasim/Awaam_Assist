import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
    Clock3, 
    GraduationCap, 
    ShieldCheck, 
    Building2, 
    CheckCircle2, 
    XCircle, 
    MapPin, 
    Calendar,
    ChevronRight,
    ArrowRight,
    UserPlus,
    Eye,
    FileText
} from "lucide-react";
import superAdminAPI, { type SuperAdminManagedType, type SuperAdminPendingRecord, type SuperAdminAdminRecord } from "@/services/superAdminAPI";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const types: SuperAdminManagedType[] = ['admins', 'universities', 'schemes', 'hospitals'];

const getModuleIcon = (type: SuperAdminManagedType) => {
    switch (type) {
        case 'admins': return <UserPlus className="h-5 w-5" />;
        case 'universities': return <GraduationCap className="h-5 w-5" />;
        case 'schemes': return <ShieldCheck className="h-5 w-5" />;
        case 'hospitals': return <Building2 className="h-5 w-5" />;
    }
};

const getModuleColor = (type: SuperAdminManagedType) => {
    switch (type) {
        case 'admins': return "text-primary-600 bg-primary-50";
        case 'universities': return "text-blue-600 bg-blue-50";
        case 'schemes': return "text-violet-600 bg-violet-50";
        case 'hospitals': return "text-emerald-600 bg-emerald-50";
    }
};

const friendlyName = (type: SuperAdminManagedType) => {
    if (type === 'admins') return 'Admin Onboarding';
    if (type === 'universities') return 'Universities';
    if (type === 'schemes') return 'Schemes';
    return 'Hospitals';
};

type ApprovalListProps = {
    type: SuperAdminManagedType;
    items: SuperAdminPendingRecord[];
    loading: boolean;
    onAction: (type: SuperAdminManagedType, id: string, action: 'approve' | 'reject') => Promise<void>;
};

const ApprovalList = ({ type, items, loading, onAction }: ApprovalListProps) => {
    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 w-full animate-pulse bg-slate-100 rounded-xl border border-slate-200" />
                ))}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200">
                <div className="h-12 w-12 bg-white rounded-lg shadow-sm flex items-center justify-center mb-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Queue Cleared</h3>
                <p className="text-sm text-slate-500 font-medium">No pending {friendlyName(type).toLowerCase()} require review.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {items.map((item) => (
                <div key={item.id} className="group relative bg-white rounded-xl border border-slate-200 p-4 md:p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${getModuleColor(type)} shadow-inner`}>
                                {getModuleIcon(type)}
                            </div>
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-base font-black tracking-tight text-slate-900 group-hover:text-primary-600 transition-colors">{item.name}</h3>
                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-bold px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider">Awaiting Audit</Badge>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="h-3 w-3" />
                                        {item.location}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="h-3 w-3" />
                                        {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : 'Priority Submission'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <Button 
                                variant="outline" 
                                className="h-10 px-4 rounded-lg border-slate-200 text-slate-600 font-bold text-xs hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all gap-1.5"
                                onClick={() => void onAction(type, item.id, 'reject')}
                            >
                                <XCircle className="h-3.5 w-3.5" />
                                Reject
                            </Button>
                            <Button 
                                className="h-10 px-6 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-emerald-600 transition-all gap-1.5 shadow-lg shadow-slate-100"
                                onClick={() => void onAction(type, item.id, 'approve')}
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Approve Entity
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const AdminApprovalList = ({ items, loading, onAction }: { items: SuperAdminAdminRecord[], loading: boolean, onAction: (id: string, action: 'approve' | 'reject') => Promise<void> }) => {
    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2].map((i) => (
                    <div key={i} className="h-32 w-full animate-pulse bg-slate-100 rounded-xl border border-slate-200" />
                ))}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200">
                <div className="h-12 w-12 bg-white rounded-lg shadow-sm flex items-center justify-center mb-3">
                    <UserPlus className="h-6 w-6 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No Pending Admins</h3>
                <p className="text-sm text-slate-500 font-medium">All partner onboarding requests have been processed.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {items.map((admin: any) => (
                <div key={admin._id} className="group relative bg-white rounded-xl border border-slate-200 p-4 md:p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 bg-primary-50 text-primary-600 shadow-inner">
                                <UserPlus className="h-5 w-5" />
                            </div>
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-base font-black tracking-tight text-slate-900">{admin.entity_name || 'Incomplete Profile'}</h3>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider">{admin.role?.replace('_admin', '')}</Badge>
                                </div>
                                <div className="flex flex-col text-xs font-medium text-slate-500">
                                    <span>Representative: {admin.admin_name} ({admin.admin_email})</span>
                                    <span className="text-slate-400 mt-1 flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> {admin.entity_address || 'No Address Provided'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="h-10 px-4 rounded-lg border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all gap-1.5">
                                        <Eye className="h-3.5 w-3.5" />
                                        Review Proof
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Onboarding Details: {admin.entity_name}</DialogTitle>
                                        <DialogDescription>
                                            Verification documents and entity information for {admin.admin_name}.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-6 py-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <Label className="text-xs text-slate-500 uppercase tracking-wider">Contact</Label>
                                                <p className="font-semibold">{admin.entity_contact || 'N/A'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs text-slate-500 uppercase tracking-wider">Type</Label>
                                                <p className="font-semibold uppercase">{admin.entity_type || admin.role?.replace('_admin', '')}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs text-slate-500 uppercase tracking-wider">Scale</Label>
                                                <p className="font-semibold">{admin.scale || 'N/A'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs text-slate-500 uppercase tracking-wider">Established</Label>
                                                <p className="font-semibold">{admin.established_year || 'N/A'}</p>
                                            </div>
                                            <div className="col-span-2 space-y-1">
                                                <Label className="text-xs text-slate-500 uppercase tracking-wider">Official Website</Label>
                                                <p className="text-sm font-semibold text-primary-600 truncate">{admin.official_website || 'N/A'}</p>
                                            </div>
                                            <div className="col-span-2 space-y-1">
                                                <Label className="text-xs text-slate-500 uppercase tracking-wider">About / Description</Label>
                                                <p className="text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">{admin.entity_description || 'No description provided.'}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-xs text-slate-500 uppercase tracking-wider">Verification Documents ({admin.verification_docs?.length || 0})</Label>
                                            {admin.verification_docs && admin.verification_docs.length > 0 ? (
                                                <div className="grid grid-cols-2 gap-3">
                                                    {admin.verification_docs.map((doc: string, idx: number) => (
                                                        <a 
                                                            key={idx} 
                                                            href={`${import.meta.env.VITE_API_URL}${doc}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-all group"
                                                        >
                                                            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-white">
                                                                <FileText className="h-5 w-5 text-slate-400 group-hover:text-primary-600" />
                                                            </div>
                                                            <div className="overflow-hidden">
                                                                <p className="text-xs font-bold text-slate-700 truncate">Document {idx + 1}</p>
                                                                <p className="text-[10px] text-slate-400">Click to view original</p>
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-8 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                                    <p className="text-sm text-slate-400 font-medium">No documents uploaded for verification.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <Button 
                                variant="outline" 
                                className="h-10 px-4 rounded-lg border-slate-200 text-slate-600 font-bold text-xs hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all gap-1.5"
                                onClick={() => void onAction(admin._id, 'reject')}
                            >
                                <XCircle className="h-3.5 w-3.5" />
                                Reject
                            </Button>
                            <Button 
                                className="h-10 px-6 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-emerald-600 transition-all gap-1.5 shadow-lg shadow-slate-100"
                                onClick={() => void onAction(admin._id, 'approve')}
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Authorize Admin
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const PendingApprovals = () => {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<SuperAdminManagedType>('admins');
    const [records, setRecords] = useState<Record<SuperAdminManagedType, SuperAdminPendingRecord[]>>({
        universities: [],
        schemes: [],
        hospitals: [],
        admins: [] as any[],
    });
    const [loading, setLoading] = useState<Record<string, boolean>>({
        universities: true,
        schemes: true,
        hospitals: true,
        admins: true,
    });

    const loadAdmins = async () => {
        setLoading((prev) => ({ ...prev, admins: true }));
        try {
            const response = await superAdminAPI.getPendingAdmins();
            setRecords((prev) => ({ ...prev, admins: response.data }));
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Data Retrieval Failure",
                description: "System was unable to fetch pending admin requests.",
            });
        } finally {
            setLoading((prev) => ({ ...prev, admins: false }));
        }
    };

    const loadType = async (type: SuperAdminManagedType) => {
        if (type === 'admins') return; // Handled by loadAdmins
        setLoading((prev) => ({ ...prev, [type]: true }));
        try {
            const response = await superAdminAPI.getPendingData(type);
            setRecords((prev) => ({ ...prev, [type]: response.data }));
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Data Retrieval Failure",
                description: `System was unable to fetch pending ${friendlyName(type).toLowerCase()}.`,
            });
        } finally {
            setLoading((prev) => ({ ...prev, [type]: false }));
        }
    };

    useEffect(() => {
        types.forEach((type) => {
            void loadType(type);
        });
        void loadAdmins();
    }, []);

    const handleAdminAction = async (id: string, action: 'approve' | 'reject') => {
        try {
            if (action === 'approve') {
                await superAdminAPI.approveAdmin(id);
            } else {
                await superAdminAPI.rejectAdmin(id);
            }

            toast({
                title: "Action Processed",
                description: `Admin request has been ${action}d.`,
            });
            await loadAdmins();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Authorization Error",
                description: (error as any).response?.data?.message || "System failed to process the admin action.",
            });
        }
    };

    const handleAction = async (type: SuperAdminManagedType, id: string, action: 'approve' | 'reject') => {
        try {
            if (action === 'approve') {
                await superAdminAPI.approveData(type, id);
            } else {
                await superAdminAPI.rejectData(type, id);
            }

            toast({
                title: "Action Processed",
                description: `The ${friendlyName(type).slice(0, -1)} has been successfully ${action}d.`,
            });
            await loadType(type);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Authorization Error",
                description: "System failed to process the lifecycle action.",
            });
        }
    };

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-slate-100 pb-6">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <Badge className="bg-amber-50 text-amber-700 border-amber-100 px-3 py-0.5 text-[9px] font-black uppercase tracking-widest">Action Required</Badge>
                        <span className="text-slate-300 font-bold">/</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lifecycle Management</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 uppercase">
                        Audit <span className="text-primary-600 italic">Queue</span>
                    </h1>
                    <p className="text-slate-500 text-base font-medium max-w-2xl leading-snug">
                        Review and authorize infrastructure submissions before they are published to the public registry.
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-slate-100 shadow-sm">
                    <div className="h-8 w-8 bg-slate-50 rounded-lg flex items-center justify-center">
                        <Clock3 className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="pr-3">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Queue</p>
                        <p className="text-xs font-bold text-slate-900">
                            {records.universities.length + records.schemes.length + records.hospitals.length + records.admins.length} Pending
                        </p>
                    </div>
                </div>
            </div>


            <Tabs defaultValue="admins" className="w-full" onValueChange={(value) => setActiveTab(value as any)}>
                <TabsList className="w-full justify-start gap-1 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200 overflow-x-auto h-12 mb-6 md:mb-8">
                    <TabsTrigger value="admins" className="rounded-lg px-6 h-full data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary-600 font-black tracking-tight uppercase text-[10px]">
                        <UserPlus className="mr-2 h-3.5 w-3.5" /> Admin Onboarding
                    </TabsTrigger>
                    <TabsTrigger value="universities" className="rounded-lg px-6 h-full data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 font-black tracking-tight uppercase text-[10px]">
                        <GraduationCap className="mr-2 h-3.5 w-3.5" /> Academic Records
                    </TabsTrigger>
                    <TabsTrigger value="schemes" className="rounded-lg px-6 h-full data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-violet-600 font-black tracking-tight uppercase text-[10px]">
                        <ShieldCheck className="mr-2 h-3.5 w-3.5" /> Welfare Programs
                    </TabsTrigger>
                    <TabsTrigger value="hospitals" className="rounded-lg px-6 h-full data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-emerald-600 font-black tracking-tight uppercase text-[10px]">
                        <Building2 className="mr-2 h-3.5 w-3.5" /> Medical Centers
                    </TabsTrigger>
                </TabsList>


                <div className="relative">
                    <TabsContent value="admins">
                        <AdminApprovalList items={records.admins} loading={loading.admins} onAction={handleAdminAction} />
                    </TabsContent>
                    <TabsContent value="universities">
                        <ApprovalList type="universities" items={records.universities} loading={loading.universities} onAction={handleAction} />
                    </TabsContent>
                    <TabsContent value="schemes">
                        <ApprovalList type="schemes" items={records.schemes} loading={loading.schemes} onAction={handleAction} />
                    </TabsContent>
                    <TabsContent value="hospitals">
                        <ApprovalList type="hospitals" items={records.hospitals} loading={loading.hospitals} onAction={handleAction} />
                    </TabsContent>
                </div>
            </Tabs>
            
            <div className="p-6 rounded-xl bg-slate-900 text-white overflow-hidden relative group">
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary-600/20 to-transparent pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1.5">
                        <h3 className="text-xl font-black tracking-tight uppercase">Governance Note</h3>
                        <p className="text-slate-400 text-sm font-medium max-w-xl">
                            All approvals are logged with a cryptographic timestamp. Authorized records will be instantly visible across all platform search indices.
                        </p>
                    </div>
                    <Button variant="outline" className="h-11 px-6 rounded-lg border-white/20 text-white hover:bg-white hover:text-slate-900 font-bold text-xs transition-all gap-2 group-hover:gap-3">
                        Policy Documentation
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

        </div>
    );
};

export default PendingApprovals;