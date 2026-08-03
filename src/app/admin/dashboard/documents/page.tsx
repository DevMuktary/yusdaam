import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import DocumentsClient from "./DocumentsClient";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function AdminDocumentsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch all contracts and their relations first
  const allContracts = await prisma.contract.findMany({
    include: {
      vehicle: {
        include: {
          rider: true,
          owner: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // Filter in memory to avoid Prisma's strict null/relation failures
  const contractsWithDocs = allContracts.filter((contract) => {
    const hasMaster = contract.signedDocumentUrl && contract.signedDocumentUrl.trim() !== "";
    
    // Check Rider Documents
    const rider = contract.vehicle?.rider;
    const hasRiderHpa = rider?.hpaAgreementUrl && rider.hpaAgreementUrl.trim() !== "";
    const hasRiderPoa = rider?.poaAgreementUrl && rider.poaAgreementUrl.trim() !== "";
    
    // Check Owner Documents
    const owner = contract.vehicle?.owner;
    const hasOwnerHpa = owner?.hpaAgreementUrl && owner.hpaAgreementUrl.trim() !== "";
    const hasOwnerPoa = owner?.poaAgreementUrl && owner.poaAgreementUrl.trim() !== "";

    return hasMaster || hasRiderHpa || hasRiderPoa || hasOwnerHpa || hasOwnerPoa;
  });

  console.log(`[DOCUMENTS VAULT] Total Contracts: ${allContracts.length} | With Docs: ${contractsWithDocs.length}`);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-black text-white uppercase tracking-wider">Signed Agreements Vault</h1>
        <p className="text-sm text-gray-400 mt-1">Access and strictly force-download digital contracts, HPAs, and POAs.</p>
      </div>

      <DocumentsClient contracts={contractsWithDocs} />
    </div>
  );
}
