import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { sendSystemEmail } from "@/lib/email/sender";
import { getAgreementSignedEmail } from "@/lib/email/templates";

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

    // 1. Update the database to unlock the dashboard and save signature
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        accountStatus: "ACTIVE",
        signatureUrl: signature 
      },
    });

    // 2. Dispatch the confirmation email via your central sender utility
    if (user.email) {
      const ownerFullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Asset Owner";
      
      const emailSent = await sendSystemEmail({
        toEmail: user.email,
        toName: ownerFullName,
        subject: "Executed Agreements: YUSDAAM Autos",
        htmlBody: getAgreementSignedEmail({ 
          firstName: user.firstName || "Asset Owner", 
          email: user.email 
        }),
      });

      if (!emailSent) {
        console.warn(`Failed to dispatch confirmation email to ${user.email}, but database update succeeded.`);
      }
    }

    return NextResponse.json({ message: "Agreements signed and processed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Signature Processing Error:", error);
    return NextResponse.json({ error: "Internal server error during processing" }, { status: 500 });
  }
}
