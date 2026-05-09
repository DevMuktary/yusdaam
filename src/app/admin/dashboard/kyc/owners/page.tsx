import { PrismaClient } from "@prisma/client";
import OwnersKycClient from "./OwnersKycClient";

const prisma = new PrismaClient();

export const metadata = {
  title: "Owners KYC | Yusdaam Admin",
};

export default async function OwnersKycPage() {
  // Fetch all Asset Owners from the database
  const owners = await prisma.user.findMany({
    where: { role: "ASSET_OWNER" },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-light">Asset Owners KYC Management</h1>
        <p className="text-sm text-gray-400">Review investor profiles, verify identity documents, and approve platform access.</p>
      </div>

      {/* Pass the data to the interactive client component */}
      <OwnersKycClient owners={owners} />
    </div>
  );
}
