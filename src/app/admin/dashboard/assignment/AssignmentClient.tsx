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
  Sparkles 
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

      alert("Success! Assignment completed and contract parameters established.");
      router.refresh();
      setSelectedVehicle(""); setSelectedRider(""); setSelectedOwner("");
      setFormData({ totalHirePurchasePrice: "", downPayment: "", riderWeeklyRemittance: "", riderDurationWeeks: "", ownerWeeklyPayout: "", ownerDurationWeeks: "" });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-20 bg-[#0f172a] border border-white/10 rounded-2xl shadow-xl">
        <Car size={48} className="mx-auto text-gray-500 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Vehicles Available</h3>
        <p className="text-gray-400 text-sm">Add a new unassigned vehicle to the inventory before creating an assignment.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleAssignment} className="space-y-8">
      
      {/* SELECTION GRID WITH MODERN CUSTOM DROPDOWNS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. VEHICLE DROPDOWN */}
        <div className={`p-5 rounded-2xl border transition-all ${selectedVehicle ? 'bg-cobalt/10 border-cobalt/50 shadow-lg shadow-blue-900/10' : 'bg-[#0f172a] border-white/15'}`} ref={vehicleRef}>
          <h3 className="flex items-center gap-2 text-xs font-black text-white mb-3 uppercase tracking-wider">
            <Car size={16} className="text-cobalt" /> 1. Select Vehicle *
          </h3>
          
          <div className="relative">
            <button
              type="button"
              onClick={() => { setIsVehicleOpen(!isVehicleOpen); setIsRiderOpen(false); setIsOwnerOpen(false); }}
              className={`w-full bg-[#131d35] hover:bg-[#162340] border-2 rounded-xl p-3.5 flex items-center justify-between text-left transition outline-none shadow-md ${
                isVehicleOpen ? 'border-cobalt ring-2 ring-cobalt/30' : 'border-white/20'
              }`}
            >
              {activeVehicle ? (
                <div className="min-w-0">
                  <span className="px-2 py-0.5 bg-cobalt text-white font-mono font-bold rounded text-xs">
                    {activeVehicle.registrationNumber}
                  </span>
                  <p className="text-white font-bold text-xs mt-1 truncate">{activeVehicle.makeModel || 'Vehicle'} ({activeVehicle.type})</p>
                </div>
              ) : (
                <span className="text-gray-400 text-xs font-medium">-- Choose Asset --</span>
              )}
              <ChevronDown size={18} className={`text-gray-300 transition-transform shrink-0 ${isVehicleOpen ? 'rotate-180 text-cobalt' : ''}`} />
            </button>

            {isVehicleOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f172a] border-2 border-cobalt/40 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2.5 border-b border-white/10 bg-[#131d35]/60 flex items-center gap-2">
                  <Search size={14} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                    placeholder="Search plate or model..."
                    className="w-full bg-transparent text-xs text-white placeholder-gray-400 outline-none"
                    autoFocus
                  />
                </div>
                <div className="max-h-56 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
                  {filteredVehicles.map(v => {
                    const isSelected = v.id === selectedVehicle;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => { setSelectedVehicle(v.id); setIsVehicleOpen(false); setVehicleSearch(""); }}
                        className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition ${
                          isSelected ? 'bg-cobalt/30 border border-cobalt text-white' : 'hover:bg-[#131d35] text-slate-light'
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="font-mono font-bold text-xs text-white bg-white/10 px-2 py-0.5 rounded mr-2">
                            {v.registrationNumber}
                          </span>
                          <span className="text-xs font-medium text-gray-300">{v.makeModel || v.type}</span>
                        </div>
                        {isSelected && <Check size={14} className="text-cobalt shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. RIDER DROPDOWN */}
        <div className={`p-5 rounded-2xl border transition-all ${selectedRider ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-900/10' : 'bg-[#0f172a] border-white/15'}`} ref={riderRef}>
          <h3 className="flex items-center gap-2 text-xs font-black text-white mb-3 uppercase tracking-wider">
            <User size={16} className="text-emerald-400" /> 2. Select Rider
          </h3>
          
          <div className="relative">
            <button
              type="button"
              onClick={() => { setIsRiderOpen(!isRiderOpen); setIsVehicleOpen(false); setIsOwnerOpen(false); }}
              className={`w-full bg-[#131d35] hover:bg-[#162340] border-2 rounded-xl p-3.5 flex items-center justify-between text-left transition outline-none shadow-md ${
                isRiderOpen ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-white/20'
              }`}
            >
              {activeRider ? (
                <div className="min-w-0">
                  <p className="text-white font-bold text-xs truncate">{activeRider.firstName} {activeRider.lastName}</p>
                  <p className="text-[11px] text-emerald-400 mt-0.5 truncate">{activeRider.phoneNumber || 'No phone'}</p>
                </div>
              ) : (
                <span className="text-gray-400 text-xs font-medium">-- Choose Approved Rider --</span>
              )}
              <ChevronDown size={18} className={`text-gray-300 transition-transform shrink-0 ${isRiderOpen ? 'rotate-180 text-emerald-400' : ''}`} />
            </button>

            {isRiderOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f172a] border-2 border-emerald-500/40 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2.5 border-b border-white/10 bg-[#131d35]/60 flex items-center gap-2">
                  <Search size={14} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={riderSearch}
                    onChange={(e) => setRiderSearch(e.target.value)}
                    placeholder="Search rider name or phone..."
                    className="w-full bg-transparent text-xs text-white placeholder-gray-400 outline-none"
                    autoFocus
                  />
                </div>
                <div className="max-h-56 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
                  <button
                    type="button"
                    onClick={() => { setSelectedRider(""); setIsRiderOpen(false); setRiderSearch(""); }}
                    className="w-full p-2 rounded-xl text-left text-xs text-gray-400 hover:bg-[#131d35]"
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
                        className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition ${
                          isSelected ? 'bg-emerald-500/20 border border-emerald-500 text-white' : 'hover:bg-[#131d35] text-slate-light'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white">{r.firstName} {r.lastName}</p>
                          <p className="text-[11px] text-gray-400">{r.phoneNumber || 'No phone'}</p>
                        </div>
                        {isSelected && <Check size={14} className="text-emerald-400 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. ASSET OWNER DROPDOWN */}
        <div className={`p-5 rounded-2xl border transition-all ${selectedOwner ? 'bg-purple-500/10 border-purple-500/50 shadow-lg shadow-purple-900/10' : 'bg-[#0f172a] border-white/15'}`} ref={ownerRef}>
          <h3 className="flex items-center gap-2 text-xs font-black text-white mb-3 uppercase tracking-wider">
            <Briefcase size={16} className="text-purple-400" /> 3. Select Asset Owner
          </h3>
          
          <div className="relative">
            <button
              type="button"
              onClick={() => { setIsOwnerOpen(!isOwnerOpen); setIsVehicleOpen(false); setIsRiderOpen(false); }}
              className={`w-full bg-[#131d35] hover:bg-[#162340] border-2 rounded-xl p-3.5 flex items-center justify-between text-left transition outline-none shadow-md ${
                isOwnerOpen ? 'border-purple-500 ring-2 ring-purple-500/30' : 'border-white/20'
              }`}
            >
              {activeOwner ? (
                <div className="min-w-0">
                  <p className="text-white font-bold text-xs truncate">{activeOwner.firstName} {activeOwner.lastName}</p>
                  <p className="text-[11px] text-purple-400 mt-0.5 truncate">{activeOwner.preferredAssetClass || 'Asset Owner'}</p>
                </div>
              ) : (
                <span className="text-gray-400 text-xs font-medium">-- Choose Asset Owner --</span>
              )}
              <ChevronDown size={18} className={`text-gray-300 transition-transform shrink-0 ${isOwnerOpen ? 'rotate-180 text-purple-400' : ''}`} />
            </button>

            {isOwnerOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f172a] border-2 border-purple-500/40 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2.5 border-b border-white/10 bg-[#131d35]/60 flex items-center gap-2">
                  <Search size={14} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={ownerSearch}
                    onChange={(e) => setOwnerSearch(e.target.value)}
                    placeholder="Search owner name..."
                    className="w-full bg-transparent text-xs text-white placeholder-gray-400 outline-none"
                    autoFocus
                  />
                </div>
                <div className="max-h-56 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
                  <button
                    type="button"
                    onClick={() => { setSelectedOwner(""); setIsOwnerOpen(false); setOwnerSearch(""); }}
                    className="w-full p-2 rounded-xl text-left text-xs text-gray-400 hover:bg-[#131d35]"
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
                        className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition ${
                          isSelected ? 'bg-purple-500/20 border border-purple-500 text-white' : 'hover:bg-[#131d35] text-slate-light'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white">{o.firstName} {o.lastName}</p>
                          <p className="text-[11px] text-gray-400">{o.preferredAssetClass || 'Asset Owner'}</p>
                        </div>
                        {isSelected && <Check size={14} className="text-purple-400 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* FINANCIAL PARAMETERS */}
      <div className="bg-[#0f172a] border border-white/15 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/10 bg-[#131d35]/60 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <Sparkles size={18} className="text-cobalt" /> Financial & Contract Terms
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Define hire purchase targets, installment frequencies, and returns.</p>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* RIDER TERMS */}
          <div className="space-y-4">
            <h4 className="text-emerald-400 font-bold uppercase tracking-wider text-xs border-b border-white/10 pb-2">
              Rider Obligations (Inflow)
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1.5">Total HP Price (₦) *</label>
                <input 
                  type="text" 
                  name="totalHirePurchasePrice" 
                  value={formData.totalHirePurchasePrice} 
                  onChange={handleInputChange} 
                  placeholder="e.g. 3500000" 
                  className="w-full bg-[#131d35] hover:bg-[#162340] border-2 border-white/20 focus:border-emerald-500 rounded-xl px-4 py-3 text-white font-mono text-sm outline-none transition shadow-inner" 
                  required={!!selectedRider} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1.5">Down Payment (₦)</label>
                <input 
                  type="text" 
                  name="downPayment" 
                  value={formData.downPayment} 
                  onChange={handleInputChange} 
                  placeholder="Optional" 
                  className="w-full bg-[#131d35] hover:bg-[#162340] border-2 border-white/20 focus:border-emerald-500 rounded-xl px-4 py-3 text-white font-mono text-sm outline-none transition shadow-inner" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1.5">Weekly Payment (₦) *</label>
                <input 
                  type="text" 
                  name="riderWeeklyRemittance" 
                  value={formData.riderWeeklyRemittance} 
                  onChange={handleInputChange} 
                  placeholder="e.g. 30000" 
                  className="w-full bg-[#131d35] hover:bg-[#162340] border-2 border-white/20 focus:border-emerald-500 rounded-xl px-4 py-3 text-white font-mono text-sm outline-none transition shadow-inner" 
                  required={!!selectedRider} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1.5">Duration (Weeks) *</label>
                <input 
                  type="text" 
                  name="riderDurationWeeks" 
                  value={formData.riderDurationWeeks} 
                  onChange={handleInputChange} 
                  placeholder="e.g. 104" 
                  className="w-full bg-[#131d35] hover:bg-[#162340] border-2 border-white/20 focus:border-emerald-500 rounded-xl px-4 py-3 text-white font-mono text-sm outline-none transition shadow-inner" 
                  required={!!selectedRider} 
                />
              </div>
            </div>
          </div>

          {/* OWNER TERMS */}
          <div className="space-y-4">
            <h4 className="text-purple-400 font-bold uppercase tracking-wider text-xs border-b border-white/10 pb-2">
              Owner Returns (Payout)
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1.5">Weekly Payout (₦) *</label>
                <input 
                  type="text" 
                  name="ownerWeeklyPayout" 
                  value={formData.ownerWeeklyPayout} 
                  onChange={handleInputChange} 
                  placeholder="e.g. 20000" 
                  className="w-full bg-[#131d35] hover:bg-[#162340] border-2 border-white/20 focus:border-purple-500 rounded-xl px-4 py-3 text-white font-mono text-sm outline-none transition shadow-inner" 
                  required={!!selectedOwner} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1.5">Duration (Weeks) *</label>
                <input 
                  type="text" 
                  name="ownerDurationWeeks" 
                  value={formData.ownerDurationWeeks} 
                  onChange={handleInputChange} 
                  placeholder="e.g. 104" 
                  className="w-full bg-[#131d35] hover:bg-[#162340] border-2 border-white/20 focus:border-purple-500 rounded-xl px-4 py-3 text-white font-mono text-sm outline-none transition shadow-inner" 
                  required={!!selectedOwner} 
                />
              </div>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl flex gap-3 items-center">
              <AlertCircle size={20} className="text-purple-400 shrink-0" />
              <p className="text-xs text-purple-200">Both contract agreements and automated weekly billing schedules will be generated upon execution.</p>
            </div>
          </div>

        </div>

        <div className="p-6 bg-[#131d35]/60 border-t border-white/10 flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting || !selectedVehicle} 
            className="flex items-center gap-2 bg-cobalt hover:bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold transition disabled:opacity-40 shadow-xl shadow-blue-950/40"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={18} /> Execute Assignment & Contract</>}
          </button>
        </div>
      </div>
    </form>
  );
}
