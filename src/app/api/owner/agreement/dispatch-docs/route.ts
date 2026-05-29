import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { sendSystemEmail } from "@/lib/email/sender";
import { getAgreementSignedEmail } from "@/lib/email/templates";
import { v2 as cloudinary } from "cloudinary";

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
    // MAKE SURE YOUR FRONTEND SENDS contractId
    const { hpaBase64, poaBase64, contractId } = body; 

    if (!contractId) return NextResponse.json({ error: "Contract ID missing" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || !user.email) return NextResponse.json({ error: "User or email not found" }, { status: 404 });

    // 1. Upload to Cloudinary using the unique Contract ID
    const hpaUpload = await cloudinary.uploader.upload(`data:application/pdf;base64,${hpaBase64}`, {
      resource_type: "auto",
      folder: "yusdaam_legal_agreements",
      public_id: `${contractId}_HPA_Agreement`, 
    });

    const poaUpload = await cloudinary.uploader.upload(`data:application/pdf;base64,${poaBase64}`, {
      resource_type: "auto",
      folder: "yusdaam_legal_agreements",
      public_id: `${contractId}_Power_Of_Attorney`,
    });

    // 2. Save ONLY the HPA URL to your existing database field
    await prisma.contract.update({
      where: { id: contractId },
      data: {
        signedDocumentUrl: hpaUpload.secure_url, 
      }
    });

    // 3. Dispatch the email 
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
