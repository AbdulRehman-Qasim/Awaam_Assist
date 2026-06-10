import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save, Lock, Building2, User, MapPin, X } from "lucide-react";
import { State, City } from 'country-state-city';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface AdminProfileForm {
  admin_name: string;
  admin_email: string;
  entity_name: string;
  entity_address: string;
  entity_contact: string;
  official_website: string;
  current_location: string;
  scheme_province: string;
  scheme_cities: string;
}

const EducationSettingsPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profile, setProfile] = useState<AdminProfileForm>({
    admin_name: "",
    admin_email: "",
    entity_name: "",
    entity_address: "",
    entity_contact: "",
    official_website: "",
    current_location: "",
    scheme_province: "",
    scheme_cities: "",
  });

  const pakistanStates = State.getStatesOfCountry('PK');

  const getCurrentStateCities = () => {
    const state = pakistanStates.find(s => s.name === profile.scheme_province);
    return state ? City.getCitiesOfState('PK', state.isoCode) : [];
  };

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${apiUrl}/admin/settings/profile`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load profile");
        }
        const rawProvince = data.profile.scheme_province || "";
        const addressParts = data.profile.entity_address ? data.profile.entity_address.split(",") : [];
        const fallbackProvince = addressParts.length > 1 ? addressParts[1].trim() : "";

        setProfile({
          admin_name: data.profile.admin_name || "",
          admin_email: data.profile.admin_email || "",
          entity_name: data.profile.entity_name || "",
          entity_address: data.profile.entity_address || "",
          entity_contact: data.profile.entity_contact || "",
          official_website: data.profile.official_website || "",
          current_location: data.profile.current_location || "",
          scheme_province: rawProvince || fallbackProvince,
          scheme_cities: Array.isArray(data.profile.scheme_cities)
            ? data.profile.scheme_cities.join(", ")
            : data.profile.scheme_cities || "",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load settings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [apiUrl, token, toast]);

  const handleProfileSave = async () => {
    setSavingProfile(true);
    try {
      const response = await fetch(`${apiUrl}/admin/settings/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          admin_name: profile.admin_name,
          admin_email: profile.admin_email,
          entity_name: profile.entity_name,
          entity_address: profile.entity_address,
          entity_contact: profile.entity_contact,
          official_website: profile.official_website,
          current_location: profile.current_location,
          scheme_province: profile.scheme_province,
          scheme_cities: profile.scheme_cities,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update profile");
      }

      localStorage.setItem("admin", JSON.stringify(data.admin));
      toast({
        title: "Success",
        description: "Admin profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "All password fields are required",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "New password and confirm password do not match",
        variant: "destructive",
      });
      return;
    }

    setSavingPassword(true);
    try {
      const response = await fetch(`${apiUrl}/admin/settings/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to change password");
      }

      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return <div className="text-gray-600">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage admin profile and university details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Admin Profile
          </CardTitle>
          <CardDescription>Update profile and institution details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="admin_name">Admin Name</Label>
              <Input
                id="admin_name"
                value={profile.admin_name}
                onChange={(e) => setProfile({ ...profile, admin_name: e.target.value.replace(/[^a-zA-Z\s]/g, "") })}
              />
            </div>
            <div>
              <Label htmlFor="admin_email">Admin Email</Label>
              <Input 
                id="admin_email" 
                value={profile.admin_email} 
                onChange={(e) => setProfile({ ...profile, admin_email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="entity_name">University Name</Label>
              <Input
                id="entity_name"
                value={profile.entity_name}
                onChange={(e) => setProfile({ ...profile, entity_name: e.target.value.replace(/[^a-zA-Z\s]/g, "") })}
              />
            </div>
            <div>
              <Label htmlFor="entity_contact">University Contact</Label>
              <Input
                id="entity_contact"
                value={profile.entity_contact}
                onChange={(e) => setProfile({ ...profile, entity_contact: e.target.value.replace(/[^0-9+\-\s]/g, "") })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Province</Label>
              <Select 
                disabled
                value={profile.scheme_province} 
                onValueChange={(v) => setProfile({ ...profile, scheme_province: v, entity_address: v })}
              >
                <SelectTrigger className="bg-slate-50">
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {pakistanStates.map(state => (
                    <SelectItem key={state.isoCode} value={state.name}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>City</Label>
              <Select 
                disabled
                value={profile.entity_address && profile.entity_address.includes(',') ? profile.entity_address.split(',')[0] : ""} 
                onValueChange={(v) => setProfile({ ...profile, entity_address: `${v}, ${profile.scheme_province}` })}
              >
                <SelectTrigger className="bg-slate-50">
                  <SelectValue placeholder={profile.scheme_province ? "Select city" : "Select province first"} />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] bg-white z-[9999]">
                  {getCurrentStateCities().length > 0 ? getCurrentStateCities().map(city => (
                    <SelectItem key={city.name} value={city.name}>
                      {city.name}
                    </SelectItem>
                  )) : (
                    <div className="p-2 text-xs text-slate-500">No cities found</div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="official_website">Official Website</Label>
              <Input
                id="official_website"
                value={profile.official_website}
                onChange={(e) => setProfile({ ...profile, official_website: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleProfileSave} disabled={savingProfile}>
              <Save className="h-4 w-4 mr-2" />
              {savingProfile ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-600" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handlePasswordChange} disabled={savingPassword}>
              <Lock className="h-4 w-4 mr-2" />
              {savingPassword ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Updating university name/address here also syncs linked university profile.
        </CardContent>
      </Card>
    </div>
  );
};

export default EducationSettingsPage;
