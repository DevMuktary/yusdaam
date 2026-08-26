import { prisma } from "@/lib/prisma";
import PaymentsClient from "./PaymentsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Process Payments | Yusdaam Admin",
};

export default async function PaymentsPage() {
  // Fetch active fleet assignments and pending weekly cycles concurrently in parallel
  const [activeAssignments, pendingCycles] = await Promise.all([
    // 1. Fetch only ACTIVE deployments with targeted fields
    prisma.vehicle.findMany({
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
    }),

    // 2. Fetch only pending weekly cycles for active fleet with lightweight projections
    prisma.weeklyCycle.findMany({
      where: {
        contract: {
          vehicle: { status: "ACTIVE" }
        },
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
        startDate: true,
        endDate: true,
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
  ]);

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
