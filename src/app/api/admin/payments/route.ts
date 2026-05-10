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

    const { vehicleId, type, amount, description, receiptBase64 } = await req.json();

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

    // 2. Generate Unique Transaction Ref (e.g., YUS-PAY-1234567)
    const reference = `YUS-${type === "PAYMENT_COLLECTED" ? "IN" : "OUT"}-${Math.floor(1000000 + Math.random() * 9000000)}`;

    // 3. Create Ledger Entry
    const ledger = await prisma.ledger.create({
      data: {
        amount,
        type,
        reference,
        description,
        receiptUrl: receiptBase64 || null,
        vehicleId,
        ownerId: vehicle.ownerId, 
      }
    });

    // 4. Send Email Notification
    const formattedAmount = Number(amount).toLocaleString();
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
      });
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
      });
    }

    return NextResponse.json({ success: true, ledger });

  } catch (error) {
    console.error("Payment Processing Error:", error);
    return NextResponse.json({ error: "Failed to process payment." }, { status: 500 });
  }
}
