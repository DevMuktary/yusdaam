"use client";

import { useState, useMemo, useRef, useEffect } from "react";
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
  Search, 
  Check, 
  RotateCcw 
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

  // Dropdown States
  const [isVehicleOpen, setIsVehicleOpen] = useState(false);
  const [isCycleOpen, setIsCycleOpen] = useState(false);
  const [vehicleSearch, setVehicleSearch] = useState("");

  const vehicleDropdownRef = useRef<HTMLDivElement>(null);
  const cycleDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (vehicleDropdownRef.current && !vehicleDropdownRef.current.contains(e.target as Node)) {
        setIsVehicleOpen(false);
      }
      if (cycleDropdownRef.current && !cycleDropdownRef.current.contains(e.target as Node)) {
        setIsCycleOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedAssignment = useMemo(() => {
    return assignments.find(a => a.id === selectedVehicleId);
  }, [assignments, selectedVehicleId]);

  // Filtered vehicles for search
  const filteredAssignments = useMemo(() => {
    if (!vehicleSearch.trim()) return assignments;
    const q = vehicleSearch.toLowerCase();
    return assignments.filter(a => 
      a.registrationNumber?.toLowerCase().includes(q) ||
      a.makeModel?.toLowerCase().includes(q) ||
      a.rider?.firstName?.toLowerCase().includes(q) ||
      a.rider?.lastName?.toLowerCase().includes(q) ||
      a.owner?.firstName?.toLowerCase().includes(q) ||
      a.owner?.lastName?.toLowerCase().includes(q)
    );
  }, [assignments, vehicleSearch]);

  // Lists pending cycles for the OWNER (Strictly isolated)
  const pendingOwnerCycles = useMemo(() => {
    if (!selectedVehicleId) return [];
    return cycles
      .filter(c => 
        (c.contract?.vehicleId === selectedVehicleId || c.contractId === selectedAssignment?.contract?.id) && 
        !c.isOwnerSettled &&
        (c.ownerExpectedAmount || 0) > 0
      )
      .sort((a, b) => a.weekNumber - b.weekNumber);
  }, [cycles, selectedVehicleId, selectedAssignment]);

  // Lists pending/unpaid cycles for the RIDER (Strictly isolated)
  const pendingRiderCycles = useMemo(() => {
    if (!selectedVehicleId) return [];
    return cycles
      .filter(c => 
        (c.contract?.vehicleId === selectedVehicleId || c.contractId === selectedAssignment?.contract?.id) && 
        !c.isSettled &&
        (c.expectedAmount || 0) > 0
      )
      .sort((a, b) => a.weekNumber - b.weekNumber);
  }, [cycles, selectedVehicleId, selectedAssignment]);

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
    setIsCycleOpen(false);
  };

  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setSelectedCycleId("");
    setAmount("");
    setDescription("");
    setIsVehicleOpen(false);
    setVehicleSearch("");
  };

  const handleCycleSelect = (cycle: any) => {
    setSelectedCycleId(cycle.id);
    setIsCycleOpen(false);
    
    if (transactionType === "PAYMENT_COLLECTED") {
      setAmount(cycle.shortfallAmount.toString());
      setDescription(`Week ${cycle.weekNumber} Remittance Payment`);
    } else {
      const pendingAmount = Math.max(0, cycle.ownerExpectedAmount - cycle.ownerRemittedAmount);
      setAmount(pendingAmount.toString());
      setDescription(`Week ${cycle.weekNumber} Owner Payout`);
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
      return alert("Please select a vehicle, a billing week, and enter a valid amount.");
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

      alert("Payment saved successfully!");
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
      <div className="p-8 text-center bg-[#0e1626] border border-white/10 rounded-xl text-gray-400">
        <Car className="mx-auto text-gray-500 mb-2" size={32} />
        <p className="text-sm font-medium text-white">No Active Deployments</p>
        <p className="text-xs text-gray-400 mt-1">Assign a vehicle to a rider or owner before logging payments.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4 max-w-2xl mx-auto">
      
      {/* 1. SELECT VEHICLE */}
      <div className="bg-[#0e1626] p-4 sm:p-5 rounded-xl border border-white/10 space-y-3.5">
        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
          1. Select Deployment
        </label>

        {/* CUSTOM MINIMAL POPUP DROPDOWN (VEHICLE) */}
        <div className="relative" ref={vehicleDropdownRef}>
          <button
            type="button"
            onClick={() => { setIsVehicleOpen(!isVehicleOpen); setIsCycleOpen(false); }}
            className={`w-full bg-[#141f33] hover:bg-[#18263e] border rounded-lg px-3.5 py-3 flex items-center justify-between text-left transition outline-none ${
              isVehicleOpen ? 'border-cobalt ring-1 ring-cobalt' : 'border-white/15'
            }`}
          >
            {selectedAssignment ? (
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-white bg-cobalt px-2 py-0.5 rounded">
                    {selectedAssignment.registrationNumber}
                  </span>
                  <span className="text-xs text-slate-200 font-medium truncate">
                    {selectedAssignment.makeModel || selectedAssignment.type}
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 mt-1 truncate">
                  Rider: <span className="text-emerald-300">{selectedAssignment.rider?.firstName || 'None'} {selectedAssignment.rider?.lastName || ''}</span> • Owner: <span className="text-purple-300">{selectedAssignment.owner?.firstName || 'None'} {selectedAssignment.owner?.lastName || ''}</span>
                </div>
              </div>
            ) : (
              <span className="text-sm text-gray-400">Choose vehicle deployment...</span>
            )}
            <ChevronDown size={18} className={`text-gray-400 shrink-0 transition-transform ${isVehicleOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* FLOATING OPTIONS LIST */}
          {isVehicleOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#0b1220] border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="p-2 border-b border-white/10 bg-[#141f33] flex items-center gap-2">
                <Search size={14} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={vehicleSearch}
                  onChange={(e) => setVehicleSearch(e.target.value)}
                  placeholder="Search plate, rider or owner..."
                  className="w-full bg-transparent text-base sm:text-xs text-white placeholder-gray-400 outline-none"
                  autoFocus
                />
                {vehicleSearch && (
                  <button type="button" onClick={() => setVehicleSearch("")} className="text-gray-400 hover:text-white">
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto p-1 space-y-1">
                {filteredAssignments.length === 0 ? (
                  <div className="py-4 text-center text-xs text-gray-400">No matching deployment</div>
                ) : (
                  filteredAssignments.map((a) => {
                    const isSelected = a.id === selectedVehicleId;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => handleVehicleSelect(a.id)}
                        className={`w-full p-2.5 rounded-lg flex items-center justify-between text-left transition ${
                          isSelected ? 'bg-cobalt/40 text-white' : 'hover:bg-[#141f33] text-gray-300'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs bg-white/10 text-white px-1.5 py-0.5 rounded">
                              {a.registrationNumber}
                            </span>
                            <span className="text-xs text-white font-medium truncate">{a.makeModel || a.type}</span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                            Rider: <strong className="text-emerald-300">{a.rider?.firstName || 'None'}</strong> • Owner: <strong className="text-purple-300">{a.owner?.firstName || 'None'}</strong>
                          </p>
                        </div>
                        {isSelected && <Check size={16} className="text-cobalt shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* SELECTED DEPLOYMENT DETAILS (COMPACT & CLEAN FOR MOBILE) */}
        {selectedAssignment && (
          <div className="bg-[#141f33] border border-white/10 rounded-lg p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-mono font-bold text-white text-xs">{selectedAssignment.registrationNumber}</span>
              <span className="text-gray-300 font-mono text-[11px]">
                Target: ₦{selectedAssignment.contract?.riderWeeklyRemittance?.toLocaleString() || 0}/wk
              </span>
            </div>
            
            <div className="space-y-1.5 text-xs text-gray-300">
              <div className="flex items-center gap-1.5 truncate">
                <User size={13} className="text-emerald-400 shrink-0" />
                <span className="truncate">
                  Rider: <strong className="text-white">{selectedAssignment.rider?.firstName || 'None'} {selectedAssignment.rider?.lastName || ''}</strong> {selectedAssignment.rider?.phoneNumber && `(${selectedAssignment.rider.phoneNumber})`}
                </span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <Building2 size={13} className="text-purple-400 shrink-0" />
                <span className="truncate">
                  Owner: <strong className="text-white">{selectedAssignment.owner?.firstName || 'None'} {selectedAssignment.owner?.lastName || ''}</strong> • {selectedAssignment.owner?.bankName || 'Bank'}: <strong className="font-mono text-white">{selectedAssignment.owner?.accountNumber || 'N/A'}</strong>
                </span>
              </div>
            </div>

            {/* SLEEK SEGMENTED MODE TOGGLE (100% RESPONSIVE) */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleTypeChange("PAYMENT_COLLECTED")}
                className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition text-center ${
                  transactionType === "PAYMENT_COLLECTED"
                    ? "bg-emerald-600 text-white shadow"
                    : "bg-[#0b1220] text-gray-300 hover:text-white border border-white/10"
                }`}
              >
                <span>Rider Pay</span>
                <span className="text-[10px] opacity-80 font-mono">({pendingRiderCycles.length} wks)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange("OWNER_REMITTANCE")}
                className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition text-center ${
                  transactionType === "OWNER_REMITTANCE"
                    ? "bg-purple-600 text-white shadow"
                    : "bg-[#0b1220] text-gray-300 hover:text-white border border-white/10"
                }`}
              >
                <span>Owner Payout</span>
                <span className="text-[10px] opacity-80 font-mono">({pendingOwnerCycles.length} wks)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. TRANSACTION PARAMETERS */}
      <div className={`space-y-4 ${selectedAssignment ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <div className="bg-[#0e1626] p-4 sm:p-5 rounded-xl border border-white/10 space-y-4">
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
            2. Select Week & Enter Amount
          </label>

          {/* TARGET WEEK DROPDOWN (COMPACT) */}
          <div className="relative" ref={cycleDropdownRef}>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
              <span>Target Billing Week *</span>
              <span className="text-[11px] text-gray-300">{activeCyclesList.length} pending</span>
            </div>

            {activeCyclesList.length === 0 ? (
              <div className="w-full bg-[#141f33] border border-white/10 rounded-lg p-3 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" /> All weeks are settled!
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => { setIsCycleOpen(!isCycleOpen); setIsVehicleOpen(false); }}
                  className={`w-full bg-[#141f33] hover:bg-[#18263e] border rounded-lg px-3.5 py-3 flex items-center justify-between text-left transition outline-none ${
                    isCycleOpen 
                      ? (transactionType === "PAYMENT_COLLECTED" ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-purple-500 ring-1 ring-purple-500') 
                      : 'border-white/15'
                  }`}
                >
                  {currentSelectedCycle ? (
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${
                        transactionType === "PAYMENT_COLLECTED" ? "bg-emerald-700" : "bg-purple-700"
                      }`}>
                        Week {currentSelectedCycle.weekNumber}
                      </span>
                      <span className="text-xs text-white font-mono font-medium">
                        ₦{(transactionType === "PAYMENT_COLLECTED" 
                          ? currentSelectedCycle.shortfallAmount 
                          : Math.max(0, currentSelectedCycle.ownerExpectedAmount - currentSelectedCycle.ownerRemittedAmount)
                        ).toLocaleString()} due
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Choose pending week...</span>
                  )}
                  <ChevronDown size={18} className={`text-gray-400 shrink-0 transition-transform ${isCycleOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* FLOATING WEEKS LIST */}
                {isCycleOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#0b1220] border border-white/20 rounded-xl shadow-2xl z-50 max-h-52 overflow-y-auto p-1 space-y-1">
                    {activeCyclesList.map((c) => {
                      const isSelected = c.id === selectedCycleId;
                      const remainingDue = transactionType === "PAYMENT_COLLECTED" 
                        ? c.shortfallAmount 
                        : Math.max(0, c.ownerExpectedAmount - c.ownerRemittedAmount);
                      const paid = transactionType === "PAYMENT_COLLECTED" ? c.amountPaid : c.ownerRemittedAmount;

                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleCycleSelect(c)}
                          className={`w-full p-2.5 rounded-lg flex items-center justify-between text-left transition ${
                            isSelected 
                              ? (transactionType === "PAYMENT_COLLECTED" ? 'bg-emerald-950/60 text-white border border-emerald-500/50' : 'bg-purple-950/60 text-white border border-purple-500/50')
                              : 'hover:bg-[#141f33] text-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-white bg-white/10 px-1.5 py-0.5 rounded">
                              W{c.weekNumber}
                            </span>
                            <span className="text-xs font-mono font-bold text-white">
                              ₦{remainingDue.toLocaleString()}
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-400 font-mono">
                            ₦{paid.toLocaleString()} paid
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* MINIMAL WEEK SUMMARY CARD (ZERO OVERLAP) */}
          {currentSelectedCycle && (
            <div className="bg-[#141f33] border border-white/10 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Week {currentSelectedCycle.weekNumber} Breakdown</span>
                <button
                  type="button"
                  onClick={handleSetFullAmount}
                  className="text-[11px] font-semibold text-cobalt hover:text-blue-400 flex items-center gap-1"
                >
                  <RotateCcw size={11} /> Auto-fill Full Balance
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-[#0b1220] p-2 rounded">
                  <span className="text-[10px] text-gray-400 block">Target</span>
                  <span className="font-mono font-bold text-white text-xs">
                    ₦{(transactionType === "PAYMENT_COLLECTED" ? currentSelectedCycle.expectedAmount : currentSelectedCycle.ownerExpectedAmount).toLocaleString()}
                  </span>
                </div>
                <div className="bg-[#0b1220] p-2 rounded">
                  <span className="text-[10px] text-gray-400 block">Paid</span>
                  <span className="font-mono font-medium text-gray-300 text-xs">
                    ₦{(transactionType === "PAYMENT_COLLECTED" ? currentSelectedCycle.amountPaid : currentSelectedCycle.ownerRemittedAmount).toLocaleString()}
                  </span>
                </div>
                <div className={`p-2 rounded ${transactionType === "PAYMENT_COLLECTED" ? "bg-emerald-950/50 text-emerald-300 border border-emerald-500/30" : "bg-purple-950/50 text-purple-300 border border-purple-500/30"}`}>
                  <span className="text-[10px] block opacity-80">Remaining</span>
                  <span className="font-mono font-bold text-xs">
                    ₦{(transactionType === "PAYMENT_COLLECTED" 
                      ? currentSelectedCycle.shortfallAmount 
                      : Math.max(0, currentSelectedCycle.ownerExpectedAmount - currentSelectedCycle.ownerRemittedAmount)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* INPUTS (USING text-base TO PREVENT iOS AUTO-ZOOM) */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Amount (₦) *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-gray-400 text-sm">₦</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-[#141f33] border border-white/15 focus:border-cobalt rounded-lg pl-8 pr-3 py-2.5 text-white font-mono text-base outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Description / Memo *</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Week 1 Payment"
                className="w-full bg-[#141f33] border border-white/15 focus:border-cobalt rounded-lg px-3 py-2.5 text-white text-base sm:text-xs outline-none"
                required
              />
            </div>
          </div>

          {/* PROOF OF PAYMENT UPLOAD */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Bank Receipt (Optional)</label>
            {!receiptBase64 ? (
              <label className="flex items-center justify-center gap-2 w-full p-3 border border-dashed border-white/20 rounded-lg hover:border-white/40 cursor-pointer bg-[#141f33]/40 text-xs text-gray-400">
                <UploadCloud size={16} />
                <span>Upload receipt image (Max 2MB)</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            ) : (
              <div className="relative w-full h-32 rounded-lg border border-white/20 overflow-hidden bg-[#0b1220] flex items-center justify-center">
                <img src={receiptBase64} alt="Receipt" className="max-h-full object-contain" />
                <button
                  type="button"
                  onClick={() => setReceiptBase64(null)}
                  className="absolute top-2 right-2 bg-red-600 p-1 rounded text-white"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={isSubmitting || !selectedCycleId || !amount}
          className={`w-full py-3.5 rounded-lg font-bold text-white text-sm uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${
            transactionType === 'PAYMENT_COLLECTED'
              ? 'bg-emerald-600 hover:bg-emerald-500'
              : 'bg-purple-600 hover:bg-purple-500'
          }`}
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
          <span>{transactionType === 'PAYMENT_COLLECTED' ? 'Process Rider Payment' : 'Process Owner Payout'}</span>
        </button>
      </div>
    </form>
  );
}
