import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Mail, Lock, User, ArrowLeft, UserPlus } from 'lucide-react';

const HospitalAdminRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    admin_name: '',
    admin_email: '',
    hospital_name: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: 'Please make sure both passwords are the same',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://awaam-assist.onrender.com';
      const response = await fetch(`${apiUrl}/hospital-admin/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          admin_name: formData.admin_name,
          admin_email: formData.admin_email,
          hospital_name: formData.hospital_name,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Registration failed',
          description: data.message || 'Unable to create hospital admin account',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Registration successful',
        description: 'Hospital admin account created. You can now sign in.',
      });
      navigate('/admin/login?module=hospital');
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
          onClick={() => navigate('/admin/hospital/login')}
          className="mb-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Hospital Login
        </Button>

        <Card className="shadow-xl border border-emerald-100">
          <CardHeader className="space-y-4 pb-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="h-10 w-10 text-white" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-2xl font-bold text-gray-900">Hospital Admin Register</CardTitle>
              <CardDescription className="text-base">
                Create a dedicated hospital admin account
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin_name" className="text-gray-700 font-medium">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="admin_name"
                    value={formData.admin_name}
                    onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin_email" className="text-gray-700 font-medium">Admin Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="admin_email"
                    type="email"
                    value={formData.admin_email}
                    onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hospital_name" className="text-gray-700 font-medium">Hospital Name</Label>
                <Input
                  id="hospital_name"
                  value={formData.hospital_name}
                  onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
                  className="h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                {loading ? 'Creating account...' : (
                  <>
                    <UserPlus className="mr-2 h-5 w-5" />
                    Create Hospital Admin Account
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HospitalAdminRegister;
