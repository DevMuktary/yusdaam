import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      firstName, lastName, email, password, phoneNumber, phoneCountryCode,
      nin, bvn, country, state, lga, streetAddress,
      driversLicenseNo, lasdriNo, preferredAssetClass, drivingExperienceYears, 
      rideHailingActive, previousHPExperience,
      g1FirstName, g1LastName, g1Phone, g1Relationship,
      g2FirstName, g2LastName, g2Phone, g2Relationship,
      // Base64 file data
      passportBase64, utilityBillBase64, driversLicenseBase64
    } = body;

    if (!email || !password || !nin || !bvn || !passportBase64) {
      return NextResponse.json({ error: "Missing required core fields or files." }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phoneNumber }, { nin }, { bvn }] }
    });

    if (existingUser) {
      return NextResponse.json({ error: "An account with this Email, Phone, NIN, or BVN already exists." }, { status: 409 });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Securely Upload Files to Cloudinary
    const uploadToCloudinary = async (base64Str: string, folder: string) => {
      try {
        const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${base64Str}`, {
          folder: `yusdaam_${folder}`,
          resource_type: "auto",
        });
        return result.secure_url;
      } catch (e) {
        console.error(`Failed to upload ${folder}`, e);
        throw new Error(`Failed to process ${folder} document`);
      }
    };

    const passportUrl = await uploadToCloudinary(passportBase64, "passports");
    const utilityBillUrl = await uploadToCloudinary(utilityBillBase64, "utility_bills");
    const driversLicenseUrl = await uploadToCloudinary(driversLicenseBase64, "licenses");

    // Generate Secure Tokens for Guarantors
    const g1Token = crypto.randomUUID();
    const g2Token = crypto.randomUUID();

    // Create the Rider and attach Guarantors in one transaction
    const newRider = await prisma.user.create({
      data: {
        role: "RIDER",
        accountStatus: "PENDING",
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        email,
        password: hashedPassword,
        phoneCountryCode,
        phoneNumber,
        nin,
        bvn,
        passportUrl,
        country,
        state,
        streetAddress: `${streetAddress}, ${lga}`, // Append LGA to street address
        utilityBillUrl,
        driversLicenseNo,
        lasdriNo,
        driversLicenseUrl,
        preferredAssetClass,
        drivingExperienceYears,
        rideHailingActive: rideHailingActive === "true",
        previousHPExperience: previousHPExperience === "true",
        
        guarantors: {
          create: [
            {
              firstName: g1FirstName,
              lastName: g1LastName,
              phone: g1Phone,
              relationship: g1Relationship,
              token: g1Token,
              status: "PENDING"
            },
            {
              firstName: g2FirstName,
              lastName: g2LastName,
              phone: g2Phone,
              relationship: g2Relationship,
              token: g2Token,
              status: "PENDING"
            }
          ]
        }
      }
    });

    // RETURN THE TOKENS TO THE FRONTEND FOR THE SUCCESS SCREEN
    return NextResponse.json({ 
      message: "Rider registered successfully",
      tokens: {
        g1Token,
        g2Token,
        g1Name: g1FirstName,
        g2Name: g2FirstName
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error("Rider Registration Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
