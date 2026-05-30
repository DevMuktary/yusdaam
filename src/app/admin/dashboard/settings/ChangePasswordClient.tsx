"use client";

import { useState } from "react";
import { KeyRound, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";

export default function ChangePasswordClient() {
  // 1 = Request OTP, 2 = Verify & Save
  const [step, setStep] = useState<1 | 2>(1); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form State
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRequestOtp = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/admin/auth/request-otp", { method: "POST" });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to request OTP");
      
      setStep(2); // Move to verification step
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (newPassword.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, newPassword }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to reset password");
      
      alert("Password successfully updated! You can now use it on your next login.");
      
      // Reset state back to step 1
      setStep(1);
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-void-navy p-6 rounded-xl border border-white/10 shadow-lg max-w-xl">
      <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
        <div className="p-3 bg-white/5 rounded-lg text-emerald-400">
          <KeyRound size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-light">Security Settings</h2>
          <p className="text-sm text-gray-400">Update your administrator password.</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {step === 1 ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-300">
            For security purposes, an OTP will be sent to your registered admin email address before you can change your password.
          </p>
          <button 
            onClick={handleRequestOtp}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-white uppercase tracking-wider transition bg-cobalt hover:bg-cobalt-light disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
            Request Security OTP
          </button>
        </div>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              Enter 6-Digit OTP sent to your email
            </label>
            <input 
              type="text" 
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cobalt font-mono text-center tracking-[1em]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              New Password
            </label>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cobalt"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              Confirm New Password
            </label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cobalt"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-3 rounded-lg font-bold text-gray-400 uppercase tracking-wider transition hover:bg-white/5"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading || otp.length !== 6 || !newPassword || !confirmPassword}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-white uppercase tracking-wider transition bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
              Update Password
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
