import { PrismaClient } from "@prisma/client";
import UsersClient from "./UsersClient";

const prisma = new PrismaClient();

export const metadata = {
  title: "Global User Directory | Yusdaam Admin",
};

export default async function UsersDirectoryPage() {
  // Fetch ALL users and their deep relational data
  const rawUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      // If they are a Rider, get their trip, contract, and what they've paid
      assignedTrip: {
        include: {
          contract: true,
          ledgers: { where: { type: "PAYMENT_COLLECTED" } }
        }
      },
      // If they are an Owner, get their vehicles, contracts, and what they've been paid
      ownedVehicles: {
        include: {
          contract: true,
          ledgers: { where: { type: "OWNER_REMITTANCE" } }
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
