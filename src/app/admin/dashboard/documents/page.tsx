import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import DocumentsClient from "./DocumentsClient";

// 1. FORCE DYNAMIC: This tells Next.js NEVER to cache this page. 
// It will query the database fresh every single time you refresh the page.
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function AdminDocumentsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // 2. Fetch contracts where the URL is NOT null AND NOT an empty string
  const contracts = await prisma.contract.findMany({
    where: {
      AND: [
        { signedDocumentUrl: { not: null } },
        { signedDocumentUrl: { not: "" } }
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

  // 3. System Log so you can actually see what the DB is finding in your Railway logs!
  console.log(`[DOCUMENTS VAULT] Found ${contracts.length} signed contracts.`);

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
