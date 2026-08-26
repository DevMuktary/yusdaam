import { prisma } from "@/lib/prisma";
import PaymentsClient from "./PaymentsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Process Payments | Yusdaam Admin",
};

export default async function PaymentsPage() {
  // 1. Fetch only ACTIVE deployments with targeted fields
  const activeAssignments = await prisma.vehicle.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      registrationNumber: true,
      makeModel: true,
      type: true,
      customType: true,
      contract: {
        select: {
          id: true,
          riderWeeklyRemittance: true,
          ownerWeeklyPayout: true,
          riderDurationWeeks: true,
          ownerDurationWeeks: true,
          currentWeek: true,
        }
      },
      owner: { 
        select: { 
          id: true, 
          firstName: true, 
          lastName: true, 
          email: true, 
          phoneNumber: true,
          bankName: true, 
          accountNumber: true,
          accountName: true 
        } 
      },
      rider: { 
        select: { 
          id: true, 
          firstName: true, 
          lastName: true, 
          email: true,
          phoneNumber: true 
        } 
      },
    },
    orderBy: { createdAt: 'desc' }
  });

  const contractIds = activeAssignments
    .map(a => a.contract?.id)
    .filter((id): id is string => typeof id === "string");

  // 2. Fetch pending weekly cycles for active contracts directly by contractId (instant indexed query)
  const pendingCycles = contractIds.length > 0
    ? await prisma.weeklyCycle.findMany({
        where: {
          contractId: { in: contractIds },
          OR: [
            { isSettled: false },
            { isOwnerSettled: false, ownerExpectedAmount: { gt: 0 } }
          ]
        },
        select: {
          id: true,
          contractId: true,
          weekNumber: true,
          expectedAmount: true,
          amountPaid: true,
          shortfallAmount: true,
          isSettled: true,
          ownerExpectedAmount: true,
          ownerRemittedAmount: true,
          isOwnerSettled: true,
          contract: {
            select: {
              vehicleId: true
            }
          }
        },
        orderBy: {
          weekNumber: 'asc'
        }
      })
    : [];

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
