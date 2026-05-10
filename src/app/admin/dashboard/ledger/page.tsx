import { PrismaClient } from "@prisma/client";
import AdminLedgerClient from "./AdminLedgerClient";

const prisma = new PrismaClient();

export const metadata = {
  title: "Master Financial Ledger | Yusdaam Admin",
};

export default async function AdminLedgerPage() {
  // 1. Fetch all ledgers with the nested user details
  const ledgers = await prisma.ledger.findMany({
    orderBy: { date: 'desc' },
    include: {
      owner: { select: { firstName: true, lastName: true } },
      vehicle: {
        include: {
          rider: { select: { id: true, firstName: true, lastName: true } }
        }
      }
    }
  });

  // 2. Fetch all active users to populate the dropdown filter
  const users = await prisma.user.findMany({
    where: {
      role: { in: ["RIDER", "ASSET_OWNER"] },
      accountStatus: { in: ["ACTIVE", "AWAITING_SIGNATURE", "APPROVED", "SUSPENDED"] }
    },
    select: { id: true, firstName: true, lastName: true, role: true, phoneNumber: true },
    orderBy: { firstName: 'asc' }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-light">Master Financial Ledger</h1>
        <p className="text-sm text-gray-400">View complete transaction histories, filter by user, and track weekly remittances.</p>
      </div>

      <AdminLedgerClient ledgers={ledgers} users={users} />
    </div>
  );
}
