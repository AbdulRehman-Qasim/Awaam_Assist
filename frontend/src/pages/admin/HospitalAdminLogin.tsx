import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Mail, Lock, ArrowLeft, ShieldPlus } from 'lucide-react';

const HospitalAdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://awaam-assist.onrender.com';
      const response = await fetch(`${apiUrl}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          admin_email: formData.email,
          password: formData.password,
          requiredRole: 'hospital_admin',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('admin', JSON.stringify(data.admin));
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminModule', 'hospital');

        toast({
          title: 'Login Successful',
          description: 'Welcome to Hospital Admin Portal',
        });

        navigate('/admin/hospital/dashboard');
      } else {
        toast({
          title: 'Login Failed',
          description: data.message || 'Invalid credentials',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to connect to server',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin')}
          className="mb-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin Portal
        </Button>

        <Card className="shadow-xl border border-emerald-100">
          <CardHeader className="space-y-4 pb-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="h-10 w-10 text-white" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <CardTitle className="text-2xl font-bold text-gray-900">Hospital Admin Portal</CardTitle>
              <CardDescription className="text-base">
                Manage hospitals, filters, and directory operations
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Admin Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="hospital-admin@awamassist.gov.pk"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-semibold"
              >
                {loading ? 'Signing in...' : (
                  <>
                    <ShieldPlus className="mr-2 h-5 w-5" />
                    Sign In to Hospital Admin
                  </>
                )}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-600">
              Need a hospital admin account?{' '}
              <button
                type="button"
                onClick={() => navigate('/admin/hospital/register')}
                className="text-emerald-700 hover:underline font-medium"
              >
                Register here
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HospitalAdminLogin;
