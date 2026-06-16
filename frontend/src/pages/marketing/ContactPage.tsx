import React, { useState } from 'react';
import axios from 'axios';
import MarketingLayout from '@/layouts/MarketingLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import myLogo from '@/assets/mylogo.png';
import {
  Mail, Phone, MessageSquare, ArrowRight, CheckCircle2,
  Clock, Shield, GraduationCap, Building2, Heart,
  Send, MapPin, Headphones, LifeBuoy,
} from 'lucide-react';

/* ─── CONTACT INFO CARD ─── */
const InfoCard = ({ icon: Icon, iconColor, iconBg, title, value, href }: any) => (
  <a
    href={href}
    className="group flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300"
  >
    <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <div>
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{title}</div>
      <div className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{value}</div>
    </div>
  </a>
);

/* ─── STAT CHIP ─── */
const StatChip = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <div className="text-2xl font-black text-white">{value}</div>
    <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{label}</div>
  </div>
);

/* ─── TOPIC ICON MAP ─── */
const TOPIC_ICONS: Record<string, any> = {
  admission: GraduationCap,
  merit: GraduationCap,
  fees: Building2,
  discipline: GraduationCap,
  partnership: Building2,
  healthcare: Heart,
  general: MessageSquare,
};

const TOPICS = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'admission', label: 'Admission Inquiry' },
  { value: 'merit', label: 'Merit Question' },
  { value: 'fees', label: 'Fee Structure' },
  { value: 'discipline', label: 'Discipline Information' },
  { value: 'partnership', label: 'University Partnership' },
  { value: 'healthcare', label: 'Healthcare Support' },
];

