"use client";

import { useState } from "react";
import { 
  ShieldCheck, Loader2, X, CheckCircle, 
  ChevronDown, ChevronUp, UserCheck, UserX, FileText, User 
} from "lucide-react";
import { useRouter } from "next/navigation";

type Guarantor = any; 
type Rider = any; 

// Helper Component to render actual image previews instead of just icons
const DocumentPreview = ({ url, label }: { url: string, label: string }) => {
  if (!url) return null;
  const isPdf = url.toLowerCase().includes('.pdf');
  
  return (
    <a href={url} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 text-xs text-slate-300 hover:text-white transition group">
      <div className="w-20 h-20 bg-void-navy border border-white/10 rounded-lg overflow-hidden flex items-center justify-center group-hover:border-cobalt transition">
        {isPdf ? (
          <FileText size={28} className="text-cobalt" />
        ) : (
          <img src={url} alt={label} className="w-full h-full object-cover" />
        )}
      </div>
      <span className="font-medium text-center">{label}</span>
    </a>
  );
};

export default function RidersKycClient({ riders }: { riders: Rider[] }) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [ninData, setNinData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleVerifyNIN = async (nin: string, userId: string) => {
    setVerifyingId(userId);
    setError(null);
    setNinData(null);
    try {
      const res = await fetch("/api/admin/verify-nin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      setNinData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleStatusUpdate = async (userId: string, newStatus: "APPROVED" | "REJECTED") => {
    if (!confirm(`Are you sure you want to mark this rider as ${newStatus}? They will receive an email notification.`)) return;
    
    setIsProcessing(userId);
    try {
      const res = await fetch("/api/admin/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: newStatus, role: "RIDER" }),
      });
      
      if (!res.ok) throw new Error("Failed to update status");
      
      alert(`Rider successfully ${newStatus.toLowerCase()}!`);
      router.refresh(); 
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-4">
      {riders.map((rider) => (
        <div key={rider.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all">
          
          {/* ACCORDION HEADER (Always visible) */}
          <div 
            onClick={() => toggleExpand(rider.id)}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-void-navy border border-white/10 overflow-hidden flex items-center justify-center">
                {rider.passportUrl ? (
                  <img src={rider.passportUrl} alt="Passport" className="w-full h-full object-cover" />
                ) : (
                  <User size={20} className="text-gray-500" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-crisp-white">
                  {rider.firstName} {rider.lastName}
                </h2>
                <p className="text-sm text-gray-400">{rider.email} • {rider.phoneNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                rider.accountStatus === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 
                rider.accountStatus === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                'bg-amber-500/20 text-amber-400'
              }`}>
                {rider.accountStatus}
              </span>
              {expandedId === rider.id ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
            </div>
          </div>

          {/* EXPANDED DETAILS */}
          {expandedId === rider.id && (
            <div className="p-6 border-t border-white/10 bg-void-navy/50">
              
              {/* ACTION BUTTONS */}
              {rider.accountStatus === "PENDING" && (
                <div className="flex gap-4 mb-8 pb-6 border-b border-white/10">
                  <button 
                    onClick={() => handleStatusUpdate(rider.id, "APPROVED")}
                    disabled={isProcessing === rider.id}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition disabled:opacity-50"
                  >
                    {isProcessing === rider.id ? <Loader2 className="animate-spin" size={18} /> : <UserCheck size={18} />}
                    Approve Rider
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(rider.id, "REJECTED")}
                    disabled={isProcessing === rider.id}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition disabled:opacity-50"
                  >
                    {isProcessing === rider.id ? <Loader2 className="animate-spin" size={18} /> : <UserX size={18} />}
                    Reject Rider
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                
                {/* COLUMN 1: Personal & KYC */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-cobalt mb-3 uppercase tracking-wider">Identity Data</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-400">Full Name: <span className="text-white font-medium">{rider.firstName} {rider.middleName} {rider.lastName}</span></p>
                      <p className="text-gray-400">Address: <span className="text-white">{rider.streetAddress}, {rider.state}, {rider.country}</span></p>
                      <p className="text-gray-400">BVN: <span className="text-amber-400 font-mono tracking-widest">{rider.bvn || "Not Provided"}</span></p>
                    </div>
                  </div>

                  <div className="p-4 bg-void-navy rounded-lg border border-white/5">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">National ID Number (NIN)</p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-white tracking-widest">{rider.nin || "Not Provided"}</p>
                      {rider.nin && (
                        <button
                          onClick={() => handleVerifyNIN(rider.nin, rider.id)}
                          disabled={verifyingId === rider.id}
                          className="flex items-center gap-1 bg-cobalt/20 text-cobalt hover:bg-cobalt hover:text-white px-3 py-1.5 rounded text-xs font-bold transition disabled:opacity-50"
                        >
                          {verifyingId === rider.id ? <Loader2 className="animate-spin" size={14} /> : <ShieldCheck size={14} />}
                          Verify
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-cobalt mb-3 uppercase tracking-wider">Documents & Signatures</h3>
                    <div className="flex flex-wrap gap-4 mb-4">
                      <DocumentPreview url={rider.utilityBillUrl} label="Utility Bill" />
                      <DocumentPreview url={rider.driversLicenseUrl} label="D. License" />
                      <DocumentPreview url={rider.hpaAgreementUrl} label="Signed HPA" />
                    </div>
                    {rider.signatureUrl && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-400 mb-2">Rider's Digital Signature</p>
                        <div className="bg-white p-2 rounded w-48 h-20 flex items-center justify-center">
                          <img src={rider.signatureUrl} alt="Signature" className="max-h-full max-w-full object-contain" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* COLUMN 2: Next of Kin & Driving Info */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-cobalt mb-3 uppercase tracking-wider">Next of Kin</h3>
                    <div className="space-y-2 text-sm bg-white/5 p-4 rounded-lg border border-white/5">
                      <p className="text-gray-400">Name: <span className="text-white">{rider.nokFirstName} {rider.nokLastName}</span></p>
                      <p className="text-gray-400">Relation: <span className="text-white">{rider.nokRelationship}</span></p>
                      <p className="text-gray-400">Phone: <span className="text-white">{rider.nokPhone}</span></p>
                      <p className="text-gray-400">ID Number: <span className="text-white">{rider.nokIdNumber || "N/A"}</span></p>
                      <p className="text-gray-400">Address: <span className="text-white block mt-1">{rider.nokAddress}</span></p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-cobalt mb-3 uppercase tracking-wider">Driving Profile</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-400">License No: <span className="text-white">{rider.driversLicenseNo || "N/A"}</span></p>
                      <p className="text-gray-400">LASRDI No: <span className="text-white">{rider.lasdriNo || "N/A"}</span></p>
                      <p className="text-gray-400">Experience: <span className="text-white">{rider.drivingExperienceYears} Years</span></p>
                      <p className="text-gray-400">Ride Hailing: <span className="text-white">{rider.rideHailingActive ? "Yes" : "No"}</span></p>
                      <p className="text-gray-400">Prev. Hire Purchase: <span className="text-white">{rider.previousHPExperience ? "Yes" : "No"}</span></p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-emerald-500 mb-3 uppercase tracking-wider">Virtual Account</h3>
                    <div className="space-y-2 text-sm bg-emerald-500/10 p-4 rounded-lg border border-emerald-500/20">
                      <p className="text-xs text-emerald-400 mb-2 font-bold border-b border-emerald-500/20 pb-1">Paystack Dedicated Account</p>
                      <p className="text-gray-400">Bank: <span className="text-white">{rider.virtualBankName || "Pending Setup"}</span></p>
                      <p className="text-gray-400">Account: <span className="text-white font-mono tracking-wider">{rider.virtualAccountNo || "Pending Setup"}</span></p>
                    </div>
                  </div>
                </div>

                {/* COLUMN 3: Guarantors Details (Fully Expanded) */}
                <div className="space-y-4 xl:col-span-1 md:col-span-2">
                  <h3 className="text-sm font-bold text-signal-red mb-3 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck size={18} /> Guarantor Dossiers
                  </h3>
                  
                  {rider.guarantors && rider.guarantors.length > 0 ? (
                    rider.guarantors.map((g: Guarantor) => (
                      <div key={g.id} className="bg-void-navy p-5 rounded-lg border border-white/5 space-y-4 shadow-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-3 items-center">
                            <div className="w-12 h-12 rounded-full bg-white/5 overflow-hidden flex items-center justify-center border border-white/10">
                               {g.passportUrl ? <img src={g.passportUrl} className="w-full h-full object-cover"/> : <User size={20} className="text-gray-500"/>}
                            </div>
                            <div>
                              <p className="font-bold text-white text-base leading-tight">{g.firstName} {g.lastName}</p>
                              <p className="text-xs text-gray-400 mt-1">{g.relationship} • {g.phone}</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                           <div>
                             <p className="text-gray-500 mb-0.5">Email</p>
                             <p className="text-white">{g.email || "N/A"}</p>
                           </div>
                           <div>
                             <p className="text-gray-500 mb-0.5">NIN</p>
                             <p className="text-white">{g.nin || "N/A"}</p>
                           </div>
                           <div className="col-span-2">
                             <p className="text-gray-500 mb-0.5">Address ({g.residentialStatus || "Unknown"})</p>
                             <p className="text-white">{g.address || "N/A"}</p>
                           </div>
                           <div className="col-span-2">
                             <p className="text-gray-500 mb-0.5">Employment ({g.employmentStatus || "Unknown"})</p>
                             <p className="text-white">{g.employerName || "N/A"} - {g.officeAddress}</p>
                           </div>
                        </div>

                        <div className="pt-3 border-t border-white/10 flex gap-4">
                           {g.utilityBillUrl && (
                             <div>
                                <p className="text-gray-500 text-[10px] uppercase mb-1">Utility</p>
                                <DocumentPreview url={g.utilityBillUrl} label="" />
                             </div>
                           )}
                           {g.signatureUrl && (
                             <div>
                                <p className="text-gray-500 text-[10px] uppercase mb-1">Signature</p>
                                <div className="bg-white p-1 rounded w-32 h-16 flex items-center justify-center">
                                   <img src={g.signatureUrl} alt="Signature" className="max-h-full max-w-full object-contain" />
                                </div>
                                <p className="text-[9px] text-gray-500 mt-1">IP: {g.ipAddress}</p>
                             </div>
                           )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic p-4 bg-void-navy rounded-lg border border-white/5">No guarantor submitted yet.</p>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>
      ))}

      {/* NIN MODAL */}
      {ninData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-void-navy border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle size={20} /> NIMC Verification Successful
              </h3>
              <button onClick={() => setNinData(null)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center space-y-3">
                {ninData.photo ? (
                  <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-emerald-500/50">
                    <img src={`data:image/jpeg;base64,${ninData.photo}`} alt="NIMC Photo" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-lg bg-white/5 flex items-center justify-center text-xs text-gray-500">No Photo</div>
                )}
                <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">NIMC Match</span>
              </div>

              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500">First Name</p><p className="font-bold text-white">{ninData.firstname}</p></div>
                <div><p className="text-xs text-gray-500">Surname</p><p className="font-bold text-white">{ninData.surname}</p></div>
                <div><p className="text-xs text-gray-500">Date of Birth</p><p className="font-bold text-white">{ninData.birthdate}</p></div>
                <div><p className="text-xs text-gray-500">Gender</p><p className="font-bold text-white uppercase">{ninData.gender}</p></div>
                <div className="col-span-2"><p className="text-xs text-gray-500">Registered Address</p><p className="font-bold text-white">{ninData.residence_AdressLine1}, {ninData.residence_lga}</p></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
