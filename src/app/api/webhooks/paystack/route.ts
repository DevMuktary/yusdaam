import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { sendSms } from "@/lib/sms/termii"; // <-- NEW IMPORT

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

      const rider = await prisma.user.findFirst({
        where: { paystackCustomerCode: customerCode },
        include: { assignedTrip: true } 
      });

      if (!rider || !rider.assignedTrip || !rider.assignedTrip.ownerId) {
        console.error("🚨 Webhook Error: Rider, Vehicle, or Owner not found for customer:", customerCode);
        return NextResponse.json({ message: "Orphaned payment, logged in Paystack only" }, { status: 200 });
      }

      // Write the Payment to the Ledger
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

      // --- NEW: SEND PAYMENT CONFIRMATION SMS ---
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
