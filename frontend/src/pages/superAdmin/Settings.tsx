import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
    Lock, 
    FileText,
    Save
} from "lucide-react";

const Settings = () => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Configuration</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">
                        Manage platform security, global settings, and preferences.
                    </p>
                </div>
                <Button className="rounded-lg h-9 text-xs gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-sm">
                    <Save className="h-3.5 w-3.5" />
                    Save All Changes
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Security Card */}
                <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
                        <div className="flex items-center gap-3">
                            <Lock className="h-4 w-4 text-slate-500" />
                            <CardTitle className="text-sm font-bold text-slate-900">Account Security</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-700">Current Password</Label>
                                <Input type="password" placeholder="••••••••" className="h-9 rounded-lg border-slate-200 text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-slate-700">New Password</Label>
                                    <Input type="password" placeholder="••••••••" className="h-9 rounded-lg border-slate-200 text-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-slate-700">Confirm Password</Label>
                                    <Input type="password" placeholder="••••••••" className="h-9 rounded-lg border-slate-200 text-sm" />
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full h-9 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 mt-2">
                            Change Password
                        </Button>
                    </CardContent>
                </Card>

                {/* Internal Logs/Notes */}
                <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
                        <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-slate-500" />
                            <CardTitle className="text-sm font-bold text-slate-900">Administrative Logs</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-700">Internal Memo</Label>
                            <Textarea placeholder="Note policy changes or system maintenance..." className="min-h-[108px] rounded-lg border-slate-200 text-sm resize-none" />
                        </div>
                        <Button variant="outline" className="w-full h-9 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50">
                            Save Administrative Log
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Settings;