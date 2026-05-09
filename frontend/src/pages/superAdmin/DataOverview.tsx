import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { 
    Database, 
    GraduationCap, 
    ShieldCheck, 
    Building2, 
    Search,
    RefreshCw,
    MapPin,
    User,
    Info,
    LayoutGrid,
    ExternalLink,
    Terminal,
    Globe,
    Layers,
    ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import superAdminAPI from "@/services/superAdminAPI";

const getStatusBadge = (status: string) => {
    switch (status) {
        case "Verified":
        case "Active":
            return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50 font-semibold text-[10px]">Active</Badge>;
        case "Archived":
        case "Rejected":
            return <Badge className="bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-50 font-semibold text-[10px]">Inactive</Badge>;
        case "Pending":
            return <Badge className="bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-50 font-semibold text-[10px]">Pending</Badge>;
        default:
            return <Badge className="bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-50 font-semibold text-[10px]">{status}</Badge>;
    }
};

const DataDetailsDialog = ({ title, data, type }: { title: string; data: any; type: string }) => {
    const renderField = (label: string, value: any) => {
        if (value === null || value === undefined || value === '') return null;
        return (
            <div className="flex flex-col gap-1 py-3 border-b border-slate-50 last:border-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                <span className="text-sm font-medium text-slate-700">{String(value)}</span>
            </div>
        );
    };

    return (
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto p-0 border-slate-200 shadow-2xl bg-white rounded-xl">
            <div className="bg-slate-900 p-6 text-white">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
                        {type === 'university' && <GraduationCap className="h-6 w-6 text-blue-400" />}
                        {type === 'scheme' && <ShieldCheck className="h-6 w-6 text-emerald-400" />}
                        {type === 'hospital' && <Building2 className="h-6 w-6 text-rose-400" />}
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Resource Details</p>
                        <DialogTitle className="text-lg font-bold tracking-tight">{title}</DialogTitle>
                    </div>
                </div>
            </div>
            
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                    {type === 'university' && (
                        <>
                            {renderField("ID", data._id)}
                            {renderField("City", data.city)}
                            {renderField("Province", data.province)}
                            {renderField("Discipline", data.discipline)}
                            {renderField("Degree", data.degree)}
                            {renderField("Ranking", data.ranking)}
                            {renderField("Merit Score", data.merit)}
                            {renderField("Fee", `PKR ${data.fee?.toLocaleString()}`)}
                            {renderField("Deadline", data.deadline)}
                        </>
                    )}
                    {type === 'scheme' && (
                        <>
                            {renderField("ID", data.schemeId)}
                            {renderField("Category", data.category)}
                            {renderField("Department", data.department)}
                            {renderField("Province", data.province)}
                            {renderField("Benefits", `PKR ${data.benefits?.financial?.amount?.toLocaleString()}`)}
                            {renderField("Max Income", `PKR ${data.eligibility?.income?.max?.toLocaleString()}`)}
                            {renderField("Age", `${data.eligibility?.age?.min} - ${data.eligibility?.age?.max}`)}
                            {renderField("Method", data.application?.method)}
                        </>
                    )}
                    {type === 'hospital' && (
                        <>
                            {renderField("Serial", data.SerialNum)}
                            {renderField("Category", data.Cateogry)}
                            {renderField("City", data.City)}
                            {renderField("Tehsil", data.Tehsil)}
                            {renderField("Website", data.website || 'N/A')}
                        </>
                    )}
                </div>
                
                <div className="mt-8 p-4 rounded-lg bg-slate-50 border border-slate-100">
                    <p className="text-xs font-semibold text-slate-900 mb-1">Administrative Note</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                        This record is part of the verified platform registry. Any modifications must go through the standard approval workflow.
                    </p>
                </div>
            </div>
        </DialogContent>
    );
};

const OverviewTable = ({
    title,
    rows,
    type
}: {
    title: string;
    rows: any[];
    type: string;
}) => (
    <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <Badge variant="outline" className="text-[10px] font-medium border-slate-200 text-slate-500">
                {rows.length} Records
            </Badge>
        </div>
        <div className="overflow-x-auto">
            <Table>
                <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-slate-100">
                        <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Admin</th>
                        <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3"></th>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-48 text-center">
                                <div className="flex flex-col items-center justify-center">
                                    <Database className="h-8 w-8 text-slate-200 mb-2" />
                                    <p className="text-sm font-medium text-slate-400">No records found</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        rows.map((row, idx) => (
                            <TableRow key={row.id || idx} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                                <TableCell className="px-6 py-4">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{row.name}</p>
                                        <p className="text-[10px] text-slate-400 font-medium capitalize">{type}</p>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 text-slate-600">
                                        <MapPin className="h-3.5 w-3.5 text-slate-300" />
                                        <span className="text-xs font-medium">{row.location}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 text-slate-600">
                                        <User className="h-3.5 w-3.5 text-slate-300" />
                                        <span className="text-xs font-medium">{row.owner}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-right">
                                    {getStatusBadge(row.status)}
                                </TableCell>
                                <TableCell className="px-6 py-4 text-right">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-900">
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DataDetailsDialog title={row.name} data={row.raw} type={type} />
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    </div>
);

const DataOverview = () => {
    const [data, setData] = useState<any>({ universities: [], schemes: [], hospitals: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await superAdminAPI.getAllDataRecords();
            setData(response.data);
        } catch (error) {
            console.error("Registry fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filterRows = (rows: any[]) => 
        rows.filter(r => 
            r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            r.location.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const filteredUnis = filterRows(data.universities);
    const filteredSchemes = filterRows(data.schemes);
    const filteredHospitals = filterRows(data.hospitals);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Data Registry</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">
                        Central repository for all verified institutional and governmental data.
                    </p>
                </div>
                <Button onClick={fetchData} variant="outline" className="rounded-lg h-9 text-xs gap-2">
                    <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh Registry
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                    { label: "Education", count: data.universities.length, icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Schemes", count: data.schemes.length, icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Healthcare", count: data.hospitals.length, icon: Building2, color: "text-rose-600", bg: "bg-rose-50" },
                ].map((item) => (
                    <Card key={item.label} className="border-slate-200 shadow-sm bg-white overflow-hidden">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${item.bg} ${item.color}`}>
                                <item.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                                <p className="text-xl font-bold text-slate-900">{item.count}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Search and Tabs */}
            <div className="space-y-6">
                <div className="relative group max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input 
                        placeholder="Search records..." 
                        className="pl-9 h-10 border-slate-200 rounded-lg text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="bg-slate-100/50 p-1 rounded-lg border border-slate-200 h-10 mb-6">
                        <TabsTrigger value="all" className="rounded-md px-4 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            All Data
                        </TabsTrigger>
                        <TabsTrigger value="universities" className="rounded-md px-4 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Education
                        </TabsTrigger>
                        <TabsTrigger value="schemes" className="rounded-md px-4 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Schemes
                        </TabsTrigger>
                        <TabsTrigger value="hospitals" className="rounded-md px-4 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Healthcare
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-4">
                        <OverviewTable title="Educational Institutions" rows={filteredUnis} type="university" />
                        <OverviewTable title="Government Schemes" rows={filteredSchemes} type="scheme" />
                        <OverviewTable title="Healthcare Facilities" rows={filteredHospitals} type="hospital" />
                    </TabsContent>
                    
                    <TabsContent value="universities">
                        <OverviewTable title="Education Registry" rows={filteredUnis} type="university" />
                    </TabsContent>
                    
                    <TabsContent value="schemes">
                        <OverviewTable title="Schemes Registry" rows={filteredSchemes} type="scheme" />
                    </TabsContent>
                    
                    <TabsContent value="hospitals">
                        <OverviewTable title="Healthcare Registry" rows={filteredHospitals} type="hospital" />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default DataOverview;