"use client";

import { useState, useEffect } from "react";
import { 
  Loader2, 
  Copy, 
  CheckCircle2, 
  WalletCards, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Landmark, 
  CreditCard, 
  Check 
} from "lucide-react";

export default function RemittancesClient({ rider, contract }: { rider: any, contract: any }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [ledgerData, setLedgerData] = useState<any[]>([]);
  const [isLoadingLedger, setIsLoadingLedger] = useState(true);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [accountError, setAccountError] = useState("");
  const [virtualAccount, setVirtualAccount] = useState({
    no: rider.virtualAccountNo || null,
    bank: rider.virtualBankName || null,
    name: rider.name || `${rider.firstName} ${rider.lastName}`
  });

  // Fetch Real Ledger Data
  useEffect(() => {
    fetch("/api/rider/ledger")
      .then(res => res.json())
      .then(data => {
        if (data.ledger) setLedgerData(data.ledger);
        setIsLoadingLedger(false);
      })
      .catch(err => {
        console.error("Ledger Error", err);
        setIsLoadingLedger(false);
      });
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleGenerateAccount = async () => {
    setIsGenerating(true);
    setAccountError("");
    try {
      const res = await fetch("/api/rider/generate-account", { method: "POST" });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to generate account");
      
      setVirtualAccount({ 
        no: data.accountNumber, 
        bank: data.bankName,
        name: rider.name || `${rider.firstName} ${rider.lastName}`
      });
    } catch (err: any) {
      setAccountError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate high-level stats from the ledger data
  const totalPaid = ledgerData.reduce((sum, row) => sum + row.paid, 0);
  const currentArrears = ledgerData.length > 0 ? ledgerData[0].arrears : 0; // The most recent week holds cumulative arrears

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 px-4 sm:px-0">
      
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-black uppercase tracking-wide mb-2 text-crisp-white">Financial Hub</h1>
        <p className="text-sm text-slate-light">Track your payment history, current arrears, and contract target.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: ACCOUNT & STATS */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* VIRTUAL ACCOUNT CARD */}
          <div className="bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between h-fit">
            <div>
              <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
                <div className="p-2 bg-emerald-400/10 text-emerald-400 rounded-lg"><Landmark size={20} /></div>
                <div>
                  <h3 className="font-bold text-white uppercase tracking-wider text-sm">Remittance Account</h3>
                  <p className="text-[10px] text-slate-light">Dedicated platform collection portal</p>
                </div>
              </div>

              {accountError && <p className="text-signal-red text-xs font-bold mb-3">{accountError}</p>}

              {virtualAccount.no ? (
                <div className="bg-black/30 border border-emerald-500/20 rounded-xl p-4 space-y-3 shadow-inner">
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-400 block mb-0.5">Institution Node</span>
                    <p className="text-sm font-black text-white uppercase font-sans">{virtualAccount.bank}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-400 block mb-0.5">Account Number</span>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-2xl font-mono font-bold tracking-wider text-emerald-400">{virtualAccount.no}</p>
                      <button type="button" onClick={() => copyToClipboard(virtualAccount.no as string, 'vacc')} className="p-1.5 bg-white/5 hover:bg-white/10 rounded transition text-gray-400 hover:text-white">
                        {copiedId === 'vacc' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-400 block mb-0.5">Account Name</span>
                    <p className="text-xs font-bold uppercase tracking-wider text-white">{virtualAccount.name}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-black/20 border border-dashed border-white/10 rounded-xl p-6 text-center">
                  <WalletCards size={32} className="text-slate-light/30 mx-auto mb-3" />
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

            <div className="mt-6 p-4 bg-signal-red/10 border border-signal-red/20 rounded-lg flex gap-3">
              <AlertTriangle size={16} className="text-signal-red shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-light leading-relaxed">
                <strong className="text-signal-red uppercase tracking-wider block mb-1">Strict Notice</strong>
                All weekly remittances must be paid directly into the account above. Cash payments to staff are not allowed and will not be recorded.
              </p>
            </div>
          </div>

          {/* QUICK STATS */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <p className="text-[10px] text-slate-light font-bold uppercase tracking-widest mb-1">Weekly Target</p>
              <p className="text-2xl font-black font-mono text-crisp-white">₦{contract?.riderWeeklyRemittance?.toLocaleString() || "---"}</p>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-1">Due every {contract?.paymentDay || "Friday"}</p>
            </div>
            
            <div className="h-px w-full bg-white/10"></div>
            
            <div>
              <p className="text-[10px] text-slate-light font-bold uppercase tracking-widest mb-1">Total Cleared</p>
              <p className="text-2xl font-black font-mono text-emerald-400">₦{totalPaid.toLocaleString()}</p>
            </div>

            <div className="h-px w-full bg-white/10"></div>

            <div>
              <p className="text-[10px] text-slate-light font-bold uppercase tracking-widest mb-1">Current Arrears</p>
              <p className={`text-2xl font-black font-mono ${currentArrears > 0 ? "text-signal-red" : "text-slate-light"}`}>
                ₦{currentArrears.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FULL LEDGER TABLE */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl shadow-xl flex flex-col h-full min-h-[600px] overflow-hidden">
          <div className="p-5 border-b border-white/10 bg-black/10">
            <h3 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
              <Clock size={18} className="text-cobalt"/> Complete Weekly Ledger
            </h3>
          </div>

          {isLoadingLedger ? (
            <div className="flex-1 flex justify-center items-center py-20">
              <Loader2 size={32} className="text-cobalt animate-spin" />
            </div>
          ) : ledgerData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
              <ShieldCheck size={48} className="text-slate-light/20 mb-4" />
              <p className="text-sm font-bold text-crisp-white">No Remittance History</p>
              <p className="text-xs text-slate-light mt-2 max-w-sm">Your weekly ledger will automatically generate and update once your contract duration officially begins.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-black/20 text-[10px] uppercase tracking-widest text-gray-400 border-b border-white/10">
                    <th className="py-4 px-4 whitespace-nowrap">Week</th>
                    <th className="py-4 px-4 whitespace-nowrap">Target</th>
                    <th className="py-4 px-4 whitespace-nowrap">Paid</th>
                    <th className="py-4 px-4 whitespace-nowrap">Arrears/Debt</th>
                    <th className="py-4 px-4 text-right whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {ledgerData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 whitespace-nowrap">
                        <p className="font-bold text-crisp-white">Week {row.week}</p>
                        <p className="text-[10px] text-gray-500">{row.date}</p>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <p className="font-mono text-gray-300">₦{row.target.toLocaleString()}</p>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <p className="font-mono font-bold text-emerald-400">₦{row.paid.toLocaleString()}</p>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <p className={`font-mono font-bold ${row.arrears > 0 ? 'text-signal-red' : 'text-gray-500'}`}>
                          {row.arrears > 0 ? `₦${row.arrears.toLocaleString()}` : "---"}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest
                          ${row.status === 'CLEARED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                            row.status === 'PARTIAL' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                            row.status === 'OVERDUE' || row.status === 'ARREARS' ? 'bg-signal-red/10 text-signal-red border border-signal-red/20' : 
                            'bg-white/5 text-slate-light border border-white/10'}`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
