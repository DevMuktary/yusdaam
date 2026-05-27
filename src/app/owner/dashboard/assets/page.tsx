import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { CarFront, AlertCircle, CheckCircle2 } from "lucide-react";
import VirtualAgreement from "../VirtualAgreement";

// FORCE NEXT.JS TO NEVER CACHE THIS PAGE
export const dynamic = "force-dynamic";
export const revalidate = 0;

const prisma = new PrismaClient();

export default async function OwnerAssetsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/owner/login");
  }

  // Fetch the user along with their default witness details and ALL their vehicles + contracts
  // NOTE: We intentionally DO NOT fetch the rider data here to maintain owner/rider privacy separation.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      ownedVehicles: {
        include: {
          contract: true
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user) redirect("/owner/login");

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 overflow-x-hidden">
      <div className="border-b border-cobalt/20 pb-6">
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-wide mb-2 flex items-center gap-3">
          <CarFront className="text-cobalt" /> Fleet Portfolio
        </h1>
        <p className="text-slate-light">Manage your assigned commercial transport assets and specific agreements.</p>
      </div>

      {user.ownedVehicles.length === 0 ? (
        <div className="bg-void-light/5 border border-cobalt/20 rounded-xl p-10 text-center">
          <CarFront className="w-16 h-16 text-slate-light/20 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-crisp-white mb-2 uppercase tracking-widest">No Assets Assigned Yet</h3>
          <p className="text-sm text-slate-light">Your portfolio is currently empty. Our administration team will notify you when a new vehicle has been vetted and allocated to you.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {user.ownedVehicles.map((vehicle) => {
            const contract = vehicle.contract;
            // Determine if this specific vehicle requires a signature
            const needsSignature = contract && contract.isSigned === false;

            // Calculate Dates if contract exists
            let startDateStr = "TBD";
            let endDateStr = "TBD";
            if (contract?.createdAt) {
              const sDate = new Date(contract.createdAt);
              startDateStr = sDate.toLocaleDateString('en-GB');
              if (contract.ownerDurationWeeks) {
                const eDate = new Date(sDate);
                eDate.setDate(eDate.getDate() + (contract.ownerDurationWeeks * 7));
                endDateStr = eDate.toLocaleDateString('en-GB');
              }
            }

            return (
              <div key={vehicle.id} className="bg-void-navy/50 border border-cobalt/20 rounded-xl overflow-hidden shadow-lg">
                
                {/* Vehicle Header Info */}
                <div className="p-6 bg-void-navy border-b border-cobalt/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-crisp-white uppercase tracking-wider mb-1">
                      {vehicle.makeModel || "Vehicle Details Pending"}
                    </h2>
                    <p className="text-sm text-slate-light font-mono">
                      Plate: {vehicle.registrationNumber || "UNREGISTERED"} | Type: {vehicle.type === "OTHERS" ? vehicle.customType : vehicle.type}
                    </p>
                  </div>
                  <div>
                    {needsSignature ? (
                      <span className="flex items-center gap-2 px-3 py-1 bg-amber-400/10 text-amber-400 text-[10px] font-bold uppercase tracking-widest rounded-md border border-amber-400/20">
                        <AlertCircle size={14} /> Signature Required
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 px-3 py-1 bg-emerald-400/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-md border border-emerald-400/20">
                        <CheckCircle2 size={14} /> Active Deployment
                      </span>
                    )}
                  </div>
                </div>

                {/* Conditional Body: Either the Form or the Active Dashboard Stats */}
                {needsSignature ? (
                  <div className="p-6 bg-signal-red/5">
                    <div className="mb-6 p-4 bg-void-navy border-l-4 border-signal-red rounded-r-lg">
                      <h4 className="text-signal-red font-bold uppercase tracking-wider text-sm mb-1">Action Needed</h4>
                      <p className="text-sm text-slate-light">This asset has been allocated to you. Please review and sign the specific administration agreement and Power of Attorney below to activate the asset for remittance collection.</p>
                    </div>

                    <VirtualAgreement 
                      contractId={contract.id}
                      initialWitnessName={user.defaultWitnessName}
                      initialWitnessSignature={user.defaultWitnessSignatureUrl}
                      
                      // Contract Details for PDF
                      ownerName={fullName} 
                      ownerId={user.id}
                      ownerEmail={user.email || ""}
                      ownerPhone={user.phoneNumber || ""}
                      bvn={user.bvn || ""}
                      nin={user.nin || ""}
                      ownerAddress={user.streetAddress || ""}
                      ownerBank={user.bankName || ""}
                      ownerAcctNo={user.accountNumber || ""}
                      vehicleType={vehicle.type === "OTHERS" ? (vehicle.customType || "") : vehicle.type}
                      makeModel={vehicle.makeModel || ""}
                      year={vehicle.year || ""}
                      plateNo={vehicle.registrationNumber || ""}
                      chassisNo={vehicle.chassisNumber || ""}
                      engineNo={vehicle.engineNumber || ""}
                      
                      targetWeeklyRemittance={contract.ownerWeeklyPayout.toString()}
                      ownerDurationWeeks={contract.ownerDurationWeeks?.toString() || "0"} 
                      
                      startDate={startDateStr}
                      endDate={endDateStr}
                      policyNo="To Be Provided By Admin"
                    />
                  </div>
                ) : (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Active Vehicle Stats */}
                    <div className="bg-void-light/5 border border-cobalt/20 p-5 rounded-lg">
                      <p className="text-[10px] font-bold text-slate-light uppercase tracking-widest mb-1">Target Weekly Remittance</p>
                      <p className="text-xl text-emerald-400 font-bold">₦{contract?.ownerWeeklyPayout?.toLocaleString() || "0"}</p>
                      <p className="text-xs text-slate-light mt-1">Target Duration: {contract?.ownerDurationWeeks || 0} Weeks</p>
                    </div>

                    <div className="bg-void-light/5 border border-cobalt/20 p-5 rounded-lg">
                      <p className="text-[10px] font-bold text-slate-light uppercase tracking-widest mb-1">Asset Status</p>
                      <p className="text-xl text-crisp-white font-bold">{contract?.isActive ? "Active Deployment" : "Completed"}</p>
                      <p className="text-xs text-slate-light mt-1">Deployment Date: {startDateStr}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
