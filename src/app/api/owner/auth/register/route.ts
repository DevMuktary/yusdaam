import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { sendSystemEmail } from "@/lib/email/sender";
import { getRegistrationReceivedEmail } from "@/lib/email/templates";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      firstName, lastName, middleName, email, password,
      country, state, streetAddress, phoneCountryCode, phoneNumber,
      nin, nokFirstName, nokLastName, nokRelationship, nokPhone,
      bankName, bankCode, accountNumber, preferredAssetClass, intendedVolume
    } = body;

    // 1. Check for existing user
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

    // 2. Paystack Bank Account Resolution
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

    // 3. Security: Hash Password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Save to Database
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
        nin,
        nokFirstName,
        nokLastName,
        nokRelationship,
        nokPhone,
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

    // 5. Generate and Send HTML Email via Library
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

    await sendSystemEmail({
      toEmail: email,
      toName: `${firstName} ${lastName}`,
      subject: "Registration Received: YUSDAAM Asset Administration Portal",
      htmlBody: emailHtml
    });

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
