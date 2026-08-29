import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // 1. Fetch user to verify they exist and are not an ADMIN
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        ownedVehicles: { select: { id: true } },
        assignedTrip: { select: { id: true } },
        contracts: { select: { id: true } },
      }
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (targetUser.role === "ADMIN") {
      return NextResponse.json({ error: "Administrator accounts cannot be deleted." }, { status: 403 });
    }

    if (targetUser.id === session.user.id) {
      return NextResponse.json({ error: "You cannot delete your own admin account." }, { status: 403 });
    }

    // 2. Perform Atomic Cascading Deletion without foreign key constraint violations
    await prisma.$transaction(async (tx) => {
      const ownedVehicleIds = targetUser.ownedVehicles.map(v => v.id);
      const assignedVehicleId = targetUser.assignedTrip?.id;
      
      // Collect all relevant vehicle IDs
      const allVehicleIds = [...ownedVehicleIds];
      if (assignedVehicleId) {
        allVehicleIds.push(assignedVehicleId);
      }

      // Collect all contract IDs attached to this user or their vehicles
      const userContracts = await tx.contract.findMany({
        where: {
          OR: [
            { ownerId: targetUser.id },
            ...(allVehicleIds.length > 0 ? [{ vehicleId: { in: allVehicleIds } }] : [])
          ]
        },
        select: { id: true }
      });
      const contractIds = userContracts.map(c => c.id);

      // A. Delete all Weekly Cycles attached to these contracts
      if (contractIds.length > 0) {
        await tx.weeklyCycle.deleteMany({
          where: { contractId: { in: contractIds } }
        });
      }

      // B. Delete all Ledgers attached to this user (as owner) or to their owned vehicles
      await tx.ledger.deleteMany({
        where: {
          OR: [
            { ownerId: targetUser.id },
            ...(ownedVehicleIds.length > 0 ? [{ vehicleId: { in: ownedVehicleIds } }] : [])
          ]
        }
      });

      // C. Delete Contracts
      if (contractIds.length > 0) {
        await tx.contract.deleteMany({
          where: { id: { in: contractIds } }
        });
      }

      // D. Handle Vehicles
      // If user is a Rider, disconnect them from their assigned vehicle and mark it UNASSIGNED
      if (assignedVehicleId) {
        await tx.vehicle.update({
          where: { id: assignedVehicleId },
          data: {
            riderId: null,
            status: "UNASSIGNED"
          }
        });
      }

      // If user is an Asset Owner, delete their owned vehicles
      if (ownedVehicleIds.length > 0) {
        await tx.vehicle.deleteMany({
          where: { id: { in: ownedVehicleIds } }
        });
      }

      // E. Delete Guarantors
      await tx.guarantor.deleteMany({
        where: { riderId: targetUser.id }
      });

      // F. Delete NextAuth Accounts and Sessions
      await tx.account.deleteMany({
        where: { userId: targetUser.id }
      });

      await tx.session.deleteMany({
        where: { userId: targetUser.id }
      });

      // G. Delete Verification Tokens associated with user email
      if (targetUser.email) {
        await tx.verificationToken.deleteMany({
          where: { identifier: targetUser.email }
        });
      }

      // H. Finally, Delete the User
      await tx.user.delete({
        where: { id: targetUser.id }
      });
    });

    return NextResponse.json({ 
      success: true, 
      message: `User ${targetUser.firstName || ""} ${targetUser.lastName || ""} and all associated data permanently deleted.` 
    });

  } catch (error: any) {
    console.error("Cascade User Deletion Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete user and associated records" }, { status: 500 });
  }
}
