import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendSystemEmail } from "@/lib/email/sender";
import { getPaymentCollectedEmail, getOwnerPayoutEmail } from "@/lib/email/templates";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { vehicleId, type, amount, description, receiptBase64, cycleId } = body;

    if (!vehicleId || !type || !amount || !cycleId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount provided" }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: { owner: true, rider: true }
    });

    if (!vehicle || !vehicle.ownerId) {
      return NextResponse.json({ error: "Vehicle or Owner not found" }, { status: 400 });
    }

    const ownerId = vehicle.ownerId;
    const reference = `YUS-${type === "PAYMENT_COLLECTED" ? "IN" : "OUT"}-${Math.floor(1000000 + Math.random() * 9000000)}`;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the universal Ledger entry
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

      // 2. Fetch the specific target week
      const cycle = await tx.weeklyCycle.findUnique({ where: { id: cycleId } });
      if (!cycle) throw new Error("The selected weekly cycle could not be found.");

      // 3. Update the specific week based on transaction type
      if (type === "OWNER_REMITTANCE") {
        const newRemittedAmount = (cycle.ownerRemittedAmount || 0) + numAmount;
        // Float math safety
        const isSettled = newRemittedAmount >= (cycle.ownerExpectedAmount - 0.01);

        await tx.weeklyCycle.update({
          where: { id: cycleId },
          data: { 
            ownerRemittedAmount: newRemittedAmount, 
            isOwnerSettled: isSettled 
          }
        });
      } 
      else if (type === "PAYMENT_COLLECTED") {
        const newAmountPaid = (cycle.amountPaid || 0) + numAmount;
        const newShortfall = Math.max(0, cycle.expectedAmount - newAmountPaid);
        // Float math safety
        const isSettled = newShortfall <= 0.01;

        await tx.weeklyCycle.update({
          where: { id: cycleId },
          data: { 
            amountPaid: newAmountPaid, 
            shortfallAmount: newShortfall, 
            isSettled: isSettled 
          }
        });
      }

      return ledger;
    });

    // 4. Dispatch strict E-Receipts based on exact Admin input
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
        toName: vehicle.owner.firstName || "Owner",
        subject: `Payout Remittance: ${description}`,
        htmlBody: getOwnerPayoutEmail({
          firstName: vehicle.owner.firstName || "Owner",
          email: vehicle.owner.email,
          amount: formattedAmount,
          weekDescription: description,
          vehiclePlate: vehicle.registrationNumber,
          reference,
          date: dateStr
        })
      }).catch(err => console.error("Failed to email owner receipt:", err));
    }

    return NextResponse.json({ success: true, ledger: result });

  } catch (error: any) {
    console.error("Payment Processing Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process payment." }, { status: 500 });
  }
}
