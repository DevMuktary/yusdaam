import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { sendSystemEmail } from "@/lib/email/sender";
import { getPaymentCollectedEmail, getOwnerPayoutEmail } from "@/lib/email/templates";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // NEW: We now accept `cycleId` from the frontend dropdown to know exactly which week is being paid
    const { vehicleId, type, amount, description, receiptBase64, cycleId } = await req.json();

    if (!vehicleId || !type || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const numAmount = Number(amount);

    // 1. Get Vehicle Data to extract Owner and Rider
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        owner: true,
        rider: true
      }
    });

    if (!vehicle || !vehicle.ownerId) {
      return NextResponse.json({ error: "Vehicle or Owner not found" }, { status: 400 });
    }

    // Capture as non-null const so TypeScript narrows the type inside the transaction callback
    const ownerId = vehicle.ownerId;

    // 2. Generate Unique Transaction Ref (e.g., YUS-PAY-1234567)
    const reference = `YUS-${type === "PAYMENT_COLLECTED" ? "IN" : "OUT"}-${Math.floor(1000000 + Math.random() * 9000000)}`;

    // 3. SECURE DATABASE TRANSACTION: Create Ledger & Update Cycle simultaneously
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Create the Ledger Entry
      const ledger = await tx.ledger.create({
        data: {
          amount: numAmount,
          type,
          reference,
          description,
          receiptUrl: receiptBase64 || null,
          vehicleId,
          ownerId,
        }
      });

      // B. If it's an Owner Payout tied to a specific pending week, update the Cycle Tracking
      if (type === "OWNER_REMITTANCE" && cycleId) {
        const cycle = await tx.weeklyCycle.findUnique({ where: { id: cycleId } });
        
        if (!cycle) {
          throw new Error("The selected weekly cycle could not be found.");
        }

        const newRemittedAmount = (cycle.ownerRemittedAmount || 0) + numAmount;
        
        // Safety buffer of 0.01 to handle floating point decimal rounding
        const isSettled = newRemittedAmount >= (cycle.ownerExpectedAmount - 0.01);

        await tx.weeklyCycle.update({
          where: { id: cycleId },
          data: {
            ownerRemittedAmount: newRemittedAmount,
            isOwnerSettled: isSettled
          }
        });
      }

      return ledger;
    });

    // 4. Send Email Notifications
    const formattedAmount = numAmount.toLocaleString();
    const dateStr = new Date().toLocaleDateString('en-GB');

    if (type === "PAYMENT_COLLECTED" && vehicle.rider?.email) {
      await sendSystemEmail({
        toEmail: vehicle.rider.email,
        toName: vehicle.rider.firstName || "Rider",
        subject: `Payment Receipt: ${description}`,
        htmlBody: getPaymentCollectedEmail({
          firstName: vehicle.rider.firstName || "Rider",
          email: vehicle.rider.email,
          amount: formattedAmount,
          weekDescription: description,
          vehiclePlate: vehicle.registrationNumber,
          reference,
          date: dateStr
        })
      }).catch(err => console.error("Failed to email rider receipt:", err));
    }

    if (type === "OWNER_REMITTANCE" && vehicle.owner?.email) {
      await sendSystemEmail({
        toEmail: vehicle.owner.email,
        toName: vehicle.owner.firstName || "Asset Owner",
        subject: `Remittance Dispatched: ${description}`,
        htmlBody: getOwnerPayoutEmail({
          firstName: vehicle.owner.firstName || "Asset Owner",
          email: vehicle.owner.email,
          amount: formattedAmount,
          weekDescription: description,
          vehiclePlate: vehicle.registrationNumber,
          reference,
          date: dateStr
        })
      }).catch(err => console.error("Failed to email owner remittance:", err));
    }

    return NextResponse.json({ success: true, ledger: result });

  } catch (error: any) {
    console.error("Payment Processing Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process payment." }, { status: 500 });
  }
}
