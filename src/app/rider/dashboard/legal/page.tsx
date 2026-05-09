import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import LegalClient from "./LegalClient";

const prisma = new PrismaClient();

export default async function RiderLegalPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "RIDER") {
    redirect("/rider/login");
  }

  // Fetch the rider and their guarantors to show legal surety status
  const rider = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    include: { guarantors: true }
  });

  if (!rider) {
    redirect("/rider/login");
  }

  return <LegalClient rider={rider} guarantors={rider.guarantors} />;
}
