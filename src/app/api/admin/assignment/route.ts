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
      weeklyServiceFee,
      ownerWeeklyPayout, ownerDurationWeeks
    } = body;

    // Validate
    if (!vehicleId || !riderId || !ownerId) {
      return NextResponse.json({ error: "Missing identity IDs" }, { status: 400 });
    }

    // Check if the owner is already active (has signed before)
    const existingOwner = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { accountStatus: true, firstName: true, lastName: true, email: true }
    });

    if (!existingOwner) {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }

    const isOwnerAlreadyActive = existingOwner.accountStatus === "ACTIVE" || existingOwner.accountStatus === "APPROVED";

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
          weeklyServiceFee: Number(weeklyServiceFee) || 0,
          ownerWeeklyPayout: Number(ownerWeeklyPayout),
          ownerDurationWeeks: Number(ownerDurationWeeks),
          isActive: true,
          isSigned: false // Mark as not signed explicitly
        }
      });

      // 3. Update Rider Status (Riders ALWAYS sign for a new vehicle)
      const updatedRider = await tx.user.update({
        where: { id: riderId },
        data: { accountStatus: "AWAITING_SIGNATURE" },
        select: { firstName: true, lastName: true, email: true }
      });

      // 4. Update Owner Status (ONLY if they haven't signed before)
      let updatedOwner = existingOwner;
      if (!isOwnerAlreadyActive) {
        updatedOwner = await tx.user.update({
          where: { id: ownerId },
          data: { accountStatus: "AWAITING_SIGNATURE" },
          select: { firstName: true, lastName: true, email: true, accountStatus: true }
        });
      }

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
      if (isOwnerAlreadyActive) {
        // Inform them they have a new asset and MUST sign the specific agreement
        sendSystemEmail({
          toEmail: result.updatedOwner.email,
          toName: `${result.updatedOwner.firstName} ${result.updatedOwner.lastName}`,
          subject: "Action Required: Sign Agreement for New Asset",
          htmlBody: `
            <div style="font-family: sans-serif; color: #333;">
              <h2>New Asset Deployed!</h2>
              <p>Hello ${result.updatedOwner.firstName},</p>
              <p>A new asset <strong>${vehicleString}</strong> has been assigned to your portfolio.</p>
              <p>Please log in to your dashboard and navigate to your Fleet Portfolio to sign the specific Power of Attorney and Administration Agreement for this new vehicle.</p>
              <p><a href="https://yusdaamautos.com/owner/dashboard/assets" style="padding: 10px 20px; background-color: #001232; color: white; text-decoration: none; border-radius: 5px;">Go to Fleet Portfolio</a></p>
            </div>
          `
        }).catch(err => console.error("Failed to email assigned owner:", err));
      } else {
        // Send the standard signature request for first-timers
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
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Assignment Transaction Error:", error);
    if (error.code === 'P2002') {
       return NextResponse.json({ error: "This rider or vehicle is already in an active contract." }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error during assignment." }, { status: 500 });
  }
}
