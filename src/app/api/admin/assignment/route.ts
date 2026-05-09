import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

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
    await prisma.$transaction(async (tx) => {
      
      // 1. Update the Vehicle
      await tx.vehicle.update({
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

      // 3. Update Rider Status (Sends them to the "Virtual Agreement" page)
      await tx.user.update({
        where: { id: riderId },
        data: { accountStatus: "AWAITING_SIGNATURE" }
      });

      // 4. Update Owner Status (Sends them to the "Virtual Agreement" page)
      await tx.user.update({
        where: { id: ownerId },
        data: { accountStatus: "AWAITING_SIGNATURE" }
      });

    });

    // NOTE: You can hook up your sendSystemEmail here to email the rider and owner 
    // notifying them to log in and sign their agreements!

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Assignment Transaction Error:", error);
    // Handle Prisma unique constraint error specifically (e.g., rider already assigned)
    if (error.code === 'P2002') {
       return NextResponse.json({ error: "This rider or vehicle is already in an active contract." }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error during assignment." }, { status: 500 });
  }
}
