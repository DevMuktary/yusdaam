import { PrismaClient } from "@prisma/client";
import AssignmentClient from "./AssignmentClient";

const prisma = new PrismaClient();

export const metadata = {
  title: "Fleet Assignment | Yusdaam Admin",
};

export default async function AssignmentPage() {
  // Fetch available unassigned vehicles
  const availableVehicles = await prisma.vehicle.findMany({
    where: { status: "UNASSIGNED" },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch approved riders who do not currently have an assigned trip
  const availableRiders = await prisma.user.findMany({
    where: { 
      role: "RIDER", 
      accountStatus: "APPROVED",
      assignedTrip: null // Must not have a vehicle
    },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch approved asset owners
  const availableOwners = await prisma.user.findMany({
    where: { 
      role: "ASSET_OWNER", 
      accountStatus: { in: ["APPROVED", "ACTIVE"] } // Can be approved or already active with other assets
    },
    orderBy: { createdAt: 'desc' }
  });

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
