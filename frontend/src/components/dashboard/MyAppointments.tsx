import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    Calendar, Clock, MapPin, Activity, 
    CheckCircle2, XCircle, Timer, AlertCircle,
    ChevronRight, Stethoscope, Building2,
    MessageCircle, ShieldAlert, History
} from "lucide-react";
import { hospitalPublicAPI, type Appointment } from "@/services/hospitalAPI";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

const MyAppointments = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const loadAppointments = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const res = await hospitalPublicAPI.getMyAppointments();
            if (res.success) {
                setAppointments(res.data || []);
            }
        } catch (error) {
            console.error("Failed to load appointments", error);
        } finally {
            if (!isSilent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAppointments();
        
        const interval = setInterval(() => {
            loadAppointments(true);
        }, 10000);

        return () => clearInterval(interval);
    }, [loadAppointments]);

    const getStatusStyles = (status: Appointment['status']) => {
        switch (status) {
            case 'pending':
                return {
                    bg: 'bg-amber-50 border-amber-100 text-amber-700',
                    dot: 'bg-amber-400',
                    icon: <Timer className="h-3 w-3" />,
                    label: 'Pending Review'
                };
            case 'accepted':
                return {
                    bg: 'bg-emerald-50 border-emerald-100 text-emerald-700',
                    dot: 'bg-emerald-400',
                    icon: <CheckCircle2 className="h-3 w-3" />,
                    label: 'Accepted'
                };
            case 'waiting':
                return {
                    bg: 'bg-blue-50 border-blue-100 text-blue-700',
                    dot: 'bg-blue-400',
                    icon: <Activity className="h-3 w-3" />,
                    label: 'In Waiting Queue'
                };
            case 'rejected':
                return {
                    bg: 'bg-rose-50 border-rose-100 text-rose-700',
                    dot: 'bg-rose-400',
                    icon: <XCircle className="h-3 w-3" />,
                    label: 'Rejected'
                };
            default:
                return {
                    bg: 'bg-slate-50 border-slate-100 text-slate-700',
                    dot: 'bg-slate-400',
                    icon: <AlertCircle className="h-3 w-3" />,
                    label: status
                };
        }
    };

    if (loading && appointments.length === 0) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 w-full bg-slate-50 animate-pulse rounded-2xl border border-slate-100" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Active Bookings</h3>
                    <p className="text-xs font-bold text-slate-400 mt-1">Track real-time status of your hospital visits.</p>
                </div>
                <Badge variant="outline" className="bg-slate-50 font-bold px-3 py-1 text-slate-500">
                    {appointments.length} Total
                </Badge>
            </div>

            {appointments.length === 0 ? (
                <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 rounded-2xl overflow-hidden">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                            <Calendar className="h-8 w-8 text-slate-200" />
                        </div>
                        <h4 className="text-sm font-black text-slate-900">No Appointments Yet</h4>
                        <p className="text-xs text-slate-500 font-medium mt-1 max-w-[200px]">
                            Once you book a treatment, your tracking details will appear here.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {appointments.map((appt) => {
                        const styles = getStatusStyles(appt.status);
                        return (
                            <Card 
                                key={appt._id} 
                                className="group border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200/50 transition-all cursor-pointer overflow-hidden rounded-2xl"
                                onClick={() => {
                                    setSelectedAppointment(appt);
                                    setIsDetailOpen(true);
                                }}
                            >
                                <CardContent className="p-0">
                                    <div className="p-5">
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-lg shadow-slate-100">
                                                    <Building2 className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                                                        {appt.hospitalName}
                                                    </h4>
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mt-0.5">
                                                        <MapPin className="h-3 w-3" />
                                                        {appt.city}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest",
                                                styles.bg
                                            )}>
                                                <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", styles.dot)} />
                                                {styles.label}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50">
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Specialty</p>
                                                <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
                                                    <Stethoscope className="h-3 w-3 text-emerald-500" />
                                                    {appt.treatmentSpecialty}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Schedule</p>
                                                <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
                                                    <Clock className="h-3 w-3 text-emerald-500" />
                                                    {appt.appointmentDate ? format(new Date(appt.appointmentDate), 'MMM dd') : 'N/A'} @ {appt.appointmentTime}
                                                </p>
                                            </div>
                                        </div>

                                        {appt.status === 'rejected' && appt.adminReason && (
                                            <div className="mt-3 p-3 bg-rose-50/50 rounded-xl border border-rose-100 flex items-start gap-2">
                                                <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Reason for Rejection</p>
                                                    <p className="text-[11px] text-rose-700 font-medium line-clamp-1">{appt.adminReason}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="bg-slate-50 px-5 py-2 flex items-center justify-between group-hover:bg-emerald-50 transition-colors border-t border-slate-100">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID: {appt._id.slice(-6)}</span>
                                        <div className="flex items-center text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                            Details <ChevronRight className="h-3 w-3 ml-0.5" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
                    {selectedAppointment && (
                        <>
                            <DialogHeader className="p-8 bg-slate-900 text-white shrink-0 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                                <div className="relative z-10 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                                            <History className="h-8 w-8 text-emerald-400" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-xl font-black tracking-tight">Booking Tracking</DialogTitle>
                                            <p className="text-slate-400 text-xs font-bold mt-1">Full lifecycle intelligence for your request.</p>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest",
                                        getStatusStyles(selectedAppointment.status).bg
                                    )}>
                                        <span className={cn("h-2 w-2 rounded-full", getStatusStyles(selectedAppointment.status).dot)} />
                                        {getStatusStyles(selectedAppointment.status).label}
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-emerald-600" />
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Medical Provider</h4>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <p className="text-sm font-black text-slate-900">{selectedAppointment.hospitalName}</p>
                                            <p className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-1">
                                                <MapPin className="h-3 w-3" /> {selectedAppointment.city}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Stethoscope className="h-4 w-4 text-emerald-600" />
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Service</h4>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <p className="text-sm font-black text-slate-900">{selectedAppointment.treatmentSpecialty}</p>
                                            <p className="text-xs font-bold text-emerald-600 mt-1">Cost: PKR {selectedAppointment.estimatedCost?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {selectedAppointment.status === 'rejected' && selectedAppointment.adminReason && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4 text-rose-500" />
                                            <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest">Rejection Analysis</h4>
                                        </div>
                                        <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 relative">
                                            <div className="absolute top-4 right-6 opacity-10">
                                                <ShieldAlert className="h-12 w-12 text-rose-900" />
                                            </div>
                                            <p className="text-xs font-black text-rose-600 uppercase tracking-widest mb-2">Hospital Feedback:</p>
                                            <p className="text-sm font-bold text-rose-900 italic leading-relaxed">
                                                "{selectedAppointment.adminReason}"
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-900/5 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Slot</p>
                                            <p className="text-sm font-black text-slate-900 mt-1 flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-emerald-600" />
                                                {selectedAppointment.appointmentDate ? format(new Date(selectedAppointment.appointmentDate), 'EEEE, MMM dd, yyyy') : 'N/A'}
                                            </p>
                                            <p className="text-xs font-bold text-slate-500 mt-1 ml-6">{selectedAppointment.appointmentTime}</p>
                                        </div>
                                        <div className="p-4 bg-slate-900/5 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</p>
                                            <p className="text-sm font-black text-slate-900 mt-1 flex items-center gap-2">
                                                <Activity className="h-4 w-4 text-emerald-600" />
                                                {selectedAppointment.appointmentType}
                                            </p>
                                            <p className="text-xs font-bold text-slate-500 mt-1 ml-6">Priority Booking</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <MessageCircle className="h-4 w-4 text-emerald-600" />
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Symptoms</h4>
                                        </div>
                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-sm font-medium text-slate-600 leading-relaxed italic">
                                            {selectedAppointment.symptoms || "No symptoms described."}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100">
                                <Button 
                                    className="w-full h-12 rounded-2xl bg-slate-900 text-white font-black hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                                    onClick={() => setIsDetailOpen(false)}
                                >
                                    Close Tracker
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MyAppointments;
