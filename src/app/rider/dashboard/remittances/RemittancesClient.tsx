"use client";

import { useState, useEffect } from "react";
import { Loader2, Copy, CheckCircle2, WalletCards, ShieldCheck, AlertTriangle, Clock, Landmark } from "lucide-react";

export default function RemittancesClient({ rider, contract }: { rider: any, contract: any }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [ledgerData, setLedgerData] = useState<any[]>([]);
  const [isLoadingLedger, setIsLoadingLedger] = useState(true);

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

  // Calculate high-level stats from the ledger data
  const totalPaid = ledgerData.reduce((sum, row) => sum + row.paid, 0);
  const currentArrears = ledgerData.length > 0 ? ledgerData[0].arrears : 0; // The most recent week holds cumulative arrears

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-wider mb-2">Financial Hub</h1>
        <p className="text-sm text-slate-light">Track your payment history, current arrears, and contract target.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: ACCOUNT & STATS */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* VIRTUAL ACCOUNT CARD */}
          <div className="bg-void-dark border border-cobalt/20 rounded-xl p-6 shadow-lg h-fit">
            <h3 className="font-bold border-b border-cobalt/20 pb-3 mb-6 uppercase tracking-wider flex items-center gap-2">
              <Landmark size={18} className="text-cobalt"/> Payment Account
            </h3>

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
              <div className="text-center py-8 border border-dashed border-gray-600 rounded-xl">
                <WalletCards size={40} className="text-slate-light/30 mx-auto mb-4" />
                <p className="text-sm font-bold text-crisp-white mb-2">No Account Found</p>
                <p className="text-xs text-slate-light px-4">Generate your virtual account from the main dashboard to make remittances.</p>
              </div>
            )}

            <div className="mt-6 p-4 bg-signal-red/10 border border-signal-red/20 rounded-lg flex gap-3">
              <AlertTriangle size={16} className="text-signal-red shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-light leading-relaxed">
                <strong className="text-signal-red uppercase tracking-wider block mb-1">Strict Notice</strong>
                All weekly remittances must be paid directly into the account above. Cash payments are not allowed.
              </p>
            </div>
          </div>

          {/* QUICK STATS */}
          <div className="bg-void-dark border border-cobalt/20 rounded-xl p-6 shadow-lg space-y-6">
            <div>
              <p className="text-[10px] text-slate-light font-bold uppercase tracking-widest mb-1">Weekly Target</p>
              <p className="text-2xl font-black font-mono">₦{contract?.weeklyRemittance?.toLocaleString() || "---"}</p>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-1">Due every {contract?.paymentDay || "Friday"}</p>
            </div>
            
            <div className="h-px w-full bg-cobalt/20"></div>
            
            <div>
              <p className="text-[10px] text-slate-light font-bold uppercase tracking-widest mb-1">Total Cleared</p>
              <p className="text-2xl font-black font-mono text-emerald-400">₦{totalPaid.toLocaleString()}</p>
            </div>

            <div className="h-px w-full bg-cobalt/20"></div>

            <div>
              <p className="text-[10px] text-slate-light font-bold uppercase tracking-widest mb-1">Current Arrears</p>
              <p className={`text-2xl font-black font-mono ${currentArrears > 0 ? "text-signal-red" : "text-slate-light"}`}>
                ₦{currentArrears.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FULL LEDGER */}
        <div className="lg:col-span-2 bg-void-dark border border-cobalt/20 rounded-xl p-6 shadow-lg flex flex-col h-full min-h-[600px]">
          <h3 className="font-bold border-b border-cobalt/20 pb-3 mb-6 uppercase tracking-wider flex items-center gap-2">
            <Clock size={18} className="text-cobalt"/> Complete Weekly Ledger
          </h3>

          {isLoadingLedger ? (
            <div className="flex-1 flex justify-center items-center py-20">
              <Loader2 size={32} className="text-cobalt animate-spin" />
            </div>
          ) : ledgerData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
              <ShieldCheck size={48} className="text-slate-light/20 mb-4" />
              <p className="text-sm font-bold text-crisp-white">No Remittance History</p>
              <p className="text-xs text-slate-light mt-2 max-w-sm">Your weekly ledger will automatically generate and update once your contract duration officially begins.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-cobalt/20 bg-void-light/5">
                    <th className="py-4 px-4 text-[10px] font-bold text-slate-light uppercase tracking-widest whitespace-nowrap rounded-tl-lg">Week</th>
                    <th className="py-4 px-4 text-[10px] font-bold text-slate-light uppercase tracking-widest whitespace-nowrap">Target</th>
                    <th className="py-4 px-4 text-[10px] font-bold text-slate-light uppercase tracking-widest whitespace-nowrap">Paid</th>
                    <th className="py-4 px-4 text-[10px] font-bold text-slate-light uppercase tracking-widest whitespace-nowrap">Arrears/Debt</th>
                    <th className="py-4 px-4 text-[10px] font-bold text-slate-light uppercase tracking-widest whitespace-nowrap text-right rounded-tr-lg">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cobalt/10">
                  {ledgerData.map((row, idx) => (
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
                            row.status === 'OVERDUE' || row.status === 'ARREARS' ? 'bg-signal-red/10 text-signal-red border border-signal-red/20' : 
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
          )}
        </div>

      </div>
    </div>
  );
}
