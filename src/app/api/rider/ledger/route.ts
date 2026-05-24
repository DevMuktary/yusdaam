import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "RIDER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch Rider, Vehicle, and Contract details
    const rider = await prisma.user.findUnique({
      where: { email: session.user.email as string },
      include: {
        assignedTrip: {
          include: { contract: true }
        }
      }
    });

    if (!rider || !rider.assignedTrip || !rider.assignedTrip.contract) {
      return NextResponse.json({ ledger: [], cycles: [] }, { status: 200 });
    }

    const contractId = rider.assignedTrip.contract.id;

    // Fetch the standard ledger transactions (raw payments)
    const ledger = await prisma.ledger.findMany({
      where: { vehicleId: rider.assignedTrip.id },
      orderBy: { date: 'desc' }
    });

    // --- NEW: Fetch the isolated weekly cycles (official weekly records) ---
    const cycles = await prisma.weeklyCycle.findMany({
      where: { contractId: contractId },
      orderBy: { weekNumber: 'asc' }
    });

    return NextResponse.json({ ledger, cycles }, { status: 200 });
    
  } catch (error: any) {
    console.error("Ledger Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch ledger" }, { status: 500 });
  }
}
