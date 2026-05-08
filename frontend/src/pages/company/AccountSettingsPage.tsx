import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import emailjs from "@emailjs/browser";
import { Spinner } from '@/components/ui/spinner';
import {
  Eye, EyeOff, Save, Mail, Shield, User, Lock,
  CheckCircle2, AlertCircle, KeyRound, ArrowRight,
  Sparkles, Settings2,
} from 'lucide-react';

/* ─── SECTION CARD ─── */
const Section = ({ icon: Icon, iconColor, iconBg, title, subtitle, children }: any) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-100 bg-slate-50/40">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <h2 className="font-black text-slate-900 text-sm">{title}</h2>
        {subtitle && <p className="text-[11px] text-slate-400 font-medium mt-0.5">{subtitle}</p>}
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

/* ─── FIELD ROW ─── */
const FieldRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</Label>
    {children}
  </div>
);

/* ─── PASSWORD INPUT ─── */
const PasswordInput = ({ id, value, onChange, placeholder, show, onToggle, disabled }: any) => (
  <div className="relative">
    <Input
      id={id}
      type={show ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="h-11 rounded-xl pr-11 border-slate-200 bg-slate-50/50 focus:bg-white transition-colors"
    />
    <button
      type="button"
      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
      onClick={onToggle}
    >
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  </div>
);

/* ═══════════════════════════════════════════════
   ACCOUNT SETTINGS PAGE
═══════════════════════════════════════════════ */
const AccountSettingsPage = () => {
  const [companyName, setCompanyName]         = useState('');
  const [email, setEmail]                     = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw]     = useState(false);
  const [showNewPw, setShowNewPw]             = useState(false);
  const [showConfirmPw, setShowConfirmPw]     = useState(false);
  const [nameLoading, setNameLoading]         = useState(false);
  const [emailLoading, setEmailLoading]       = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [initialLoading, setInitialLoading]   = useState(true);
  const [authProvider, setAuthProvider]       = useState('email');

  // PIN Modal
  const [showPinModal, setShowPinModal]     = useState(false);
  const [pinCode, setPinCode]               = useState('');
  const [pinLoading, setPinLoading]         = useState(false);
  const [pinSent, setPinSent]               = useState(false);
  const [newEmailValue, setNewEmailValue]   = useState('');
  const [generatedPin, setGeneratedPin]     = useState('');

  const { toast } = useToast();

  /* ── Derived state ── */
  const passwordStrength = newPassword.length === 0 ? 0 : newPassword.length < 6 ? 1 : newPassword.length < 10 ? 2 : 3;
  const passwordsMatch   = confirmPassword.length > 0 && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) throw new Error('No session');
      const parsed   = JSON.parse(storedUser);
      const userData = parsed.data || {};
      const studentId = userData._id;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/company/profile?studentId=${encodeURIComponent(studentId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCompanyName(data.data.studentName || '');
          setEmail(data.data.email || '');
          setAuthProvider(data.data.authProvider || 'email');
          return;
        }
      }
      setCompanyName(userData.student_name || userData.name || '');
      setEmail(userData.student_email || userData.email || '');
    } catch {
      toast({ title: 'Error', description: 'Failed to load profile.', variant: 'destructive' });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleUpdateName = async () => {
    if (!companyName.trim()) {
      toast({ title: 'Error', description: 'Name cannot be empty.', variant: 'destructive' });
      return;
    }
    setNameLoading(true);
    try {
      const parsed   = JSON.parse(localStorage.getItem('user') || '{}');
      const userData = parsed.data || {};
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/company/profile/update-name`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: userData._id, companyName: companyName.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: 'Name updated!', description: 'Your display name has been saved.' });
      } else throw new Error(data.message);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to update name.', variant: 'destructive' });
    } finally {
      setNameLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast({ title: 'Error', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }
    setNewEmailValue(email.trim());
    setShowPinModal(true);
    setPinSent(false);
    setPinCode('');
  };

  const generateAndSendPin = async () => {
    setPinLoading(true);
    try {
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedPin(pin);
      await emailjs.send(
        "service_mz4y2ep", "template_qngarip",
        { to_email: newEmailValue, to_name: companyName || "User", pin_code: pin },
        "PC68xGq2t9ivv3MXw"
      );
      setPinSent(true);
      toast({ title: 'Code Sent!', description: `Verification code sent to ${newEmailValue}` });
    } catch {
      toast({ title: 'Error', description: 'Failed to send code. Please retry.', variant: 'destructive' });
    } finally {
      setPinLoading(false);
    }
  };

  const verifyPinAndUpdateEmail = async () => {
    if (!pinCode.trim()) { toast({ title: 'Error', description: 'Enter the verification code.', variant: 'destructive' }); return; }
    if (pinCode.trim() !== generatedPin) { toast({ title: 'Wrong Code', description: 'Incorrect code. Please try again.', variant: 'destructive' }); return; }
    setPinLoading(true);
    try {
      const parsed   = JSON.parse(localStorage.getItem('user') || '{}');
      const userData = parsed.data || {};
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/company/profile/update-email`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: userData._id, email: newEmailValue }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: 'Email updated!', description: 'Your email address has been changed.' });
        setShowPinModal(false);
        setPinCode(''); setPinSent(false); setNewEmailValue(''); setGeneratedPin('');
      } else throw new Error(data.message);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to update email.', variant: 'destructive' });
    } finally {
      setPinLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) { toast({ title: 'Mismatch', description: 'Passwords do not match.', variant: 'destructive' }); return; }
    if (newPassword.length < 6) { toast({ title: 'Too short', description: 'Password must be at least 6 characters.', variant: 'destructive' }); return; }
    setPasswordLoading(true);
    try {
      const parsed   = JSON.parse(localStorage.getItem('user') || '{}');
      const userData = parsed.data || {};
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/company/password/change`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: userData._id, currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: 'Password changed!', description: 'Your password has been updated.' });
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      } else throw new Error(data.message);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to change password.', variant: 'destructive' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const closePinModal = () => {
    setShowPinModal(false);
    setPinCode(''); setPinSent(false); setNewEmailValue(''); setGeneratedPin('');
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-3">
        <Spinner size="lg" />
        <p className="text-sm font-bold text-slate-400">Loading your settings…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* ── Page Header ── */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg flex-shrink-0"
          style={{ boxShadow: '0 6px 16px hsl(var(--primary) / 0.30)' }}>
          <Settings2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-sm text-slate-500 font-medium">Manage your profile information and security</p>
        </div>
      </div>

      {/* ── Avatar Preview ── */}
      <div className="bg-gradient-to-r from-primary to-blue-500 rounded-2xl p-6 flex items-center gap-5 shadow-lg"
        style={{ boxShadow: '0 8px 24px hsl(var(--primary) / 0.25)' }}>
        <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-2xl font-black flex-shrink-0">
          {companyName ? companyName.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
        </div>
        <div>
          <div className="text-white font-black text-lg">{companyName || 'Your Name'}</div>
          <div className="text-white/70 text-sm font-medium">{email}</div>
          <div className="inline-flex items-center gap-1.5 mt-1.5 bg-white/15 rounded-full px-2.5 py-0.5">
            <Sparkles className="w-3 h-3 text-yellow-300" />
            <span className="text-[10px] font-black text-white/80 uppercase tracking-wider">AwamAssist Citizen</span>
          </div>
        </div>
      </div>

      {/* ── Full Name ── */}
      <Section
        icon={User}
        iconColor="text-blue-600"
        iconBg="bg-blue-50"
        title="Display Name"
        subtitle="This name appears across your dashboard"
      >
        <div className="space-y-4">
          <FieldRow label="Full Name">
            <Input
              id="companyName"
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="Enter your full name"
              className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-colors"
            />
          </FieldRow>
          <div className="flex justify-end">
            <button
              onClick={handleUpdateName}
              disabled={nameLoading}
              className="inline-flex items-center gap-2 px-5 h-10 bg-primary text-white font-black text-xs rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-60 shadow-md"
              style={{ boxShadow: '0 4px 12px hsl(var(--primary) / 0.25)' }}
            >
              {nameLoading ? (
                <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
              ) : (
                <><Save className="w-3.5 h-3.5" /> Save Name</>
              )}
            </button>
          </div>
        </div>
      </Section>

      {/* ── Email ── */}
      <Section
        icon={Mail}
        iconColor="text-indigo-600"
        iconBg="bg-indigo-50"
        title="Email Address"
        subtitle="Changing email requires verification via OTP"
      >
        <div className="space-y-4">
          <FieldRow label="Email">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-colors"
            />
          </FieldRow>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
              <Shield className="w-3.5 h-3.5" />
              OTP verification required
            </div>
            <button
              onClick={handleUpdateEmail}
              disabled={emailLoading}
              className="inline-flex items-center gap-2 px-5 h-10 bg-indigo-600 text-white font-black text-xs rounded-xl hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-60 shadow-md"
            >
              {emailLoading ? (
                <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</>
              ) : (
                <><Save className="w-3.5 h-3.5" /> Update Email</>
              )}
            </button>
          </div>
        </div>
      </Section>

      {/* ── Password ── */}
      {authProvider === 'email' && (
        <Section
          icon={Lock}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
          title="Change Password"
          subtitle="Use a strong password of at least 8 characters"
        >
          <div className="space-y-4">
            <FieldRow label="Current Password">
              <PasswordInput
                id="currentPassword"
                value={currentPassword}
                onChange={(e: any) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                show={showCurrentPw}
                onToggle={() => setShowCurrentPw(!showCurrentPw)}
                disabled={passwordLoading}
              />
            </FieldRow>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <FieldRow label="New Password">
                  <PasswordInput
                    id="newPassword"
                    value={newPassword}
                    onChange={(e: any) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    show={showNewPw}
                    onToggle={() => setShowNewPw(!showNewPw)}
                    disabled={passwordLoading}
                  />
                </FieldRow>
                {/* Strength bar */}
                {newPassword.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 flex-1">
                      {[1,2,3].map(n => (
                        <div key={n} className={`h-1 flex-1 rounded-full transition-all duration-300 ${n <= passwordStrength ? (passwordStrength === 1 ? 'bg-red-400' : passwordStrength === 2 ? 'bg-amber-400' : 'bg-emerald-500') : 'bg-slate-100'}`} />
                      ))}
                    </div>
                    <span className={`text-[9px] font-black uppercase ${passwordStrength === 1 ? 'text-red-500' : passwordStrength === 2 ? 'text-amber-500' : 'text-emerald-600'}`}>
                      {['','Weak','Fair','Strong'][passwordStrength]}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <FieldRow label="Confirm Password">
                  <PasswordInput
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e: any) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    show={showConfirmPw}
                    onToggle={() => setShowConfirmPw(!showConfirmPw)}
                    disabled={passwordLoading}
                  />
                </FieldRow>
                {/* Match indicator */}
                {confirmPassword.length > 0 && (
                  <div className={`flex items-center gap-1.5 text-[10px] font-black ${passwordsMatch ? 'text-emerald-600' : 'text-red-500'}`}>
                    {passwordsMatch
                      ? <><CheckCircle2 className="w-3.5 h-3.5" /> Passwords match</>
                      : <><AlertCircle className="w-3.5 h-3.5" /> Passwords don't match</>}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleChangePassword}
                disabled={passwordLoading || passwordsMismatch || !currentPassword || !newPassword || !confirmPassword}
                className="inline-flex items-center gap-2 px-5 h-10 bg-rose-600 text-white font-black text-xs rounded-xl hover:bg-rose-700 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              >
                {passwordLoading ? (
                  <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Changing…</>
                ) : (
                  <><KeyRound className="w-3.5 h-3.5" /> Change Password</>
                )}
              </button>
            </div>
          </div>
        </Section>
      )}

      {/* ── Google Auth Notice ── */}
      {authProvider === 'google' && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-amber-50 border border-amber-100">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4.5 h-4.5 text-amber-600" />
          </div>
          <p className="text-sm font-bold text-amber-800">
            You're signed in with Google. Password management is handled by your Google account.
          </p>
        </div>
      )}

      {/* ────────────────────────────────────────────────
          PIN VERIFICATION DIALOG
      ──────────────────────────────────────────────── */}
      <Dialog open={showPinModal} onOpenChange={closePinModal}>
        <DialogContent className="sm:max-w-md rounded-2xl border-slate-100 shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <DialogTitle className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Shield className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="font-black text-slate-900 text-base">Email Verification</div>
                <div className="text-[11px] font-medium text-slate-400 mt-0.5">We need to verify your new address</div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-5">
            {/* Target email */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sending code to</div>
                <div className="text-sm font-black text-slate-900">{newEmailValue}</div>
              </div>
            </div>

            {!pinSent ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Click below to receive a 6-digit verification code at your new email address. The code expires in 10 minutes.
                </p>
                <button
                  onClick={generateAndSendPin}
                  disabled={pinLoading}
                  className="w-full h-11 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-60"
                >
                  {pinLoading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending code…</>
                  ) : (
                    <><Mail className="w-4 h-4" /> Send Verification Code</>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <p className="text-xs font-bold text-emerald-700">Code sent! Check your inbox.</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">6-Digit Code</Label>
                  <Input
                    id="pinCode"
                    type="text"
                    inputMode="numeric"
                    placeholder="_ _ _ _ _ _"
                    value={pinCode}
                    onChange={e => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="h-12 rounded-xl text-center text-2xl font-black tracking-[0.5em] border-slate-200 bg-slate-50/50 focus:bg-white"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={verifyPinAndUpdateEmail}
                    disabled={pinLoading || pinCode.length !== 6}
                    className="flex-1 h-11 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50"
                  >
                    {pinLoading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying…</>
                    ) : (
                      <>Verify & Update <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                  <button
                    onClick={generateAndSendPin}
                    disabled={pinLoading}
                    className="px-4 h-11 rounded-xl border border-slate-200 text-slate-600 font-black text-xs hover:bg-slate-50 transition-all disabled:opacity-50"
                  >
                    Resend
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={closePinModal}
              className="w-full h-9 rounded-xl text-slate-400 font-bold text-sm hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AccountSettingsPage;