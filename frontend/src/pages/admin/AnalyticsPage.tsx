import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    BarChart3,
    TrendingUp,
    Users,
    DollarSign,
    Download,
    Calendar,
    PieChart,
    Activity,
} from "lucide-react";
import { useState } from "react";

const AnalyticsPage = () => {
    const [timeRange, setTimeRange] = useState("month");

    const stats = [
        {
            title: "Total Disbursement",
            value: "PKR 125.5B",
            change: "+12.5%",
            trend: "up",
            icon: DollarSign,
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            title: "Active Beneficiaries",
            value: "2.1M",
            change: "+8.2%",
            trend: "up",
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Schemes Performance",
            value: "87.5%",
            change: "+3.1%",
            trend: "up",
            icon: TrendingUp,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
        },
        {
            title: "Application Rate",
            value: "15,234",
            change: "-2.4%",
            trend: "down",
            icon: Activity,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
        },
    ];

    const categoryData = [
        { name: "Financial Assistance", schemes: 25, beneficiaries: "850K", amount: "PKR 45B" },
        { name: "Healthcare", schemes: 18, beneficiaries: "620K", amount: "PKR 32B" },
        { name: "Education", schemes: 15, beneficiaries: "450K", amount: "PKR 28B" },
        { name: "Housing", schemes: 8, beneficiaries: "180K", amount: "PKR 15B" },
        { name: "Agriculture", schemes: 3, beneficiaries: "50K", amount: "PKR 5.5B" },
    ];

    const provinceData = [
        { name: "Punjab", schemes: 28, beneficiaries: "1.2M", percentage: 45 },
        { name: "Sindh", schemes: 22, beneficiaries: "850K", percentage: 32 },
        { name: "KPK", schemes: 12, beneficiaries: "380K", percentage: 14 },
        { name: "Balochistan", schemes: 7, beneficiaries: "220K", percentage: 9 },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-gray-600 mt-1">Comprehensive insights and performance metrics</p>
                </div>
                <div className="flex gap-3">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">Last Week</SelectItem>
                            <SelectItem value="month">Last Month</SelectItem>
                            <SelectItem value="quarter">Last Quarter</SelectItem>
                            <SelectItem value="year">Last Year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button className="bg-[#7c3aed] hover:bg-[#6d28d9]">
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                                        <Icon className={`h-6 w-6 ${stat.color}`} />
                                    </div>
                                    <span
                                        className={`text-sm font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"
                                            }`}
                                    >
                                        {stat.change}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Category Performance */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Category Performance</CardTitle>
                            <CardDescription>Breakdown by scheme categories</CardDescription>
                        </div>
                        <PieChart className="h-5 w-5 text-gray-400" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {categoryData.map((category, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{category.name}</h4>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                        <span>{category.schemes} schemes</span>
                                        <span>•</span>
                                        <span>{category.beneficiaries} beneficiaries</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-[#7c3aed]">{category.amount}</p>
                                    <p className="text-sm text-gray-600">Total disbursed</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Province Distribution */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Province Distribution</CardTitle>
                            <CardDescription>Geographic coverage and reach</CardDescription>
                        </div>
                        <BarChart3 className="h-5 w-5 text-gray-400" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {provinceData.map((province, index) => (
                            <div key={index}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <h4 className="font-semibold text-gray-900">{province.name}</h4>
                                        <span className="text-sm text-gray-600">
                                            {province.schemes} schemes • {province.beneficiaries} beneficiaries
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{province.percentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-gradient-to-r from-[#7c3aed] to-[#a855f7] h-3 rounded-full transition-all"
                                        style={{ width: `${province.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Trend Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Trends</CardTitle>
                        <CardDescription>Application and approval trends</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
                            <div className="text-center">
                                <BarChart3 className="h-16 w-16 text-[#7c3aed] mx-auto mb-4" />
                                <p className="text-gray-600">Chart visualization would appear here</p>
                                <p className="text-sm text-gray-500 mt-2">Integration with charting library required</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Success Rate</CardTitle>
                        <CardDescription>Scheme completion and satisfaction</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                            <div className="text-center">
                                <TrendingUp className="h-16 w-16 text-green-600 mx-auto mb-4" />
                                <p className="text-gray-600">Success metrics would appear here</p>
                                <p className="text-sm text-gray-500 mt-2">Integration with charting library required</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AnalyticsPage;
