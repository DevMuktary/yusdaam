"use client";

import { useState } from "react";
import { Car, Plus, X, Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";

type Vehicle = any;

export default function VehiclesClient({ vehicles }: { vehicles: Vehicle[] }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    type: "TRICYCLE",
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
      setFormData({ type: "TRICYCLE", makeModel: "", year: "", engineNumber: "", chassisNumber: "", registrationNumber: "" });
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.makeModel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.chassisNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cobalt"
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
        {filteredVehicles.map(vehicle => (
          <div key={vehicle.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition relative overflow-hidden group">
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Car size={20} className="text-gray-300" />
                </div>
                <div>
                  <h3 className="font-bold text-white leading-tight">{vehicle.makeModel || "Unknown Make"}</h3>
                  <p className="text-xs text-gray-400">{vehicle.year} • {vehicle.type}</p>
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

            <div className="space-y-1.5 text-xs">
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
        ))}
      </div>

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
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Asset Type *</label>
                <select name="type" value={formData.type} onChange={handleTextChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cobalt" required>
                  <option value="TRICYCLE">Tricycle (Keke)</option>
                  <option value="MINIBUS_KOROPE">Mini-Bus (Korope)</option>
                  <option value="CAR_UBER">Uber Sedan</option>
                  <option value="TIPPER">Tipper Truck</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Make & Model *</label>
                  <input type="text" name="makeModel" value={formData.makeModel} onChange={handleTextChange} placeholder="e.g. TVS King" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cobalt" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Year *</label>
                  <input type="text" name="year" value={formData.year} onChange={handleTextChange} placeholder="e.g. 2024" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cobalt" required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Plate / Registration No *</label>
                <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleTextChange} placeholder="e.g. KJA-123XY" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cobalt uppercase" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Chassis Number</label>
                  <input type="text" name="chassisNumber" value={formData.chassisNumber} onChange={handleTextChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cobalt uppercase" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Engine Number</label>
                  <input type="text" name="engineNumber" value={formData.engineNumber} onChange={handleTextChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cobalt uppercase" />
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
