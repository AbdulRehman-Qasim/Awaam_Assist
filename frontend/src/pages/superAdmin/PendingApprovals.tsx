import { useEffect, useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    Eye,
    FileText,
    UserPlus,
    RefreshCw,
    Info
} from "lucide-react";
import superAdminAPI, { type SuperAdminManagedType, type SuperAdminPendingRecord, type SuperAdminAdminRecord } from "@/services/superAdminAPI";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const types: SuperAdminManagedType[] = ['admins', 'universities', 'schemes', 'hospitals'];

const getModuleIcon = (type: SuperAdminManagedType) => {
    switch (type) {
        case 'admins': return <UserPlus className="h-4 w-4" />;
        case 'universities': return <GraduationCap className="h-4 w-4" />;
        case 'schemes': return <ShieldCheck className="h-4 w-4" />;
        case 'hospitals': return <Building2 className="h-4 w-4" />;
    }
};

const ApprovalList = ({ type, items, loading, onAction }: { type: SuperAdminManagedType, items: SuperAdminPendingRecord[], loading: boolean, onAction: (type: SuperAdminManagedType, id: string, action: 'approve' | 'reject') => Promise<void> }) => {
    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 w-full animate-pulse bg-slate-50 rounded-lg border border-slate-100" />
                ))}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-slate-50/50 rounded-xl border border-slate-200">
                <CheckCircle2 className="h-8 w-8 text-slate-200 mb-2" />
                <p className="text-sm font-medium text-slate-500">No pending requests in this category</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {items.map((item) => (
                <Card key={item.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                {getModuleIcon(type)}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-semibold text-slate-900">{item.name}</h3>
                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100 font-medium text-[9px] px-2 py-0">Pending</Badge>
                                </div>
                                <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {item.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-semibold"
                                onClick={() => void onAction(type, item.id, 'reject')}
                            >
                                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                                Reject
                            </Button>
                            <Button 
                                size="sm"
                                className="h-8 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold"
                                onClick={() => void onAction(type, item.id, 'approve')}
                            >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                                Approve
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

const AdminApprovalList = ({ items, loading, onAction }: { items: SuperAdminAdminRecord[], loading: boolean, onAction: (id: string, action: 'approve' | 'reject') => Promise<void> }) => {
    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2].map((i) => (
                    <div key={i} className="h-24 w-full animate-pulse bg-slate-50 rounded-lg border border-slate-100" />
                ))}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-slate-50/50 rounded-xl border border-slate-200">
                <UserPlus className="h-8 w-8 text-slate-200 mb-2" />
                <p className="text-sm font-medium text-slate-500">No pending admin onboarding requests</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {items.map((admin: any) => (
                <Card key={admin._id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                <UserPlus className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-semibold text-slate-900">{admin.entity_name || 'Pending Onboarding'}</h3>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 font-medium text-[9px] px-2 py-0 uppercase">
                                        {admin.role?.replace('_admin', '')}
                                    </Badge>
                                </div>
                                <div className="mt-0.5 text-[11px] text-slate-500 font-medium">
                                    {admin.admin_name} • {admin.admin_email}
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 font-medium">
                                    <MapPin className="h-2.5 w-2.5" /> {admin.entity_address || 'No location provided'}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 text-xs font-semibold border-slate-200 text-slate-600">
                                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                                        Review
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto p-0 border-slate-200 shadow-2xl bg-white rounded-xl">
                                    <div className="bg-slate-900 p-6 text-white">
                                        <DialogTitle className="text-lg font-bold">Onboarding Review</DialogTitle>
                                        <DialogDescription className="text-slate-400 text-xs">Review details for {admin.entity_name}.</DialogDescription>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                            <div>
                                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Representative</Label>
                                                <p className="text-sm font-semibold text-slate-700">{admin.admin_name}</p>
                                            </div>
                                            <div>
                                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</Label>
                                                <p className="text-sm font-semibold text-slate-700">{admin.admin_email}</p>
                                            </div>
                                            <div>
                                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact</Label>
                                                <p className="text-sm font-semibold text-slate-700">{admin.entity_contact || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</Label>
                                                <p className="text-sm font-semibold text-slate-700 uppercase">{admin.entity_type || admin.role?.replace('_admin', '')}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">About</Label>
                                                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">{admin.entity_description || 'No description provided.'}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Verification Documents</Label>
                                            {admin.verification_docs && admin.verification_docs.length > 0 ? (
                                                <div className="grid grid-cols-1 gap-2">
                                                    {admin.verification_docs.map((doc: string, idx: number) => (
                                                        <a 
                                                            key={idx} 
                                                            href={`${import.meta.env.VITE_API_URL}${doc}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-400 transition-colors group"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <FileText className="h-4 w-4 text-slate-400" />
                                                                <span className="text-xs font-semibold text-slate-700">Document {idx + 1}</span>
                                                            </div>
                                                            <span className="text-[10px] font-bold text-blue-600 uppercase">View</span>
                                                        </a>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-slate-400 italic">No documents provided.</p>
                                            )}
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-semibold"
                                onClick={() => void onAction(admin._id, 'reject')}
                            >
                                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                                Reject
                            </Button>
                            <Button 
                                size="sm"
                                className="h-8 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold"
                                onClick={() => void onAction(admin._id, 'approve')}
                            >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                                Approve
                            </Button>
                        </div>
                    </CardContent>
                </Card>
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
                title: "Fetch Error",
                description: "Unable to retrieve pending admin requests.",
            });
        } finally {
            setLoading((prev) => ({ ...prev, admins: false }));
        }
    };

    const loadType = async (type: SuperAdminManagedType) => {
        if (type === 'admins') return;
        setLoading((prev) => ({ ...prev, [type]: true }));
        try {
            const response = await superAdminAPI.getPendingData(type);
            setRecords((prev) => ({ ...prev, [type]: response.data }));
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Fetch Error",
                description: `Unable to retrieve pending ${type}.`,
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
                title: "Error",
                description: "System failed to process the admin request.",
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
                description: `Request has been ${action}d.`,
            });
            await loadType(type);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "System failed to process the approval action.",
            });
        }
    };

    // Filter admins by role for module-specific views
    const educationAdmins = useMemo(() => 
        records.admins.filter(a => a.role === 'education_admin' || a.entity_type === 'university'), 
    [records.admins]);
    
    const schemeAdmins = useMemo(() => 
        records.admins.filter(a => a.role === 'scheme_admin' || a.entity_type === 'scheme'), 
    [records.admins]);
    
    const healthcareAdmins = useMemo(() => 
        records.admins.filter(a => a.role === 'hospital_admin' || a.entity_type === 'hospital'), 
    [records.admins]);

    const totalPending = records.universities.length + records.schemes.length + records.hospitals.length + records.admins.length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pending Approvals</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">
                        Review and authorize infrastructure submissions before publication.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {totalPending > 0 && (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-bold px-3 h-7">
                            {totalPending} Action{totalPending > 1 ? 's' : ''} Needed
                        </Badge>
                    )}
                    <Button 
                        onClick={() => {
                            types.forEach(t => loadType(t));
                            loadAdmins();
                        }} 
                        variant="outline" 
                        size="sm" 
                        className="rounded-lg h-9 text-xs gap-2"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="admins" className="w-full" onValueChange={(value) => setActiveTab(value as any)}>
                <TabsList className="bg-slate-100/50 p-1 rounded-lg border border-slate-200 h-10 mb-6">
                    <TabsTrigger value="admins" className="rounded-md px-4 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
                        Admins
                        {records.admins.length > 0 && <span className="flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-slate-900 text-[9px] text-white font-bold">{records.admins.length}</span>}
                    </TabsTrigger>
                    <TabsTrigger value="universities" className="rounded-md px-4 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
                        Education
                        {(records.universities.length + educationAdmins.length) > 0 && <span className="flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-slate-900 text-[9px] text-white font-bold">{records.universities.length + educationAdmins.length}</span>}
                    </TabsTrigger>
                    <TabsTrigger value="schemes" className="rounded-md px-4 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
                        Schemes
                        {(records.schemes.length + schemeAdmins.length) > 0 && <span className="flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-slate-900 text-[9px] text-white font-bold">{records.schemes.length + schemeAdmins.length}</span>}
                    </TabsTrigger>
                    <TabsTrigger value="hospitals" className="rounded-md px-4 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
                        Healthcare
                        {(records.hospitals.length + healthcareAdmins.length) > 0 && <span className="flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-slate-900 text-[9px] text-white font-bold">{records.hospitals.length + healthcareAdmins.length}</span>}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="admins" className="space-y-4">
                    <AdminApprovalList items={records.admins} loading={loading.admins} onAction={handleAdminAction} />
                </TabsContent>
                <TabsContent value="universities" className="space-y-4">
                    <div className="space-y-6">
                        {educationAdmins.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <UserPlus className="h-3 w-3" /> Partner Onboarding Requests
                                </h3>
                                <AdminApprovalList items={educationAdmins} loading={loading.admins} onAction={handleAdminAction} />
                            </div>
                        )}
                        <div className="space-y-3">
                            {educationAdmins.length > 0 && (
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <GraduationCap className="h-3 w-3" /> Institutional Data Submissions
                                </h3>
                            )}
                            <ApprovalList type="universities" items={records.universities} loading={loading.universities} onAction={handleAction} />
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="schemes" className="space-y-4">
                    <div className="space-y-6">
                        {schemeAdmins.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <UserPlus className="h-3 w-3" /> Program Admin Requests
                                </h3>
                                <AdminApprovalList items={schemeAdmins} loading={loading.admins} onAction={handleAdminAction} />
                            </div>
                        )}
                        <div className="space-y-3">
                            {schemeAdmins.length > 0 && (
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <ShieldCheck className="h-3 w-3" /> Welfare Program Submissions
                                </h3>
                            )}
                            <ApprovalList type="schemes" items={records.schemes} loading={loading.schemes} onAction={handleAction} />
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="hospitals" className="space-y-4">
                    <div className="space-y-6">
                        {healthcareAdmins.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <UserPlus className="h-3 w-3" /> Healthcare Provider Onboarding
                                </h3>
                                <AdminApprovalList items={healthcareAdmins} loading={loading.admins} onAction={handleAdminAction} />
                            </div>
                        )}
                        <div className="space-y-3">
                            {healthcareAdmins.length > 0 && (
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Building2 className="h-3 w-3" /> Facility Data Submissions
                                </h3>
                            )}
                            <ApprovalList type="hospitals" items={records.hospitals} loading={loading.hospitals} onAction={handleAction} />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
            
            {/* Note */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-4">
                <Info className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    All approvals are logged with a cryptographic timestamp. Authorized records will be instantly visible across all platform search indices and user dashboards.
                </p>
            </div>
        </div>
    );
};

export default PendingApprovals;