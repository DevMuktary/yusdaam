import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendSystemEmail } from "@/lib/email/sender";
import { getOtpEmail } from "@/lib/email/templates";

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
      return NextResponse.json({ error: "No email associated with this admin account." }, { status: 400 });
    }

    const email = adminUser.email.trim();
    const name = `${adminUser.firstName || ""} ${adminUser.lastName || ""}`.trim() || adminUser.name || session.user.name || "Admin";

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Remove any existing tokens for this user to prevent clutter/conflicts
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    });

    // Save the new OTP
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: otp,
        expires
      }
    });

    // Send the email
    await sendSystemEmail({
      toEmail: email,
      toName: name,
      subject: "Admin Password Change - OTP",
      htmlBody: getOtpEmail({ name, otp, expiryMinutes: 10 })
    });

    return NextResponse.json({ success: true, message: "OTP sent successfully." });

  } catch (error: any) {
    console.error("OTP Request Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to send OTP." }, { status: 500 });
  }
}
