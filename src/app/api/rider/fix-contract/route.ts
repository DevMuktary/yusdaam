import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // 1. Ensure only an Admin can trigger this reset
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "RIDER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Accept the specific contract ID and the date it WAS SUPPOSED to start
    const { contractId, originalStartDate } = await req.json();

    if (!contractId || !originalStartDate) {
      return NextResponse.json({ error: "Missing contractId or originalStartDate" }, { status: 400 });
    }

    // 2. Perform the reset inside a transaction for safety
    await prisma.$transaction(async (tx) => {
      
      // Step A: Wipe out any existing WeeklyCycles for this contract 
      // (This clears out the broken Week 1 where the 1.5M was dumped, so it can be recalculated properly)
      await tx.weeklyCycle.deleteMany({
        where: { contractId: contractId }
      });

      // Step B: Rewind the actual Contract table back to Week 1 and the original date
      await tx.contract.update({
        where: { id: contractId },
        data: {
          currentWeek: 1,
          nextDueDate: new Date(originalStartDate) // e.g., "2024-06-18" or whatever the exact start date was
        }
      });
    });

    return NextResponse.json({ 
      success: true, 
      message: `Contract ${contractId} successfully rewound. Please run the Arrears Cron Job now to rebuild the timeline.` 
    });

  } catch (error: any) {
    console.error("Fixer API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to rewind contract." }, { status: 500 });
  }
}
