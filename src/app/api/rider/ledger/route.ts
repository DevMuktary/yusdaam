import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "RIDER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch Rider, Vehicle, Contract, and Payment History
    const rider = await prisma.user.findUnique({
      where: { email: session.user.email as string },
      include: {
        assignedTrip: {
          include: {
            contract: true,
            ledgers: { orderBy: { date: 'asc' } }
          }
        }
      }
    });

    // Safely extract variables to satisfy TypeScript's strict null checks
    const vehicle = rider?.assignedTrip;
    const contract = vehicle?.contract;

    // If no contract is active yet, return an empty ledger
    if (!rider || !vehicle || !contract) {
      return NextResponse.json({ ledger: [] }, { status: 200 });
    }
    
    // Only look at actual payments made by the rider
    const ledgers = vehicle.ledgers.filter((l: any) => l.type === "PAYMENT_COLLECTED");

    // Dynamic Calculation Logic
    const startDate = new Date(contract.createdAt); // TypeScript now knows this is safe
    const now = new Date();
    const msInWeek = 7 * 24 * 60 * 60 * 1000;

    let weeksPassed = Math.ceil((now.getTime() - startDate.getTime()) / msInWeek);
    if (weeksPassed === 0) weeksPassed = 1;

    const weeklyLedger = [];
    let cumulativeArrears = 0;

    for (let i = 1; i <= weeksPassed; i++) {
      const weekStart = new Date(startDate.getTime() + (i - 1) * msInWeek);
      const weekEnd = new Date(startDate.getTime() + i * msInWeek);

      // Sum all payments made within this 7-day window
      const paid = ledgers
        .filter((l: any) => {
          const d = new Date(l.date);
          return d >= weekStart && d < weekEnd;
        })
        .reduce((sum: number, l: any) => sum + l.amount, 0);

      const target = contract.weeklyRemittance;
      const shortfall = target - paid;
      cumulativeArrears += shortfall;

      // Determine Week Status
      let status = "PENDING";
      if (paid >= target && cumulativeArrears <= 0) status = "CLEARED";
      else if (paid > 0 && paid < target) status = "PARTIAL";
      else if (paid === 0 && weekEnd < now) status = "OVERDUE";
      else if (cumulativeArrears > 0 && weekEnd < now) status = "ARREARS";

      weeklyLedger.push({
        week: i,
        target,
        paid,
        arrears: cumulativeArrears > 0 ? cumulativeArrears : 0,
        status,
        date: weekEnd.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      });
    }

    // Reverse array to show the most recent week at the top of the table
    return NextResponse.json({ ledger: weeklyLedger.reverse() }, { status: 200 });
  } catch (error: any) {
    console.error("Ledger Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch ledger" }, { status: 500 });
  }
}
