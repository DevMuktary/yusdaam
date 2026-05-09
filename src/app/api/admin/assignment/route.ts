import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { sendSystemEmail } from "@/lib/email/sender";
import { getOwnerAwaitingSignatureEmail, getRiderAwaitingSignatureEmail } from "@/lib/email/templates";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      vehicleId, riderId, ownerId,
      totalHirePurchasePrice, downPayment,
      riderWeeklyRemittance, riderDurationWeeks,
      ownerWeeklyPayout, ownerDurationWeeks
    } = body;

    // Validate
    if (!vehicleId || !riderId || !ownerId) {
      return NextResponse.json({ error: "Missing identity IDs" }, { status: 400 });
    }

    // Wrap the entire assignment logic in a transaction
    // We destructure the results to capture the updated users and vehicle details for the email
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Update the Vehicle
      const updatedVehicle = await tx.vehicle.update({
        where: { id: vehicleId },
        data: {
          ownerId: ownerId,
          riderId: riderId,
          status: "ACTIVE"
        }
      });

      // 2. Create the Detailed Contract
      await tx.contract.create({
        data: {
          vehicleId: vehicleId,
          ownerId: ownerId,
          totalHirePurchasePrice: Number(totalHirePurchasePrice),
          downPayment: Number(downPayment) || 0,
          riderWeeklyRemittance: Number(riderWeeklyRemittance),
          riderDurationWeeks: Number(riderDurationWeeks),
          ownerWeeklyPayout: Number(ownerWeeklyPayout),
          ownerDurationWeeks: Number(ownerDurationWeeks),
          isActive: true
        }
      });

      // 3. Update Rider Status
      const updatedRider = await tx.user.update({
        where: { id: riderId },
        data: { accountStatus: "AWAITING_SIGNATURE" },
        select: { firstName: true, lastName: true, email: true }
      });

      // 4. Update Owner Status
      const updatedOwner = await tx.user.update({
        where: { id: ownerId },
        data: { accountStatus: "AWAITING_SIGNATURE" },
        select: { firstName: true, lastName: true, email: true }
      });

      return { updatedVehicle, updatedRider, updatedOwner };
    });

    // 5. Fire off the automated emails (non-blocking)
    const vehicleString = `${result.updatedVehicle.makeModel} (${result.updatedVehicle.registrationNumber})`;

    // Email to Rider
    if (result.updatedRider.email) {
      sendSystemEmail({
        toEmail: result.updatedRider.email,
        toName: `${result.updatedRider.firstName} ${result.updatedRider.lastName}`,
        subject: "Action Required: Sign Your Yusdaam Vehicle Agreement",
        htmlBody: getRiderAwaitingSignatureEmail({
          firstName: result.updatedRider.firstName || "Rider",
          email: result.updatedRider.email,
          vehicleDetails: vehicleString
        })
      }).catch(err => console.error("Failed to email assigned rider:", err));
    }

    // Email to Owner
    if (result.updatedOwner.email) {
      sendSystemEmail({
        toEmail: result.updatedOwner.email,
        toName: `${result.updatedOwner.firstName} ${result.updatedOwner.lastName}`,
        subject: "Asset Deployed: Sign Your Specific Power of Attorney",
        htmlBody: getOwnerAwaitingSignatureEmail({
          firstName: result.updatedOwner.firstName || "Asset Owner",
          email: result.updatedOwner.email,
          vehicleDetails: vehicleString
        })
      }).catch(err => console.error("Failed to email assigned owner:", err));
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Assignment Transaction Error:", error);
    // Handle Prisma unique constraint error specifically
    if (error.code === 'P2002') {
       return NextResponse.json({ error: "This rider or vehicle is already in an active contract." }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error during assignment." }, { status: 500 });
  }
}
