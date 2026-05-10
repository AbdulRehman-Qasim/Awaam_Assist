import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Timer,
  Eye,
  ArrowRight,
  ShieldCheck,
  Building2,
  CreditCard
} from 'lucide-react';
import { hospitalAdminAPI, Appointment } from '@/services/hospitalAPI';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface AppointmentManagerProps {
  hospitalId: string;
}

export default function AppointmentManager({ hospitalId }: AppointmentManagerProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (hospitalId) {
      loadAppointments();
    }
  }, [hospitalId]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const res = await hospitalAdminAPI.getHospitalAppointments(hospitalId);
      setAppointments(res.data || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load appointments', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appointmentId: string, status: string, reason?: string) => {
    try {
      setUpdating(true);
      if (status === 'rejected') {
        await hospitalAdminAPI.rejectAppointment(appointmentId, reason || "No reason provided");
      } else {
        await hospitalAdminAPI.updateAppointmentStatus(appointmentId, { status, adminReason: reason });
      }
      toast({ title: 'Success', description: `Appointment ${status} successfully` });
      
      // Update local state
      setAppointments(prev => prev.map(appt => 
        appt._id === appointmentId ? { ...appt, status: status as any, adminReason: reason } : appt
      ));
      
      if (selectedAppointment?._id === appointmentId) {
        setSelectedAppointment(prev => prev ? { ...prev, status: status as any, adminReason: reason } : null);
      }
      
      setIsRejectModalOpen(false);
      setRejectionReason("");
    } catch (error: any) {
      toast({ title: 'Update Failed', description: error.response?.data?.message || 'Failed to update status', variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 uppercase text-[10px] font-black">Pending</Badge>;
      case 'accepted': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 uppercase text-[10px] font-black">Accepted</Badge>;
      case 'waiting': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 uppercase text-[10px] font-black">Waiting</Badge>;
      case 'rejected': return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200 uppercase text-[10px] font-black">Rejected</Badge>;
      default: return <Badge variant="outline" className="uppercase text-[10px] font-black">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200/60 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-4 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-600" />
                Active Appointments
              </CardTitle>
              <CardDescription className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
                Manage and process scheduling requests from patients.
              </CardDescription>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2">
              <Badge variant="outline" className="bg-white font-bold px-3 py-1 text-slate-600 border-slate-200 shadow-sm">
                Total: {appointments.length}
              </Badge>
              <Button variant="ghost" size="sm" onClick={loadAppointments} className="text-slate-400 hover:text-emerald-600 h-8">
                <Timer className="h-4 w-4 mr-2" /> Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Table View - Hidden on Mobile */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/30">
                <TableRow className="border-slate-100 hover:bg-transparent">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-4">Patient Details</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-4">Specialty</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-4">Schedule</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-4">Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Timer className="h-8 w-8 text-emerald-500 animate-spin" />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Fetching appointments...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : appointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Calendar className="h-12 w-12 text-slate-200" />
                        <p className="text-slate-500 font-bold">No appointments found.</p>
                        <p className="text-slate-400 text-xs">Appointments booked by users will appear here.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  appointments.map((appt) => (
                    <TableRow key={appt._id} className="border-slate-50 hover:bg-slate-50/50 transition-colors group">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 group-hover:bg-white transition-colors">
                            <User className="h-4 w-4 text-slate-500" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 leading-tight">{appt.patientName || appt.fullName}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">CNIC: {appt.cnic}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-emerald-700">{appt.treatmentSpecialty}</span>
                          <span className="text-[10px] font-medium text-slate-400">{appt.appointmentType}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                            <Calendar className="h-3 w-3 text-emerald-500" />
                            {format(new Date(appt.appointmentDate), 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mt-1 uppercase">
                            <Clock className="h-3 w-3" />
                            {appt.appointmentTime}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {getStatusBadge(appt.status)}
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => { setSelectedAppointment(appt); setIsDetailModalOpen(true); }}
                          className="h-8 rounded-lg border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 font-bold text-xs"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" /> View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Card View - Mobile Only */}
          <div className="md:hidden divide-y divide-slate-100">
            {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                    <Timer className="h-8 w-8 text-emerald-500 animate-spin" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fetching appointments...</p>
                </div>
            ) : appointments.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-center px-4">
                    <Calendar className="h-12 w-12 text-slate-200" />
                    <p className="text-slate-500 font-bold">No appointments found.</p>
                </div>
            ) : (
                appointments.map((appt) => (
                    <div key={appt._id} className="p-4 space-y-4 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                    <User className="h-4 w-4 text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{appt.patientName || appt.fullName}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] font-bold text-emerald-700">{appt.treatmentSpecialty}</span>
                                        <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">• {appt.appointmentType}</span>
                                    </div>
                                </div>
                            </div>
                            {getStatusBadge(appt.status)}
                        </div>
                        
                        <div className="flex items-center gap-6 py-2 border-y border-slate-50">
                            <div className="space-y-1">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                                <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
                                    <Calendar className="h-3 w-3 text-emerald-500" />
                                    {format(new Date(appt.appointmentDate), 'MMM dd, yyyy')}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Time</p>
                                <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-emerald-500" />
                                    {appt.appointmentTime}
                                </p>
                            </div>
                        </div>

                        <Button 
                            className="w-full h-9 rounded-xl bg-slate-900 text-white font-bold text-xs"
                            onClick={() => { setSelectedAppointment(appt); setIsDetailModalOpen(true); }}
                        >
                            <Eye className="h-3.5 w-3.5 mr-2" /> View Details
                        </Button>
                    </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Appointment Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl flex flex-col max-h-[95vh]">
          <DialogHeader className="p-6 sm:p-8 bg-slate-900 text-white shrink-0 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
                </div>
                <div>
                  <DialogTitle className="text-lg sm:text-xl font-bold">Appointment Intelligence</DialogTitle>
                  <p className="text-slate-400 text-[10px] sm:text-xs font-medium mt-0.5">Comprehensive review of scheduling request.</p>
                </div>
              </div>
              <div className="hidden sm:block">
                {selectedAppointment && getStatusBadge(selectedAppointment.status)}
              </div>
            </div>
            <div className="sm:hidden mt-4">
               {selectedAppointment && getStatusBadge(selectedAppointment.status)}
            </div>
          </DialogHeader>

          {selectedAppointment && (
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-white">
              {/* Patient Info Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <User className="h-4 w-4 text-slate-400" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Patient Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {[
                     { label: 'Patient Name', value: selectedAppointment.patientName || selectedAppointment.fullName, icon: User },
                     { label: 'CNIC', value: selectedAppointment.cnic, icon: CreditCard },
                     { label: 'Email', value: selectedAppointment.email, icon: Mail },
                     { label: 'Phone', value: selectedAppointment.phone, icon: Phone },
                   ].map(({ label, value, icon: Icon }) => (
                     <div key={label} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{label}</p>
                        <div className="flex items-center gap-2.5">
                           <Icon className="h-4 w-4 text-emerald-600 shrink-0" />
                           <p className="text-sm font-bold text-slate-900 truncate">{value}</p>
                        </div>
                     </div>
                   ))}
                </div>
              </div>

              {/* Appointment Context Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Visit Parameters</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-100">
                      <p className="text-[9px] font-black uppercase tracking-widest text-cyan-600 mb-1.5">Schedule Date</p>
                      <div className="flex items-center gap-2.5">
                         <Calendar className="h-4 w-4 text-cyan-600" />
                         <p className="text-sm font-bold text-slate-900">
                           {format(new Date(selectedAppointment.appointmentDate), 'MMM dd, yyyy')}
                         </p>
                      </div>
                   </div>
                   <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                      <p className="text-[9px] font-black uppercase tracking-widest text-indigo-600 mb-1.5">Time Slot</p>
                      <div className="flex items-center gap-2.5">
                         <Clock className="h-4 w-4 text-indigo-600" />
                         <p className="text-sm font-bold text-slate-900">{selectedAppointment.appointmentTime}</p>
                      </div>
                   </div>
                   <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                      <p className="text-[9px] font-black uppercase tracking-widest text-purple-600 mb-1.5">Type</p>
                      <div className="flex items-center gap-2.5">
                         <AlertCircle className="h-4 w-4 text-purple-600" />
                         <p className="text-sm font-bold text-slate-900">{selectedAppointment.appointmentType}</p>
                      </div>
                   </div>
                </div>
              </div>

              {/* Specialty & Cost Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-2">Target Specialty</p>
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-emerald-600" />
                    <span className="text-base font-black text-slate-900">{selectedAppointment.treatmentSpecialty}</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                  <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 mb-2">Estimated Revenue</p>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">PKR</span>
                    <span className="text-base font-black text-slate-900">{selectedAppointment.estimatedCost?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Symptoms / Clinical Details */}
              <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-xl">
                 <div className="flex items-center gap-2 mb-4 opacity-60">
                   <FileText className="h-4 w-4" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Reason for Visit / Symptoms</span>
                 </div>
                 <p className="text-sm font-medium leading-relaxed italic border-l-2 border-emerald-500 pl-4 py-1">
                   "{selectedAppointment.symptoms}"
                 </p>
                 {selectedAppointment.notes && (
                   <div className="mt-4 pt-4 border-t border-white/10">
                     <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1.5">Additional Patient Notes</p>
                     <p className="text-xs text-white/70">{selectedAppointment.notes}</p>
                   </div>
                 )}
              </div>

              {/* Admin Feedback (If Rejected) */}
              {selectedAppointment.status === 'rejected' && selectedAppointment.adminReason && (
                 <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">
                    <div className="flex items-center gap-2 mb-2 text-rose-700">
                       <XCircle className="h-4 w-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Rejection Reason</span>
                    </div>
                    <p className="text-sm font-bold text-rose-900 pl-6">"{selectedAppointment.adminReason}"</p>
                 </div>
              )}
            </div>
          )}

          {/* Action Footer */}
          <DialogFooter className="p-4 sm:p-8 bg-slate-50 border-t border-slate-100 shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
             <div className="flex gap-2">
                <Button variant="outline" className="w-full sm:w-auto font-bold text-slate-500 hover:text-slate-900 border-slate-200" onClick={() => setIsDetailModalOpen(false)}>
                  Close
                </Button>
             </div>
             
             {(selectedAppointment?.status === 'pending' || selectedAppointment?.status === 'waiting') && (
               <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline" 
                    className="border-rose-200 text-rose-600 hover:bg-rose-50 font-bold w-full sm:w-auto"
                    onClick={() => setIsRejectModalOpen(true)}
                  >
                    <XCircle className="h-4 w-4 mr-2" /> Reject
                  </Button>
                  
                  {selectedAppointment?.status === 'pending' && (
                    <Button 
                      variant="outline" 
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 font-bold w-full sm:w-auto"
                      onClick={() => handleUpdateStatus(selectedAppointment._id, 'waiting')}
                    >
                      <Timer className="h-4 w-4 mr-2" /> Move to Waiting
                    </Button>
                  )}

                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg shadow-emerald-100 px-6 w-full sm:w-auto"
                    onClick={() => handleUpdateStatus(selectedAppointment._id, 'accepted')}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Accept Appointment
                  </Button>
               </div>
             )}

             {(selectedAppointment?.status === 'accepted' || selectedAppointment?.status === 'rejected') && (
               <div className="flex items-center gap-2 text-slate-400 justify-center sm:justify-start">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500">Decision Finalized — Records Locked</span>
               </div>
             )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Reason Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white">
           <DialogHeader className="p-6 bg-rose-600 text-white">
              <div className="flex items-center gap-3">
                 <XCircle className="h-6 w-6" />
                 <DialogTitle className="text-lg font-bold">Reject Appointment</DialogTitle>
              </div>
              <DialogDescription className="text-rose-100 font-medium mt-1">
                 Please provide a valid clinical or administrative reason for this rejection.
              </DialogDescription>
           </DialogHeader>
           <div className="p-6 space-y-4">
              <div className="space-y-2">
                 <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Mandatory Reason</Label>
                 <Textarea 
                   value={rejectionReason} 
                   onChange={(e) => setRejectionReason(e.target.value)}
                   className="min-h-[120px] bg-slate-50 border-slate-200 resize-none font-medium" 
                   placeholder="e.g. Doctor is unavailable, schedule conflict, or hospital at full capacity."
                 />
              </div>
              <div className="flex items-center gap-2 text-rose-600 p-3 bg-rose-50 rounded-lg text-xs font-bold leading-tight">
                 <AlertCircle className="h-4 w-4 shrink-0" />
                 This reason will be visible to the patient.
              </div>
           </div>
           <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 flex-row gap-3">
              <Button variant="ghost" className="flex-1 font-bold text-slate-500" onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
              <Button 
                disabled={!rejectionReason.trim() || updating}
                onClick={() => handleUpdateStatus(selectedAppointment!._id, 'rejected', rejectionReason)}
                className="flex-[2] bg-rose-600 hover:bg-rose-700 text-white font-black"
              >
                {updating ? "Processing..." : "Confirm Rejection"}
              </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
