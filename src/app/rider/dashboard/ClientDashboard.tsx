"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Copy, Wallet, CarFront, CheckCircle2, Clock, ShieldAlert, CreditCard, Activity, CalendarDays, AlertTriangle, FileText } from "lucide-react";

export default function ClientDashboard({ rider, guarantors, vehicle, contract, baseUrl, payments = [] }: any) {
  const router = useRouter();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGenerateAccount = async () => {
    setIsGenerating(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/rider/generate-account", { method: "POST" });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- MOCK REMITTANCE LOGIC (To be replaced by your actual database ledger calculation) ---
  const weeklyDue = contract?.weeklyRemittance || 0;
  
  // Generating a sample history to match your exact request
  // When you connect the backend, replace this array with the real payment data
  const remittanceHistory = [
    { week: 1, date: "May 01, 2026", expected: weeklyDue, paid: weeklyDue, status: "CLEARED", overdue: 0 },
    { week: 2, date: "May 08, 2026", expected: weeklyDue, paid: weeklyDue * 0.8, status: "PARTIAL", overdue: weeklyDue * 0.2 },
    { week: 3, date: "May 15, 2026", expected: weeklyDue, paid: 0, status: "OVERDUE", overdue: weeklyDue },
    { week: 4, date: "May 22, 2026", expected: weeklyDue, paid: 0, status: "PENDING", overdue: 0 }, // Future week
  ];

  const totalArrears = remittanceHistory.reduce((acc, curr) => acc + curr.overdue, 0);
  const totalPaid = remittanceHistory.reduce((acc, curr) => acc + curr.paid, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans text-gray-900">
      
      {/* CRISP CORPORATE HEADER */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-sm text-gray-500 font-medium mt-1 flex items-center gap-2">
              Welcome back, {rider.firstName} {rider.lastName}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              ACTIVE
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-8 rounded shadow-sm flex items-center gap-3 text-red-800 text-sm font-bold">
            <ShieldAlert size={18} /> {errorMsg}
          </div>
        )}

        {/* QUICK STATS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2"><Activity size={14} /> Total Remitted</p>
            <p className="text-3xl font-black text-gray-900">₦{totalPaid.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
            <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2 flex items-center gap-2"><AlertTriangle size={14} /> Current Arrears (Debt)</p>
            <p className="text-3xl font-black text-red-600">₦{totalArrears.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2"><CalendarDays size={14} /> Next Payment Target</p>
            <p className="text-3xl font-black text-gray-900">₦{weeklyDue.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: PAYMENTS & HISTORY */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* DEDICATED VIRTUAL ACCOUNT CARD */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full -mr-20 -mt-20 opacity-50 pointer-events-none"></div>
              
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-6 flex items-center gap-2">
                <Wallet size={18} className="text-blue-600" /> Dedicated Remittance Account
              </h2>

              {rider.virtualAccountNo ? (
                <div className="bg-gray-900 text-white rounded-xl p-6 sm:p-8 shadow-lg relative">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Bank</p>
                      <p className="font-semibold text-lg">{rider.virtualBankName}</p>
                    </div>
                    <CreditCard size={32} className="text-gray-600" />
                  </div>

                  <div>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Account Number</p>
                    <div className="flex items-center gap-4">
                      <p className="text-3xl sm:text-4xl font-black tracking-widest text-white">{rider.virtualAccountNo}</p>
                      <button 
                        onClick={() => handleCopy(rider.virtualAccountNo)}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-md transition"
                      >
                        {copied ? <CheckCircle2 size={18} className="text-emerald-400" /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-gray-700/50 flex justify-between items-center">
                    <div>
                      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Account Name</p>
                      <p className="text-sm font-medium tracking-wide">{rider.virtualAccountName}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <Wallet size={40} className="text-gray-300 mx-auto mb-4" />
                  <h3 className="text-gray-900 font-bold mb-2">No Payment Account</h3>
                  <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">Generate your dedicated static account to make your weekly vehicle remittances securely.</p>
                  <button 
                    onClick={handleGenerateAccount}
                    disabled={isGenerating}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-black transition shadow disabled:opacity-50 mx-auto"
                  >
                    {isGenerating ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : "Generate Account Now"}
                  </button>
                </div>
              )}
            </div>

            {/* REMITTANCE HISTORY TIMELINE */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                  <Clock size={18} className="text-blue-600" /> Weekly Remittance Ledger
                </h2>
                <span className="text-xs text-gray-500 font-medium">Auto-updates upon transfer</span>
              </div>

              <div className="space-y-6">
                {remittanceHistory.map((entry, idx) => (
                  <div key={idx} className="flex gap-4 sm:gap-6 relative">
                    {/* Timeline Line */}
                    {idx !== remittanceHistory.length - 1 && (
                      <div className="absolute left-6 sm:left-8 top-12 bottom-[-24px] w-px bg-gray-200"></div>
                    )}
                    
                    {/* Week Indicator Block */}
                    <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 bg-gray-50 border border-gray-200 rounded-xl flex flex-col items-center justify-center z-10">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">Week</span>
                      <span className="text-lg sm:text-xl font-black text-gray-900">{entry.week}</span>
                    </div>

                    {/* Content Block */}
                    <div className={`flex-1 border rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all
                      ${entry.status === 'CLEARED' ? 'border-emerald-200 bg-emerald-50/30' : 
                        entry.status === 'PARTIAL' ? 'border-orange-200 bg-orange-50/30' : 
                        entry.status === 'OVERDUE' ? 'border-red-200 bg-red-50/30' : 'border-gray-100 bg-gray-50/50'}`}
                    >
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">{entry.date}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-gray-900">₦{entry.paid.toLocaleString()}</span>
                          <span className="text-xs text-gray-500">/ ₦{entry.expected.toLocaleString()} expected</span>
                        </div>
                        
                        {/* Status specific text */}
                        {entry.status === 'PARTIAL' && (
                          <p className="text-xs font-bold text-orange-600 mt-2 bg-orange-100 inline-block px-2 py-1 rounded">
                            Week Marked Paid — ₦{entry.overdue.toLocaleString()} Accrued as Debt
                          </p>
                        )}
                        {entry.status === 'OVERDUE' && (
                          <p className="text-xs font-bold text-red-600 mt-2 bg-red-100 inline-block px-2 py-1 rounded flex items-center gap-1">
                            <AlertTriangle size={12} /> Completely Overdue — ₦{entry.overdue.toLocaleString()} Debt
                          </p>
                        )}
                      </div>

                      {/* Status Badges */}
                      <div>
                        {entry.status === 'CLEARED' && <span className="flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md"><CheckCircle2 size={14} /> Cleared</span>}
                        {entry.status === 'PARTIAL' && <span className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-md">Partial Payment</span>}
                        {entry.status === 'OVERDUE' && <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md"><XCircle size={14} /> Defaulted</span>}
                        {entry.status === 'PENDING' && <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-bold rounded-md">Pending</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: CONTRACT & VEHICLE */}
          <div className="space-y-8">
            
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">
                <FileText size={16} className="text-blue-600" /> Contract Details
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-xs text-gray-500 font-medium">Target Price</span>
                  <span className="text-sm font-bold text-gray-900">₦{contract?.totalPrice?.toLocaleString() || "---"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-xs text-gray-500 font-medium">Duration</span>
                  <span className="text-sm font-bold text-gray-900">{contract?.agreedDurationMonths * 4 || "---"} Weeks</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-gray-500 font-medium">Agreement</span>
                  {rider.hpaAgreementUrl ? (
                    <a href={rider.hpaAgreementUrl} target="_blank" className="text-xs font-bold text-blue-600 hover:underline">View PDF</a>
                  ) : (
                    <span className="text-xs text-gray-400">Processing</span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">
                <CarFront size={16} className="text-blue-600" /> Fleet Assignment
              </h3>
              
              {!vehicle ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <CarFront size={24} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-xs font-medium text-gray-500">Vehicle assignment pending.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Make & Model</p>
                    <p className="text-sm font-bold text-gray-900">{vehicle.makeModel}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">License Plate</p>
                    <p className="text-sm font-bold text-gray-900 bg-gray-100 inline-block px-2 py-1 rounded border border-gray-200">{vehicle.registrationNumber}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Chassis</p>
                    <p className="text-xs font-mono text-gray-600">{vehicle.chassisNumber}</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
