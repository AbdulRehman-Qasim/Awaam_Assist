import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, MapPin, Tags } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { hospitalAdminAPI, HospitalDashboardStats } from '@/services/hospitalAPI';

const HospitalAdminDashboard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<HospitalDashboardStats>({
    overview: {
      totalHospitals: 0,
      totalCities: 0,
      totalCategories: 0,
    },
    recentHospitals: [],
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await hospitalAdminAPI.getDashboardStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load hospital dashboard',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [toast]);

  const hospital = stats.recentHospitals[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hospital Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Your hospital overview</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Hospital</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : !hospital ? (
            <p className="text-sm text-gray-500">No hospitals found.</p>
          ) : (
            <div className="space-y-4 rounded-lg border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50">
                  <Building2 className="h-5 w-5 text-emerald-700" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{hospital.hospitalName}</p>
                  <p className="text-sm text-gray-500">Hospital profile linked to your account</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-md bg-gray-50 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">City</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-cyan-700" />
                    {hospital.City}
                  </p>
                </div>
                <div className="rounded-md bg-gray-50 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Tehsil</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{hospital.Tehsil}</p>
                </div>
                <div className="rounded-md bg-gray-50 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Category</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Tags className="h-4 w-4 text-blue-700" />
                    {hospital.category}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HospitalAdminDashboard;
