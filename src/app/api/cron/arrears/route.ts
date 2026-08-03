import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendSystemEmail } from "@/lib/email/sender";
import { sendSms } from "@/lib/sms/termii"; 
import { endOfDay, addDays } from "date-fns";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const today = new Date();
    
    // Find all active contracts that have hit their due date
    const dueContracts = await prisma.contract.findMany({
      where: {
        isActive: true,
        nextDueDate: { lte: endOfDay(today) }
      },
      include: {
        vehicle: { include: { rider: true } }
      }
    });

    let processed = 0;

    for (const contract of dueContracts) {
      if (!contract.nextDueDate) continue; 

      // 1. Fetch the EXACT Weekly Cycle record for the current week
      const currentCycle = await prisma.weeklyCycle.findFirst({
        where: { contractId: contract.id, weekNumber: contract.currentWeek }
      });

      if (!currentCycle) continue;

      // 2. THE FIX: Trust the admin payment route! 
      // Do NOT aggregate ledgers by date. Just use the amount the admin already logged into this cycle.
      const totalPaid = currentCycle.amountPaid || 0;

      // 3. Calculate historical billing to apply absolute caps
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
      
      // Calculate shortfall based on the new capped expected amount
      const shortfallAmount = Math.max(0, expectedAmount - totalPaid);
      const isSettled = shortfallAmount <= 0.01;

      // 4. Finalize the Current Cycle
      await prisma.weeklyCycle.update({
        where: { id: currentCycle.id },
        data: {
          shortfallAmount: shortfallAmount,
          isSettled: isSettled,
          ownerExpectedAmount: ownerExpectedAmount 
        }
      });

      // 5. Check if the Rider is in Arrears
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
               htmlBody: `
                 <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #001232; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                   <div style="background-color: #ef4444; padding: 24px; text-align: center;">
                     <h2 style="color: #ffffff; margin: 0;">Payment Overdue</h2>
                   </div>
                   <div style="padding: 32px; background-color: #ffffff;">
                     <p>Dear ${rider.firstName},</p>
                     <p>Your vehicle remittance for Week ${contract.currentWeek} has not been fully settled and is now overdue.</p>
                     <p style="font-size: 20px; font-weight: bold; color: #ef4444;">Pending Amount: ₦${displayAmount.toLocaleString()}</p>
                     <p>Please fund your account immediately to prevent immobilization of your vehicle.</p>
                   </div>
                 </div>
               `
             }).catch(err => console.error(err));
          }
        }
      }

      // 6. Roll over Contract Dates
      const newCumulativeBilled = cumulativeRiderBilled + expectedAmount;

      if (contract.currentWeek < contract.riderDurationWeeks && newCumulativeBilled < contract.systemGrandTotal) {
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
