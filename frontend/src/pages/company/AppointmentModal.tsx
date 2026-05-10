import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Stethoscope, 
  User, 
  CreditCard, 
  Phone, 
  Mail, 
  FileText,
  AlertCircle,
  Building2,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { hospitalPublicAPI, HospitalRecord } from "@/services/hospitalAPI";
import { format } from "date-fns";

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospital: HospitalRecord;
}

const TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM", 
  "12:00 PM", "02:00 PM", "03:00 PM", 
  "04:00 PM", "05:00 PM"
];

const APPOINTMENT_TYPES = ["Routine", "Emergency", "Follow-up"];

export default function AppointmentModal({ isOpen, onClose, hospital }: AppointmentModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    cnic: "",
    email: "",
    phone: "",
    appointmentDate: "",
    appointmentTime: "",
    appointmentType: "Routine",
    symptoms: "",
    notes: ""
  });

  // Pre-fill user data
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const profileData = user.data || {};
      setFormData(prev => ({
        ...prev,
        fullName: profileData.student_name || "",
        email: profileData.student_email || "",
      }));
    }
  }, [isOpen]);

  const validateCNIC = (cnic: string) => /^\d{5}-\d{7}-\d{1}$/.test(cnic);
  const validatePhone = (phone: string) => /^\d{10,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!validateCNIC(formData.cnic)) {
      toast({ title: "Invalid CNIC", description: "Format must be 00000-0000000-0", variant: "destructive" });
      return;
    }
    if (!validatePhone(formData.phone)) {
      toast({ title: "Invalid Phone", description: "Please enter a valid phone number", variant: "destructive" });
      return;
    }
    if (!formData.appointmentDate || !formData.appointmentTime) {
      toast({ title: "Missing Info", description: "Please select a date and time", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await hospitalPublicAPI.bookAppointment({
        ...formData,
        patientName: formData.fullName, // Map fullName to patientName
        hospitalId: hospital._id,
        hospitalName: hospital['Hospital Name'] || hospital.hospitalName,
        treatmentSpecialty: hospital.treatmentSpecialty || 'General Consultation',
        city: hospital.City,
        estimatedCost: hospital.treatmentCost || 0
      });

      setIsSuccess(true);
      toast({ title: "Success!", description: "Your appointment has been booked." });
      
      // Delay closing to show success state
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch (error: any) {
      toast({ 
        title: "Booking Failed", 
        description: error.response?.data?.message || "Something went wrong.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px] text-center p-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-900">Appointment Booked!</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              Your request for <strong>{hospital.hospitalName || hospital['Hospital Name']}</strong> has been submitted. 
              The hospital staff will review and confirm your slot.
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-white border-none shadow-2xl">
        <div className="flex flex-col h-[90vh] md:h-auto max-h-[95vh]">
          {/* Header */}
          <DialogHeader className="p-8 bg-slate-900 text-white relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
            <DialogTitle className="text-2xl font-black flex items-center gap-3 relative z-10">
              <Stethoscope className="h-6 w-6 text-cyan-400" />
              Book Hospital Appointment
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-medium relative z-10">
              Secure your slot at {hospital.hospitalName || hospital['Hospital Name']}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {/* Section 1: Hospital Context */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-cyan-50/50 border border-cyan-100/50">
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-600 mb-2">Institution</p>
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-cyan-600" />
                  <span className="font-bold text-slate-900">{hospital.hospitalName || hospital['Hospital Name']}</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-2">Specialty</p>
                <div className="flex items-center gap-3">
                  <Stethoscope className="h-5 w-5 text-indigo-600" />
                  <span className="font-bold text-slate-900">{hospital.treatmentSpecialty || 'General Consultation'}</span>
                </div>
              </div>
            </div>

            {/* Section 2: Personal Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <User className="h-4 w-4 text-slate-400" />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-xs font-bold text-slate-700">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input id="fullName" value={formData.fullName} onChange={handleInputChange} className="pl-10 h-11 bg-slate-50/50" placeholder="Enter your full name" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnic" className="text-xs font-bold text-slate-700">CNIC Number</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input id="cnic" value={formData.cnic} onChange={handleInputChange} className="pl-10 h-11 bg-slate-50/50" placeholder="00000-0000000-0" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-700">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input id="email" type="email" value={formData.email} onChange={handleInputChange} className="pl-10 h-11 bg-slate-50/50" placeholder="your@email.com" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-bold text-slate-700">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input id="phone" value={formData.phone} onChange={handleInputChange} className="pl-10 h-11 bg-slate-50/50" placeholder="03XXXXXXXXX" required />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Scheduling */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <CalendarIcon className="h-4 w-4 text-slate-400" />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Scheduling & Type</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="appointmentDate" className="text-xs font-bold text-slate-700">Preferred Date</Label>
                  <Input 
                    id="appointmentDate" 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]} 
                    value={formData.appointmentDate} 
                    onChange={handleInputChange} 
                    className="h-11 bg-slate-50/50" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700">Time Slot</Label>
                  <Select onValueChange={(val) => setFormData(prev => ({...prev, appointmentTime: val}))}>
                    <SelectTrigger className="h-11 bg-slate-50/50">
                      <SelectValue placeholder="Select Slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map(slot => (
                        <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700">Visit Type</Label>
                  <Select onValueChange={(val) => setFormData(prev => ({...prev, appointmentType: val}))} defaultValue="Routine">
                    <SelectTrigger className="h-11 bg-slate-50/50">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {APPOINTMENT_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 4: Medical Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <FileText className="h-4 w-4 text-slate-400" />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Medical Symptoms</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="symptoms" className="text-xs font-bold text-slate-700">Reason for Visit / Symptoms</Label>
                  <Textarea 
                    id="symptoms" 
                    value={formData.symptoms} 
                    onChange={handleInputChange} 
                    className="min-h-[100px] bg-slate-50/50 resize-none" 
                    placeholder="Describe your symptoms or reason for the appointment..." 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-xs font-bold text-slate-700">Additional Notes (Optional)</Label>
                  <Input 
                    id="notes" 
                    value={formData.notes} 
                    onChange={handleInputChange} 
                    className="h-11 bg-slate-50/50" 
                    placeholder="Any other information for the doctor?" 
                  />
                </div>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="flex gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-800">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-[11px] font-medium leading-relaxed">
                By booking, you agree to show up 15 minutes early. In case of <strong>Emergency</strong>, please visit the ER directly. 
                Estimated Cost: <strong>PKR {hospital.treatmentCost?.toLocaleString() || '0'}</strong> (Subject to change based on actual treatment).
              </p>
            </div>
          </form>

          {/* Actions */}
          <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100 sm:justify-between flex-row items-center gap-4">
            <Button type="button" variant="ghost" onClick={onClose} className="font-bold text-slate-500 hover:text-slate-900 h-12 px-6">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading}
              className="bg-slate-900 hover:bg-slate-800 text-white font-black text-sm h-12 px-10 shadow-xl shadow-slate-200"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing…
                </div>
              ) : (
                "Confirm Appointment"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
