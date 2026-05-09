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

  // A secondary server-side check as a backup to the middleware
  if (!session || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] flex text-crisp-white font-sans">
      <Sidebar />
      
      {/* Main Content Area */}
      {/* Added pt-24 on mobile so the mobile top-nav doesn't hide the header */}
      <main className="flex-1 lg:ml-64 p-6 pt-24 lg:p-10 lg:pt-10 h-screen overflow-y-auto">
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
          <div>
            <h1 className="text-2xl font-bold text-slate-light">Command Center</h1>
            <p className="text-sm text-gray-400">Welcome back, Administrator.</p>
          </div>
          
          <div className="hidden lg:flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-cobalt/20 border border-cobalt/50 flex items-center justify-center font-bold text-cobalt">
              AD
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
