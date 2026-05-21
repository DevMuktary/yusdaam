import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import OwnerLedgerClient from "./OwnerLedgerClient";

const prisma = new PrismaClient();

export default async function FinancialLedgerPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  // Fetch the user to get their designated bank details
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { bankName: true, accountNumber: true }
  });

  // Fetch all remittance records for this owner, INCLUDING the vehicle details
  const ledgers = await prisma.ledger.findMany({
    where: { ownerId: session.user.id, type: "OWNER_REMITTANCE" },
    orderBy: { date: 'desc' },
    include: {
      vehicle: true // This attaches the vehicle data (plate number, make) to each ledger row
    }
  });

  return <OwnerLedgerClient ledgers={ledgers} user={user} />;
}
