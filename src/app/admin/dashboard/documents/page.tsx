import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DocumentsClient from "./DocumentsClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDocumentsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  const vaultEntries: any[] = [];

  // Fetch Vehicles and Users concurrently in parallel with targeted field selection
  const [vehicles, allUsers] = await Promise.all([
    // 1. Fetch all Vehicles to act as the primary "Deployments"
    prisma.vehicle.findMany({
      select: {
        id: true,
        registrationNumber: true,
        updatedAt: true,
        rider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            hpaAgreementUrl: true,
            poaAgreementUrl: true,
          }
        },
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
        contract: {
          select: {
            id: true,
            signedDocumentUrl: true,
            ownerHpaUrl: true,
            ownerPoaUrl: true,
            updatedAt: true,
          }
        }
      }
    }),

    // 2. Fetch Users with docs who have NO vehicle assigned yet
    prisma.user.findMany({
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
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        hpaAgreementUrl: true,
        poaAgreementUrl: true,
        updatedAt: true,
        assignedTrip: { select: { id: true } },
        ownedVehicles: { select: { id: true } }
      }
    })
  ]);

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
