import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import OwnerLedgerClient from "./OwnerLedgerClient";

const prisma = new PrismaClient();

export default async function FinancialLedgerPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // 1. Fetch the user to get their designated bank details
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { bankName: true, accountNumber: true }
  });

  // 2. Fetch all remittance records (Receipts) for this owner
  const ledgers = await prisma.ledger.findMany({
    where: { ownerId: session.user.id, type: "OWNER_REMITTANCE" },
    orderBy: { date: 'desc' },
    include: {
      vehicle: true // Crucial for the Vehicle Filter dropdown
    }
  });

  // 3. NEW: Fetch all Payout Schedules (Weekly Cycles) for this owner
  const cycles = await prisma.weeklyCycle.findMany({
    where: { 
      contract: {
        ownerId: session.user.id
      }
    },
    orderBy: [
      { contractId: 'asc' },
      { weekNumber: 'desc' }
    ],
    include: {
      contract: {
        include: {
          vehicle: true // Crucial for the Vehicle Filter dropdown
        }
      }
    }
  });

  return <OwnerLedgerClient ledgers={ledgers} cycles={cycles} user={user} />;
}
