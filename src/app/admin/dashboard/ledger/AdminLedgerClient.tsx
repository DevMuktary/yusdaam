"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Search, 
  ArrowDownRight, 
  ArrowUpRight, 
  Banknote, 
  User, 
  FileText, 
  CalendarDays, 
  Layers, 
  AlertTriangle, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function AdminLedgerClient({ ledgers, users, cycles }: { ledgers: any[], users: any[], cycles: any[] }) {
  const [selectedUserId, setSelectedUserId] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"TRANSACTIONS" | "CYCLES">("TRANSACTIONS");

  // Pagination States (10 items per page)
  const [txPage, setTxPage] = useState(1);
  const [cyclePage, setCyclePage] = useState(1);

  // Reset pagination when filters change
  useEffect(() => {
    setTxPage(1);
    setCyclePage(1);
  }, [selectedUserId, searchTerm, activeTab]);

  // Separate users into groups for the dropdown
  const riders = users.filter(u => u.role === "RIDER");
  const owners = users.filter(u => u.role === "ASSET_OWNER");
  const activeUser = users.find(u => u.id === selectedUserId);

  // --- FILTER: RAW TRANSACTIONS ---
  const filteredLedgers = useMemo(() => {
    return ledgers.filter((ledger) => {
      let userMatch = true;
      if (selectedUserId !== "ALL") {
        if (activeUser?.role === "RIDER") {
          userMatch = ledger.vehicle?.rider?.id === selectedUserId && ledger.type === "PAYMENT_COLLECTED";
        } else {
          userMatch = ledger.ownerId === selectedUserId; 
        }
      }
      const searchString = `${ledger.reference || ""} ${ledger.description || ""}`.toLowerCase();
      const textMatch = searchString.includes(searchTerm.toLowerCase());
      return userMatch && textMatch;
    });
  }, [ledgers, selectedUserId, activeUser, searchTerm]);

  // --- FILTER: WEEKLY CYCLES (DEBTS) ---
  const filteredCycles = useMemo(() => {
    return cycles.filter((cycle) => {
      let userMatch = true;
      if (selectedUserId !== "ALL") {
        if (activeUser?.role === "RIDER") {
          userMatch = cycle.contract?.vehicle?.riderId === selectedUserId;
        } else {
          userMatch = cycle.contract?.ownerId === selectedUserId;
        }
      }
      const searchString = `week ${cycle.weekNumber} ${cycle.contract?.vehicle?.registrationNumber || ""}`.toLowerCase();
      const textMatch = searchString.includes(searchTerm.toLowerCase());
      return userMatch && textMatch;
    });
  }, [cycles, selectedUserId, activeUser, searchTerm]);

  // Pagination slices (10 per view)
  const totalTxPages = Math.max(1, Math.ceil(filteredLedgers.length / ITEMS_PER_PAGE));
  const paginatedLedgers = useMemo(() => {
    const start = (txPage - 1) * ITEMS_PER_PAGE;
    return filteredLedgers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLedgers, txPage]);

  const totalCyclePages = Math.max(1, Math.ceil(filteredCycles.length / ITEMS_PER_PAGE));
  const paginatedCycles = useMemo(() => {
    const start = (cyclePage - 1) * ITEMS_PER_PAGE;
    return filteredCycles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCycles, cyclePage]);

  // Financial Summaries
  const totalInflow = filteredLedgers.filter(l => l.type === "PAYMENT_COLLECTED").reduce((sum, l) => sum + (l.amount || 0), 0);
  const totalOutflow = filteredLedgers.filter(l => l.type === "OWNER_REMITTANCE").reduce((sum, l) => sum + (l.amount || 0), 0);
  const totalOutstandingDebt = filteredCycles.filter(c => !c.isSettled).reduce((sum, c) => sum + (c.shortfallAmount || 0), 0);

  return (
    <div className="space-y-6 w-full max-w-full">
      
      {/* Notice */}
      <div className="bg-cobalt/10 border border-cobalt/30 p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Banknote className="text-cobalt shrink-0" size={22} />
          <div>
            <p className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Viewing Mode (10 records per page)</p>
            <p className="text-xs text-gray-400">Financial records are paginated for high-speed performance.</p>
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#0e1626] p-4 sm:p-5 rounded-xl border border-white/10">
        <div>
          <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-widest mb-1.5">Filter by User</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select 
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full bg-[#141f33] hover:bg-[#18263e] border border-white/15 focus:border-cobalt rounded-lg pl-10 pr-9 py-2.5 text-base sm:text-xs text-white font-medium transition outline-none appearance-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0e1626] text-white">-- All Platform Records --</option>
              <optgroup label="--- Riders ---" className="bg-[#0e1626] text-emerald-400 font-bold">
                {riders.map(r => <option key={r.id} value={r.id} className="text-white">{r.firstName} {r.lastName} ({r.phoneNumber || 'No phone'})</option>)}
              </optgroup>
              <optgroup label="--- Asset Owners ---" className="bg-[#0e1626] text-purple-400 font-bold">
                {owners.map(o => <option key={o.id} value={o.id} className="text-white">{o.firstName} {o.lastName} ({r?.phoneNumber || 'No phone'})</option>)}
              </optgroup>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-widest mb-1.5">Search Records</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search references or descriptions..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#141f33] hover:bg-[#18263e] border border-white/15 focus:border-cobalt rounded-lg pl-10 pr-4 py-2.5 text-base sm:text-xs text-white font-medium transition outline-none"
            />
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex gap-2 border-b border-white/10 pb-3">
        <button 
          onClick={() => setActiveTab("TRANSACTIONS")}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition ${
            activeTab === "TRANSACTIONS" ? "bg-cobalt text-white shadow" : "bg-white/5 text-gray-400 hover:bg-white/10"
          }`}
        >
          <Layers size={16} /> Raw Ledger ({filteredLedgers.length})
        </button>
        <button 
          onClick={() => setActiveTab("CYCLES")}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition ${
            activeTab === "CYCLES" ? "bg-signal-red text-white shadow" : "bg-white/5 text-gray-400 hover:bg-white/10"
          }`}
        >
          <CalendarDays size={16} /> Billing Debts ({filteredCycles.length})
        </button>
      </div>

      {/* DYNAMIC CONTENT BASED ON TAB */}
      {activeTab === "TRANSACTIONS" ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* TRANSACTIONS SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 rounded-lg text-emerald-400"><ArrowDownRight size={20} /></div>
              <div>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Total Inflow Collected</p>
                <h3 className="text-xl font-bold text-white">₦{totalInflow.toLocaleString()}</h3>
              </div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/20 rounded-lg text-purple-400"><ArrowUpRight size={20} /></div>
              <div>
                <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Total Outflow Remitted</p>
                <h3 className="text-xl font-bold text-white">₦{totalOutflow.toLocaleString()}</h3>
              </div>
            </div>
          </div>

          {/* TRANSACTIONS TABLE */}
          <div className="bg-[#0e1626] border border-white/10 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-gray-400 border-b border-white/10">
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Transaction Details</th>
                    <th className="p-3.5">Party</th>
                    <th className="p-3.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {paginatedLedgers.map((tx) => {
                    const isInflow = tx.type === "PAYMENT_COLLECTED";
                    return (
                      <tr key={tx.id} className="hover:bg-white/5 transition">
                        <td className="p-3.5">
                          <p className="font-bold text-white text-xs">{new Date(tx.date).toLocaleDateString('en-GB')}</p>
                          <p className="text-[10px] text-gray-500">{new Date(tx.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>
                        <td className="p-3.5">
                          <div className="flex flex-col">
                            <span className={`w-fit text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded mb-1 ${isInflow ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-400'}`}>
                              {isInflow ? 'RIDER PAYMENT' : 'OWNER PAYOUT'}
                            </span>
                            <p className="text-xs text-gray-200 font-medium">{tx.description || "Weekly Remittance"}</p>
                            <p className="text-[10px] text-gray-500 font-mono">Ref: {tx.reference}</p>
                          </div>
                        </td>
                        <td className="p-3.5">
                          {isInflow ? (
                            <div>
                              <p className="text-xs text-white">{tx.vehicle?.rider?.firstName} {tx.vehicle?.rider?.lastName}</p>
                              <p className="text-[10px] text-emerald-400">{tx.vehicle?.registrationNumber || 'Vehicle'}</p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-xs text-white">{tx.owner?.firstName} {tx.owner?.lastName}</p>
                              <p className="text-[10px] text-purple-400">Direct Remittance</p>
                            </div>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <p className={`font-mono font-bold text-sm ${isInflow ? 'text-emerald-400' : 'text-purple-400'}`}>
                            {isInflow ? '+' : '-'}₦{tx.amount.toLocaleString()}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredLedgers.length === 0 && (
                <div className="p-8 text-center text-gray-500 text-xs">
                  <FileText size={32} className="mx-auto text-gray-600 mb-2 opacity-50" />
                  <p>No transactions found.</p>
                </div>
              )}
            </div>

            {/* PAGINATION BAR (10 ITEMS PER VIEW) */}
            {filteredLedgers.length > 0 && (
              <div className="p-3.5 border-t border-white/10 bg-[#141f33]/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-gray-400">
                  Showing <strong className="text-white">{(txPage - 1) * ITEMS_PER_PAGE + 1}</strong> to <strong className="text-white">{Math.min(txPage * ITEMS_PER_PAGE, filteredLedgers.length)}</strong> of <strong className="text-white">{filteredLedgers.length}</strong> records
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTxPage(p => Math.max(1, p - 1))}
                    disabled={txPage === 1}
                    className="p-1.5 rounded-lg border border-white/15 bg-[#0e1626] text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span className="px-2.5 py-1 text-xs font-semibold text-white">
                    Page {txPage} of {totalTxPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => setTxPage(p => Math.min(totalTxPages, p + 1))}
                    disabled={txPage === totalTxPages}
                    className="p-1.5 rounded-lg border border-white/15 bg-[#0e1626] text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* CYCLES SUMMARY CARD */}
          <div className="bg-signal-red/10 border border-signal-red/20 p-4 rounded-xl flex items-center gap-3">
            <div className="p-2.5 bg-signal-red/20 rounded-lg text-signal-red"><AlertTriangle size={20} /></div>
            <div>
              <p className="text-[10px] font-bold text-signal-red uppercase tracking-widest">Total Unsettled Debt (Arrears)</p>
              <h3 className="text-xl font-bold text-white">₦{totalOutstandingDebt.toLocaleString()}</h3>
            </div>
          </div>

          {/* CYCLES TABLE */}
          <div className="bg-[#0e1626] border border-white/10 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-gray-400 border-b border-white/10">
                    <th className="p-3.5">Billing Week</th>
                    <th className="p-3.5">Rider / Vehicle</th>
                    <th className="p-3.5">Expected</th>
                    <th className="p-3.5">Actual Paid</th>
                    <th className="p-3.5">Shortfall (Debt)</th>
                    <th className="p-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {paginatedCycles.map((cycle) => {
                    const rider = cycle.contract?.vehicle?.rider;
                    return (
                      <tr key={cycle.id} className="hover:bg-white/5 transition">
                        <td className="p-3.5">
                          <p className="font-bold text-white">Week {cycle.weekNumber}</p>
                          <p className="text-[10px] text-gray-500">Ended: {new Date(cycle.endDate).toLocaleDateString('en-GB')}</p>
                        </td>
                        <td className="p-3.5">
                          <p className="text-xs text-white">{rider?.firstName} {rider?.lastName}</p>
                          <p className="text-[10px] text-cobalt">{cycle.contract?.vehicle?.registrationNumber}</p>
                        </td>
                        <td className="p-3.5 font-mono text-gray-300">
                          ₦{cycle.expectedAmount.toLocaleString()}
                        </td>
                        <td className="p-3.5 font-mono text-emerald-400 font-bold">
                          ₦{cycle.amountPaid.toLocaleString()}
                        </td>
                        <td className="p-3.5 font-mono font-bold">
                          {cycle.shortfallAmount > 0 ? (
                            <span className="text-signal-red">₦{cycle.shortfallAmount.toLocaleString()}</span>
                          ) : (
                            <span className="text-gray-500">---</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider
                            ${cycle.isSettled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-signal-red/10 text-signal-red border border-signal-red/20'}`}
                          >
                            {cycle.isSettled ? "CLEARED" : "ARREARS"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredCycles.length === 0 && (
                <div className="p-8 text-center text-gray-500 text-xs">
                  <CalendarDays size={32} className="mx-auto text-gray-600 mb-2 opacity-50" />
                  <p>No billing cycles found.</p>
                </div>
              )}
            </div>

            {/* PAGINATION BAR (10 ITEMS PER VIEW) */}
            {filteredCycles.length > 0 && (
              <div className="p-3.5 border-t border-white/10 bg-[#141f33]/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-gray-400">
                  Showing <strong className="text-white">{(cyclePage - 1) * ITEMS_PER_PAGE + 1}</strong> to <strong className="text-white">{Math.min(cyclePage * ITEMS_PER_PAGE, filteredCycles.length)}</strong> of <strong className="text-white">{filteredCycles.length}</strong> cycles
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCyclePage(p => Math.max(1, p - 1))}
                    disabled={cyclePage === 1}
                    className="p-1.5 rounded-lg border border-white/15 bg-[#0e1626] text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span className="px-2.5 py-1 text-xs font-semibold text-white">
                    Page {cyclePage} of {totalCyclePages}
                  </span>

                  <button
                    type="button"
                    onClick={() => setCyclePage(p => Math.min(totalCyclePages, p + 1))}
                    disabled={cyclePage === totalCyclePages}
                    className="p-1.5 rounded-lg border border-white/15 bg-[#0e1626] text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
