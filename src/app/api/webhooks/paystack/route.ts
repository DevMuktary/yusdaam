import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY as string;

export async function POST(req: Request) {
  try {
    // 1. Get the raw body text and the Paystack signature header
    const bodyText = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature || !PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ error: "Missing signature or secret key" }, { status: 400 });
    }

    // 2. Cryptographically verify the event came from Paystack
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(bodyText)
      .digest("hex");

    if (hash !== signature) {
      console.error("🚨 Paystack Webhook: Invalid Signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 3. Parse the verified payload
    const event = JSON.parse(bodyText);

    // 4. We only care about successful charges (this includes Virtual Account transfers)
    if (event.event === "charge.success") {
      const data = event.data;
      const reference = data.reference;
      
      // Paystack sends amounts in Kobo. Convert to Naira.
      const amountInNaira = data.amount / 100; 
      const customerCode = data.customer?.customer_code;

      if (!customerCode) {
        return NextResponse.json({ message: "No customer code attached" }, { status: 200 });
      }

      // 5. Prevent Duplicate Processing (Paystack sometimes fires the same webhook twice)
      const existingLedger = await prisma.ledger.findUnique({
        where: { reference: reference }
      });

      if (existingLedger) {
        console.log(`✅ Webhook: Payment ${reference} already processed.`);
        return NextResponse.json({ message: "Already processed" }, { status: 200 });
      }

      // 6. Find the Rider using their Paystack Customer Code
      const rider = await prisma.user.findFirst({
        where: { paystackCustomerCode: customerCode },
        include: { assignedTrip: true } // Bring in their assigned vehicle
      });

      if (!rider || !rider.assignedTrip || !rider.assignedTrip.ownerId) {
        console.error("🚨 Webhook Error: Rider, Vehicle, or Owner not found for customer:", customerCode);
        // We still return 200 OK so Paystack doesn't keep retrying
        return NextResponse.json({ message: "Orphaned payment, logged in Paystack only" }, { status: 200 });
      }

      // 7. Write the Payment to the Ledger!
      await prisma.ledger.create({
        data: {
          amount: amountInNaira,
          type: "PAYMENT_COLLECTED", // Matches the ledger type we query in the dashboard
          reference: reference,
          description: `Virtual Account Transfer via ${data.channel || "Paystack"}`,
          vehicleId: rider.assignedTrip.id,
          ownerId: rider.assignedTrip.ownerId, 
        }
      });

      console.log(`💰 SUCCESS: Remittance of ₦${amountInNaira} recorded for Rider ${rider.firstName} ${rider.lastName}`);
    }

    // 8. Always return a 200 OK immediately so Paystack knows we received it
    return NextResponse.json({ status: "success" }, { status: 200 });

  } catch (error: any) {
    console.error("🚨 Paystack Webhook Critical Error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
