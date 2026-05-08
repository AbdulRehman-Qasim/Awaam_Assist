import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { schemeAdminAPI } from "@/services/schemeAPI";
import { Building2, Filter, TrendingUp } from "lucide-react";
import TableSkeleton from "@/components/TableSkeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SchemeAdminDashboard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({ total: 0, active: 0 });
  const [schemes, setSchemes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterProvince, setFilterProvince] = useState("all");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [statsResponse, schemesResponse] = await Promise.all([
          schemeAdminAPI.getDashboardStats(),
          schemeAdminAPI.getAllSchemes(),
        ]);

        if (statsResponse.success) {
          const data = statsResponse.data;
          setOverview({
            total: data.overview?.total || 0,
            active: data.overview?.active || 0,
          });
        }
        setSchemes(schemesResponse.data || []);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  const categoryOptions = useMemo(
    () => Array.from(new Set(schemes.map((scheme: any) => scheme.category).filter(Boolean))).sort(),
    [schemes]
  );
  const provinceOptions = useMemo(
    () => Array.from(new Set(schemes.map((scheme: any) => scheme.province).filter(Boolean))).sort(),
    [schemes]
  );
  const statusOptions = useMemo(
    () => Array.from(new Set(schemes.map((scheme: any) => scheme.status).filter(Boolean))).sort(),
    [schemes]
  );

  const filteredSchemes = useMemo(() => {
    return schemes.filter((scheme: any) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        String(scheme.schemeName || "").toLowerCase().includes(query) ||
        String(scheme.schemeId || "").toLowerCase().includes(query) ||
        String(scheme.department || "").toLowerCase().includes(query);
      const matchesCategory = filterCategory === "all" || scheme.category === filterCategory;
      const matchesStatus = filterStatus === "all" || scheme.status === filterStatus;
      const matchesProvince = filterProvince === "all" || scheme.province === filterProvince;
      return matchesQuery && matchesCategory && matchesStatus && matchesProvince;
    });
  }, [schemes, searchQuery, filterCategory, filterStatus, filterProvince]);

  const recentSchemes = useMemo(
    () =>
      [...filteredSchemes]
        .sort((a: any, b: any) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
        .slice(0, 5),
    [filteredSchemes]
  );

  const clearFilters = () => {
    setSearchQuery("");
    setFilterCategory("all");
    setFilterStatus("all");
    setFilterProvince("all");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scheme Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Quick overview and latest schemes</p>
        </div>
        <Link to="/admin/scheme/schemes">
          <Button className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white">Manage Schemes</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Schemes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? "-" : overview.total}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-[#7c3aed]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Schemes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? "-" : overview.active}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search by name, ID, or department"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-w-[240px] flex-1"
            />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoryOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
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
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={clearFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Schemes (Top 5)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={5} columns={5} />
          ) : recentSchemes.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No schemes found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Scheme ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Scheme Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Province</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSchemes.map((scheme: any) => (
                    <tr key={scheme._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{scheme.schemeId}</td>
                      <td className="py-3 px-4 font-medium">{scheme.schemeName}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{scheme.category}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{scheme.province}</td>
                      <td className="py-3 px-4">
                        <Badge className={scheme.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {scheme.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SchemeAdminDashboard;
