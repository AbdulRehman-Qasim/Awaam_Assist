import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
    Settings as SettingsIcon, 
    Lock, 
    Bell, 
    Shield, 
    Database, 
    FileText,
    Save,
    Fingerprint
} from "lucide-react";
import { settingsOptions } from "./mockData";

const Settings = () => {
    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-slate-100 pb-6 md:pb-8">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <Badge className="bg-slate-900 text-white border-none px-3 py-0.5 text-[9px] font-black uppercase tracking-widest">Configuration</Badge>
                        <span className="text-slate-300 font-bold">/</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Parameters</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 uppercase leading-none">
                        System <span className="text-primary-600 italic">Preferences</span>
                    </h1>
                    <p className="text-slate-500 text-base font-medium max-w-2xl leading-snug">
                        Manage your security credentials, notification protocols, and global system overrides.
                    </p>
                </div>
                <Button className="h-11 px-6 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-xl shadow-primary-100 gap-2 text-xs">
                    <Save className="h-4 w-4" />
                    Commit All Changes
                </Button>
            </div>


            <div className="grid grid-cols-1 gap-6 md:gap-8 xl:grid-cols-2">
                <Card className="border-none shadow-xl rounded-xl overflow-hidden bg-white">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                                <Lock className="h-4 w-4 text-primary-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold tracking-tight text-slate-900">Access Security</CardTitle>
                                <CardDescription className="text-slate-400 font-medium text-xs">Rotate your super-admin credentials</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-5">
                        <div className="grid gap-5">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Current Master Password</Label>
                                <Input type="password" placeholder="••••••••••••" className="h-11 rounded-lg border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-mono text-sm" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">New Credential</Label>
                                    <Input type="password" placeholder="Min 12 characters" className="h-11 rounded-lg border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-mono text-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Confirm Identity</Label>
                                    <Input type="password" placeholder="Repeat new credential" className="h-11 rounded-lg border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-mono text-sm" />
                                </div>
                            </div>
                        </div>
                        <Button className="w-full h-10 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all">
                            Update Master Access
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl rounded-xl overflow-hidden bg-white">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                                <FileText className="h-4 w-4 text-indigo-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold tracking-tight text-slate-900">Governance Notes</CardTitle>
                                <CardDescription className="text-slate-400 font-medium text-xs">Internal platform reminders</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Administrative Log</Label>
                            <Textarea placeholder="Document internal policy changes or system maintenance schedules here..." className="min-h-[160px] rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-medium leading-relaxed text-sm" />
                        </div>
                        <Button variant="outline" className="w-full h-10 rounded-lg border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all">
                            Persist Internal Documentation
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-xl rounded-xl overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                                <Fingerprint className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black tracking-tight text-slate-900">Global Overrides</CardTitle>
                                <CardDescription className="font-bold text-slate-400 text-xs">Critical system toggle protocols</CardDescription>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {settingsOptions.map((option, index) => (
                            <div key={option.label} className="group flex items-start justify-between gap-6 rounded-xl border border-slate-100 p-4 hover:bg-slate-50/50 transition-all">
                                <div className="space-y-0.5">
                                    <p className="font-black text-slate-900 uppercase tracking-tight text-xs">{option.label}</p>
                                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{option.description}</p>
                                </div>
                                <Switch 
                                    className="data-[state=checked]:bg-primary-600 scale-90" 
                                    defaultChecked={index !== 1} 
                                />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

        </div>
    );
};

export default Settings;