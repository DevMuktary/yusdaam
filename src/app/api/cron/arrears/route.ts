import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { startOfDay, endOfDay, subDays, addDays } from "date-fns";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const today = new Date();
    
    // Find contracts whose due date falls within today
    const dueContracts = await prisma.contract.findMany({
      where: {
        isActive: true,
        nextDueDate: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        }
      },
      include: {
        vehicle: {
          include: { rider: true }
        }
      }
    });

    let processed = 0;

    for (const contract of dueContracts) {
      const cycleStartDate = subDays(contract.nextDueDate, 7);
      
      // Calculate total funds collected during this specific cycle
      const cyclePayments = await prisma.ledger.aggregate({
        where: {
          vehicleId: contract.vehicleId,
          type: "PAYMENT_COLLECTED",
          date: {
            gte: cycleStartDate,
            lte: contract.nextDueDate
          }
        },
        _sum: { amount: true }
      });

      const totalPaid = cyclePayments._sum.amount || 0;

      // Arrears Verification
      if (totalPaid < contract.riderWeeklyRemittance) {
        // Log the deficit and update account standing
        const deficit = contract.riderWeeklyRemittance - totalPaid;
        console.log(`Arrears Flagged: ${contract.vehicle.rider?.firstName} is short by ₦${deficit}`);
        
        if (contract.vehicle.rider) {
           await prisma.user.update({
             where: { id: contract.vehicle.rider.id },
             data: { accountStatus: "SUSPENDED" } // Or create an "ARREARS" enum
           });
           
           // A system email dispatch should be placed here regarding the suspension
        }
      }

      // Roll the billing cycle forward automatically
      await prisma.contract.update({
        where: { id: contract.id },
        data: { nextDueDate: addDays(contract.nextDueDate, 7) }
      });

      processed++;
    }

    return NextResponse.json({ success: true, cyclesProcessed: processed });

  } catch (error) {
    console.error("Arrears Engine Error:", error);
    return NextResponse.json({ error: "Engine execution failed" }, { status: 500 });
  }
}
