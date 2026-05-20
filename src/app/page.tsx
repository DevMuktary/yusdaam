"use client";

import Link from "next/link";
import { 
  CarFront, 
  ShieldCheck, 
  Banknote, 
  ArrowRight, 
  Users, 
  CheckCircle2, 
  FileText, 
  TrendingUp 
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-void-navy text-slate-light selection:bg-cobalt selection:text-white flex flex-col">
      
      {/* 1. CORPORATE HEADER / NAVIGATION */}
      <header className="fixed top-0 left-0 w-full bg-void-navy/90 backdrop-blur-md border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo Brand Hook */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-12 w-12 rounded-xl overflow-hidden flex items-center justify-center">
              <img 
                src="/images/logo2.PNG" 
                alt="YUSDAAM AUTOS Logo" 
                className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-wider text-crisp-white leading-none">
                YUSDAAM<span className="text-signal-red">AUTOS</span>
              </span>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                Fleet Management
              </span>
            </div>
          </Link>

          {/* Quick Portal Access */}
          <div className="hidden sm:flex items-center gap-6 text-sm font-bold uppercase tracking-wider">
            <Link href="/quotes" className="text-gray-400 hover:text-white transition">Quotes</Link>
            <Link href="/owner/login" className="text-gray-400 hover:text-purple-400 transition">Owner Portal</Link>
            <Link href="/rider/login" className="text-gray-400 hover:text-emerald-400 transition">Rider Portal</Link>
          </div>

        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-40 pb-24 md:pt-48 md:pb-32 overflow-hidden shrink-0">
        {/* Futuristic Background Blur Gradients */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cobalt/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-40 right-10 w-[300px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <span className="inline-flex text-[10px] sm:text-xs font-black tracking-widest uppercase bg-cobalt/10 text-cobalt border border-cobalt/20 px-4 py-1.5 rounded-full">
            RC NUMBER: 9562528
          </span>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-crisp-white uppercase max-w-5xl mx-auto leading-none">
            Transforming Transport Asset <span className="text-transparent bg-clip-text bg-gradient-to-r from-cobalt via-blue-400 to-emerald-400">Management</span>
          </h1>
          <p className="text-base sm:text-xl text-slate-light max-w-3xl mx-auto leading-relaxed font-medium">
            We bridge the gap between asset investors and verified commercial operators. Fully managed compliance, real-time GPS telematics, and structured weekly remittances.
          </p>

          {/* DYNAMIC REGISTRATION CALL TO ACTION BUTTONS */}
          <div className="pt-8 flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto sm:max-w-none">
            
            {/* Owner Path */}
            <Link 
              href="/owner/register" 
              className="group flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-sm shadow-xl shadow-purple-900/30 transition-all transform hover:-translate-y-0.5"
            >
              <BriefcaseIcon size={18} />
              Register as Asset Owner
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Rider Path */}
            <Link 
              href="/rider/register" 
              className="group flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-sm shadow-xl shadow-emerald-900/30 transition-all transform hover:-translate-y-0.5"
            >
              <CarFront size={18} />
              Apply as Driver / Rider
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>

          </div>
        </div>
      </section>

      {/* 3. BUSINESS CORE ADVANTAGES */}
      <section className="py-20 bg-black/20 border-y border-white/5 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl relative overflow-hidden group hover:border-purple-500/30 transition">
            <div className="p-3 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl w-fit mb-6">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2">For Asset Owners</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Earn hands-free commercial yield on tricycles, minibuses, or Uber sedans. <strong>Yusdaam earns ₦0 from your vehicle acquisition cost</strong>—we facilitate setup directly with dealers.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl relative overflow-hidden group hover:border-emerald-500/30 transition">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl w-fit mb-6">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2">Strict Risk Safeguards</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Every driver undergoes rigorous dual-guarantor background verification, legal background screening, and continuous GPS location telemetry monitoring.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl relative overflow-hidden group hover:border-cobalt/30 transition">
            <div className="p-3 bg-cobalt/10 text-cobalt border border-cobalt/20 rounded-xl w-fit mb-6">
              <Banknote size={24} />
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2">Structured Remittance</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Riders execute clear weekly targets directly into designated accounts. Owners receive direct bank payouts automatically processed within 48 hours of matching.
            </p>
          </div>

        </div>
      </section>

      {/* 4. FOOTER BLOCK */}
      <footer className="mt-auto border-t border-white/10 bg-black/40 py-12 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          
          <div className="space-y-2">
            <p className="text-sm font-bold text-crisp-white uppercase tracking-wider">
              YUSDAAM AUTOS FLEET MANAGEMENT NIGERIA LIMITED
            </p>
            <p className="text-xs text-gray-500 max-w-xl leading-relaxed">
              Registered in Nigeria with <strong>RC: 9562528</strong>. Head Office: 18, Alhaji Olakunle Close Selewu Teacher's Quarters Igbogbo Ikorodu Lagos.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 text-xs font-bold uppercase tracking-widest text-gray-400">
            <Link href="/quotes" className="hover:text-white transition">View Purchase Quotes</Link>
            <span className="hidden sm:inline text-gray-700">•</span>
            <span className="text-gray-600">Admin Charge: ₦0 From Owners</span>
          </div>

        </div>
      </footer>

    </div>
  );
}

// Simple dynamic inline briefcase icon to avoid bundling issues
function BriefcaseIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  );
}
