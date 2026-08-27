import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import OwnerLedgerClient from "./OwnerLedgerClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FinancialLedgerPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/owner/login");
  }

  // 1. Fetch the owner's active contracts for fast indexed sub-lookups
  const contracts = await prisma.contract.findMany({
    where: { ownerId: session.user.id },
    select: {
      id: true,
      currentWeek: true,
      ownerWeeklyPayout: true,
      vehicle: {
        select: {
          id: true,
          registrationNumber: true,
          makeModel: true,
          type: true,
          customType: true
        }
      }
    }
  });

  const contractIds = contracts.map(c => c.id);

  // 2. Fetch User Bank Info, Remittance Ledgers, and Weekly Cycles in parallel
  const [user, ledgers, cycles] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { bankName: true, accountNumber: true }
    }),

    prisma.ledger.findMany({
      where: { ownerId: session.user.id, type: "OWNER_REMITTANCE" },
      orderBy: { date: 'desc' },
      select: {
        id: true,
        amount: true,
        date: true,
        description: true,
        receiptUrl: true,
        vehicleId: true,
        vehicle: {
          select: {
            id: true,
            registrationNumber: true,
            makeModel: true
          }
        }
      }
    }),

    contractIds.length > 0
      ? prisma.weeklyCycle.findMany({
          where: { contractId: { in: contractIds } },
          orderBy: [
            { contractId: 'asc' },
            { weekNumber: 'desc' }
          ],
          select: {
            id: true,
            weekNumber: true,
            dueDate: true,
            ownerExpectedAmount: true,
            ownerRemittedAmount: true,
            ownerStatus: true,
            contractId: true,
            contract: {
              select: {
                id: true,
                currentWeek: true,
                vehicleId: true,
                vehicle: {
                  select: {
                    id: true,
                    registrationNumber: true,
                    makeModel: true
                  }
                }
              }
            }
          }
        })
      : []
  ]);

  return <OwnerLedgerClient ledgers={ledgers} cycles={cycles} user={user} />;
}
