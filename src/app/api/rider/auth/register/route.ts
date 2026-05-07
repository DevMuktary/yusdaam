import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      firstName, lastName, email, password, phoneNumber, phoneCountryCode,
      nin, bvn, passportUrl, 
      country, state, streetAddress, utilityBillUrl, 
      driversLicenseNo, lasdriNo, driversLicenseUrl,
      preferredAssetClass, drivingExperienceYears, rideHailingActive, previousHPExperience,
      g1FirstName, g1LastName, g1Phone, g1Relationship,
      g2FirstName, g2LastName, g2Phone, g2Relationship
    } = body;

    // 1. Validation checks
    if (!email || !password || !nin || !bvn) {
      return NextResponse.json({ error: "Missing required core fields." }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phoneNumber }, { nin }, { bvn }]
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: "An account with this Email, Phone, NIN, or BVN already exists." }, { status: 409 });
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Generate Secure Tokens for Guarantors
    const g1Token = crypto.randomUUID();
    const g2Token = crypto.randomUUID();

    // 4. Create the Rider and attach Guarantors in one transaction
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
        streetAddress,
        utilityBillUrl,
        driversLicenseNo,
        lasdriNo,
        driversLicenseUrl,
        preferredAssetClass,
        drivingExperienceYears,
        rideHailingActive: rideHailingActive === "true" || rideHailingActive === true,
        previousHPExperience: previousHPExperience === "true" || previousHPExperience === true,
        
        // Nested write to create the guarantors instantly
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

    return NextResponse.json({ 
      message: "Rider registered successfully", 
      riderId: newRider.id 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Rider Registration Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
