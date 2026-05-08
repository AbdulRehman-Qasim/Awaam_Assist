import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    FileText,
    Download,
    Calendar,
    Users,
    DollarSign,
    TrendingUp,
    FileSpreadsheet,
    FilePieChart,
    FileBarChart,
    Clock,
} from "lucide-react";

const ReportsPage = () => {
    const reportTypes = [
        {
            icon: FileText,
            title: "Scheme Performance Report",
            description: "Comprehensive analysis of all schemes",
            lastGenerated: "2024-02-20",
            size: "2.5 MB",
            format: "PDF",
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            icon: Users,
            title: "Beneficiaries Report",
            description: "Complete beneficiary database export",
            lastGenerated: "2024-02-19",
            size: "5.8 MB",
            format: "Excel",
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            icon: DollarSign,
            title: "Financial Disbursement Report",
            description: "Detailed financial transactions",
            lastGenerated: "2024-02-18",
            size: "1.2 MB",
            format: "PDF",
            color: "text-purple-600",
            bgColor: "bg-purple-50",
        },
        {
            icon: TrendingUp,
            title: "Analytics Summary",
            description: "Key metrics and performance indicators",
            lastGenerated: "2024-02-17",
            size: "850 KB",
            format: "PDF",
            color: "text-orange-600",
            bgColor: "bg-orange-50",
        },
        {
            icon: FileSpreadsheet,
            title: "Category-wise Breakdown",
            description: "Schemes grouped by categories",
            lastGenerated: "2024-02-16",
            size: "1.5 MB",
            format: "Excel",
            color: "text-teal-600",
            bgColor: "bg-teal-50",
        },
        {
            icon: FilePieChart,
            title: "Province Distribution Report",
            description: "Geographic distribution analysis",
            lastGenerated: "2024-02-15",
            size: "980 KB",
            format: "PDF",
            color: "text-indigo-600",
            bgColor: "bg-indigo-50",
        },
    ];

    const scheduledReports = [
        {
            name: "Monthly Performance Report",
            frequency: "Monthly",
            nextRun: "2024-03-01",
            recipients: "admin@gov.pk, director@gov.pk",
            status: "Active",
        },
        {
            name: "Weekly Beneficiary Update",
            frequency: "Weekly",
            nextRun: "2024-02-26",
            recipients: "team@gov.pk",
            status: "Active",
        },
        {
            name: "Quarterly Financial Summary",
            frequency: "Quarterly",
            nextRun: "2024-04-01",
            recipients: "finance@gov.pk",
            status: "Active",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
                    <p className="text-gray-600 mt-1">Generate and download comprehensive reports</p>
                </div>
                <Button className="bg-[#7c3aed] hover:bg-[#6d28d9]">
                    <FileText className="h-4 w-4 mr-2" />
                    Create Custom Report
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">156</p>
                            </div>
                            <FileText className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">This Month</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">24</p>
                            </div>
                            <Calendar className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">8</p>
                            </div>
                            <Clock className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Size</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">45 MB</p>
                            </div>
                            <Download className="h-8 w-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Available Reports */}
            <Card>
                <CardHeader>
                    <CardTitle>Available Reports</CardTitle>
                    <CardDescription>Generate and download pre-configured reports</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {reportTypes.map((report, index) => {
                            const Icon = report.icon;
                            return (
                                <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className={`w-12 h-12 ${report.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                                            <Icon className={`h-6 w-6 ${report.color}`} />
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-2">{report.title}</h3>
                                        <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                            <span>Last: {report.lastGenerated}</span>
                                            <Badge variant="outline">{report.format}</Badge>
                                        </div>
                                        <Button className="w-full" variant="outline">
                                            <Download className="h-4 w-4 mr-2" />
                                            Download ({report.size})
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Scheduled Reports */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Scheduled Reports</CardTitle>
                            <CardDescription>Automated report generation and delivery</CardDescription>
                        </div>
                        <Button variant="outline">
                            <Clock className="h-4 w-4 mr-2" />
                            Add Schedule
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {scheduledReports.map((report, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{report.name}</h4>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {report.frequency}
                                        </span>
                                        <span>Next: {report.nextRun}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">To: {report.recipients}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-green-100 text-green-800">{report.status}</Badge>
                                    <Button variant="outline" size="sm">
                                        Edit
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ReportsPage;
