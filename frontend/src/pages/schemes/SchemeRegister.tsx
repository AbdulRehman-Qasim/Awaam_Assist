import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, User, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const SchemeRegister = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Password Mismatch",
                description: "Passwords do not match",
                variant: "destructive",
            });
            return;
        }

        if (formData.password.length < 6) {
            toast({
                title: "Weak Password",
                description: "Password must be at least 6 characters",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post("http://localhost:5001/register", {
                student_name: formData.name,
                student_email: formData.email,
                password: formData.password,
            });

            // Backend returns 201 with message on success
            if (response.status === 201 || response.data.message) {
                toast({
                    title: "Registration Successful",
                    description: "Your citizen account has been created",
                });

                // Auto-login after registration
                localStorage.setItem("user", JSON.stringify(response.data));
                navigate("/schemes/dashboard");
            }
        } catch (error: any) {
            toast({
                title: "Registration Failed",
                description: error.response?.data?.message || "Unable to create account",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#7c3aed]/10 via-white to-[#a855f7]/10 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(124,58,237,0.15),transparent)]" />

            <div className="w-full max-w-md relative z-10">
                {/* Back to Home */}
                <Button
                    variant="ghost"
                    className="mb-4"
                    onClick={() => navigate("/")}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                </Button>

                <Card className="border-2 border-[#7c3aed]/20 shadow-xl">
                    <CardHeader className="space-y-4 text-center">
                        {/* Logo */}
                        <div className="flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#a855f7] shadow-lg">
                                <Building2 className="h-8 w-8 text-white" />
                            </div>
                        </div>

                        <div>
                            <CardTitle className="text-2xl font-bold text-gray-900">
                                Create Citizen Account
                            </CardTitle>
                            <CardDescription className="text-base mt-2">
                                Join Awam Assist to discover government benefits
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name Field */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="pl-10 h-11"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="your.email@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="pl-10 h-11"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="pl-10 pr-10 h-11"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm your password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="pl-10 pr-10 h-11"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full h-11 bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:from-[#6d28d9] hover:to-[#9333ea] text-white shadow-lg"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Creating account...</span>
                                    </div>
                                ) : (
                                    "Create Citizen Account"
                                )}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                            </div>
                        </div>

                        {/* Login Link */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                <Link
                                    to="/schemes/login"
                                    className="font-semibold text-[#7c3aed] hover:text-[#6d28d9]"
                                >
                                    Sign in to your account
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="text-center text-sm text-gray-600 mt-6">
                    By creating an account, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
};

export default SchemeRegister;
