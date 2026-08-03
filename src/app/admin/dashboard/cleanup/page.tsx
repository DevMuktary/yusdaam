import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import CleanupClient from "./CleanupClient";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function AdminCleanupPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-black text-white uppercase tracking-wider">System Wipe utility</h1>
        <p className="text-sm text-gray-400 mt-1">Review the lists below before executing the mass deletion.</p>
      </div>

      <CleanupClient users={users} />
    </div>
  );
}
