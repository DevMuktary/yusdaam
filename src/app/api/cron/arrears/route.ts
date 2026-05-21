import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendSystemEmail } from "@/lib/email/sender";
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
      // TypeScript fix: Guarantee nextDueDate is a valid Date object before calculating
      if (!contract.nextDueDate) continue; 

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
        const deficit = contract.riderWeeklyRemittance - totalPaid;
        console.log(`Arrears Flagged: ${contract.vehicle.rider?.firstName} is short by ₦${deficit}`);
        
        const rider = contract.vehicle.rider;
        
        // Dispatch Overdue Notice instead of suspending the account
        if (rider && rider.email) {
           await sendSystemEmail({
             toEmail: rider.email,
             toName: `${rider.firstName} ${rider.lastName}`,
             subject: "URGENT: Weekly Remittance Overdue",
             htmlBody: `
               <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #001232; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                 <div style="background-color: #ef4444; padding: 24px; text-align: center;">
                   <h2 style="color: #ffffff; margin: 0;">Payment Overdue</h2>
                 </div>
                 <div style="padding: 32px; background-color: #ffffff;">
                   <p>Dear ${rider.firstName},</p>
                   <p>Your weekly vehicle remittance was due today and remains incomplete.</p>
                   
                   <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0;">
                     <p style="margin: 0; font-size: 14px; color: #64748b;">Vehicle</p>
                     <p style="margin: 4px 0 16px 0; font-weight: bold; font-size: 16px;">${contract.vehicle.makeModel} (${contract.vehicle.registrationNumber})</p>
                     
                     <p style="margin: 0; font-size: 14px; color: #64748b;">Outstanding Deficit</p>
                     <p style="margin: 4px 0 0 0; font-weight: bold; font-size: 16px; color: #ef4444;">₦${deficit.toLocaleString()}</p>
                   </div>

                   <p>Please log in to your dashboard to view your virtual account details and clear this balance immediately to maintain your account in good standing.</p>
                 </div>
               </div>
             `
           });
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
