import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { ShieldCheck, Lock, CarFront, CheckCircle2, FileSignature, Download } from "lucide-react";
import VaultDocumentManager from "./VaultDocumentManager";

const prisma = new PrismaClient();

export default async function LegalVaultPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  // Fetch all required user and vehicle data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      ownedVehicles: {
        include: { contract: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user) return null;

  const isExecuted = user.accountStatus === "ACTIVE";
  const executionDate = user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "Pending";
  const primaryVehicle = user.ownedVehicles[0]; // Used for agreement template injection

  const agreementData = {
    ownerName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    bvn: user.bvn || "",
    nin: user.nin || "",
    ownerAddress: user.streetAddress || "",
    ownerEmail: user.email || "",
    ownerPhone: user.phoneNumber || "",
    ownerId: user.id,
    vehicleType: primaryVehicle?.type || "",
    makeModel: "TBD",
    year: "TBD",
    engineNo: "TBD",
    chassisNo: "TBD",
    plateNo: primaryVehicle?.registrationNumber || "",
    targetWeeklyRemittance: primaryVehicle?.contract?.weeklyRemittance?.toString() || "",
    ownerBank: user.bankName || "",
    ownerAcctNo: user.accountNumber || "",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-cobalt/20 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-wide mb-2">Legal Vault</h1>
          <p className="text-slate-light">Secure, encrypted repository for your legally binding compliance documents.</p>
        </div>
      </div>

      {/* Security Banner */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-lg">
        <div className="p-3 bg-emerald-500/20 rounded-full shrink-0">
          <Lock size={24} className="text-emerald-400" />
        </div>
        <div>
          <h3 className="font-bold text-emerald-400 uppercase tracking-wider text-sm mb-1">256-Bit Encryption Active</h3>
          <p className="text-xs text-slate-light leading-relaxed">
            All documents housed in this vault are digitally countersigned and legally binding under the Nigerian Evidence Act 2011 and CAMA 2020. 
            Access is strictly restricted to authorized personnel and the verified asset owner.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        
        {/* PRIMARY AGREEMENTS (Client Component) */}
        <div className="space-y-6">
          <h3 className="font-bold uppercase tracking-wider flex items-center gap-2 text-sm text-crisp-white border-b border-cobalt/20 pb-3">
            <FileSignature size={18} className="text-signal-red" /> Master Agreements
          </h3>
          <VaultDocumentManager 
            isExecuted={isExecuted} 
            executionDate={executionDate} 
            ownerSignature={user.signatureUrl}
            agreementData={agreementData}
          />
        </div>

        {/* ASSET SPECIFIC DOCUMENTS (Server Component) */}
        <div className="space-y-6">
          <h3 className="font-bold uppercase tracking-wider flex items-center gap-2 text-sm text-crisp-white border-b border-cobalt/20 pb-3">
            <ShieldCheck size={18} className="text-cobalt" /> Asset Certificates
          </h3>

          {user.ownedVehicles.length === 0 ? (
            <div className="bg-void-navy/30 border border-cobalt/10 border-dashed rounded-xl p-8 text-center">
              <CarFront size={32} className="text-cobalt/30 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-light uppercase tracking-wider">No Assets Allocated</p>
              <p className="text-xs text-slate-light/60 mt-2">Vehicle insurance and allocation certificates will appear here once your fleet is deployed.</p>
            </div>
          ) : (
            user.ownedVehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-void-navy/50 border border-cobalt/30 p-5 rounded-xl hover:bg-void-light/5 transition duration-300 shadow-md">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-sm text-crisp-white uppercase tracking-wider">Comprehensive Insurance</h4>
                    <p className="text-xs text-emerald-400 font-mono mt-1">{vehicle.registrationNumber || "PENDING REGISTRATION"}</p>
                  </div>
                  <span className="bg-void-dark text-slate-light border border-cobalt/30 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest">
                    {vehicle.type.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-cobalt/20">
                  <p className="text-[10px] text-slate-light uppercase tracking-widest">Status: <span className="text-emerald-400 font-bold">Valid</span></p>
                  <button className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-cobalt hover:text-crisp-white transition">
                    <Download size={14} /> Download
                  </button>
                </div>
              </div>
            ))
          )}

          {/* KYC Status Card */}
          <div className="bg-void-navy/50 border border-cobalt/30 p-5 rounded-xl flex items-center justify-between shadow-md">
            <div>
              <h4 className="font-bold text-sm text-crisp-white uppercase tracking-wider mb-1">Owner KYC Profile</h4>
              <p className="text-xs text-slate-light">Identity and BVN verifications.</p>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest">
              <CheckCircle2 size={14} /> Verified
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
