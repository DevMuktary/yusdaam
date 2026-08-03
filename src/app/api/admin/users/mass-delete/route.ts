import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PRESERVED_IDS = [
  "cms37vplx002xh01d4h76vz0k",
  "cmovqesmh0000ms37hocqsywl",
  "cmr252nvi0000elz4uw17ko5k",
  "cmrl1237m007dczlffstcg4n3"
];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Find all users that are NOT in the preserved list
    const usersToDelete = await prisma.user.findMany({
      where: { id: { notIn: PRESERVED_IDS } },
      select: { id: true }
    });

    const idsToDelete = usersToDelete.map(u => u.id);

    if (idsToDelete.length === 0) {
      return NextResponse.json({ message: "No users found to delete." }, { status: 200 });
    }

    // 2. Clear out relational data that would block the deletion
    await prisma.guarantor.deleteMany({ where: { riderId: { in: idsToDelete } } });
    await prisma.ledger.deleteMany({ where: { ownerId: { in: idsToDelete } } });
    
    // Contracts are tied to vehicles and owners. We must delete contracts linked to owners being deleted.
    await prisma.contract.deleteMany({ where: { ownerId: { in: idsToDelete } } });

    // Unassign vehicles to prevent strict foreign key crashes
    await prisma.vehicle.updateMany({
      where: { ownerId: { in: idsToDelete } },
      data: { ownerId: null }
    });
    await prisma.vehicle.updateMany({
      where: { riderId: { in: idsToDelete } },
      data: { riderId: null }
    });

    // 3. Finally, wipe the users
    const result = await prisma.user.deleteMany({
      where: { id: { in: idsToDelete } }
    });

    return NextResponse.json({ 
      message: `Successfully wiped ${result.count} users and their associated data.` 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Mass Deletion Error:", error);
    return NextResponse.json({ error: error.message || "Failed to mass delete users" }, { status: 500 });
  }
}
