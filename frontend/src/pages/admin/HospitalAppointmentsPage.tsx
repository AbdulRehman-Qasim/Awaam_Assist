import React from 'react';
import AppointmentManager from './AppointmentManager';
import { Calendar } from 'lucide-react';

const HospitalAppointmentsPage = () => {
    const adminRaw = localStorage.getItem("admin");
    const admin = adminRaw ? JSON.parse(adminRaw) : null;
    const isHospitalAdmin = admin?.role === 'hospital_admin';

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                    Appointment Intelligence
                </h1>
                <p className="text-slate-500 text-xs md:text-sm font-medium mt-1">
                    {isHospitalAdmin 
                      ? `Managing patient requests for ${admin?.entity_name}` 
                      : "Administrative control of healthcare scheduling"}
                </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 sm:p-6">
                <AppointmentManager hospitalId={admin?.managed_entity_id} />
            </div>
        </div>
    );
};

export default HospitalAppointmentsPage;
