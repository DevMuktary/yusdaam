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

    // NEW: Check if the owner is already active (has signed before)
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
          ownerWeeklyPayout: Number(ownerWeeklyPayout),
          ownerDurationWeeks: Number(ownerDurationWeeks),
          isActive: true
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
        // Send a simple notification since they don't need to sign again
        sendSystemEmail({
          toEmail: result.updatedOwner.email,
          toName: `${result.updatedOwner.firstName} ${result.updatedOwner.lastName}`,
          subject: "New Asset Deployed to Your Portfolio!",
          htmlBody: `
            <div style="font-family: sans-serif; color: #333;">
              <h2>New Asset Added!</h2>
              <p>Hello ${result.updatedOwner.firstName},</p>
              <p>Great news! A new asset <strong>${vehicleString}</strong> has been successfully assigned to your portfolio and deployed to a vetted rider.</p>
              <p>Because you have already signed the Master Hire Purchase Administration Agreement, no further signatures are required. The asset is now active on your dashboard.</p>
              <p><a href="https://yusdaamautos.com/owner/login" style="padding: 10px 20px; background-color: #001232; color: white; text-decoration: none; border-radius: 5px;">View Dashboard</a></p>
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
