"use client";

import { useState } from "react";
import { FileText, Download, Search, ExternalLink, ShieldCheck } from "lucide-react";

export default function DocumentsClient({ contracts }: { contracts: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  // The Magic Function to Force Cloudinary Downloads
  const handleForceDownload = (url: string, plateNo: string, riderName: string) => {
    if (!url) return;
    
    // Create a clean filename like: Yusdaam_Agreement_ABC123_John_Doe
    const cleanPlate = plateNo || "Unknown_Vehicle";
    const cleanName = riderName ? riderName.replace(/[^a-z0-9]/gi, '_') : "User";
    const safeFilename = `Yusdaam_Agreement_${cleanPlate}_${cleanName}`;

    // If it's a Cloudinary URL, inject the fl_attachment flag with our custom filename
    let downloadUrl = url;
    if (url.includes('cloudinary.com') && url.includes('/upload/')) {
      downloadUrl = url.replace('/upload/', `/upload/fl_attachment:${safeFilename}/`);
    }

    // Trigger the download programmatically
    const link = document.createElement('a');
    link.href = downloadUrl;
    // Fallback download attribute for non-cloudinary links
    link.download = safeFilename; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredContracts = contracts.filter((c) => {
    const search = searchTerm.toLowerCase();
    const plate = c.vehicle?.registrationNumber?.toLowerCase() || "";
    const rider = `${c.vehicle?.rider?.firstName || ""} ${c.vehicle?.rider?.lastName || ""}`.toLowerCase();
    const owner = `${c.vehicle?.owner?.firstName || ""} ${c.vehicle?.owner?.lastName || ""}`.toLowerCase();
    return plate.includes(search) || rider.includes(search) || owner.includes(search);
  });

  return (
    <div className="space-y-6">
      
      {/* Search Bar */}
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

      {/* Documents Table */}
      <div className="bg-[#0a0f1c] border border-white/10 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-black/20 text-[10px] uppercase tracking-widest text-gray-400 border-b border-white/10">
                <th className="p-5">Vehicle / Deployment</th>
                <th className="p-5">Rider Details</th>
                <th className="p-5">Owner Details</th>
                <th className="p-5">Execution Date</th>
                <th className="p-5 text-right">Document Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredContracts.map((contract) => {
                const vehicle = contract.vehicle;
                const rider = vehicle?.rider;
                const owner = vehicle?.owner;

                return (
                  <tr key={contract.id} className="hover:bg-white/5 transition duration-150 group">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg shrink-0">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="font-black text-white uppercase tracking-wider">{vehicle?.registrationNumber || "N/A"}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Fleet Allocation</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-5">
                      {rider ? (
                        <div>
                          <p className="font-bold text-gray-300">{rider.firstName} {rider.lastName}</p>
                          <p className="text-[10px] text-emerald-400 font-mono mt-0.5">RIDER</p>
                        </div>
                      ) : <span className="text-gray-600 text-xs italic">Unassigned</span>}
                    </td>

                    <td className="p-5">
                      {owner ? (
                        <div>
                          <p className="font-bold text-gray-300">{owner.firstName} {owner.lastName}</p>
                          <p className="text-[10px] text-purple-400 font-mono mt-0.5">OWNER</p>
                        </div>
                      ) : <span className="text-gray-600 text-xs italic">Company Owned</span>}
                    </td>

                    <td className="p-5">
                      <p className="font-bold text-gray-300">{new Date(contract.updatedAt).toLocaleDateString('en-GB')}</p>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-400 uppercase tracking-widest font-bold">
                        <ShieldCheck size={12} /> Digitally Signed
                      </div>
                    </td>

                    <td className="p-5">
                      <div className="flex items-center justify-end gap-3 opacity-80 group-hover:opacity-100 transition">
                        
                        {/* View in Browser (Standard Link) */}
                        <a 
                          href={contract.signedDocumentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          title="View in Browser"
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition"
                        >
                          <ExternalLink size={16} />
                        </a>

                        {/* Force Download (Bypasses Cloudinary Browser View) */}
                        <button
                          onClick={() => handleForceDownload(
                            contract.signedDocumentUrl, 
                            vehicle?.registrationNumber, 
                            rider?.firstName
                          )}
                          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-lg"
                        >
                          <Download size={14} /> Download Copy
                        </button>

                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <FileText size={36} className="text-gray-600 mb-3 opacity-40" />
                      <p className="text-sm">No signed agreements found in the system vault.</p>
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
