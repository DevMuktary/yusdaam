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
      {/* The global header has been removed so page-specific headers sit at the top */}
      <main className="flex-1 lg:ml-64 p-6 pt-24 lg:p-10 lg:pt-10 h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
