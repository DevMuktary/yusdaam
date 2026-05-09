"use client";

import { useState } from "react";
import { ShieldCheck, Loader2, X, CheckCircle, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

// Defining the types based on Prisma and Robosttech
type Guarantor = any; // Using any for brevity, matches your Prisma schema
type Rider = any; 

export default function RidersKycClient({ riders }: { riders: Rider[] }) {
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [ninData, setNinData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="space-y-8">
      {riders.map((rider) => (
        <div key={rider.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          
          {/* RIDER SECTION */}
          <div className="p-6 border-b border-white/10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-crisp-white">
                  {rider.firstName} {rider.lastName}
                </h2>
                <p className="text-sm text-gray-400">{rider.email} • {rider.phoneNumber}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                rider.accountStatus === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {rider.accountStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Rider Details */}
              <div className="space-y-3">
                <p className="text-sm text-gray-400">Address: <span className="text-white">{rider.streetAddress}, {rider.state}</span></p>
                <p className="text-sm text-gray-400">License: <span className="text-white">{rider.driversLicenseNo || "N/A"}</span></p>
                <p className="text-sm text-gray-400">LASRDI: <span className="text-white">{rider.lasdriNo || "N/A"}</span></p>
                <p className="text-sm text-gray-400">Experience: <span className="text-white">{rider.drivingExperienceYears} years</span></p>
                
                {/* THE NIN VERIFICATION BLOCK */}
                <div className="mt-4 p-4 bg-void-navy rounded-lg border border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">National ID Number</p>
                      <p className="text-lg font-bold text-white tracking-widest">{rider.nin || "Not Provided"}</p>
                    </div>
                    {rider.nin && (
                      <button
                        onClick={() => handleVerifyNIN(rider.nin, rider.id)}
                        disabled={verifyingId === rider.id}
                        className="flex items-center gap-2 bg-cobalt hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition disabled:opacity-50"
                      >
                        {verifyingId === rider.id ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                        Verify NIN
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Rider Documents */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-light mb-2">Uploaded Documents</h3>
                <div className="flex gap-4">
                  {rider.passportUrl ? (
                    <a href={rider.passportUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 text-xs text-cobalt hover:text-blue-400">
                      <div className="w-16 h-16 bg-white/5 rounded flex items-center justify-center overflow-hidden">
                        <img src={rider.passportUrl} alt="Passport" className="object-cover w-full h-full" />
                      </div>
                      Passport
                    </a>
                  ) : <span className="text-xs text-gray-500">No Passport</span>}
                  
                  {rider.utilityBillUrl ? (
                    <a href={rider.utilityBillUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 text-xs text-cobalt hover:text-blue-400">
                      <div className="w-16 h-16 bg-white/5 rounded flex items-center justify-center"><ImageIcon /></div>
                      Utility Bill
                    </a>
                  ) : <span className="text-xs text-gray-500">No Utility</span>}
                </div>
              </div>
            </div>
          </div>

          {/* GUARANTOR SECTION */}
          <div className="bg-white/5 p-6">
            <h3 className="text-lg font-bold text-signal-red mb-4 flex items-center gap-2">
              <ShieldCheck size={20} /> Guarantor Details
            </h3>
            
            {rider.guarantors && rider.guarantors.length > 0 ? (
              rider.guarantors.map((guarantor: Guarantor) => (
                <div key={guarantor.id} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-void-navy p-4 rounded-lg border border-white/5">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Name: <span className="text-white">{guarantor.firstName} {guarantor.lastName}</span></p>
                    <p className="text-sm text-gray-400">Phone: <span className="text-white">{guarantor.phone}</span></p>
                    <p className="text-sm text-gray-400">Relation: <span className="text-white">{guarantor.relationship}</span></p>
                    <p className="text-sm text-gray-400">Status: <span className="text-amber-400 font-bold">{guarantor.status}</span></p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Employer: <span className="text-white">{guarantor.employerName || "Pending"}</span></p>
                    <p className="text-sm text-gray-400">Address: <span className="text-white">{guarantor.address || "Pending"}</span></p>
                    {guarantor.signatureUrl && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-400 mb-1">Digital Signature:</p>
                        <div className="bg-white p-2 rounded w-48 h-16 flex items-center justify-center">
                          <img src={guarantor.signatureUrl} alt="Signature" className="max-h-full" />
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">IP: {guarantor.ipAddress}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No guarantor has been submitted yet.</p>
            )}
          </div>
        </div>
      ))}

      {/* NIN VERIFICATION MODAL */}
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
              {/* Photo from NIMC Database */}
              <div className="flex flex-col items-center space-y-3">
                {ninData.photo ? (
                  <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-emerald-500/50">
                    <img src={`data:image/jpeg;base64,${ninData.photo}`} alt="NIMC Photo" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-lg bg-white/5 flex items-center justify-center text-xs text-gray-500">No Photo</div>
                )}
                <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">NIMC Database Match</span>
              </div>

              {/* Data Grid */}
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">First Name</p>
                  <p className="font-bold text-white">{ninData.firstname}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Surname</p>
                  <p className="font-bold text-white">{ninData.surname}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Middle Name</p>
                  <p className="font-bold text-white">{ninData.middlename || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date of Birth</p>
                  <p className="font-bold text-white">{ninData.birthdate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Gender</p>
                  <p className="font-bold text-white uppercase">{ninData.gender}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone Number</p>
                  <p className="font-bold text-white">{ninData.telephoneno}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Registered Address</p>
                  <p className="font-bold text-white">{ninData.residence_AdressLine1}, {ninData.residence_lga}, {ninData.residence_state}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ERROR MODAL */}
      {error && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-void-navy border border-red-500/50 rounded-xl p-6 max-w-md w-full text-center space-y-4">
            <h3 className="text-xl font-bold text-red-500">Verification Failed</h3>
            <p className="text-gray-300">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
