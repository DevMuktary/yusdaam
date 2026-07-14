import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendSystemEmail } from "@/lib/email/sender";
import { sendSms } from "@/lib/sms/termii"; 
import { startOfDay, endOfDay, subDays, addDays } from "date-fns";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const today = new Date();
    
    // THE FIX: This ensures it catches up on missed days without getting stuck
    const dueContracts = await prisma.contract.findMany({
      where: {
        isActive: true,
        nextDueDate: {
          lte: endOfDay(today), // Catch up on any missed days/weeks
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
      if (!contract.nextDueDate) continue; 

      const cycleStartDate = subDays(contract.nextDueDate, 7);
      
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

      const pastCycles = await prisma.weeklyCycle.aggregate({
        where: { contractId: contract.id },
        _sum: { expectedAmount: true, ownerExpectedAmount: true }
      });
      const cumulativeRiderBilled = pastCycles._sum.expectedAmount || 0;
      const cumulativeOwnerBilled = pastCycles._sum.ownerExpectedAmount || 0;

      let expectedAmount = contract.riderWeeklyRemittance;
      let ownerExpectedAmount = 0;

      if (cumulativeRiderBilled + expectedAmount > contract.systemGrandTotal) {
        expectedAmount = Math.max(0, contract.systemGrandTotal - cumulativeRiderBilled);
      }
      
      if (contract.currentWeek <= contract.ownerDurationWeeks) {
         ownerExpectedAmount = contract.ownerWeeklyPayout;
         if (cumulativeOwnerBilled + ownerExpectedAmount > contract.totalHirePurchasePrice) {
            ownerExpectedAmount = Math.max(0, contract.totalHirePurchasePrice - cumulativeOwnerBilled);
         }
      }
      
      const shortfallAmount = Math.max(0, expectedAmount - totalPaid);
      const isSettled = shortfallAmount === 0;

      // Update the PRE-EXISTING Weekly Cycle Record
      await prisma.weeklyCycle.updateMany({
        where: {
          contractId: contract.id,
          weekNumber: contract.currentWeek
        },
        data: {
          amountPaid: totalPaid,
          shortfallAmount: shortfallAmount,
          isSettled: isSettled,
          ownerExpectedAmount: ownerExpectedAmount 
        }
      });

      const debtCheck = await prisma.weeklyCycle.aggregate({
        where: { contractId: contract.id, isSettled: false },
        _sum: { shortfallAmount: true }
      });
      const totalHistoricalDebt = debtCheck._sum.shortfallAmount || 0;

      if (shortfallAmount > 0) {
        let displayAmount = shortfallAmount;
        if (totalHistoricalDebt >= contract.riderWeeklyRemittance) {
          displayAmount = contract.riderWeeklyRemittance;
        } else if (totalHistoricalDebt > shortfallAmount) {
          displayAmount = totalHistoricalDebt;
        }

        console.log(`Arrears Flagged: ${contract.vehicle.rider?.firstName} is short. Requesting ₦${displayAmount}`);
        
        const rider = contract.vehicle.rider;
        
        if (rider) {
          if (rider.phoneNumber) {
            const smsMessage = `URGENT: Dear ${rider.firstName}, your remittance of N${displayAmount.toLocaleString()} for Week ${contract.currentWeek} (${contract.vehicle.registrationNumber}) is OVERDUE. Kindly make payment immediately. - YUSDAAM`;
            await sendSms({ to: rider.phoneNumber, message: smsMessage }).catch(err => console.error(err));
          }

          if (rider.email) {
             await sendSystemEmail({
               toEmail: rider.email,
               toName: `${rider.firstName} ${rider.lastName}`,
               subject: `URGENT: Week ${contract.currentWeek} Remittance Overdue`,
               htmlBody: `<p>Dear ${rider.firstName}, your payment is overdue...</p>` // Keep your original HTML here
             });
          }
        }
      }

      const newCumulativeBilled = cumulativeRiderBilled + expectedAmount;

      if (contract.currentWeek < contract.riderDurationWeeks && newCumulativeBilled < contract.systemGrandTotal) {
        // ONLY roll over the contract dates. DO NOT create a new cycle since they are pre-drafted!
        await prisma.contract.update({
          where: { id: contract.id },
          data: { 
            currentWeek: contract.currentWeek + 1,
            nextDueDate: addDays(contract.nextDueDate, 7) 
          }
        });
      } else {
        if (totalHistoricalDebt <= 0) {
          await prisma.contract.update({
            where: { id: contract.id },
            data: { isActive: false, nextDueDate: null } 
          });
        } else {
          await prisma.contract.update({
            where: { id: contract.id },
            data: { nextDueDate: null } 
          });
        }
      }

      processed++;
    }

    return NextResponse.json({ success: true, cyclesProcessed: processed });

  } catch (error) {
    console.error("Arrears Engine Error:", error);
    return NextResponse.json({ error: "Engine execution failed" }, { status: 500 });
  }
}
