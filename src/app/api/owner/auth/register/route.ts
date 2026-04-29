import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

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

    // 1. Check for existing user (Using prisma.user now)
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

    // 4. Save to Database (Status defaults to PENDING per Prisma schema)
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        middleName: middleName || null,
        name: `${firstName} ${lastName}`, // Combined for NextAuth compatibility
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
        accountName: resolvedAccountName, // Securely mapped from Paystack
        preferredAssetClass,
        intendedVolume,
        role: "ASSET_OWNER",        // Explicitly defining the role
        accountStatus: "PENDING",   // Explicitly locking the account for review
      },
    });

    // Remove password from response for security
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
