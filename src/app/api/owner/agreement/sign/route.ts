import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { SendMailClient } from "zeptomail";
import { getAgreementSignedEmail } from "@/lib/email/templates";

const prisma = new PrismaClient();

// Initialize ZeptoMail Client
const url = "api.zeptomail.com/";
const token = process.env.ZEPTOMAIL_API_KEY || "";
const client = new SendMailClient({ url, token });

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

    // 2. Dispatch the confirmation email via ZeptoMail
    if (user.email) {
      try {
        await client.sendMail({
          from: {
            // Update this to your ZeptoMail verified sender address
            address: "noreply@", 
            name: "YUSDAAM Autos",
          },
          to: [
            {
              email_address: {
                address: user.email,
                name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
              },
            },
          ],
          subject: "Your Asset Agreement is Active",
          htmlbody: getAgreementSignedEmail({ 
            firstName: user.firstName || "Asset Owner", 
            email: user.email 
          }),
        });
      } catch (emailError) {
        // We log the email error but do not fail the overall database transaction
        console.error("ZeptoMail dispatch failed:", emailError);
      }
    }

    return NextResponse.json({ message: "Agreement signed and processed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Signature Processing Error:", error);
    return NextResponse.json({ error: "Internal server error during processing" }, { status: 500 });
  }
}
