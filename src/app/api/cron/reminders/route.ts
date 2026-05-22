import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendSystemEmail } from "@/lib/email/sender";
import { sendSms } from "@/lib/sms/termii"; // <-- NEW IMPORT
import { addDays, startOfDay, endOfDay, format } from "date-fns";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    // CHANGED: Target exactly 1 day from now to match the "tomorrow" SMS text
    const targetDate = addDays(new Date(), 1);

    const upcomingContracts = await prisma.contract.findMany({
      where: {
        isActive: true,
        nextDueDate: {
          gte: startOfDay(targetDate),
          lte: endOfDay(targetDate),
        }
      },
      include: {
        vehicle: {
          include: { rider: true }
        }
      }
    });

    for (const contract of upcomingContracts) {
      if (!contract.nextDueDate) continue;

      const rider = contract.vehicle.rider;
      if (!rider) continue;

      // --- NEW: SEND REMINDER SMS ---
      if (rider.phoneNumber) {
        const smsMessage = `Dear ${rider.firstName}, a friendly reminder that your weekly remittance of N${contract.riderWeeklyRemittance.toLocaleString()} for vehicle ${contract.vehicle.registrationNumber} is due tomorrow. Please pay on time to avoid penalties. - YUSDAAM`;
        
        await sendSms({ to: rider.phoneNumber, message: smsMessage })
          .catch(err => console.error("Reminder SMS failed:", err));
      }

      // Dispatch the structured operational notice via Email
      if (rider.email) {
        await sendSystemEmail({
          toEmail: rider.email,
          toName: `${rider.firstName} ${rider.lastName}`,
          subject: "Upcoming Remittance Schedule: Action Required",
          htmlBody: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #001232; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #001232; padding: 24px; text-align: center;">
                <h2 style="color: #FFB902; margin: 0;">Remittance Notice</h2>
              </div>
              <div style="padding: 32px; background-color: #ffffff;">
                <p>Dear ${rider.firstName},</p>
                <p>This is a formal notification regarding your upcoming weekly vehicle remittance to ensure uninterrupted account standing.</p>
                
                <div style="background-color: #f8fafc; border-left: 4px solid #FFB902; padding: 16px; margin: 24px 0;">
                  <p style="margin: 0; font-size: 14px; color: #64748b;">Vehicle</p>
                  <p style="margin: 4px 0 16px 0; font-weight: bold; font-size: 16px;">${contract.vehicle.makeModel} (${contract.vehicle.registrationNumber})</p>
                  
                  <p style="margin: 0; font-size: 14px; color: #64748b;">Amount Due</p>
                  <p style="margin: 4px 0 16px 0; font-weight: bold; font-size: 16px;">₦${contract.riderWeeklyRemittance.toLocaleString()}</p>
                  
                  <p style="margin: 0; font-size: 14px; color: #64748b;">Due Date</p>
                  <p style="margin: 4px 0 0 0; font-weight: bold; font-size: 16px;">${format(contract.nextDueDate, 'PPP')}</p>
                </div>

                <p>Please ensure funds are transferred to your dedicated virtual account prior to the cycle cutoff.</p>
              </div>
            </div>
          `
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      noticesDispatched: upcomingContracts.length 
    });

  } catch (error) {
    console.error("Remittance Notice Engine Error:", error);
    return NextResponse.json({ error: "Engine execution failed" }, { status: 500 });
  }
}
