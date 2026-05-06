import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { sendSystemEmail } from "@/lib/email/sender";
import { getAgreementSignedEmail } from "@/lib/email/templates";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary using your existing env variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { hpaBase64, poaBase64 } = body;

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || !user.email) return NextResponse.json({ error: "User or email not found" }, { status: 404 });

    // 1. Upload the exact executed PDFs to Cloudinary
    const hpaUpload = await cloudinary.uploader.upload(`data:application/pdf;base64,${hpaBase64}`, {
      resource_type: "auto",
      folder: "yusdaam_legal_agreements",
      public_id: `${user.id}_HPA_Agreement`,
    });

    const poaUpload = await cloudinary.uploader.upload(`data:application/pdf;base64,${poaBase64}`, {
      resource_type: "auto",
      folder: "yusdaam_legal_agreements",
      public_id: `${user.id}_Power_Of_Attorney`,
    });

    // 2. Save the permanent URLs to the database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        hpaAgreementUrl: hpaUpload.secure_url,
        poaAgreementUrl: poaUpload.secure_url,
      }
    });

    // 3. Dispatch the email with the exact same files
    const ownerFullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Asset Owner";
    
    await sendSystemEmail({
      toEmail: user.email,
      toName: ownerFullName,
      subject: "Executed Agreements: YUSDAAM Autos",
      htmlBody: getAgreementSignedEmail({ firstName: user.firstName || "Asset Owner", email: user.email }),
      attachments: [
        { content: hpaBase64, mime_type: "application/pdf", name: "HPA_Agreement.pdf" },
        { content: poaBase64, mime_type: "application/pdf", name: "Power_Of_Attorney.pdf" }
      ]
    });

    return NextResponse.json({ message: "Documents secured and dispatched successfully" }, { status: 200 });
  } catch (error) {
    console.error("Doc Dispatch Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
