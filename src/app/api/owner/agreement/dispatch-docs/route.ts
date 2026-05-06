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
    if (!session || !session.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { hpaBase64, poaBase64 } = body;

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || !user.email) return NextResponse.json({ error: "User or email not found" }, { status: 404 });

    const ownerFullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Asset Owner";

    const emailSent = await sendSystemEmail({
      toEmail: user.email,
      toName: ownerFullName,
      subject: "Executed Agreements: YUSDAAM Autos",
      htmlBody: getAgreementSignedEmail({ firstName: user.firstName || "Asset Owner", email: user.email }),
      attachments: [
        {
          content: hpaBase64,
          mime_type: "application/pdf",
          name: "HPA_Agreement.pdf"
        },
        {
          content: poaBase64,
          mime_type: "application/pdf",
          name: "Power_Of_Attorney.pdf"
        }
      ]
    });

    if (!emailSent) throw new Error("ZeptoMail dispatch failed");

    return NextResponse.json({ message: "Dispatched successfully" }, { status: 200 });
  } catch (error) {
    console.error("Doc Dispatch Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
