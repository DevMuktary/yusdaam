"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle, ShieldCheck, Trash2 } from "lucide-react";

export default function CleanupClient({ users }: { users: any[] }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState("");

  const PRESERVED_IDS = [
    "cms37vplx002xh01d4h76vz0k",
    "cmovqesmh0000ms37hocqsywl",
    "cmr252nvi0000elz4uw17ko5k",
    "cmrl1237m007dczlffstcg4n3"
  ];

  const preservedUsers = users.filter(u => PRESERVED_IDS.includes(u.id));
  const doomedUsers = users.filter(u => !PRESERVED_IDS.includes(u.id));

  const handleMassDelete = async () => {
    const confirmDelete = window.confirm(`WARNING: You are about to permanently delete ${doomedUsers.length} users. This action cannot be undone. Proceed?`);
    if (!confirmDelete) return;

    setIsDeleting(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/users/mass-delete", { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setMessage(data.message);
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-10">
      
      {message && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500 rounded-lg text-emerald-400 font-bold text-center">
          {message}
        </div>
      )}

      {/* SECURE USERS */}
      <div className="bg-[#0a0f1c] border border-blue-500/30 rounded-xl p-6 shadow-xl">
        <h2 className="text-xl font-black text-blue-400 flex items-center gap-2 mb-4 uppercase">
          <ShieldCheck /> Safe List ({preservedUsers.length} Users)
        </h2>
        <p className="text-sm text-gray-400 mb-4">These users match your exact IDs and will NOT be touched.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {preservedUsers.map(u => (
            <div key={u.id} className="p-3 bg-blue-900/10 border border-blue-500/20 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-200">{u.firstName} {u.lastName}</p>
                <p className="text-xs text-gray-500">{u.email} | {u.role}</p>
              </div>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded">PRESERVED</span>
            </div>
          ))}
        </div>
      </div>

      {/* DOOMED USERS */}
      <div className="bg-[#0a0f1c] border border-red-500/30 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 border-b border-red-500/20 pb-4">
          <div>
            <h2 className="text-xl font-black text-red-400 flex items-center gap-2 uppercase">
              <AlertTriangle /> Target List ({doomedUsers.length} Users)
            </h2>
            <p className="text-sm text-gray-400 mt-1">These users will be completely wiped from the database.</p>
          </div>
          
          <button 
            onClick={handleMassDelete}
            disabled={isDeleting || doomedUsers.length === 0}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold uppercase tracking-wider transition disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
            Execute Deletion
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-2">
          {doomedUsers.map(u => (
            <div key={u.id} className="p-3 bg-red-900/10 border border-red-500/20 rounded-lg">
              <p className="font-bold text-gray-300">{u.firstName} {u.lastName}</p>
              <p className="text-xs text-gray-500 truncate">{u.email}</p>
              <p className="text-[10px] text-red-400 font-mono mt-1">ID: {u.id}</p>
            </div>
          ))}
          {doomedUsers.length === 0 && <p className="text-gray-500 italic p-4">No other users found in the database.</p>}
        </div>
      </div>

    </div>
  );
}
