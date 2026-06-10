import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Mail, Lock, ArrowLeft, Shield } from "lucide-react";

const SchemeAdminLogin = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://awaam-assist.onrender.com';
            const response = await fetch(`${apiUrl}/admin/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    admin_email: formData.email,
                    password: formData.password,
                    requiredRole: "scheme_admin",
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                localStorage.setItem("admin", JSON.stringify(data.admin));
                localStorage.setItem("adminToken", data.token);
                localStorage.setItem("adminModule", "scheme");

                toast({
                    title: "Login Successful",
                    description: "Welcome to Scheme Admin Portal",
                });

                navigate("/admin/scheme/dashboard");
            } else {
                toast({
                    title: "Login Failed",
                    description: data.message || "Invalid credentials",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Login error:", error);
            toast({
                title: "Error",
                description: "Failed to connect to server",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => navigate("/admin")}
                    className="mb-4 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Admin Portal
                </Button>

                <Card className="shadow-2xl border-2 border-purple-100">
                    <CardHeader className="space-y-4 pb-6">
                        {/* Logo/Icon */}
                        <div className="flex justify-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] rounded-2xl flex items-center justify-center shadow-lg">
                                <Building2 className="h-10 w-10 text-white" />
                            </div>
                        </div>

                        {/* Title */}
                        <div className="text-center space-y-2">
                            <CardTitle className="text-2xl font-bold text-gray-900">
                                Scheme Admin Portal
                            </CardTitle>
                            <CardDescription className="text-base">
                                Government Schemes & Citizen Benefits Administration
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-700 font-medium">
                                    Admin Email
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@awamassist.gov.pk"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                        className="pl-10 h-12 border-gray-300 focus:border-[#7c3aed] focus:ring-[#7c3aed]"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-gray-700 font-medium">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData({ ...formData, password: e.target.value })
                                        }
                                        className="pl-10 h-12 border-gray-300 focus:border-[#7c3aed] focus:ring-[#7c3aed]"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] hover:from-[#6d28d9] hover:to-[#5b21b6] text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Signing in...
                                    </div>
                                ) : (
                                    <>
                                        <Shield className="mr-2 h-5 w-5" />
                                        Sign In to Scheme Admin
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Footer */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <p className="text-center text-sm text-gray-600">
                                Authorized personnel only. All activities are logged and monitored.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Info */}
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">
                        Need access? Contact your system administrator
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SchemeAdminLogin;
