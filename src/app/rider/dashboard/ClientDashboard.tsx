"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, CheckCircle2, Clock, Copy, Lock, CarFront, WalletCards, ShieldCheck, Check, MessageCircle, Hourglass, Loader2, Landmark, AlertTriangle } from "lucide-react";
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
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Paystack Virtual Account State
  const [isGenerating, setIsGenerating] = useState(false);
  const [accountError, setAccountError] = useState("");

  const g1 = guarantors[0];
  const g2 = guarantors[1];

  const g1Completed = g1?.status !== "PENDING";
  const g2Completed = g2?.status !== "PENDING";
  const allGuarantorsSubmitted = g1Completed && g2Completed;

  const isPendingReview = allGuarantorsSubmitted && rider.accountStatus === "PENDING";
  const isApproved = rider.accountStatus === "APPROVED";
  const isActive = rider.accountStatus === "ACTIVE";
  const isAwaitingSignature = rider.accountStatus === "AWAITING_SIGNATURE";
  
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

  const handleGenerateAccount = async () => {
    setIsGenerating(true);
    setAccountError("");
    try {
      const res = await fetch("/api/rider/generate-account", { method: "POST" });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to generate account");
      router.refresh(); // Refresh to show the new account details
    } catch (err: any) {
      setAccountError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // MOCK DATA: We will replace this with real Ledger queries later
  const mockWeeklyLedger = [
    { week: 1, target: 100000, paid: 100000, arrears: 0, status: "CLEARED", date: "Oct 12, 2026" },
    { week: 2, target: 100000, paid: 80000, arrears: 20000, status: "PARTIAL", date: "Oct 19, 2026" },
    { week: 3, target: 100000, paid: 0, arrears: 100000, status: "OVERDUE", date: "Oct 26, 2026" },
    { week: 4, target: 100000, paid: 0, arrears: 0, status: "PENDING", date: "Nov 02, 2026" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
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

      {/* PHASE TRACKER (Hidden when Active to clean up the dashboard) */}
      {!isActive && (
        <div className="bg-void-dark border border-cobalt/20 rounded-xl p-6 sm:p-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-void-light/10 -translate-y-1/2 z-0"></div>

            <div className="relative z-10 flex flex-row md:flex-col items-center gap-4 md:gap-3 bg-void-dark pr-4 md:pr-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 ${allGuarantorsSubmitted ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-signal-red/20 border-signal-red text-signal-red shadow-[0_0_15px_rgba(233,69,96,0.3)]'}`}>
                {allGuarantorsSubmitted ? <CheckCircle2 size={24} /> : <ShieldAlert size={24} />}
              </div>
              <div className="text-left md:text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-crisp-white">Phase 1</p>
                <p className="text-[10px] text-slate-light uppercase tracking-wider">{allGuarantorsSubmitted ? 'Guarantors Cleared' : 'Pending Guarantors'}</p>
              </div>
            </div>

            <div className="relative z-10 flex flex-row md:flex-col items-center gap-4 md:gap-3 bg-void-dark pr-4 md:pr-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 ${isFullyApproved ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : isPendingReview ? 'bg-cobalt/20 border-cobalt text-cobalt shadow-[0_0_15px_rgba(77,148,255,0.3)]' : 'bg-void-light/5 border-void-light/10 text-slate-light/40'}`}>
                {isFullyApproved ? <CheckCircle2 size={24} /> : isPendingReview ? <Hourglass size={24} /> : <Clock size={24} />}
              </div>
              <div className="text-left md:text-center">
                <p className={`text-xs font-bold uppercase tracking-widest ${isPendingReview || isFullyApproved ? 'text-crisp-white' : 'text-slate-light/40'}`}>Phase 2</p>
                <p className={`text-[10px] uppercase tracking-wider ${isPendingReview || isFullyApproved ? 'text-slate-light' : 'text-slate-light/40'}`}>Admin Review</p>
              </div>
            </div>

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

      {/* GUARANTOR ACTION CARDS */}
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

      {/* DASHBOARD AREA */}
      <div className="relative pt-4">
        
        {/* Glassmorphism Lock Overlay for Non-Active Riders */}
        {!isActive && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-void-navy/60 backdrop-blur-sm rounded-xl border border-void-light/10 mt-10">
            <Lock size={48} className="text-slate-light mb-4 opacity-50" />
            <p className="text-sm font-bold uppercase tracking-widest text-slate-light text-center px-4">
              {isAwaitingSignature ? "Action Required: Sign Handover Agreement" : "Dashboard Locked Pending Asset Assignment"}
            </p>
          </div>
        )}

        <div className={`transition-all duration-500 ${!isActive ? "opacity-40 grayscale pointer-events-none" : "space-y-6"}`}>
          
          {/* QUICK STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-void-dark border border-cobalt/20 p-6 rounded-xl shadow-lg">
              <CarFront className="text-cobalt mb-4" size={32} />
              <p className="text-xs text-slate-light font-bold uppercase tracking-widest mb-1">Assigned Asset</p>
              <p className="text-xl font-black">{vehicle?.makeModel || "---"}</p>
              <p className="text-xs text-emerald-400 mt-2 bg-emerald-500/10 inline-block px-2 py-1 rounded">{vehicle?.registrationNumber || "---"}</p>
            </div>
            <div className="bg-void-dark border border-cobalt/20 p-6 rounded-xl shadow-lg">
              <WalletCards className="text-cobalt mb-4" size={32} />
              <p className="text-xs text-slate-light font-bold uppercase tracking-widest mb-1">Weekly Target</p>
              <p className="text-xl font-black font-mono">₦{contract?.weeklyRemittance?.toLocaleString() || "---"}</p>
              <p className="text-[10px] text-slate-light uppercase mt-2">Due: {contract?.paymentDay || "Friday"}</p>
            </div>
            <div className="bg-void-dark border border-cobalt/20 p-6 rounded-xl shadow-lg">
              <ShieldCheck className="text-cobalt mb-4" size={32} />
              <p className="text-xs text-slate-light font-bold uppercase tracking-widest mb-1">Total Outstanding</p>
              <p className="text-xl font-black font-mono text-signal-red">₦{contract?.totalPrice?.toLocaleString() || "---"}</p>
              <p className="text-[10px] text-slate-light uppercase mt-2">Tenure: {contract?.agreedDurationMonths ? contract.agreedDurationMonths * 4 : "---"} Weeks</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* VIRTUAL ACCOUNT CARD */}
            <div className="lg:col-span-1 bg-void-dark border border-cobalt/20 rounded-xl p-6 shadow-lg h-fit">
              <h3 className="font-bold border-b border-cobalt/20 pb-3 mb-6 uppercase tracking-wider flex items-center gap-2">
                <Landmark size={18} className="text-cobalt"/> Payment Account
              </h3>

              {accountError && <p className="text-signal-red text-xs font-bold mb-4">{accountError}</p>}

              {rider.virtualAccountNo ? (
                <div className="bg-gradient-to-br from-cobalt/20 to-void-navy border border-cobalt/30 rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-10">
                    <Landmark size={100} />
                  </div>
                  <p className="text-[10px] text-slate-light font-bold uppercase tracking-widest mb-1">Bank Name</p>
                  <p className="text-sm font-bold text-emerald-400 mb-4">{rider.virtualBankName}</p>

                  <p className="text-[10px] text-slate-light font-bold uppercase tracking-widest mb-1">Account Number</p>
                  <div className="flex items-center gap-3 mb-4">
                    <p className="text-2xl font-black tracking-widest text-crisp-white font-mono">{rider.virtualAccountNo}</p>
                    <button onClick={() => copyToClipboard(rider.virtualAccountNo, 'acc')} className="p-2 bg-void-light/10 hover:bg-void-light/20 rounded-lg transition">
                      {copiedId === 'acc' ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} className="text-slate-light" />}
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-light font-bold uppercase tracking-widest mb-1">Account Name</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-crisp-white">{rider.virtualAccountName}</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <WalletCards size={40} className="text-slate-light/30 mx-auto mb-4" />
                  <p className="text-sm font-bold text-crisp-white mb-2">No Account Found</p>
                  <p className="text-xs text-slate-light mb-6">Generate your dedicated Paystack virtual account to make your weekly remittances.</p>
                  <button 
                    onClick={handleGenerateAccount}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-cobalt hover:bg-cobalt/90 text-crisp-white font-bold uppercase tracking-wider text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(77,148,255,0.3)] disabled:opacity-50"
                  >
                    {isGenerating ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : "Generate Account"}
                  </button>
                </div>
              )}

              <div className="mt-6 p-4 bg-signal-red/10 border border-signal-red/20 rounded-lg flex gap-3">
                <AlertTriangle size={16} className="text-signal-red shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-light leading-relaxed">
                  <strong className="text-signal-red uppercase tracking-wider block mb-1">Strict Notice</strong>
                  Transfer exact weekly amounts to this account ONLY. Cash payments to staff are prohibited. Shortfalls will accrue as debt.
                </p>
              </div>
            </div>

            {/* REMITTANCE LEDGER */}
            <div className="lg:col-span-2 bg-void-dark border border-cobalt/20 rounded-xl p-6 shadow-lg">
              <h3 className="font-bold border-b border-cobalt/20 pb-3 mb-6 uppercase tracking-wider flex items-center gap-2">
                <Clock size={18} className="text-cobalt"/> Weekly Remittance Ledger
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-cobalt/20">
                      <th className="py-3 px-4 text-[10px] font-bold text-slate-light uppercase tracking-widest whitespace-nowrap">Week</th>
                      <th className="py-3 px-4 text-[10px] font-bold text-slate-light uppercase tracking-widest whitespace-nowrap">Target</th>
                      <th className="py-3 px-4 text-[10px] font-bold text-slate-light uppercase tracking-widest whitespace-nowrap">Paid</th>
                      <th className="py-3 px-4 text-[10px] font-bold text-slate-light uppercase tracking-widest whitespace-nowrap">Arrears/Debt</th>
                      <th className="py-3 px-4 text-[10px] font-bold text-slate-light uppercase tracking-widest whitespace-nowrap text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cobalt/10">
                    {mockWeeklyLedger.map((row, idx) => (
                      <tr key={idx} className="hover:bg-void-light/5 transition-colors">
                        <td className="py-4 px-4 whitespace-nowrap">
                          <p className="text-sm font-bold text-crisp-white">Week {row.week}</p>
                          <p className="text-[10px] text-slate-light">{row.date}</p>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <p className="text-sm font-mono text-slate-light">₦{row.target.toLocaleString()}</p>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <p className="text-sm font-mono font-bold text-crisp-white">₦{row.paid.toLocaleString()}</p>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <p className={`text-sm font-mono font-bold ${row.arrears > 0 ? 'text-signal-red' : 'text-slate-light'}`}>
                            {row.arrears > 0 ? `₦${row.arrears.toLocaleString()}` : "---"}
                          </p>
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest
                            ${row.status === 'CLEARED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                              row.status === 'PARTIAL' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                              row.status === 'OVERDUE' ? 'bg-signal-red/10 text-signal-red border border-signal-red/20' : 
                              'bg-void-light/10 text-slate-light border border-void-light/20'}`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
