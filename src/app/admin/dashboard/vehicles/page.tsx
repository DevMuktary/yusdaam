import { PrismaClient } from "@prisma/client";
import VehiclesClient from "./VehiclesClient";

const prisma = new PrismaClient();

export const metadata = {
  title: "Vehicle Inventory | Yusdaam Admin",
};

export default async function VehiclesPage() {
  // Fetch all vehicles, including the names of the assigned owner and rider if they exist
  const vehicles = await prisma.vehicle.findMany({
    include: {
      owner: { select: { firstName: true, lastName: true } },
      rider: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-light">Fleet Inventory</h1>
        <p className="text-sm text-gray-400">Manage your physical assets, add new vehicles, and check their status.</p>
      </div>

      <VehiclesClient vehicles={vehicles} />
    </div>
  );
}
