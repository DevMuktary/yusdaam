import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { sendSystemEmail } from "@/lib/email/sender";
import { getRegistrationReceivedEmail } from "@/lib/email/templates";
import { v2 as cloudinary } from "cloudinary";

// 1. Configure Cloudinary for secure server-side uploads
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
      firstName, lastName, middleName, email, password,
      country, state, streetAddress, phoneCountryCode, phoneNumber,
      nin, bvn, 
      passportBase64, utilityBillBase64, // <-- We now receive the Base64 strings from the frontend
      nokFirstName, nokLastName, nokRelationship, nokPhone, nokAddress, nokIdNumber, 
      bankName, bankCode, accountNumber, preferredAssetClass, intendedVolume
    } = body;

    // 2. Check for existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phoneNumber }]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email or phone number already exists." },
        { status: 409 }
      );
    }

    // 3. Paystack Bank Account Resolution
    const paystackRes = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      return NextResponse.json(
        { error: "Could not verify bank account. Please check the account number and bank." },
        { status: 400 }
      );
    }

    const resolvedAccountName = paystackData.data.account_name;

    // 4. Securely Upload Documents to Cloudinary
    let uploadedPassportUrl = null;
    let uploadedUtilityUrl = null;

    try {
      if (passportBase64) {
        const passportUpload = await cloudinary.uploader.upload(`data:image/jpeg;base64,${passportBase64}`, {
          folder: "yusdaam_owners_kyc",
          resource_type: "auto"
        });
        uploadedPassportUrl = passportUpload.secure_url;
      }

      if (utilityBillBase64) {
        const utilityUpload = await cloudinary.uploader.upload(`data:image/jpeg;base64,${utilityBillBase64}`, {
          folder: "yusdaam_owners_kyc",
          resource_type: "auto"
        });
        uploadedUtilityUrl = utilityUpload.secure_url;
      }
    } catch (uploadError) {
      console.error("Cloudinary Upload Error:", uploadError);
      return NextResponse.json(
        { error: "Failed to process document uploads. Please try again." },
        { status: 500 }
      );
    }

    // 5. Security: Hash Password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 6. Save Everything to Database
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        middleName: middleName || null,
        name: `${firstName} ${lastName}`, 
        email,
        password: hashedPassword,
        country,
        state,
        streetAddress,
        phoneCountryCode,
        phoneNumber,
        
        // Identity & KYC (Using the newly uploaded secure URLs)
        nin,
        bvn,
        passportUrl: uploadedPassportUrl,
        utilityBillUrl: uploadedUtilityUrl,
        
        // Next of Kin
        nokFirstName,
        nokLastName,
        nokRelationship,
        nokPhone,
        nokAddress,
        nokIdNumber,
        
        // Financials & Intent
        bankName,
        bankCode,
        accountNumber,
        accountName: resolvedAccountName, 
        preferredAssetClass,
        intendedVolume,
        
        role: "ASSET_OWNER",        
        accountStatus: "PENDING",   
      },
    });

    // 7. Generate and Send HTML Email
    const emailHtml = getRegistrationReceivedEmail({
      firstName,
      lastName,
      email,
      phoneCountryCode,
      phoneNumber,
      preferredAssetClass,
      intendedVolume,
      bankName
    });

    // Fire off email without blocking the response
    sendSystemEmail({
      toEmail: email,
      toName: `${firstName} ${lastName}`,
      subject: "Welcome to YUSDAAM Autos - Registration Received",
      htmlBody: emailHtml
    }).catch(err => console.error("Email dispatch failed:", err));

    // Remove password from response
    const { password: _, ...safeOwnerData } = newUser;

    return NextResponse.json(
      { message: "Registration successful. Account pending admin verification.", data: safeOwnerData },
      { status: 201 }
    );

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration." },
      { status: 500 }
    );
  }
}
