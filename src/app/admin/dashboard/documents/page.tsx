import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import DocumentsClient from "./DocumentsClient";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function AdminDocumentsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const vaultEntries: any[] = [];

  // 1. Fetch all Vehicles to act as the primary "Deployments"
  const vehicles = await prisma.vehicle.findMany({
    include: {
      rider: true,
      owner: true,
      contract: true
    }
  });

  // Loop vehicles and create entries for those with docs
  vehicles.forEach(v => {
     const r = v.rider;
     const o = v.owner;
     const c = v.contract;

     // Rider docs are still on the User profile (signed during KYC before assignment)
     const rHpa = r?.hpaAgreementUrl || null;
     const rPoa = r?.poaAgreementUrl || null;
     
     // NEW: Owner docs are now isolated on the specific Contract for this vehicle
     const oHpa = c?.ownerHpaUrl || null; 
     const oPoa = c?.ownerPoaUrl || null;
     
     // The master system contract
     const cMaster = c?.signedDocumentUrl || null;

     if (rHpa || rPoa || oHpa || oPoa || cMaster) {
        vaultEntries.push({
           id: v.id,
           type: "DEPLOYMENT",
           plateNumber: v.registrationNumber,
           riderName: r ? `${r.firstName || ""} ${r.lastName || ""}`.trim() : "Unassigned",
           ownerName: o ? `${o.firstName || ""} ${o.lastName || ""}`.trim() : "Unassigned",
           updatedAt: c?.updatedAt || v.updatedAt,
           docs: {
             masterContractUrl: cMaster,
             riderHpaUrl: rHpa,
             riderPoaUrl: rPoa,
             ownerHpaUrl: oHpa,
             ownerPoaUrl: oPoa
           }
        });
     }
  });

  // 2. Fetch Users with docs who have NO vehicle assigned yet
  // This catches Riders who have completed KYC and signed, but are waiting for a vehicle.
  const allUsers = await prisma.user.findMany({
    where: {
      OR: [
        {
          AND: [
            { hpaAgreementUrl: { not: null } },
            { hpaAgreementUrl: { not: "" } }
          ]
        },
        {
          AND: [
            { poaAgreementUrl: { not: null } },
            { poaAgreementUrl: { not: "" } }
          ]
        }
      ]
    },
    include: {
      assignedTrip: true,
      ownedVehicles: true
    }
  });

  allUsers.forEach(u => {
     // For riders with no assigned vehicle
     if (u.role === "RIDER" && !u.assignedTrip) {
       vaultEntries.push({
         id: u.id,
         type: "UNASSIGNED_RIDER",
         plateNumber: "Pending Allocation",
         riderName: `${u.firstName || ""} ${u.lastName || ""}`.trim(),
         ownerName: "N/A",
         updatedAt: u.updatedAt,
         docs: {
           masterContractUrl: null,
           riderHpaUrl: u.hpaAgreementUrl || null,
           riderPoaUrl: u.poaAgreementUrl || null,
           ownerHpaUrl: null,
           ownerPoaUrl: null,
         }
       });
     } 
     // For legacy owners (if any still have documents stored on their user profile)
     else if (u.role === "ASSET_OWNER" && (!u.ownedVehicles || u.ownedVehicles.length === 0)) {
       vaultEntries.push({
         id: u.id,
         type: "UNASSIGNED_OWNER",
         plateNumber: "Pending Allocation",
         riderName: "N/A",
         ownerName: `${u.firstName || ""} ${u.lastName || ""}`.trim(),
         updatedAt: u.updatedAt,
         docs: {
           masterContractUrl: null,
           riderHpaUrl: null,
           riderPoaUrl: null,
           ownerHpaUrl: u.hpaAgreementUrl || null,
           ownerPoaUrl: u.poaAgreementUrl || null,
         }
       });
     }
  });

  // Sort by date (newest first)
  vaultEntries.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-black text-white uppercase tracking-wider">Signed Agreements Vault</h1>
        <p className="text-sm text-gray-400 mt-1">Access and download digital contracts, HPAs, and POAs.</p>
      </div>

      <DocumentsClient entries={vaultEntries} />
    </div>
  );
}
