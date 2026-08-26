import { prisma } from "@/lib/prisma";
import UsersClient from "./UsersClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Global User Directory | Yusdaam Admin",
};

export default async function UsersDirectoryPage() {
  // Fetch ALL users with strictly selective projections (excluding megabytes of base64 documents/photos)
  const safeUsers = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      role: true,
      accountStatus: true,
      createdAt: true,
      state: true,
      streetAddress: true,
      nin: true,
      bvn: true,
      bankName: true,
      accountNumber: true,
      accountName: true,
      preferredAssetClass: true,
      // If they are a Rider, get trip and lean contract financials
      assignedTrip: {
        select: {
          id: true,
          registrationNumber: true,
          makeModel: true,
          contract: {
            select: {
              id: true,
              totalHirePurchasePrice: true,
              downPayment: true,
              riderWeeklyRemittance: true,
              ownerWeeklyPayout: true,
            }
          },
          ledgers: {
            where: { type: "PAYMENT_COLLECTED" },
            select: { amount: true }
          }
        }
      },
      // If they are an Owner, get vehicles and lean contract financials
      ownedVehicles: {
        select: {
          id: true,
          registrationNumber: true,
          makeModel: true,
          contract: {
            select: {
              id: true,
              ownerWeeklyPayout: true,
              totalHirePurchasePrice: true,
            }
          },
          ledgers: {
            where: { type: "OWNER_REMITTANCE" },
            select: { amount: true }
          }
        }
      },
      // Include guarantors for riders
      guarantors: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          status: true,
          relationship: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
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
