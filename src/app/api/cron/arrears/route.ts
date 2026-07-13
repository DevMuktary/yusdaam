import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendSystemEmail } from "@/lib/email/sender";
import { sendSms } from "@/lib/sms/termii"; 
import { startOfDay, endOfDay, subDays, addDays } from "date-fns";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  // Security protocol to ensure only cron-job.org or internal systems trigger this
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
      if (!contract.nextDueDate) continue; 

      const cycleStartDate = subDays(contract.nextDueDate, 7);
      
      // Calculate total funds collected during this SPECIFIC cycle only
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

      // --- 1. INDEPENDENT CAPPING MATH ---
      // Check historical billing for BOTH Rider and Owner
      const pastCycles = await prisma.weeklyCycle.aggregate({
        where: { contractId: contract.id },
        _sum: { expectedAmount: true, ownerExpectedAmount: true }
      });
      const cumulativeRiderBilled = pastCycles._sum.expectedAmount || 0;
      const cumulativeOwnerBilled = pastCycles._sum.ownerExpectedAmount || 0;

      let expectedAmount = contract.riderWeeklyRemittance;
      let ownerExpectedAmount = 0;

      // A. Cap Rider against System Grand Total
      if (cumulativeRiderBilled + expectedAmount > contract.systemGrandTotal) {
        expectedAmount = Math.max(0, contract.systemGrandTotal - cumulativeRiderBilled);
      }
      
      // B. Cap Owner against Total Hire Purchase Price (if they are still owed money)
      if (contract.currentWeek <= contract.ownerDurationWeeks) {
         ownerExpectedAmount = contract.ownerWeeklyPayout;
         if (cumulativeOwnerBilled + ownerExpectedAmount > contract.totalHirePurchasePrice) {
            ownerExpectedAmount = Math.max(0, contract.totalHirePurchasePrice - cumulativeOwnerBilled);
         }
      }
      
      // Calculate isolated week deficit based on the capped rider expected amount
      const shortfallAmount = Math.max(0, expectedAmount - totalPaid);
      const isSettled = shortfallAmount === 0;

      // --- 2. ISOLATED BILLING: UPDATE the pre-existing Weekly Cycle Record ---
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

      // Fetch the true total historical debt (including the cycle we just updated)
      const debtCheck = await prisma.weeklyCycle.aggregate({
        where: { contractId: contract.id, isSettled: false },
        _sum: { shortfallAmount: true }
      });
      const totalHistoricalDebt = debtCheck._sum.shortfallAmount || 0;

      // --- 3. ARREARS VERIFICATION & NOTIFICATION ---
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
          // Send Isolated Overdue SMS
          if (rider.phoneNumber) {
            const smsMessage = `URGENT: Dear ${rider.firstName}, your remittance of N${displayAmount.toLocaleString()} for Week ${contract.currentWeek} (${contract.vehicle.registrationNumber}) is OVERDUE. Kindly make payment immediately. - YUSDAAM`;
            await sendSms({ to: rider.phoneNumber, message: smsMessage })
              .catch(err => console.error("Overdue SMS failed:", err));
          }

          // Dispatch Isolated Overdue Notice via Email
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
                     <p>Your vehicle remittance for <strong>Week ${contract.currentWeek}</strong> was due today and remains incomplete.</p>
                     
                     <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0;">
                       <p style="margin: 0; font-size: 14px; color: #64748b;">Vehicle</p>
                       <p style="margin: 4px 0 16px 0; font-weight: bold; font-size: 16px;">${contract.vehicle.makeModel} (${contract.vehicle.registrationNumber})</p>
                       
                       <p style="margin: 0; font-size: 14px; color: #64748b;">Requested Payment</p>
                       <p style="margin: 4px 0 0 0; font-weight: bold; font-size: 16px; color: #ef4444;">₦${displayAmount.toLocaleString()}</p>
                     </div>
  
                     <p>This debt has been securely isolated and logged to your account. Please transfer this balance to your virtual account immediately to maintain good standing.</p>
                   </div>
                 </div>
               `
             });
          }
        }
      }

      // --- 4. TENURE & ROLLOVERS ---
      const newCumulativeBilled = cumulativeRiderBilled + expectedAmount;

      if (contract.currentWeek < contract.riderDurationWeeks && newCumulativeBilled < contract.systemGrandTotal) {
        const nextDate = addDays(contract.nextDueDate, 7);
        const nextWeekNumber = contract.currentWeek + 1;

        // 1. Update the contract
        await prisma.contract.update({
          where: { id: contract.id },
          data: { 
            currentWeek: nextWeekNumber,
            nextDueDate: nextDate 
          }
        });

        // 2. Create the fresh WeeklyCycle for the new week
        await prisma.weeklyCycle.create({
          data: {
            contractId: contract.id,
            weekNumber: nextWeekNumber,
            expectedAmount: contract.riderWeeklyRemittance, // Will be capped next week if needed
            amountPaid: 0,
            shortfallAmount: contract.riderWeeklyRemittance,
            ownerExpectedAmount: 0, // Gets calculated next run
            startDate: contract.nextDueDate, // Original due date serves as start of new week
            endDate: nextDate
          }
        });
      } else {
        if (totalHistoricalDebt <= 0) {
          await prisma.contract.update({
            where: { id: contract.id },
            data: { isActive: false, nextDueDate: null } 
          });
          console.log(`Contract ${contract.id} FULLY COMPLETED.`);
        } else {
          await prisma.contract.update({
            where: { id: contract.id },
            data: { nextDueDate: null } 
          });
          console.log(`Contract ${contract.id} entered RECOVERY MODE.`);

          const rider = contract.vehicle.rider;
          if (rider?.phoneNumber) {
            const recoverySms = `FINAL NOTICE: Dear ${rider.firstName}, your tenure for Vehicle ${contract.vehicle.registrationNumber} is complete, but you have an outstanding debt of N${totalHistoricalDebt.toLocaleString()}. Please pay immediately to finalize ownership. - YUSDAAM`;
            await sendSms({ to: rider.phoneNumber, message: recoverySms }).catch(e => console.error(e));
          }
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
