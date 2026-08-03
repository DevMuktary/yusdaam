import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 1. Wipe Ledgers (Payments) first to avoid foreign key crashes
    const deletedLedgers = await prisma.ledger.deleteMany({});
    
    // 2. Wipe Contracts (this automatically deletes WeeklyCycles via Cascade)
    const deletedContracts = await prisma.contract.deleteMany({});

    // 3. Finally, wipe every single Vehicle
    const deletedVehicles = await prisma.vehicle.deleteMany({});

    return NextResponse.json({ 
      message: "SUCCESS: All vehicles and their related data have been completely wiped.",
      stats: {
        vehiclesDeleted: deletedVehicles.count,
        contractsDeleted: deletedContracts.count,
        ledgersDeleted: deletedLedgers.count
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Nuke Error:", error);
    return NextResponse.json({ error: error.message || "Failed to wipe vehicles" }, { status: 500 });
  }
}
