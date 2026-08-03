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

  // Fetch contracts where ANY of the 3 possible document fields exist and are not empty
  const contracts = await prisma.contract.findMany({
    where: {
      OR: [
        {
          AND: [
            { signedDocumentUrl: { not: null } },
            { signedDocumentUrl: { not: "" } }
          ]
        },
        {
          AND: [
            { vehicle: { rider: { hpaAgreementUrl: { not: null } } } },
            { vehicle: { rider: { hpaAgreementUrl: { not: "" } } } }
          ]
        },
        {
          AND: [
            { vehicle: { rider: { poaAgreementUrl: { not: null } } } },
            { vehicle: { rider: { poaAgreementUrl: { not: "" } } } }
          ]
        }
      ]
    },
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

  console.log(`[DOCUMENTS VAULT] Found ${contracts.length} active deployments with documents.`);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-black text-white uppercase tracking-wider">Signed Agreements Vault</h1>
        <p className="text-sm text-gray-400 mt-1">Access and strictly force-download digital contracts, HPAs, and POAs.</p>
      </div>

      <DocumentsClient contracts={contracts} />
    </div>
  );
}
