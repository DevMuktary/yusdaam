import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import { sendSystemEmail } from "@/lib/email/sender";
import { getRiderAgreementSignedEmail } from "@/lib/email/templates";

export const dynamic = "force-dynamic";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access. Please log in." }, { status: 401 });
    }

    if (session.user.role !== "RIDER") {
      return NextResponse.json({ error: "Only riders can execute this agreement." }, { status: 403 });
    }

    const body = await req.json();
    const { pdfBase64 } = body;

    if (!pdfBase64) {
      return NextResponse.json({ error: "PDF document data is missing." }, { status: 400 });
    }

    // 1. Fetch user by session ID (with email fallback)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(session.user.id ? [{ id: session.user.id }] : []),
          ...(session.user.email ? [{ email: session.user.email }] : [])
        ]
      },
      include: {
        assignedTrip: {
          include: {
            contract: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Rider profile not found." }, { status: 404 });
    }

    // 2. Upload PDF to Cloudinary
    let secureUrl = "";
    try {
      const uploadResponse = await cloudinary.uploader.upload(`data:application/pdf;base64,${pdfBase64}`, {
        folder: "yusdaam_agreements/riders",
        resource_type: "auto",
      });
      secureUrl = uploadResponse.secure_url;
    } catch (uploadErr: any) {
      console.error("Cloudinary PDF Upload Error:", uploadErr);
      return NextResponse.json({ error: "Failed to upload signed agreement to secure vault." }, { status: 500 });
    }

    // 3. Update Rider's status to ACTIVE and save the PDF link
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        accountStatus: "ACTIVE",
        hpaAgreementUrl: secureUrl,
      },
    });

    // 4. Update the active Contract (if attached to vehicle)
    if (user.assignedTrip?.contract) {
      await prisma.contract.update({
        where: { id: user.assignedTrip.contract.id },
        data: {
          isSigned: true,
          signedDocumentUrl: secureUrl,
        }
      }).catch(err => console.warn("Contract signature update warning:", err));
    }

    // 5. Dispatch confirmation email asynchronously (Non-blocking so email server delays never fail the sign response)
    const riderFullName = `${updatedUser.firstName || ""} ${updatedUser.lastName || ""}`.trim() || "Driver/Rider";
    if (updatedUser.email) {
      sendSystemEmail({
        toEmail: updatedUser.email,
        toName: riderFullName,
        subject: "Executed Hire Purchase Agreement: YUSDAAM Autos",
        htmlBody: getRiderAgreementSignedEmail({ 
          firstName: updatedUser.firstName || "Driver/Rider", 
          email: updatedUser.email 
        }),
        attachments: [
          { 
            content: pdfBase64, 
            mime_type: "application/pdf", 
            name: `YUSDAAM_HPA_${updatedUser.firstName || "Rider"}_${updatedUser.lastName || "Driver"}.pdf` 
          }
        ]
      }).catch(err => console.error("Rider signed agreement email dispatch error:", err));
    }

    return NextResponse.json({ 
      success: true,
      message: "Agreement Signed and Secured Successfully", 
      url: secureUrl 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Signature Route Fatal Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to process and secure agreement." }, { status: 500 });
  }
}
