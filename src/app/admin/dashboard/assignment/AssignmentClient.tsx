"use client";

import { useState } from "react";
import { Car, User, Briefcase, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AssignmentClient({ vehicles, riders, owners }: { vehicles: any[], riders: any[], owners: any[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selection State
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [selectedRider, setSelectedRider] = useState<string>("");
  const [selectedOwner, setSelectedOwner] = useState<string>("");

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
    // Only allow numbers
    const value = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle || !selectedRider || !selectedOwner) {
      return alert("Please select a Vehicle, Rider, and Asset Owner.");
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: selectedVehicle,
          riderId: selectedRider,
          ownerId: selectedOwner,
          ...formData
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Assignment failed");
      }

      alert("Success! Vehicle assigned, contract generated, and notifications dispatched.");
      router.refresh();
      // Reset form
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
      <div className="text-center py-20 bg-white/5 border border-white/10 rounded-xl">
        <Car size={48} className="mx-auto text-gray-600 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Vehicles Available</h3>
        <p className="text-gray-400">Add a new vehicle to the inventory before making an assignment.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleAssignment} className="space-y-8">
      
      {/* SELECTION GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Step 1: Vehicle */}
        <div className={`p-6 rounded-xl border transition-all ${selectedVehicle ? 'bg-cobalt/10 border-cobalt/40' : 'bg-void-navy border-white/10'}`}>
          <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-4 uppercase tracking-wider">
            <Car size={18} className="text-cobalt" /> 1. Select Vehicle
          </h3>
          <select 
            value={selectedVehicle} 
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cobalt"
            required
          >
            <option value="">-- Choose Asset --</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.registrationNumber} - {v.makeModel} ({v.type})</option>
            ))}
          </select>
        </div>

        {/* Step 2: Rider */}
        <div className={`p-6 rounded-xl border transition-all ${selectedRider ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-void-navy border-white/10'}`}>
          <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-4 uppercase tracking-wider">
            <User size={18} className="text-emerald-400" /> 2. Select Rider
          </h3>
          <select 
            value={selectedRider} 
            onChange={(e) => setSelectedRider(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
            required
          >
            <option value="">-- Choose Approved Rider --</option>
            {riders.map(r => (
              <option key={r.id} value={r.id}>{r.firstName} {r.lastName} ({r.phoneNumber})</option>
            ))}
          </select>
          {riders.length === 0 && <p className="text-xs text-red-400 mt-2">No approved riders available.</p>}
        </div>

        {/* Step 3: Owner */}
        <div className={`p-6 rounded-xl border transition-all ${selectedOwner ? 'bg-purple-500/10 border-purple-500/40' : 'bg-void-navy border-white/10'}`}>
          <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-4 uppercase tracking-wider">
            <Briefcase size={18} className="text-purple-400" /> 3. Select Asset Owner
          </h3>
          <select 
            value={selectedOwner} 
            onChange={(e) => setSelectedOwner(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            required
          >
            <option value="">-- Choose Asset Owner --</option>
            {owners.map(o => (
              <option key={o.id} value={o.id}>{o.firstName} {o.lastName} - {o.preferredAssetClass}</option>
            ))}
          </select>
          {owners.length === 0 && <p className="text-xs text-red-400 mt-2">No approved owners available.</p>}
        </div>

      </div>

      {/* FINANCIAL PARAMETERS */}
      <div className="bg-void-navy border border-white/10 rounded-xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-white/10 bg-white/5">
          <h3 className="font-bold text-lg text-white">Financial & Contract Terms</h3>
          <p className="text-sm text-gray-400">Define the specifics for this deployment.</p>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* RIDER TERMS */}
          <div className="space-y-5">
            <h4 className="text-emerald-400 font-bold uppercase tracking-wider text-sm border-b border-white/10 pb-2">Rider Obligations (Inflow)</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Total HP Price (₦) *</label>
                <input type="text" name="totalHirePurchasePrice" value={formData.totalHirePurchasePrice} onChange={handleInputChange} placeholder="e.g. 3500000" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Down Payment (₦)</label>
                <input type="text" name="downPayment" value={formData.downPayment} onChange={handleInputChange} placeholder="Optional" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Weekly Payment (₦) *</label>
                <input type="text" name="riderWeeklyRemittance" value={formData.riderWeeklyRemittance} onChange={handleInputChange} placeholder="e.g. 30000" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Duration (Weeks) *</label>
                <input type="text" name="riderDurationWeeks" value={formData.riderDurationWeeks} onChange={handleInputChange} placeholder="e.g. 104" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono" required />
              </div>
            </div>
          </div>

          {/* OWNER TERMS */}
          <div className="space-y-5">
            <h4 className="text-purple-400 font-bold uppercase tracking-wider text-sm border-b border-white/10 pb-2">Owner Returns (Payout)</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Weekly Payout (₦) *</label>
                <input type="text" name="ownerWeeklyPayout" value={formData.ownerWeeklyPayout} onChange={handleInputChange} placeholder="e.g. 20000" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 font-mono" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Duration (Weeks) *</label>
                <input type="text" name="ownerDurationWeeks" value={formData.ownerDurationWeeks} onChange={handleInputChange} placeholder="e.g. 104" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 font-mono" required />
              </div>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-lg mt-4 flex gap-3">
              <AlertCircle size={20} className="text-purple-400 shrink-0" />
              <p className="text-xs text-purple-200">The difference between Rider Inflow and Owner Payout represents the Yusdaam administrative and maintenance management margin.</p>
            </div>
          </div>

        </div>

        <div className="p-6 bg-white/5 border-t border-white/10 flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-cobalt hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-bold transition disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <><CheckCircle2 size={20} /> Execute Assignment & Contract</>}
          </button>
        </div>
      </div>
    </form>
  );
}
