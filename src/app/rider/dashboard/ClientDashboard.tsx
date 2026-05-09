"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Copy, Wallet, CarFront, Users, CheckCircle2, Clock, ShieldAlert, CreditCard } from "lucide-react";

export default function ClientDashboard({ rider, guarantors, vehicle, contract, baseUrl }: any) {
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Premium Header */}
      <div className="bg-[#001232] px-6 py-10 sm:px-12 lg:px-20 text-white border-b-4 border-[#FFB902] shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-1">Rider Command Center</p>
            <h1 className="text-3xl font-black tracking-tight">Welcome back, {rider.firstName}</h1>
            <p className="text-sm text-gray-300 mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Account Status: <strong className="text-emerald-400">ACTIVE</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        
        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded shadow-sm flex items-center gap-3 text-red-800 text-sm font-bold">
            <ShieldAlert size={18} /> {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: FINANCIALS & REMITTANCE */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Dedicated Account Fintech Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
                <div className="p-3 bg-[#001232]/5 rounded-xl">
                  <Wallet size={24} className="text-[#001232]" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#001232] uppercase tracking-wide">Weekly Remittance Account</h2>
                  <p className="text-xs text-gray-500 font-medium">Your dedicated static account for vehicle payments</p>
                </div>
              </div>

              {rider.virtualAccountNo ? (
                <div className="bg-gradient-to-br from-[#001232] to-gray-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <Wallet size={120} />
                  </div>
                  
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Bank Name</p>
                  <p className="text-lg font-bold text-[#FFB902] mb-6">{rider.virtualBankName}</p>

                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Account Number</p>
                  <div className="flex items-center gap-4 mb-6">
                    <p className="text-4xl font-black tracking-widest">{rider.virtualAccountNo}</p>
                    <button 
                      onClick={() => handleCopy(rider.virtualAccountNo)}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
                      title="Copy Account Number"
                    >
                      {copied ? <CheckCircle2 size={20} className="text-emerald-400" /> : <Copy size={20} />}
                    </button>
                  </div>

                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Account Name</p>
                  <p className="text-sm font-bold uppercase tracking-wider">{rider.virtualAccountName}</p>
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <CreditCard size={48} className="text-gray-300 mx-auto mb-4" />
                  <h3 className="text-gray-900 font-bold mb-2">No Payment Account Assigned</h3>
                  <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">Generate your dedicated Paystack virtual account to start making your weekly vehicle remittances securely.</p>
                  <button 
                    onClick={handleGenerateAccount}
                    disabled={isGenerating}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-[#001232] text-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-gray-800 transition shadow-lg disabled:opacity-50 mx-auto"
                  >
                    {isGenerating ? <><Loader2 size={16} className="animate-spin" /> Generating Secure Account...</> : "Generate Virtual Account"}
                  </button>
                </div>
              )}

              {rider.virtualAccountNo && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 font-medium leading-relaxed">
                  <strong className="text-blue-900 block mb-1">Payment Instructions:</strong>
                  Transfer your weekly remittance directly into the account details above using any bank app or USSD. Payments reflect instantly and your dashboard will be updated automatically. Cash payments are not allowed.
                </div>
              )}
            </div>

            {/* Contract Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <h3 className="font-bold text-[#001232] uppercase tracking-wide border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                <Clock size={18} className="text-gray-400" /> Contract Status
              </h3>
              
              {!contract ? (
                <p className="text-sm text-gray-500 italic py-4">Financial contract details are currently being finalized by the Administrator.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Weekly Due</p>
                    <p className="text-lg font-black text-[#001232]">₦{contract.weeklyRemittance?.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Total Target</p>
                    <p className="text-lg font-black text-[#001232]">₦{contract.totalPrice?.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Tenure</p>
                    <p className="text-lg font-black text-[#001232]">{contract.agreedDurationMonths * 4} <span className="text-xs font-medium">Weeks</span></p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Pay Day</p>
                    <p className="text-sm font-bold text-red-600 uppercase mt-1">{contract.paymentDay || "Friday"}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: FLEET & GUARANTORS */}
          <div className="space-y-6">
            
            {/* Assigned Vehicle */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <h3 className="font-bold text-[#001232] uppercase tracking-wide border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                <CarFront size={18} className="text-gray-400" /> Fleet Assignment
              </h3>
              
              {!vehicle ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CarFront size={20} className="text-gray-400" />
                  </div>
                  <p className="text-sm font-bold text-gray-900">Awaiting Assignment</p>
                  <p className="text-xs text-gray-500 mt-1">Your vehicle is being prepped for handover.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Model</p>
                    <p className="text-sm font-bold text-[#001232]">{vehicle.makeModel}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Plate Number</p>
                    <p className="text-sm font-bold text-[#001232] bg-gray-100 inline-block px-2 py-1 rounded">{vehicle.registrationNumber}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Chassis No.</p>
                    <p className="text-xs font-mono text-gray-700">{vehicle.chassisNumber}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Guarantors Status */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <h3 className="font-bold text-[#001232] uppercase tracking-wide border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                <Users size={18} className="text-gray-400" /> Security Sureties
              </h3>
              
              <div className="space-y-4">
                {guarantors.map((g: any, index: number) => (
                  <div key={g.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-xs font-bold text-[#001232]">{g.firstName} {g.lastName}</p>
                      <p className="text-[10px] text-gray-500 capitalize">{g.relationship}</p>
                    </div>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase tracking-widest rounded">Verified</span>
                  </div>
                ))}

                {guarantors.length === 0 && (
                  <p className="text-xs text-gray-500 italic">No guarantors found.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
