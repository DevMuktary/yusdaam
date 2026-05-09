import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ASSET_OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, makeModel, year, engineNumber, chassisNumber, registrationNumber } = body;

    if (!type || !makeModel || !registrationNumber) {
      return NextResponse.json({ error: "Type, Make/Model, and Registration Number are required." }, { status: 400 });
    }

    // Ensure the plate number isn't already registered
    const existing = await prisma.vehicle.findUnique({ where: { registrationNumber } });
    if (existing) {
      return NextResponse.json({ error: "A vehicle with this Plate Number already exists." }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        type,
        makeModel,
        year,
        engineNumber,
        chassisNumber,
        registrationNumber,
        ownerId: session.user.id,
        status: "UNASSIGNED", // Default status until Admin assigns a rider
      }
    });

    return NextResponse.json({ message: "Vehicle added successfully", vehicle }, { status: 201 });
  } catch (error: any) {
    console.error("Add Vehicle Error:", error);
    return NextResponse.json({ error: "Failed to add vehicle. Engine/Chassis number might already be registered." }, { status: 500 });
  }
}
