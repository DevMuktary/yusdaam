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
      const expectedAmount = contract.riderWeeklyRemittance;
      
      // Calculate isolated week deficit
      const shortfallAmount = Math.max(0, expectedAmount - totalPaid);
      const isSettled = shortfallAmount === 0;

      // 1. ISOLATED BILLING: Create the Weekly Cycle Record
      await prisma.weeklyCycle.create({
        data: {
          contractId: contract.id,
          weekNumber: contract.currentWeek,
          expectedAmount: expectedAmount,
          amountPaid: totalPaid,
          shortfallAmount: shortfallAmount,
          isSettled: isSettled,
          startDate: cycleStartDate,
          endDate: contract.nextDueDate
        }
      });

      // 2. Arrears Verification & Notification
      if (shortfallAmount > 0) {
        console.log(`Arrears Flagged: ${contract.vehicle.rider?.firstName} is short by ₦${shortfallAmount} for Week ${contract.currentWeek}`);
        
        const rider = contract.vehicle.rider;
        
        if (rider) {
          // Send Isolated Overdue SMS
          if (rider.phoneNumber) {
            const smsMessage = `URGENT: Dear ${rider.firstName}, your remittance of N${shortfallAmount.toLocaleString()} for Week ${contract.currentWeek} (${contract.vehicle.registrationNumber}) is OVERDUE. Kindly make payment immediately. - YUSDAAM`;
            
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
                       
                       <p style="margin: 0; font-size: 14px; color: #64748b;">Week ${contract.currentWeek} Deficit</p>
                       <p style="margin: 4px 0 0 0; font-weight: bold; font-size: 16px; color: #ef4444;">₦${shortfallAmount.toLocaleString()}</p>
                     </div>
  
                     <p>This debt has been securely isolated and logged to your account. Please transfer this exact balance to your virtual account immediately to maintain good standing.</p>
                   </div>
                 </div>
               `
             });
          }
        }
      }

      // 3. TENURE & ROLLOVERS
      if (contract.currentWeek < contract.riderDurationWeeks) {
        // Normal Continuation: Move to the next week
        await prisma.contract.update({
          where: { id: contract.id },
          data: { 
            currentWeek: contract.currentWeek + 1,
            nextDueDate: addDays(contract.nextDueDate, 7) 
          }
        });
      } else {
        // End of Tenure Reached: Check if they owe historical debt
        const hasUnsettledDebt = await prisma.weeklyCycle.findFirst({
          where: { contractId: contract.id, isSettled: false }
        });

        if (!hasUnsettledDebt) {
          // Success: No debt, mark as totally completed
          await prisma.contract.update({
            where: { id: contract.id },
            data: { isActive: false, nextDueDate: null } 
          });
          console.log(`Contract ${contract.id} FULLY COMPLETED.`);
        } else {
          // Recovery Mode: Stop weekly billing, but keep contract active so payments still catch
          await prisma.contract.update({
            where: { id: contract.id },
            data: { nextDueDate: null } 
          });
          console.log(`Contract ${contract.id} entered RECOVERY MODE.`);
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
