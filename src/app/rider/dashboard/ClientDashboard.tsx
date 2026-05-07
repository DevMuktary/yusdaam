"use client";

import { useState } from "react";
import { ShieldAlert, CheckCircle2, Clock, Copy, Lock, CarFront, WalletCards, ShieldCheck, Check, MessageCircle, Hourglass } from "lucide-react";
import RiderVirtualAgreement from "./RiderVirtualAgreement";

export default function ClientDashboard({ 
  rider, 
  guarantors, 
  baseUrl, 
  vehicle, 
  contract 
}: { 
  rider: any, 
  guarantors: any[], 
  baseUrl: string, 
  vehicle: any, 
  contract: any 
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const g1 = guarantors[0];
  const g2 = guarantors[1];

  const g1Completed = g1?.status !== "PENDING";
  const g2Completed = g2?.status !== "PENDING";
  const allGuarantorsSubmitted = g1Completed && g2Completed;

  const isPendingReview = allGuarantorsSubmitted && rider.accountStatus === "PENDING";
  const isApproved = rider.accountStatus === "APPROVED";
  const isActive = rider.accountStatus === "ACTIVE";
  const isAwaitingSignature = rider.accountStatus === "AWAITING_SIGNATURE";
  
  // They are fully approved if they are in any of these post-review states
  const isFullyApproved = isApproved || isActive || isAwaitingSignature;

  const copyToClipboard = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const getWhatsAppLink = (name: string, link: string) => {
    const text = `Hello ${name}, I have nominated you as a guarantor for my commercial vehicle allocation with YUSDAAM Autos. Please click this secure link to complete your legal attestation: ${link}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* VIRTUAL AGREEMENT MODAL */}
      {isAwaitingSignature && (
        <RiderVirtualAgreement 
          rider={rider} 
          vehicle={vehicle} 
          contract={contract} 
          guarantors={guarantors} 
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-wider mb-2">Command Center</h1>
        <p className="text-sm text-slate-light">Welcome back, {rider.firstName}. Review your operational status below.</p>
      </div>

      {/* PHASE TRACKER */}
      {!isActive && (
        <div className="bg-void-dark border border-cobalt/20 rounded-xl p-6 sm:p-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
            
            {/* Background Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-void-light/10 -translate-y-1/2 z-0"></div>

            {/* Step 1: Guarantors */}
            <div className="relative z-10 flex flex-row md:flex-col items-center gap-4 md:gap-3 bg-void-dark pr-4 md:pr-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 ${allGuarantorsSubmitted ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-signal-red/20 border-signal-red text-signal-red shadow-[0_0_15px_rgba(233,69,96,0.3)]'}`}>
                {allGuarantorsSubmitted ? <CheckCircle2 size={24} /> : <ShieldAlert size={24} />}
              </div>
              <div className="text-left md:text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-crisp-white">Phase 1</p>
                <p className="text-[10px] text-slate-light uppercase tracking-wider">{allGuarantorsSubmitted ? 'Guarantors Cleared' : 'Pending Guarantors'}</p>
              </div>
            </div>

            {/* Step 2: Admin Review */}
            <div className="relative z-10 flex flex-row md:flex-col items-center gap-4 md:gap-3 bg-void-dark pr-4 md:pr-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 ${isFullyApproved ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : isPendingReview ? 'bg-cobalt/20 border-cobalt text-cobalt shadow-[0_0_15px_rgba(77,148,255,0.3)]' : 'bg-void-light/5 border-void-light/10 text-slate-light/40'}`}>
                {isFullyApproved ? <CheckCircle2 size={24} /> : isPendingReview ? <Hourglass size={24} /> : <Clock size={24} />}
              </div>
              <div className="text-left md:text-center">
                <p className={`text-xs font-bold uppercase tracking-widest ${isPendingReview || isFullyApproved ? 'text-crisp-white' : 'text-slate-light/40'}`}>Phase 2</p>
                <p className={`text-[10px] uppercase tracking-wider ${isPendingReview || isFullyApproved ? 'text-slate-light' : 'text-slate-light/40'}`}>Admin Review</p>
              </div>
            </div>

            {/* Step 3: Fleet Allocation */}
            <div className="relative z-10 flex flex-row md:flex-col items-center gap-4 md:gap-3 bg-void-dark pr-4 md:pr-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 ${isActive ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : isAwaitingSignature ? 'bg-signal-red/20 border-signal-red text-signal-red shadow-[0_0_15px_rgba(233,69,96,0.3)]' : 'bg-void-light/5 border-void-light/10 text-slate-light/40'}`}>
                {isActive ? <CarFront size={24} /> : isAwaitingSignature ? <ShieldCheck size={24} /> : <Lock size={20} />}
              </div>
              <div className="text-left md:text-center">
                <p className={`text-xs font-bold uppercase tracking-widest ${isActive || isAwaitingSignature ? 'text-crisp-white' : 'text-slate-light/40'}`}>Phase 3</p>
                <p className={`text-[10px] uppercase tracking-wider ${isActive ? 'text-slate-light' : isAwaitingSignature ? 'text-signal-red' : 'text-slate-light/40'}`}>{isAwaitingSignature ? 'Sign Agreement' : 'Fleet Allocation'}</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ADMIN REVIEW BANNER */}
      {isPendingReview && (
        <div className="bg-cobalt/10 border border-cobalt/30 p-6 rounded-xl flex flex-col md:flex-row md:items-center gap-6 animate-in slide-in-from-bottom-2">
          <div className="shrink-0 bg-cobalt/20 p-4 rounded-full text-cobalt">
            <Hourglass size={32} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-cobalt uppercase tracking-widest mb-1">Pending Admin Review</h2>
            <p className="text-sm text-slate-light leading-relaxed">
              Both of your guarantors have successfully executed their deeds. Your application is currently under final review by Administration. You will be contacted shortly regarding your fleet assignment.
            </p>
          </div>
        </div>
      )}

      {/* GUARANTOR ACTION CARDS (Only show if not fully approved) */}
      {!isFullyApproved && (
        <div className="bg-void-dark border border-cobalt/20 rounded-xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-cobalt/20 bg-void-light/5">
            <h3 className="text-lg font-bold uppercase tracking-wider">Guarantor Protocol</h3>
            <p className="text-xs text-slate-light">Forward these unique links to your guarantors to complete your KYC.</p>
          </div>
          
          <div className="divide-y divide-cobalt/20">
            {[g1, g2].map((g, index) => {
              if (!g) return null;
              const link = `${baseUrl}/guarantor/${g.token}`;
              const isDone = g.status !== "PENDING";
              
              return (
                <div key={g.id} className="p-6 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                  
                  {/* Guarantor Details */}
                  <div className="flex items-center gap-4">
                    {isDone ? (
                      <CheckCircle2 size={32} className="text-emerald-400 shrink-0" />
                    ) : (
                      <ShieldAlert size={32} className="text-signal-red shrink-0" />
                    )}
                    <div>
                      <p className="font-bold uppercase tracking-widest text-sm md:text-base">{g.firstName} {g.lastName}</p>
                      <p className="text-xs text-slate-light uppercase tracking-widest">{g.relationship} • Guarantor {index + 1}</p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  {!isDone ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                      <button 
                        onClick={() => copyToClipboard(link, g.id)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-void-light/5 hover:bg-void-light/10 border border-cobalt/30 text-crisp-white font-bold uppercase tracking-wider text-xs rounded-xl transition-all"
                      >
                        {copiedId === g.id ? <><Check size={16} className="text-emerald-400"/> Copied!</> : <><Copy size={16} className="text-cobalt"/> Copy Link</>}
                      </button>
                      
                      <a 
                        href={getWhatsAppLink(g.firstName, link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold uppercase tracking-wider text-xs rounded-xl transition-all"
                      >
                        <MessageCircle size={16} /> WhatsApp
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-6 py-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold uppercase tracking-wider text-xs rounded-xl w-full lg:w-auto justify-center">
                      <CheckCircle2 size={16} /> Deed Executed
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DASHBOARD PREVIEW */}
      <div className="relative">
        <h3 className="text-lg font-bold border-b border-cobalt/20 pb-2 mb-6 uppercase tracking-wider">Fleet Operations Overview</h3>
        
        {/* Glassmorphism Lock Overlay */}
        {!isActive && (
          <div className="absolute inset-0 top-12 z-20 flex flex-col items-center justify-center bg-void-navy/60 backdrop-blur-sm rounded-xl border border-void-light/10">
            <Lock size={48} className="text-slate-light mb-4 opacity-50" />
            <p className="text-sm font-bold uppercase tracking-widest text-slate-light text-center px-4">
              {isAwaitingSignature ? "Action Required: Sign Handover Agreement" : "Dashboard Locked Pending Asset Assignment"}
            </p>
          </div>
        )}

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-500 ${!isActive ? "opacity-40 grayscale pointer-events-none" : ""}`}>
          <div className="bg-void-dark border border-cobalt/20 p-6 rounded-xl">
            <WalletCards className="text-cobalt mb-4" size={32} />
            <p className="text-xs text-slate-light font-bold uppercase tracking-widest mb-1">Outstanding Balance</p>
            <p className="text-2xl font-black font-mono">₦ ---</p>
          </div>
          <div className="bg-void-dark border border-cobalt/20 p-6 rounded-xl">
            <CarFront className="text-cobalt mb-4" size={32} />
            <p className="text-xs text-slate-light font-bold uppercase tracking-widest mb-1">Assigned Asset</p>
            <p className="text-2xl font-black">---</p>
          </div>
          <div className="bg-void-dark border border-cobalt/20 p-6 rounded-xl">
            <ShieldCheck className="text-cobalt mb-4" size={32} />
            <p className="text-xs text-slate-light font-bold uppercase tracking-widest mb-1">Next Remittance</p>
            <p className="text-2xl font-black font-mono">---</p>
          </div>
        </div>
      </div>

    </div>
  );
}
