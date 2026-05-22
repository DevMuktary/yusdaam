import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { MessageSquareText } from "lucide-react";
import MessagesClient from "./MessagesClient";

const prisma = new PrismaClient();

export default async function AdminMessagesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  // Fetch all riders (Active or Pending) to populate the dropdown
  const riders = await prisma.user.findMany({
    where: { role: "RIDER" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      accountStatus: true,
    },
    orderBy: { firstName: 'asc' }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 overflow-x-hidden">
      <div className="border-b border-cobalt/20 pb-6">
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-wide mb-2 flex items-center gap-3">
          <MessageSquareText className="text-cobalt" /> Dispatch Center
        </h1>
        <p className="text-slate-light">Send instant SMS notifications to fleet riders or custom numbers.</p>
      </div>

      <MessagesClient riders={riders} />
    </div>
  );
}
