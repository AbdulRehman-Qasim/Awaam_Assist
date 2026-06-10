
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, MapPin, TrendingUp, Settings, PlusCircle } from "lucide-react";
import TableSkeleton from "@/components/TableSkeleton";

interface University {
  id: string;
  _id?: string;
  title: string;
  city: string;
  province: string;
  degree: string;
  discipline: string;
  status: number;
  merit?: number;
  fee?: number;
  semesterFee?: number;
}

const getProgramDisplayName = (program: University) => {
  const discipline = program.discipline || "Program";
  return program.degree ? `${discipline} (${program.degree})` : discipline;
};

const EducationAdminDashboard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState<University[]>([]);

  const adminRaw = localStorage.getItem("admin");
  let admin: any = null;
  try {
    admin = adminRaw ? JSON.parse(adminRaw) : null;
  } catch {
    admin = null;
  }

  const activePrograms = useMemo(
    () => programs.filter((p) => p.status === 1).length,
    [programs]
  );
  const inactivePrograms = useMemo(
    () => programs.filter((p) => p.status !== 1).length,
    [programs]
  );
  const uniqueDisciplines = useMemo(
    () => new Set(programs.map((p) => p.discipline).filter(Boolean)).size,
    [programs]
  );
  const avgMerit = useMemo(() => {
    const merits = programs
      .map((p) => (typeof p.merit === "number" ? p.merit : null))
      .filter((m): m is number => m !== null);
    if (!merits.length) return null;
    return Math.round((merits.reduce((a, b) => a + b, 0) / merits.length) * 10) / 10;
  }, [programs]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("adminToken");
        const apiUrl = import.meta.env.VITE_API_URL || "https://awaam-assist.onrender.com";

        const response = await fetch(`${apiUrl}/admin/companies`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) throw new Error("Failed to fetch dashboard data");

        const data = await response.json();

        if (data.success && Array.isArray(data.universities)) {
          setPrograms(data.universities);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load program dashboard",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {admin?.entity_name || "University"} Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Program and profile overview for {admin?.entity_name || "your institution"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/education/companies">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <PlusCircle className="h-4 w-4 mr-2" />
              Manage Programs
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Programs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {loading ? "-" : programs.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Programs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {loading ? "-" : activePrograms}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Programs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {loading ? "-" : inactivePrograms}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Merit</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {loading ? "-" : avgMerit !== null ? `${avgMerit}%` : "N/A"}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Discipline Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : programs.length === 0 ? (
            <p className="text-gray-500">No programs available yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {[...new Set(programs.map((p) => p.discipline).filter(Boolean))].map((discipline) => (
                <Badge key={discipline} className="bg-blue-50 text-blue-700">
                  {discipline}
                </Badge>
              ))}
              <Badge variant="outline">{uniqueDisciplines} total disciplines</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Programs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={5} columns={5} />
          ) : programs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No programs found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Program</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Discipline</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">City</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.slice(0, 6).map((uni) => (
                    <tr key={uni.id || uni._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{getProgramDisplayName(uni)}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{uni.discipline}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {uni.city}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={uni.status === 1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {uni.status === 1 ? "Active" : "Inactive"}
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

export default EducationAdminDashboard;