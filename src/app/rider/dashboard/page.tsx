import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth"; 
import ClientDashboard from "./ClientDashboard"; // Import the new client component

const prisma = new PrismaClient();

export default async function RiderDashboardOverview() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "RIDER") {
    redirect("/rider/login");
  }

  // Fetch the rider and their specific guarantors securely on the server
  const rider = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    include: { guarantors: { orderBy: { createdAt: 'asc' } } } // Ensure G1 and G2 stay in order
  });

  if (!rider) {
    redirect("/rider/login");
  }

  const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3000";
  };

  const baseUrl = getBaseUrl();

  return (
    <ClientDashboard 
      rider={rider} 
      guarantors={rider.guarantors} 
      baseUrl={baseUrl} 
    />
  );
}
