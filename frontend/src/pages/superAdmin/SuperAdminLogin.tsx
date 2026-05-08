import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2, Globe, AlertCircle } from "lucide-react";
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
            // Note: Super admin login uses the same admin login endpoint but checks for super_admin role
            const response = await api.post("/admin/login", formData);
            
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

                // Store auth data
                localStorage.setItem("adminToken", token);
                localStorage.setItem("admin", JSON.stringify(admin));
                
                toast({
                    title: "Authentication Successful",
                    description: "Welcome back to the Command Center, Chief Administrator.",
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
            {/* Ambient Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="h-20 w-20 rounded-[2rem] bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-200 ring-8 ring-white">
                            <ShieldCheck className="h-10 w-10 text-primary-400" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center justify-center gap-2">
                            <Badge className="bg-slate-900 text-white border-none px-3 py-0.5 text-[10px] font-black uppercase tracking-widest">Root Access</Badge>
                            <span className="text-slate-300 font-bold">|</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Awam Assist</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">
                            Command <span className="text-primary-600 italic">Auth</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-sm">Authorized personnel only. Enterprise governance portal.</p>
                    </div>
                </div>

                <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-500 via-indigo-500 to-primary-500" />
                    <CardHeader className="pt-10 px-10 pb-2">
                        <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-tight">Security Credentials</CardTitle>
                        <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Enter root-level parameters</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 pt-6">
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 group-focus-within:text-primary-600 transition-colors">Admin Identifier</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                        <Input 
                                            type="email" 
                                            placeholder="superadmin@awamassist.com" 
                                            className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50 focus-visible:ring-primary-500 font-bold text-slate-900 placeholder:text-slate-300 transition-all shadow-inner"
                                            required
                                            value={formData.admin_email}
                                            onChange={(e) => setFormData({...formData, admin_email: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 group-focus-within:text-primary-600 transition-colors">Access Token</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                                        <Input 
                                            type="password" 
                                            placeholder="••••••••••••" 
                                            className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50 focus-visible:ring-primary-500 font-bold text-slate-900 placeholder:text-slate-300 transition-all shadow-inner"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full h-16 rounded-[1.5rem] bg-slate-900 hover:bg-primary-600 text-white font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl shadow-slate-200 gap-3 group"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        Initiate Governance Session
                                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Globe className="h-3 w-3 text-emerald-500" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Region: Global Cluster</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3 text-amber-500" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit Active</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] italic">
                    Secure Administrative Interface • 2025 Awam Assist
                </p>
            </div>
        </div>
    );
};

export default SuperAdminLogin;
