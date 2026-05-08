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
    Activity,
    ExternalLink,
    Terminal,
    Globe,
    Layers,
    Cpu
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

const getStatusStyles = (status: string) => {
    switch (status) {
        case "Verified":
        case "Active":
            return "bg-emerald-50 text-emerald-700 border-emerald-100";
        case "Archived":
        case "Rejected":
            return "bg-rose-50 text-rose-700 border-rose-100";
        case "Pending":
            return "bg-amber-50 text-amber-700 border-amber-100";
        default:
            return "bg-slate-50 text-slate-700 border-slate-100";
    }
};

const DataDetailsDialog = ({ title, data, type }: { title: string; data: any; type: string }) => {
    const renderField = (label: string, value: any) => {
        if (value === null || value === undefined || value === '') return null;
        return (
            <div className="flex flex-col gap-1.5 py-4 border-b border-slate-50 last:border-0 group/field">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover/field:text-primary-500 transition-colors">{label}</span>
                <span className="text-sm font-bold text-slate-700 font-mono tracking-tight">{String(value)}</span>
            </div>
        );
    };

    return (
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border-none shadow-2xl bg-white p-0">
            <div className="bg-slate-900 px-6 py-8 text-white relative overflow-hidden">
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary-600/20 to-transparent pointer-events-none" />
                <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/10 shadow-2xl">
                            {type === 'university' && <GraduationCap className="h-6 w-6 text-primary-400" />}
                            {type === 'scheme' && <ShieldCheck className="h-6 w-6 text-violet-400" />}
                            {type === 'hospital' && <Building2 className="h-6 w-6 text-emerald-400" />}
                        </div>
                        <div>
                            <Badge className="bg-primary-500 text-white border-none px-3 py-0.5 text-[9px] font-black uppercase tracking-widest mb-1">Master Record</Badge>
                            <DialogTitle className="text-xl md:text-2xl font-black tracking-tighter uppercase leading-none">{title}</DialogTitle>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="p-6">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
                    <Cpu className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Metadata Cluster</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                    {type === 'university' && (
                        <>
                            {renderField("University ID", data._id)}
                            {renderField("City", data.city)}
                            {renderField("Province", data.province)}
                            {renderField("Discipline", data.discipline)}
                            {renderField("Degree", data.degree)}
                            {renderField("Ranking", data.ranking)}
                            {renderField("Merit Score", data.merit)}
                            {renderField("Fee Structure", `PKR ${data.fee?.toLocaleString()}`)}
                            {renderField("Admission Deadline", data.deadline)}
                            {renderField("Contact Email", data.info)}
                        </>
                    )}
                    {type === 'scheme' && (
                        <>
                            {renderField("Scheme ID", data.schemeId)}
                            {renderField("Category", data.category)}
                            {renderField("Sub-Category", data.subCategory)}
                            {renderField("Department", data.department)}
                            {renderField("Province", data.province)}
                            {renderField("Financial Amount", `PKR ${data.benefits?.financial?.amount?.toLocaleString()}`)}
                            {renderField("Income Eligibility", `Up to PKR ${data.eligibility?.income?.max?.toLocaleString()}`)}
                            {renderField("Age Group", `${data.eligibility?.age?.min} - ${data.eligibility?.age?.max} Years`)}
                            {renderField("Application Method", data.application?.method)}
                            {renderField("Official Website", data.application?.website)}
                        </>
                    )}
                    {type === 'hospital' && (
                        <>
                            {renderField("Serial Num", data.SerialNum)}
                            {renderField("Category", data.Cateogry)}
                            {renderField("City", data.City)}
                            {renderField("Tehsil", data.Tehsil)}
                            {renderField("Hospital Admin ID", data.createdByHospitalAdmin)}
                            {renderField("Official Website", data.website || 'N/A')}
                            {renderField("Registered At", data.createdAt ? new Date(data.createdAt).toLocaleString() : 'N/A')}
                        </>
                    )}
                </div>
                
                <div className="mt-8 p-6 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <div className="h-8 w-8 shrink-0 rounded-lg bg-white shadow-sm flex items-center justify-center">
                        <Terminal className="h-4 w-4 text-slate-400" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-900 mb-0.5 italic">Security Advisory</p>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                            This data is synchronized with the primary database cluster. Unauthorized access or modifications are logged for audit purposes.
                        </p>
                    </div>
                </div>
            </div>
        </DialogContent>
    );
};

