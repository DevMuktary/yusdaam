import { PrismaClient } from "@prisma/client";
import RidersKycClient from "./RidersKycClient";

const prisma = new PrismaClient();

export const metadata = {
  title: "Riders KYC | Yusdaam Admin",
};

export default async function RidersKycPage() {
  // Fetch all riders and explicitly include their guarantors
  const riders = await prisma.user.findMany({
    where: { role: "RIDER" },
    include: {
      guarantors: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-light">Riders KYC Management</h1>
        <p className="text-sm text-gray-400">Review rider documents, verify NINs, and inspect guarantor deeds.</p>
      </div>

      {/* Pass the data to the interactive client component */}
      <RidersKycClient riders={riders} />
    </div>
  );
}
