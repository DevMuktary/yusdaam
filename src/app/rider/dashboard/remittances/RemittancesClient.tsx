"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Copy, CheckCircle2, WalletCards, ShieldCheck, AlertTriangle, Clock, Landmark, Calendar, ChevronLeft, ChevronRight, PieChart } from "lucide-react";

export default function RemittancesClient({ rider, contract }: { rider: any, contract: any }) {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [ledgerHistory, setLedgerHistory] = useState<any[]>([]);
  const [weeklyCycles, setWeeklyCycles] = useState<any[]>([]); // NEW STATE
  const [isLoadingLedger, setIsLoadingLedger] = useState(true);
  
  // Paystack Virtual Account State
  const [isGenerating, setIsGenerating] = useState(false);
  const [accountError, setAccountError] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch Raw Ledger Transactions & Isolated Cycles
  useEffect(() => {
    fetch("/api/rider/ledger")
      .then(res => res.json())
      .then(data => {
        if (data.ledger) setLedgerHistory(data.ledger);
        if (data.cycles) setWeeklyCycles(data.cycles); // Load the cycles
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
      router.refresh(); 
    } catch (err: any) {
      setAccountError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- DYNAMIC SCHEDULE GENERATOR (ISOLATED LOGIC) ---
  const schedule = useMemo(() => {
    if (!contract) return [];
    
    const totalWeeks = contract.riderDurationWeeks || 100;
    const weeklyTarget = contract.riderWeeklyRemittance || 0;
    const currentWeekNum = contract.currentWeek || 1;
    
    const generatedWeeks = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. PROCESS PAST WEEKS (Directly from DB Cycles)
    const sortedCycles = [...weeklyCycles].sort((a, b) => a.weekNumber - b.weekNumber);
    
    sortedCycles.forEach(cycle => {
      generatedWeeks.push({
        week: cycle.weekNumber,
        dueDate: new Date(cycle.endDate),
        target: cycle.expectedAmount,
        paid: cycle.amountPaid,
        arrears: cycle.shortfallAmount,
        status: cycle.isSettled ? "CLEARED" : "ARREARS"
      });
    });

    // 2. PROCESS CURRENT ACTIVE WEEK
    // Sum payments made AFTER the last closed cycle to see what they've paid this current week
    const lastCycle = sortedCycles[sortedCycles.length - 1];
    const currentWeekStartDate = lastCycle ? new Date(lastCycle.endDate) : new Date(contract.createdAt);
    
    const currentWeekPayments = ledgerHistory
      .filter(tx => new Date(tx.date) > currentWeekStartDate)
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    if (currentWeekNum <= totalWeeks && contract.isActive && contract.nextDueDate) {
      const nextDue = new Date(contract.nextDueDate);
      generatedWeeks.push({
        week: currentWeekNum,
        dueDate: nextDue,
        target: weeklyTarget,
        paid: currentWeekPayments,
        arrears: 0, // Not officially in arrears until the cron closes the week
        status: currentWeekPayments >= weeklyTarget ? "CLEARED" : (nextDue < today ? "OVERDUE" : "PENDING")
      });
    }

    // 3. PROCESS FUTURE WEEKS (Projections)
    const baseDateForFuture = contract.nextDueDate ? new Date(contract.nextDueDate) : new Date();
    for (let i = currentWeekNum + 1; i <= totalWeeks; i++) {
      const futureDate = new Date(baseDateForFuture);
      futureDate.setDate(futureDate.getDate() + ((i - currentWeekNum) * 7));
      
      generatedWeeks.push({
        week: i,
        dueDate: futureDate,
        target: weeklyTarget,
        paid: 0,
        arrears: 0,
        status: "PENDING"
      });
    }
    
    return generatedWeeks;
  }, [contract, ledgerHistory, weeklyCycles]);

  // --- DERIVED METRICS ---
  // The sum of all payments ever made
  const totalPaidSum = ledgerHistory.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  
  // Arrears is now EXACTLY the sum of unsettled historical debt
  const totalArrearsSum = weeklyCycles.reduce((sum, c) => sum + (c.isSettled ? 0 : c.shortfallAmount), 0);
  
  const weeksCleared = schedule.filter(w => w.status === "CLEARED").length;
  const totalWeeks = schedule.length;
  
  const nextDueWeek = schedule.find(w => w.status !== "CLEARED" && w.status !== "ARREARS");
  const nextDueDateStr = nextDueWeek 
    ? nextDueWeek.dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) 
    : (contract?.isActive ? "Recovery Mode" : "COMPLETED");
  
  const paymentDayName = nextDueWeek 
    ? nextDueWeek.dueDate.toLocaleDateString('en-GB', { weekday: 'long' }) 
    : "N/A";

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(totalWeeks / itemsPerPage) || 1;
  const paginatedSchedule = schedule.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-wider mb-2">Financial Hub</h1>
        <p className="text-sm text-slate-light">Track your payment schedule, virtual remittance account, and contract tenure.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: ACCOUNT & QUICK STATS */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* VIRTUAL ACCOUNT CARD */}
          <div className="bg-void-dark border border-cobalt/20 rounded-xl p-6 shadow-lg h-fit">
            <h3 className="font-bold border-b border-cobalt/20 pb-3 mb-6 uppercase tracking-wider flex items-center gap-2">
              <Landmark size={18} className="text-cobalt"/> Remittance Account
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
                  <button onClick={() => copyToClipboard(rider.virtualAccountNo, 'acc')} className="p-2 bg-void-light/10 hover:bg-void-light/20 rounded-lg transition text-slate-light hover:text-crisp-white">
                    {copiedId === 'acc' ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  </button>
                </div>

                <p className="text-[10px] text-slate-light font-bold uppercase tracking-widest mb-1">Account Name</p>
                <p className="text-xs font-bold uppercase tracking-wider text-crisp-white">{rider.virtualAccountName}</p>
              </div>
            ) : (
               // ... existing ungenerated account state
              <div className="text-center py-8 border border-dashed border-cobalt/30 rounded-xl bg-void-light/5">
                <WalletCards size={40} className="text-slate-light/30 mx-auto mb-4" />
                <p className="text-sm font-bold text-crisp-white mb-2">No Account Found</p>
                <p className="text-xs text-slate-light px-4 mb-6">Generate your dedicated static account to automatically track your weekly remittances.</p>
                <button 
                  onClick={handleGenerateAccount}
                  disabled={isGenerating}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-cobalt hover:bg-cobalt/90 text-crisp-white font-bold uppercase tracking-wider text-xs rounded-xl transition-all shadow-lg mx-auto disabled:opacity-50"
                >
                  {isGenerating ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : "Generate Account"}
                </button>
              </div>
            )}

            <div className="mt-6 p-4 bg-signal-red/10 border border-signal-red/20 rounded-lg flex gap-3">
              <AlertTriangle size={16} className="text-signal-red shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-light leading-relaxed">
                <strong className="text-signal-red uppercase tracking-wider block mb-1">Strict Notice</strong>
                All weekly remittances must be paid directly into the account above. It is tied uniquely to your profile and updates your ledger automatically.
              </p>
            </div>
          </div>

          {/* QUICK STATS METRICS */}
          <div className="bg-void-dark border border-cobalt/20 rounded-xl p-6 shadow-lg space-y-6">
            
            {/* WEEKS CLEARED VS TOTAL WEEKS */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] text-slate-light font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5"><PieChart size={12} className="text-cobalt" /> Tenure Progress</p>
                <p className="text-2xl font-black font-mono text-crisp-white">
                  <span className="text-emerald-400">{weeksCleared}</span> <span className="text-slate-light/40 text-lg">/ {totalWeeks}</span>
                </p>
                <p className="text-[10px] text-slate-light uppercase mt-1">Weeks Cleared</p>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-void-light/10 border-t-emerald-400 flex items-center justify-center">
                <span className="text-[10px] font-bold text-emerald-400">{totalWeeks > 0 ? Math.round((weeksCleared/totalWeeks) * 100) : 0}%</span>
              </div>
            </div>

            <div className="h-px w-full bg-cobalt/20"></div>
            
            {/* NEXT DUE CALCULATION */}
            <div>
              <p className="text-[10px] text-slate-light font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5"><Calendar size={12} className="text-cobalt" /> Next Remittance Target</p>
              <p className="text-2xl font-black font-mono">₦{contract?.riderWeeklyRemittance?.toLocaleString() || "---"}</p>
              
              {contract?.isActive && contract?.nextDueDate === null ? (
                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mt-1 bg-amber-500/10 px-2 py-1 rounded w-fit border border-amber-500/20">
                  Recovery Mode Active
                </p>
              ) : (
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-1 bg-emerald-500/10 px-2 py-1 rounded w-fit border border-emerald-500/20">
                  Due: {paymentDayName}, {nextDueDateStr}
                </p>
              )}
            </div>
            
            <div className="h-px w-full bg-cobalt/20"></div>

            {/* TOTALS */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] text-slate-light font-bold uppercase tracking-widest mb-1">Total Cleared</p>
                <p className="text-lg font-black font-mono text-emerald-400">₦{totalPaidSum.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-light font-bold uppercase tracking-widest mb-1">Historical Debt</p>
                <p className={`text-lg font-black font-mono ${totalArrearsSum > 0 ? "text-signal-red" : "text-slate-light"}`}>
                  ₦{totalArrearsSum.toLocaleString()}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: FULL PAGINATED SCHEDULE LEDGER */}
        <div className="lg:col-span-2 bg-void-dark border border-cobalt/20 rounded-xl shadow-lg flex flex-col h-full min-h-[600px] overflow-hidden">
          <div className="p-6 border-b border-cobalt/20 bg-void-light/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-bold uppercase tracking-wider flex items-center gap-2 text-sm">
              <Clock size={18} className="text-cobalt"/> Complete Contract Schedule
            </h3>
            <div className="text-[10px] font-mono text-slate-light bg-void-navy px-3 py-1.5 rounded-lg border border-cobalt/30">
              Showing {totalWeeks > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} - {Math.min(currentPage * itemsPerPage, totalWeeks)} of {totalWeeks} Weeks
            </div>
          </div>

          {isLoadingLedger || !contract ? (
            <div className="flex-1 flex justify-center items-center py-20">
              <Loader2 size={32} className="text-cobalt animate-spin" />
            </div>
          ) : schedule.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
              <ShieldCheck size={48} className="text-slate-light/20 mb-4" />
              <p className="text-sm font-bold text-crisp-white">No Active Contract</p>
              <p className="text-xs text-slate-light mt-2 max-w-sm">Your schedule will generate once your contract is active.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-cobalt/20 bg-void-navy">
                      <th className="py-4 px-5 text-[10px] font-bold text-slate-light uppercase tracking-widest whitespace-nowrap">Week / Date</th>
                      <th className="py-4 px-5 text-[10px] font-bold text-slate-light uppercase tracking-widest whitespace-nowrap">Target</th>
                      <th className="py-4 px-5 text-[10px] font-bold text-slate-light uppercase tracking-widest whitespace-nowrap">Paid</th>
                      <th className="py-4 px-5 text-[10px] font-bold text-slate-light uppercase tracking-widest whitespace-nowrap">Debt</th>
                      <th className="py-4 px-5 text-[10px] font-bold text-slate-light uppercase tracking-widest whitespace-nowrap text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cobalt/10">
                    {paginatedSchedule.map((row) => (
                      <tr key={row.week} className="hover:bg-void-light/5 transition-colors group">
                        <td className="py-4 px-5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-cobalt/10 text-cobalt flex items-center justify-center text-xs font-bold font-mono">
                              {row.week}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-crisp-white">Week {row.week}</p>
                              <p className="text-[10px] text-slate-light">{row.dueDate.toLocaleDateString('en-GB')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5 whitespace-nowrap">
                          <p className="text-sm font-mono text-slate-light">₦{row.target.toLocaleString()}</p>
                        </td>
                        <td className="py-4 px-5 whitespace-nowrap">
                          <p className={`text-sm font-mono font-bold ${row.paid > 0 ? 'text-emerald-400' : 'text-slate-light/40'}`}>
                            ₦{row.paid.toLocaleString()}
                          </p>
                        </td>
                        <td className="py-4 px-5 whitespace-nowrap">
                          <p className={`text-sm font-mono font-bold ${row.arrears > 0 ? 'text-signal-red' : 'text-slate-light'}`}>
                            {row.arrears > 0 ? `₦${row.arrears.toLocaleString()}` : "---"}
                          </p>
                        </td>
                        <td className="py-4 px-5 text-right whitespace-nowrap">
                          <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest
                            ${row.status === 'CLEARED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                              row.status === 'PARTIAL' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                              row.status === 'OVERDUE' || row.status === 'ARREARS' ? 'bg-signal-red/10 text-signal-red border border-signal-red/20' : 
                              'bg-void-light/10 text-slate-light/60 border border-void-light/20'}`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION CONTROLS */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-cobalt/20 bg-void-navy flex items-center justify-between">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-cobalt/30 text-slate-light hover:text-white hover:bg-void-light/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  <div className="flex gap-2">
                    {getPageNumbers().map(p => (
                      <button 
                        key={p} 
                        onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold font-mono transition ${
                          currentPage === p 
                            ? 'bg-cobalt text-white shadow-lg' 
                            : 'bg-void-light/5 border border-cobalt/20 text-slate-light hover:bg-void-light/10'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-cobalt/30 text-slate-light hover:text-white hover:bg-void-light/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
