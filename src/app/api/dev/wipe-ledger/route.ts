import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  // Extract the secret from the URL
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  // SECURITY CHECK: This prevents accidental clicks or bots from wiping your database
  if (secret !== "confirm-wipe-123") {
    return NextResponse.json(
      { error: "Unauthorized. Missing or incorrect secret parameter." }, 
      { status: 401 }
    );
  }

  try {
    // Delete every single record in the Ledger table
    const deleted = await prisma.ledger.deleteMany({});

    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${deleted.count} records from the Ledger table.` 
    });
  } catch (error: any) {
    console.error("Failed to wipe ledger:", error);
    return NextResponse.json(
      { error: "Failed to wipe ledger", details: error.message }, 
      { status: 500 }
    );
  }
}
