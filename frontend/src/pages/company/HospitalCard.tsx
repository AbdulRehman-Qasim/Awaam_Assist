import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin, Building2, Activity, Info, Heart, Scale, ExternalLink,
  Stethoscope, Star, ShieldCheck, Zap, Phone, Globe, Clock, BadgeCheck,
  MessageCircle, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/schemeAPI";
import { HospitalRecord } from "@/services/hospitalAPI";
import AppointmentModal from "./AppointmentModal";
import HospitalCategoryRatings from "./HospitalCategoryRatings";

interface HospitalCardProps {
  hospital: HospitalRecord;
}

// ── Star Rating display ──────────────────────────────────────────────────────
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} className={`h-3 w-3 ${i <= Math.round(rating) ? 'text-amber-400 fill-current' : 'text-muted-foreground/30'}`} />
    ))}
    {rating > 0 && <span className="ml-1 text-[10px] font-bold text-muted-foreground">{rating.toFixed(1)}</span>}
  </div>
);

export const HospitalCard: React.FC<HospitalCardProps> = ({ hospital }) => {
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [inCompare, setInCompare] = useState(false);
  const [isOpeningWebsite, setIsOpeningWebsite] = useState(false);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'info' | 'community'>('info');

  const name = hospital['Hospital Name'] || hospital.hospitalName || '';
  const category = hospital.Cateogry || hospital.category || '';
  const isPrivate = category === 'Private';
  const hasTreatments = hospital.treatments && hospital.treatments.length > 0;

  useEffect(() => {
    const favs: HospitalRecord[] = JSON.parse(localStorage.getItem("hospital_favorites") || "[]");
    setIsFavorite(favs.some(h => h._id === hospital._id));
    const compareIds: string[] = JSON.parse(localStorage.getItem("hospital_compare_list") || "[]");
    setInCompare(compareIds.includes(hospital._id));
  }, [hospital._id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const favs: HospitalRecord[] = JSON.parse(localStorage.getItem("hospital_favorites") || "[]");
    if (isFavorite) {
      localStorage.setItem("hospital_favorites", JSON.stringify(favs.filter(h => h._id !== hospital._id)));
      setIsFavorite(false);
      toast({ title: "Removed from Favorites" });
    } else {
      localStorage.setItem("hospital_favorites", JSON.stringify([...favs, hospital]));
      setIsFavorite(true);
      toast({ title: "Added to Favorites", description: "Hospital saved to your favorites." });
    }
  };

  const toggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const compareIds: string[] = JSON.parse(localStorage.getItem("hospital_compare_list") || "[]");
    const compareData: HospitalRecord[] = JSON.parse(localStorage.getItem("hospital_compare_data") || "[]");
    if (inCompare) {
      localStorage.setItem("hospital_compare_list", JSON.stringify(compareIds.filter(id => id !== hospital._id)));
      localStorage.setItem("hospital_compare_data", JSON.stringify(compareData.filter(h => h._id !== hospital._id)));
      setInCompare(false);
      toast({ title: "Removed from Compare" });
    } else {
      if (compareIds.length >= 3) {
        toast({ title: "Limit Reached", description: "Compare up to 3 hospitals.", variant: "destructive" });
        return;
      }
      localStorage.setItem("hospital_compare_list", JSON.stringify([...compareIds, hospital._id]));
      localStorage.setItem("hospital_compare_data", JSON.stringify([...compareData.filter(h => h._id !== hospital._id), hospital]));
      setInCompare(true);
      toast({ title: "Added to Compare" });
    }
  };

  const openHospitalLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsOpeningWebsite(true);
      const response = await api.get(`/api/hospitals/${hospital._id}/website`);
      const website = response.data?.data?.website;
      if (!website) throw new Error('No website returned');
      window.open(website, "_blank", "noopener,noreferrer");
    } catch {
      toast({ title: "Website unavailable", description: "Could not open the hospital website.", variant: "destructive" });
    } finally {
      setIsOpeningWebsite(false);
    }
  };

  return (
    <>
    <Card className="group h-full flex flex-col overflow-hidden border border-border/60 rounded-2xl bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-cyan-200">

      {/* Top accent bar */}
      <div className="h-1 w-full rounded-t-2xl"
        style={{ background: isPrivate ? 'linear-gradient(90deg, #7c3aed, #a855f7)' : 'linear-gradient(90deg, hsl(194 100% 43%), hsl(194 100% 35%))' }}
      />

      <CardHeader className="pb-3 pt-4">
        {/* Category + badges row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex flex-wrap gap-1.5">
            <Badge className="text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full border"
              style={isPrivate
                ? { background: '#f5f3ff', color: '#7c3aed', borderColor: '#ddd6fe' }
                : { background: 'hsl(194 100% 43% / 0.10)', color: 'hsl(194 100% 32%)', borderColor: 'hsl(194 100% 43% / 0.25)' }}>
              <Activity className="h-3 w-3 mr-1" />{category}
            </Badge>
            {hospital.emergencyServices && (
              <Badge className="text-[10px] font-black uppercase tracking-wide px-2 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                <Zap className="h-3 w-3 mr-1" />24/7
              </Badge>
            )}
            {hospital.isVerified && (
              <Badge className="text-[10px] font-black uppercase px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                <ShieldCheck className="h-3 w-3 mr-1" />Verified
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={toggleCompare} title="Compare"
              className={`p-1.5 rounded-full transition-all ${inCompare ? 'text-cyan-600 bg-cyan-50' : 'text-slate-300 hover:text-cyan-500 hover:bg-cyan-50'}`}>
              <Scale className="h-4 w-4" />
            </button>
            <button onClick={toggleFavorite} title="Favorite"
              className={`p-1.5 rounded-full transition-all ${isFavorite ? 'text-rose-500 bg-rose-50' : 'text-slate-300 hover:text-rose-400 hover:bg-rose-50'}`}>
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        <h3 className="font-bold text-base text-foreground line-clamp-1 leading-snug group-hover:text-cyan-700 transition-colors">
          {name}
        </h3>

        {/* Treatment Specialty - Prominent */}
        <div className="mt-1 mb-2">
            <p className="text-sm font-black text-cyan-600 tracking-tight uppercase">
                {hospital.treatmentSpecialty || hospital.treatmentName || "General Care"}
            </p>
        </div>

        {hospital.rating > 0 && (
          <div className="mt-1">
            <StarRating rating={hospital.rating} />
          </div>
        )}
      </CardHeader>

      <CardContent className="flex flex-col flex-1 space-y-2.5 pb-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4 flex-shrink-0 text-cyan-500" />
          <span className="text-sm font-semibold truncate">{hospital.City}</span>
          {hospital.Tehsil && <span className="text-xs text-muted-foreground/60">• {hospital.Tehsil}</span>}
        </div>

        {hospital.availability && (
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full flex-shrink-0 ${
              hospital.availability === 'Available' ? 'bg-emerald-400' :
              hospital.availability === 'Limited' ? 'bg-amber-400' : 'bg-slate-300'
            }`} />
            <span className="text-xs font-semibold text-muted-foreground">{hospital.availability}</span>
          </div>
        )}

        {/* Treatment cost */}
        {hospital.treatmentCost > 0 && (
          <div className="flex items-center gap-2">
            <Stethoscope className="h-3.5 w-3.5 text-cyan-500" />
            <span className="text-xs font-bold text-emerald-600">From PKR {hospital.treatmentCost.toLocaleString()}</span>
          </div>
        )}

        {/* Treatment tags */}
        {hasTreatments && (
          <div className="flex flex-wrap gap-1 mt-1">
            {hospital.treatments.slice(0, 3).map(t => (
              <span key={t._id} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                {t.specialization || t.treatmentName}
              </span>
            ))}
            {hospital.treatments.length > 3 && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                +{hospital.treatments.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Recommendation score */}
        {hospital.matchScore !== undefined && hospital.matchScore > 0 && (
          <div className="flex items-center gap-1.5 mt-1">
            <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${hospital.matchScore}%` }} />
            </div>
            <span className="text-[10px] font-black text-primary">{hospital.matchScore}% Match</span>
          </div>
        )}

        {/* View details & Appointment buttons */}
        <div className="mt-auto pt-3 grid grid-cols-2 gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full rounded-xl border-border/70 font-semibold text-xs group-hover:bg-cyan-50 group-hover:border-cyan-200 group-hover:text-cyan-700 transition-all px-2">
                <Info className="h-3.5 w-3.5 mr-1.5" />View Details
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[640px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
              {/* Hero banner */}
              <div className="relative h-48 flex items-end overflow-hidden"
                style={{ background: isPrivate ? 'linear-gradient(135deg, #1e1b4b, #7c3aed)' : 'linear-gradient(135deg, #042f4a, #0e7490)' }}>
                <div className="absolute top-4 right-8 w-24 h-24 rounded-full bg-white/5" />
                <div className="relative z-10 p-6 w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
                      className="text-[10px] font-black uppercase px-3 py-1 rounded-full">
                      {category} Hospital
                    </Badge>
                    {hospital.isVerified && (
                      <Badge className="text-[10px] font-black bg-emerald-400/30 text-white border-emerald-300/40 px-2 py-1 rounded-full">
                        <ShieldCheck className="h-3 w-3 mr-1" /> Verified
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight">{name}</h2>
                  <p className="text-cyan-300 font-black text-sm uppercase tracking-wider mt-1">
                    {hospital.treatmentSpecialty || hospital.treatmentName || "General Healthcare"}
                  </p>
                  {hospital.rating > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <StarRating rating={hospital.rating} />
                      {hospital.totalReviews > 0 && <span className="text-white/60 text-xs">({hospital.totalReviews} reviews)</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* Tab switcher */}
              <div className="px-6 pt-5 pb-0">
                <div className="flex rounded-xl overflow-hidden border border-border/50 bg-muted/30">
                  {[
                    { id: 'info',      label: 'Hospital Info',       icon: Info },
                    { id: 'community', label: 'Community Ratings',   icon: MessageCircle },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setModalTab(id as 'info' | 'community')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-all ${
                        modalTab === id
                          ? 'bg-white text-cyan-700 shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 space-y-5 bg-card">
                {/* ── Info Tab ──────────────────────────────────────────── */}
                {modalTab === 'info' && (
                  <>
                    {/* Basic info grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Location', icon: MapPin,    value: hospital.City },
                        { label: 'Tehsil',   icon: Building2, value: hospital.Tehsil },
                        { label: 'Category', icon: Activity,  value: category },
                        { label: 'Reg. No',  icon: BadgeCheck, value: `#${hospital.SerialNum || 'N/A'}` },
                        { label: 'Wait Time', icon: Clock,     value: hospital.waitingTime || 'Immediate' },
                        { label: 'Severity', icon: ShieldCheck, value: hospital.severitySupport || 'Basic' },
                      ].map(({ label, icon: Icon, value }) => (
                        <div key={label} className="p-3.5 rounded-xl bg-muted/50 border border-border/50">
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">{label}</p>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-cyan-500 flex-shrink-0" />
                            <p className="text-sm font-bold text-foreground truncate">{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Description */}
                    {hospital.description && (
                      <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">About</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{hospital.description}</p>
                      </div>
                    )}

                    {/* Treatment Features */}
                    {hospital.supportFeatures && hospital.supportFeatures.length > 0 && (
                      <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Facility Features</p>
                        <div className="flex flex-wrap gap-2">
                          {hospital.supportFeatures.map(f => (
                            <span key={f} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card text-xs font-bold text-slate-700 border border-border/60">
                               <Zap className="h-3 w-3 text-emerald-500" /> {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Appointment Requirements */}
                    <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-emerald-600" />
                          <p className="text-sm font-bold text-emerald-900">Appointment Required</p>
                        </div>
                        <Badge variant="outline" className={hospital.appointmentRequired ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}>
                          {hospital.appointmentRequired ? 'YES' : 'NO'}
                        </Badge>
                      </div>
                    </div>

                    {/* Treatments */}
                    {hasTreatments && (
                      <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                          Available Treatments ({hospital.treatments.length})
                        </p>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {hospital.treatments.map(t => (
                            <div key={t._id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50">
                              <div>
                                <p className="text-sm font-bold text-foreground">{t.treatmentName}</p>
                                {t.specialization && <p className="text-xs text-muted-foreground">{t.specialization}</p>}
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`h-1.5 w-1.5 rounded-full ${
                                    t.availability === 'Available' ? 'bg-emerald-400' :
                                    t.availability === 'Limited' ? 'bg-amber-400' : 'bg-slate-300'
                                  }`} />
                                  <span className="text-[10px] font-semibold text-muted-foreground">{t.availability}</span>
                                  {t.isEmergency && <span className="text-[10px] font-black text-rose-600">• Emergency</span>}
                                </div>
                              </div>
                              {t.treatmentCost > 0 && (
                                <div className="text-right">
                                  <p className="text-sm font-black text-emerald-600">PKR {t.treatmentCost.toLocaleString()}</p>
                                  {t.estimatedWaitTime && <p className="text-[10px] text-muted-foreground">{t.estimatedWaitTime}</p>}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Flat treatment fallback */}
                    {!hasTreatments && (
                      <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Treatment Details</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Estimated Cost</p>
                            <p className="text-lg font-black text-emerald-600">PKR {(hospital.treatmentCost || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Availability</p>
                            <p className="text-base font-bold">{hospital.availability || 'Available'}</p>
                          </div>
                        </div>
                        {hospital.info && (
                          <p className="mt-3 text-sm text-muted-foreground leading-relaxed p-3 bg-background/60 rounded-lg">{hospital.info}</p>
                        )}
                      </div>
                    )}

                    {/* Website */}
                    <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Official Website</p>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <p className="text-sm text-muted-foreground">Open the hospital's official website.</p>
                        <Button variant="outline" className="sm:w-auto w-full rounded-xl font-semibold"
                          onClick={openHospitalLink} disabled={isOpeningWebsite}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {isOpeningWebsite ? 'Opening...' : 'Visit Website'}
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {/* ── Community Ratings Tab ──────────────────────────────── */}
                {modalTab === 'community' && (
                  <div className="space-y-4">
                    {/* Banner */}
                    <div
                      className="p-4 rounded-xl text-white"
                      style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <MessageCircle className="h-4 w-4 text-orange-400" />
                        <span className="text-xs font-black text-orange-400 uppercase tracking-wider">Reddit Community</span>
                      </div>
                      <p className="text-sm text-white/80">
                        These ratings are automatically generated from real Reddit community discussions about this hospital — not entered by administrators.
                      </p>
                    </div>

                    {/* The 6 category rating bars */}
                    <HospitalCategoryRatings hospitalId={hospital._id} />
                  </div>
                )}

                {/* ── Footer buttons (always visible) ───────────────────── */}
                <div className="flex items-center gap-3 pt-2">
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="flex-1 rounded-xl font-bold text-slate-500">Close</Button>
                  </DialogTrigger>
                  <Button
                    className="flex-[2] bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold h-11"
                    onClick={() => setIsAppointmentOpen(true)}
                  >
                    <Activity className="h-4 w-4 mr-2" /> Book Appointment
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            className="w-full rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs h-9 transition-all active:scale-95"
            onClick={(e) => {
                e.stopPropagation();
                setIsAppointmentOpen(true);
            }}
          >
            <Zap className="h-3.5 w-3.5 mr-1" /> Book
          </Button>
        </div>
      </CardContent>
    </Card>
      <AppointmentModal 
        isOpen={isAppointmentOpen}
        onClose={() => setIsAppointmentOpen(false)}
        hospital={hospital}
      />
    </>
  );
};

export default HospitalCard;