/* ═══════════════════════════════════════════
   CONTACT PAGE
═══════════════════════════════════════════ */
const ContactPage = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    topic: 'general',
    message: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, topic: value }));
  };

  const resetForm = () => {
    setFormData({ firstName: '', lastName: '', email: '', topic: 'general', message: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://awaam-assist.onrender.com';
      const response = await axios.post(`${API_BASE_URL}/contact`, formData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });

      if (response.data.success) {
        setSubmitted(true);
        resetForm();
        toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
      } else {
        toast({ title: "Error", description: response.data.message || "Failed to send.", variant: "destructive" });
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Network error. Please try again.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MarketingLayout>

      {/* ─── HERO BANNER ─── */}
      <section className="relative overflow-hidden bg-[#f6f9fc]">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-blue-50 to-transparent" />
        <div className="page-container relative py-14 sm:py-18 lg:py-20">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 shadow-sm">
                <LifeBuoy className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Support Desk</span>
              </div>
              <h1 className="max-w-3xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
                Questions, support, and partnership requests.
              </h1>
              <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-600 sm:text-lg">
                Reach the AwamAssist team for help with universities, government schemes, healthcare access, or platform support.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-blue-100 via-cyan-50 to-emerald-50 blur-2xl" />
              <div className="relative rounded-[2rem] border border-white bg-white p-5 shadow-2xl shadow-blue-100/70">
                <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                    <Headphones className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Response Promise</p>
                    <h2 className="text-lg font-black text-slate-950">Usually within 24 hours</h2>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ['24h', 'Response'],
                    ['100%', 'Free'],
                    ['3+', 'Modules'],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded-2xl bg-slate-50 p-3 text-center">
                      <div className="text-xl font-black text-blue-700">{value}</div>
                      <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MAIN CONTENT ─── */}
      <section className="section bg-background">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 max-w-6xl mx-auto">

            {/* ── LEFT: Info Panel ─────────────────────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Brand blurb */}
              <div className="ds-card space-y-4">
                <div className="flex items-center gap-3">
                  <img src={myLogo} alt="AwamAssist" className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100 shadow-sm" />
                  <div>
                    <div className="font-black text-slate-900">AwamAssist</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Citizen Intelligence Platform</div>
                  </div>
                </div>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Pakistan's AI-powered platform for education, government schemes, and healthcare guidance — free for every citizen.
                </p>
              </div>

              {/* Contact info cards */}
              <div className="space-y-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Direct Contact</div>
                <InfoCard
                  icon={Mail}
                  iconBg="bg-blue-50"
                  iconColor="text-blue-600"
                  title="Email"
                  value="mo733025@gmail.com"
                  href="mailto:mo733025@gmail.com"
                />
                <InfoCard
                  icon={Phone}
                  iconBg="bg-emerald-50"
                  iconColor="text-emerald-600"
                  title="WhatsApp"
                  value="+92 302 0599969"
                  href="https://wa.me/923020599969"
                />
                <InfoCard
                  icon={MapPin}
                  iconBg="bg-violet-50"
                  iconColor="text-violet-600"
                  title="Region"
                  value="Pakistan — Nationwide Platform"
                  href="#"
                />
              </div>

              {/* Response promise */}
              <div className="rounded-2xl overflow-hidden border border-slate-100">
                {[
                  { icon: Clock, text: "Replies within 24 hours on weekdays", color: "text-amber-600", bg: "bg-amber-50" },
                  { icon: Shield, text: "Your data stays fully private", color: "text-blue-600", bg: "bg-blue-50" },
                  { icon: CheckCircle2, text: "Support for all 3 modules", color: "text-emerald-600", bg: "bg-emerald-50" },
                ].map(({ icon: Icon, text, color, bg }) => (
                  <div key={text} className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 last:border-0 bg-white">
                    <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-3.5 h-3.5 ${color}`} />
                    </div>
                    <span className="text-xs font-bold text-slate-600">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Contact Form ─────────────────── */}
            <div className="lg:col-span-3">
              {submitted ? (
                /* Success State */
                <div className="ds-card h-full flex flex-col items-center justify-center py-20 text-center space-y-5 animate-fade-in-up">
                  <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900">Message Sent!</h3>
                    <p className="text-slate-500 font-medium text-sm max-w-xs">
                      We've received your message and will get back to you within 24 hours.
                    </p>
                  </div>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-secondary text-sm"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                /* Form */
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-fade-in-up">
                  {/* Form header */}
                  <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-lg font-black text-slate-900">Send us a Message</h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">All fields are required unless noted</p>
                  </div>

                  <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    {/* Name row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          placeholder="Ahmed"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('firstName')}
                          onBlur={() => setFocusedField(null)}
                          disabled={isSubmitting}
                          required
                          className={`h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-colors ${focusedField === 'firstName' ? 'ring-2 ring-primary/20' : ''}`}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          placeholder="Ali"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('lastName')}
                          onBlur={() => setFocusedField(null)}
                          disabled={isSubmitting}
                          required
                          className={`h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-colors ${focusedField === 'lastName' ? 'ring-2 ring-primary/20' : ''}`}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        disabled={isSubmitting}
                        required
                        className={`h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-colors ${focusedField === 'email' ? 'ring-2 ring-primary/20' : ''}`}
                      />
                    </div>

                    {/* Topic */}
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Topic</Label>
                      <Select value={formData.topic} onValueChange={handleSelectChange} disabled={isSubmitting}>
                        <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white">
                          <SelectValue placeholder="Select a topic" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                          {TOPICS.map(({ value, label }) => {
                            const Icon = TOPIC_ICONS[value] || MessageSquare;
                            return (
                              <SelectItem key={value} value={value} className="rounded-lg cursor-pointer">
                                <div className="flex items-center gap-2">
                                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                                  {label}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Message */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Message</Label>
                        <span className="text-[10px] font-bold text-slate-300">{formData.message.length} / 1000</span>
                      </div>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us how we can help you — be as specific as possible so we can assist you faster."
                        rows={5}
                        value={formData.message}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('message')}
                        onBlur={() => setFocusedField(null)}
                        disabled={isSubmitting}
                        maxLength={1000}
                        required
                        className={`rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-colors resize-none ${focusedField === 'message' ? 'ring-2 ring-primary/20' : ''}`}
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 rounded-xl bg-primary text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
                      style={{ boxShadow: '0 6px 20px hsl(var(--primary) / 0.28)' }}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending…
                        </div>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Message
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

    </MarketingLayout>
  );
};

export default ContactPage;
