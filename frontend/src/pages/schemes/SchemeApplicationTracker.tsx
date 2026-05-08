import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    FileText,
    ArrowLeft,
    Plus,
    Eye,
    Trash2,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Calendar,
    Building2,
    User,
    Hash,
    Filter,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sampleSchemes } from "@/data/schemes";

interface Application {
    id: string;
    schemeId: string;
    schemeName: string;
    applicationNumber: string;
    applicantName: string;
    applicationDate: string;
    status: "pending" | "under_review" | "approved" | "rejected" | "documents_required";
    lastUpdated: string;
    notes: string;
    documents: string[];
}

const SchemeApplicationTracker = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [applications, setApplications] = useState<Application[]>([]);
    const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    // New application form state
    const [newApplication, setNewApplication] = useState({
        schemeId: "",
        applicationNumber: "",
        applicantName: "",
        notes: "",
    });

    useEffect(() => {
        // Load applications from localStorage
        const saved = localStorage.getItem("scheme_applications");
        if (saved) {
            const apps = JSON.parse(saved);
            setApplications(apps);
            setFilteredApplications(apps);
        }
    }, []);

    useEffect(() => {
        // Filter applications
        let filtered = applications;

        // Status filter
        if (filterStatus !== "all") {
            filtered = filtered.filter((app) => app.status === filterStatus);
        }

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(
                (app) =>
                    app.schemeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    app.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    app.applicantName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredApplications(filtered);
    }, [applications, filterStatus, searchQuery]);

    const getStatusBadge = (status: Application["status"]) => {
        const statusConfig = {
            pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800", icon: Clock },
            under_review: { label: "Under Review", className: "bg-blue-100 text-blue-800", icon: AlertCircle },
            approved: { label: "Approved", className: "bg-green-100 text-green-800", icon: CheckCircle2 },
            rejected: { label: "Rejected", className: "bg-red-100 text-red-800", icon: XCircle },
            documents_required: { label: "Documents Required", className: "bg-orange-100 text-orange-800", icon: FileText },
        };

        const config = statusConfig[status];
        const Icon = config.icon;

        return (
            <Badge className={config.className}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    const addApplication = () => {
        if (!newApplication.schemeId || !newApplication.applicationNumber || !newApplication.applicantName) {
            toast({
                title: "Incomplete Information",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        const scheme = sampleSchemes.find((s) => s.schemeId === newApplication.schemeId);
        if (!scheme) return;

        const application: Application = {
            id: Date.now().toString(),
            schemeId: newApplication.schemeId,
            schemeName: scheme.schemeName,
            applicationNumber: newApplication.applicationNumber,
            applicantName: newApplication.applicantName,
            applicationDate: new Date().toISOString().split("T")[0],
            status: "pending",
            lastUpdated: new Date().toISOString().split("T")[0],
            notes: newApplication.notes,
            documents: [],
        };

        const newApplications = [...applications, application];
        setApplications(newApplications);
        localStorage.setItem("scheme_applications", JSON.stringify(newApplications));

        setIsAddModalOpen(false);
        setNewApplication({
            schemeId: "",
            applicationNumber: "",
            applicantName: "",
            notes: "",
        });

        toast({
            title: "Application Added",
            description: "Application has been added to your tracker",
        });
    };

    const deleteApplication = (id: string) => {
        const newApplications = applications.filter((app) => app.id !== id);
        setApplications(newApplications);
        localStorage.setItem("scheme_applications", JSON.stringify(newApplications));

        toast({
            title: "Application Deleted",
            description: "Application removed from tracker",
        });
    };

    const viewDetails = (application: Application) => {
        setSelectedApplication(application);
        setIsDetailModalOpen(true);
    };

    if (applications.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate("/schemes/dashboard")}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Application Tracker</h1>
                            <p className="text-gray-600 mt-1">Track your scheme applications</p>
                        </div>
                    </div>
                </div>

                <Card className="p-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-[#7c3aed]/10 flex items-center justify-center">
                            <FileText className="h-8 w-8 text-[#7c3aed]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Yet</h3>
                            <p className="text-gray-600 mb-4">
                                Start tracking your scheme applications to stay updated on their status.
                            </p>
                        </div>
                        <Button
                            className="bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:from-[#6d28d9] hover:to-[#9333ea] text-white"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Application
                        </Button>
                    </div>
                </Card>

                {/* Add Application Modal */}
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Application</DialogTitle>
                            <DialogDescription>
                                Track a new scheme application by entering its details
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="scheme">Scheme *</Label>
                                <Select
                                    value={newApplication.schemeId}
                                    onValueChange={(value) =>
                                        setNewApplication({ ...newApplication, schemeId: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Scheme" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sampleSchemes.map((scheme) => (
                                            <SelectItem key={scheme.schemeId} value={scheme.schemeId}>
                                                {scheme.schemeName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="applicationNumber">Application Number *</Label>
                                <Input
                                    id="applicationNumber"
                                    placeholder="e.g., APP-2024-12345"
                                    value={newApplication.applicationNumber}
                                    onChange={(e) =>
                                        setNewApplication({ ...newApplication, applicationNumber: e.target.value })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="applicantName">Applicant Name *</Label>
                                <Input
                                    id="applicantName"
                                    placeholder="Your full name"
                                    value={newApplication.applicantName}
                                    onChange={(e) =>
                                        setNewApplication({ ...newApplication, applicantName: e.target.value })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Input
                                    id="notes"
                                    placeholder="Any additional notes"
                                    value={newApplication.notes}
                                    onChange={(e) =>
                                        setNewApplication({ ...newApplication, notes: e.target.value })
                                    }
                                />
                            </div>

                            <Button
                                className="w-full bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:from-[#6d28d9] hover:to-[#9333ea] text-white"
                                onClick={addApplication}
                            >
                                Add Application
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/schemes/dashboard")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Application Tracker</h1>
                        <p className="text-gray-600 mt-1">
                            {applications.length} application{applications.length !== 1 ? "s" : ""} tracked
                        </p>
                    </div>
                </div>

                <Button
                    className="bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:from-[#6d28d9] hover:to-[#9333ea] text-white"
                    onClick={() => setIsAddModalOpen(true)}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Application
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <Input
                                placeholder="Search by scheme, application number, or name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-10"
                            />
                        </div>

                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-[200px] h-10">
                                <SelectValue placeholder="Filter by Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="under_review">Under Review</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                                <SelectItem value="documents_required">Documents Required</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Applications List */}
            {filteredApplications.length === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-gray-600">No applications match your filters</p>
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                            setFilterStatus("all");
                            setSearchQuery("");
                        }}
                    >
                        Clear Filters
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredApplications.map((application) => (
                        <Card
                            key={application.id}
                            className="hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => viewDetails(application)}
                        >
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                    {application.schemeName}
                                                </h3>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <Hash className="h-4 w-4" />
                                                        <span>{application.applicationNumber}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <User className="h-4 w-4" />
                                                        <span>{application.applicantName}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {getStatusBadge(application.status)}
                                        </div>

                                        <div className="flex items-center gap-6 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>Applied: {application.applicationDate}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                <span>Updated: {application.lastUpdated}</span>
                                            </div>
                                        </div>

                                        {application.notes && (
                                            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                                <strong>Notes:</strong> {application.notes}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                viewDetails(application);
                                            }}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteApplication(application.id);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add Application Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Application</DialogTitle>
                        <DialogDescription>
                            Track a new scheme application by entering its details
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="scheme">Scheme *</Label>
                            <Select
                                value={newApplication.schemeId}
                                onValueChange={(value) =>
                                    setNewApplication({ ...newApplication, schemeId: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Scheme" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sampleSchemes.map((scheme) => (
                                        <SelectItem key={scheme.schemeId} value={scheme.schemeId}>
                                            {scheme.schemeName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="applicationNumber">Application Number *</Label>
                            <Input
                                id="applicationNumber"
                                placeholder="e.g., APP-2024-12345"
                                value={newApplication.applicationNumber}
                                onChange={(e) =>
                                    setNewApplication({ ...newApplication, applicationNumber: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="applicantName">Applicant Name *</Label>
                            <Input
                                id="applicantName"
                                placeholder="Your full name"
                                value={newApplication.applicantName}
                                onChange={(e) =>
                                    setNewApplication({ ...newApplication, applicantName: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Input
                                id="notes"
                                placeholder="Any additional notes"
                                value={newApplication.notes}
                                onChange={(e) =>
                                    setNewApplication({ ...newApplication, notes: e.target.value })
                                }
                            />
                        </div>

                        <Button
                            className="w-full bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:from-[#6d28d9] hover:to-[#9333ea] text-white"
                            onClick={addApplication}
                        >
                            Add Application
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Detail Modal */}
            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                <DialogContent>
                    {selectedApplication && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{selectedApplication.schemeName}</DialogTitle>
                                <DialogDescription>Application Details</DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm text-gray-600">Application Number</Label>
                                        <p className="font-medium">{selectedApplication.applicationNumber}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-gray-600">Status</Label>
                                        <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-gray-600">Applicant Name</Label>
                                        <p className="font-medium">{selectedApplication.applicantName}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-gray-600">Application Date</Label>
                                        <p className="font-medium">{selectedApplication.applicationDate}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <Label className="text-sm text-gray-600">Last Updated</Label>
                                        <p className="font-medium">{selectedApplication.lastUpdated}</p>
                                    </div>
                                    {selectedApplication.notes && (
                                        <div className="col-span-2">
                                            <Label className="text-sm text-gray-600">Notes</Label>
                                            <p className="font-medium">{selectedApplication.notes}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-gray-200">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => deleteApplication(selectedApplication.id)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                                        Delete Application
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SchemeApplicationTracker;
