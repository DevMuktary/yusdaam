import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Check if plate number already exists
    const existing = await prisma.vehicle.findFirst({
      where: { registrationNumber: data.registrationNumber.toUpperCase() }
    });

    if (existing) {
      return NextResponse.json({ error: "A vehicle with this registration number already exists." }, { status: 400 });
    }

    const newVehicle = await prisma.vehicle.create({
      data: {
        type: data.type,
        makeModel: data.makeModel,
        year: data.year,
        registrationNumber: data.registrationNumber.toUpperCase(),
        chassisNumber: data.chassisNumber?.toUpperCase() || null,
        engineNumber: data.engineNumber?.toUpperCase() || null,
        status: "UNASSIGNED", // Default status as discussed
      }
    });

    return NextResponse.json({ success: true, vehicle: newVehicle });
  } catch (error) {
    console.error("Add Vehicle Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
