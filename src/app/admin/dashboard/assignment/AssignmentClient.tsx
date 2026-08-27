"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { 
  Car, 
  User, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ChevronDown, 
  Search, 
  Check, 
  X,
  Sparkles,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function AssignmentClient({ vehicles, riders, owners }: { vehicles: any[], riders: any[], owners: any[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selection State
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [selectedRider, setSelectedRider] = useState<string>("");
  const [selectedOwner, setSelectedOwner] = useState<string>("");

  // Dropdown UI States
  const [isVehicleOpen, setIsVehicleOpen] = useState(false);
  const [isRiderOpen, setIsRiderOpen] = useState(false);
  const [isOwnerOpen, setIsOwnerOpen] = useState(false);

  // Search States
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [riderSearch, setRiderSearch] = useState("");
  const [ownerSearch, setOwnerSearch] = useState("");

  const vehicleRef = useRef<HTMLDivElement>(null);
  const riderRef = useRef<HTMLDivElement>(null);
  const ownerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (vehicleRef.current && !vehicleRef.current.contains(e.target as Node)) {
        setIsVehicleOpen(false);
      }
      if (riderRef.current && !riderRef.current.contains(e.target as Node)) {
        setIsRiderOpen(false);
      }
      if (ownerRef.current && !ownerRef.current.contains(e.target as Node)) {
        setIsOwnerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered lists
  const filteredVehicles = useMemo(() => {
    if (!vehicleSearch.trim()) return vehicles;
    const q = vehicleSearch.toLowerCase();
    return vehicles.filter(v => 
      v.registrationNumber?.toLowerCase().includes(q) ||
      v.makeModel?.toLowerCase().includes(q) ||
      v.type?.toLowerCase().includes(q)
    );
  }, [vehicles, vehicleSearch]);

  const filteredRiders = useMemo(() => {
    if (!riderSearch.trim()) return riders;
    const q = riderSearch.toLowerCase();
    return riders.filter(r => 
      r.firstName?.toLowerCase().includes(q) ||
      r.lastName?.toLowerCase().includes(q) ||
      r.phoneNumber?.toLowerCase().includes(q)
    );
  }, [riders, riderSearch]);

  const filteredOwners = useMemo(() => {
    if (!ownerSearch.trim()) return owners;
    const q = ownerSearch.toLowerCase();
    return owners.filter(o => 
      o.firstName?.toLowerCase().includes(q) ||
      o.lastName?.toLowerCase().includes(q) ||
      o.preferredAssetClass?.toLowerCase().includes(q)
    );
  }, [owners, ownerSearch]);

  const activeVehicle = vehicles.find(v => v.id === selectedVehicle);
  const activeRider = riders.find(r => r.id === selectedRider);
  const activeOwner = owners.find(o => o.id === selectedOwner);

  // Financial Form State
  const [formData, setFormData] = useState({
    totalHirePurchasePrice: "",
    downPayment: "",
    riderWeeklyRemittance: "",
    riderDurationWeeks: "",
    ownerWeeklyPayout: "",
    ownerDurationWeeks: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVehicle) {
      return alert("Please select a Vehicle to assign.");
    }
    if (!selectedRider && !selectedOwner) {
      return alert("Please select either a Rider or an Asset Owner to proceed.");
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: selectedVehicle,
          riderId: selectedRider || null,
          ownerId: selectedOwner || null,
          systemGrandTotal: formData.totalHirePurchasePrice, 
          weeklyServiceFee: "0", 
          ...formData
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Assignment failed");
      }

      alert("Success! Fleet assignment and contracts created successfully.");
      router.refresh();
      setSelectedVehicle(""); setSelectedRider(""); setSelectedOwner("");
      setFormData({ totalHirePurchasePrice: "", downPayment: "", riderWeeklyRemittance: "", riderDurationWeeks: "", ownerWeeklyPayout: "", ownerDurationWeeks: "" });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Weekly profit calculation
  const weeklyMargin = useMemo(() => {
    const inflow = Number(formData.riderWeeklyRemittance) || 0;
    const payout = Number(formData.ownerWeeklyPayout) || 0;
    return inflow - payout;
  }, [formData.riderWeeklyRemittance, formData.ownerWeeklyPayout]);

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-[#0e1626] border border-white/10 rounded-2xl shadow-xl max-w-xl mx-auto">
        <Car size={40} className="mx-auto text-gray-500 mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">No Unassigned Vehicles</h3>
        <p className="text-gray-400 text-xs">Add a new vehicle to the inventory before creating an assignment.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleAssignment} className="space-y-6 w-full max-w-3xl mx-auto">
      
      {/* 1. SELECTION STEP (MOBILE FIRST MATCHMAKING) */}
      <div className="bg-[#0e1626] p-4 sm:p-5 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <Car size={15} className="text-cobalt" /> 1. Select Matchmaking Parties
          </h2>
          <span className="text-[10px] text-gray-400 font-medium">Step 1 of 2</span>
        </div>

        <div className="space-y-3.5">
          
          {/* VEHICLE PICKER */}
          <div className="relative" ref={vehicleRef}>
            <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Select Vehicle *
            </label>
            <button
              type="button"
              onClick={() => { setIsVehicleOpen(!isVehicleOpen); setIsRiderOpen(false); setIsOwnerOpen(false); }}
              className={`w-full bg-[#141f33] hover:bg-[#18263e] border rounded-xl px-3.5 py-3 flex items-center justify-between text-left transition outline-none shadow-sm ${
                isVehicleOpen ? 'border-cobalt ring-1 ring-cobalt' : 'border-white/15'
              }`}
            >
              {activeVehicle ? (
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-cobalt text-white font-mono font-bold rounded text-xs">
                      {activeVehicle.registrationNumber}
                    </span>
                    <span className="text-xs text-white font-medium truncate">
                      {activeVehicle.makeModel || 'Vehicle'} ({activeVehicle.type})
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-sm text-gray-400">Choose unassigned asset...</span>
              )}
              <ChevronDown size={18} className={`text-gray-400 shrink-0 transition-transform ${isVehicleOpen ? 'rotate-180 text-cobalt' : ''}`} />
            </button>

            {/* VEHICLES FLOATING POPOVER */}
            {isVehicleOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#0b1220] border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="p-2 border-b border-white/10 bg-[#141f33] flex items-center gap-2">
                  <Search size={14} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                    placeholder="Search plate or model..."
                    className="w-full bg-transparent text-base sm:text-xs text-white placeholder-gray-400 outline-none"
                    autoFocus
                  />
                  {vehicleSearch && (
                    <button type="button" onClick={() => setVehicleSearch("")} className="text-gray-400 hover:text-white">
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="max-h-52 overflow-y-auto p-1 space-y-1">
                  {filteredVehicles.length === 0 ? (
                    <div className="py-4 text-center text-xs text-gray-400">No matching vehicles</div>
                  ) : (
                    filteredVehicles.map(v => {
                      const isSelected = v.id === selectedVehicle;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => { setSelectedVehicle(v.id); setIsVehicleOpen(false); setVehicleSearch(""); }}
                          className={`w-full p-2.5 rounded-lg flex items-center justify-between text-left transition ${
                            isSelected ? 'bg-cobalt/40 text-white' : 'hover:bg-[#141f33] text-gray-300'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <span className="font-mono font-bold text-xs bg-white/10 text-white px-2 py-0.5 rounded mr-2">
                              {v.registrationNumber}
                            </span>
                            <span className="text-xs text-white font-medium">{v.makeModel || v.type}</span>
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

          {/* RIDER PICKER */}
          <div className="relative" ref={riderRef}>
            <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Select Approved Rider (Optional)
            </label>
            <button
              type="button"
              onClick={() => { setIsRiderOpen(!isRiderOpen); setIsVehicleOpen(false); setIsOwnerOpen(false); }}
              className={`w-full bg-[#141f33] hover:bg-[#18263e] border rounded-xl px-3.5 py-3 flex items-center justify-between text-left transition outline-none shadow-sm ${
                isRiderOpen ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-white/15'
              }`}
            >
              {activeRider ? (
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-bold text-white truncate">{activeRider.firstName} {activeRider.lastName}</p>
                  <p className="text-[11px] text-emerald-400 mt-0.5 truncate">{activeRider.phoneNumber || 'No phone'}</p>
                </div>
              ) : (
                <span className="text-sm text-gray-400">Choose approved rider...</span>
              )}
              <ChevronDown size={18} className={`text-gray-400 shrink-0 transition-transform ${isRiderOpen ? 'rotate-180 text-emerald-400' : ''}`} />
            </button>

            {/* RIDERS FLOATING POPOVER */}
            {isRiderOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#0b1220] border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="p-2 border-b border-white/10 bg-[#141f33] flex items-center gap-2">
                  <Search size={14} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={riderSearch}
                    onChange={(e) => setRiderSearch(e.target.value)}
                    placeholder="Search rider name or phone..."
                    className="w-full bg-transparent text-base sm:text-xs text-white placeholder-gray-400 outline-none"
                    autoFocus
                  />
                </div>
                <div className="max-h-52 overflow-y-auto p-1 space-y-1">
                  <button
                    type="button"
                    onClick={() => { setSelectedRider(""); setIsRiderOpen(false); setRiderSearch(""); }}
                    className="w-full p-2 rounded-lg text-left text-xs text-gray-400 hover:bg-[#141f33]"
                  >
                    -- None (Assign Later) --
                  </button>
                  {filteredRiders.map(r => {
                    const isSelected = r.id === selectedRider;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => { setSelectedRider(r.id); setIsRiderOpen(false); setRiderSearch(""); }}
                        className={`w-full p-2.5 rounded-lg flex items-center justify-between text-left transition ${
                          isSelected ? 'bg-emerald-950/60 text-white border border-emerald-500/50' : 'hover:bg-[#141f33] text-gray-300'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold text-white">{r.firstName} {r.lastName}</p>
                          <p className="text-[11px] text-gray-400">{r.phoneNumber || 'No phone'}</p>
                        </div>
                        {isSelected && <Check size={16} className="text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ASSET OWNER PICKER */}
          <div className="relative" ref={ownerRef}>
            <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Select Asset Owner (Optional)
            </label>
            <button
              type="button"
              onClick={() => { setIsOwnerOpen(!isOwnerOpen); setIsVehicleOpen(false); setIsRiderOpen(false); }}
              className={`w-full bg-[#141f33] hover:bg-[#18263e] border rounded-xl px-3.5 py-3 flex items-center justify-between text-left transition outline-none shadow-sm ${
                isOwnerOpen ? 'border-purple-500 ring-1 ring-purple-500' : 'border-white/15'
              }`}
            >
              {activeOwner ? (
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-bold text-white truncate">{activeOwner.firstName} {activeOwner.lastName}</p>
                  <p className="text-[11px] text-purple-400 mt-0.5 truncate">{activeOwner.preferredAssetClass || 'Asset Owner'}</p>
                </div>
              ) : (
                <span className="text-sm text-gray-400">Choose asset owner...</span>
              )}
              <ChevronDown size={18} className={`text-gray-400 shrink-0 transition-transform ${isOwnerOpen ? 'rotate-180 text-purple-400' : ''}`} />
            </button>

            {/* OWNERS FLOATING POPOVER */}
            {isOwnerOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#0b1220] border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="p-2 border-b border-white/10 bg-[#141f33] flex items-center gap-2">
                  <Search size={14} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={ownerSearch}
                    onChange={(e) => setOwnerSearch(e.target.value)}
                    placeholder="Search owner name..."
                    className="w-full bg-transparent text-base sm:text-xs text-white placeholder-gray-400 outline-none"
                    autoFocus
                  />
                </div>
                <div className="max-h-52 overflow-y-auto p-1 space-y-1">
                  <button
                    type="button"
                    onClick={() => { setSelectedOwner(""); setIsOwnerOpen(false); setOwnerSearch(""); }}
                    className="w-full p-2 rounded-lg text-left text-xs text-gray-400 hover:bg-[#141f33]"
                  >
                    -- None (Assign Later) --
                  </button>
                  {filteredOwners.map(o => {
                    const isSelected = o.id === selectedOwner;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => { setSelectedOwner(o.id); setIsOwnerOpen(false); setOwnerSearch(""); }}
                        className={`w-full p-2.5 rounded-lg flex items-center justify-between text-left transition ${
                          isSelected ? 'bg-purple-950/60 text-white border border-purple-500/50' : 'hover:bg-[#141f33] text-gray-300'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold text-white">{o.firstName} {o.lastName}</p>
                          <p className="text-[11px] text-gray-400">{o.preferredAssetClass || 'Asset Owner'}</p>
                        </div>
                        {isSelected && <Check size={16} className="text-purple-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 2. FINANCIAL & CONTRACT TERMS (MOBILE OPTIMIZED) */}
      <div className="bg-[#0e1626] p-4 sm:p-5 rounded-2xl border border-white/10 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={15} className="text-cobalt" /> 2. Contract & Payment Terms
          </h2>
          <span className="text-[10px] text-gray-400 font-medium">Step 2 of 2</span>
        </div>

        <div className="space-y-5">
          
          {/* RIDER TERMS */}
          <div className="bg-[#141f33]/60 border border-white/10 rounded-xl p-3.5 sm:p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <User size={14} /> Rider Terms (Inflow)
              </span>
              {selectedRider && <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">Active</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-300 mb-1">Total HP Price (₦) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-gray-400 text-sm">₦</span>
                  <input 
                    type="text" 
                    name="totalHirePurchasePrice" 
                    value={formData.totalHirePurchasePrice} 
                    onChange={handleInputChange} 
                    placeholder="3500000" 
                    className="w-full bg-[#0b1220] border border-white/15 focus:border-emerald-500 rounded-lg pl-8 pr-3 py-2.5 text-white font-mono text-base sm:text-sm outline-none" 
                    required={!!selectedRider} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-gray-300 mb-1">Down Payment (₦)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-gray-400 text-sm">₦</span>
                  <input 
                    type="text" 
                    name="downPayment" 
                    value={formData.downPayment} 
                    onChange={handleInputChange} 
                    placeholder="0" 
                    className="w-full bg-[#0b1220] border border-white/15 focus:border-emerald-500 rounded-lg pl-8 pr-3 py-2.5 text-white font-mono text-base sm:text-sm outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-gray-300 mb-1">Weekly Remittance (₦) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-gray-400 text-sm">₦</span>
                  <input 
                    type="text" 
                    name="riderWeeklyRemittance" 
                    value={formData.riderWeeklyRemittance} 
                    onChange={handleInputChange} 
                    placeholder="30000" 
                    className="w-full bg-[#0b1220] border border-white/15 focus:border-emerald-500 rounded-lg pl-8 pr-3 py-2.5 text-white font-mono text-base sm:text-sm outline-none" 
                    required={!!selectedRider} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-gray-300 mb-1">Duration (Weeks) *</label>
                <input 
                  type="text" 
                  name="riderDurationWeeks" 
                  value={formData.riderDurationWeeks} 
                  onChange={handleInputChange} 
                  placeholder="104" 
                  className="w-full bg-[#0b1220] border border-white/15 focus:border-emerald-500 rounded-lg px-3.5 py-2.5 text-white font-mono text-base sm:text-sm outline-none" 
                  required={!!selectedRider} 
                />
              </div>
            </div>
          </div>

          {/* OWNER TERMS */}
          <div className="bg-[#141f33]/60 border border-white/10 rounded-xl p-3.5 sm:p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase size={14} /> Owner Returns (Payout)
              </span>
              {selectedOwner && <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono">Active</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-300 mb-1">Weekly Payout (₦) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-gray-400 text-sm">₦</span>
                  <input 
                    type="text" 
                    name="ownerWeeklyPayout" 
                    value={formData.ownerWeeklyPayout} 
                    onChange={handleInputChange} 
                    placeholder="20000" 
                    className="w-full bg-[#0b1220] border border-white/15 focus:border-purple-500 rounded-lg pl-8 pr-3 py-2.5 text-white font-mono text-base sm:text-sm outline-none" 
                    required={!!selectedOwner} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-gray-300 mb-1">Duration (Weeks) *</label>
                <input 
                  type="text" 
                  name="ownerDurationWeeks" 
                  value={formData.ownerDurationWeeks} 
                  onChange={handleInputChange} 
                  placeholder="104" 
                  className="w-full bg-[#0b1220] border border-white/15 focus:border-purple-500 rounded-lg px-3.5 py-2.5 text-white font-mono text-base sm:text-sm outline-none" 
                  required={!!selectedOwner} 
                />
              </div>
            </div>
          </div>

          {/* PROJECTED FINANCIAL MARGIN CARD */}
          {(Number(formData.riderWeeklyRemittance) > 0 || Number(formData.ownerWeeklyPayout) > 0) && (
            <div className="bg-[#141f33] border border-white/15 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className={weeklyMargin >= 0 ? "text-emerald-400" : "text-signal-red"} />
                <span className="text-gray-300">Projected Weekly Spread:</span>
              </div>
              <span className={`font-mono font-bold text-sm ${weeklyMargin >= 0 ? "text-emerald-400" : "text-signal-red"}`}>
                {weeklyMargin >= 0 ? "+" : ""}₦{weeklyMargin.toLocaleString()}/wk
              </span>
            </div>
          )}

          <div className="bg-[#0b1220] border border-white/10 p-3 rounded-lg flex gap-2.5 items-center text-xs text-gray-400">
            <AlertCircle size={16} className="text-cobalt shrink-0" />
            <p className="text-[11px] leading-tight">Digital agreements and weekly billing cycles will be created automatically on execution.</p>
          </div>

        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-2">
          <button 
            type="submit" 
            disabled={isSubmitting || !selectedVehicle || (!selectedRider && !selectedOwner)} 
            className="w-full py-4 rounded-xl font-bold bg-cobalt hover:bg-blue-600 text-white text-sm uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={18} /> Execute Assignment & Contract</>}
          </button>
        </div>

      </div>
    </form>
  );
}
