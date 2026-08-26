import { prisma } from "@/lib/prisma";
import UsersClient from "./UsersClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Global User Directory | Yusdaam Admin",
};

export default async function UsersDirectoryPage() {
  // Fetch ALL users and their relational data with lightweight projections (excluding heavy receipt base64 strings)
  const rawUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      // If they are a Rider, get their trip, contract, and what they've paid (excluding heavy base64 blobs)
      assignedTrip: {
        include: {
          contract: true,
          ledgers: { 
            where: { type: "PAYMENT_COLLECTED" },
            select: { amount: true, type: true, date: true }
          }
        }
      },
      // If they are an Owner, get their vehicles, contracts, and what they've been paid
      ownedVehicles: {
        include: {
          contract: true,
          ledgers: { 
            where: { type: "OWNER_REMITTANCE" },
            select: { amount: true, type: true, date: true }
          }
        }
      },
      // Include guarantors for riders
      guarantors: true
    }
  });

  // SECURITY: Strip out passwords before sending data to the client component
  const safeUsers = rawUsers.map((user) => {
    const { password, ...safeData } = user;
    return safeData;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-light">Global User Directory</h1>
        <p className="text-sm text-gray-400">Manage all accounts, view financial dossiers, and control platform access.</p>
      </div>

      <UsersClient users={safeUsers} />
    </div>
  );
}
