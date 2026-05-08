import React, { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

type AdminModule = 'education' | 'scheme' | 'hospital';
type AdminRole = 'super_admin' | 'education_admin' | 'scheme_admin' | 'hospital_admin';

const AdminLoginPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    admin_email: '',
    password: '',
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const getDefaultModule = (): AdminModule => {
    const moduleFromQuery = searchParams.get('module');
    if (moduleFromQuery === 'scheme') return 'scheme';
    if (moduleFromQuery === 'hospital') return 'hospital';
    if (moduleFromQuery === 'education') return 'education';

    if (location.pathname.includes('/admin/scheme/')) return 'scheme';
    if (location.pathname.includes('/admin/hospital/')) return 'hospital';
    return 'education';
  };

  const [selectedModule, setSelectedModule] = useState<AdminModule>(getDefaultModule());

  const moduleMeta = {
    education: {
      label: 'University',
      role: 'education_admin',
      dashboardPath: '/admin/education/dashboard',
    },
    scheme: {
      label: 'Scheme',
      role: 'scheme_admin',
      dashboardPath: '/admin/scheme/dashboard',
    },
    hospital: {
      label: 'Hospital',
      role: 'hospital_admin',
      dashboardPath: '/admin/hospital/dashboard',
    },
  } as const;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const loginUrl = `${apiUrl}/admin/login`;

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_email: formData.admin_email,
          password: formData.password,
          requiredRole: moduleMeta[selectedModule].role,
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (data?.token && data?.admin) {
          const adminRole = data.admin.role as AdminRole | undefined;
          const moduleByRole: Record<AdminRole, string> = {
            super_admin: 'super_admin',
            education_admin: 'education',
            scheme_admin: 'scheme',
            hospital_admin: 'hospital',
          };

          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('admin', JSON.stringify(data.admin));
          localStorage.setItem('adminModule', adminRole ? moduleByRole[adminRole] : selectedModule);

          toast({
            title: "Login successful",
            description: `Welcome to ${moduleMeta[selectedModule].label} admin dashboard.`,
          });

          if (adminRole === 'super_admin') {
            navigate('/super-admin/dashboard');
            return;
          }

          if (adminRole === 'scheme_admin') {
            navigate('/admin/scheme/dashboard');
            return;
          }

          if (adminRole === 'hospital_admin') {
            navigate('/admin/hospital/dashboard');
            return;
          }

          navigate('/admin/education/dashboard');
          return;
        }

        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Login response was missing admin session data.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: data.message || "Invalid email or password. Please try again.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "An error occurred during login. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials and select portal type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3 rounded-md border p-3">
              <Label className="text-sm font-medium">Login As</Label>
              <RadioGroup
                value={selectedModule}
                onValueChange={(value) => setSelectedModule(value as AdminModule)}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3"
              >
                <label className="flex items-center gap-2 rounded-md border p-2 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="hospital" id="module-hospital" />
                  <span className="text-sm">Hospital</span>
                </label>
                <label className="flex items-center gap-2 rounded-md border p-2 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="scheme" id="module-scheme" />
                  <span className="text-sm">Scheme</span>
                </label>
                <label className="flex items-center gap-2 rounded-md border p-2 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="education" id="module-education" />
                  <span className="text-sm">Uni</span>
                </label>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin_email">Email</Label>
              <Input
                id="admin_email"
                name="admin_email"
                placeholder="admin@.com"
                type="email"
                value={formData.admin_email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a
                  className="text-sm text-primary-600 hover:underline"
                  href="/admin/forgot-password"
                >
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            className="w-full bg-primary-600 hover:bg-primary-700 py-6 text-lg font-bold shadow-lg shadow-primary-100"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Authenticating..." : "Sign In to Dashboard"}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-slate-600">
              Institutional partner?{" "}
              <button
                type="button"
                onClick={() => navigate('/admin/register')}
                className="text-primary-600 hover:underline font-bold"
              >
                Register Your Entity
              </button>
            </p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              Secure Admin Gateway
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminLoginPage;