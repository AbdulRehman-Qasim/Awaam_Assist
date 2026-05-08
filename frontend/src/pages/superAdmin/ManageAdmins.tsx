import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Users, 
    Search, 
    ShieldCheck, 
    GraduationCap, 
    Building2, 
    ShieldAlert, 
    MoreVertical, 
    UserCheck, 
    UserX, 
    Ban,
    Mail,
    Calendar,
    Globe,
    Zap,
    LayoutGrid,
    ArrowRight
} from "lucide-react";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import superAdminAPI, { type SuperAdminAdminRecord } from "@/services/superAdminAPI";

const ManageAdmins = () => {
    const { toast } = useToast();
    const [admins, setAdmins] = useState<SuperAdminAdminRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    const loadAdmins = async () => {
        setIsLoading(true);
        try {
            const response = await superAdminAPI.getAdmins();
            setAdmins(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Data Link Failure",
                description: "Unable to retrieve the master administrator registry.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAdmins();
    }, []);

    const handleAction = async (action: 'approve' | 'reject' | 'suspend', id: string) => {
        try {
            if (action === 'approve') {
                await superAdminAPI.approveAdmin(id);
            } else if (action === 'reject') {
                await superAdminAPI.rejectAdmin(id);
            } else {
                await superAdminAPI.suspendAdmin(id);
            }

            toast({
                title: "Protocol Executed",
                description: `Admin status successfully updated to ${action}d.`,
            });
            await loadAdmins();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Execution Error",
                description: "The system was unable to commit the status change.",
            });
        }
    };

    const getStatusConfig = (admin: SuperAdminAdminRecord) => {
        if (admin.status === 'suspended') {
            return { label: 'Suspended', className: 'bg-rose-50 text-rose-700 border-rose-100', dot: 'bg-rose-500' };
        }
        if (admin.isApproved) {
            return { label: 'Verified', className: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' };
        }
        return { label: 'Pending Audit', className: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500' };
    };

    const getRoleConfig = (role?: string) => {
        switch (role) {
            case 'super_admin': return { label: 'System Root', icon: Zap, color: 'text-slate-900 bg-slate-100' };
            case 'hospital_admin': return { label: 'Medical Lead', icon: Building2, color: 'text-emerald-600 bg-emerald-50' };
            case 'scheme_admin': return { label: 'Welfare Head', icon: ShieldCheck, color: 'text-violet-600 bg-violet-50' };
            default: return { label: 'Academic Lead', icon: GraduationCap, color: 'text-blue-600 bg-blue-50' };
        }
    };

    const filteredAdmins = admins.filter(admin => {
        const matchesSearch = 
            admin.admin_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            admin.admin_email?.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (activeTab === "all") return matchesSearch;
        if (activeTab === "education") return matchesSearch && admin.role === 'education_admin';
        if (activeTab === "scheme") return matchesSearch && admin.role === 'scheme_admin';
        if (activeTab === "hospital") return matchesSearch && admin.role === 'hospital_admin';
        return matchesSearch;
    });

    const AdminTable = ({ data }: { data: SuperAdminAdminRecord[] }) => (
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl shadow-slate-200/40">
            <Table>
                <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-slate-100 hover:bg-transparent h-12">
                        <TableHead className="pl-6 font-black text-slate-400 uppercase tracking-[0.15em] text-[10px]">Administrative Entity</TableHead>
                        <TableHead className="font-black text-slate-400 uppercase tracking-[0.15em] text-[10px]">Security Clearance</TableHead>
                        <TableHead className="font-black text-slate-400 uppercase tracking-[0.15em] text-[10px]">Current Status</TableHead>
                        <TableHead className="font-black text-slate-400 uppercase tracking-[0.15em] text-[10px]">Registered</TableHead>
                        <TableHead className="text-right pr-6 font-black text-slate-400 uppercase tracking-[0.15em] text-[10px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        [1, 2, 3].map((i) => (
                            <TableRow key={i} className="h-16 animate-pulse border-slate-50">
                                <TableCell colSpan={5} className="pl-6">
                                    <div className="h-8 w-2/3 bg-slate-50 rounded-lg" />
                                </TableCell>
                            </TableRow>
                        ))
                    ) : data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-48 text-center">
                                <div className="flex flex-col items-center justify-center gap-3 opacity-30">
                                    <Users className="h-10 w-10" />
                                    <p className="text-sm font-bold uppercase tracking-widest italic">No matching records</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((admin) => {
                            const status = getStatusConfig(admin);
                            const role = getRoleConfig(admin.role);
                            const RoleIcon = role.icon;

                            return (
                                <TableRow key={admin._id} className="group border-slate-50 hover:bg-slate-50/50 transition-all duration-300 h-16">
                                    <TableCell className="pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-white shadow-sm ring-1 ring-slate-100 flex items-center justify-center text-slate-400 font-black text-sm group-hover:scale-110 transition-all">
                                                {admin.admin_name?.[0] || 'A'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-900 tracking-tight text-sm group-hover:text-primary-600 transition-colors">
                                                    {admin.admin_name || 'Legacy Root Admin'}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                    <Mail className="h-2.5 w-2.5" />
                                                    <span className="text-[10px] font-bold font-mono tracking-tight">{admin.admin_email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg w-fit font-black text-[9px] uppercase tracking-widest ${role.color}`}>
                                            <RoleIcon className="h-3.5 w-3.5" />
                                            {role.label}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`px-3 py-1 rounded-full border font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5 w-fit ${status.className}`}>
                                            <div className={`h-1 w-1 rounded-full ${status.dot} animate-pulse`} />
                                            {status.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <Calendar className="h-3.5 w-3.5 opacity-40" />
                                            <span className="text-[10px] font-bold italic">
                                                {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'System Origin'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-lg transition-all group/btn">
                                                    <MoreVertical className="h-4 w-4 text-slate-400 group-hover/btn:text-slate-900" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-xl border-none shadow-2xl">
                                                <DropdownMenuLabel className="px-2 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Lifecycle Commands</DropdownMenuLabel>
                                                <DropdownMenuSeparator className="bg-slate-50" />
                                                {!admin.isApproved && admin.role !== 'super_admin' && (
                                                    <DropdownMenuItem 
                                                        className="rounded-lg py-2 cursor-pointer group hover:bg-emerald-50"
                                                        onClick={() => handleAction('approve', admin._id)}
                                                    >
                                                        <UserCheck className="mr-2 h-3.5 w-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
                                                        <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-700">Approve Clearance</span>
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem 
                                                    className="rounded-lg py-2 cursor-pointer group hover:bg-rose-50"
                                                    onClick={() => handleAction('suspend', admin._id)}
                                                >
                                                    <Ban className="mr-2 h-3.5 w-3.5 text-rose-500 group-hover:scale-110 transition-transform" />
                                                    <span className="text-xs font-bold text-slate-700 group-hover:text-rose-700">Revoke Access</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-slate-50" />
                                                <DropdownMenuItem 
                                                    className="rounded-lg py-2 cursor-pointer group hover:bg-slate-900 hover:text-white"
                                                    onClick={() => handleAction('reject', admin._id)}
                                                >
                                                    <UserX className="mr-2 h-3.5 w-3.5 text-slate-400 group-hover:text-white" />
                                                    <span className="text-xs font-bold">Purge Identity</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );


    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between border-b border-slate-100 pb-6 md:pb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-primary-600 text-white border-none px-3 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-200">Governance Layer</Badge>
                        <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Authorization Cluster Online</span>
                        </div>
                    </div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter text-slate-900 uppercase leading-none">
                        Admin <span className="text-primary-600 italic">Registry</span>
                    </h1>
                    <p className="text-slate-500 text-base md:text-lg font-medium max-w-3xl leading-snug">
                        Master management of the platform's administrative tier. Audit clearances, verify roles, and manage global operational access.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white shadow-xl shadow-slate-200 flex items-center justify-center border border-slate-100">
                        <Globe className="h-5 w-5 text-primary-500 animate-spin-slow" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Total Identity Nodes</p>
                        <p className="text-xl font-black text-slate-900">{admins.length}</p>
                    </div>
                </div>
            </div>


            {/* Search Bar */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                <Input 
                    placeholder="Search administrators by name, email, or security clearance ID..." 
                    className="pl-12 h-12 text-base border-slate-200 bg-white shadow-xl shadow-slate-200/20 rounded-xl focus-visible:ring-primary-500 font-medium placeholder:text-slate-300 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>


            {/* Content Tabs */}
            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start gap-1 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200 overflow-x-auto h-12 mb-6 md:mb-8">
                    <TabsTrigger value="all" className="rounded-lg px-6 h-full data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-slate-900 font-black tracking-tight uppercase text-[10px]">
                        <LayoutGrid className="mr-2 h-4 w-4" /> Global Registry
                    </TabsTrigger>
                    <TabsTrigger value="education" className="rounded-lg px-6 h-full data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 font-black tracking-tight uppercase text-[10px]">
                        <GraduationCap className="mr-2 h-4 w-4" /> Academic Leads
                    </TabsTrigger>
                    <TabsTrigger value="scheme" className="rounded-lg px-6 h-full data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-violet-600 font-black tracking-tight uppercase text-[10px]">
                        <ShieldCheck className="mr-2 h-4 w-4" /> Welfare Heads
                    </TabsTrigger>
                    <TabsTrigger value="hospital" className="rounded-lg px-6 h-full data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-emerald-600 font-black tracking-tight uppercase text-[10px]">
                        <Building2 className="mr-2 h-4 w-4" /> Medical Leads
                    </TabsTrigger>
                </TabsList>


                <TabsContent value="all" className="animate-in fade-in zoom-in-95 duration-500">
                    <AdminTable data={filteredAdmins} />
                </TabsContent>
                <TabsContent value="education" className="animate-in fade-in zoom-in-95 duration-500">
                    <AdminTable data={filteredAdmins} />
                </TabsContent>
                <TabsContent value="scheme" className="animate-in fade-in zoom-in-95 duration-500">
                    <AdminTable data={filteredAdmins} />
                </TabsContent>
                <TabsContent value="hospital" className="animate-in fade-in zoom-in-95 duration-500">
                    <AdminTable data={filteredAdmins} />
                </TabsContent>
            </Tabs>

            {/* Policy Note Footer */}
            <div className="p-6 rounded-2xl bg-slate-900 text-white overflow-hidden relative group">
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary-600/20 to-transparent pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4 text-primary-400" />
                            <h3 className="text-xl font-black tracking-tight uppercase leading-none">Authorization Protocols</h3>
                        </div>
                        <p className="text-slate-400 text-sm font-medium max-w-2xl leading-relaxed italic">
                            Clearances granted here confer significant operational authority over national data sectors. 
                            All status modifications are recorded with cryptographic timestamps for the global audit trail.
                        </p>
                    </div>
                    <Button variant="outline" className="h-12 px-6 rounded-xl border-white/20 text-white hover:bg-white hover:text-slate-900 font-black uppercase tracking-widest text-[10px] transition-all gap-3 group-hover:gap-4 shadow-2xl">
                        Audit Compliance Documentation
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

        </div>
    );
};

export default ManageAdmins;