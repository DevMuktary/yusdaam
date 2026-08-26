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
  ArrowDownLeft, 
  ArrowUpRight,
  Receipt,
  FileText,
  Sparkles,
  Search,
  Check
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

  // Custom Dropdown UI state
  const [isVehicleOpen, setIsVehicleOpen] = useState(false);
  const [isCycleOpen, setIsCycleOpen] = useState(false);
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [cycleSearch, setCycleSearch] = useState("");

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

  // Filtered vehicles for custom search
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

  // Filtered cycles for search
  const filteredCycles = useMemo(() => {
    if (!cycleSearch.trim()) return activeCyclesList;
    const q = cycleSearch.toLowerCase();
    return activeCyclesList.filter(c => 
      `week ${c.weekNumber}`.includes(q) ||
      c.weekNumber.toString() === q
    );
  }, [activeCyclesList, cycleSearch]);

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
    setCycleSearch("");
    
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

          {/* MODERN CUSTOM POPUP DROPDOWN (VEHICLE) */}
          <div className="relative" ref={vehicleDropdownRef}>
            <button
              type="button"
              onClick={() => { setIsVehicleOpen(!isVehicleOpen); setIsCycleOpen(false); }}
              className={`w-full bg-[#131d35] hover:bg-[#162340] border-2 rounded-2xl p-4 flex items-center justify-between transition-all text-left outline-none shadow-lg ${
                isVehicleOpen ? 'border-cobalt ring-2 ring-cobalt/30 bg-[#162340]' : 'border-white/20 hover:border-white/30'
              }`}
            >
              {selectedAssignment ? (
                <div className="flex items-center gap-3 min-w-0">
                  <span className="px-2.5 py-1 bg-cobalt text-white font-mono font-bold rounded-lg text-xs tracking-wider shrink-0 shadow">
                    {selectedAssignment.registrationNumber}
                  </span>
                  <div className="min-w-0 truncate">
                    <p className="text-white font-bold text-sm truncate">{selectedAssignment.makeModel || selectedAssignment.type}</p>
                    <p className="text-xs text-gray-400 truncate">
                      Rider: <span className="text-emerald-400 font-medium">{selectedAssignment.rider?.firstName || 'None'}</span> • Owner: <span className="text-purple-400 font-medium">{selectedAssignment.owner?.firstName || 'None'}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-gray-400 font-medium text-sm">
                  <Car size={18} className="text-gray-500" />
                  <span>Choose active vehicle deployment...</span>
                </div>
              )}
              <ChevronDown size={20} className={`text-gray-300 transition-transform duration-200 shrink-0 ${isVehicleOpen ? 'rotate-180 text-cobalt' : ''}`} />
            </button>

            {/* FLOATING CUSTOM OPTIONS POPOVER */}
            {isVehicleOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f172a] border-2 border-cobalt/40 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Search Bar */}
                <div className="p-3 border-b border-white/10 bg-[#131d35]/60 flex items-center gap-2">
                  <Search size={16} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                    placeholder="Search by plate, rider, or owner name..."
                    className="w-full bg-transparent text-sm text-white placeholder-gray-400 outline-none"
                    autoFocus
                  />
                  {vehicleSearch && (
                    <button type="button" onClick={() => setVehicleSearch("")} className="text-gray-400 hover:text-white">
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Options List */}
                <div className="max-h-64 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
                  {filteredAssignments.length === 0 ? (
                    <div className="py-6 text-center text-xs text-gray-400">No matching deployments found</div>
                  ) : (
                    filteredAssignments.map((a) => {
                      const isSelected = a.id === selectedVehicleId;
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => handleVehicleSelect(a.id)}
                          className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition-all ${
                            isSelected 
                              ? 'bg-cobalt/30 border border-cobalt/60 text-white' 
                              : 'bg-[#131d35]/40 hover:bg-[#162340] border border-transparent hover:border-white/10 text-slate-light'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="px-2.5 py-0.5 bg-[#0f172a] border border-white/15 text-white font-mono font-bold rounded-md text-xs">
                              {a.registrationNumber}
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-white truncate">{a.makeModel || a.type}</p>
                              <p className="text-[11px] text-gray-400 truncate">
                                Rider: <strong className="text-emerald-400">{a.rider?.firstName || 'None'}</strong> • Owner: <strong className="text-purple-400">{a.owner?.firstName || 'None'}</strong>
                              </p>
                            </div>
                          </div>
                          {isSelected && <Check size={18} className="text-cobalt shrink-0 ml-2" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SELECTED DEPLOYMENT VERIFICATION BANNER */}
        {selectedAssignment && (
          <div className="bg-[#14203b] border border-cobalt/40 rounded-2xl p-5 space-y-4 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-cobalt text-white font-mono font-bold rounded-lg text-sm tracking-wide shadow">
                  {selectedAssignment.registrationNumber}
                </span>
                <span className="text-xs font-semibold text-slate-light">
                  {selectedAssignment.makeModel || selectedAssignment.type}
                </span>
              </div>
              <div className="text-xs text-gray-300 font-mono">
                Target: <strong className="text-emerald-400">₦{selectedAssignment.contract?.riderWeeklyRemittance?.toLocaleString() || 0}</strong> / wk
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Rider Summary */}
              <div className="bg-[#0f172a]/90 p-3.5 rounded-xl border border-emerald-500/20 flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <User size={16} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold uppercase tracking-wider text-[10px] text-emerald-400">Assigned Rider</p>
                  <p className="font-bold text-white text-sm truncate">
                    {selectedAssignment.rider?.firstName} {selectedAssignment.rider?.lastName || ""}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5 truncate">
                    {selectedAssignment.rider?.phoneNumber || selectedAssignment.rider?.email || "No phone listed"}
                  </p>
                </div>
              </div>

              {/* Owner & Bank Summary */}
              <div className="bg-[#0f172a]/90 p-3.5 rounded-xl border border-purple-500/20 flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
                  <Briefcase size={16} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold uppercase tracking-wider text-[10px] text-purple-400">Asset Owner & Bank</p>
                  <p className="font-bold text-white text-sm truncate">
                    {selectedAssignment.owner?.firstName} {selectedAssignment.owner?.lastName || ""}
                  </p>
                  <p className="text-gray-300 text-xs mt-0.5 truncate flex items-center gap-1.5">
                    <Building2 size={13} className="text-purple-400 shrink-0" />
                    <span>{selectedAssignment.owner?.bankName || "No Bank"} • <strong className="font-mono text-white">{selectedAssignment.owner?.accountNumber || "N/A"}</strong></span>
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
            
            {/* MODERN CUSTOM POPUP DROPDOWN (TARGET WEEK) */}
            <div className="relative" ref={cycleDropdownRef}>
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
                <div className={`w-full border-2 rounded-2xl px-4 py-4 text-sm flex items-center gap-3 font-medium
                  ${transactionType === "PAYMENT_COLLECTED" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-purple-500/10 border-purple-500/30 text-purple-300"}`}>
                  <CheckCircle2 size={20} className="shrink-0" />
                  <div>
                    <p className="font-bold">All current weeks are fully settled!</p>
                    <p className="text-xs opacity-80">There are no pending weekly cycles waiting for this transaction type.</p>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => { setIsCycleOpen(!isCycleOpen); setIsVehicleOpen(false); }}
                    className={`w-full bg-[#131d35] hover:bg-[#162340] border-2 rounded-2xl p-4 flex items-center justify-between transition-all text-left outline-none shadow-lg ${
                      isCycleOpen 
                        ? (transactionType === "PAYMENT_COLLECTED" ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-purple-500 ring-2 ring-purple-500/30') 
                        : 'border-white/20 hover:border-white/30'
                    }`}
                  >
                    {currentSelectedCycle ? (
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 font-bold text-xs rounded-lg uppercase tracking-wider text-white shadow ${
                          transactionType === "PAYMENT_COLLECTED" ? "bg-emerald-600" : "bg-purple-600"
                        }`}>
                          Week {currentSelectedCycle.weekNumber}
                        </span>
                        <div>
                          <p className="text-white font-bold text-sm">
                            Balance Due: ₦{(transactionType === "PAYMENT_COLLECTED" 
                              ? currentSelectedCycle.shortfallAmount 
                              : Math.max(0, currentSelectedCycle.ownerExpectedAmount - currentSelectedCycle.ownerRemittedAmount)
                            ).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            Target: ₦{(transactionType === "PAYMENT_COLLECTED" ? currentSelectedCycle.expectedAmount : currentSelectedCycle.ownerExpectedAmount).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-gray-400 font-medium text-sm">
                        <Calendar size={18} className="text-gray-500" />
                        <span>Choose a pending week to settle...</span>
                      </div>
                    )}
                    <ChevronDown size={20} className={`text-gray-300 transition-transform duration-200 shrink-0 ${isCycleOpen ? 'rotate-180 text-white' : ''}`} />
                  </button>

                  {/* FLOATING CUSTOM OPTIONS POPOVER (WEEKS) */}
                  {isCycleOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f172a] border-2 border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Search Bar if multiple weeks */}
                      {activeCyclesList.length > 5 && (
                        <div className="p-3 border-b border-white/10 bg-[#131d35]/60 flex items-center gap-2">
                          <Search size={16} className="text-gray-400 shrink-0" />
                          <input
                            type="text"
                            value={cycleSearch}
                            onChange={(e) => setCycleSearch(e.target.value)}
                            placeholder="Type week number (e.g. 1, 2, 5)..."
                            className="w-full bg-transparent text-sm text-white placeholder-gray-400 outline-none"
                            autoFocus
                          />
                        </div>
                      )}

                      {/* Weeks List */}
                      <div className="max-h-64 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
                        {filteredCycles.map((c) => {
                          const isSelected = c.id === selectedCycleId;
                          const remainingDue = transactionType === "PAYMENT_COLLECTED" 
                            ? c.shortfallAmount 
                            : Math.max(0, c.ownerExpectedAmount - c.ownerRemittedAmount);
                          const paidSoFar = transactionType === "PAYMENT_COLLECTED" ? c.amountPaid : c.ownerRemittedAmount;

                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleCycleSelect(c)}
                              className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition-all ${
                                isSelected 
                                  ? (transactionType === "PAYMENT_COLLECTED" ? 'bg-emerald-500/20 border border-emerald-500 text-white' : 'bg-purple-500/20 border border-purple-500 text-white')
                                  : 'bg-[#131d35]/40 hover:bg-[#162340] border border-transparent hover:border-white/10 text-slate-light'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow ${
                                  transactionType === "PAYMENT_COLLECTED" ? 'bg-emerald-700/80' : 'bg-purple-700/80'
                                }`}>
                                  W{c.weekNumber}
                                </span>
                                <div>
                                  <p className="text-sm font-bold text-white">
                                    ₦{remainingDue.toLocaleString()} <span className="text-xs font-normal text-gray-400">due</span>
                                  </p>
                                  <p className="text-[11px] text-gray-400">
                                    Target: ₦{(transactionType === "PAYMENT_COLLECTED" ? c.expectedAmount : c.ownerExpectedAmount).toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/10">
                                  ₦{paidSoFar.toLocaleString()} paid
                                </span>
                                {isSelected && <Check size={16} className={transactionType === "PAYMENT_COLLECTED" ? "text-emerald-400" : "text-purple-400"} />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* LIVE BREAKDOWN CARD FOR SELECTED WEEK (CLEAN & NON-OVERLAPPING) */}
            {currentSelectedCycle && (
              <div className="bg-[#131d35] border border-white/15 rounded-2xl p-5 space-y-4 animate-in slide-in-from-top-1 duration-200 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-white/10 text-white font-bold text-xs rounded-lg uppercase tracking-wider">
                      Week {currentSelectedCycle.weekNumber} Summary
                    </span>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleSetFullAmount} 
                    className="text-xs font-bold text-cobalt bg-cobalt/15 hover:bg-cobalt/25 border border-cobalt/30 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
                  >
                    <Sparkles size={13} /> Auto-fill Full Balance
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-[#0f172a] p-3 rounded-xl border border-white/5 text-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Target Due</span>
                    <span className="font-mono text-sm sm:text-base font-bold text-white">
                      ₦{(transactionType === "PAYMENT_COLLECTED" ? currentSelectedCycle.expectedAmount : currentSelectedCycle.ownerExpectedAmount).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="bg-[#0f172a] p-3 rounded-xl border border-white/5 text-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Paid So Far</span>
                    <span className="font-mono text-sm sm:text-base font-bold text-slate-light">
                      ₦{(transactionType === "PAYMENT_COLLECTED" ? currentSelectedCycle.amountPaid : currentSelectedCycle.ownerRemittedAmount).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className={`p-3 rounded-xl border text-center ${transactionType === "PAYMENT_COLLECTED" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-purple-500/10 border-purple-500/30 text-purple-300"}`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest block mb-1 opacity-80">Remaining Balance</span>
                    <span className="font-mono text-sm sm:text-base font-bold">
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
                    className="w-full bg-[#131d35] hover:bg-[#162340] border-2 border-white/20 focus:border-cobalt rounded-xl pl-10 pr-4 py-3.5 text-white font-mono text-lg font-bold outline-none transition-all shadow-inner"
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
                    className="w-full bg-[#131d35] hover:bg-[#162340] border-2 border-white/20 focus:border-cobalt rounded-xl pl-10 pr-4 py-3.5 text-white text-sm outline-none transition-all shadow-inner"
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
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-white/20 hover:border-cobalt rounded-2xl bg-[#131d35]/50 hover:bg-[#131d35] transition cursor-pointer">
                  <UploadCloud className="text-gray-400 mb-1.5" size={24} />
                  <span className="text-xs font-semibold text-slate-light">Click to upload bank transfer slip (JPG / PNG)</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">Max size: 2MB</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              ) : (
                <div className="relative w-full h-44 rounded-2xl border border-emerald-500/40 overflow-hidden bg-[#131d35] flex items-center justify-center">
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
            className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white uppercase tracking-wider text-sm transition shadow-xl disabled:opacity-40 disabled:cursor-not-allowed ${
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
