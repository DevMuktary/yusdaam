import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import DocumentsClient from "./DocumentsClient";

const prisma = new PrismaClient();

export default async function AdminDocumentsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch all contracts that have a signed document attached
  const contracts = await prisma.contract.findMany({
    where: {
      signedDocumentUrl: { not: null }
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-black text-white uppercase tracking-wider">Signed Agreements Vault</h1>
        <p className="text-sm text-gray-400 mt-1">Access and strictly force-download digital contracts for all active deployments.</p>
      </div>

      <DocumentsClient contracts={contracts} />
    </div>
  );
}
