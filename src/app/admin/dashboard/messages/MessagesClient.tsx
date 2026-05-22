"use client";

import { useState } from "react";
import { Loader2, Send, Phone, UserSquare2, AlertCircle, CheckCircle2 } from "lucide-react";

interface RiderSubset {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  accountStatus: string;
}

export default function MessagesClient({ riders }: { riders: RiderSubset[] }) {
  const [mode, setMode] = useState<"SELECT" | "CUSTOM">("SELECT");
  const [selectedNumber, setSelectedNumber] = useState("");
  const [message, setMessage] = useState("");
  
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; text: string }>({ type: null, text: "" });

  const charCount = message.length;
  const smsPages = Math.ceil(charCount / 160) || 1;

  // Quick Templates to save admin time
  const templates = {
    reminder: "Dear Rider, a friendly reminder that your weekly vehicle remittance is due tomorrow. Please pay on time to avoid penalties. - YUSDAAM",
    meeting: "URGENT: Dear Rider, you are required to report to the Yusdaam Office tomorrow by 9:00 AM for a mandatory fleet inspection. - YUSDAAM",
    maintenance: "NOTICE: Please ensure your assigned vehicle undergoes its scheduled maintenance this weekend. Kindly submit the receipt via WhatsApp. - YUSDAAM"
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: null, text: "" });

    if (!selectedNumber) return setStatus({ type: "error", text: "Please provide a valid destination number." });
    if (!message) return setStatus({ type: "error", text: "Message body cannot be empty." });

    setIsSending(true);

    try {
      const res = await fetch("/api/admin/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: selectedNumber, message })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to send message");

      setStatus({ type: "success", text: "SMS Dispatched Successfully!" });
      setMessage(""); // Clear message on success
      if (mode === "CUSTOM") setSelectedNumber(""); // Clear number if custom
      
      setTimeout(() => setStatus({ type: null, text: "" }), 5000); // Clear success message after 5s

    } catch (err: any) {
      setStatus({ type: "error", text: err.message });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Column: Composition Form */}
      <div className="lg:col-span-2 bg-void-navy/50 border border-cobalt/20 rounded-xl p-6 shadow-lg">
        <form onSubmit={handleSend} className="space-y-6">
          
          {/* Mode Toggle */}
          <div className="flex bg-void-navy rounded-lg p-1 border border-cobalt/30">
            <button type="button" onClick={() => { setMode("SELECT"); setSelectedNumber(""); }} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-md transition flex items-center justify-center gap-2 ${mode === "SELECT" ? "bg-cobalt/20 text-crisp-white border border-cobalt/50" : "text-slate-light hover:text-crisp-white"}`}>
              <UserSquare2 size={16} /> Select Fleet Rider
            </button>
            <button type="button" onClick={() => { setMode("CUSTOM"); setSelectedNumber(""); }} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-md transition flex items-center justify-center gap-2 ${mode === "CUSTOM" ? "bg-cobalt/20 text-crisp-white border border-cobalt/50" : "text-slate-light hover:text-crisp-white"}`}>
              <Phone size={16} /> Enter Custom Number
            </button>
          </div>

          {/* Recipient Input */}
          <div>
            <label className="block text-[10px] font-bold text-slate-light uppercase tracking-widest mb-2">Recipient</label>
            {mode === "SELECT" ? (
              <select value={selectedNumber} onChange={(e) => setSelectedNumber(e.target.value)} className="w-full bg-void-navy border border-cobalt/30 rounded-lg px-4 py-3 text-sm text-crisp-white focus:outline-none focus:border-cobalt">
                <option value="">-- Choose a Rider --</option>
                {riders.map(rider => (
                  <option key={rider.id} value={rider.phoneNumber || ""} disabled={!rider.phoneNumber}>
                    {rider.firstName} {rider.lastName} {!rider.phoneNumber && "(No Phone Saved)"}
                  </option>
                ))}
              </select>
            ) : (
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-3.5 text-slate-light" />
                <input type="text" value={selectedNumber} onChange={(e) => setSelectedNumber(e.target.value)} placeholder="e.g. 08012345678 or 2348012345678" className="w-full bg-void-navy border border-cobalt/30 rounded-lg pl-12 pr-4 py-3 text-sm text-crisp-white focus:outline-none focus:border-cobalt" />
              </div>
            )}
          </div>

          {/* Message Body */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-[10px] font-bold text-slate-light uppercase tracking-widest">Message Body</label>
              <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded ${charCount > 160 ? "bg-amber-400/20 text-amber-400" : "bg-cobalt/10 text-cobalt"}`}>
                {charCount} Chars / {smsPages} Page{smsPages > 1 ? "s" : ""}
              </span>
            </div>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} placeholder="Type your SMS message here..." className="w-full bg-void-navy border border-cobalt/30 rounded-lg px-4 py-3 text-sm text-crisp-white focus:outline-none focus:border-cobalt resize-none" />
            <p className="text-[10px] text-slate-light mt-2 italic">Standard SMS length is 160 characters. Longer messages will be billed as multiple pages.</p>
          </div>

          {/* Alerts */}
          {status.type === "error" && (
            <div className="flex items-center gap-2 text-signal-red bg-signal-red/10 border border-signal-red/20 p-4 rounded-lg text-sm font-bold">
              <AlertCircle size={18} /> {status.text}
            </div>
          )}
          {status.type === "success" && (
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 p-4 rounded-lg text-sm font-bold">
              <CheckCircle2 size={18} /> {status.text}
            </div>
          )}

          <button type="submit" disabled={isSending} className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-signal-red text-crisp-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-signal-red/90 transition shadow-lg disabled:opacity-50">
            {isSending ? <><Loader2 size={18} className="animate-spin" /> Dispatching SMS...</> : <><Send size={18} /> Send Message</>}
          </button>
        </form>
      </div>

      {/* Right Column: Quick Templates */}
      <div className="bg-void-light/5 border border-cobalt/20 rounded-xl p-6 shadow-lg h-fit">
        <h3 className="font-bold uppercase tracking-wider text-sm mb-6 border-b border-cobalt/20 pb-4 text-cobalt">Quick Templates</h3>
        
        <div className="space-y-4">
          <button type="button" onClick={() => setMessage(templates.reminder)} className="w-full text-left p-4 rounded-lg border border-cobalt/20 bg-void-navy hover:border-cobalt/50 hover:bg-void-light/5 transition group">
            <h4 className="text-xs font-bold text-crisp-white uppercase tracking-widest mb-2 group-hover:text-cobalt transition">Payment Reminder</h4>
            <p className="text-[10px] text-slate-light leading-relaxed line-clamp-2">{templates.reminder}</p>
          </button>
          
          <button type="button" onClick={() => setMessage(templates.meeting)} className="w-full text-left p-4 rounded-lg border border-cobalt/20 bg-void-navy hover:border-cobalt/50 hover:bg-void-light/5 transition group">
            <h4 className="text-xs font-bold text-crisp-white uppercase tracking-widest mb-2 group-hover:text-cobalt transition">Office Summons</h4>
            <p className="text-[10px] text-slate-light leading-relaxed line-clamp-2">{templates.meeting}</p>
          </button>

          <button type="button" onClick={() => setMessage(templates.maintenance)} className="w-full text-left p-4 rounded-lg border border-cobalt/20 bg-void-navy hover:border-cobalt/50 hover:bg-void-light/5 transition group">
            <h4 className="text-xs font-bold text-crisp-white uppercase tracking-widest mb-2 group-hover:text-cobalt transition">Maintenance Notice</h4>
            <p className="text-[10px] text-slate-light leading-relaxed line-clamp-2">{templates.maintenance}</p>
          </button>
        </div>
      </div>

    </div>
  );
}
