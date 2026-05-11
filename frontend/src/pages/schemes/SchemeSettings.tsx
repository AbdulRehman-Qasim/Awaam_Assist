import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ArrowLeft,
    Save,
    Bell,
    User,
    MapPin,
    DollarSign,
    Trash2,
    Download,
    Upload,
    Settings as SettingsIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserPreferences {
    // Profile
    name: string;
    email: string;
    phone: string;
    province: string;
    city: string;

    // Eligibility Defaults
    defaultIncome: string;
    defaultAge: string;
    defaultCategory: string;
    defaultEmploymentStatus: string;

    // Notifications
    emailNotifications: boolean;
    smsNotifications: boolean;
    newSchemeAlerts: boolean;
    applicationUpdates: boolean;
    deadlineReminders: boolean;

    // Display Preferences
    itemsPerPage: string;
    defaultSort: string;
    showProvincialOnly: boolean;
}

const SchemeSettings = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [preferences, setPreferences] = useState<UserPreferences>({
        // Profile
        name: "",
        email: "",
        phone: "",
        province: "Punjab",
        city: "",

        // Eligibility Defaults
        defaultIncome: "",
        defaultAge: "",
        defaultCategory: "all",
        defaultEmploymentStatus: "all",

        // Notifications
        emailNotifications: true,
        smsNotifications: false,
        newSchemeAlerts: true,
        applicationUpdates: true,
        deadlineReminders: true,

        // Display Preferences
        itemsPerPage: "9",
        defaultSort: "relevance",
        showProvincialOnly: false,
    });

    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        // Load preferences from localStorage
        const saved = localStorage.getItem("scheme_user_preferences");
        if (saved) {
            setPreferences(JSON.parse(saved));
        } else {
            // Try to load user data from existing user object
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    const userData = parsed.data || {};
                    setPreferences((prev) => ({
                        ...prev,
                        name: userData.student_name || userData.name || "",
                        email: userData.email || "",
                    }));
                } catch (error) {
                    console.error("Error reading user data:", error);
                }
            }
        }
    }, []);

    const handleChange = (field: keyof UserPreferences, value: any) => {
        setPreferences((prev) => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const savePreferences = () => {
        localStorage.setItem("scheme_user_preferences", JSON.stringify(preferences));
        setHasChanges(false);

        toast({
            title: "Settings Saved",
            description: "Your preferences have been saved successfully",
        });
    };

    const resetToDefaults = () => {
        const defaultPreferences: UserPreferences = {
            name: preferences.name,
            email: preferences.email,
            phone: "",
            province: "Punjab",
            city: "",
            defaultIncome: "",
            defaultAge: "",
            defaultCategory: "all",
            defaultEmploymentStatus: "all",
            emailNotifications: true,
            smsNotifications: false,
            newSchemeAlerts: true,
            applicationUpdates: true,
            deadlineReminders: true,
            itemsPerPage: "9",
            defaultSort: "relevance",
            showProvincialOnly: false,
        };

        setPreferences(defaultPreferences);
        setHasChanges(true);

        toast({
            title: "Reset to Defaults",
            description: "Settings have been reset to default values",
        });
    };

    const exportData = () => {
        const data = {
            preferences,
            favorites: JSON.parse(localStorage.getItem("scheme_favorites") || "[]"),
            compareList: JSON.parse(localStorage.getItem("scheme_compare_list") || "[]"),
            applications: JSON.parse(localStorage.getItem("scheme_applications") || "[]"),
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `awam-assist-data-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        toast({
            title: "Data Exported",
            description: "Your data has been downloaded",
        });
    };

    const clearAllData = () => {
        if (confirm("Are you sure you want to clear all your data? This action cannot be undone.")) {
            localStorage.removeItem("scheme_favorites");
            localStorage.removeItem("scheme_compare_list");
            localStorage.removeItem("scheme_applications");
            localStorage.removeItem("scheme_user_preferences");

            toast({
                title: "Data Cleared",
                description: "All your scheme data has been cleared",
            });

            // Reset to defaults
            resetToDefaults();
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/schemes/dashboard")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                        <p className="text-gray-600 mt-1">Manage your preferences and account settings</p>
                    </div>
                </div>

                {hasChanges && (
                    <Button
                        className="bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:from-[#6d28d9] hover:to-[#9333ea] text-white"
                        onClick={savePreferences}
                    >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                    </Button>
                )}
            </div>

            {/* Profile Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-[#7c3aed]" />
                        Profile Information
                    </CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={preferences.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                placeholder="Your full name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={preferences.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                placeholder="your.email@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={preferences.phone}
                                onChange={(e) => handleChange("phone", e.target.value)}
                                placeholder="+92 300 1234567"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="province">Province</Label>
                            <Select
                                value={preferences.province}
                                onValueChange={(value) => handleChange("province", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Punjab">Punjab</SelectItem>
                                    <SelectItem value="Sindh">Sindh</SelectItem>
                                    <SelectItem value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</SelectItem>
                                    <SelectItem value="Balochistan">Balochistan</SelectItem>
                                    <SelectItem value="Gilgit-Baltistan">Gilgit-Baltistan</SelectItem>
                                    <SelectItem value="Azad Jammu & Kashmir">Azad Jammu & Kashmir</SelectItem>
                                    <SelectItem value="Islamabad Capital Territory">Islamabad Capital Territory</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                value={preferences.city}
                                onChange={(e) => handleChange("city", e.target.value)}
                                placeholder="Your city"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Eligibility Defaults */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-[#7c3aed]" />
                        Eligibility Defaults
                    </CardTitle>
                    <CardDescription>
                        Set default values for the eligibility checker to save time
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="defaultIncome">Default Monthly Income (PKR)</Label>
                            <Input
                                id="defaultIncome"
                                type="number"
                                value={preferences.defaultIncome}
                                onChange={(e) => handleChange("defaultIncome", e.target.value)}
                                placeholder="e.g., 25000"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="defaultAge">Default Age</Label>
                            <Input
                                id="defaultAge"
                                type="number"
                                value={preferences.defaultAge}
                                onChange={(e) => handleChange("defaultAge", e.target.value)}
                                placeholder="e.g., 25"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="defaultCategory">Default Category</Label>
                            <Select
                                value={preferences.defaultCategory}
                                onValueChange={(value) => handleChange("defaultCategory", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">No Default</SelectItem>
                                    <SelectItem value="Student">Student</SelectItem>
                                    <SelectItem value="Youth">Youth</SelectItem>
                                    <SelectItem value="Farmer">Farmer</SelectItem>
                                    <SelectItem value="Business Owner">Business Owner</SelectItem>
                                    <SelectItem value="Low Income Family">Low Income Family</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="defaultEmploymentStatus">Default Employment Status</Label>
                            <Select
                                value={preferences.defaultEmploymentStatus}
                                onValueChange={(value) => handleChange("defaultEmploymentStatus", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">No Default</SelectItem>
                                    <SelectItem value="Employed">Employed</SelectItem>
                                    <SelectItem value="Unemployed">Unemployed</SelectItem>
                                    <SelectItem value="Self-Employed">Self-Employed</SelectItem>
                                    <SelectItem value="Student">Student</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-[#7c3aed]" />
                        Notification Preferences
                    </CardTitle>
                    <CardDescription>Choose how you want to be notified</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Email Notifications</Label>
                            <p className="text-sm text-gray-600">Receive updates via email</p>
                        </div>
                        <Switch
                            checked={preferences.emailNotifications}
                            onCheckedChange={(checked) => handleChange("emailNotifications", checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>SMS Notifications</Label>
                            <p className="text-sm text-gray-600">Receive updates via SMS</p>
                        </div>
                        <Switch
                            checked={preferences.smsNotifications}
                            onCheckedChange={(checked) => handleChange("smsNotifications", checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>New Scheme Alerts</Label>
                            <p className="text-sm text-gray-600">Get notified when new schemes are added</p>
                        </div>
                        <Switch
                            checked={preferences.newSchemeAlerts}
                            onCheckedChange={(checked) => handleChange("newSchemeAlerts", checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Application Updates</Label>
                            <p className="text-sm text-gray-600">Get notified about application status changes</p>
                        </div>
                        <Switch
                            checked={preferences.applicationUpdates}
                            onCheckedChange={(checked) => handleChange("applicationUpdates", checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Deadline Reminders</Label>
                            <p className="text-sm text-gray-600">Receive reminders for application deadlines</p>
                        </div>
                        <Switch
                            checked={preferences.deadlineReminders}
                            onCheckedChange={(checked) => handleChange("deadlineReminders", checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Display Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <SettingsIcon className="h-5 w-5 text-[#7c3aed]" />
                        Display Preferences
                    </CardTitle>
                    <CardDescription>Customize how schemes are displayed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="itemsPerPage">Items Per Page</Label>
                            <Select
                                value={preferences.itemsPerPage}
                                onValueChange={(value) => handleChange("itemsPerPage", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="6">6 schemes</SelectItem>
                                    <SelectItem value="9">9 schemes</SelectItem>
                                    <SelectItem value="12">12 schemes</SelectItem>
                                    <SelectItem value="18">18 schemes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="defaultSort">Default Sort Order</Label>
                            <Select
                                value={preferences.defaultSort}
                                onValueChange={(value) => handleChange("defaultSort", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="relevance">Relevance</SelectItem>
                                    <SelectItem value="name">Name (A-Z)</SelectItem>
                                    <SelectItem value="benefit-high">Benefit (High to Low)</SelectItem>
                                    <SelectItem value="benefit-low">Benefit (Low to High)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Show Provincial Schemes Only</Label>
                            <p className="text-sm text-gray-600">
                                Only show schemes from your province by default
                            </p>
                        </div>
                        <Switch
                            checked={preferences.showProvincialOnly}
                            onCheckedChange={(checked) => handleChange("showProvincialOnly", checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5 text-[#7c3aed]" />
                        Data Management
                    </CardTitle>
                    <CardDescription>Export or clear your data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" onClick={exportData}>
                            <Download className="h-4 w-4 mr-2" />
                            Export My Data
                        </Button>

                        <Button variant="outline" onClick={resetToDefaults}>
                            <Upload className="h-4 w-4 mr-2" />
                            Reset to Defaults
                        </Button>

                        <Button variant="outline" onClick={clearAllData} className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear All Data
                        </Button>
                    </div>

                    <p className="text-sm text-gray-600">
                        Your data is stored locally on your device. Exporting allows you to back up your
                        favorites, applications, and preferences.
                    </p>
                </CardContent>
            </Card>

            {/* Save Button (Bottom) */}
            {hasChanges && (
                <div className="flex justify-center">
                    <Button
                        size="lg"
                        className="bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:from-[#6d28d9] hover:to-[#9333ea] text-white"
                        onClick={savePreferences}
                    >
                        <Save className="h-4 w-4 mr-2" />
                        Save All Changes
                    </Button>
                </div>
            )}
        </div>
    );
};

export default SchemeSettings;
