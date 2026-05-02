import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { signature } = body;

    if (!signature) {
      return NextResponse.json({ error: "Signature is required to proceed" }, { status: 400 });
    }

    // Update the database to unlock the dashboard
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        accountStatus: "ACTIVE",
      },
    });

    return NextResponse.json({ message: "Agreement signed and processed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Signature Processing Error:", error);
    return NextResponse.json({ error: "Internal server error during processing" }, { status: 500 });
  }
}
