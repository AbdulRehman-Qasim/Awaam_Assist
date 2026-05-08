
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Building2,
    Plus,
    Edit,
    Trash2,
    Eye,
    Search,
    MapPin,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TableSkeleton from "@/components/TableSkeleton";
import UniversityForm from "@/components/UniversityForm";

interface University {
    id: string;
    _id?: string;
    title: string;
    city: string;
    province: string;
    degree: string;
    discipline: string;
    fee: number;
    semesterFee?: number;
    merit: number;
    ranking: number;
    status: number;
    logo: string;
    info?: string;
    contact?: string;
    web?: string;
}

const getProgramDisplayName = (uni: University) => {
    const discipline = uni.discipline || "Program";
    return uni.degree ? `${discipline} (${uni.degree})` : discipline;
};

const CompanyManagementPage = () => {
    const { toast } = useToast();

    const [universities, setUniversities] = useState<University[]>([]);
    const [filteredUniversities, setFilteredUniversities] = useState<University[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterDiscipline, setFilterDiscipline] = useState("all");
    const [filterCity, setFilterCity] = useState("all");
    const [filterProvince, setFilterProvince] = useState("all");
    const [filterDegree, setFilterDegree] = useState("all");
    const [filterFeeType, setFilterFeeType] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    
    // State for the Add/Edit form
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingUniversity, setEditingUniversity] = useState<University | null>(null);

    // Role detection
    const adminRaw = localStorage.getItem("admin");
    let admin: any = null;
    try {
        admin = adminRaw ? JSON.parse(adminRaw) : null;
    } catch {
        admin = null;
    }
    const isSuperAdmin = admin?.role === 'super_admin';

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

    useEffect(() => {
        fetchUniversities();
    }, []);

    useEffect(() => {
        filterData();
    }, [universities, searchQuery, filterDiscipline, filterCity, filterProvince, filterDegree, filterFeeType, filterStatus]);

    const cityOptions = Array.from(new Set(universities.map((u) => u.city).filter(Boolean))).sort();
    const provinceOptions = Array.from(new Set(universities.map((u) => u.province).filter(Boolean))).sort();
    const degreeOptions = Array.from(new Set(universities.map((u) => u.degree).filter(Boolean))).sort();

    const fetchUniversities = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("adminToken");
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";

            const response = await fetch(`${apiUrl}/admin/companies`, {
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            if (!response.ok) throw new Error("Failed to fetch universities");

            const data = await response.json();
            if (data.success && Array.isArray(data.universities)) {
                setUniversities(data.universities);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch universities",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const filterData = () => {
        let filtered = universities;

        if (searchQuery) {
            filtered = filtered.filter(
                (uni) =>
                    uni.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    uni.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    uni.discipline?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (filterDiscipline !== "all") {
            filtered = filtered.filter((uni) => uni.discipline === filterDiscipline);
        }

        if (filterCity !== "all") {
            filtered = filtered.filter((uni) => uni.city === filterCity);
        }

        if (filterProvince !== "all") {
            filtered = filtered.filter((uni) => uni.province === filterProvince);
        }

        if (filterDegree !== "all") {
            filtered = filtered.filter((uni) => uni.degree === filterDegree);
        }

        if (filterFeeType !== "all") {
            filtered = filtered.filter((uni) => {
                const hasSemesterFee = typeof uni.semesterFee === "number" && uni.semesterFee > 0;
                return filterFeeType === "semester" ? hasSemesterFee : !hasSemesterFee;
            });
        }

        if (filterStatus !== "all") {
            const statusNum = filterStatus === "Active" ? 1 : 0;
            filtered = filtered.filter((uni) => uni.status === statusNum);
        }

        setFilteredUniversities(filtered);
    };

    const clearFilters = () => {
        setSearchQuery("");
        setFilterDiscipline("all");
        setFilterCity("all");
        setFilterProvince("all");
        setFilterDegree("all");
        setFilterFeeType("all");
        setFilterStatus("all");
    };

    const getUniversityIdentifier = (uni: University) => uni.id || uni._id || "";

    const handleDelete = async (id: string, name: string) => {
        if (!id) {
            toast({
                title: "Error",
                description: "Unable to delete: university identifier is missing",
                variant: "destructive",
            });
            return;
        }

        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

        try {
            const token = localStorage.getItem("adminToken");
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";

            const response = await fetch(`${apiUrl}/admin/companies/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const result = await response.json().catch(() => null);
            if (!response.ok || !result?.success) {
                throw new Error(result?.message || "Failed to delete university");
            }

            toast({
                title: "Success",
                description: "Program deleted successfully",
            });
            fetchUniversities();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete program",
                variant: "destructive",
            });
        }
    };

    const handleToggleStatus = async (uni: University) => {
        try {
            const newStatus = uni.status === 1 ? 0 : 1;
            const token = localStorage.getItem("adminToken");
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";

            const identifier = getUniversityIdentifier(uni);
            if (!identifier) {
                throw new Error("Unable to update: university identifier is missing");
            }

            const response = await fetch(`${apiUrl}/admin/companies/${identifier}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ status: newStatus }),
            });

            const result = await response.json().catch(() => null);
            if (!response.ok || !result?.success) {
                throw new Error(result?.message || "Failed to update status");
            }

            toast({
                title: "Status Updated",
                description: `${uni.title} is now ${newStatus === 1 ? 'Active' : 'Inactive'}`,
            });
            fetchUniversities();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update status",
                variant: "destructive",
            });
        }
    };

    const getStatusBadge = (uni: University) => {
        return (
            <Badge 
                className={`cursor-pointer transition-colors ${
                    uni.status === 1 
                        ? "bg-green-100 text-green-800 hover:bg-green-200" 
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
                onClick={() => handleToggleStatus(uni)}
            >
                {uni.status === 1 ? "Active" : "Inactive"}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <TableSkeleton rows={8} columns={5} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isSuperAdmin ? "University Management" : "University Profile"}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {isSuperAdmin 
                            ? "Manage registered universities and programs" 
                            : `Manage programs for ${admin?.entity_name || "your institution"}`}
                    </p>
                </div>
                <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                        setEditingUniversity(null);
                        setIsFormModalOpen(true);
                    }}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    {isSuperAdmin ? "Add University" : "Add Discipline"}
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 flex-1 min-w-[300px]">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search programs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && filterData()}
                                    className="pl-10"
                                />
                            </div>
                            <Button 
                                onClick={filterData}
                                className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                            >
                                Search
                            </Button>
                        </div>

                        <Select value={filterDiscipline} onValueChange={setFilterDiscipline}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Discipline" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Disciplines</SelectItem>
                                {disciplines.map((d) => (
                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filterCity} onValueChange={setFilterCity}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="City" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Cities</SelectItem>
                                {cityOptions.map((city) => (
                                    <SelectItem key={city} value={city}>{city}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filterProvince} onValueChange={setFilterProvince}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Province" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Provinces</SelectItem>
                                {provinceOptions.map((province) => (
                                    <SelectItem key={province} value={province}>{province}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filterDegree} onValueChange={setFilterDegree}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Degree" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Degrees</SelectItem>
                                {degreeOptions.map((degree) => (
                                    <SelectItem key={degree} value={degree}>{degree}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filterFeeType} onValueChange={setFilterFeeType}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Fee Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Fee Types</SelectItem>
                                <SelectItem value="annual">Annual Fee</SelectItem>
                                <SelectItem value="semester">Semester Fee</SelectItem>
                            </SelectContent>
                        </Select>

                        {isSuperAdmin && (
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        )}

                        <Button variant="outline" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Universities List */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {isSuperAdmin ? "Universities" : "Your Programs"} ({filteredUniversities.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredUniversities.length === 0 ? (
                        <div className="text-center py-12">
                            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No programs found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                            {isSuperAdmin ? "University" : "Program Name"}
                                        </th>
                                        {isSuperAdmin && <th className="text-left py-3 px-4 font-semibold text-gray-700">City</th>}
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Discipline</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUniversities.map((uni) => (
                                        <tr key={uni.id || uni._id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4 font-medium">
                                                {isSuperAdmin ? uni.title : getProgramDisplayName(uni)}
                                            </td>
                                            {isSuperAdmin && (
                                                <td className="py-3 px-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {uni.city}
                                                    </div>
                                                </td>
                                            )}
                                            <td className="py-3 px-4 text-sm text-gray-600">{uni.discipline}</td>
                                            <td className="py-3 px-4">
                                                 {getStatusBadge(uni)}
                                             </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedUniversity(uni);
                                                            setIsDetailModalOpen(true);
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4 text-blue-600" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditingUniversity(uni);
                                                            setIsFormModalOpen(true);
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4 text-gray-600" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(getUniversityIdentifier(uni), uni.title)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Detail Modal */}
            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    {selectedUniversity && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{selectedUniversity.title}</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">City</p>
                                        <p className="font-medium">{selectedUniversity.city}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Province</p>
                                        <p className="font-medium">{selectedUniversity.province}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Discipline</p>
                                        <p className="font-medium">{selectedUniversity.discipline}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Status</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {getStatusBadge(selectedUniversity)}
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                className="h-7 px-2 text-[10px] uppercase font-bold"
                                                onClick={() => {
                                                    handleToggleStatus(selectedUniversity);
                                                    setSelectedUniversity({...selectedUniversity, status: selectedUniversity.status === 1 ? 0 : 1});
                                                }}
                                            >
                                                {selectedUniversity.status === 1 ? "Deactivate" : "Activate"}
                                            </Button>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Merit Score</p>
                                        <p className="font-medium">{selectedUniversity.merit}%</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            {selectedUniversity.semesterFee ? "Semester Fee" : "Annual Fee"}
                                        </p>
                                        <p className="font-medium">
                                            PKR {(selectedUniversity.semesterFee || selectedUniversity.fee || 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                
                                {selectedUniversity.info && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Details</p>
                                        <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border">
                                            {selectedUniversity.info}
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Contact</p>
                                        <p className="font-medium">{selectedUniversity.contact || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Website</p>
                                        {selectedUniversity.web ? (
                                            <a href={selectedUniversity.web} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                                Visit Site
                                            </a>
                                        ) : "N/A"}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Add/Edit Form Modal */}
            <UniversityForm
                isOpen={isFormModalOpen}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setEditingUniversity(null);
                }}
                onSuccess={() => {
                    fetchUniversities();
                }}
                university={editingUniversity}
                isSuperAdmin={isSuperAdmin}
            />
        </div>
    );
};

export default CompanyManagementPage;