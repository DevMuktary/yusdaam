import { PrismaClient } from "@prisma/client";
import PaymentsClient from "./PaymentsClient";

const prisma = new PrismaClient();

export const metadata = {
  title: "Process Payments | Yusdaam Admin",
};

export default async function PaymentsPage() {
  // Fetch only ACTIVE vehicles (because they have an active contract, rider, and owner)
  const activeAssignments = await prisma.vehicle.findMany({
    where: { status: "ACTIVE" },
    include: {
      contract: true,
      owner: { select: { id: true, firstName: true, lastName: true, email: true, bankName: true, accountNumber: true } },
      rider: { select: { id: true, firstName: true, lastName: true, email: true } },
    }
  });

  // Fetch pending weekly cycles for owners to populate the payout dropdown
  const pendingCycles = await prisma.weeklyCycle.findMany({
    where: {
      isOwnerSettled: false,
      ownerExpectedAmount: { gt: 0 }
    },
    include: {
      contract: true // Client needs this to match c.contract.vehicleId === selectedVehicleId
    },
    orderBy: {
      weekNumber: 'asc'
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-light">Process Payments & Payouts</h1>
        <p className="text-sm text-gray-400">Log manual remittances, upload receipts, and notify users.</p>
      </div>

      {/* Pass both assignments and the fetched cycles to the client component */}
      <PaymentsClient assignments={activeAssignments} cycles={pendingCycles} />
    </div>
  );
}
