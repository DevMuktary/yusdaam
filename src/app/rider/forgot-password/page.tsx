"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  CarFront, 
  ArrowRight, 
  ArrowLeft, 
  Mail, 
  KeyRound, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  RefreshCw,
  ShieldCheck
} from "lucide-react";

export default function RiderForgotPassword() {
  const router = useRouter();

  // Step 1: Email, Step 2: OTP, Step 3: New Password, Step 4: Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form fields
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & UI
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  // Resend Countdown
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Safe viewport meta tag
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "viewport";
    meta.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0";
    document.head.appendChild(meta);
    return () => {
      try {
        if (meta.parentNode) {
          meta.parentNode.removeChild(meta);
        }
      } catch (e) {}
    };
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (step === 2 && countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, countdown]);

  const startCountdown = () => {
    setCountdown(60);
    setCanResend(false);
  };

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/rider/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send reset code.");
      }

      setInfoMsg(`A 6-digit verification code has been sent to ${email.trim()}.`);
      setStep(2);
      startCountdown();
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (!canResend || isLoading) return;
    setErrorMsg("");
    setInfoMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/rider/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to resend code.");
      }

      setInfoMsg("A new 6-digit code has been sent to your email.");
      startCountdown();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to resend verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    const cleanOtp = otp.trim().replace(/\D/g, "");
    if (cleanOtp.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/rider/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          otp: cleanOtp 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid verification code.");
      }

      setStep(3);
    } catch (err: any) {
      setErrorMsg(err.message || "Verification failed. Please check the code.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please re-type.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/rider/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim().replace(/\D/g, ""),
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setStep(4);
    } catch (err: any) {
      setErrorMsg(err.message || "Password update failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = "w-full bg-void-light/10 border border-signal-red/60 rounded-lg px-4 py-3.5 text-base text-crisp-white focus:outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/40 transition-all placeholder:text-slate-light/40 shadow-[0_0_10px_rgba(233,69,96,0.05)]";
  const labelStyle = "block text-[10px] sm:text-xs font-bold text-slate-light/70 uppercase tracking-widest mb-1.5 sm:mb-2";

  return (
    <main className="min-h-screen bg-void-navy flex flex-col lg:flex-row text-crisp-white">
      
      {/* LEFT SIDE: Branding Sidebar */}
      <div className="lg:w-1/3 xl:w-1/4 bg-void-navy border-b lg:border-b-0 lg:border-r border-white/10 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
        <div>
          <Link href="/" className="mb-8 block hover:opacity-80 transition">
            <Image 
              src="/images/logo2.PNG" 
              alt="YUSDAAM AUTOS Logo" 
              width={180} 
              height={50} 
              className="object-contain" 
              priority
            />
          </Link>
          <div className="hidden sm:block mt-12">
            <CarFront size={48} className="text-signal-red mb-6 opacity-70" />
            <h2 className="text-lg font-bold mb-2">Fleet Rider Recovery</h2>
            <p className="text-xs text-slate-light leading-relaxed">
              Regain access to your Fleet Operations Portal. Verify your identity with a one-time passcode sent directly to your registered email address.
            </p>
          </div>
        </div>
        
        <div className="hidden lg:block text-[10px] text-slate-light/50 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} YUSDAAM AUTOS FLEET MANAGEMENT NIGERIA LIMITED
        </div>
      </div>

      {/* RIGHT SIDE: Recovery Workflow */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-16">
        <div className="max-w-md w-full">
          
          {/* Step Indicators */}
          {step < 4 && (
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10 text-xs">
              <div className={`flex items-center gap-2 font-bold ${step >= 1 ? "text-signal-red" : "text-slate-light/40"}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 1 ? "bg-signal-red text-white" : "bg-white/10 text-slate-light/40"}`}>1</span>
                <span>Email</span>
              </div>
              <div className={`h-0.5 flex-1 mx-3 ${step >= 2 ? "bg-signal-red" : "bg-white/10"}`} />
              <div className={`flex items-center gap-2 font-bold ${step >= 2 ? "text-signal-red" : "text-slate-light/40"}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 2 ? "bg-signal-red text-white" : "bg-white/10 text-slate-light/40"}`}>2</span>
                <span>OTP</span>
              </div>
              <div className={`h-0.5 flex-1 mx-3 ${step >= 3 ? "bg-signal-red" : "bg-white/10"}`} />
              <div className={`flex items-center gap-2 font-bold ${step >= 3 ? "text-signal-red" : "text-slate-light/40"}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 3 ? "bg-signal-red text-white" : "bg-white/10 text-slate-light/40"}`}>3</span>
                <span>Password</span>
              </div>
            </div>
          )}

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="bg-signal-red/10 border border-signal-red text-signal-red px-4 py-3 rounded-lg mb-6 text-sm font-medium flex gap-2 items-center animate-in fade-in slide-in-from-top-2">
              <XCircle size={18} className="shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          {infoMsg && step !== 4 && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-lg mb-6 text-sm font-medium flex gap-2 items-center animate-in fade-in slide-in-from-top-2">
              <ShieldCheck size={18} className="shrink-0 text-emerald-400" />
              <p>{infoMsg}</p>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-8 text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl font-black uppercase mb-2 tracking-wide text-signal-red">
                  Forgot Password?
                </h1>
                <p className="text-sm text-slate-light">
                  Enter your registered rider email address and we will send a 6-digit security OTP.
                </p>
              </div>

              <form onSubmit={handleRequestOtp} className="space-y-6">
                <div>
                  <label className={labelStyle}>Registered Email Address</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className={`${inputStyle} pl-11`} 
                      placeholder="rider@example.com"
                      required 
                      autoFocus
                    />
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-light/50" />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading || !email}
                  className="w-full bg-signal-red hover:bg-signal-red/90 text-crisp-white font-black uppercase tracking-wider py-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-signal-red/20 text-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Sending Security Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <Link 
                  href="/rider/login" 
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-light/70 hover:text-crisp-white transition uppercase tracking-wider"
                >
                  <ArrowLeft size={14} /> Back to Rider Login
                </Link>
              </div>
            </div>
          )}

          {/* STEP 2: Enter OTP */}
          {step === 2 && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-8 text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl font-black uppercase mb-2 tracking-wide text-signal-red">
                  Enter Verification Code
                </h1>
                <p className="text-sm text-slate-light">
                  We sent a 6-digit code to <strong className="text-crisp-white">{email}</strong>.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                    <label className={`${labelStyle} !mb-0`}>6-Digit OTP Code</label>
                    <button
                      type="button"
                      onClick={() => { setStep(1); setOtp(""); }}
                      className="text-[10px] text-cobalt hover:text-signal-red font-bold uppercase transition"
                    >
                      Change Email
                    </button>
                  </div>
                  <input 
                    type="text" 
                    maxLength={6}
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} 
                    className={`${inputStyle} text-center font-mono text-2xl tracking-[0.5em] sm:tracking-[0.7em] font-bold`} 
                    placeholder="••••••"
                    required 
                    autoFocus
                  />
                  <p className="text-[11px] text-slate-light/60 mt-2 text-center">
                    Code expires in 10 minutes.
                  </p>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading || otp.length !== 6}
                  className="w-full bg-signal-red hover:bg-signal-red/90 text-crisp-white font-black uppercase tracking-wider py-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-signal-red/20 text-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Code</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Resend Cooldown Section */}
              <div className="mt-6 text-center">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 text-xs font-bold text-signal-red hover:underline transition uppercase tracking-wider"
                  >
                    <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                    Resend Code Now
                  </button>
                ) : (
                  <p className="text-xs text-slate-light/60">
                    Didn't receive code? Resend in <span className="font-bold text-crisp-white">{countdown}s</span>
                  </p>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <Link 
                  href="/rider/login" 
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-light/70 hover:text-crisp-white transition uppercase tracking-wider"
                >
                  <ArrowLeft size={14} /> Back to Rider Login
                </Link>
              </div>
            </div>
          )}

          {/* STEP 3: Set New Password */}
          {step === 3 && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-8 text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl font-black uppercase mb-2 tracking-wide text-signal-red">
                  Create New Password
                </h1>
                <p className="text-sm text-slate-light">
                  Choose a secure password for your Rider Fleet account.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className={labelStyle}>New Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      className={`${inputStyle} pr-12`} 
                      placeholder="At least 8 characters"
                      required 
                      autoFocus
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-light/50 hover:text-crisp-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Confirm New Password</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      className={`${inputStyle} pr-12`} 
                      placeholder="Re-enter your new password"
                      required 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-light/50 hover:text-crisp-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Password Criteria Checklist */}
                <div className="p-3.5 bg-void-light/10 border border-white/10 rounded-lg space-y-2 text-xs">
                  <div className={`flex items-center gap-2 ${newPassword.length >= 8 ? "text-emerald-400" : "text-slate-light/50"}`}>
                    <CheckCircle2 size={14} className={newPassword.length >= 8 ? "text-emerald-400" : "opacity-40"} />
                    <span>At least 8 characters long</span>
                  </div>
                  <div className={`flex items-center gap-2 ${newPassword && newPassword === confirmPassword ? "text-emerald-400" : "text-slate-light/50"}`}>
                    <CheckCircle2 size={14} className={newPassword && newPassword === confirmPassword ? "text-emerald-400" : "opacity-40"} />
                    <span>Passwords match</span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading || newPassword.length < 8 || newPassword !== confirmPassword}
                  className="w-full bg-signal-red hover:bg-signal-red/90 text-crisp-white font-black uppercase tracking-wider py-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-signal-red/20 text-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound size={18} />
                      <span>Save & Update Password</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <Link 
                  href="/rider/login" 
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-light/70 hover:text-crisp-white transition uppercase tracking-wider"
                >
                  <ArrowLeft size={14} /> Back to Rider Login
                </Link>
              </div>
            </div>
          )}

          {/* STEP 4: Success Screen */}
          {step === 4 && (
            <div className="text-center py-6 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <CheckCircle2 size={36} />
              </div>

              <h1 className="text-2xl sm:text-3xl font-black uppercase mb-3 text-crisp-white">
                Password Reset Complete!
              </h1>
              
              <p className="text-sm text-slate-light leading-relaxed mb-8 max-w-sm mx-auto">
                Your Rider account password has been successfully updated. You can now log in using your new credentials.
              </p>

              <button
                type="button"
                onClick={() => router.push("/rider/login")}
                className="w-full bg-signal-red hover:bg-signal-red/90 text-crisp-white font-black uppercase tracking-wider py-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-signal-red/20 text-sm"
              >
                <span>Proceed to Rider Login</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
