import { prisma } from "@/lib/prisma";
import RidersKycClient from "./RidersKycClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Riders KYC | Yusdaam Admin",
};

export default async function RidersKycPage() {
  // Fetch all riders and explicitly include their guarantors
  const riders = await prisma.user.findMany({
    where: { role: "RIDER" },
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
      driversLicenseNo: true,
      lasdriNo: true,
      driversLicenseUrl: true,
      drivingExperienceYears: true,
      rideHailingActive: true,
      previousHPExperience: true,
      preferredAssetClass: true,
      accountStatus: true,
      nokFirstName: true,
      nokLastName: true,
      nokRelationship: true,
      nokPhone: true,
      nokAddress: true,
      nokIdNumber: true,
      createdAt: true,
      updatedAt: true,
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
