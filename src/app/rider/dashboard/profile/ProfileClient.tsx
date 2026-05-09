"use client";

import { User, Phone, Mail, MapPin, Fingerprint, ShieldCheck, HeartPulse, CheckCircle2, Clock, UserCheck } from "lucide-react";
import Image from "next/image";

export default function ProfileClient({ rider, guarantors }: { rider: any, guarantors: any[] }) {
  
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-wider mb-2">Compliance Profile</h1>
        <p className="text-sm text-slate-light">Your registered identity, KYC documentation, and verified sureties.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: IDENTITY & NOK */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Identity Card */}
          <div className="bg-void-dark border border-cobalt/20 rounded-xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 z-10">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest border
                ${rider.accountStatus === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                  'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}
              >
                {rider.accountStatus === 'ACTIVE' ? <ShieldCheck size={14} /> : <Clock size={14} />} 
                {rider.accountStatus}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 relative z-10 mt-6 sm:mt-0">
              {/* Profile Photo */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-cobalt/30 overflow-hidden bg-void-navy flex items-center justify-center shrink-0 shadow-xl">
                {rider.passportUrl ? (
                  <Image 
                    src={rider.passportUrl} 
                    alt="Rider Passport" 
                    width={128} 
                    height={128} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={48} className="text-slate-light/30" />
                )}
              </div>
              
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-crisp-white uppercase tracking-wider mb-1">
                  {rider.firstName} {rider.lastName}
                </h2>
                <p className="text-sm text-cobalt font-bold tracking-widest uppercase">Verified Rider</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10 border-t border-cobalt/20 pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-void-light/5 rounded-lg border border-cobalt/10 text-slate-light">
                  <Fingerprint size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-light font-bold uppercase tracking-widest mb-0.5">National ID (NIN)</p>
                  <p className="text-sm font-mono font-bold text-crisp-white tracking-wider">{rider.nin || "---"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-void-light/5 rounded-lg border border-cobalt/10 text-slate-light">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-light font-bold uppercase tracking-widest mb-0.5">Phone Number</p>
                  <p className="text-sm font-bold text-crisp-white tracking-wider">{rider.phoneNumber || "---"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-void-light/5 rounded-lg border border-cobalt/10 text-slate-light">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-light font-bold uppercase tracking-widest mb-0.5">Email Address</p>
                  <p className="text-sm font-bold text-crisp-white truncate">{rider.email || "---"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-void-light/5 rounded-lg border border-cobalt/10 text-slate-light">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-light font-bold uppercase tracking-widest mb-0.5">Residential Address</p>
                  <p className="text-sm font-bold text-crisp-white truncate" title={rider.streetAddress}>{rider.streetAddress || "---"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Next of Kin Card */}
          <div className="bg-void-dark border border-cobalt/20 rounded-xl p-6 shadow-lg">
            <h3 className="font-bold border-b border-cobalt/20 pb-3 mb-6 uppercase tracking-wider flex items-center gap-2">
              <HeartPulse size={18} className="text-signal-red"/> Next of Kin Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] text-slate-light font-bold uppercase tracking-widest mb-1">Full Name</p>
                <p className="text-sm font-bold text-crisp-white tracking-wider uppercase">
                  {rider.nokFirstName || "---"} {rider.nokLastName || ""}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-light font-bold uppercase tracking-widest mb-1">Relationship</p>
                <p className="text-sm font-bold text-crisp-white tracking-wider uppercase">
                  {rider.nokRelationship || "---"}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-light font-bold uppercase tracking-widest mb-1">Phone Number</p>
                <p className="text-sm font-bold text-crisp-white tracking-wider">
                  {rider.nokPhone || "---"}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-light font-bold uppercase tracking-widest mb-1">Address</p>
                <p className="text-sm font-bold text-crisp-white truncate" title={rider.nokAddress}>
                  {rider.nokAddress || "---"}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: GUARANTORS */}
        <div className="space-y-6">
          <div className="bg-void-dark border border-cobalt/20 rounded-xl p-6 shadow-lg h-full">
            <h3 className="font-bold border-b border-cobalt/20 pb-3 mb-6 uppercase tracking-wider flex items-center gap-2">
              <UserCheck size={18} className="text-cobalt"/> Verified Guarantors
            </h3>

            <div className="space-y-6">
              {guarantors.map((g: any, index: number) => {
                const isExecuted = g.status !== "PENDING";
                
                return (
                  <div key={g.id || index} className="p-5 bg-void-light/5 border border-cobalt/10 rounded-xl relative overflow-hidden">
                    {/* Status Badge */}
                    {isExecuted && (
                      <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-bl-lg border-b border-l border-emerald-500/20 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle2 size={10} /> Verified
                      </div>
                    )}

                    <p className="text-[10px] text-cobalt font-bold uppercase tracking-widest mb-1">Surety {index + 1}</p>
                    <h4 className="text-base font-black text-crisp-white uppercase tracking-wider mb-0.5">
                      {g.firstName} {g.lastName}
                    </h4>
                    <p className="text-[10px] text-slate-light uppercase tracking-widest mb-4 border-b border-cobalt/10 pb-3">
                      {g.relationship}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-slate-light shrink-0" />
                        <p className="text-xs font-bold text-crisp-white">{g.phone || "---"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-slate-light shrink-0" />
                        <p className="text-xs font-bold text-crisp-white truncate">{g.email || "---"}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-slate-light shrink-0 mt-0.5" />
                        <p className="text-xs font-bold text-crisp-white leading-snug">{g.address || "Pending Submission"}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {guarantors.length === 0 && (
                <div className="text-center py-10">
                  <UserCheck size={32} className="text-slate-light/20 mx-auto mb-3" />
                  <p className="text-xs text-slate-light italic">No guarantors have been nominated.</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-cobalt/20">
              <p className="text-[10px] text-slate-light leading-relaxed">
                <strong className="text-crisp-white uppercase tracking-wider">Privacy Notice:</strong> For security and data protection, sensitive guarantor information (such as their BVN/NIN) is hidden from this view and stored securely in the administrative vault.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
