"use client";

import { useState } from "react";
import { Wallet, ArrowDownRight, Receipt, Calendar, ArrowRightLeft, ShieldCheck, Download, Car, ExternalLink } from "lucide-react";

export default function OwnerLedgerClient({ ledgers, user }: { ledgers: any[], user: any }) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("ALL");

  // 1. Extract unique vehicles from the ledger history for the dropdown filter
  const uniqueVehiclesMap = new Map();
  ledgers.forEach(tx => {
    if (tx.vehicle && !uniqueVehiclesMap.has(tx.vehicleId)) {
      uniqueVehiclesMap.set(tx.vehicleId, tx.vehicle);
    }
  });
  const uniqueVehicles = Array.from(uniqueVehiclesMap.values());

  // 2. Filter the ledger rows based on the selected vehicle
  const filteredLedgers = selectedVehicleId === "ALL" 
    ? ledgers 
    : ledgers.filter(tx => tx.vehicleId === selectedVehicleId);

  // 3. Calculate Financial Metrics dynamically based on the filtered results!
  const totalLifetimeEarnings = filteredLedgers.reduce((sum, tx) => sum + tx.amount, 0);
  const lastRemittance = filteredLedgers.length > 0 ? filteredLedgers[0].amount : 0;
  const totalTransactions = filteredLedgers.length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-cobalt/20 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-wide mb-2">Financial Ledger</h1>
          <p className="text-slate-light">Immutable historical record of all asset remittances and payouts.</p>
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
            {selectedVehicleId === "ALL" ? "Total Lifetime Earnings" : "Earnings for Selected Asset"}
          </p>
          <h3 className="text-3xl font-black text-emerald-400">₦{totalLifetimeEarnings.toLocaleString()}</h3>
          <p className="text-xs text-slate-light mt-2">Net payouts successfully routed to your account.</p>
        </div>

        <div className="bg-void-navy/50 border border-cobalt/20 p-6 rounded-xl shadow-lg transition-all">
          <p className="text-[10px] font-bold text-slate-light uppercase tracking-widest mb-2">Last Remittance</p>
          <div className="flex items-center gap-2">
            <ArrowDownRight size={20} className="text-crisp-white" />
            <h3 className="text-3xl font-black text-crisp-white">₦{lastRemittance.toLocaleString()}</h3>
          </div>
          <p className="text-xs text-slate-light mt-2">Latest processed weekly payment.</p>
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

      {/* Transaction Table */}
      <div className="bg-void-navy border border-cobalt/30 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-6 border-b border-cobalt/30 bg-void-light/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="font-bold uppercase tracking-wider flex items-center gap-2 text-sm">
            <Receipt size={18} className="text-cobalt" /> Remittance History
          </h3>
          
          {/* VEHICLE FILTER DROPDOWN */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select 
              value={selectedVehicleId} 
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="bg-[#001232] border border-cobalt/30 text-white text-xs font-bold tracking-wider rounded-lg px-4 py-2 focus:outline-none focus:border-cobalt w-full sm:w-auto"
            >
              <option value="ALL" className="bg-[#001232] text-white">ALL ASSETS ({ledgers.length} TXNS)</option>
              {uniqueVehicles.map(v => (
                <option key={v.id} value={v.id} className="bg-[#001232] text-white">
                  {v.registrationNumber} - {v.makeModel}
                </option>
              ))}
            </select>
            
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-light font-medium bg-void-dark px-3 py-2 rounded-lg border border-cobalt/30 shrink-0">
              <ArrowRightLeft size={14} /> {totalTransactions}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredLedgers.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <Receipt size={48} className="text-cobalt/30 mb-4" />
              <p className="text-slate-light font-medium">No ledger records found.</p>
              <p className="text-xs text-slate-light/70 mt-2">Transactions will appear here automatically upon your first weekly payout.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-void-dark/50 text-[10px] uppercase tracking-widest text-slate-light border-b border-cobalt/30">
                  <th className="p-4 font-bold">Date / Ref</th>
                  <th className="p-4 font-bold">Asset ID</th>
                  <th className="p-4 font-bold">Description</th>
                  <th className="p-4 font-bold">Gross</th>
                  <th className="p-4 font-bold">Admin Fee</th>
                  <th className="p-4 font-bold text-center">Receipt</th>
                  <th className="p-4 font-bold text-right">Net Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cobalt/10">
                {filteredLedgers.map((tx) => {
                  const netAmount = tx.amount;
                  const adminFee = 0; // Replace with tx.adminFee if added to Prisma schema in the future
                  const grossAmount = netAmount + adminFee;

                  return (
                    <tr key={tx.id} className="hover:bg-void-light/5 transition duration-150">
                      
                      {/* 1. Date / Ref */}
                      <td className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar size={12} className="text-cobalt" />
                          <p className="font-bold text-xs text-crisp-white">{new Date(tx.date).toLocaleDateString()}</p>
                        </div>
                        <p className="text-[10px] text-slate-light font-mono uppercase">TXN-{tx.id.slice(-8)}</p>
                      </td>

                      {/* 2. Asset Tag */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Car size={14} className="text-cobalt/70" />
                          <span className="text-[10px] font-bold text-crisp-white tracking-widest uppercase bg-cobalt/20 border border-cobalt/30 px-2 py-1 rounded">
                            {tx.vehicle?.registrationNumber || "N/A"}
                          </span>
                        </div>
                      </td>

                      {/* 3. Description */}
                      <td className="p-4">
                        <p className="text-xs font-bold text-crisp-white uppercase tracking-wider">{tx.description || "Weekly Remittance"}</p>
                        <p className="text-[10px] text-slate-light mt-1">Direct Bank Transfer</p>
                      </td>

                      {/* 4. Gross Collection */}
                      <td className="p-4">
                        <p className="text-xs font-medium text-slate-light">₦{grossAmount.toLocaleString()}</p>
                      </td>

                      {/* 5. Admin Deductions */}
                      <td className="p-4">
                        {adminFee > 0 ? (
                          <p className="text-xs font-medium text-signal-red">- ₦{adminFee.toLocaleString()}</p>
                        ) : (
                          <p className="text-[10px] text-slate-light uppercase tracking-widest">N/A</p>
                        )}
                      </td>

                      {/* 6. NEW: Receipt Column */}
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

                      {/* 7. Net Payout */}
                      <td className="p-4 text-right">
                        <span className="inline-flex items-center gap-1.5 bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-3 py-1.5 rounded-md">
                          <ArrowDownRight size={14} />
                          <span className="font-black text-sm tracking-wider">₦{netAmount.toLocaleString()}</span>
                        </span>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
