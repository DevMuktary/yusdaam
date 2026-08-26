"use client";

import { useState, useMemo } from "react";
import { Car, Plus, X, Loader2, Search, Wrench, CheckCircle2, UserMinus, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

type Vehicle = any;

const ITEMS_PER_PAGE = 10;

export default function VehiclesClient({ vehicles }: { vehicles: Vehicle[] }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [formData, setFormData] = useState({
    type: "TRICYCLE",
    customType: "",
    makeModel: "",
    year: "",
    engineNumber: "",
    chassisNumber: "",
    registrationNumber: ""
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (formData.type === "OTHERS" && !formData.customType) {
      alert("Please specify the custom asset type.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add vehicle");
      }

      alert("Vehicle successfully added to inventory!");
      setIsModalOpen(false);
      setFormData({ type: "TRICYCLE", customType: "", makeModel: "", year: "", engineNumber: "", chassisNumber: "", registrationNumber: "" });
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle changing vehicle status or unassigning
  const handleVehicleAction = async (vehicleId: string, action: "MAINTENANCE" | "ACTIVE" | "UNASSIGN") => {
    if (action === "UNASSIGN") {
      const confirmUnassign = window.confirm(
        "Are you sure you want to unassign this vehicle? This will remove the current rider and owner assignments, and delete the active contract so it can be reassigned."
      );
      if (!confirmUnassign) return;
    }

    setUpdatingId(vehicleId);
    try {
      const res = await fetch("/api/admin/vehicles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId, action }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update vehicle");
      }

      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredVehicles = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return vehicles.filter(v => 
      v.registrationNumber.toLowerCase().includes(q) || 
      v.makeModel?.toLowerCase().includes(q) ||
      v.chassisNumber?.toLowerCase().includes(q)
    );
  }, [vehicles, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE));
  const paginatedVehicles = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredVehicles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredVehicles, page]);

  return (
    <div className="space-y-6">
      
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Plate, Make, or Chassis..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-base sm:text-sm text-white focus:outline-none focus:border-cobalt"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-cobalt hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition whitespace-nowrap"
        >
          <Plus size={18} /> Add New Vehicle
        </button>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {paginatedVehicles.map(vehicle => (
          <div key={vehicle.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition relative overflow-hidden flex flex-col justify-between group">
            
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <Car size={20} className="text-gray-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white leading-tight">{vehicle.makeModel || "Unknown Make"}</h3>
                    <p className="text-xs text-gray-400">
                      {vehicle.year} • {vehicle.type === 'OTHERS' ? vehicle.customType : vehicle.type.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider ${
                  vehicle.status === 'UNASSIGNED' ? 'bg-amber-500/20 text-amber-400' : 
                  vehicle.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {vehicle.status}
                </span>
              </div>

              <div className="space-y-2 text-xs bg-void-navy p-3 rounded-lg border border-white/5 mb-4">
                <div className="flex justify-between"><span className="text-gray-500">Plate No:</span> <span className="font-mono text-white tracking-wider">{vehicle.registrationNumber}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Chassis:</span> <span className="font-mono text-white">{vehicle.chassisNumber || "N/A"}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Engine:</span> <span className="font-mono text-white">{vehicle.engineNumber || "N/A"}</span></div>
              </div>

              <div className="space-y-1.5 text-xs mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 w-12">Owner:</span> 
                  {vehicle.owner ? <span className="text-emerald-400 font-medium">{vehicle.owner.firstName} {vehicle.owner.lastName}</span> : <span className="text-gray-600 italic">None</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 w-12">Rider:</span> 
                  {vehicle.rider ? <span className="text-cobalt font-medium">{vehicle.rider.firstName} {vehicle.rider.lastName}</span> : <span className="text-gray-600 italic">None</span>}
                </div>
              </div>
            </div>

            {/* NEW: Action Buttons */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2">
              {vehicle.status === 'ACTIVE' && (
                <button
                  onClick={() => handleVehicleAction(vehicle.id, 'MAINTENANCE')}
                  disabled={updatingId === vehicle.id}
                  className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 py-2 rounded-lg text-xs font-bold transition flex justify-center items-center gap-1.5"
                >
                  {updatingId === vehicle.id ? <Loader2 size={14} className="animate-spin"/> : <Wrench size={14} />}
                  Maintenance
                </button>
              )}
              
              {vehicle.status === 'MAINTENANCE' && (
                <button
                  onClick={() => handleVehicleAction(vehicle.id, 'ACTIVE')}
                  disabled={updatingId === vehicle.id}
                  className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 py-2 rounded-lg text-xs font-bold transition flex justify-center items-center gap-1.5"
                >
                  {updatingId === vehicle.id ? <Loader2 size={14} className="animate-spin"/> : <CheckCircle2 size={14} />}
                  Set Active
                </button>
              )}

              {vehicle.rider && (
                <button
                  onClick={() => handleVehicleAction(vehicle.id, 'UNASSIGN')}
                  disabled={updatingId === vehicle.id}
                  className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-2 rounded-lg text-xs font-bold transition flex justify-center items-center gap-1.5"
                >
                  {updatingId === vehicle.id ? <Loader2 size={14} className="animate-spin"/> : <UserMinus size={14} />}
                  Unassign Rider
                </button>
              )}
            </div>

          </div>
        ))}
      {/* PAGINATION BAR (10 ITEMS PER VIEW) */}
      {filteredVehicles.length > 0 && (
        <div className="p-3.5 border border-white/10 rounded-xl bg-[#0e1626] flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-gray-400">
            Showing <strong className="text-white">{(page - 1) * ITEMS_PER_PAGE + 1}</strong> to <strong className="text-white">{Math.min(page * ITEMS_PER_PAGE, filteredVehicles.length)}</strong> of <strong className="text-white">{filteredVehicles.length}</strong> vehicles
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-white/15 bg-[#141f33] text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="px-2.5 py-1 text-xs font-semibold text-white">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-white/15 bg-[#141f33] text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {filteredVehicles.length === 0 && (
        <div className="text-center py-20 bg-white/5 border border-white/10 border-dashed rounded-xl">
          <Car size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No vehicles found in inventory.</p>
        </div>
      )}

      {/* ADD VEHICLE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-void-navy border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-lg font-bold text-white">Register New Asset</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddVehicle} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Asset Type *</label>
                <div className="relative">
                  <select 
                    name="type" 
                    value={formData.type} 
                    onChange={handleTextChange} 
                    className="w-full bg-[#131d35] hover:bg-[#162340] border-2 border-white/20 focus:border-cobalt rounded-xl px-4 py-3 pr-11 text-white font-medium text-sm transition-all outline-none appearance-none cursor-pointer shadow-inner" 
                    required
                  >
                    <option value="TRICYCLE" className="bg-[#0f172a] text-white py-2">Tricycle (Keke)</option>
                    <option value="MINIBUS_KOROPE" className="bg-[#0f172a] text-white py-2">Mini-Bus (Korope)</option>
                    <option value="CAR_UBER" className="bg-[#0f172a] text-white py-2">Uber Sedan</option>
                    <option value="TIPPER" className="bg-[#0f172a] text-white py-2">Tipper Truck</option>
                    <option value="OTHERS" className="bg-[#0f172a] text-white py-2">Others (Specify)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                    <ChevronDown size={18} />
                  </div>
                </div>
              </div>

              {formData.type === "OTHERS" && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Specify Custom Asset *</label>
                  <input type="text" name="customType" value={formData.customType} onChange={handleTextChange} placeholder="e.g. Delivery Van" className="w-full bg-void-navy border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cobalt" required />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Make & Model *</label>
                  <input type="text" name="makeModel" value={formData.makeModel} onChange={handleTextChange} placeholder="e.g. TVS King" className="w-full bg-void-navy border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cobalt" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Year *</label>
                  <input type="text" name="year" value={formData.year} onChange={handleTextChange} placeholder="e.g. 2024" className="w-full bg-void-navy border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cobalt" required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Plate / Registration No *</label>
                <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleTextChange} placeholder="e.g. KJA-123XY" className="w-full bg-void-navy border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cobalt uppercase" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Chassis Number *</label>
                  <input type="text" name="chassisNumber" value={formData.chassisNumber} onChange={handleTextChange} className="w-full bg-void-navy border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cobalt uppercase" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Engine Number *</label>
                  <input type="text" name="engineNumber" value={formData.engineNumber} onChange={handleTextChange} className="w-full bg-void-navy border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cobalt uppercase" required />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-cobalt hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Save to Inventory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
