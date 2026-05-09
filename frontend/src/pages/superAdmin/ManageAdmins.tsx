import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Users, 
    Search, 
    ShieldCheck, 
    GraduationCap, 
    Building2, 
    MoreVertical, 
    UserCheck, 
    UserX, 
    Ban,
    Mail,
    Calendar,
    RefreshCw,
    MoreHorizontal
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
                title: "Fetch Error",
                description: "Unable to retrieve the administrator registry.",
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
                title: "Status Updated",
                description: `Administrator successfully ${action}d.`,
            });
            await loadAdmins();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "The system was unable to update the administrator status.",
            });
        }
    };

    const getStatusBadge = (admin: SuperAdminAdminRecord) => {
        if (admin.status === 'suspended') {
            return <Badge className="bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-50 font-semibold text-[10px]">Suspended</Badge>;
        }
        if (admin.isApproved) {
            return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50 font-semibold text-[10px]">Active</Badge>;
        }
        return <Badge className="bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-50 font-semibold text-[10px]">Pending Approval</Badge>;
    };

    const getRoleBadge = (role?: string) => {
        const configs: Record<string, any> = {
            super_admin: { label: 'Super Admin', color: 'bg-slate-900 text-white' },
            hospital_admin: { label: 'Healthcare', color: 'bg-rose-50 text-rose-700 border-rose-100' },
            scheme_admin: { label: 'Schemes', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
            education_admin: { label: 'Education', color: 'bg-blue-50 text-blue-700 border-blue-100' }
        };
        const config = configs[role || 'education_admin'] || configs.education_admin;
        return (
            <Badge variant="outline" className={`${config.color} font-medium text-[10px] px-2 py-0`}>
                {config.label}
            </Badge>
        );
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

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manage Administrators</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">
                        Review and manage administrative access and permissions.
                    </p>
                </div>
                <Button onClick={loadAdmins} variant="outline" className="rounded-lg h-9 text-xs gap-2">
                    <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh List
                </Button>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input 
                            placeholder="Search administrators..." 
                            className="pl-9 h-10 border-slate-200 rounded-lg text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
                        <TabsList className="bg-slate-100/50 p-1 rounded-lg border border-slate-200 h-10">
                            <TabsTrigger value="all" className="rounded-md px-4 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm">All</TabsTrigger>
                            <TabsTrigger value="education" className="rounded-md px-4 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm">Education</TabsTrigger>
                            <TabsTrigger value="scheme" className="rounded-md px-4 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm">Schemes</TabsTrigger>
                            <TabsTrigger value="hospital" className="rounded-md px-4 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm">Healthcare</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="border-slate-100">
                                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Administrator</th>
                                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Role / Module</th>
                                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Created At</th>
                                    <th className="px-6 py-3"></th>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    [1, 2, 3, 4, 5].map((i) => (
                                        <TableRow key={i} className="animate-pulse border-slate-50">
                                            <TableCell colSpan={5} className="px-6 py-4">
                                                <div className="h-10 bg-slate-50 rounded-lg w-full" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredAdmins.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <Users className="h-8 w-8 text-slate-200 mb-2" />
                                                <p className="text-sm font-medium text-slate-400">No administrators found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAdmins.map((admin) => (
                                        <TableRow key={admin._id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold">
                                                        {admin.admin_name?.[0] || 'A'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">{admin.admin_name}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium">{admin.admin_email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                {getRoleBadge(admin.role)}
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                {getStatusBadge(admin)}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-xs text-slate-500 font-medium">
                                                {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 p-1 rounded-lg border-slate-200 shadow-xl bg-white">
                                                        <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        {!admin.isApproved && admin.role !== 'super_admin' && (
                                                            <DropdownMenuItem onClick={() => handleAction('approve', admin._id)} className="cursor-pointer">
                                                                <UserCheck className="mr-2 h-3.5 w-3.5 text-emerald-500" />
                                                                <span className="text-xs font-medium">Approve</span>
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem onClick={() => handleAction('suspend', admin._id)} className="cursor-pointer">
                                                            <Ban className="mr-2 h-3.5 w-3.5 text-amber-500" />
                                                            <span className="text-xs font-medium">Suspend</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleAction('reject', admin._id)} className="cursor-pointer text-rose-600 focus:text-rose-600">
                                                            <UserX className="mr-2 h-3.5 w-3.5" />
                                                            <span className="text-xs font-medium">Remove Account</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>

            {/* Note */}
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-4">
                <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-white leading-none mb-1">Administrative Security</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        All administrative actions are logged for security and auditing purposes. Use caution when modifying permissions or revoking access.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ManageAdmins;