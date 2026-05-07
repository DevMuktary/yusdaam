import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

// 1. GET: Verify the Token and Fetch Rider Data
export async function GET(req: Request, { params }: { params: { token: string } }) {
  try {
    const guarantor = await prisma.guarantor.findUnique({
      where: { token: params.token },
      include: {
        rider: {
          select: { firstName: true, lastName: true, preferredAssetClass: true }
        }
      }
    });

    if (!guarantor) {
      return NextResponse.json({ error: "Invalid or expired link." }, { status: 404 });
    }

    if (guarantor.status !== "PENDING") {
      return NextResponse.json({ error: "This Deed of Guarantee has already been executed." }, { status: 403 });
    }

    return NextResponse.json({ guarantor }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 2. POST: Submit the Guarantor Data & Execute the Deed
export async function POST(req: Request, { params }: { params: { token: string } }) {
  try {
    const body = await req.json();
    const {
      firstName, lastName, // <-- Added these fields
      email, altPhone, nin, address, residentialStatus,
      employmentStatus, employerName, officeAddress,
      passportBase64, utilityBillBase64, signatureBase64
    } = body;

    const guarantor = await prisma.guarantor.findUnique({ where: { token: params.token } });
    if (!guarantor || guarantor.status !== "PENDING") {
      return NextResponse.json({ error: "Invalid or already executed link." }, { status: 400 });
    }

    // Securely Upload Files to Cloudinary
    const uploadToCloudinary = async (base64Str: string, folder: string) => {
      try {
        const result = await cloudinary.uploader.upload(`data:image/png;base64,${base64Str}`, {
          folder: `yusdaam_guarantors/${folder}`,
          resource_type: "auto",
        });
        return result.secure_url;
      } catch (e) {
        throw new Error(`Failed to process ${folder} document`);
      }
    };

    const passportUrl = await uploadToCloudinary(passportBase64, "passports");
    const utilityBillUrl = await uploadToCloudinary(utilityBillBase64, "utility_bills");
    const signatureUrl = await uploadToCloudinary(signatureBase64, "signatures");

    // Capture user IP for legal traceability
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "Unknown IP";

    // Update the record and lock it
    await prisma.guarantor.update({
      where: { id: guarantor.id },
      data: {
        firstName, lastName, // <-- Overwrite with guarantor's confirmed spelling
        email, altPhone, nin, address, residentialStatus,
        employmentStatus, employerName, officeAddress,
        passportUrl, utilityBillUrl, signatureUrl,
        ipAddress,
        signedAt: new Date(),
        status: "SUBMITTED"
      }
    });
    
    return NextResponse.json({ message: "Deed of Guarantee Executed Successfully" }, { status: 200 });

  } catch (error: any) {
    console.error("Guarantor Submission Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
