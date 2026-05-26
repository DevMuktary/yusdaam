import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { otp, newPassword } = await req.json();

    if (!otp || !newPassword) {
      return NextResponse.json({ error: "OTP and new password are required." }, { status: 400 });
    }

    // 1. Verify the Token
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: otp
      }
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: "Invalid OTP." }, { status: 400 });
    }

    if (tokenRecord.expires < new Date()) {
      return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    // 2. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Update the user
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    // 4. Clean up the used token
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    });

    return NextResponse.json({ success: true, message: "Password updated successfully." });

  } catch (error: any) {
    console.error("Password Reset Error:", error);
    return NextResponse.json({ error: "Failed to reset password." }, { status: 500 });
  }
}
