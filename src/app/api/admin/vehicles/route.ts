import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Add Vehicle
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
        customType: data.type === "OTHERS" ? data.customType : null,
        makeModel: data.makeModel,
        year: data.year,
        registrationNumber: data.registrationNumber.toUpperCase(),
        chassisNumber: data.chassisNumber.toUpperCase(), // Now compulsory
        engineNumber: data.engineNumber.toUpperCase(),   // Now compulsory
        status: "UNASSIGNED", 
      }
    });

    return NextResponse.json({ success: true, vehicle: newVehicle });
  } catch (error) {
    console.error("Add Vehicle Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Update Status and Handle Unassignment
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vehicleId, action } = await req.json();

    if (!vehicleId || !action) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (action === "MAINTENANCE") {
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { status: "MAINTENANCE" }
      });
    } 
    else if (action === "ACTIVE") {
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { status: "ACTIVE" }
      });
    } 
    else if (action === "UNASSIGN") {
      // 1. Fetch the vehicle first to know who the rider is
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId },
        select: { riderId: true }
      });

      // 2. Perform a secure transaction to clean up everything
      await prisma.$transaction(async (tx) => {
        // A. Reset the Rider's account status so they go back to the "APPROVED" pool
        if (vehicle?.riderId) {
          await tx.user.update({
            where: { id: vehicle.riderId },
            data: { accountStatus: "APPROVED" }
          });
        }

        // B. Destroy the current contract attached to this vehicle to free it up
        await tx.contract.deleteMany({
          where: { vehicleId: vehicleId }
        });

        // C. Disconnect the Rider and set to UNASSIGNED (WE LEAVE THE OWNER ATTACHED)
        await tx.vehicle.update({
          where: { id: vehicleId },
          data: { 
            status: "UNASSIGNED",
            rider: { disconnect: true }
            // Notice: We intentionally do NOT disconnect the owner here!
          }
        });
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update Vehicle Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
