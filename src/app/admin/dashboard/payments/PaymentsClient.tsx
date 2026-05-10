"use client";

import { useState } from "react";
import { Banknote, UploadCloud, Loader2, CheckCircle2, ArrowRight, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PaymentsClient({ assignments }: { assignments: any[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [transactionType, setTransactionType] = useState<"PAYMENT_COLLECTED" | "OWNER_REMITTANCE">("PAYMENT_COLLECTED");
  
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [receiptBase64, setReceiptBase64] = useState<string | null>(null);

  const selectedAssignment = assignments.find(a => a.id === selectedVehicleId);

  // Auto-fill amount based on transaction type
  const handleTypeChange = (type: "PAYMENT_COLLECTED" | "OWNER_REMITTANCE") => {
    setTransactionType(type);
    if (selectedAssignment?.contract) {
      setAmount(type === "PAYMENT_COLLECTED" 
        ? selectedAssignment.contract.riderWeeklyRemittance.toString() 
        : selectedAssignment.contract.ownerWeeklyPayout.toString()
      );
    }
  };

  const handleVehicleChange = (val: string) => {
    setSelectedVehicleId(val);
    const assignment = assignments.find(a => a.id === val);
    if (assignment?.contract) {
      setAmount(transactionType === "PAYMENT_COLLECTED" 
        ? assignment.contract.riderWeeklyRemittance.toString() 
        : assignment.contract.ownerWeeklyPayout.toString()
      );
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
    if (!selectedVehicleId || !amount || !description) {
      return alert("Please fill in all compulsory fields.");
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
          receiptBase64
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      alert("Transaction saved and E-Receipt Dispatched!");
      router.refresh();
      // Reset form
      setSelectedVehicleId(""); setAmount(""); setDescription(""); setReceiptBase64(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (assignments.length === 0) {
    return <div className="p-12 text-center bg-void-navy rounded-xl text-gray-500">No active vehicles/contracts found. Assign a vehicle first.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      
      {/* Target Selection */}
      <div className="bg-void-navy p-6 rounded-xl border border-white/10 shadow-lg space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">1. Select Active Deployment</label>
          <select 
            value={selectedVehicleId}
            onChange={(e) => handleVehicleChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cobalt appearance-none"
            required
          >
            <option value="" className="bg-void-navy text-white">-- Select Vehicle / Contract --</option>
            {assignments.map(a => (
              <option key={a.id} value={a.id} className="bg-void-navy text-white">
                {a.registrationNumber} • Rider: {a.rider?.firstName} | Owner: {a.owner?.firstName}
              </option>
            ))}
          </select>
        </div>

        {selectedAssignment && (
          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button"
              onClick={() => handleTypeChange("PAYMENT_COLLECTED")}
              className={`p-4 rounded-xl border text-left transition ${transactionType === "PAYMENT_COLLECTED" ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/10 text-gray-400'}`}
            >
              <h4 className="font-bold mb-1">Rider Payment In</h4>
              <p className="text-xs opacity-70">Log money received from {selectedAssignment.rider?.firstName}</p>
            </button>
            <button 
              type="button"
              onClick={() => handleTypeChange("OWNER_REMITTANCE")}
              className={`p-4 rounded-xl border text-left transition ${transactionType === "OWNER_REMITTANCE" ? 'bg-purple-500/10 border-purple-500 text-purple-400' : 'bg-white/5 border-white/10 text-gray-400'}`}
            >
              <h4 className="font-bold mb-1">Owner Payout</h4>
              <p className="text-xs opacity-70">Log money sent to {selectedAssignment.owner?.firstName}</p>
            </button>
          </div>
        )}
      </div>

      {/* Transaction Details */}
      <div className={`transition-all duration-300 ${selectedAssignment ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
        <div className="bg-void-navy p-6 rounded-xl border border-white/10 shadow-lg space-y-6">
          <h3 className="font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">2. Transaction Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Amount (₦) *</label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cobalt font-mono text-lg"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description / Week *</label>
              <input 
                type="text" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Week 1 Remittance"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cobalt"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Upload Receipt (Optional)</label>
            {!receiptBase64 ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl hover:bg-white/5 transition cursor-pointer">
                <UploadCloud className="text-gray-400 mb-2" size={24} />
                <span className="text-sm text-gray-400">Click to upload bank receipt (JPG/PNG)</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            ) : (
              <div className="relative w-full h-48 rounded-xl border border-emerald-500/30 overflow-hidden bg-white/5 flex items-center justify-center">
                <img src={receiptBase64} alt="Receipt" className="max-h-full object-contain" />
                <button type="button" onClick={() => setReceiptBase64(null)} className="absolute top-2 right-2 bg-red-500 p-1.5 rounded-lg text-white hover:bg-red-600 transition"><X size={16}/></button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-white uppercase tracking-wider transition shadow-lg disabled:opacity-50 ${transactionType === 'PAYMENT_COLLECTED' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-purple-600 hover:bg-purple-500'}`}
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
            Process & Send E-Receipt
          </button>
        </div>
      </div>
    </form>
  );
}
