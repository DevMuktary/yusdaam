"use client";

import { useState, useMemo } from "react";
import { 
  UploadCloud, 
  Loader2, 
  CheckCircle2, 
  X, 
  ChevronDown, 
  Car, 
  User, 
  Briefcase, 
  Building2, 
  Calendar, 
  ArrowDownLeft, 
  ArrowUpRight,
  Receipt,
  FileText,
  Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function PaymentsClient({ assignments, cycles }: { assignments: any[], cycles: any[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [transactionType, setTransactionType] = useState<"PAYMENT_COLLECTED" | "OWNER_REMITTANCE">("PAYMENT_COLLECTED");
  
  const [selectedCycleId, setSelectedCycleId] = useState(""); 
  
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [receiptBase64, setReceiptBase64] = useState<string | null>(null);

  const selectedAssignment = useMemo(() => {
    return assignments.find(a => a.id === selectedVehicleId);
  }, [assignments, selectedVehicleId]);

  // Lists pending cycles for the OWNER (Strictly isolated)
  const pendingOwnerCycles = useMemo(() => {
    if (!selectedVehicleId) return [];
    return cycles
      .filter(c => 
        c.contract?.vehicleId === selectedVehicleId && 
        !c.isOwnerSettled &&
        (c.ownerExpectedAmount || 0) > 0
      )
      .sort((a, b) => a.weekNumber - b.weekNumber);
  }, [cycles, selectedVehicleId]);

  // Lists pending/unpaid cycles for the RIDER (Strictly isolated)
  const pendingRiderCycles = useMemo(() => {
    if (!selectedVehicleId) return [];
    return cycles
      .filter(c => 
        c.contract?.vehicleId === selectedVehicleId && 
        !c.isSettled &&
        (c.expectedAmount || 0) > 0
      )
      .sort((a, b) => a.weekNumber - b.weekNumber);
  }, [cycles, selectedVehicleId]);

  // Determine active cycles list based on selected transaction mode
  const activeCyclesList = transactionType === "PAYMENT_COLLECTED" ? pendingRiderCycles : pendingOwnerCycles;

  // Find currently selected cycle object
  const currentSelectedCycle = useMemo(() => {
    return activeCyclesList.find(c => c.id === selectedCycleId);
  }, [activeCyclesList, selectedCycleId]);

  const handleTypeChange = (type: "PAYMENT_COLLECTED" | "OWNER_REMITTANCE") => {
    setTransactionType(type);
    setSelectedCycleId("");
    setDescription("");
    setAmount("");
  };

  const handleVehicleChange = (val: string) => {
    setSelectedVehicleId(val);
    setSelectedCycleId("");
    setAmount("");
    setDescription("");
  };

  const handleCycleChange = (cycleId: string) => {
    setSelectedCycleId(cycleId);
    
    if (transactionType === "PAYMENT_COLLECTED") {
      const cycle = pendingRiderCycles.find(c => c.id === cycleId);
      if (cycle) {
        setAmount(cycle.shortfallAmount.toString());
        setDescription(`Week ${cycle.weekNumber} Remittance Payment`);
      }
    } else {
      const cycle = pendingOwnerCycles.find(c => c.id === cycleId);
      if (cycle) {
        const pendingAmount = Math.max(0, cycle.ownerExpectedAmount - cycle.ownerRemittedAmount);
        setAmount(pendingAmount.toString());
        setDescription(`Week ${cycle.weekNumber} Owner Payout`);
      }
    }
  };

  const handleSetFullAmount = () => {
    if (!currentSelectedCycle) return;
    if (transactionType === "PAYMENT_COLLECTED") {
      setAmount(currentSelectedCycle.shortfallAmount.toString());
    } else {
      const pendingAmount = Math.max(0, currentSelectedCycle.ownerExpectedAmount - currentSelectedCycle.ownerRemittedAmount);
      setAmount(pendingAmount.toString());
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert("File must be less than 2MB");
      const reader = new FileReader();
      reader.onloadend = () => setReceiptBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId || !amount || !description || !selectedCycleId) {
      return alert("Please select deployment, billing week, and enter valid amount.");
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: selectedVehicleId,
          type: transactionType,
          amount: Number(amount),
          description,
          receiptBase64,
          cycleId: selectedCycleId 
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      alert("Transaction saved and E-Receipt Dispatched!");
      router.refresh();
      setSelectedVehicleId(""); 
      setAmount(""); 
      setDescription(""); 
      setSelectedCycleId(""); 
      setReceiptBase64(null);
    } catch (err: any) {
      alert(err.message || "Failed to process payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (assignments.length === 0) {
    return (
      <div className="p-12 text-center bg-[#0d1527] border border-white/10 rounded-2xl text-gray-400">
        <Car className="mx-auto text-gray-500 mb-3" size={40} />
        <h3 className="text-lg font-bold text-white mb-1">No Active Deployments</h3>
        <p className="text-sm">Assign a vehicle to a rider or owner before logging transactions.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      
      {/* SECTION 1: DEPLOYMENT SELECTION */}
      <div className="bg-[#0f172a] p-6 rounded-2xl border border-white/15 shadow-xl space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-black text-slate-light uppercase tracking-wider flex items-center gap-2">
              <Car size={16} className="text-cobalt" /> 1. Select Active Deployment
            </label>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-cobalt/20 text-slate-light border border-cobalt/30">
              {assignments.length} Active Fleet{assignments.length > 1 ? "s" : ""}
            </span>
          </div>

          {/* HIGH CONTRAST DROPDOWN CONTAINER */}
          <div className="relative">
            <select 
              value={selectedVehicleId}
              onChange={(e) => handleVehicleChange(e.target.value)}
              className="w-full bg-[#131d35] hover:bg-[#162340] border-2 border-white/20 focus:border-cobalt rounded-xl px-4 py-3.5 pr-11 text-white font-medium text-sm transition-all outline-none appearance-none cursor-pointer shadow-inner"
              required
            >
              <option value="" className="bg-[#0f172a] text-gray-400 font-medium">
                -- Choose Vehicle Deployment (Plate / Rider / Owner) --
              </option>
              {assignments.map(a => (
                <option key={a.id} value={a.id} className="bg-[#0f172a] text-white py-2">
                  {a.registrationNumber} • {a.makeModel || a.type} | Rider: {a.rider?.firstName || 'None'} {a.rider?.lastName || ''} | Owner: {a.owner?.firstName || 'None'} {a.owner?.lastName || ''}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
              <ChevronDown size={18} />
            </div>
          </div>
        </div>

        {/* SELECTED DEPLOYMENT VERIFICATION BANNER */}
        {selectedAssignment && (
          <div className="bg-[#14203b] border border-cobalt/40 rounded-xl p-4.5 space-y-4 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-cobalt text-white font-mono font-bold rounded-lg text-sm tracking-wide">
                  {selectedAssignment.registrationNumber}
                </span>
                <span className="text-xs font-semibold text-slate-light">
                  {selectedAssignment.makeModel || selectedAssignment.type}
                </span>
              </div>
              <div className="text-[11px] text-gray-400 font-mono">
                Contract Target: ₦{selectedAssignment.contract?.riderWeeklyRemittance?.toLocaleString() || 0} / wk
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Rider Summary */}
              <div className="bg-[#0f172a]/80 p-3 rounded-lg border border-emerald-500/20 flex items-start gap-3">
                <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-400 shrink-0">
                  <User size={16} />
                </div>
                <div>
                  <p className="font-bold text-white uppercase tracking-wider text-[10px] text-emerald-400">Assigned Rider</p>
                  <p className="font-semibold text-white text-sm">
                    {selectedAssignment.rider?.firstName} {selectedAssignment.rider?.lastName || ""}
                  </p>
                  <p className="text-gray-400 text-[11px] mt-0.5">
                    {selectedAssignment.rider?.phoneNumber || selectedAssignment.rider?.email || "No direct phone"}
                  </p>
                </div>
              </div>

              {/* Owner & Bank Summary */}
              <div className="bg-[#0f172a]/80 p-3 rounded-lg border border-purple-500/20 flex items-start gap-3">
                <div className="p-2 rounded-md bg-purple-500/10 text-purple-400 shrink-0">
                  <Briefcase size={16} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-white uppercase tracking-wider text-[10px] text-purple-400">Asset Owner & Bank</p>
                  <p className="font-semibold text-white text-sm truncate">
                    {selectedAssignment.owner?.firstName} {selectedAssignment.owner?.lastName || ""}
                  </p>
                  <p className="text-gray-300 text-[11px] mt-0.5 truncate flex items-center gap-1">
                    <Building2 size={12} className="text-purple-400 shrink-0" />
                    <span>{selectedAssignment.owner?.bankName || "No Bank"} - <strong className="font-mono text-white">{selectedAssignment.owner?.accountNumber || "N/A"}</strong></span>
                  </p>
                </div>
              </div>
            </div>

            {/* TRANSACTION TYPE SELECTOR */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                type="button"
                onClick={() => handleTypeChange("PAYMENT_COLLECTED")}
                className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                  transactionType === "PAYMENT_COLLECTED" 
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30' 
                    : 'bg-[#0f172a] border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 font-bold text-sm text-white mb-0.5">
                    <ArrowDownLeft size={16} className="text-emerald-400" /> Log Rider Payment
                  </div>
                  <p className="text-[11px] text-gray-400">Collect money from {selectedAssignment.rider?.firstName || "Rider"}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${transactionType === "PAYMENT_COLLECTED" ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-gray-400'}`}>
                  {pendingRiderCycles.length} wks
                </span>
              </button>

              <button 
                type="button"
                onClick={() => handleTypeChange("OWNER_REMITTANCE")}
                className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                  transactionType === "OWNER_REMITTANCE" 
                    ? 'bg-purple-500/15 border-purple-500 text-purple-300 ring-2 ring-purple-500/30' 
                    : 'bg-[#0f172a] border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 font-bold text-sm text-white mb-0.5">
                    <ArrowUpRight size={16} className="text-purple-400" /> Log Owner Payout
                  </div>
                  <p className="text-[11px] text-gray-400">Remit payout to {selectedAssignment.owner?.firstName || "Owner"}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${transactionType === "OWNER_REMITTANCE" ? 'bg-purple-500/20 text-purple-300' : 'bg-white/5 text-gray-400'}`}>
                  {pendingOwnerCycles.length} wks
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: TRANSACTION DETAILS */}
      <div className={`transition-all duration-300 ${selectedAssignment ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
        <div className="bg-[#0f172a] p-6 rounded-2xl border border-white/15 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
              <Receipt size={16} className="text-cobalt" /> 2. Transaction Parameters
            </h3>
            <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
              transactionType === "PAYMENT_COLLECTED" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-purple-500/15 text-purple-400 border border-purple-500/30"
            }`}>
              {transactionType === "PAYMENT_COLLECTED" ? "Inflow • Rider Collection" : "Outflow • Owner Remittance"}
            </span>
          </div>
          
          <div className="space-y-6">
            
            {/* TARGET WEEK DROPDOWN WITH HIGH CONTRAST */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400" /> Select Target Billing Week *
                </label>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  transactionType === "PAYMENT_COLLECTED" 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                    : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                }`}>
                  {activeCyclesList.length} Unsettled Week{activeCyclesList.length !== 1 ? "s" : ""}
                </span>
              </div>
              
              {activeCyclesList.length === 0 ? (
                <div className={`w-full border-2 rounded-xl px-4 py-4 text-sm flex items-center gap-3 font-medium
                  ${transactionType === "PAYMENT_COLLECTED" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-purple-500/10 border-purple-500/30 text-purple-300"}`}>
                  <CheckCircle2 size={20} className="shrink-0" />
                  <div>
                    <p className="font-bold">All current weeks are fully settled!</p>
                    <p className="text-xs opacity-80">There are no pending weekly cycles waiting for this transaction type.</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <select 
                    value={selectedCycleId}
                    onChange={(e) => handleCycleChange(e.target.value)}
                    className="w-full bg-[#131d35] hover:bg-[#162340] border-2 border-white/20 focus:border-cobalt rounded-xl px-4 py-3.5 pr-11 text-white font-medium text-sm transition-all outline-none appearance-none cursor-pointer shadow-inner"
                    required
                  >
                    <option value="" className="bg-[#0f172a] text-gray-400 font-medium">
                      -- Choose a Pending Week to Settle --
                    </option>
                    {activeCyclesList.map(c => {
                      if (transactionType === "PAYMENT_COLLECTED") {
                        return (
                          <option key={c.id} value={c.id} className="bg-[#0f172a] text-white py-2 font-medium">
                            Week {c.weekNumber} — Balance Left: ₦{c.shortfallAmount.toLocaleString()} (Target: ₦{c.expectedAmount.toLocaleString()} | Paid so far: ₦{c.amountPaid.toLocaleString()})
                          </option>
                        );
                      } else {
                        const pending = Math.max(0, c.ownerExpectedAmount - c.ownerRemittedAmount);
                        return (
                          <option key={c.id} value={c.id} className="bg-[#0f172a] text-white py-2 font-medium">
                            Week {c.weekNumber} — Remittance Payout Owed: ₦{pending.toLocaleString()} (Expected: ₦{c.ownerExpectedAmount.toLocaleString()})
                          </option>
                        );
                      }
                    })}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                    <ChevronDown size={18} />
                  </div>
                </div>
              )}
            </div>

            {/* LIVE BREAKDOWN CARD FOR SELECTED WEEK */}
            {currentSelectedCycle && (
              <div className="bg-[#131d35] border border-white/15 rounded-xl p-4 space-y-3 animate-in slide-in-from-top-1 duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-white/10 text-white font-bold text-xs rounded-md uppercase tracking-wider">
                      Week {currentSelectedCycle.weekNumber} Overview
                    </span>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleSetFullAmount} 
                    className="text-[11px] font-bold text-cobalt bg-cobalt/10 hover:bg-cobalt/20 px-2.5 py-1 rounded-md transition flex items-center gap-1"
                  >
                    <Sparkles size={12} /> Fill Full Balance
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-[#0f172a] p-2.5 rounded-lg border border-white/5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Target</span>
                    <span className="font-mono text-sm font-bold text-white">
                      ₦{(transactionType === "PAYMENT_COLLECTED" ? currentSelectedCycle.expectedAmount : currentSelectedCycle.ownerExpectedAmount).toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-[#0f172a] p-2.5 rounded-lg border border-white/5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Paid So Far</span>
                    <span className="font-mono text-sm font-bold text-slate-light">
                      ₦{(transactionType === "PAYMENT_COLLECTED" ? currentSelectedCycle.amountPaid : currentSelectedCycle.ownerRemittedAmount).toLocaleString()}
                    </span>
                  </div>
                  <div className={`p-2.5 rounded-lg border ${transactionType === "PAYMENT_COLLECTED" ? "bg-emerald-500/10 border-emerald-500/30" : "bg-purple-500/10 border-purple-500/30"}`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest block mb-0.5 opacity-80">Remaining</span>
                    <span className="font-mono text-sm font-bold">
                      ₦{(transactionType === "PAYMENT_COLLECTED" 
                        ? currentSelectedCycle.shortfallAmount 
                        : Math.max(0, currentSelectedCycle.ownerExpectedAmount - currentSelectedCycle.ownerRemittedAmount)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* AMOUNT AND NOTES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-widest mb-2">
                  Amount (₦) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-gray-400 text-lg">₦</span>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full bg-[#131d35] hover:bg-[#162340] border-2 border-white/20 focus:border-cobalt rounded-xl pl-10 pr-4 py-3 text-white font-mono text-lg font-bold outline-none transition-all shadow-inner"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-widest mb-2">
                  Description / Receipt Memo *
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Week 1 Remittance Payment"
                    className="w-full bg-[#131d35] hover:bg-[#162340] border-2 border-white/20 focus:border-cobalt rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none transition-all shadow-inner"
                    required
                  />
                </div>
              </div>
            </div>

            {/* RECEIPT UPLOAD */}
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-widest mb-2">
                Proof of Payment / Bank Receipt (Optional)
              </label>
              {!receiptBase64 ? (
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-white/20 hover:border-cobalt rounded-xl bg-[#131d35]/50 hover:bg-[#131d35] transition cursor-pointer">
                  <UploadCloud className="text-gray-400 mb-1.5" size={24} />
                  <span className="text-xs font-semibold text-slate-light">Click to upload bank transfer slip (JPG / PNG)</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">Max size: 2MB</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              ) : (
                <div className="relative w-full h-44 rounded-xl border border-emerald-500/40 overflow-hidden bg-[#131d35] flex items-center justify-center">
                  <img src={receiptBase64} alt="Receipt" className="max-h-full object-contain" />
                  <button 
                    type="button" 
                    onClick={() => setReceiptBase64(null)} 
                    className="absolute top-2.5 right-2.5 bg-red-500/90 hover:bg-red-600 p-1.5 rounded-lg text-white transition shadow-lg"
                  >
                    <X size={16}/>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="mt-6 flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting || !selectedCycleId || !amount}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white uppercase tracking-wider text-sm transition shadow-xl disabled:opacity-40 disabled:cursor-not-allowed ${
              transactionType === 'PAYMENT_COLLECTED' 
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30' 
                : 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/30'
            }`}
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
            Process & Dispatch E-Receipt
          </button>
        </div>
      </div>
    </form>
  );
}
