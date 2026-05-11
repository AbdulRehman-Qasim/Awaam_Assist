import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Users,
    Search,
    Filter,
    Download,
    Eye,
    Mail,
    Phone,
    MapPin,
    Calendar,
    TrendingUp,
    CheckCircle2,
} from "lucide-react";

const BeneficiariesPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterScheme, setFilterScheme] = useState("all");

    // Sample beneficiaries data
    const beneficiaries = [
        {
            id: "BEN001",
            name: "Ahmed Khan",
            cnic: "42101-1234567-1",
            email: "ahmed.khan@email.com",
            phone: "+92-300-1234567",
            city: "Lahore",
            province: "Punjab",
            scheme: "Ehsaas Emergency Cash",
            status: "Active",
            amountReceived: 50000,
            enrollmentDate: "2024-01-15",
        },
        {
            id: "BEN002",
            name: "Fatima Ali",
            cnic: "42201-2345678-2",
            email: "fatima.ali@email.com",
            phone: "+92-321-2345678",
            city: "Karachi",
            province: "Sindh",
            scheme: "Benazir Income Support",
            status: "Active",
            amountReceived: 120000,
            enrollmentDate: "2023-11-20",
        },
        {
            id: "BEN003",
            name: "Muhammad Hassan",
            cnic: "42301-3456789-3",
            email: "m.hassan@email.com",
            phone: "+92-333-3456789",
            city: "Peshawar",
            province: "Khyber Pakhtunkhwa",
            scheme: "Sehat Sahulat Program",
            status: "Pending",
            amountReceived: 0,
            enrollmentDate: "2024-02-01",
        },
    ];

    const stats = [
        {
            title: "Total Beneficiaries",
            value: "2.5M",
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Active Beneficiaries",
            value: "2.1M",
            icon: CheckCircle2,
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            title: "Total Disbursed",
            value: "PKR 125B",
            icon: TrendingUp,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
        },
        {
            title: "This Month",
            value: "15,234",
            icon: Calendar,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Beneficiaries</h1>
                    <p className="text-gray-600 mt-1">Manage and track scheme beneficiaries</p>
                </div>
                <Button className="bg-[#7c3aed] hover:bg-[#6d28d9]">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                                    </div>
                                    <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                                        <Icon className={`h-6 w-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by name, CNIC, or ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <Select value={filterScheme} onValueChange={setFilterScheme}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="All Schemes" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Schemes</SelectItem>
                                <SelectItem value="ehsaas">Ehsaas Program</SelectItem>
                                <SelectItem value="bisp">BISP</SelectItem>
                                <SelectItem value="sehat">Sehat Sahulat</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Suspended">Suspended</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Beneficiaries List */}
            <Card>
                <CardHeader>
                    <CardTitle>Beneficiaries ({beneficiaries.length})</CardTitle>
                    <CardDescription>View and manage all registered beneficiaries</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {beneficiaries.map((beneficiary) => (
                            <Card key={beneficiary.id} className="border-2">
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {beneficiary.name}
                                                    </h3>
                                                    <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                                                        <span className="font-mono">{beneficiary.id}</span>
                                                        <span>•</span>
                                                        <span>{beneficiary.cnic}</span>
                                                    </div>
                                                </div>
                                                <Badge
                                                    className={
                                                        beneficiary.status === "Active"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-orange-100 text-orange-800"
                                                    }
                                                >
                                                    {beneficiary.status}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Mail className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-600">{beneficiary.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-600">{beneficiary.phone}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <MapPin className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-600">
                                                        {beneficiary.city}, {beneficiary.province}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 text-sm">
                                                <div>
                                                    <span className="text-gray-600">Scheme: </span>
                                                    <span className="font-medium">{beneficiary.scheme}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Amount Received: </span>
                                                    <span className="font-medium text-[#7c3aed]">
                                                        PKR {beneficiary.amountReceived.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Enrolled: </span>
                                                    <span className="font-medium">{beneficiary.enrollmentDate}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 mt-4">
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View Details
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    <Mail className="h-4 w-4 mr-1" />
                                                    Contact
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default BeneficiariesPage;