const OverviewTable = ({
    title,
    icon: Icon,
    description,
    rows,
    accentColor,
    type
}: {
    title: string;
    icon: any;
    description: string;
    rows: any[];
    accentColor: string;
    type: string;
}) => (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 mb-8 md:mb-12">
        <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-xl ${accentColor} shadow-lg shadow-slate-200/50 flex items-center justify-center`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-xl font-black tracking-tighter text-slate-900 uppercase leading-none">{title}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{description}</p>
                </div>
            </div>
            <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-primary-500" />
                <span className="text-xs font-black text-slate-900">{rows.length} <span className="text-slate-400 text-[9px] uppercase tracking-widest font-bold">Records</span></span>
            </div>
        </div>
        <Table>
            <TableHeader className="bg-slate-50/30">
                <TableRow className="border-slate-50 h-12">
                    <TableHead className="pl-6 font-black text-slate-400 uppercase tracking-widest text-[9px]">Registry Entity</TableHead>
                    <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[9px]">Geographical Index</TableHead>
                    <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[9px]">Governance Lead</TableHead>
                    <TableHead className="text-right pr-6 font-black text-slate-400 uppercase tracking-widest text-[9px]">Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={4} className="h-64 text-center">
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <Database className="h-12 w-12 text-slate-100" />
                                <p className="text-xl font-bold text-slate-300">No registry entries found.</p>
                            </div>
                        </TableCell>
                    </TableRow>
                ) : (
                    rows.map((row, idx) => (
                        <TableRow key={row.id || idx} className="group hover:bg-slate-50/30 transition-colors border-slate-50 h-16">
                            <TableCell className="pl-6">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <div className="flex items-center gap-3 cursor-pointer group/item">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-100 text-slate-400 group-hover/item:text-primary-600 transition-colors font-black text-xs">
                                                {idx + 1}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black tracking-tight text-slate-900 group-hover/item:text-primary-600 transition-colors flex items-center gap-1.5 text-sm">
                                                    {row.name}
                                                    <ExternalLink className="h-3 w-3 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                                </span>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Registry: {type}</span>
                                            </div>
                                        </div>
                                    </DialogTrigger>
                                    <DataDetailsDialog title={row.name} data={row.raw} type={type} />
                                </Dialog>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <MapPin className="h-3.5 w-3.5 text-slate-300" />
                                    <span className="text-[10px] font-bold italic">{row.location}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <User className="h-3.5 w-3.5 text-slate-300" />
                                    <span className="text-[10px] font-bold">{row.owner}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                                <Badge variant="outline" className={`font-black text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded-full border shadow-sm ${getStatusStyles(row.status)}`}>
                                    <div className="mr-1.5 h-1 w-1 rounded-full bg-current animate-pulse" />
                                    {row.status}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
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
        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between border-b border-slate-100 pb-6 md:pb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Badge className="bg-slate-900 text-white border-none px-3 py-0.5 text-[9px] font-black uppercase tracking-widest shadow-xl shadow-slate-200">System Registry</Badge>
                        <span className="text-slate-300 font-bold">/</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Data Repository</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter text-slate-900 uppercase leading-none">
                        Master <span className="text-primary-600 italic">Inventory</span>
                    </h1>
                    <p className="text-slate-500 text-base md:text-lg font-medium max-w-3xl leading-snug">
                        Full-spectrum overview of verified platform entities across Education, Welfare, and Healthcare sectors. Synchronized with live production nodes.
                    </p>
                </div>
                <Button onClick={fetchData} className="h-12 px-6 rounded-xl bg-slate-900 hover:bg-primary-600 text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-2xl shadow-slate-200 gap-2">
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh Inventory
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-3">
                {[
                    { label: "Academic Records", count: data.universities.length, icon: GraduationCap, color: "from-blue-600 to-blue-400", light: "bg-blue-50 text-blue-600" },
                    { label: "Welfare Schemes", count: data.schemes.length, icon: ShieldCheck, color: "from-violet-600 to-violet-400", light: "bg-violet-50 text-violet-600" },
                    { label: "Medical Centers", count: data.hospitals.length, icon: Building2, color: "from-emerald-600 to-emerald-400", light: "bg-emerald-50 text-emerald-600" },
                ].map((item) => (
                    <Card key={item.label} className="group relative overflow-hidden border-none shadow-xl rounded-2xl bg-white">
                        <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-700`} />
                        <CardContent className="p-6 relative z-10">
                            <div className="flex justify-between items-start">
                                <div className="space-y-3">
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                                        <p className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 group-hover:text-primary-600 transition-colors duration-500">{item.count}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-0.5 rounded-full w-fit border border-slate-100">
                                        <Globe className="h-2.5 w-2.5 text-emerald-500" />
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Global Status: Active</span>
                                    </div>
                                </div>
                                <div className={`h-12 w-12 rounded-xl ${item.light} shadow-inner flex items-center justify-center group-hover:scale-110 transition-all duration-700`}>
                                    <item.icon className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="relative group">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                <Input 
                    placeholder="Query master registry by institution name, geographical location, or sector index..." 
                    className="pl-12 h-12 text-base border-slate-200 bg-white shadow-xl shadow-slate-200/20 rounded-xl focus-visible:ring-primary-500 font-medium placeholder:text-slate-300 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full justify-start gap-1 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200 overflow-x-auto h-12 mb-6 md:mb-8">
                    <TabsTrigger value="all" className="rounded-lg px-6 h-full data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-slate-900 font-black tracking-tight uppercase text-[10px]">
                        <LayoutGrid className="mr-2 h-4 w-4" /> Global Registry
                    </TabsTrigger>
                    <TabsTrigger value="universities" className="rounded-lg px-6 h-full data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 font-black tracking-tight uppercase text-[10px]">
                        <GraduationCap className="mr-2 h-4 w-4" /> Academic Portal
                    </TabsTrigger>
                    <TabsTrigger value="schemes" className="rounded-lg px-6 h-full data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-violet-600 font-black tracking-tight uppercase text-[10px]">
                        <ShieldCheck className="mr-2 h-4 w-4" /> Welfare Schemes
                    </TabsTrigger>
                    <TabsTrigger value="hospitals" className="rounded-lg px-6 h-full data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-emerald-600 font-black tracking-tight uppercase text-[10px]">
                        <Building2 className="mr-2 h-4 w-4" /> Medical Directory
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-10 md:space-y-12 animate-in fade-in zoom-in-95 duration-500">
                    <OverviewTable title="Academic Infrastructure" icon={GraduationCap} description="Primary universities and accredited research centers" rows={filteredUnis} accentColor="bg-blue-50 text-blue-600" type="university" />
                    <OverviewTable title="Public Welfare Systems" icon={ShieldCheck} description="National financial aid programs and social grants" rows={filteredSchemes} accentColor="bg-violet-50 text-violet-600" type="scheme" />
                    <OverviewTable title="Healthcare Networks" icon={Building2} description="Verified medical facilities and regional clinics" rows={filteredHospitals} accentColor="bg-emerald-50 text-emerald-600" type="hospital" />
                </TabsContent>
                
                <TabsContent value="universities" className="animate-in fade-in zoom-in-95 duration-500">
                    <OverviewTable title="Universities" icon={GraduationCap} description="Complete registry of accredited educational institutions" rows={filteredUnis} accentColor="bg-blue-50 text-blue-600" type="university" />
                </TabsContent>
                
                <TabsContent value="schemes" className="animate-in fade-in zoom-in-95 duration-500">
                    <OverviewTable title="Welfare Schemes" icon={ShieldCheck} description="Complete registry of government social welfare programs" rows={filteredSchemes} accentColor="bg-violet-50 text-violet-600" type="scheme" />
                </TabsContent>
                
                <TabsContent value="hospitals" className="animate-in fade-in zoom-in-95 duration-500">
                    <OverviewTable title="Medical Facilities" icon={Building2} description="Complete registry of verified hospitals and clinics" rows={filteredHospitals} accentColor="bg-emerald-50 text-emerald-600" type="hospital" />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default DataOverview;