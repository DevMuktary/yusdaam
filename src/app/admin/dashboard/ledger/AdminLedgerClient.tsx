"use client";

import { useState } from "react";
import { Search, ArrowDownRight, ArrowUpRight, Banknote, User, FileText, CalendarDays, Layers, AlertTriangle } from "lucide-react";

export default function AdminLedgerClient({ ledgers, users, cycles }: { ledgers: any[], users: any[], cycles: any[] }) {
  const [selectedUserId, setSelectedUserId] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"TRANSACTIONS" | "CYCLES">("TRANSACTIONS");

  // Separate users into groups for the dropdown
  const riders = users.filter(u => u.role === "RIDER");
  const owners = users.filter(u => u.role === "ASSET_OWNER");
  const activeUser = users.find(u => u.id === selectedUserId);

  // --- FILTER: RAW TRANSACTIONS ---
  const filteredLedgers = ledgers.filter((ledger) => {
    let userMatch = true;
    if (selectedUserId !== "ALL") {
      if (activeUser?.role === "RIDER") {
        userMatch = ledger.vehicle?.rider?.id === selectedUserId && ledger.type === "PAYMENT_COLLECTED";
      } else {
        userMatch = ledger.ownerId === selectedUserId; 
      }
    }
    const searchString = `${ledger.reference} ${ledger.description}`.toLowerCase();
    const textMatch = searchString.includes(searchTerm.toLowerCase());
    return userMatch && textMatch;
  });

  // --- FILTER: WEEKLY CYCLES (DEBTS) ---
  const filteredCycles = cycles.filter((cycle) => {
    let userMatch = true;
    if (selectedUserId !== "ALL") {
      if (activeUser?.role === "RIDER") {
        userMatch = cycle.contract?.vehicle?.riderId === selectedUserId;
      } else {
        userMatch = cycle.contract?.ownerId === selectedUserId;
      }
    }
    const searchString = `week ${cycle.weekNumber} ${cycle.contract?.vehicle?.registrationNumber}`.toLowerCase();
    const textMatch = searchString.includes(searchTerm.toLowerCase());
    return userMatch && textMatch;
  });

  // Summaries for Raw Transactions
  const totalInflow = filteredLedgers.filter(l => l.type === "PAYMENT_COLLECTED").reduce((sum, l) => sum + l.amount, 0);
  const totalOutflow = filteredLedgers.filter(l => l.type === "OWNER_REMITTANCE").reduce((sum, l) => sum + l.amount, 0);

  // Summaries for Billing Cycles
  const totalOutstandingDebt = filteredCycles.filter(c => !c.isSettled).reduce((sum, c) => sum + c.shortfallAmount, 0);

  return (
    <div className="space-y-6">
      
      {/* Notice regarding the upcoming Payment Module */}
      <div className="bg-cobalt/10 border border-cobalt/30 p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Banknote className="text-cobalt" size={24} />
          <div>
            <p className="text-sm font-bold text-white uppercase tracking-wider">Viewing Mode Only</p>
            <p className="text-xs text-gray-400">Manual payment logging and receipt uploads are handled in the Payments module.</p>
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-void-navy p-5 rounded-xl border border-white/10 shadow-lg">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Filter by User</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select 
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cobalt appearance-none cursor-pointer"
            >
              <option value="ALL" className="bg-void-navy text-white">All Platform Records</option>
              <optgroup label="--- Riders ---" className="bg-void-navy text-emerald-400 font-bold">
                {riders.map(r => <option key={r.id} value={r.id} className="text-white">{r.firstName} {r.lastName} ({r.phoneNumber})</option>)}
              </optgroup>
              <optgroup label="--- Asset Owners ---" className="bg-void-navy text-purple-400 font-bold">
                {owners.map(o => <option key={o.id} value={o.id} className="text-white">{o.firstName} {o.lastName} ({o.phoneNumber})</option>)}
              </optgroup>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Search Records</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search references, descriptions, or plates..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cobalt transition-colors"
            />
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        <button 
          onClick={() => setActiveTab("TRANSACTIONS")}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition ${activeTab === "TRANSACTIONS" ? "bg-cobalt text-white shadow-lg" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
        >
          <Layers size={18} /> Raw Ledger
        </button>
        <button 
          onClick={() => setActiveTab("CYCLES")}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition ${activeTab === "CYCLES" ? "bg-signal-red text-white shadow-lg" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
        >
          <CalendarDays size={18} /> Billing Cycles & Debts
        </button>
      </div>

      {/* DYNAMIC CONTENT BASED ON TAB */}
      {activeTab === "TRANSACTIONS" ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* TRANSACTIONS SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-xl shadow-lg flex items-center gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400"><ArrowDownRight size={24} /></div>
              <div>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Total Collected (Inflow)</p>
                <h3 className="text-2xl font-black text-white">₦{totalInflow.toLocaleString()}</h3>
              </div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 p-5 rounded-xl shadow-lg flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400"><ArrowUpRight size={24} /></div>
              <div>
                <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Total Remitted (Outflow)</p>
                <h3 className="text-2xl font-black text-white">₦{totalOutflow.toLocaleString()}</h3>
              </div>
            </div>
          </div>

          {/* TRANSACTIONS TABLE */}
          <div className="bg-void-navy border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-gray-400 border-b border-white/10">
                    <th className="p-4">Date</th>
                    <th className="p-4">Transaction Details</th>
                    <th className="p-4">Party</th>
                    <th className="p-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLedgers.map((tx) => {
                    const isInflow = tx.type === "PAYMENT_COLLECTED";
                    return (
                      <tr key={tx.id} className="hover:bg-white/5 transition duration-150">
                        <td className="p-4">
                          <p className="font-bold text-white text-sm">{new Date(tx.date).toLocaleDateString('en-GB')}</p>
                          <p className="text-[10px] text-gray-500">{new Date(tx.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className={`w-fit text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded mb-1 ${isInflow ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-400'}`}>
                              {isInflow ? 'RIDER PAYMENT' : 'OWNER PAYOUT'}
                            </span>
                            <p className="text-sm text-gray-300 font-medium">{tx.description || "Weekly Remittance"}</p>
                            <p className="text-[10px] text-gray-500 font-mono tracking-wider">Ref: {tx.reference}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          {isInflow ? (
                            <div>
                              <p className="text-xs text-white">Rider: {tx.vehicle?.rider?.firstName} {tx.vehicle?.rider?.lastName}</p>
                              <p className="text-[10px] text-emerald-400 uppercase tracking-widest">Via Vehicle: {tx.vehicle?.registrationNumber}</p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-xs text-white">Owner: {tx.owner?.firstName} {tx.owner?.lastName}</p>
                              <p className="text-[10px] text-purple-400 uppercase tracking-widest">Direct Remittance</p>
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <p className={`font-black text-lg ${isInflow ? 'text-emerald-400' : 'text-purple-400'}`}>
                            {isInflow ? '+' : '-'}₦{tx.amount.toLocaleString()}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredLedgers.length === 0 && (
                <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center">
                  <FileText size={48} className="text-gray-600 mb-4 opacity-50" />
                  <p>No transaction records found for this selection.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* CYCLES SUMMARY CARD */}
          <div className="bg-signal-red/10 border border-signal-red/20 p-5 rounded-xl shadow-lg flex items-center gap-4">
            <div className="p-3 bg-signal-red/20 rounded-lg text-signal-red"><AlertTriangle size={24} /></div>
            <div>
              <p className="text-[10px] font-bold text-signal-red uppercase tracking-widest mb-1">Total Unsettled Debt (Arrears)</p>
              <h3 className="text-2xl font-black text-white">₦{totalOutstandingDebt.toLocaleString()}</h3>
            </div>
          </div>

          {/* CYCLES TABLE */}
          <div className="bg-void-navy border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-gray-400 border-b border-white/10">
                    <th className="p-4">Billing Week</th>
                    <th className="p-4">Rider / Vehicle</th>
                    <th className="p-4">Expected</th>
                    <th className="p-4">Actual Paid</th>
                    <th className="p-4">Shortfall (Debt)</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredCycles.map((cycle) => {
                    const rider = cycle.contract?.vehicle?.rider;
                    return (
                      <tr key={cycle.id} className="hover:bg-white/5 transition duration-150">
                        <td className="p-4">
                          <p className="font-bold text-white text-sm">Week {cycle.weekNumber}</p>
                          <p className="text-[10px] text-gray-500">Ended: {new Date(cycle.endDate).toLocaleDateString('en-GB')}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-xs text-white">{rider?.firstName} {rider?.lastName}</p>
                          <p className="text-[10px] text-cobalt uppercase tracking-widest">{cycle.contract?.vehicle?.registrationNumber}</p>
                        </td>
                        <td className="p-4 font-mono text-sm text-gray-300">
                          ₦{cycle.expectedAmount.toLocaleString()}
                        </td>
                        <td className="p-4 font-mono text-sm text-emerald-400 font-bold">
                          ₦{cycle.amountPaid.toLocaleString()}
                        </td>
                        <td className="p-4 font-mono text-sm font-bold">
                          {cycle.shortfallAmount > 0 ? (
                            <span className="text-signal-red">₦{cycle.shortfallAmount.toLocaleString()}</span>
                          ) : (
                            <span className="text-gray-500">---</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest
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
                <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center">
                  <CalendarDays size={48} className="text-gray-600 mb-4 opacity-50" />
                  <p>No billing cycles found for this selection.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
