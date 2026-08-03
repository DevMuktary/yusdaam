import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
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
    if (!session || !session.user?.id) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });

    const body = await req.json();
    
    // We now expect the base64 PDFs from the frontend payload
    const { signature, witnessName, witnessSignature, contractId, hpaBase64, poaBase64 } = body;
    
    if (!signature || !contractId) {
      return NextResponse.json({ error: "Signature and Contract ID are required" }, { status: 400 });
    }

    let hpaUrl = null;
    let poaUrl = null;

    // 1. Upload Owner HPA to Cloudinary
    if (hpaBase64) {
      const hpaRes = await cloudinary.uploader.upload(`data:application/pdf;base64,${hpaBase64}`, {
        folder: "yusdaam_agreements/owners/hpa",
        resource_type: "auto",
      });
      hpaUrl = hpaRes.secure_url;
    }

    // 2. Upload Owner POA to Cloudinary
    if (poaBase64) {
      const poaRes = await cloudinary.uploader.upload(`data:application/pdf;base64,${poaBase64}`, {
        folder: "yusdaam_agreements/owners/poa",
        resource_type: "auto",
      });
      poaUrl = poaRes.secure_url;
    }

    // 3. Update the Contract with signatures AND distinct Document URLs
    await prisma.contract.update({
      where: { id: contractId },
      data: { 
        isSigned: true,
        ownerSignatureUrl: signature,
        witnessName: witnessName,
        witnessSignatureUrl: witnessSignature,
        ...(hpaUrl && { ownerHpaUrl: hpaUrl }),
        ...(poaUrl && { ownerPoaUrl: poaUrl })
      },
    });

    // 4. Update the User profile
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        accountStatus: "ACTIVE", 
        signatureUrl: signature, 
        defaultWitnessName: witnessName,
        defaultWitnessSignatureUrl: witnessSignature
      },
    });

    return NextResponse.json({ message: "Agreements signed and secured successfully" }, { status: 200 });
    
  } catch (error) {
    console.error("Signature Processing Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
