import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/schemeAPI";

const SuperAdminLogin = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        admin_email: "",
        password: ""
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await api.post("/admin/login", {
                ...formData,
                requiredRole: 'super_admin'
            });
            
            if (response.data.success) {
                const { token, admin } = response.data;
                
                if (admin.role !== 'super_admin') {
                    toast({
                        variant: "destructive",
                        title: "Access Denied",
                        description: "These credentials do not have super administrative privileges.",
                    });
                    setIsLoading(false);
                    return;
                }

                localStorage.setItem("adminToken", token);
                localStorage.setItem("admin", JSON.stringify(admin));
                
                toast({
                    title: "Success",
                    description: "Authenticated successfully.",
                });

                navigate("/super-admin/dashboard");
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: error.response?.data?.message || "Invalid credentials or server connection refused.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Soft decorative gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-200/50 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-200/50 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2 pointer-events-none" />
            
            <div className="w-full max-w-md space-y-8 relative z-10 animate-in fade-in duration-700">
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-6">
                        <div className="h-16 w-16 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl shadow-slate-200">
                            <ShieldCheck className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Control Panel</h1>
                    <p className="text-slate-500 text-sm font-medium">Please sign in with your super-admin credentials.</p>
                </div>

                <Card className="border-slate-200 shadow-2xl rounded-2xl bg-white overflow-hidden">
                    <CardHeader className="pt-8 px-8 pb-0">
                        <CardTitle className="text-lg font-bold text-slate-900">Sign In</CardTitle>
                        <CardDescription className="text-xs font-medium text-slate-400">Enter your official identification</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-6">
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-xs font-semibold text-slate-700">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input 
                                            id="email"
                                            type="email" 
                                            placeholder="admin@awamassist.pk" 
                                            className="h-10 pl-10 rounded-lg border-slate-200 text-sm font-medium focus-visible:ring-slate-900"
                                            required
                                            value={formData.admin_email}
                                            onChange={(e) => setFormData({...formData, admin_email: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="password" className="text-xs font-semibold text-slate-700">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input 
                                            id="password"
                                            type="password" 
                                            placeholder="••••••••" 
                                            className="h-10 pl-10 rounded-lg border-slate-200 text-sm font-medium focus-visible:ring-slate-900"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full h-11 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all shadow-lg gap-2"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        Access Dashboard
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-slate-100 border border-slate-200">
                    <Info className="h-3.5 w-3.5 text-slate-400" />
                    <p className="text-[11px] font-medium text-slate-500">
                        This session is encrypted and subject to administrative auditing.
                    </p>
                </div>

                <p className="text-center text-[11px] font-semibold text-slate-300 uppercase tracking-widest">
                    Awam Assist Platform Control • 2025
                </p>
            </div>
        </div>
    );
};

// Internal Label helper to avoid import error if it's missing in some contexts
const Label = ({ children, className, ...props }: any) => (
    <label className={`text-xs font-semibold text-slate-700 ${className}`} {...props}>
        {children}
    </label>
);

export default SuperAdminLogin;
