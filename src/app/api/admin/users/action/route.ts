import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // 1. Verify Admin Status
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, status } = await req.json();

    if (!userId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Protect against self-suspension or suspending other admins
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (targetUser?.role === "ADMIN") {
        return NextResponse.json({ error: "Cannot suspend Administrator accounts." }, { status: 403 });
    }

    // 2. Execute Update
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { accountStatus: status },
    });

    return NextResponse.json({ success: true, status: updatedUser.accountStatus });

  } catch (error) {
    console.error("User Action Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
