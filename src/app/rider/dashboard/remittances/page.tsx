import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma"; // Adjust this import if your prisma instance is located elsewhere
import RemittancesClient from "./RemittancesClient";

export default async function RemittancesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "RIDER") {
    redirect("/login");
  }

  // 1. Fetch the rider and their active contract
  const rider = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      assignedTrip: {
        include: {
          contract: true
        }
      }
    }
  });

  const contract = rider?.assignedTrip?.contract || null;

  // 2. Fetch the weekly cycles (the payment schedule) for this contract
  let weeklyCycles: any[] = [];
  if (contract) {
    weeklyCycles = await prisma.weeklyCycle.findMany({
      where: { contractId: contract.id },
      orderBy: { weekNumber: "asc" }
    });
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white uppercase tracking-wider">My Remittances</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your weekly payments and track your schedule.</p>
      </div>

      {/* 3. Pass ONLY the props the new client component expects */}
      <RemittancesClient 
        contract={contract} 
        weeklyCycles={weeklyCycles} 
      />
    </div>
  );
}
