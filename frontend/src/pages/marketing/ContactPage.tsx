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
  Sparkles, Clock, Shield, GraduationCap, Building2, Heart,
  Send, MapPin,
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
      <section className="hero-gradient relative overflow-hidden py-20 lg:py-28">
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        {/* Glow */}
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-blue-400/20 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-indigo-400/15 rounded-full blur-[90px] pointer-events-none" />

        <div className="page-container relative z-10 text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-300 animate-pulse" />
            <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">We're here to help</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight">
            Get in <span className="text-blue-300">Touch</span>
          </h1>
          <p className="text-white/60 font-medium text-lg max-w-xl mx-auto leading-relaxed">
            Have a question about universities, government schemes, or healthcare? Our team responds within 24 hours.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-12 pt-6 border-t border-white/10 max-w-md mx-auto">
            <StatChip value="24h" label="Response time" />
            <StatChip value="100%" label="Free support" />
            <StatChip value="3+" label="Modules covered" />
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