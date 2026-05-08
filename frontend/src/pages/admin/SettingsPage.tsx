import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, User, Lock, MapPin, Building2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { State, City } from 'country-state-city';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const SettingsPage = () => {
    const { toast } = useToast();
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
    const token = localStorage.getItem("adminToken");

    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    
    // Country data (Pakistan ISO: PK)
    const pakistanStates = State.getStatesOfCountry('PK');

    const [profile, setProfile] = useState({
        admin_name: "",
        admin_email: "",
        entity_name: "",
        entity_address: "",
        entity_contact: "",
        official_website: "",
        scheme_province: "",
        scheme_department: "",
        scheme_scope: "",
        scheme_cities: "",
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // Helper to get cities for current province
    const getCurrentStateCities = () => {
        const state = pakistanStates.find(s => s.name === profile.scheme_province);
        return state ? City.getCitiesOfState('PK', state.isoCode) : [];
    };

    const handleAddCity = (cityName: string) => {
        const cities = profile.scheme_cities ? profile.scheme_cities.split(", ").filter(Boolean) : [];
        if (!cities.includes(cityName)) {
            setProfile({ ...profile, scheme_cities: [...cities, cityName].join(", ") });
        }
    };

    const handleRemoveCity = (cityName: string) => {
        const cities = profile.scheme_cities ? profile.scheme_cities.split(", ").filter(Boolean) : [];
        setProfile({ ...profile, scheme_cities: cities.filter(c => c !== cityName).join(", ") });
    };

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await fetch(`${apiUrl}/admin/settings/profile`, {
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });
                const data = await response.json();
                if (!response.ok || !data.success) {
                    throw new Error(data.message || "Failed to load settings profile");
                }

                setProfile({
                    admin_name: data.profile.admin_name || "",
                    admin_email: data.profile.admin_email || "",
                    entity_name: data.profile.entity_name || "",
                    entity_address: data.profile.entity_address || "",
                    entity_contact: data.profile.entity_contact || "",
                    official_website: data.profile.official_website || "",
                    scheme_province: data.profile.scheme_province || "",
                    scheme_department: data.profile.scheme_department || "",
                    scheme_scope: data.profile.scheme_scope || "",
                    scheme_cities: Array.isArray(data.profile.scheme_cities)
                        ? data.profile.scheme_cities.join(", ")
                        : "",
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
        loadProfile();
    }, [apiUrl, token, toast]);

    const handleSaveProfile = async () => {
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
                    scheme_province: profile.scheme_province,
                    scheme_department: profile.scheme_department,
                    scheme_scope: profile.scheme_scope,
                    scheme_cities: profile.scheme_cities,
                }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to update profile");
            }

            localStorage.setItem("admin", JSON.stringify(data.admin));
            toast({ title: "Success", description: "Settings updated successfully" });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update settings",
                variant: "destructive",
            });
        } finally {
            setSavingProfile(false);
        }
    };

    const handleChangePassword = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            toast({ title: "Validation Error", description: "All password fields are required", variant: "destructive" });
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast({ title: "Validation Error", description: "Passwords do not match", variant: "destructive" });
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
            toast({ title: "Success", description: "Password updated successfully" });
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
                <h1 className="text-3xl font-bold text-gray-900">Scheme Admin Settings</h1>
                <p className="text-gray-600 mt-1">Update profile, jurisdiction and security settings</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-[#7c3aed]" />
                        Profile
                    </CardTitle>
                    <CardDescription>Basic account and office details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Admin Name</Label>
                            <Input value={profile.admin_name} onChange={(e) => setProfile({ ...profile, admin_name: e.target.value.replace(/[^a-zA-Z\s]/g, "") })} />
                        </div>
                        <div>
                            <Label>Email</Label>
                            <Input value={profile.admin_email} onChange={(e) => setProfile({ ...profile, admin_email: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Head Office Name</Label>
                            <Input value={profile.entity_name} onChange={(e) => setProfile({ ...profile, entity_name: e.target.value.replace(/[^a-zA-Z\s]/g, "") })} />
                        </div>
                        <div>
                            <Label>Official Contact</Label>
                            <Input value={profile.entity_contact} onChange={(e) => setProfile({ ...profile, entity_contact: e.target.value.replace(/[^0-9+\-\s]/g, "") })} />
                        </div>
                    </div>
                    <div>
                        <Label>Head Office Address</Label>
                        <Input value={profile.entity_address} onChange={(e) => setProfile({ ...profile, entity_address: e.target.value })} />
                    </div>
                    <div>
                        <Label>Website</Label>
                        <Input value={profile.official_website} onChange={(e) => setProfile({ ...profile, official_website: e.target.value })} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-[#7c3aed]" />
                        Jurisdiction
                    </CardTitle>
                    <CardDescription>Set province and covered city scope</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Assigned Province</Label>
                            <Input value={profile.scheme_province} disabled className="bg-gray-50 cursor-not-allowed" />
                        </div>
                        <div>
                            <Label>Scope</Label>
                            <Input value={profile.scheme_scope} disabled className="bg-gray-50 cursor-not-allowed" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Covered Cities</Label>
                        <div className="flex flex-wrap gap-2 mb-2 p-2 border rounded-md bg-gray-50 min-h-[40px]">
                            {profile.scheme_cities ? profile.scheme_cities.split(", ").map(city => (
                                <Badge key={city} variant="secondary" className="flex items-center gap-1 bg-white border">
                                    {city}
                                    <X 
                                        className="h-3 w-3 cursor-pointer hover:text-red-500" 
                                        onClick={() => handleRemoveCity(city)}
                                    />
                                </Badge>
                            )) : (
                                <span className="text-xs text-gray-400 py-1">No cities selected</span>
                            )}
                        </div>
                        <Select onValueChange={handleAddCity}>
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Add a city..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                {getCurrentStateCities().map(city => (
                                    <SelectItem key={city.name} value={city.name}>
                                        {city.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleSaveProfile} disabled={savingProfile} className="bg-[#7c3aed] hover:bg-[#6d28d9]">
                            <Save className="h-4 w-4 mr-2" />
                            {savingProfile ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-[#7c3aed]" />
                        Security
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label>Current Password</Label>
                            <Input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} />
                        </div>
                        <div>
                            <Label>New Password</Label>
                            <Input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
                        </div>
                        <div>
                            <Label>Confirm Password</Label>
                            <Input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleChangePassword} disabled={savingPassword} className="bg-[#7c3aed] hover:bg-[#6d28d9]">
                            <Lock className="h-4 w-4 mr-2" />
                            {savingPassword ? "Updating..." : "Change Password"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6 text-sm text-gray-600 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    These settings control your scheme-head identity and jurisdiction.
                </CardContent>
            </Card>
        </div>
    );
};

export default SettingsPage;
