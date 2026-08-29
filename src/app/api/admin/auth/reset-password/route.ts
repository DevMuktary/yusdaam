import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!adminUser || !adminUser.email) {
      return NextResponse.json({ error: "No admin account or email found." }, { status: 404 });
    }

    const email = adminUser.email.trim();

    const body = await req.json();
    const otp = typeof body.otp === "string" ? body.otp.trim() : String(body.otp || "").trim();
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : String(body.newPassword || "");

    if (!otp || !newPassword) {
      return NextResponse.json({ error: "OTP and new password are required." }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    // 1. Verify the Token
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: otp
      }
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: "Invalid OTP. Please check the 6-digit code sent to your email." }, { status: 400 });
    }

    if (new Date(tokenRecord.expires).getTime() < Date.now()) {
      return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    // 2. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Update the user
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { password: hashedPassword }
    });

    // 4. Clean up the used token
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    });

    return NextResponse.json({ success: true, message: "Password updated successfully." });

  } catch (error: any) {
    console.error("Password Reset Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to reset password." }, { status: 500 });
  }
}
