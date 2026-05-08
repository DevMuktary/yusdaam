import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import { sendSystemEmail } from "@/lib/email/sender";
import { getRiderAgreementSignedEmail } from "@/lib/email/templates";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "RIDER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { pdfBase64 } = body;

    if (!pdfBase64) {
      return NextResponse.json({ error: "PDF document missing" }, { status: 400 });
    }

    // 1. Upload PDF to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(`data:application/pdf;base64,${pdfBase64}`, {
      folder: "yusdaam_agreements/riders",
      resource_type: "auto",
    });

    // 2. Update the Rider's status to ACTIVE and save the PDF link
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email as string },
      data: {
        accountStatus: "ACTIVE",
        hpaAgreementUrl: uploadResponse.secure_url,
      },
    });

    // 3. Dispatch the Email with the attached agreement
    const riderFullName = `${updatedUser.firstName || ""} ${updatedUser.lastName || ""}`.trim() || "Driver/Rider";
    
    await sendSystemEmail({
      toEmail: updatedUser.email as string,
      toName: riderFullName,
      subject: "Executed Hire Purchase Agreement: YUSDAAM Autos",
      htmlBody: getRiderAgreementSignedEmail({ 
        firstName: updatedUser.firstName || "Driver/Rider", 
        email: updatedUser.email as string 
      }),
      attachments: [
        { 
          content: pdfBase64, 
          mime_type: "application/pdf", 
          name: `YUSDAAM_HPA_${updatedUser.firstName}_${updatedUser.lastName}.pdf` 
        }
      ]
    });

    return NextResponse.json({ message: "Agreement Signed and Secured", url: uploadResponse.secure_url }, { status: 200 });
  } catch (error: any) {
    console.error("Signature Error:", error);
    return NextResponse.json({ error: "Failed to secure document" }, { status: 500 });
  }
}
