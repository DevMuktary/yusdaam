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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-light">Process Payments & Payouts</h1>
        <p className="text-sm text-gray-400">Log manual remittances, upload receipts, and notify users.</p>
      </div>

      <PaymentsClient assignments={activeAssignments} />
    </div>
  );
}
