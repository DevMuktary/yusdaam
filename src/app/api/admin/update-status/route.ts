import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { sendSystemEmail } from "@/lib/email/sender";
import { getAccountApprovedEmail, getAccountRejectedEmail } from "@/lib/email/templates";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // 1. Verify Admin Access
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, status, role } = await req.json();

    if (!userId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Update Database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { accountStatus: status },
    });

    // 3. Dispatch Notification Email
    if (updatedUser.email) {
      const emailData = {
        firstName: updatedUser.firstName || "User",
        email: updatedUser.email,
        role: updatedUser.role
      };

      const subject = status === "APPROVED" 
        ? "Your YUSDAAM Account has been Approved" 
        : "Update on your YUSDAAM Account Verification";

      const htmlBody = status === "APPROVED" 
        ? getAccountApprovedEmail(emailData) 
        : getAccountRejectedEmail(emailData);

      // We don't await this so it doesn't block the UI response from loading instantly
      sendSystemEmail({
        toEmail: updatedUser.email,
        toName: `${updatedUser.firstName} ${updatedUser.lastName}`,
        subject: subject,
        htmlBody: htmlBody
      }).catch(err => console.error("Failed to send status email:", err));
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Status Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
