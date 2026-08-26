import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "./Sidebar";

export const metadata = {
  title: "Admin Dashboard | Yusdaam",
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] flex text-crisp-white font-sans">
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 p-4 pt-20 sm:p-6 lg:p-8 lg:pt-8 min-h-screen overflow-y-auto overflow-x-hidden w-full max-w-full">
        <div className="max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
