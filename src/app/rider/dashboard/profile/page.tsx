import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ProfileClient from "./ProfileClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RiderProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "RIDER") {
    redirect("/rider/login");
  }

  // Fetch the rider and their guarantors for the KYC profile
  const rider = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    include: { guarantors: true }
  });

  if (!rider) {
    redirect("/rider/login");
  }

  return <ProfileClient rider={rider} guarantors={rider.guarantors} />;
}
