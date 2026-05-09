import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth"; 
import RemittancesClient from "./RemittancesClient";

const prisma = new PrismaClient();

export default async function RiderRemittancesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "RIDER") {
    redirect("/rider/login");
  }

  // Fetch the rider, their virtual account details, and contract
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

  const contract = rider.assignedTrip?.contract || null;

  return (
    <RemittancesClient 
      rider={rider} 
      contract={contract} 
    />
  );
}
