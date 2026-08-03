"use client";

import { useMemo, useState } from "react";
import { Landmark, Copy, CheckCircle2, AlertTriangle, CalendarDays, Wallet, CheckCircle } from "lucide-react";

export default function RemittancesClient({ contract, weeklyCycles }: { contract: any; weeklyCycles: any[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Trust the backend entirely for payment progress
  const schedule = useMemo(() => {
    if (!contract || !weeklyCycles.length) return [];
    
    const currentWeekNum = contract.currentWeek || 1;
    const sortedCycles = [...weeklyCycles].sort((a, b) => a.weekNumber - b.weekNumber);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return sortedCycles.map((cycle) => {
      let status = "PENDING";

      if (cycle.isSettled) {
        status = "CLEARED";
      } else if (cycle.weekNumber < currentWeekNum) {
        status = "ARREARS";
      } else if (cycle.weekNumber === currentWeekNum) {
        const dueDate = new Date(cycle.endDate);
        if (dueDate < today) status = "OVERDUE";
        else if (cycle.amountPaid > 0) status = "PARTIAL";
      }

      return {
        id: cycle.id,
        week: cycle.weekNumber,
        dueDate: new Date(cycle.endDate),
        target: cycle.expectedAmount,
        paid: cycle.amountPaid, 
        arrears: cycle.shortfallAmount,
        status: status
      };
    });
  }, [contract, weeklyCycles]);

  const totalPaid = useMemo(() => {
    return weeklyCycles.reduce((sum, cycle) => sum + (cycle.amountPaid || 0), 0);
  }, [weeklyCycles]);

  const totalArrears = useMemo(() => {
    return weeklyCycles.reduce((sum, cycle) => sum + (cycle.isSettled ? 0 : cycle.shortfallAmount), 0);
  }, [weeklyCycles]);

  if (!contract) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-[#0a0f1c] rounded-xl border border-white/5">
        <Wallet size={48} className="text-gray-600 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Active Contract</h3>
        <p className="text-gray-400">You currently do not have an active vehicle assignment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0a0f1c] p-6 rounded-xl border border-white/10 shadow-lg">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Weekly Target</p>
          <p className="text-3xl font-black text-white">₦{(contract.riderWeeklyRemittance || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">Due every {contract.remittanceDay || 'week'}</p>
        </div>
        
        <div className="bg-[#0a0f1c] p-6 rounded-xl border border-white/10 shadow-lg">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Remitted</p>
          <p className="text-3xl font-black text-emerald-400">₦{totalPaid.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">Across all weeks</p>
        </div>

        <div className="bg-[#0a0f1c] p-6 rounded-xl border border-white/10 shadow-lg relative overflow-hidden">
          {totalArrears > 0 && <div className="absolute top-0 right-0 w-1 h-full bg-red-500" />}
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Arrears</p>
          <p className={`text-3xl font-black ${totalArrears > 0 ? 'text-red-400' : 'text-white'}`}>
            ₦{totalArrears.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-2">Outstanding balance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* SCHEDULE TABLE */}
        <div className="lg:col-span-2 bg-[#0a0f1c] border border-white/10 rounded-xl overflow-hidden shadow-lg">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
            <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CalendarDays size={18} className="text-blue-400" /> Remittance Schedule
            </h3>
            <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full text-gray-300">
              Week {contract.currentWeek} of {contract.riderDurationWeeks}
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-gray-400">
                  <th className="p-4 font-bold border-b border-white/5">Week</th>
                  <th className="p-4 font-bold border-b border-white/5">Target</th>
                  <th className="p-4 font-bold border-b border-white/5">Remitted</th>
                  <th className="p-4 font-bold border-b border-white/5">Shortfall</th>
                  <th className="p-4 font-bold border-b border-white/5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-white/5">
                {schedule.map((row) => (
                  <tr key={row.id} className={`transition-colors hover:bg-white/5 ${row.week === contract.currentWeek ? 'bg-blue-500/5' : ''}`}>
                    <td className="p-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        Wk {row.week}
                        {row.week === contract.currentWeek && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">{row.dueDate.toLocaleDateString('en-GB')}</div>
                    </td>
                    <td className="p-4 text-gray-300 font-mono">₦{row.target.toLocaleString()}</td>
                    <td className="p-4 text-emerald-400 font-mono font-bold">₦{row.paid.toLocaleString()}</td>
                    <td className="p-4 text-gray-400 font-mono">
                      {row.arrears > 0 ? <span className="text-red-400 font-bold">₦{row.arrears.toLocaleString()}</span> : '₦0'}
                    </td>
                    <td className="p-4 text-right">
                      {row.status === "CLEARED" && <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20"><CheckCircle size={12}/> SETTLED</span>}
                      {row.status === "PENDING" && <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-gray-500/10 text-gray-400 rounded-lg border border-gray-500/20">PENDING</span>}
                      {row.status === "PARTIAL" && <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">PARTIAL</span>}
                      {row.status === "OVERDUE" && <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-orange-500/10 text-orange-400 rounded-lg border border-orange-500/20">LATE</span>}
                      {row.status === "ARREARS" && <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20"><AlertTriangle size={12}/> ARREARS</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* STATIC REMITTANCE ACCOUNT CARD */}
        <div className="bg-[#0a0f1c] border border-blue-500/20 rounded-xl p-6 shadow-lg h-fit sticky top-6">
          <h3 className="font-bold border-b border-white/10 pb-3 mb-6 uppercase tracking-wider flex items-center gap-2 text-white">
            <Landmark size={18} className="text-blue-400"/> Official Remittance Account
          </h3>

          <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-5">
              <Landmark size={100} />
            </div>
            
            {/* Jaiz Bank Logo & Name */}
            <div className="mb-6">
              <img src="/images/jaiz.png" alt="Jaiz Bank Logo" className="h-8 object-contain mb-2" />
              <p className="text-sm font-bold text-emerald-400 uppercase tracking-widest">JAIZ BANK</p>
            </div>

            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Account Number</p>
            <div className="flex items-center gap-3 mb-6">
              <p className="text-3xl font-black tracking-widest text-white font-mono">0027125962</p>
              <button 
                onClick={() => copyToClipboard("0027125962", 'acc')} 
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition text-gray-400 hover:text-white"
                title="Copy Account Number"
              >
                {copiedId === 'acc' ? <CheckCircle2 size={18} className="text-emerald-400" /> : <Copy size={18} />}
              </button>
            </div>

            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Account Name</p>
            <p className="text-sm font-bold uppercase tracking-wider text-white">YUSDAAM AUTOS FLEET MANAGEMENT NIG LTD</p>
          </div>

          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-3">
            <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-300 leading-relaxed">
              <strong className="text-red-400 uppercase tracking-wider block mb-1">Strict Notice</strong>
              Make all your weekly payments to the official company account above. Forward your payment receipt to the management immediately to have your dashboard updated.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
