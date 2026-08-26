import { prisma } from "@/lib/prisma";
import AssignmentClient from "./AssignmentClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Fleet Assignment | Yusdaam Admin",
};

export default async function AssignmentPage() {
  // Fetch available unassigned vehicles, riders, and owners in parallel
  const [availableVehicles, availableRiders, availableOwners] = await Promise.all([
    // 1. Fetch available unassigned vehicles
    prisma.vehicle.findMany({
      where: { status: "UNASSIGNED" },
      select: { id: true, registrationNumber: true, makeModel: true, type: true, customType: true },
      orderBy: { createdAt: 'desc' }
    }),

    // 2. Fetch approved riders without active vehicles
    prisma.user.findMany({
      where: { 
        role: "RIDER", 
        accountStatus: "APPROVED",
        assignedTrip: null
      },
      select: { id: true, firstName: true, lastName: true, phoneNumber: true },
      orderBy: { createdAt: 'desc' }
    }),

    // 3. Fetch approved asset owners
    prisma.user.findMany({
      where: { 
        role: "ASSET_OWNER", 
        accountStatus: { in: ["APPROVED", "ACTIVE"] }
      },
      select: { id: true, firstName: true, lastName: true, preferredAssetClass: true },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-light">Fleet Matchmaking & Assignment</h1>
        <p className="text-sm text-gray-400">Pair unassigned vehicles with approved riders and asset owners, and define financial terms.</p>
      </div>

      <AssignmentClient 
        vehicles={availableVehicles} 
        riders={availableRiders} 
        owners={availableOwners} 
      />
    </div>
  );
}
