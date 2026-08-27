import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import SupportClient from "./SupportClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RiderSupportPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "RIDER") {
    redirect("/rider/login");
  }

  const rider = await prisma.user.findUnique({
    where: { email: session.user.email as string },
  });

  if (!rider) {
    redirect("/rider/login");
  }

  return <SupportClient rider={rider} />;
}
