import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Reconciles all active and historical contracts so that:
 * 1. The sum of all rider weekly cycle expected amounts equals exactly (systemGrandTotal - downPayment).
 * 2. The sum of all owner weekly payouts equals exactly totalHirePurchasePrice.
 * 3. Any over-scheduled amounts on final weeks (e.g. 85th week with 40k instead of 20k) are capped to the exact remainder.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contracts = await prisma.contract.findMany({
      include: {
        weeklyCycles: {
          orderBy: { weekNumber: "asc" }
        },
        vehicle: {
          select: { registrationNumber: true, makeModel: true }
        },
        owner: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    });

    const reconciledResults = [];

    for (const contract of contracts) {
      const targetRiderTotal = Math.max(
        0,
        (Number(contract.systemGrandTotal) || Number(contract.totalHirePurchasePrice)) - (Number(contract.downPayment) || 0)
      );
      const targetOwnerTotal = Number(contract.totalHirePurchasePrice);
      const rWeekly = Number(contract.riderWeeklyRemittance);
      const oWeekly = Number(contract.ownerWeeklyPayout);

      let riderCumul = 0;
      let ownerCumul = 0;
      let cyclesUpdatedCount = 0;
      const modifiedCyclesInfo = [];

      for (const cycle of contract.weeklyCycles) {
        // --- 1. RIDER RECONCILIATION ---
        let expectedRiderAmt = 0;
        if (riderCumul < targetRiderTotal) {
          const remainingRiderBalance = targetRiderTotal - riderCumul;
          expectedRiderAmt = Math.min(rWeekly, remainingRiderBalance);
          riderCumul += expectedRiderAmt;
        }

        // --- 2. OWNER RECONCILIATION ---
        let expectedOwnerAmt = 0;
        if (cycle.weekNumber <= contract.ownerDurationWeeks && ownerCumul < targetOwnerTotal) {
          const remainingOwnerBalance = targetOwnerTotal - ownerCumul;
          expectedOwnerAmt = Math.min(oWeekly, remainingOwnerBalance);
          ownerCumul += expectedOwnerAmt;
        }

        const needsRiderUpdate = cycle.expectedAmount !== expectedRiderAmt;
        const needsOwnerUpdate = cycle.ownerExpectedAmount !== expectedOwnerAmt;

        if (needsRiderUpdate || needsOwnerUpdate) {
          const newShortfall = Math.max(0, expectedRiderAmt - cycle.amountPaid);
          const isSettled = cycle.amountPaid >= expectedRiderAmt;
          const isOwnerSettled = cycle.ownerRemittedAmount >= expectedOwnerAmt;

          await prisma.weeklyCycle.update({
            where: { id: cycle.id },
            data: {
              expectedAmount: expectedRiderAmt,
              shortfallAmount: newShortfall,
              isSettled,
              ownerExpectedAmount: expectedOwnerAmt,
              isOwnerSettled,
            }
          });

          cyclesUpdatedCount++;
          modifiedCyclesInfo.push({
            weekNumber: cycle.weekNumber,
            oldExpected: cycle.expectedAmount,
            newExpected: expectedRiderAmt,
            oldOwnerExpected: cycle.ownerExpectedAmount,
            newOwnerExpected: expectedOwnerAmt
          });
        }
      }

      if (cyclesUpdatedCount > 0) {
        reconciledResults.push({
          contractId: contract.id,
          plateNumber: contract.vehicle?.registrationNumber || "Unassigned",
          vehicle: contract.vehicle?.makeModel,
          targetRiderTotal,
          targetOwnerTotal,
          cyclesUpdatedCount,
          modifiedCycles: modifiedCyclesInfo
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Audit & Reconciliation complete. Reconciled ${reconciledResults.length} contracts.`,
      reconciledCount: reconciledResults.length,
      contracts: reconciledResults
    });
  } catch (error: any) {
    console.error("Contract Cycles Reconciliation Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to reconcile contract cycles" },
      { status: 500 }
    );
  }
}
