"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, XCircle, Eye, EyeOff, Briefcase, ArrowRight } from "lucide-react";

export default function OwnerLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (res?.error) {
        setErrorMsg("Invalid email or password. Please try again.");
        setIsSubmitting(false);
      } else {
        router.push("/owner/dashboard");
        router.refresh();
      }
    } catch (error) {
      setErrorMsg("Connection could not be established. Please try again.");
      setIsSubmitting(false);
    }
  };

  const inputStyle = "w-full bg-void-light/5 border border-signal-red/60 rounded-lg px-4 py-3.5 text-[16px] text-crisp-white focus:outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/40 transition-all placeholder:text-slate-light/40 shadow-[0_0_10px_rgba(233,69,96,0.05)]";
  const labelStyle = "block text-[10px] sm:text-xs font-bold text-slate-light/70 uppercase tracking-widest mb-1.5 sm:mb-2";

  return (
    <main className="min-h-screen bg-void-navy flex flex-col lg:flex-row text-crisp-white">
      
      {/* LEFT SIDE: Branding Sidebar */}
      <div className="lg:w-1/3 xl:w-1/4 bg-void-navy border-b lg:border-b-0 lg:border-r border-cobalt/20 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
        <div>
          <Link href="/" className="text-2xl sm:text-3xl font-black tracking-wider hover:opacity-80 transition block mb-8">
            YUSDAAM<span className="text-signal-red">.</span>
          </Link>
          <div className="hidden sm:block mt-12">
            <Briefcase size={48} className="text-cobalt mb-6 opacity-50" />
            <h2 className="text-lg font-bold mb-2">Administration Portal</h2>
            <p className="text-xs text-slate-light leading-relaxed">
              Access your asset dashboard. Monitor vehicle deployment, track remittance status, and manage your successions efficiently.
            </p>
          </div>
        </div>
        
        <div className="hidden lg:block text-[10px] text-slate-light/50 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Yusdaam Autos
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-16">
        <div className="max-w-md w-full">
          
          <div className="mb-8 sm:mb-12 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl font-black uppercase mb-2 tracking-wide">Owner Login</h1>
            <p className="text-sm sm:text-base text-slate-light">Enter your credentials to access your dashboard.</p>
          </div>

          {errorMsg && (
            <div className="bg-signal-red/10 border border-signal-red text-signal-red px-4 py-3 rounded-lg mb-8 text-sm font-medium flex gap-2 items-center animate-in fade-in slide-in-from-top-2">
              <XCircle size={18} className="shrink-0" /> <p>{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={labelStyle}>Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleTextChange} 
                className={inputStyle} 
                placeholder="registered@email.com"
                required 
              />
            </div>

            <div className="relative">
              <div className="flex justify-between items-end mb-1.5 sm:mb-2">
                <label className={`${labelStyle} !mb-0`}>Password</label>
                <Link href="/owner/forgot-password" className="text-[10px] sm:text-xs font-bold text-cobalt hover:text-signal-red transition-colors uppercase tracking-wider">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  value={formData.password} 
                  onChange={handleTextChange} 
                  className={`${inputStyle} pr-12`} 
                  placeholder="••••••••"
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-light/50 hover:text-crisp-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting || !formData.email || !formData.password} 
              className="w-full flex items-center justify-center h-[52px] bg-signal-red text-crisp-white text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg hover:bg-signal-red/90 transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isSubmitting ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <span className="flex items-center gap-2">Access Portal <ArrowRight size={16} /></span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-cobalt/20 pt-8">
            <p className="text-xs text-slate-light">
              Not yet registered as an asset owner? <br className="sm:hidden" />
              <Link href="/owner/register" className="text-cobalt font-bold hover:text-signal-red transition-colors ml-1 uppercase tracking-wider">
                Register Here
              </Link>
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
