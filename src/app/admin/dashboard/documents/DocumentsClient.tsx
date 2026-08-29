"use client";

import { useState } from "react";
import { 
  FileText, Download, Search, ShieldCheck, 
  FileSignature, UserCheck, AlertCircle, Loader2, 
  CheckCircle2, ArrowDownCircle, AlertTriangle 
} from "lucide-react";
import { downloadFileToDevice, DownloadProgress } from "@/lib/download";

export default function DocumentsClient({ entries }: { entries: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);

  const handleDownload = (url: string, plateNo: string, personName: string, docType: string, buttonKey: string) => {
    if (!url) return;
    const cleanPlate = plateNo || "Unknown_Vehicle";
    const cleanName = personName ? personName.replace(/[^a-z0-9]/gi, '_') : "User";
    const safeFilename = `Yusdaam_${docType}_${cleanPlate}_${cleanName}.pdf`;

    setDownloadingDocId(buttonKey);

    downloadFileToDevice({
      url,
      filename: safeFilename,
      onProgress: (p) => {
        setProgress(p);
        if (p.status === "COMPLETED") {
          setDownloadingDocId(null);
          setTimeout(() => setProgress(null), 3500);
        } else if (p.status === "ERROR") {
          setDownloadingDocId(null);
          setTimeout(() => setProgress(null), 4500);
        }
      },
      onError: () => {
        setDownloadingDocId(null);
      }
    });
  };

  const filteredEntries = entries.filter((entry) => {
    const search = searchTerm.toLowerCase();
    const plate = entry.plateNumber.toLowerCase();
    const rider = entry.riderName.toLowerCase();
    const owner = entry.ownerName.toLowerCase();
    return plate.includes(search) || rider.includes(search) || owner.includes(search);
  });

  return (
    <div className="space-y-6 relative">
      
      {/* COMPACT MOBILE-OPTIMIZED DOWNLOAD PROGRESS WIDGET */}
      {progress && (
        <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:w-80 z-50 bg-[#0a1224]/95 backdrop-blur-md border border-blue-500/40 rounded-xl p-3.5 shadow-2xl shadow-blue-950/80 animate-in slide-in-from-bottom-5 duration-300">
          {/* Header Row: Icon + Name + Percentage */}
          <div className="flex items-center justify-between gap-2.5 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              {progress.status === "COMPLETED" ? (
                <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
                  <CheckCircle2 size={16} />
                </div>
              ) : progress.status === "ERROR" ? (
                <div className="p-1.5 bg-red-500/20 text-red-400 rounded-lg shrink-0">
                  <AlertTriangle size={16} />
                </div>
              ) : (
                <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg shrink-0">
                  <ArrowDownCircle size={16} className="animate-bounce" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {progress.status === "COMPLETED" ? "Download Complete" : progress.filename}
                </p>
                <p className="text-[10px] text-gray-400 truncate">
                  {progress.status === "COMPLETED"
                    ? "Saved to device storage"
                    : progress.status === "ERROR"
                    ? "Download failed"
                    : `${progress.percent}% downloaded`}
                </p>
              </div>
            </div>

            <span className={`text-xs font-black font-mono px-2 py-0.5 rounded ${
              progress.status === "COMPLETED"
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-blue-500/20 text-blue-300"
            }`}>
              {progress.percent}%
            </span>
          </div>

          {/* Real-time Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full transition-all duration-150 ease-out rounded-full ${
                progress.status === "COMPLETED" 
                  ? "bg-emerald-400" 
                  : "bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400"
              }`}
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* SEARCH BAR */}
      <div className="bg-[#0a0f1c] p-4 rounded-xl border border-white/10 flex items-center gap-3">
        <Search className="text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by Plate Number, Rider, or Owner Name..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-none text-white focus:outline-none placeholder-gray-600 text-sm"
        />
      </div>

      {/* VAULT TABLE */}
      <div className="bg-[#0a0f1c] border border-white/10 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-black/20 text-[10px] uppercase tracking-widest text-gray-400 border-b border-white/10">
                <th className="p-5">Record Type</th>
                <th className="p-5">Personnel Details</th>
                <th className="p-5">Execution Date</th>
                <th className="p-5 text-right">Document Actions (Direct Download)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredEntries.map((entry, idx) => {
                const docs = entry.docs;

                return (
                  <tr key={`${entry.id}-${idx}`} className="hover:bg-white/5 transition duration-150 group">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg shrink-0 ${entry.type === "DEPLOYMENT" ? "bg-blue-500/10 text-blue-400" : "bg-orange-500/10 text-orange-400"}`}>
                          {entry.type === "DEPLOYMENT" ? <FileText size={18} /> : <AlertCircle size={18} />}
                        </div>
                        <div>
                          <p className="font-black text-white uppercase tracking-wider">{entry.plateNumber}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">
                            {entry.type === "DEPLOYMENT" ? "Fleet Allocation" : "Pending Allocation"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-5 space-y-2">
                      {entry.riderName !== "N/A" && (
                        <div>
                          <p className="font-bold text-gray-300">{entry.riderName}</p>
                          <p className="text-[10px] text-emerald-400 font-mono mt-0.5">RIDER</p>
                        </div>
                      )}
                      
                      {entry.ownerName !== "N/A" && (
                        <div>
                          <p className="font-bold text-gray-400">{entry.ownerName}</p>
                          <p className="text-[10px] text-blue-400 font-mono mt-0.5">OWNER</p>
                        </div>
                      )}
                    </td>

                    <td className="p-5">
                      <p className="font-bold text-gray-300">{new Date(entry.updatedAt).toLocaleDateString('en-GB')}</p>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-400 uppercase tracking-widest font-bold">
                        <ShieldCheck size={12} /> Digitally Signed
                      </div>
                    </td>

                    <td className="p-5">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        
                        {docs.masterContractUrl && (
                          <button
                            onClick={() => handleDownload(docs.masterContractUrl!, entry.plateNumber, entry.ownerName, "Master_Contract", `${entry.id}-master`)}
                            disabled={downloadingDocId === `${entry.id}-master`}
                            className="flex items-center gap-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 hover:border-blue-600 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition disabled:opacity-50"
                          >
                            {downloadingDocId === `${entry.id}-master` ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                            Master Contract
                          </button>
                        )}

                        {docs.riderHpaUrl && (
                          <button
                            onClick={() => handleDownload(docs.riderHpaUrl!, entry.plateNumber, entry.riderName, "Rider_HPA", `${entry.id}-rider-hpa`)}
                            disabled={downloadingDocId === `${entry.id}-rider-hpa`}
                            className="flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 hover:border-emerald-600 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition disabled:opacity-50"
                          >
                            {downloadingDocId === `${entry.id}-rider-hpa` ? <Loader2 size={12} className="animate-spin" /> : <FileSignature size={12} />}
                            Rider HPA
                          </button>
                        )}
                        
                        {docs.riderPoaUrl && (
                          <button
                            onClick={() => handleDownload(docs.riderPoaUrl!, entry.plateNumber, entry.riderName, "Rider_POA", `${entry.id}-rider-poa`)}
                            disabled={downloadingDocId === `${entry.id}-rider-poa`}
                            className="flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 hover:border-emerald-600 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition disabled:opacity-50"
                          >
                            {downloadingDocId === `${entry.id}-rider-poa` ? <Loader2 size={12} className="animate-spin" /> : <FileSignature size={12} />}
                            Rider POA
                          </button>
                        )}

                        {docs.ownerHpaUrl && (
                          <button
                            onClick={() => handleDownload(docs.ownerHpaUrl!, entry.plateNumber, entry.ownerName, "Owner_HPA", `${entry.id}-owner-hpa`)}
                            disabled={downloadingDocId === `${entry.id}-owner-hpa`}
                            className="flex items-center gap-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-500/30 hover:border-purple-600 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition disabled:opacity-50"
                          >
                            {downloadingDocId === `${entry.id}-owner-hpa` ? <Loader2 size={12} className="animate-spin" /> : <UserCheck size={12} />}
                            Owner HPA
                          </button>
                        )}
                        
                        {docs.ownerPoaUrl && (
                          <button
                            onClick={() => handleDownload(docs.ownerPoaUrl!, entry.plateNumber, entry.ownerName, "Owner_POA", `${entry.id}-owner-poa`)}
                            disabled={downloadingDocId === `${entry.id}-owner-poa`}
                            className="flex items-center gap-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-500/30 hover:border-purple-600 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition disabled:opacity-50"
                          >
                            {downloadingDocId === `${entry.id}-owner-poa` ? <Loader2 size={12} className="animate-spin" /> : <UserCheck size={12} />}
                            Owner POA
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <FileText size={36} className="text-gray-600 mb-3 opacity-40" />
                      <p className="text-sm">No signed agreements (Contract, HPA, or POA) found in the system vault.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
