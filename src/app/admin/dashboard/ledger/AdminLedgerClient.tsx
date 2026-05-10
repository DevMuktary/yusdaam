"use client";

import { useState } from "react";
import { Search, ArrowDownRight, ArrowUpRight, Banknote, User, FileText, Download } from "lucide-react";

export default function AdminLedgerClient({ ledgers, users }: { ledgers: any[], users: any[] }) {
  const [selectedUserId, setSelectedUserId] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Separate users into groups for the dropdown
  const riders = users.filter(u => u.role === "RIDER");
  const owners = users.filter(u => u.role === "ASSET_OWNER");

  // Determine the currently selected user object
  const activeUser = users.find(u => u.id === selectedUserId);

  // Filter Ledgers based on selection
  const filteredLedgers = ledgers.filter((ledger) => {
    // 1. Filter by User Dropdown
    let userMatch = true;
    if (selectedUserId !== "ALL") {
      if (activeUser?.role === "RIDER") {
        // If Rider selected, show payments linked to their vehicle
        userMatch = ledger.vehicle?.rider?.id === selectedUserId && ledger.type === "PAYMENT_COLLECTED";
      } else {
        // If Owner selected, show payouts sent to them (and optionally payments collected on their assets)
        userMatch = ledger.ownerId === selectedUserId; 
      }
    }

    // 2. Filter by Search Bar (Transaction Ref or Description)
    const searchString = `${ledger.reference} ${ledger.description}`.toLowerCase();
    const textMatch = searchString.includes(searchTerm.toLowerCase());

    return userMatch && textMatch;
  });

  // Calculate Summaries for the selected view
  const totalInflow = filteredLedgers
    .filter(l => l.type === "PAYMENT_COLLECTED")
    .reduce((sum, l) => sum + l.amount, 0);
    
  const totalOutflow = filteredLedgers
    .filter(l => l.type === "OWNER_REMITTANCE")
    .reduce((sum, l) => sum + l.amount, 0);

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
              <option value="ALL" className="bg-void-navy text-white">All Platform Transactions</option>
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
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Search Ledger</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search references or descriptions..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cobalt transition-colors"
            />
          </div>
        </div>

      </div>

      {/* SUMMARY CARDS */}
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

      {/* TABLE */}
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
  );
}
