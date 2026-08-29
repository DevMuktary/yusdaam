import { prisma } from "@/lib/prisma";
import OwnersKycClient from "./OwnersKycClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Owners KYC | Yusdaam Admin",
};

export default async function OwnersKycPage() {
  // Fetch all Asset Owners from the database
  const owners = await prisma.user.findMany({
    where: { role: "ASSET_OWNER" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      middleName: true,
      email: true,
      phoneNumber: true,
      country: true,
      state: true,
      streetAddress: true,
      nin: true,
      bvn: true,
      passportUrl: true,
      utilityBillUrl: true,
      signatureUrl: true,
      hpaAgreementUrl: true,
      poaAgreementUrl: true,
      bankName: true,
      accountNumber: true,
      accountName: true,
      preferredAssetClass: true,
      intendedVolume: true,
      accountStatus: true,
      nokFirstName: true,
      nokLastName: true,
      nokRelationship: true,
      nokPhone: true,
      nokAddress: true,
      nokIdNumber: true,
      createdAt: true,
      updatedAt: true,
    },
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
