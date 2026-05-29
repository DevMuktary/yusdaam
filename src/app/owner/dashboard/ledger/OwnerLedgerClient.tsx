"use client";

import { useState } from "react";
import { Wallet, ArrowDownRight, Receipt, Calendar, ArrowRightLeft, ShieldCheck, Download, Car, ExternalLink, AlertTriangle, Layers, CalendarDays } from "lucide-react";

export default function OwnerLedgerClient({ ledgers, cycles = [], user }: { ledgers: any[], cycles?: any[], user: any }) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"SCHEDULE" | "RECEIPTS">("SCHEDULE");

  // Pagination State for the Schedule Tab
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 1. Extract unique vehicles from the cycles/ledgers for the dropdown filter
  const uniqueVehiclesMap = new Map();
  cycles.forEach(c => {
    if (c.contract?.vehicle && !uniqueVehiclesMap.has(c.contract.vehicleId)) {
      uniqueVehiclesMap.set(c.contract.vehicleId, c.contract.vehicle);
    }
  });
  ledgers.forEach(tx => {
    if (tx.vehicle && !uniqueVehiclesMap.has(tx.vehicleId)) {
      uniqueVehiclesMap.set(tx.vehicleId, tx.vehicle);
    }
  });
  const uniqueVehicles = Array.from(uniqueVehiclesMap.values());

  // 2. Filter data based on selected vehicle
  const filteredLedgers = selectedVehicleId === "ALL" 
    ? ledgers 
    : ledgers.filter(tx => tx.vehicleId === selectedVehicleId);
    
  const filteredCycles = selectedVehicleId === "ALL"
    ? cycles
    : cycles.filter(c => c.contract?.vehicleId === selectedVehicleId);

  // 3. Calculate Financial Metrics
  const totalLifetimeEarnings = filteredLedgers.reduce((sum, tx) => sum + tx.amount, 0);
  const lastRemittance = filteredLedgers.length > 0 ? filteredLedgers[0].amount : 0;
  
  // INTELLIGENT PENDING MATH: Only sum weeks that are current or in the past!
  const totalPendingRemittance = filteredCycles.reduce((sum, c) => {
    // If the week hasn't arrived yet according to the contract's clock, don't count it as pending debt
    if (c.weekNumber > (c.contract?.currentWeek || 1)) return sum;
    return sum + Math.max(0, (c.ownerExpectedAmount || 0) - (c.ownerRemittedAmount || 0));
  }, 0);

  // Pagination Logic
  const totalPages = Math.ceil(filteredCycles.length / itemsPerPage) || 1;
  const paginatedCycles = filteredCycles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-cobalt/20 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-wide mb-2">Portfolio Ledger</h1>
          <p className="text-slate-light">Track your asset payout schedules and processed bank remittances.</p>
        </div>
        <button disabled className="hidden md:flex items-center gap-2 px-4 py-2 bg-void-navy border border-cobalt/30 text-slate-light text-xs font-bold uppercase tracking-wider rounded-lg hover:text-crisp-white transition opacity-50 cursor-not-allowed">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Financial KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-xl shadow-lg relative overflow-hidden transition-all">
          <div className="absolute -right-6 -top-6 text-emerald-500/10"><Wallet size={120} /></div>
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">
            {selectedVehicleId === "ALL" ? "Total Settled Earnings" : "Settled Earnings (Selected)"}
          </p>
          <h3 className="text-3xl font-black text-emerald-400">₦{totalLifetimeEarnings.toLocaleString()}</h3>
          <p className="text-xs text-slate-light mt-2">Net payouts successfully routed to your account.</p>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-xl shadow-lg transition-all relative overflow-hidden">
          <div className="absolute -right-6 -top-6 text-amber-500/10"><CalendarDays size={120} /></div>
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2">Active Pending Remittance</p>
          <div className="flex items-center gap-2">
            <h3 className="text-3xl font-black text-amber-400">₦{totalPendingRemittance.toLocaleString()}</h3>
          </div>
          <p className="text-xs text-slate-light mt-2">Current due payouts awaiting rider collection.</p>
        </div>

        <div className="bg-void-navy/50 border border-cobalt/20 p-6 rounded-xl shadow-lg">
          <p className="text-[10px] font-bold text-slate-light uppercase tracking-widest mb-2">Receiving Account</p>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={18} className="text-cobalt" />
            <h3 className="text-lg font-black text-crisp-white uppercase">{user?.bankName || "Pending"}</h3>
          </div>
          <p className="text-sm font-mono text-slate-light tracking-widest">{user?.accountNumber || "----------"}</p>
        </div>
      </div>

      {/* VEHICLE FILTER & TAB NAVIGATION */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-white/10 pb-4">
        
        <div className="flex gap-2">
          <button 
            onClick={() => { setActiveTab("SCHEDULE"); setCurrentPage(1); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${activeTab === "SCHEDULE" ? "bg-cobalt text-white shadow-lg" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
          >
            <CalendarDays size={16} /> Payout Schedule
          </button>
          <button 
            onClick={() => setActiveTab("RECEIPTS")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${activeTab === "RECEIPTS" ? "bg-cobalt text-white shadow-lg" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
          >
            <Receipt size={16} /> Processed Receipts
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select 
            value={selectedVehicleId} 
            onChange={(e) => { setSelectedVehicleId(e.target.value); setCurrentPage(1); }}
            className="bg-[#001232] border border-cobalt/30 text-white text-xs font-bold tracking-wider rounded-lg px-4 py-2.5 focus:outline-none focus:border-cobalt w-full sm:w-auto"
          >
            <option value="ALL" className="bg-[#001232] text-white">ALL ASSETS (PORTFOLIO)</option>
            {uniqueVehicles.map((v: any) => (
              <option key={v.id} value={v.id} className="bg-[#001232] text-white">
                {v.registrationNumber} - {v.makeModel}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* DYNAMIC CONTENT BASED ON TAB */}
      <div className="bg-void-navy border border-cobalt/30 rounded-xl overflow-hidden shadow-2xl">
        
        {activeTab === "SCHEDULE" && (
          <div className="animate-in fade-in duration-300">
            {/* LEGAL SHIELD BANNER */}
            <div className="bg-void-dark p-4 border-b border-cobalt/30 flex gap-3 items-start sm:items-center">
              <ShieldCheck size={24} className="text-cobalt shrink-0" />
              <p className="text-[10px] sm:text-xs text-slate-light leading-relaxed">
                <strong className="text-crisp-white uppercase tracking-wider">Administrative Notice:</strong> Yusdaam Autos acts as an asset management administrator. Asset payouts are strictly subject to successful operational collection from the rider. Unsettled weeks indicate rider arrears currently undergoing active enforcement and recovery protocols.
              </p>
            </div>

            <div className="overflow-x-auto">
              {filteredCycles.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                  <CalendarDays size={48} className="text-cobalt/30 mb-4" />
                  <p className="text-slate-light font-medium">No weekly cycles found.</p>
                  <p className="text-xs text-slate-light/70 mt-2">Schedules will generate automatically once the vehicle is assigned.</p>
                </div>
              ) : (
                <>
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                      <tr className="bg-void-light/5 text-[10px] uppercase tracking-widest text-slate-light border-b border-cobalt/30">
                        <th className="p-4 font-bold">Billing Week</th>
                        <th className="p-4 font-bold">Asset ID</th>
                        <th className="p-4 font-bold">Expected Payout</th>
                        <th className="p-4 font-bold">Amount Remitted</th>
                        <th className="p-4 font-bold">Pending Remittance</th>
                        <th className="p-4 font-bold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cobalt/10">
                      {paginatedCycles.map((cycle) => {
                        const pending = Math.max(0, (cycle.ownerExpectedAmount || 0) - (cycle.ownerRemittedAmount || 0));
                        
                        // INTELLIGENT STATUS DISPLAY
                        let statusText = "PENDING";
                        let statusClass = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
                        
                        if (cycle.isOwnerSettled) {
                          statusText = "SETTLED";
                          statusClass = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                        } else if (cycle.weekNumber > (cycle.contract?.currentWeek || 1)) {
                          statusText = "UPCOMING";
                          statusClass = "bg-void-light/10 text-slate-light/60 border border-void-light/20";
                        } else if (cycle.ownerRemittedAmount > 0 && pending > 0) {
                          statusText = "PARTIAL";
                          statusClass = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
                        }

                        // If it is a future week, hide the "Pending" amount visually to avoid confusion
                        const displayPending = cycle.weekNumber > (cycle.contract?.currentWeek || 1) && !cycle.isOwnerSettled ? "---" : (pending > 0 ? `₦${pending.toLocaleString()}` : "---");

                        return (
                          <tr key={cycle.id} className={`hover:bg-void-light/5 transition duration-150 ${statusText === "UPCOMING" ? "opacity-60" : ""}`}>
                            <td className="p-4">
                              <p className="font-bold text-sm text-crisp-white">Week {cycle.weekNumber}</p>
                              <p className="text-[10px] text-slate-light">{new Date(cycle.endDate).toLocaleDateString('en-GB')}</p>
                            </td>
                            <td className="p-4">
                              <span className="text-[10px] font-bold text-crisp-white tracking-widest uppercase bg-cobalt/20 border border-cobalt/30 px-2 py-1 rounded">
                                {cycle.contract?.vehicle?.registrationNumber || "N/A"}
                              </span>
                            </td>
                            <td className="p-4">
                              <p className="text-sm font-mono text-slate-light">₦{(cycle.ownerExpectedAmount || 0).toLocaleString()}</p>
                            </td>
                            <td className="p-4">
                              <p className={`text-sm font-mono font-bold ${cycle.ownerRemittedAmount > 0 ? 'text-emerald-400' : 'text-slate-light/40'}`}>
                                ₦{(cycle.ownerRemittedAmount || 0).toLocaleString()}
                              </p>
                            </td>
                            <td className="p-4">
                              <p className={`text-sm font-mono font-bold ${pending > 0 && statusText !== "UPCOMING" ? 'text-amber-400' : 'text-slate-light'}`}>
                                {displayPending}
                              </p>
                            </td>
                            <td className="p-4 text-right">
                              <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest ${statusClass}`}>
                                {statusText}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="p-4 border-t border-cobalt/20 flex items-center justify-between bg-void-dark">
                      <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-xs font-bold text-slate-light uppercase tracking-wider hover:text-white disabled:opacity-30 transition"
                      >
                        Prev
                      </button>
                      <span className="text-xs text-slate-light font-mono">Page {currentPage} of {totalPages}</span>
                      <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-xs font-bold text-slate-light uppercase tracking-wider hover:text-white disabled:opacity-30 transition"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ... (Receipts Tab remains unchanged) */}
        {activeTab === "RECEIPTS" && (
          <div className="animate-in fade-in duration-300">
            <div className="overflow-x-auto">
              {filteredLedgers.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                  <Receipt size={48} className="text-cobalt/30 mb-4" />
                  <p className="text-slate-light font-medium">No processed receipts found.</p>
                  <p className="text-xs text-slate-light/70 mt-2">Transactions will appear here automatically upon your first payout.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-void-light/5 text-[10px] uppercase tracking-widest text-slate-light border-b border-cobalt/30">
                      <th className="p-4 font-bold">Date / Ref</th>
                      <th className="p-4 font-bold">Asset ID</th>
                      <th className="p-4 font-bold">Description</th>
                      <th className="p-4 font-bold text-center">Receipt</th>
                      <th className="p-4 font-bold text-right">Net Payout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cobalt/10">
                    {filteredLedgers.map((tx) => (
                      <tr key={tx.id} className="hover:bg-void-light/5 transition duration-150">
                        <td className="p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar size={12} className="text-cobalt" />
                            <p className="font-bold text-xs text-crisp-white">{new Date(tx.date).toLocaleDateString()}</p>
                          </div>
                          <p className="text-[10px] text-slate-light font-mono uppercase">TXN-{tx.id.slice(-8)}</p>
                        </td>
                        <td className="p-4">
                          <span className="text-[10px] font-bold text-crisp-white tracking-widest uppercase bg-cobalt/20 border border-cobalt/30 px-2 py-1 rounded">
                            {tx.vehicle?.registrationNumber || "N/A"}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="text-xs font-bold text-crisp-white uppercase tracking-wider">{tx.description || "Weekly Remittance"}</p>
                          <p className="text-[10px] text-slate-light mt-1">Direct Bank Transfer</p>
                        </td>
                        <td className="p-4 text-center">
                          {tx.receiptUrl ? (
                            <a 
                              href={tx.receiptUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-cobalt/10 hover:bg-cobalt/20 text-cobalt text-[10px] font-bold uppercase tracking-widest rounded transition border border-cobalt/20"
                            >
                              View <ExternalLink size={12} />
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-light/50 italic uppercase tracking-widest">Pending</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <span className="inline-flex items-center gap-1.5 bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-3 py-1.5 rounded-md">
                            <ArrowDownRight size={14} />
                            <span className="font-black text-sm tracking-wider">₦{tx.amount.toLocaleString()}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
