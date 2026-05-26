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

      // --- 1. THE SYSTEM GRAND TOTAL CAP MATH ---
      // Check how much has been billed historically across all previous cycles
      const pastCycles = await prisma.weeklyCycle.aggregate({
        where: { contractId: contract.id },
        _sum: { expectedAmount: true }
      });
      const cumulativeBilled = pastCycles._sum.expectedAmount || 0;

      // Start with the normal weekly targets
      let expectedAmount = contract.riderWeeklyRemittance;
      let ownerExpectedAmount = contract.ownerWeeklyPayout;

      // If charging the normal amount pushes them over the grand total, cap it to the exact remainder
      if (cumulativeBilled + expectedAmount > contract.systemGrandTotal) {
        expectedAmount = Math.max(0, contract.systemGrandTotal - cumulativeBilled);
        
        // For the fractional week, Owner gets the remainder MINUS Yusdaam's Service Fee
        ownerExpectedAmount = Math.max(0, expectedAmount - contract.weeklyServiceFee);
      }
      
      // Calculate isolated week deficit based on the CAPPED expected amount
      const shortfallAmount = Math.max(0, expectedAmount - totalPaid);
      const isSettled = shortfallAmount === 0;

      // --- 2. ISOLATED BILLING: Create the Weekly Cycle Record ---
      await prisma.weeklyCycle.create({
        data: {
          contractId: contract.id,
          weekNumber: contract.currentWeek,
          expectedAmount: expectedAmount,
          amountPaid: totalPaid,
          shortfallAmount: shortfallAmount,
          isSettled: isSettled,
          
          // --- NEW: OWNER PAYOUT TRACKING ---
          ownerExpectedAmount: ownerExpectedAmount,
          ownerRemittedAmount: 0, // Admin hasn't paid them yet
          isOwnerSettled: false,  // Starts false

          startDate: cycleStartDate,
          endDate: contract.nextDueDate
        }
      });

      // Fetch the true total historical debt (including the cycle we just created)
      const debtCheck = await prisma.weeklyCycle.aggregate({
        where: { contractId: contract.id, isSettled: false },
        _sum: { shortfallAmount: true }
      });
      const totalHistoricalDebt = debtCheck._sum.shortfallAmount || 0;

      // --- 3. ARREARS VERIFICATION & NOTIFICATION ---
      if (shortfallAmount > 0) {
        
        // INTELLIGENT MESSAGE AMOUNT: 
        // If they owe massive debt, ask for the normal weekly amount to force them to catch up.
        // If their total debt is somehow less than the normal amount, just ask for the exact total debt.
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
      const newCumulativeBilled = cumulativeBilled + expectedAmount;

      // We only roll forward if we haven't hit the week limit AND we haven't maxed out the Grand Total
      if (contract.currentWeek < contract.riderDurationWeeks && newCumulativeBilled < contract.systemGrandTotal) {
        
        // Normal Continuation: Move to the next week
        await prisma.contract.update({
          where: { id: contract.id },
          data: { 
            currentWeek: contract.currentWeek + 1,
            nextDueDate: addDays(contract.nextDueDate, 7) 
          }
        });

      } else {
        
        // End of Tenure Reached! Check if they owe historical debt
        if (totalHistoricalDebt <= 0) {
          // Success: No debt, mark as totally completed
          await prisma.contract.update({
            where: { id: contract.id },
            data: { isActive: false, nextDueDate: null } 
          });
          console.log(`Contract ${contract.id} FULLY COMPLETED.`);
        } else {
          // Recovery Mode: Stop weekly billing, but keep contract active so Paystack Waterfall still works
          await prisma.contract.update({
            where: { id: contract.id },
            data: { nextDueDate: null } 
          });
          console.log(`Contract ${contract.id} entered RECOVERY MODE.`);

          // Send the specific Recovery Entrance message
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
