import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";
import AdminLedgerClient from "./AdminLedgerClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLedgerPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  // 1. First fetch active contract IDs for direct indexed lookup
  const activeContracts = await prisma.contract.findMany({
    where: {
      vehicle: { status: "ACTIVE" }
    },
    select: {
      id: true
    }
  });

  const activeContractIds = activeContracts.map(c => c.id);

  // 2. Fetch Raw Transactions, Dropdown Users, and Weekly Cycles in PARALLEL with lean selective projections
  const [ledgers, users, cycles] = await Promise.all([
    // 1. Fetch Raw Transactions (Lean Select + Indexed Order)
    prisma.ledger.findMany({
      orderBy: { date: 'desc' },
      take: 200, // Safety cap to avoid giant memory spikes
      select: {
        id: true,
        amount: true,
        type: true,
        reference: true,
        description: true,
        date: true,
        ownerId: true,
        vehicle: { 
          select: { 
            id: true,
            registrationNumber: true,
            rider: { select: { id: true, firstName: true, lastName: true } } 
          } 
        },
        owner: { select: { id: true, firstName: true, lastName: true } },
      }
    }),

    // 2. Fetch Users for Dropdown Filters
    prisma.user.findMany({
      where: { role: { in: ["RIDER", "ASSET_OWNER"] } },
      select: { id: true, firstName: true, lastName: true, role: true, phoneNumber: true },
      orderBy: { firstName: 'asc' }
    }),

    // 3. Fetch Weekly Billing Cycles directly by indexed contractId with lean selective projections
    activeContractIds.length > 0
      ? prisma.weeklyCycle.findMany({
          where: {
            contractId: { in: activeContractIds }
          },
          orderBy: [{ contractId: 'asc' }, { weekNumber: 'desc' }],
          take: 300,
          select: {
            id: true,
            contractId: true,
            weekNumber: true,
            startDate: true,
            endDate: true,
            expectedAmount: true,
            amountPaid: true,
            shortfallAmount: true,
            isSettled: true,
            contract: {
              select: {
                id: true,
                ownerId: true,
                vehicle: { 
                  select: { 
                    id: true,
                    registrationNumber: true,
                    riderId: true,
                    rider: { select: { id: true, firstName: true, lastName: true, phoneNumber: true } } 
                  } 
                },
                owner: { select: { id: true, firstName: true, lastName: true } }
              }
            }
          }
        })
      : []
  ]);

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
