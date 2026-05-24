import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { sendSms } from "@/lib/sms/termii"; 

const prisma = new PrismaClient();
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY as string;

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature || !PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ error: "Missing signature or secret key" }, { status: 400 });
    }

    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(bodyText)
      .digest("hex");

    if (hash !== signature) {
      console.error("🚨 Paystack Webhook: Invalid Signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(bodyText);

    if (event.event === "charge.success") {
      const data = event.data;
      const reference = data.reference;
      
      const amountInNaira = data.amount / 100; 
      const customerCode = data.customer?.customer_code;

      if (!customerCode) {
        return NextResponse.json({ message: "No customer code attached" }, { status: 200 });
      }

      const existingLedger = await prisma.ledger.findUnique({
        where: { reference: reference }
      });

      if (existingLedger) {
        return NextResponse.json({ message: "Already processed" }, { status: 200 });
      }

      // 1. Fetch Rider with their Vehicle AND Contract details
      const rider = await prisma.user.findFirst({
        where: { paystackCustomerCode: customerCode },
        include: { 
          assignedTrip: {
            include: { contract: true }
          } 
        } 
      });

      if (!rider || !rider.assignedTrip || !rider.assignedTrip.ownerId) {
        console.error("🚨 Webhook Error: Rider, Vehicle, or Owner not found for customer:", customerCode);
        return NextResponse.json({ message: "Orphaned payment, logged in Paystack only" }, { status: 200 });
      }

      const contract = rider.assignedTrip.contract;

      // 2. Write the Standard Payment to the Ledger
      await prisma.ledger.create({
        data: {
          amount: amountInNaira,
          type: "PAYMENT_COLLECTED", 
          reference: reference,
          description: `Virtual Account Transfer via ${data.channel || "Paystack"}`,
          vehicleId: rider.assignedTrip.id,
          ownerId: rider.assignedTrip.ownerId, 
        }
      });

      console.log(`💰 SUCCESS: Remittance of ₦${amountInNaira} recorded for Rider ${rider.firstName} ${rider.lastName}`);

      // 3. --- NEW: WATERFALL DEBT CLEARANCE LOGIC ---
      // Trigger ONLY if contract is in RECOVERY MODE (Tenure is over, nextDueDate is null, but still active)
      if (contract && contract.isActive && contract.nextDueDate === null) {
        let remainingBalanceToApply = amountInNaira;

        // Fetch all unsettled debts, oldest weeks first
        const unsettledCycles = await prisma.weeklyCycle.findMany({
          where: { contractId: contract.id, isSettled: false },
          orderBy: { weekNumber: 'asc' }
        });

        for (const cycle of unsettledCycles) {
          if (remainingBalanceToApply <= 0) break; // Out of money to apply

          const amountToApply = Math.min(remainingBalanceToApply, cycle.shortfallAmount);
          const newShortfall = cycle.shortfallAmount - amountToApply;
          const newAmountPaid = cycle.amountPaid + amountToApply;

          // Update the specific week's cycle
          await prisma.weeklyCycle.update({
            where: { id: cycle.id },
            data: {
              shortfallAmount: newShortfall,
              amountPaid: newAmountPaid,
              isSettled: newShortfall <= 0.01 // Safety buffer for floating point decimals
            }
          });

          console.log(`💧 Waterfall: Applied ₦${amountToApply} to clear debt for Week ${cycle.weekNumber}`);
          remainingBalanceToApply -= amountToApply;
        }

        // After waterfall, check if ALL debts are now completely cleared
        const remainingDebts = await prisma.weeklyCycle.count({
          where: { contractId: contract.id, isSettled: false }
        });

        if (remainingDebts === 0) {
          await prisma.contract.update({
            where: { id: contract.id },
            data: { isActive: false } // Mark contract as fully completed!
          });
          console.log(`🏆 Contract ${contract.id} FULLY SETTLED via Waterfall! Marked Inactive.`);
        }
      }

      // 4. Send Payment Confirmation SMS
      if (rider.phoneNumber) {
        const smsMessage = `Dear ${rider.firstName}, Payment Confirmed! We have received your weekly remittance of N${amountInNaira.toLocaleString()} for Vehicle ${rider.assignedTrip.registrationNumber}. Your ledger is now updated. Thank you, YUSDAAM LIMITED.`;
        
        // Fire and forget (don't await so it doesn't block the webhook response)
        sendSms({ to: rider.phoneNumber, message: smsMessage })
          .then(res => console.log(`SMS Sent: ${res.success}`))
          .catch(err => console.error("SMS failed to send:", err));
      }
    }

    return NextResponse.json({ status: "success" }, { status: 200 });

  } catch (error: any) {
    console.error("🚨 Paystack Webhook Critical Error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
