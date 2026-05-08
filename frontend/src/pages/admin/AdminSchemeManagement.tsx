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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { schemeAdminAPI } from "@/services/schemeAPI";
import SchemeForm from "@/components/SchemeForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import TableSkeleton from "@/components/TableSkeleton";

const AdminSchemeManagement = () => {
    const { toast } = useToast();

    const [schemes, setSchemes] = useState([]);
    const [filteredSchemes, setFilteredSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");
    const [filterSubCategory, setFilterSubCategory] = useState("all");
    const [filterProvince, setFilterProvince] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterApprovalStatus, setFilterApprovalStatus] = useState("all");
    const [selectedScheme, setSelectedScheme] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingScheme, setEditingScheme] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: "",
        description: "",
        onConfirm: () => { },
    });

    useEffect(() => {
        fetchSchemes();
    }, []);

    useEffect(() => {
        filterSchemes();
    }, [schemes, searchQuery, filterCategory, filterSubCategory, filterProvince, filterStatus, filterApprovalStatus]);

    const fetchSchemes = async () => {
        try {
            setLoading(true);
            const response = await schemeAdminAPI.getAllSchemes();
            setSchemes(response.data || []);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch schemes",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const filterSchemes = () => {
        let filtered = schemes;

        if (searchQuery) {
            filtered = filtered.filter(
                (scheme) =>
                    scheme.schemeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    scheme.schemeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    scheme.department.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (filterCategory !== "all") {
            filtered = filtered.filter((scheme) => scheme.category === filterCategory);
        }

        if (filterSubCategory !== "all") {
            filtered = filtered.filter((scheme) => (scheme.subCategory || "") === filterSubCategory);
        }

        if (filterProvince !== "all") {
            filtered = filtered.filter((scheme) => scheme.province === filterProvince);
        }

        if (filterStatus !== "all") {
            filtered = filtered.filter((scheme) => scheme.status === filterStatus);
        }

        if (filterApprovalStatus !== "all") {
            filtered = filtered.filter((scheme) => scheme.approvalStatus === filterApprovalStatus);
        }

        setFilteredSchemes(filtered);
    };

    const categoryOptions = Array.from(new Set(schemes.map((scheme) => scheme.category).filter(Boolean))).sort();
    const subCategoryOptions = Array.from(new Set(schemes.map((scheme) => scheme.subCategory).filter(Boolean))).sort();
    const provinceOptions = Array.from(new Set(schemes.map((scheme) => scheme.province).filter(Boolean))).sort();
    const approvalStatusOptions = Array.from(new Set(schemes.map((scheme) => scheme.approvalStatus).filter(Boolean))).sort();

    const clearFilters = () => {
        setSearchQuery("");
        setFilterCategory("all");
        setFilterSubCategory("all");
        setFilterProvince("all");
        setFilterStatus("all");
        setFilterApprovalStatus("all");
    };

    const handleDeleteScheme = async (id, schemeName) => {
        setConfirmDialog({
            isOpen: true,
            title: "Delete Scheme",
            description: `Are you sure you want to delete "${schemeName}"? This action cannot be undone.`,
            onConfirm: async () => {
                try {
                    await schemeAdminAPI.deleteScheme(id);
                    toast({
                        title: "Success",
                        description: "Scheme deleted successfully",
                    });
                    fetchSchemes();
                } catch (error) {
                    toast({
                        title: "Error",
                        description: "Failed to delete scheme",
                        variant: "destructive",
                    });
                }
                setConfirmDialog({ ...confirmDialog, isOpen: false });
            },
        });
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await schemeAdminAPI.updateSchemeStatus(id, newStatus);
            toast({
                title: "Success",
                description: "Scheme status updated successfully",
            });
            fetchSchemes();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update scheme status",
                variant: "destructive",
            });
        }
    };

    const getStatusBadge = (scheme) => {
        const statusConfig = {
            Active: "bg-green-100 text-green-800 hover:bg-green-200",
            Inactive: "bg-gray-100 text-gray-800 hover:bg-gray-200",
            Suspended: "bg-orange-100 text-orange-800 hover:bg-orange-200",
            Closed: "bg-red-100 text-red-800 hover:bg-red-200",
        };

        return (
            <Badge 
                className={`cursor-pointer transition-colors ${statusConfig[scheme.status] || "bg-gray-100 text-gray-800"}`}
                onClick={(e) => {
                    e.stopPropagation();
                    const nextStatus = scheme.status === 'Active' ? 'Inactive' : 'Active';
                    handleStatusChange(scheme._id, nextStatus);
                }}
            >
                {scheme.status}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c3aed] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading schemes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Scheme Management</h1>
                    <p className="text-gray-600 mt-1">Manage schemes</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        className="bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:from-[#6d28d9] hover:to-[#9333ea] text-white"
                        onClick={() => {
                            setEditingScheme(null);
                            setIsFormModalOpen(true);
                        }}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Scheme
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 flex-1 min-w-[300px]">
                            <div className="relative flex-1">
                                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                 <Input
                                     placeholder="Search schemes..."
                                     value={searchQuery}
                                     onChange={(e) => setSearchQuery(e.target.value)}
                                     onKeyDown={(e) => e.key === 'Enter' && filterSchemes()}
                                     className="pl-10"
                                 />
                             </div>
                             <Button 
                                 onClick={filterSchemes}
                                 className="bg-[#7c3aed] hover:bg-[#6d28d9] whitespace-nowrap"
                             >
                                 Search
                             </Button>
                         </div>

                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categoryOptions.map((option) => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filterSubCategory} onValueChange={setFilterSubCategory}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {subCategoryOptions.map((option) => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filterProvince} onValueChange={setFilterProvince}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Province" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Provinces</SelectItem>
                                {provinceOptions.map((option) => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
                                <SelectItem value="Suspended">Suspended</SelectItem>
                                <SelectItem value="Closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filterApprovalStatus} onValueChange={setFilterApprovalStatus}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Approval" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Approval</SelectItem>
                                {approvalStatusOptions.map((option) => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button variant="outline" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Schemes Table */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Schemes ({filteredSchemes.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredSchemes.length === 0 ? (
                        <div className="text-center py-12">
                            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No schemes found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredSchemes.map((scheme) => (
                                <Card key={scheme._id} className="border-2">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                            {scheme.schemeName}
                                                        </h3>
                                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                                            <span className="font-mono">{scheme.schemeId}</span>
                                                            <span>•</span>
                                                            <span>{scheme.department}</span>
                                                        </div>
                                                    </div>
                                                    {getStatusBadge(scheme)}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                    <div>
                                                        <p className="text-sm text-gray-600">Category</p>
                                                        <p className="font-medium">{scheme.category}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Province</p>
                                                        <p className="font-medium">{scheme.province}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Benefit Amount</p>
                                                        <p className="font-medium">
                                                            PKR {scheme.benefits.financial.amount.toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedScheme(scheme);
                                                            setIsDetailModalOpen(true);
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>

                                                    <Select
                                                        value={scheme.status}
                                                        onValueChange={(value) => handleStatusChange(scheme._id, value)}
                                                    >
                                                        <SelectTrigger className="w-[140px] h-9">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Active">Active</SelectItem>
                                                            <SelectItem value="Inactive">Inactive</SelectItem>
                                                            <SelectItem value="Suspended">Suspended</SelectItem>
                                                            <SelectItem value="Closed">Closed</SelectItem>
                                                        </SelectContent>
                                                    </Select>

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditingScheme(scheme);
                                                            setIsFormModalOpen(true);
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        Edit
                                                    </Button>

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteScheme(scheme._id, scheme.schemeName)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Detail Modal */}
            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    {selectedScheme && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{selectedScheme.schemeName}</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4 mt-4">
                                <div className="flex items-center justify-between border-b pb-4">
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-500 uppercase tracking-wider font-bold">Current Status</p>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(selectedScheme)}
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={() => {
                                            const nextStatus = selectedScheme.status === 'Active' ? 'Inactive' : 'Active';
                                            handleStatusChange(selectedScheme._id, nextStatus);
                                            setSelectedScheme({...selectedScheme, status: nextStatus});
                                        }}
                                        variant="outline"
                                        className={selectedScheme.status === 'Active' ? "text-red-600 border-red-200 hover:bg-red-50" : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"}
                                    >
                                        {selectedScheme.status === 'Active' ? "Deactivate Scheme" : "Activate Scheme"}
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Scheme ID</p>
                                        <p className="font-medium">{selectedScheme.schemeId}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Status</p>
                                        {getStatusBadge(selectedScheme)}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Category</p>
                                        <p className="font-medium">{selectedScheme.category}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Province</p>
                                        <p className="font-medium">{selectedScheme.province}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Description</p>
                                    <p className="text-gray-900">{selectedScheme.longDescription || selectedScheme.description}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Financial Benefit</p>
                                    <p className="text-2xl font-bold text-[#7c3aed]">
                                        PKR {selectedScheme.benefits.financial.amount.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-600">{selectedScheme.benefits.financial.frequency}</p>
                                </div>

                                {selectedScheme.stats && (
                                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                                        <div>
                                            <p className="text-sm text-gray-600">Beneficiaries</p>
                                            <p className="text-xl font-bold">{selectedScheme.stats.beneficiaries.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Budget</p>
                                            <p className="text-xl font-bold">PKR {(selectedScheme.stats.budgetAllocated / 1000000000).toFixed(1)}B</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Applications</p>
                                            <p className="text-xl font-bold">{selectedScheme.stats.applicationsReceived.toLocaleString()}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Scheme Form Modal */}
            <SchemeForm
                isOpen={isFormModalOpen}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setEditingScheme(null);
                }}
                onSuccess={() => {
                    fetchSchemes();
                }}
                scheme={editingScheme}
            />

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                description={confirmDialog.description}
                variant="danger"
                confirmText="Delete"
            />
        </div>
    );
};

export default AdminSchemeManagement;

