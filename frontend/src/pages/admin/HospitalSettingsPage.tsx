import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Lock, 
  Building2, 
  MapPin, 
  Globe, 
  Phone, 
  ShieldCheck, 
  Save, 
  Loader2,
  Settings as SettingsIcon,
  Eye,
  EyeOff
} from 'lucide-react';
import axios from 'axios';

const HospitalSettingsPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [profile, setProfile] = useState({
    admin_name: '',
    admin_email: '',
    entity_name: '',
    entity_address: '',
    entity_contact: '',
    official_website: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/settings/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setProfile(res.data.profile);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load profile settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/admin/settings/profile`, profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
        if (res.data.success) {
        toast({ title: 'Success', description: 'Profile updated successfully' });
        
        // Update local storage admin info for real-time UI reflection
        const admin = JSON.parse(localStorage.getItem('admin') || '{}');
        const updatedAdmin = { 
          ...admin, 
          name: profile.admin_name, 
          email: profile.admin_email,
          entity_name: profile.entity_name,
          entity_address: profile.entity_address,
          entity_contact: profile.entity_contact,
          official_website: profile.official_website
        };
        localStorage.setItem('admin', JSON.stringify(updatedAdmin));
        
        // Trigger a custom event so the layout can update without a reload
        window.dispatchEvent(new Event('admin-update'));
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    setChangingPassword(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/admin/settings/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast({ title: 'Success', description: 'Password changed successfully' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse">Synchronizing Hospital Settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Account & Institution</h1>
          <p className="text-slate-500 mt-1">Manage your administrator profile and hospital configuration.</p>
        </div>
        <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm">
          <SettingsIcon className="h-6 w-6 text-emerald-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Section */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-lg">Administrator Profile</CardTitle>
                  <CardDescription>Update your personal and contact details.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        value={profile.admin_name}
                        onChange={(e) => setProfile({...profile, admin_name: e.target.value})}
                        className="pl-10 h-11 border-slate-200 focus:ring-emerald-500" 
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        value={profile.admin_email}
                        onChange={(e) => setProfile({...profile, admin_email: e.target.value})}
                        className="pl-10 h-11 border-slate-200 focus:ring-emerald-500" 
                        placeholder="admin@hospital.com"
                        type="email"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-6">
                    <Building2 className="h-4 w-4 text-emerald-600" />
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Institutional Data</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Hospital Name</Label>
                      <Input 
                        value={profile.entity_name}
                        onChange={(e) => setProfile({...profile, entity_name: e.target.value})}
                        className="h-11 border-slate-200 font-semibold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Official Contact</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                          value={profile.entity_contact}
                          onChange={(e) => setProfile({...profile, entity_contact: e.target.value})}
                          className="pl-10 h-11 border-slate-200"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Institutional Address (City, Province)</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                          value={profile.entity_address}
                          onChange={(e) => setProfile({...profile, entity_address: e.target.value})}
                          className="pl-10 h-11 border-slate-200"
                          placeholder="Lahore, Punjab"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Official Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                          value={profile.official_website}
                          onChange={(e) => setProfile({...profile, official_website: e.target.value})}
                          className="pl-10 h-11 border-slate-200"
                          placeholder="https://hospital.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button disabled={savingProfile} type="submit" className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-slate-200 transition-all hover:scale-[1.02]">
                    {savingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Password Section */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-lg">Security & Privacy</CardTitle>
                  <CardDescription>Update your administrative access password.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500">Current Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="pl-10 pr-10 h-11 border-slate-200 focus:ring-rose-500" 
                    />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="pl-10 pr-10 h-11 border-slate-200 focus:ring-rose-500" 
                      />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="pl-10 h-11 border-slate-200 focus:ring-rose-500" 
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button disabled={changingPassword} type="submit" className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-rose-100 transition-all hover:scale-[1.02]">
                    {changingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                    Update Security Credentials
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200 bg-slate-900 text-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg">Role Information</CardTitle>
              <CardDescription className="text-slate-400 text-xs">Administrative permissions and status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <ShieldCheck className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold">Hospital Administrator</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Verified Status</p>
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Access Level</span>
                  <span className="font-bold text-emerald-400">Institutional</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Platform Mode</span>
                  <span className="font-bold">Healthcare Portal</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Security Level</span>
                  <span className="font-bold text-blue-400">High (Encrypted)</span>
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/10 mt-4">
                <p className="text-[10px] text-slate-400 leading-relaxed italic">
                  Changes to institutional data will be synchronized across all your hospital entries in the public directory in real-time.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 bg-emerald-50/30">
            <CardContent className="p-6 space-y-4">
              <h4 className="text-sm font-bold text-emerald-900">Need Assistance?</h4>
              <p className="text-xs text-emerald-700 leading-relaxed font-medium">
                If you encounter any issues updating your hospital's legal entity information, please contact the Super Admin team for verification support.
              </p>
              <Button variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-bold text-xs h-10">
                Contact Platform Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HospitalSettingsPage;
