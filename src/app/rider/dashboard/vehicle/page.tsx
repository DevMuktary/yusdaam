import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import VehicleClient from "./VehicleClient";

const prisma = new PrismaClient();

export default async function RiderVehiclePage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "RIDER") {
    redirect("/rider/login");
  }

  // Fetch the rider and their assigned vehicle with the contract
  const rider = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    include: {
      assignedTrip: {
        include: {
          contract: true
        }
      }
    }
  });

  if (!rider) {
    redirect("/rider/login");
  }

  return (
    <VehicleClient 
      rider={rider} 
      vehicle={rider.assignedTrip} 
    />
  );
}
