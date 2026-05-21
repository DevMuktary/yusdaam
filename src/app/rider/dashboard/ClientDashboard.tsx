"use client";

import { useState } from "react";
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Lock, 
  CarFront, 
  WalletCards, 
  ShieldCheck, 
  Check, 
  MessageCircle, 
  Hourglass, 
  Loader2, 
  Landmark, 
  AlertTriangle, 
  Receipt, 
  ClipboardList, 
  ArrowDownLeft 
} from "lucide-react";
import RiderVirtualAgreement from "./RiderVirtualAgreement";

export default function ClientDashboard({ 
  rider, 
  vehicle, 
  contract, 
  history, 
  nextDueDate 
}: { 
  rider: any, 
  vehicle: any, 
  contract: any, 
  history: any[], 
  nextDueDate: string 
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [accountError, setAccountError] = useState("");

  const [virtualAccount, setVirtualAccount] = useState({
    no: rider.virtualAccountNo || null,
    bank: rider.virtualBankName || null
  });

  const guarantors = rider.guarantors || [];
  const g1 = guarantors[0];
  const g2 = guarantors[1];
  
  const allGuarantorsSubmitted = g1?.status !== "PENDING" && g2?.status !== "PENDING";
  const isPendingReview = allGuarantorsSubmitted && rider.accountStatus === "PENDING";
  const isActive = rider.accountStatus === "ACTIVE";
  const isAwaitingSignature = rider.accountStatus === "AWAITING_SIGNATURE";
  const isFullyApproved = rider.accountStatus === "APPROVED" || isActive || isAwaitingSignature;

  const copyToClipboard = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const getWhatsAppLink = (name: string, token: string) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://yusdaamautos.com";
    const link = `${baseUrl}/guarantor/${token}`;
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
      setVirtualAccount({ no: data.accountNumber, bank: data.bankName });
    } catch (err: any) {
      setAccountError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const totalPaidSum = history.reduce((sum, current) => sum + current.amount, 0) + (contract?.downPayment || 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 px-4 sm:px-0 pb-20">
      
      {/* VIRTUAL AGREEMENT OVERLAY MODAL */}
      {isAwaitingSignature && vehicle && contract && (
        <RiderVirtualAgreement 
          rider={rider} 
          vehicle={vehicle} 
          contract={contract} 
          guarantors={guarantors} 
        />
      )}

      {/* Header Banner */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wide text-crisp-white">Command Center</h1>
          <p className="text-sm text-slate-light">Track your active deployment financials, operational timelines, and status logs.</p>
        </div>
        <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2 w-fit text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Profile Status: <span className="text-emerald-400 font-bold uppercase tracking-wider">{rider.accountStatus}</span>
        </div>
      </div>

      {/* PHASE STEP PROGRESS TIMELINE (Hidden once active) */}
      {!isActive && (
        <div className="bg-void-dark border border-cobalt/20 rounded-xl p-6 sm:p-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-white/5 -translate-y-1/2 z-0"></div>

            <div className="relative z-10 flex flex-row md:flex-col items-center gap-4 md:gap-3 bg-void-dark pr-4 md:pr-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 ${allGuarantorsSubmitted ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-signal-red/20 border-signal-red text-signal-red shadow-[0_0_15px_rgba(233,69,96,0.3)]'}`}>
                {allGuarantorsSubmitted ? <CheckCircle2 size={24} /> : <ShieldAlert size={24} />}
              </div>
              <div className="text-left md:text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-crisp-white">Phase 1</p>
                <p className="text-[10px] text-slate-light uppercase tracking-wider">{allGuarantorsSubmitted ? 'Sureties Cleared' : 'Pending Sureties'}</p>
              </div>
            </div>

            <div className="relative z-10 flex flex-row md:flex-col items-center gap-4 md:gap-3 bg-void-dark pr-4 md:pr-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 ${isFullyApproved ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : isPendingReview ? 'bg-cobalt/20 border-cobalt text-cobalt shadow-[0_0_15px_rgba(77,148,255,0.3)]' : 'bg-white/5 border-white/10 text-slate-light/40'}`}>
                {isFullyApproved ? <CheckCircle2 size={24} /> : isPendingReview ? <Hourglass size={24} /> : <Clock size={24} />}
              </div>
              <div className="text-left md:text-center">
                <p className={`text-xs font-bold uppercase tracking-widest ${isPendingReview || isFullyApproved ? 'text-crisp-white' : 'text-slate-light/40'}`}>Phase 2</p>
                <p className={`text-[10px] uppercase tracking-wider ${isPendingReview || isFullyApproved ? 'text-slate-light' : 'text-slate-light/40'}`}>Admin Review</p>
              </div>
            </div>

            <div className="relative z-10 flex flex-row md:flex-col items-center gap-4 md:gap-3 bg-void-dark pr-4 md:pr-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 ${isActive ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : isAwaitingSignature ? 'bg-signal-red/20 border-signal-red text-signal-red shadow-[0_0_15px_rgba(233,69,96,0.3)]' : 'bg-white/5 border-white/10 text-slate-light/40'}`}>
                {isActive ? <CarFront size={24} /> : isAwaitingSignature ? <ShieldCheck size={24} /> : <Lock size={20} />}
              </div>
              <div className="text-left md:text-center">
                <p className={`text-xs font-bold uppercase tracking-widest ${isActive || isAwaitingSignature ? 'text-crisp-white' : 'text-slate-light/40'}`}>Phase 3</p>
                <p className={`text-[10px] uppercase tracking-wider ${isActive ? 'text-slate-light' : isAwaitingSignature ? 'text-signal-red' : 'text-slate-light/40'}`}>{isAwaitingSignature ? 'Sign Handover' : 'Fleet Activation'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BACKGROUND VETTING ADMIN REVIEW BANNER */}
      {isPendingReview && (
        <div className="bg-cobalt/10 border border-cobalt/30 p-6 rounded-xl flex flex-col md:flex-row md:items-center gap-6 animate-in slide-in-from-bottom-2">
          <div className="shrink-0 bg-cobalt/20 p-4 rounded-full text-cobalt">
            <Hourglass size={32} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-cobalt uppercase tracking-widest mb-1">Corporate Compliance Processing</h2>
            <p className="text-sm text-slate-light leading-relaxed">
              Both of your guarantors have completed verification tracking. Your profile metrics are currently inside our background screening loop (Validating license history, routing address parameters, and scheduling fleet pairing assignments).
            </p>
          </div>
        </div>
      )}

      {/* INTERACTIVE GUARANTOR SHARING COMPONENT */}
      {!isFullyApproved && (
        <div className="bg-void-dark border border-cobalt/20 rounded-xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-cobalt/20 bg-white/5">
            <h3 className="text-lg font-bold uppercase tracking-wider">Guarantor Verification Tracking</h3>
            <p className="text-xs text-slate-light">Forward these individual security entry links to your designees via WhatsApp or copy directly.</p>
          </div>
          
          <div className="divide-y divide-white/5">
            {[g1, g2].map((g, index) => {
              if (!g) return null;
              const baseUrlString = typeof window !== "undefined" ? window.location.origin : "https://yusdaamautos.com";
              const link = `${baseUrlString}/guarantor/${g.token}`;
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
                      <p className="text-xs text-slate-light uppercase tracking-widest">{g.relationship.replace('_', ' ')} • Surety Profile 0{index + 1}</p>
                    </div>
                  </div>
                  
                  {!isDone ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                      <button 
                        type="button"
                        onClick={() => copyToClipboard(link, g.id)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-crisp-white font-bold uppercase tracking-wider text-xs rounded-xl transition-all"
                      >
                        {copiedId === g.id ? <><Check size={16} className="text-emerald-400"/> Copied!</> : <><Copy size={16} className="text-cobalt"/> Copy Verification Link</>}
                      </button>
                      <a 
                        href={getWhatsAppLink(g.firstName, g.token)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold uppercase tracking-wider text-xs rounded-xl transition-all"
                      >
                        <MessageCircle size={16} /> WhatsApp Dispatch
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-6 py-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold uppercase tracking-wider text-xs rounded-xl w-full lg:w-auto justify-center">
                      <CheckCircle2 size={16} /> Legal Attestation Executed
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MASTER OPERATIONS PORTAL BOUNDARY CONTAINER */}
      <div className="relative pt-4">
        
        {/* Dynamic Security Veil Layer */}
        {!isActive && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-void-navy/60 backdrop-blur-sm rounded-xl border border-white/5 mt-10 min-h-[300px]">
            <Lock size={48} className="text-slate-light mb-4 opacity-50" />
            <p className="text-sm font-bold uppercase tracking-widest text-slate-light text-center px-4 max-w-md leading-relaxed">
              {isAwaitingSignature ? "Action Mandatory: Review & Execute Vehicle Handover Agreement Above" : "Dashboard Metrics Vaulted Pending Vetting & Asset Deployment"}
            </p>
          </div>
        )}

        <div className={`transition-all duration-500 space-y-8 ${!isActive ? "opacity-30 grayscale pointer-events-none" : ""}`}>
          
          {/* CORE STATS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white/5 border border-white/10 p-5 rounded-xl shadow-lg relative overflow-hidden">
              <div className="p-3 bg-cobalt/10 text-cobalt rounded-lg w-fit mb-4"><CarFront size={20} /></div>
              <h3 className="text-2xl font-black text-crisp-white mb-1 uppercase tracking-wide">{vehicle?.registrationNumber || "PENDING"}</h3>
              <p className="text-[10px] font-bold text-slate-light/60 uppercase tracking-widest">Assigned Fleet Plate</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-xl shadow-lg relative overflow-hidden">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg w-fit mb-4"><Banknote size={20} /></div>
              <h3 className="text-2xl font-black text-emerald-400 mb-1">₦{contract?.riderWeeklyRemittance?.toLocaleString() || "0"}</h3>
              <p className="text-[10px] font-bold text-slate-light/60 uppercase tracking-widest">Target Weekly Installment</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-xl shadow-lg relative overflow-hidden">
              <div className="p-3 bg-amber-400/10 text-amber-400 rounded-lg w-fit mb-4"><Calendar size={20} /></div>
              <h3 className="text-xl font-black text-crisp-white mb-1 tracking-tight">{nextDueDate}</h3>
              <p className="text-[10px] font-bold text-slate-light/60 uppercase tracking-widest">Next Remittance Target</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-xl shadow-lg relative overflow-hidden">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg w-fit mb-4"><ClipboardList size={20} /></div>
              <h3 className="text-2xl font-black text-crisp-white mb-1">₦{totalPaidSum.toLocaleString()}</h3>
              <p className="text-[10px] font-bold text-slate-light/60 uppercase tracking-widest">Total Capital Capitalized</p>
            </div>

          </div>

          {/* LOWER RECONCILIATION CHANNELS DISPLAY */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* VIRTUAL ACCOUNT CARD COMPONENT */}
            <div className="bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between h-fit lg:col-span-1">
              <div>
                <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
                  <div className="p-2 bg-emerald-400/10 text-emerald-400 rounded-lg"><Landmark size={20} /></div>
                  <div>
                    <h3 className="font-bold text-white uppercase tracking-wider text-sm">Remittance Account</h3>
                    <p className="text-[10px] text-slate-light">Dedicated platform collection portal</p>
                  </div>
                </div>

                {accountError && <p className="text-signal-red text-xs font-bold mb-3">{accountError}</p>}

                <p className="text-xs text-slate-light leading-relaxed mb-6">
                  All manual or dynamic weekly hire purchase installments must be channeled to your custom processing details listed below. Deposits route directly into your statement tracking.
                </p>

                {virtualAccount.no ? (
                  <div className="bg-black/30 border border-emerald-500/20 rounded-xl p-4 space-y-3 shadow-inner">
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-400 block mb-0.5">Institution Node</span>
                      <p className="text-sm font-black text-white uppercase font-sans">{virtualAccount.bank}</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-400 block mb-0.5">Remittance Account No</span>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-2xl font-mono font-bold tracking-wider text-emerald-400">{virtualAccount.no}</p>
                        <button type="button" onClick={() => copyToClipboard(virtualAccount.no, 'vacc')} className="p-1.5 bg-white/5 hover:bg-white/10 rounded transition text-gray-400 hover:text-white">
                          {copiedId === 'vacc' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-black/20 border border-dashed border-white/10 rounded-xl p-6 text-center">
                    <p className="text-xs text-gray-500 mb-4">No dedicated automated account link active for your profile yet.</p>
                    <button
                      type="button"
                      onClick={handleGenerateAccount}
                      disabled={isGenerating}
                      className="inline-flex items-center gap-2 bg-cobalt px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-void-light transition disabled:opacity-50"
                    >
                      {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
                      Generate Payment Account
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 text-[10px] text-gray-500 leading-tight">
                <span className="text-signal-red font-bold uppercase block mb-1">Notice:</span>
                Never give cash to staff. Always route operations via this tracking account to safeguard balances.
              </div>
            </div>

            {/* STATEMENT HISTORY TABLE MODULE */}
            <div className="bg-white/5 border border-white/10 rounded-2xl shadow-xl overflow-hidden lg:col-span-2 flex flex-col">
              <div className="p-5 border-b border-white/10 bg-black/10">
                <h3 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
                  <Receipt size={18} className="text-cobalt" /> Operational Payment History
                </h3>
              </div>

              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-black/20 text-[10px] uppercase tracking-widest text-gray-400 border-b border-white/10">
                      <th className="p-4">Transaction Date</th>
                      <th className="p-4">Description</th>
                      <th className="p-4">Reference ID</th>
                      <th className="p-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    
                    {/* Inject original commitment down payment as initial baseline if contract exists */}
                    {contract?.downPayment > 0 && (
                      <tr className="hover:bg-white/5 transition duration-150">
                        <td className="p-4">
                          <p className="font-bold text-white">{new Date(contract.startDate || rider.createdAt).toLocaleDateString('en-GB')}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-xs text-gray-300 font-medium">Initial Commitment Down Payment</p>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-gray-500">YUS-DEPOSIT-INIT</td>
                        <td className="p-4 text-right font-bold text-emerald-400">₦{contract.downPayment.toLocaleString()}</td>
                      </tr>
                    )}

                    {history.map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/5 transition duration-150">
                        <td className="p-4">
                          <p className="font-bold text-white">{new Date(tx.date).toLocaleDateString('en-GB')}</p>
                          <p className="text-[10px] text-gray-500">{new Date(tx.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-xs text-gray-300 font-medium">{tx.description || "Weekly Installment"}</p>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-gray-500 tracking-wider">{tx.reference}</td>
                        <td className="p-4 text-right font-black text-emerald-400">₦{tx.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {history.length === 0 && (!contract || !contract.downPayment) && (
                  <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center">
                    <ArrowDownLeft size={36} className="text-gray-600 mb-2 opacity-40" />
                    <p className="text-xs">No transaction statement lines tracked on profile ledger.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
