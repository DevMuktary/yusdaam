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
      totalHirePurchasePrice, systemGrandTotal, downPayment, 
      riderWeeklyRemittance, riderDurationWeeks,
      weeklyServiceFee,
      ownerWeeklyPayout, ownerDurationWeeks
    } = body;

    // Validate
    if (!vehicleId || !ownerId) {
      return NextResponse.json({ error: "Vehicle and Asset Owner are required to establish a contract." }, { status: 400 });
    }

    // Check if the owner is already active
    const existingOwner = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { accountStatus: true, firstName: true, lastName: true, email: true }
    });

    if (!existingOwner) {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }

    const isOwnerAlreadyActive = existingOwner.accountStatus === "ACTIVE" || existingOwner.accountStatus === "APPROVED";
    
    // Base dates for generating cycles
    const baseDate = new Date();
    const firstDueDate = new Date(baseDate);
    firstDueDate.setDate(firstDueDate.getDate() + 7);

    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Update the Vehicle
      const updatedVehicle = await tx.vehicle.update({
        where: { id: vehicleId },
        data: {
          ownerId: ownerId,
          riderId: riderId || null,
          status: "ACTIVE"
        }
      });

      // 2. Create the Detailed Contract
      const newContract = await tx.contract.create({
        data: {
          vehicleId: vehicleId,
          ownerId: ownerId,
          totalHirePurchasePrice: Number(totalHirePurchasePrice),
          systemGrandTotal: Number(systemGrandTotal), 
          downPayment: Number(downPayment) || 0,
          riderWeeklyRemittance: Number(riderWeeklyRemittance),
          riderDurationWeeks: Number(riderDurationWeeks),
          weeklyServiceFee: Number(weeklyServiceFee) || 0,
          ownerWeeklyPayout: Number(ownerWeeklyPayout),
          ownerDurationWeeks: Number(ownerDurationWeeks),
          isActive: true,
          isSigned: false, 
          currentWeek: 1,
          nextDueDate: firstDueDate
        }
      });

      // 3. --- PRE-GENERATE ALL WEEKLY CYCLES INSTANTLY ---
      const rDuration = Number(riderDurationWeeks);
      const oDuration = Number(ownerDurationWeeks);
      const sysTotal = Number(systemGrandTotal);
      const rWeekly = Number(riderWeeklyRemittance);
      const oWeekly = Number(ownerWeeklyPayout);
      const adminFee = Number(weeklyServiceFee) || 0;
      
      let cumulativeBilled = 0;
      const cyclesData = [];

      for (let week = 1; week <= rDuration; week++) {
        let expAmt = rWeekly;
        let ownExpAmt = week <= oDuration ? oWeekly : 0;

        // Ensure we cap the final fractional week perfectly so we don't overbill or overpay
        if (cumulativeBilled + expAmt > sysTotal) {
          expAmt = Math.max(0, sysTotal - cumulativeBilled);
          if (week <= oDuration) {
              ownExpAmt = Math.max(0, expAmt - adminFee);
          }
        }

        cumulativeBilled += expAmt;

        const wStartDate = new Date(baseDate);
        wStartDate.setDate(wStartDate.getDate() + ((week - 1) * 7));
        
        const wEndDate = new Date(baseDate);
        wEndDate.setDate(wEndDate.getDate() + (week * 7));

        cyclesData.push({
          contractId: newContract.id,
          weekNumber: week,
          expectedAmount: expAmt,
          amountPaid: 0,
          shortfallAmount: expAmt, // Rider owes this full amount until paid
          isSettled: expAmt <= 0,
          ownerExpectedAmount: ownExpAmt, // Owner expects this payout
          ownerRemittedAmount: 0,
          isOwnerSettled: ownExpAmt <= 0, // Mark as settled if Owner expects 0 for this specific week
          startDate: wStartDate,
          endDate: wEndDate
        });
      }

      // Bulk insert all 100+ weeks into the database in one single query
      await tx.weeklyCycle.createMany({ data: cyclesData });

      // 4. Update Rider Status
      let updatedRider = null;
      if (riderId) {
        updatedRider = await tx.user.update({
          where: { id: riderId },
          data: { accountStatus: "AWAITING_SIGNATURE" },
          select: { firstName: true, lastName: true, email: true }
        });
      }

      // 5. Update Owner Status 
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

    // 6. Fire off the automated emails (non-blocking)
    const vehicleString = `${result.updatedVehicle.makeModel} (${result.updatedVehicle.registrationNumber})`;

    if (result.updatedRider?.email) {
      sendSystemEmail({
        toEmail: result.updatedRider.email,
        toName: `${result.updatedRider.firstName} ${result.updatedRider.lastName}`,
        subject: "Action Required: Sign Your Yusdaam Vehicle Agreement",
        htmlBody: getRiderAwaitingSignatureEmail({
          firstName: result.updatedRider.firstName || "Rider",
          email: result.updatedRider.email,
          vehicleDetails: vehicleString
        })
      }).catch(err => console.error(err));
    }

    if (result.updatedOwner.email) {
      if (isOwnerAlreadyActive) {
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
        }).catch(err => console.error(err));
      } else {
        sendSystemEmail({
          toEmail: result.updatedOwner.email,
          toName: `${result.updatedOwner.firstName} ${result.updatedOwner.lastName}`,
          subject: "Asset Deployed: Sign Your Specific Power of Attorney",
          htmlBody: getOwnerAwaitingSignatureEmail({
            firstName: result.updatedOwner.firstName || "Asset Owner",
            email: result.updatedOwner.email,
            vehicleDetails: vehicleString
          })
        }).catch(err => console.error(err));
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
