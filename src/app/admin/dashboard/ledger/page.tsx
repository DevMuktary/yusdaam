import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";
import AdminLedgerClient from "./AdminLedgerClient";

const prisma = new PrismaClient();

export default async function AdminLedgerPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  // Fetch Raw Transactions
  const ledgers = await prisma.ledger.findMany({
    orderBy: { date: 'desc' },
    include: {
      vehicle: { include: { rider: true } },
      owner: true,
    }
  });

  // Fetch Users for Dropdown Filters
  const users = await prisma.user.findMany({
    where: { role: { in: ["RIDER", "ASSET_OWNER"] } },
    select: { id: true, firstName: true, lastName: true, role: true, phoneNumber: true }
  });

  // NEW: Fetch all Weekly Billing Cycles to monitor Arrears
  const cycles = await prisma.weeklyCycle.findMany({
    orderBy: [{ contractId: 'asc' }, { weekNumber: 'desc' }],
    include: {
      contract: {
        include: {
          vehicle: { include: { rider: true } },
          owner: true
        }
      }
    }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 overflow-x-hidden">
      
      {/* Header */}
      <div className="border-b border-cobalt/20 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-wide mb-2 flex items-center gap-3">
            <BookOpen className="text-cobalt" /> Master Ledger
          </h1>
          <p className="text-slate-light">Track platform-wide financial movements, remittances, and historical arrears.</p>
        </div>
      </div>

      <AdminLedgerClient ledgers={ledgers} users={users} cycles={cycles} />
      
    </div>
  );
}
